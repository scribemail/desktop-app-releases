import { app, ipcMain, BrowserWindow, dialog }                    from "electron";
import { initialize as remoteInitialize, enable as remoteEnable } from "@electron/remote/main";
import store, { initRenderer, initialize as initializeStore }     from "services/store";
import applescript                                                from "applescript";
import isDev                                                      from "electron-is-dev";
import * as path                                                  from "path";
import unhandled                                                  from "electron-unhandled";
import { autoUpdater }                                            from "electron-updater";
import regedit                                                    from "services/regedit_main";
import debug                                                      from "electron-debug";
import log                                                        from "electron-log";
import { openSystemPreferences }                                  from "electron-util";
import Bugsnag                                                    from "@bugsnag/electron";
import { startBugsnag }                                           from "services/bugsnag";
import { format as formatUrl }                                    from "url";
import { createWorkerWindow }                                     from "./worker_window";
import { createMenuBar }                                          from "./menubar";
import AuthProvider                                               from "./microsoft_auth/AuthProvider";

if (process.env.ELECTRON_WEBPACK_APP_ENV !== "production") {
  app.commandLine.appendSwitch("ignore-certificate-errors");
  unhandled();
}

// debug({ isEnabled: process.env.ELECTRON_WEBPACK_APP_ENV !== "production" });
debug({ isEnabled: true });

remoteInitialize();

initRenderer();

startBugsnag(app, { process: { name: "main" } });

let mainWindow;
let workerWindow;
let menubar;
let localWindow;
let restartAppleMailDialogOpen = false;

const sendWindowMessage = (targetWindow, message, payload) => {
  if (!targetWindow) {
    return;
  }
  targetWindow.webContents.send(message, payload);
};

const updateMainWindow = () => {
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
};

const openMicrosoftLoginWindow = () => {
  const authWindow = new BrowserWindow({ width: 400, height: 600 });
  const authProvider = new AuthProvider();
  authProvider.login(authWindow).then((response) => {
    sendWindowMessage(mainWindow, "logged-in-with-microsoft", { idToken: response.idToken });
    menubar.showWindow();
    authWindow.close();
  });
};

const openMenuBarWindow = () => {
  menubar.showWindow();
};

const openWindow = (event, args) => {
  if (localWindow) {
    localWindow.loadURL(isDev ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/index.html#${args.path}` : formatUrl({ pathname: path.join(__dirname, "index.html"), hash: args.path, protocol: "file", slashes: true }));
    localWindow.show();
  } else {
    localWindow = new BrowserWindow({
      width:          args.width,
      height:         args.height,
      resizable:      args.resizable,
      webPreferences: {
        nodeIntegration:    true,
        contextIsolation:   false,
        enableRemoteModule: true
      }
    });
    remoteEnable(localWindow.webContents);
    localWindow.loadURL(isDev ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/index.html#${args.path}` : formatUrl({ pathname: path.join(__dirname, "index.html"), hash: args.path, protocol: "file", slashes: true }));
    localWindow.on("closed", () => {
      localWindow = null;
      openMenuBarWindow();
    });
  }
};

const openSsoLoginWindow = (event, args) => {
  const authWindow = new BrowserWindow({ width: 400, height: 600 });
  authWindow.loadURL(args.redirectUrl);
  authWindow.webContents.on("will-redirect", (redirectEvent, responseUrl) => {
    const parsedUrl = new URL(responseUrl);
    const code = parsedUrl.searchParams.get("code");
    sendWindowMessage(mainWindow, "logged-in-with-sso", { code });
    openMenuBarWindow();
    authWindow.close();
  });
};

const tryRestartAppleMail = () => {
  if (restartAppleMailDialogOpen) {
    return;
  }
  applescript.execFile(path.join(__static, "apple_mail_is_started.applescript"), (error, response) => {
    if (!error && response === "true") {
      mainWindow.show();
      restartAppleMailDialogOpen = true;
      dialog.showMessageBox(mainWindow, {
        type:      "info",
        buttons:   ["Later", "Restart"],
        defaultId: 1,
        message:   "You signatures have been updated, we need to restart Apple Mail"
      }).then((dialogResponse) => {
        restartAppleMailDialogOpen = false;
        if (dialogResponse.response === 1) {
          applescript.execFile(path.join(__static, "restart_apple_mail.applescript"));
        }
      });
    }
  });
};

app.on("ready", () => {
  ///
  // Auto update configuration
  ///
  if (!isDev) {
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = "info";

    autoUpdater.on("update-available", () => {
      sendWindowMessage(mainWindow, "update-available");
    });

    autoUpdater.on("update-not-available", () => {
      sendWindowMessage(mainWindow, "update-not-available");
    });

    autoUpdater.on("download-progress", (progressObj) => {
      sendWindowMessage(mainWindow, "update-download-progress", { progressPercentage: progressObj.percent });
    });

    autoUpdater.on("update-downloaded", () => {
      sendWindowMessage(mainWindow, "update-downloaded");
      setTimeout(() => {
        autoUpdater.quitAndInstall(true, true);
      }, 1500);
    });

    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        log.error(`[initApp.checkForUpdates] Update failed: ${err}`);
      });
    }, 30000);

    setInterval(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        log.error(`[initApp.checkForUpdates] Update failed: ${err}`);
      });
    }, 1000 * 60 * 60 * 24); // Check every 24 hours
  }

  ///
  // Menu bar configuration
  ///
  menubar = createMenuBar();

  menubar.on("after-create-window", () => {
    mainWindow = menubar.window;
    updateMainWindow();
    mainWindow.loadURL(isDev ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/index.html` : formatUrl({ pathname: path.join(__dirname, "index.html"), protocol: "file", slashes: true }));
    ipcMain.on("message-from-worker", (event, arg) => {
      sendWindowMessage(menubar.window, arg.command, arg.payload);
    });
    ipcMain.on("open-microsoft-login", openMicrosoftLoginWindow);
    ipcMain.on("open-preferences", openSystemPreferences);
    ipcMain.on("open-window", openWindow);
    ipcMain.on("open-sso-login", openSsoLoginWindow);
    ipcMain.on("open-menu-bar-window", openMenuBarWindow);
    ipcMain.on("try-restart-apple-mail", tryRestartAppleMail);
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

  initializeStore(app);

  if (process.platform === "win32") {
    const keyPath = "HKCU\\Software\\Microsoft\\Office\\16.0\\Outlook\\Setup";
    const keyName = "DisableRoamingSignaturesTemporaryToggle";

    regedit.putValue({ [keyPath]: { [keyName]: { value: 1, type: "REG_DWORD" } } }, (err) => {
      if (err) {
        Bugsnag.notify(err);
      }
    });
  }
});
