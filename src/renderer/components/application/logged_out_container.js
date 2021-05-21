import React, { useState }         from "react";
import { useSession }              from "renderer/contexts/session/hooks";
import { setAuthorizationToken }   from "renderer/services/authorization_token";
import { getSession }              from "renderer/requests/session";
import { updateSignature }         from "renderer/services/signature";
import SessionGoogleLoginButton    from "renderer/components/session/google_login_button";
import SessionMicrosoftLoginButton from "renderer/components/session/microsoft_login_button";
import SessionForm                 from "renderer/components/session/form";
import { Button, Icon }            from "renderer/components/ui";
import { isSubscriptionActive }    from "renderer/services/account";
import store                       from "renderer/services/store";
import { setBugsnagUser }          from "renderer/services/bugsnag";
import { Alert }                   from "reactstrap";
import "./logged_out_container.scss";

const ApplicationLoggedOutContainer = () => {
  const { setCurrentUser, setCurrentAccount } = useSession();

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [sessionResponse, setSessionResponse] = useState(false);

  const handleError = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleContinue = (localSessionResponse = null) => {
    const { user, account } = (localSessionResponse || sessionResponse).data;
    setBugsnagUser(user.id, user.email, user.display_name);

    store.set("is_subscription_active", isSubscriptionActive(account));
    setCurrentUser(user);
    setCurrentAccount(account);
  };

  const handleLoginSuccess = (response) => {
    setAuthorizationToken(response.headers.authorization.split(" ")[1]);
    getSession().then((response2) => {
      if (isSubscriptionActive(response2.data.account)) {
        const emailsWithSignature = response2.data.user.co_worker.emails.filter((email) => email.has_signature);
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
        You are logged in<br />
        Your signatures have been succcessfully <br />installed on Outlook
        <div className="mt-5">
          <Button color="primary" padded onClick={ () => { handleContinue(); } }>Continue</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 mt-2">
        <SessionGoogleLoginButton block onError={ handleError } onLoginSuccess={ handleLoginSuccess }>Login with google</SessionGoogleLoginButton>
      </div>
      <div className="mb-2">
        <SessionMicrosoftLoginButton block onError={ handleError } onLoginSuccess={ handleLoginSuccess } provider="office-365">Login with Office 365</SessionMicrosoftLoginButton>
      </div>
      <div className="mb-2">
        <SessionMicrosoftLoginButton block onError={ handleError } onLoginSuccess={ handleLoginSuccess } provider="outlook">Login with Outlook</SessionMicrosoftLoginButton>
      </div>
      <div className="or-container">
        <span>or</span>
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
