import { Tray, Menu, app, nativeTheme } from "electron";
import { menubar }                      from "menubar";
import * as path                        from "path";

let tray;

const contextMenu = Menu.buildFromTemplate([
  { enabled: false, label: `Scribe v${app.getVersion()}` },
  { type: "separator" },
  { role: "quit", label: "Quit Scribe" }
]);

const createTray = () => {
  tray = new Tray(path.join(__static, nativeTheme.shouldUseDarkColors || process.platform !== "darwin" ? "tray-icon.png" : "tray-icon-dark.png"));
  tray.setToolTip("Scribe");

  return tray;
};

export const createMenuBar = () => {
  const mb = menubar({
    index:         false,
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
    if (process.platform === "darwin") {
      mb.showWindow();
    } else {
      setTimeout(() => { mb.showWindow(); }, 500);
    }
  });

  return mb;
};
