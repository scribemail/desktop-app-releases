import React                   from "react";
import PropTypes               from "prop-types";
import { ipcRenderer }         from "electron";
import { t }                   from "@lingui/macro";
import ElectronGoogleOAuth2    from "@getstation/electron-google-oauth2";
import { createGoogleSession } from "requests/session";
import { GoogleButton }        from "renderer/components/ui";

const SessionGoogleLoginButton = ({ children, block, onError, onLoginSuccess }) => {
  const logInUser = (accessToken) => {
    createGoogleSession(accessToken).then((response) => {
      if (response.data.method === "sso") {
        onError(t`Please login with your email`);
      } else {
        onLoginSuccess(response);
      }
      ipcRenderer.send("open-menu-bar-window");
    }).catch(() => {
      onError(t`Error while login with Google`);
    });
  };

  const myApiOauth = new ElectronGoogleOAuth2(
    process.env.ELECTRON_WEBPACK_APP_GOOGLE_CLIENT_ID,
    process.env.ELECTRON_WEBPACK_APP_GOOGLE_CLIENT_SECRET,
    ["https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"],
    { successRedirectURL: `${process.env.ELECTRON_WEBPACK_APP_WEBSITE_BASE_URL}/desktop-app-google-login-success` }
  );

  const handleClick = () => {
    myApiOauth.openAuthWindowAndGetTokens().then((token) => {
      logInUser(token.access_token);
    });
  };

  return (
    <GoogleButton onClick={ handleClick } block={ block }>
      { children }
    </GoogleButton>
  );
};

SessionGoogleLoginButton.defaultProps = {
  children:  null,
  block:     false
};

SessionGoogleLoginButton.propTypes = {
  children:       PropTypes.any,
  block:          PropTypes.bool,
  onError:        PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired
};

export default SessionGoogleLoginButton;
