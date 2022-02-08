import React, { useState }          from "react";
import { shell }                    from "electron";
import { app }                      from "@electron/remote";
import PropTypes                    from "prop-types";
import { Trans, t }                 from "@lingui/macro";
import { deleteAuthorizationToken } from "services/authorization_token";
import { useSession }               from "renderer/contexts/session/hooks";
import store                        from "services/store";
import { Checkbox }                 from "renderer/components/ui";

import "./container.scss";

const ConfigurationContainer = () => {
  const [launchAtStartup, setLaunchAtStartup] = useState(store.get("launch_at_startup"));
  const [updateOutlook, setUpdateOutlook] = useState(store.get("update_outlook"));
  const [updateAppleMail, setUpdateAppleMail] = useState(store.get("update_apple_mail"));

  const { currentUser, deleteCurrentWorkspaces, deleteCurrentUser } = useSession();

  const handleLogout = () => {
    deleteAuthorizationToken();
    deleteCurrentWorkspaces();
    deleteCurrentUser();
  };

  const openScribeWebsite = () => {
    shell.openExternal(`${process.env.ELECTRON_WEBPACK_APP_WEBSITE_BASE_URL}?utm_source=Scribe+app&utm_medium=scribe+assets&utm_campaign=Scribe+app`);
  };

  const handleQuit = () => {
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
    store.set("update_outlook", event.target.checked);
  };

  const handleUpdateAppleMailChange = (event) => {
    setUpdateAppleMail(event.target.checked);
    store.set("update_apple_mail", event.target.checked);
  };

  return (
    <div className="config-container">
      <div className="mt-3">
        { process.platform === "darwin" && (
          <div className="mb-3">
            <h3><Trans>Update signatures for</Trans></h3>
            <Checkbox label={ t`Microsoft outlook` } className="mb-1" onChange={ handleUpdateOutlookChange } checked={ updateOutlook } />
            <Checkbox label={ t`Apple Mail` } onChange={ handleUpdateAppleMailChange } checked={ updateAppleMail } />
          </div>
        ) }
        <h3><Trans>Configuration</Trans></h3>
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
