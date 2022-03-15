import React, { useState, useEffect } from "react";
import { shell, ipcRenderer }         from "electron";
import { app }                        from "@electron/remote";
import PropTypes                      from "prop-types";
import { Trans, t }                   from "@lingui/macro";
import { getAuthStatus }              from "node-mac-permissions";
import { isOutlookInstalled }         from "services/signature_installation/outlook_mac";
import { deleteAuthorizationToken }   from "services/authorization_token";
import { useSession }                 from "renderer/contexts/session/hooks";
import store                          from "services/store";
import { Icon, Checkbox }             from "renderer/components/ui";

import "./container.scss";

const ConfigurationContainer = () => {
  const [launchAtStartup, setLaunchAtStartup] = useState(store.get("launch_at_startup"));
  const [updateOutlook, setUpdateOutlook] = useState(store.get("update_outlook"));
  const [updateAppleMail, setUpdateAppleMail] = useState(store.get("update_apple_mail"));
  const [usingiCloudDrive, setUsingiCloudDrive] = useState(store.get("using_icloud_drive"));
  const [haveFullDiskAccess, setHaveFullDiskAccess] = useState(getAuthStatus("full-disk-access"));
  const [outlookSignaturesFolder, setOutlookSignaturesFolder] = useState(store.get("outlook_signatures_folder") !== undefined ? store.get("outlook_signatures_folder") : null);
  const [outlookSignaturesFolderPersonalized, setOutlookSignaturesFolderPersonalized] = useState(store.get("outlook_signatures_folder") !== undefined);

  const { currentUser, deleteCurrentWorkspaces, deleteCurrentUser } = useSession();

  const handleFolderSelected = (event, args) => {
    if (args.folderPath !== undefined) {
      setOutlookSignaturesFolderPersonalized(true);
      setOutlookSignaturesFolder(args.folderPath);
      store.set("outlook_signatures_folder", args.folderPath);
    }
  };

  useEffect(() => {
    let interval = null;
    if (!usingiCloudDrive) {
      interval = setInterval(() => {
        setHaveFullDiskAccess(getAuthStatus("full-disk-access"));
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [usingiCloudDrive]);

  useEffect(() => {
    ipcRenderer.on("folder-selected", handleFolderSelected);
    return () => {
      ipcRenderer.removeListener("folder-selected", handleFolderSelected);
    };
  }, []);

  const handleLogout = (event) => {
    event.preventDefault();
    deleteAuthorizationToken();
    deleteCurrentWorkspaces();
    deleteCurrentUser();
  };

  const openScribeWebsite = (event) => {
    event.preventDefault();
    shell.openExternal(`${process.env.ELECTRON_WEBPACK_APP_WEBSITE_BASE_URL}?utm_source=Scribe+app&utm_medium=scribe+assets&utm_campaign=Scribe+app`);
  };

  const handleQuit = (event) => {
    event.preventDefault();
    app.quit();
  };

  const updateLoginItem = (value) => {
    store.set("launch_at_startup", value);
    app.setLoginItemSettings({
      openAtLogin:  value,
      openAsHidden: true,
      name:         "Scribe"
    });
  };

  const handleLaunchAtStartupChange = (event) => {
    setLaunchAtStartup(event.target.checked);
    updateLoginItem(event.target.checked);
  };

  const handleUpdateOutlookChange = (event) => {
    setUpdateOutlook(event.target.checked);
    if (event.target.checked) {
      isOutlookInstalled().then((exists) => {
        if (exists) {
          store.set("update_outlook", true);
        } else {
          setUpdateOutlook(false);
          store.set("update_outlook", false);
          alert(t`It seems that Outlook is not installed on this computer`);
        }
      }).catch(() => {
        alert(t`Error while activating Outlook installation`);
      });
    } else {
      store.set("update_outlook", false);
    }
  };

  const handleUpdateAppleMailChange = (event) => {
    setUpdateAppleMail(event.target.checked);
    store.set("update_apple_mail", event.target.checked);
    store.set("using_icloud_drive", event.target.checked);
  };

  const handleUsingiCloudDriveChange = (event) => {
    setUsingiCloudDrive(event.target.checked);
    store.set("using_icloud_drive", event.target.checked);
  };

  const openUsingiCloudExplanation = (event) => {
    event.preventDefault();
    ipcRenderer.send("open-window", {
      path:      "/help/using-icloud",
      width:     720,
      height:    750,
      resizable: false
    });
  };

  const openFullDiskAccessExplanation = (event) => {
    event.preventDefault();
    ipcRenderer.send("open-window", {
      path:      "/help/full-disk-access",
      width:     720,
      height:    750,
      resizable: false
    });
  };

  const handleOutlookFolderChange = (event) => {
    if (event.target.checked) {
      ipcRenderer.send("open-select-folder-window");
    } else {
      setOutlookSignaturesFolderPersonalized(false);
      setOutlookSignaturesFolder(null);
      store.delete("outlook_signatures_folder");
    }
  };

  return (
    <div className="config-container">
      <div className="mt-3">
        { process.platform === "darwin" && (
          <div className="mb-3">
            <h3><Trans>Update signatures for</Trans></h3>
            <Checkbox label={ t`Microsoft outlook` } className="mb-1" onChange={ handleUpdateOutlookChange } checked={ updateOutlook } />
            <Checkbox label={ t`Apple Mail` } onChange={ handleUpdateAppleMailChange } checked={ updateAppleMail } />
            { updateAppleMail && (
              <>
                <div className="ml-4 mt-1 d-flex">
                  <Checkbox label={ t`I am using iCloud Drive for Mail` } onChange={ handleUsingiCloudDriveChange } checked={ usingiCloudDrive } />
                  <a href="#" onClick={ openUsingiCloudExplanation }>
                    <Icon className="ml-1" icon="information-circle" />
                  </a>
                </div>
                { !usingiCloudDrive && haveFullDiskAccess !== "authorized" && (
                  <div className="ml-4 mt-1 text-danger text-s">
                    <Trans>Scribe need you to enable Full Disk Access in order to update your signatures.</Trans><br />
                    <a href="#" onClick={ openFullDiskAccessExplanation }><Trans>Enable Full Disk Access</Trans></a>
                  </div>
                ) }
              </>
            ) }
          </div>
        ) }
        <h3><Trans>Configuration</Trans></h3>
        { process.platform === "win32" && (
          <div className="mb-1">
            <Checkbox key={ `check-outlook-folder-${outlookSignaturesFolderPersonalized}` } label={ t`Personalize Outlook signatures folder` } onChange={ handleOutlookFolderChange } checked={ outlookSignaturesFolderPersonalized } />
            { outlookSignaturesFolderPersonalized && (
              <div className="outlook-folder-path">
                { outlookSignaturesFolder }
              </div>
            ) }
          </div>
        ) }
        <Checkbox label={ t`Launch at startup` } onChange={ handleLaunchAtStartupChange } checked={ launchAtStartup } />
      </div>
      <div className="text-center bottom-block">
        <div className="mb-1">
          { currentUser && (
            <>
              <Trans>Logged in as</Trans>
              { " " }
              <strong>{ currentUser.email }</strong>
            </>
          ) }
          { !currentUser && (
            <Trans>Not logged in</Trans>
          ) }
        </div>
        <div>
          { currentUser && !store.get("domain_token_authentication") && (
            <>
              <a href="#" className="pt-1" onClick={ handleLogout }><Trans>Logout</Trans></a>
              { " - " }
            </>
          ) }
          <a href="#" className="pt-1" onClick={ handleQuit }><Trans>Quit</Trans></a>
        </div>
        <a className="app-version mt-3" href="#" onClick={ openScribeWebsite }><Trans>Scribe v{ app.getVersion() }</Trans></a>
      </div>
    </div>
  );
};

ConfigurationContainer.defaultProps = {};

ConfigurationContainer.propTypes = {};

export default ConfigurationContainer;
