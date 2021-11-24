import React, { useState, useEffect }      from "react";
import PropTypes                           from "prop-types";
import { getAuthenticationMethod }         from "requests/authentication_method";
import { createSession, createSsoSession } from "requests/session";
import validate                            from "validate.js";
import { Trans, t }                        from "@lingui/macro";
import { Icon, Form, Button }              from "renderer/components/ui";
import { ipcRenderer }                     from "electron";
import { Input, FormGroup, Label }         from "reactstrap";

import "./form.scss";

const SessionForm = ({ onError, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [isSso, setIsSso] = useState(false);
  const [ssoUrl, setSsoUrl] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const checkAuthenticationMethod = () => {
    getAuthenticationMethod(email).then((response) => {
      if (response.data.method === "sso") {
        setIsSso(true);
        setSsoUrl(response.data.redirect_url);
      } else {
        setIsSso(false);
        setSsoUrl(null);
      }
    });
  };

  const handleSso = () => {
    ipcRenderer.send("open-sso-login", { redirectUrl: ssoUrl });
  };

  useEffect(() => {
    if (ipcRenderer.rawListeners("logged-in-with-sso").length === 0) {
      ipcRenderer.on("logged-in-with-sso", (event, args) => {
        setNextLoading(true);
        createSsoSession(args.code).then((response) => {
          onLoginSuccess(response);
        }).catch(() => {
          setNextLoading(false);
        });
      });
    }
  }, []);

  useEffect(() => {
    const errors =  validate.single(email, { presence: true, email: true });
    if (!errors) {
      checkAuthenticationMethod();
    } else {
      setIsSso(false);
      setSsoUrl(null);
    }
  }, [email]);

  const handleSubmit = () => {
    createSession({ email, password }).then((response) => {
      onLoginSuccess(response);
    }).catch(() => {
      onError(t`Please check your email and password`);
    });
  };

  return (
    <Form className="application-form">
      <FormGroup>
        <Label for="email"><Trans>Email</Trans></Label>
        <div className="email-field-container">
          <Input id="email" type="text" label={ t`Email` } value={ email } onChange={ handleEmailChange } placeholder="john.doe@companyname.com" />
        </div>
      </FormGroup>
      { !isSso && (
        <>
          <FormGroup>
            <Label for="email"><Trans>Password</Trans></Label>
            <Input id="email" type="password" label={ t`Email` } value={ password } onChange={ handlePasswordChange } placeholder={ t`6 characters minimum` } />
          </FormGroup>
          <div className="text-center pt-3">
            <Button onClick={ handleSubmit } loading={ nextLoading } color="primary" padded><Trans>Login</Trans></Button>
          </div>
        </>
      ) }
      { isSso && (
        <>
          <div className="text-center pt-3">
            <Button onClick={ handleSso } loading={ nextLoading } color="primary" padded><Trans>Login</Trans></Button>
          </div>
          <div className="text-center text-s mt-2 sso-enabled">
            <Icon icon="shield-lock" className="mr-1" />
            <Trans>Single sign-on enabled</Trans>
          </div>
        </>
      ) }
    </Form>
  );
};

SessionForm.propTypes = {
  onError:        PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired
};

export default SessionForm;
