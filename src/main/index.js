import { app, ipcMain, BrowserWindow } from "electron";
import Store                           from "electron-store";
import isDev                           from "electron-is-dev";
import unhandled                       from "electron-unhandled";
import { autoUpdater }                 from "electron-updater";
import { createWorkerWindow }          from "./worker_window";
import { createMenuBar }               from "./menubar";
import AuthProvider                    from "./microsoft_auth/AuthProvider";

Store.initRenderer();

const store = new Store();

unhandled();

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
  if (isDev) {
    mainWindow.webContents.openDevTools({ detach: true });
  }

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

app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify();

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 1 * 24 * 60 * 60);

  menubar = createMenuBar();

  menubar.on("after-create-window", () => {
    mainWindow = menubar.window;
    updateMainWindow();
    ipcMain.on("message-from-worker", (event, arg) => {
      sendWindowMessage(menubar.window, "message-from-worker", arg);
    });
    ipcMain.on("open-microsoft-login", openMicrosoftLoginWindow);
    menubar.app.commandLine.appendSwitch("disable-backgrounding-occluded-windows", "true");
    app.dock.hide();
  });

  workerWindow = createWorkerWindow();

  if (store.get("launch_at_startup") === undefined) {
    app.setLoginItemSettings({
      openAtLogin:  true,
      openAsHidden: true,
      name:         "Scribe"
    });
  }
});
