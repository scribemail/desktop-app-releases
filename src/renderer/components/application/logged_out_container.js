import React, { useState, useRef, useEffect }   from "react";
import { useSession }                           from "renderer/contexts/session/hooks";
import { setAuthorizationToken }                from "services/authorization_token";
import { getSession, createDomainTokenSession } from "requests/session";
import { updateSignature }                      from "services/signature";
import { exec }                                 from "child_process";
import Registry                                 from "rage-edit";
import find                                     from "lodash/find";
import store, { setWorkspaces }                 from "services/store";
import map                                      from "lodash/map";
import { Trans, t }                             from "@lingui/macro";
import filter                                   from "lodash/filter";
import SessionGoogleLoginButton                 from "renderer/components/session/google_login_button";
import SessionMicrosoftLoginButton              from "renderer/components/session/microsoft_login_button";
import SessionForm                              from "renderer/components/session/form";
import { Button, Icon }                         from "renderer/components/ui";
import { isSubscriptionActiveForWorkspace }     from "services/workspaces";
import { Alert }                                from "reactstrap";

import "./logged_out_container.scss";

const ApplicationLoggedOutContainer = () => {
  const { setCurrentUser, setCurrentWorkspaces } = useSession();

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [sessionResponse, setSessionResponse] = useState(false);

  const azureAdAuthenticationInterval = useRef();

  const handleError = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleContinue = (localSessionResponse = null) => {
    const { data } = localSessionResponse || sessionResponse;

    setWorkspaces(data.workspaces);
    setCurrentWorkspaces(data.workspaces);
    setCurrentUser(data.user);
  };

  const handleLoginSuccess = (response, domainTokenAuthentication = false) => {
    store.set("domain_token_authentication", domainTokenAuthentication);
    setAuthorizationToken(response.headers.authorization.split(" ")[1]);
    getSession().then((response2) => {
      const emailsWithSignature = map(filter(response2.data.workspaces, (workspace) => isSubscriptionActiveForWorkspace(workspace) && workspace.co_worker), (workspace) => { return { workspaceId: workspace.id, emails: workspace.co_worker.emails.filter((email) => email.has_signature) }; });
      if (find(emailsWithSignature, (tuple) => tuple.emails.length > 0)) {
        emailsWithSignature.map((tuple) => (
          tuple.emails.map((email) => (
            updateSignature(tuple.workspaceId, email.signature_id, email.email)
          ))
        ));
        setSessionResponse(response2);
        setLoginSuccess(true);
      } else {
        handleContinue(response2);
      }
    });
  };

  const updatedMessage = () => {
    if (store.get("update_apple_mail") && store.get("update_outlook")) {
      return t`Outlook and Apple Mail`;
    }
    if (store.get("update_outlook")) {
      return t`Outlook`;
    }
    return t`Apple Mail`;
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
  }, []);

  if (loginSuccess) {
    return (
      <div className="text-center login-success-block">
        <Icon icon="check-circle-1" className="text-success" /><br />
        <Trans>You are logged in<br />Your signatures have been succcessfully<br />installed on { updatedMessage() }</Trans>
        <div className="mt-5">
          <Button color="primary" padded onClick={ () => { handleContinue(); } }><Trans>Continue</Trans></Button>
        </div>
      </div>
    );
  }

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

export default ApplicationLoggedOutContainer;
