import { app, ipcMain, BrowserWindow }                            from "electron";
import { initialize as remoteInitialize, enable as remoteEnable } from "@electron/remote/main";
import Store                                                      from "electron-store";
import isDev                                                      from "electron-is-dev";
import * as path                                                  from "path";
import unhandled                                                  from "electron-unhandled";
import { autoUpdater }                                            from "electron-updater";
import Registry                                                   from "rage-edit";
import debug                                                      from "electron-debug";
import log                                                        from "electron-log";
import { startBugsnag }                                           from "services/bugsnag";
import { format as formatUrl }                                    from "url";
import { createWorkerWindow }                                     from "./worker_window";
import { createMenuBar }                                          from "./menubar";
import AuthProvider                                               from "./microsoft_auth/AuthProvider";

if (process.env.ELECTRON_WEBPACK_APP_ENV !== "production") {
  app.commandLine.appendSwitch("ignore-certificate-errors");
  unhandled();
}

debug({ isEnabled: process.env.ELECTRON_WEBPACK_APP_ENV !== "production" });

remoteInitialize();

Store.initRenderer();

const store = new Store();

startBugsnag(app, { process: { name: "main" } });

let mainWindow;
let workerWindow;
let menubar;

function sendWindowMessage(targetWindow, message, payload) {
  if (!targetWindow) {
    return;
  }
  targetWindow.webContents.send(message, payload);
}

function updateMainWindow() {
  remoteEnable(mainWindow.webContents);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("devtools-opened", () => {
    mainWindow.focus();
    setImmediate(() => {
      mainWindow.focus();
    });
  });
}

const openMicrosoftLoginWindow = () => {
  const authWindow = new BrowserWindow({ width: 400, height: 600 });
  const authProvider = new AuthProvider();
  authProvider.login(authWindow).then((response) => {
    sendWindowMessage(mainWindow, "logged-in-with-microsoft", { idToken: response.idToken });
    menubar.showWindow();
    authWindow.close();
  });
};

const openSsoLoginWindow = (eventj, args) => {
  const authWindow = new BrowserWindow({ width: 400, height: 600 });
  authWindow.loadURL(args.redirectUrl);
  authWindow.webContents.on("will-redirect", (event, responseUrl) => {
    const parsedUrl = new URL(responseUrl);
    const code = parsedUrl.searchParams.get("code");
    sendWindowMessage(mainWindow, "logged-in-with-sso", { code });
    menubar.showWindow();
    authWindow.close();
  });
};

const openMenuBarWindow = () => {
  menubar.showWindow();
};

app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    log.error(`[initApp.checkForUpdates] Update failed: ${err}`);
  });

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      log.error(`[initApp.checkForUpdates] Update failed: ${err}`);
    });
  }, 1000 * 60 * 60 * 4);

  menubar = createMenuBar();

  menubar.on("after-create-window", () => {
    mainWindow = menubar.window;
    updateMainWindow();
    mainWindow.loadURL(isDev ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/index.html` : formatUrl({ pathname: path.join(__dirname, "index.html"), protocol: "file", slashes: true }),);
    ipcMain.on("message-from-worker", (event, arg) => {
      sendWindowMessage(menubar.window, "message-from-worker", arg);
    });
    ipcMain.on("open-microsoft-login", openMicrosoftLoginWindow);
    ipcMain.on("open-sso-login", openSsoLoginWindow);
    ipcMain.on("open-menu-bar-window", openMenuBarWindow);
    menubar.app.commandLine.appendSwitch("disable-backgrounding-occluded-windows", "true");
    if (process.platform === "darwin") {
      app.dock.hide();
    }
  });

  workerWindow = createWorkerWindow();

  if (store.get("launch_at_startup") === undefined) {
    app.setLoginItemSettings({
      openAtLogin:  true,
      openAsHidden: true,
      name:         "Scribe"
    });
  }

  if (store.get("update_outlook") === undefined) {
    store.set("update_outlook", true);
  }

  if (store.get("update_apple_mail") === undefined) {
    store.set("update_apple_mail", false);
  }

  if (process.platform === "win32") {
    const keyPath = "HKCU\\Software\\Microsoft\\Office\\16.0\\Outlook\\Setup";
    const keyName = "DisableRoamingSignaturesTemporaryToggle";

    Registry.set(keyPath, keyName, 1).then((response) => {
      log.error(`Registry.set ${response}`);
    });
  }
});
