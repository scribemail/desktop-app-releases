import React, { useEffect, useState } from "react";
import { app }                        from "@electron/remote";
import { Trans, t }                   from "@lingui/macro";
import store                          from "services/store";
import { ipcRenderer }                from "electron";

import "./update_notification.scss";

const ApplicationUpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(store.get("update_available"));
  const [updateDownloaded, setUpdateDownloaded] = useState(store.get("update_downloaded"));
  const [downloadProgressPercentage, setDownloadProgressPercentage] = useState(0);

  const handleUpdateAvailable = () => {
    store.set("update_available", true);
    setUpdateAvailable(true);
  };

  const handleUpdateNotAvailable = () => {
    store.set("update_available", false);
    store.set("update_downloaded", false);
    setUpdateAvailable(false);
    setUpdateDownloaded(false);
  };

  const handleUpdateDownloadProgress = (event, args) => {
    setDownloadProgressPercentage(args.progressPercentage);
  };

  const handleUpdateDownloaded = () => {
    store.set("update_downloaded", true);
    setUpdateDownloaded(true);
    new Notification(t`New Scribe update`, { body: t`A new Scribe update has been downloaded and will be automatically installed on exit` }).show();
  };

  const handleInstallAndRestartClick = () => {
    store.set("update_available", false);
    store.set("update_downloaded", false);
    app.relaunch();
    app.quit();
  };

  useEffect(() => {
    if (ipcRenderer.rawListeners("update-available").length === 0) {
      ipcRenderer.on("update-available", handleUpdateAvailable);
    }
    if (ipcRenderer.rawListeners("update-not-available").length === 0) {
      ipcRenderer.on("update-not-available", handleUpdateNotAvailable);
    }
    if (ipcRenderer.rawListeners("update-download-progress").length === 0) {
      ipcRenderer.on("update-download-progress", handleUpdateDownloadProgress);
    }
    if (ipcRenderer.rawListeners("update-downloaded").length === 0) {
      ipcRenderer.on("update-downloaded", handleUpdateDownloaded);
    }
  }, []);

  console.log(updateAvailable, updateDownloaded, downloadProgressPercentage);

  if (!updateAvailable) {
    return null;
  }

  if (!updateDownloaded && downloadProgressPercentage === 0) {
    return null;
  }

  return (
    <div className="update-notification text-center">
      <Trans>A new version of Scribe is available</Trans><br />
      { !updateDownloaded && <Trans>Downloading { downloadProgressPercentage }%</Trans> }
      { updateDownloaded && <a href="#" onClick={ handleInstallAndRestartClick }><Trans>Install and restart now</Trans></a> }
    </div>
  );
};

export default ApplicationUpdateNotification;
