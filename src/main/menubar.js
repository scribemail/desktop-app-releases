import { Tray, Menu, app, nativeTheme } from "electron";
import { menubar }                      from "menubar";
import * as path                        from "path";
import is                               from "electron-is";

let tray;

const contextMenu = Menu.buildFromTemplate([
  { enabled: false, label: `Scribe v${app.getVersion()}` },
  { type: "separator" },
  { role: "quit", label: "Quit Scribe" }
]);

const iconPath = () => {
  let icon = "white";
  if (process.platform === "darwin" && !nativeTheme.shouldUseDarkColors && is.ltRelease("12.0.0")) {
    icon = "dark";
  }
  return path.join(__static, `tray-icon-${icon}.png`);
};

const createTray = () => {
  tray = new Tray(iconPath());
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

  nativeTheme.on("updated", () => {
    tray.setImage(iconPath());
  });

  return mb;
};
