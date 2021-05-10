import React, { useState }          from "react";
import PropTypes                    from "prop-types";
import { remote }                   from "electron";
import { deleteAuthorizationToken } from "renderer/services/authorization_token";
import { useSession }               from "renderer/contexts/session/hooks";
import store                        from "renderer/services/store";
import { Checkbox }                 from "renderer/components/ui";

import "./container.scss";

const { app } = remote;

const ConfigurationContainer = ({ onHide }) => {
  const [launchAtStartup, setLaunchAtStartup] = useState(store.get("launch_at_startup"));

  const { currentUser, deleteCurrentAccount, deleteCurrentUser } = useSession();

  const handleLogout = () => {
    deleteAuthorizationToken();
    deleteCurrentAccount();
    deleteCurrentUser();
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

  return (
    <div className="config-container">
      <div className="text-center mt-1 mb-2">
        { currentUser && (
          <p>
            Logged in as<br />
            <strong>{ currentUser.email }</strong>
          </p>
        ) }
        { !currentUser && (
          <p>
            Not logged in
          </p>
        ) }
        <p>
          { currentUser && (
            <>
              <a href="#" className="pt-1" onClick={ handleLogout }>Logout</a>
              { " - " }
            </>
          ) }
          <a href="#" className="pt-1" onClick={ handleQuit }>Quit</a>
        </p>
      </div>
      <h3>Configuration</h3>
      <Checkbox label="Launch at startup" onChange={ handleLaunchAtStartupChange } checked={ launchAtStartup } />
      <div className="app-version color-content-subtle">Scribe v{ app.getVersion() }</div>
    </div>
  );
};

ConfigurationContainer.propTypes = {
  onHide: PropTypes.func.isRequired,
};

export default ConfigurationContainer;
