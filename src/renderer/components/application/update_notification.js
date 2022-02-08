import React, { useEffect, useState } from "react";
import { Trans, t }                   from "@lingui/macro";
import store                          from "services/store";
import { ipcRenderer }                from "electron";

import "./update_notification.scss";

const ApplicationUpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(store.get("update_available"));
  const [downloadProgressPercentage, setDownloadProgressPercentage] = useState(0);

  const handleUpdateAvailable = () => {
    store.set("update_available", true);
    setUpdateAvailable(true);
  };

  const handleUpdateNotAvailable = () => {
    store.set("update_available", false);
    setUpdateAvailable(false);
  };

  const handleUpdateDownloadProgress = (event, args) => {
    setDownloadProgressPercentage(args.progressPercentage.toFixed());
  };

  const handleUpdateDownloaded = () => {
    new Notification(t`New Scribe update`, { body: t`A new Scribe update has been downloaded and will be automatically installed now` });
    store.set("update_available", false);
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

  if (!updateAvailable || downloadProgressPercentage === 0) {
    return null;
  }

  return (
    <div className="update-notification text-center">
      <Trans>A new version of Scribe is available</Trans><br />
      <Trans>Downloading { downloadProgressPercentage }%</Trans>
    </div>
  );
};

export default ApplicationUpdateNotification;
