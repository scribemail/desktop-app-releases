import { Tray, Menu, app }     from "electron";
import { menubar }             from "menubar";
import isDev                   from "electron-is-dev";
import { format as formatUrl } from "url";
import * as path               from "path";

let tray;

const contextMenu = Menu.buildFromTemplate([
  { enabled: false, label: `Scribe v${app.getVersion()}` },
  { type: "separator" },
  { role: "quit", label: "Quit Scribe" }
]);

const createTray = () => {
  tray = new Tray(path.join(__static, "tray-icon.png"));
  tray.setToolTip("Scribe");

  return tray;
};

export const createMenuBar = () => {
  const mb = menubar({
    index:         isDev ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/index.html` : formatUrl({ pathname: path.join(__dirname, "index.html"), protocol: "file", slashes: true }),
    preloadWindow: true,
    tray:          createTray(),
    browserWindow: {
      width:          380,
      height:         620,
      resizable:      false,
      webPreferences: {
        nodeIntegration:    true,
        contextIsolation:   false,
        enableRemoteModule: true
      }
    }
  });

  mb.on("ready", () => {
    tray.on("right-click", () => {
      mb.tray.popUpContextMenu(contextMenu);
    });
  });

  return mb;
};
