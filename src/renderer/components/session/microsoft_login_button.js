import React, { useEffect, useState }     from "react";
import PropTypes                          from "prop-types";
import { ipcRenderer }                    from "electron";
import { createMicrosoftSession }         from "requests/session";
import { Office365Button, OutlookButton } from "renderer/components/ui";

const SessionMicrosoftLoginButton = ({ children, block, provider, onError, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const logInUser = (idToken) => {
    createMicrosoftSession(idToken).then((response) => {
      onLoginSuccess(response);
    }).catch(() => {
      setLoading(false);
      onError("Error while login with Microsoft");
    });
  };

  useEffect(() => {
    ipcRenderer.on("logged-in-with-microsoft", (event, args) => {
      setLoading(true);
      logInUser(args.idToken);
    });
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
