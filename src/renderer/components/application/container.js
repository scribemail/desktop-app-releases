import React                                             from "react";
import { shell }                                         from "electron";
import { useSession }                                    from "renderer/contexts/session/hooks";
import { t }                                             from "@lingui/macro";
import SignaturesProvider                                from "renderer/contexts/signatures/provider";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Icon }                                          from "renderer/components/ui";
import SessionLoginContainer                             from "renderer/components/session/login_container";
import SessionLoginSuccess                               from "renderer/components/session/login_success";
import SignaturesList                                    from "renderer/components/signatures/list";
import ApplicationUpdateNotification                     from "renderer/components/application/update_notification";
import ConfigurationContainer                            from "renderer/components/configuration/container";

import logo from "images/logo.png";

import "./container.scss";

const ApplicationContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, currentWorkspaces } = useSession();

  const openScribeWebsite = () => {
    if (location.pathname === "/configuration") {
      navigate("/");
    } else {
      shell.openExternal(`${process.env.ELECTRON_WEBPACK_APP_WEBSITE_BASE_URL}?utm_source=Scribe+app&utm_medium=scribe+assets&utm_campaign=Scribe+app`);
    }
  };

  return (
    <Routes>
      <Route path="/help/using-icloud" element={ <div>Test</div> } />
      <Route
        path="*"
        element={ (
          <SignaturesProvider>
            <div className="application-container p-3">
              <div className="header pb-3 d-flex align-items-center">
                <a href="#" onClick={ openScribeWebsite }>
                  <img src={ logo } height="25" alt={ t`Logo` } />
                </a>
                { location.pathname !== "/logged-in-success" && (
                  <div className="ml-auto">
                    <Link to={ location.pathname === "/" ? "/configuration" : "/" }>
                      <Icon icon="cog" className="config-icon" />
                    </Link>
                  </div>
                ) }
              </div>
              <Routes>
                <Route path="/" element={ currentUser && currentWorkspaces && currentWorkspaces.length > 0 ? <SignaturesList /> : <SessionLoginContainer /> } />
                <Route path="/logged-in-success" element={ <SessionLoginSuccess /> } />
                <Route path="/configuration" element={ <ConfigurationContainer /> } />
              </Routes>
              <ApplicationUpdateNotification />
            </div>
          </SignaturesProvider>
        ) }
      />
    </Routes>
  );
};

export default ApplicationContainer;
