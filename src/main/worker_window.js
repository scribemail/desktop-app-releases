import { BrowserWindow }          from "electron";
import { enable as remoteEnable } from "@electron/remote/main";
import * as path                  from "path";
import { format as formatUrl }    from "url";
import isDev                      from "electron-is-dev";

export const createWorkerWindow = () => {
  const workerWindow = new BrowserWindow({
    show:           false,
    webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true }
  });

  remoteEnable(workerWindow.webContents);

  if (isDev) {
    workerWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/worker.html`);
  } else {
    workerWindow.loadURL(formatUrl({
      pathname: path.join(__dirname, "worker.html"),
      protocol: "file",
      slashes:  true
    }));
  }

  return workerWindow;
};
