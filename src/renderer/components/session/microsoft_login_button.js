import React, { useEffect, useState }     from "react";
import PropTypes                          from "prop-types";
import { ipcRenderer }                    from "electron";
import { t }                              from "@lingui/macro";
import { createMicrosoftSession }         from "requests/session";
import { Office365Button, OutlookButton } from "renderer/components/ui";

const SessionMicrosoftLoginButton = ({ children, block, provider, onError, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const logInUser = (event, args) => {
    setLoading(true);
    createMicrosoftSession(args.idToken).then((response) => {
      if (response.data.method === "sso") {
        onError(t`Please login with your email`);
      } else {
        onLoginSuccess(response);
      }
    }).catch(() => {
      setLoading(false);
      onError(t`Error while login with Microsoft`);
    });
  };

  useEffect(() => {
    ipcRenderer.on("logged-in-with-microsoft", logInUser);
    return () => {
      ipcRenderer.removeListener("logged-in-with-microsoft", logInUser);
    };
  }, []);

  const logIn = () => {
    ipcRenderer.send("open-microsoft-login");
  };

  const ButtonComponent = provider === "office-365" ? Office365Button : OutlookButton;

  return (
    <>
      <ButtonComponent block={ block } onClick={ logIn } disabled={ loading }>
        { children }
      </ButtonComponent>
    </>
  );
};

SessionMicrosoftLoginButton.defaultProps = {
  children:  null,
  block:     false
};

SessionMicrosoftLoginButton.propTypes = {
  children:       PropTypes.any,
  block:          PropTypes.bool,
  provider:       PropTypes.string.isRequired,
  onError:        PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired
};

export default SessionMicrosoftLoginButton;
