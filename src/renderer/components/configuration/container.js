import React, { useState }          from "react";
import PropTypes                    from "prop-types";
import { remote }                   from "electron";
import { deleteAuthorizationToken } from "services/authorization_token";
import { useSession }               from "renderer/contexts/session/hooks";
import store                        from "services/store";
import { Checkbox }                 from "renderer/components/ui";

import "./container.scss";

const { app } = remote;

const ConfigurationContainer = ({ onHide }) => {
  const [launchAtStartup, setLaunchAtStartup] = useState(store.get("launch_at_startup"));
  const [updateOutlook, setUpdateOutlook] = useState(store.get("update_outlook"));
  const [updateAppleMail, setUpdateAppleMail] = useState(store.get("update_apple_mail"));

  const { currentUser, deleteCurrentAccount, deleteCurrentUser } = useSession();

  const handleLogout = () => {
    deleteAuthorizationToken();
    deleteCurrentAccount();
    deleteCurrentUser();
    store.delete("is_subscription_active");
    onHide();
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
            <h3>Update signatures for</h3>
            <Checkbox label="Microsoft outlook" className="mb-1" onChange={ handleUpdateOutlookChange } checked={ updateOutlook } />
            <Checkbox label="Apple Mail" onChange={ handleUpdateAppleMailChange } checked={ updateAppleMail } />
          </div>
        ) }
        <h3>Configuration</h3>
        <Checkbox label="Launch at startup" onChange={ handleLaunchAtStartupChange } checked={ launchAtStartup } />
      </div>
      <div className="text-center bottom-block">
        <div className="mb-1">
          { currentUser && (
            <>
              Logged in as
              { " " }
              <strong>{ currentUser.email }</strong>
            </>
          ) }
          { !currentUser && (
            <>
              Not logged in
            </>
          ) }
        </div>
        <div>
          { currentUser && (
            <>
              <a href="#" className="pt-1" onClick={ handleLogout }>Logout</a>
              { " - " }
            </>
          ) }
          <a href="#" className="pt-1" onClick={ handleQuit }>Quit</a>
        </div>
        <div className="app-version color-content-subtle mt-4">Scribe v{ app.getVersion() }</div>
      </div>
    </div>
  );
};

ConfigurationContainer.propTypes = {
  onHide: PropTypes.func.isRequired,
};

export default ConfigurationContainer;
