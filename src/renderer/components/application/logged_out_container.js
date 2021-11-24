import React, { useState }                  from "react";
import { useSession }                       from "renderer/contexts/session/hooks";
import { setAuthorizationToken }            from "services/authorization_token";
import { getSession }                       from "requests/session";
import { updateSignature }                  from "services/signature";
import flatten                              from "lodash/flatten";
import map                                  from "lodash/map";
import { Trans }                            from "@lingui/macro";
import filter                               from "lodash/filter";
import SessionGoogleLoginButton             from "renderer/components/session/google_login_button";
import SessionMicrosoftLoginButton          from "renderer/components/session/microsoft_login_button";
import SessionForm                          from "renderer/components/session/form";
import { Button, Icon }                     from "renderer/components/ui";
import { setWorkspaces }                    from "services/store";
import { isSubscriptionActiveForWorkspace } from "services/workspaces";
import { Alert }                            from "reactstrap";
import "./logged_out_container.scss";

const ApplicationLoggedOutContainer = () => {
  const { setCurrentUser, setCurrentWorkspaces } = useSession();

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [sessionResponse, setSessionResponse] = useState(false);

  const handleError = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleContinue = (localSessionResponse = null) => {
    const { data } = localSessionResponse || sessionResponse;

    setWorkspaces(data.workspaces);
    setCurrentUser(data.user);
    setCurrentWorkspaces(data.workspaces);
  };

  const handleLoginSuccess = (response) => {
    setAuthorizationToken(response.headers.authorization.split(" ")[1]);
    getSession().then((response2) => {
      const emailsWithSignature = flatten(map(filter(response2.data.workspaces, (workspace) => isSubscriptionActiveForWorkspace(workspace) && workspace.co_worker), (workspace) => workspace.co_worker.emails)).filter((email) => email.has_signature);
      if (emailsWithSignature.length > 0) {
        emailsWithSignature.map((email) => updateSignature(email.signature_id, email.email));
        setSessionResponse(response2);
        setLoginSuccess(true);
      } else {
        handleContinue(response2);
      }
    });
  };

  if (loginSuccess) {
    return (
      <div className="text-center login-success-block">
        <Icon icon="check-circle-1" className="text-success" /><br />
        <Trans>You are logged in<br />Your signatures have been succcessfully<br />installed on Outlook</Trans>
        <div className="mt-5">
          <Button color="primary" padded onClick={ () => { handleContinue(); } }> <Trans>Continue</Trans></Button>
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
