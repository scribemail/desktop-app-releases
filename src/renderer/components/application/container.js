import React, { useState }           from "react";
import { shell }                     from "electron";
import { useSession }                from "renderer/contexts/session/hooks";
import { t }                         from "@lingui/macro";
import { Icon }                      from "renderer/components/ui";
import ApplicationLoggedOutContainer from "renderer/components/application/logged_out_container";
import ApplicationLoggedInContainer  from "renderer/components/application/logged_in_container";
import ApplicationUpdateNotification from "renderer/components/application/update_notification";
import ConfigurationContainer        from "renderer/components/configuration/container";

import logo from "images/logo.png";

import "./container.scss";

const ApplicationContainer = () => {
  const { currentUser, currentWorkspaces } = useSession();
  const [showConfig, setShowConfig] = useState();

  const toggleConfig = () => {
    setShowConfig((oldValue) => !oldValue);
  };

  const openScribeWebsite = () => {
    shell.openExternal(`${process.env.ELECTRON_WEBPACK_APP_WEBSITE_BASE_URL}?utm_source=Scribe+app&utm_medium=scribe+assets&utm_campaign=Scribe+app`);
  };

  return (
    <div className="application-container p-3">
      <div className="header pb-3 d-flex align-items-center">
        <a href="#" onClick={ openScribeWebsite }>
          <img src={ logo } height="25" alt={ t`Logo` } />
        </a>
        <div className="ml-auto">
          <a href="#" onClick={ toggleConfig }>
            <Icon icon="cog" className="config-icon" />
          </a>
        </div>
      </div>
      { !showConfig && (
        <>
          { (!currentUser || currentWorkspaces.length === 0) && !showConfig && <ApplicationLoggedOutContainer /> }
          { currentUser && currentWorkspaces.length > 0 && !showConfig && <ApplicationLoggedInContainer /> }
          <ApplicationUpdateNotification />
        </>
      ) }
      { showConfig && <ConfigurationContainer onHide={ () => { setShowConfig(false); } } /> }
    </div>
  );
};

export default ApplicationContainer;
