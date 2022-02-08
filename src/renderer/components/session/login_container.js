import React, { useState, useRef, useEffect } from "react";
import { useSession }                         from "renderer/contexts/session/hooks";
import { setAuthorizationToken }              from "services/authorization_token";
import { createDomainTokenSession }           from "requests/session";
import { useNavigate }                        from "react-router-dom";
import { exec }                               from "child_process";
import Registry                               from "rage-edit";
import store                                  from "services/store";
import { Trans }                              from "@lingui/macro";
import SessionGoogleLoginButton               from "renderer/components/session/google_login_button";
import SessionMicrosoftLoginButton            from "renderer/components/session/microsoft_login_button";
import SessionForm                            from "renderer/components/session/form";
import { Alert }                              from "reactstrap";

import "./login_container.scss";

const SessionLoginContainer = () => {
  const { refresh, currentUser } = useSession();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const azureAdAuthenticationInterval = useRef();

  const handleError = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleLoginSuccess = (response, domainTokenAuthentication = false) => {
    store.set("domain_token_authentication", domainTokenAuthentication);
    setAuthorizationToken(response.headers.authorization.split(" ")[1]);
    refresh();
  };

  const tryDomainTokenAuthentication = () => {
    if (process.platform === "win32") {
      /* eslint-disable string-to-lingui/missing-lingui-transformation */
      const keyPath = "HKLM\\Software\\Policies\\Scribe\\Config";
      const keyName = "DomainToken";
      Registry.get(keyPath, keyName).then((value) => {
        if (value) {
          exec("whoami /upn", (error, stdout) => {
            if (!error) {
              const name = stdout.split("@")[0];
              createDomainTokenSession(value, name).then((response) => {
                if (azureAdAuthenticationInterval.current) {
                  clearInterval(azureAdAuthenticationInterval.current);
                }
                handleLoginSuccess(response, true);
              }).catch(() => {});
            }
          });
        }
      });
      /* eslint-enable string-to-lingui/missing-lingui-transformation */
    }
  };

  useEffect(() => {
    azureAdAuthenticationInterval.current = setInterval(tryDomainTokenAuthentication, 30000);
    tryDomainTokenAuthentication();
    return () => {
      if (azureAdAuthenticationInterval.current) {
        clearInterval(azureAdAuthenticationInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      navigate("/logged-in-success");
    }
  }, [currentUser]);

  return (
    <>
      <div className="mb-2 mt-2">
        <SessionGoogleLoginButton block onError={ handleError } onLoginSuccess={ handleLoginSuccess }><Trans>Login with google</Trans></SessionGoogleLoginButton>
      </div>
      <div className="mb-2">
        <SessionMicrosoftLoginButton block onError={ handleError } onLoginSuccess={ handleLoginSuccess } provider="office-365"><Trans>Login with Office 365</Trans></SessionMicrosoftLoginButton>
      </div>
      <div className="mb-2">
        <SessionMicrosoftLoginButton block onError={ handleError } onLoginSuccess={ handleLoginSuccess } provider="outlook"><Trans>Login with Outlook</Trans></SessionMicrosoftLoginButton>
      </div>
      <div className="or-container">
        <span><Trans>or</Trans></span>
      </div>
      { showError && (
        <Alert color="danger">
          { errorMessage }
        </Alert>
      ) }
      <SessionForm onError={ handleError } onLoginSuccess={ handleLoginSuccess } />
    </>
  );
};

export default SessionLoginContainer;
