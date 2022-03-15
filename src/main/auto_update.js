import { autoUpdater } from "electron-updater";
import isDev           from "electron-is-dev";
import log             from "electron-log";
import regedit         from "services/regedit_main";
import store           from "services/store";

const checkAutoUpdateConfig = (updateTimeout = null, updateInterval = null) => {
  const keyPath = "HKLM\\Software\\Policies\\Scribe\\Config";
  const keyName = "DisableAutoUpdate";
  regedit.list(keyPath, (err, result) => {
    if (!err && result[keyPath].exists && result[keyPath].values[keyName] && result[keyPath].values[keyName].value) {
      store.set("auto_update_active", false);
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    } else {
      store.set("auto_update_active", true);
    }
  });
};

export const enableIfNeeded = (mainWindow, sendWindowMessage) => {
  if (isDev) {
    return;
  }

  let updateInterval;
  let updateTimeout;

  if (process.platform === "win32") {
    checkAutoUpdateConfig();
  } else {
    store.set("auto_update_active", true);
  }

  if (store.get("auto_update_active")) {
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

    updateTimeout = setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        log.error(`[initApp.checkForUpdates] Update failed: ${err}`);
      });
    }, 30000);

    updateInterval = setInterval(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        log.error(`[initApp.checkForUpdates] Update failed: ${err}`);
      });
    }, 1000 * 60 * 60 * 24); // Check every 24 hours
  }

  if (process.platform === "win32") {
    setInterval(() => {
      checkAutoUpdateConfig(updateTimeout, updateInterval);
    }, 1000 * 60 * 60 * 12); // Check every 12 hours
  }
};
