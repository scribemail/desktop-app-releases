import React, { useState }           from "react";
import { shell }                     from "electron";
import { useSession }                from "renderer/contexts/session/hooks";
import { Icon }                      from "renderer/components/ui";
import ApplicationLoggedOutContainer from "renderer/components/application/logged_out_container";
import ApplicationLoggedInContainer  from "renderer/components/application/logged_in_container";
import ConfigurationContainer        from "renderer/components/configuration/container";

import logo from "images/logo.png";

import "./container.scss";

const ApplicationContainer = () => {
  const { currentUser, currentAccount } = useSession();
  const [showConfig, setShowConfig] = useState();

  const toggleConfig = () => {
    setShowConfig((oldValue) => !oldValue);
  };

  const openScribeWesbite = () => {
    shell.openExternal("https://scribe-mail.com");
  };

  return (
    <div className="application-container p-3">
      <div className="header pb-3 d-flex align-items-center">
        <a href="#" onClick={ openScribeWesbite }>
          <img src={ logo } height="25" alt="Logo" />
        </a>
        <div className="ml-auto">
          <a href="#" onClick={ toggleConfig }>
            <Icon icon="cog" className="config-icon" />
          </a>
        </div>
      </div>
      { (!currentUser || !currentAccount) && !showConfig && <ApplicationLoggedOutContainer /> }
      { currentUser && currentAccount && !showConfig && <ApplicationLoggedInContainer /> }
      { showConfig && <ConfigurationContainer onHide={ () => { setShowConfig(false); } } /> }
    </div>
  );
};

export default ApplicationContainer;
