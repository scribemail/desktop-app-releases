/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PublicClientApplication, LogLevel, CryptoProvider } from "@azure/msal-node";
import { CustomFileProtocolListener }                        from "./CustomFileProtocol";

import * as APP_CONFIG from "./config/customConfig.json";

const CUSTOM_FILE_PROTOCOL_NAME = APP_CONFIG.fileProtocol.name;

APP_CONFIG.authOptions.clientId = process.env.ELECTRON_WEBPACK_APP_MICROSOFT_CLIENT_ID;

const MSAL_CONFIG = {
    auth:   APP_CONFIG.authOptions,
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel:          LogLevel.Info,
        }
    }
};
export default class AuthProvider {
    constructor() {
        this.clientApplication = new PublicClientApplication(MSAL_CONFIG);
        this.account = null;
        this.setRequestObjects();
    }

    get currentAccount() {
        return this.account;
    }

    /**
     * Initialize request objects used by this AuthModule.
     */
    setRequestObjects() {
        const baseSilentRequest = {
            account:      null,
            forceRefresh: false
        };
        this.authCodeUrlParams = APP_CONFIG.request.authCodeUrlParameters;
        this.authCodeRequest = { ...APP_CONFIG.request.authCodeRequest, code: null };
        this.silentProfileRequest = { ...baseSilentRequest, scopes: ["User.Read"] };
        this.silentMailRequest = { ...baseSilentRequest, scopes: ["Mail.Read"] };
    }

    async getProfileToken(authWindow) {
        return await this.getToken(authWindow, this.silentProfileRequest);
    }

    async getMailToken(authWindow) {
        return await this.getToken(authWindow, this.silentMailRequest);
    }

    async getToken(authWindow, request) {
        let authResponse;
        const account = this.account || await this.getAccount();
        if (account) {
            request.account = account;
            authResponse = await this.getTokenSilent(authWindow, request);
        } else {
            const authCodeRequest = { ...this.authCodeUrlParams, ...request };
            authResponse = await this.getTokenInteractive(authWindow, authCodeRequest);
        }
        return authResponse.accessToken || null;
    }

    async getTokenSilent(authWindow, tokenRequest) {
        try {
            return await this.clientApplication.acquireTokenSilent(tokenRequest);
        } catch (error) {
            console.log("Silent token acquisition failed, acquiring token using pop up");
            const authCodeRequest = { ...this.authCodeUrlParams, ...tokenRequest };
            return await this.getTokenInteractive(authWindow, authCodeRequest);
        }
    }

    async getTokenInteractive(authWindow, tokenRequest) {
        // Generate PKCE Challenge and Verifier before request
        const cryptoProvider = new CryptoProvider();
        const { challenge, verifier } = await cryptoProvider.generatePkceCodes();
        // Add PKCE params to Auth Code URL request
        const authCodeUrlParams = { ...this.authCodeUrlParams, scopes: tokenRequest.scopes, codeChallenge: challenge, codeChallengeMethod: "S256" };
        // Get Auth Code URL
        const authCodeUrl = await this.clientApplication.getAuthCodeUrl(authCodeUrlParams);
        // Set up custom file protocol to listen for redirect response
        this.authCodeListener = new CustomFileProtocolListener(CUSTOM_FILE_PROTOCOL_NAME);
        this.authCodeListener.start();
        const authCode = await this.listenForAuthCode(authCodeUrl, authWindow);
        // Use Authorization Code and PKCE Code verifier to make token request
        return await this.clientApplication.acquireTokenByCode({ ...this.authCodeRequest, code: authCode, codeVerifier: verifier });
    }

    async login(authWindow) {
        const authResult = await this.getTokenInteractive(authWindow, this.authCodeUrlParams);
        return { response: this.handleResponse(authResult), idToken: authResult.idToken };
    }

    async loginSilent() {
        if (!this.account) {
            this.account = await this.getAccount();
        }
        return this.account;
    }

    async logout() {
        if (this.account) {
            await this.clientApplication.getTokenCache().removeAccount(this.account);
            this.account = null;
        }
    }

    async listenForAuthCode(navigateUrl, authWindow) {
        authWindow.loadURL(navigateUrl);
        return new Promise((resolve, reject) => {
            authWindow.webContents.on("will-redirect", (event, responseUrl) => {
                const parsedUrl = new URL(responseUrl);
                const authCode = parsedUrl.searchParams.get("code");
                if (authCode) {
                    resolve(authCode);
                }
            });
        });
    }

    /**
 * Handles the response from a popup or redirect. If response is null, will check if we have any accounts and attempt to sign in.
 * @param response
 */
    async handleResponse(response) {
        if (response !== null) {
            this.account = response.account;
        } else {
            this.account = await this.getAccount();
        }
        return this.account;
    }

    /**
     * Calls getAllAccounts and determines the correct account to sign into, currently defaults to first account found in cache.
     * TODO: Add account chooser code
     *
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    async getAccount() {
        // need to call getAccount here?
        const cache = this.clientApplication.getTokenCache();
        const currentAccounts = await cache.getAllAccounts();
        if (currentAccounts === null) {
            console.log("No accounts detected");
            return null;
        }
        if (currentAccounts.length > 1) {
            // Add choose account code here
            console.log("Multiple accounts detected, need to add choose account code.");
            return currentAccounts[0];
        }
        if (currentAccounts.length === 1) {
            return currentAccounts[0];
        }

            return null;
    }
}
