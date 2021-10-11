import React, { useState, useEffect }      from "react";
import PropTypes                           from "prop-types";
import { getAuthenticationMethod }         from "requests/authentication_method";
import { createSession, createSsoSession } from "requests/session";
import { ipcRenderer }                     from "electron";
import { Form, Button }                    from "renderer/components/ui";
import { Input, FormGroup, Label }         from "reactstrap";

const SessionForm = ({ onError, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const checkAuthenticationMethod = () => {
    getAuthenticationMethod(email).then((response) => {
      if (response.data.method === "sso") {
        ipcRenderer.send("open-sso-login", { redirectUrl: response.data.redirect_url });
      } else {
        setStep(2);
      }
    });
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

  const handleSubmit = () => {
    createSession({ email, password }).then((response) => {
      onLoginSuccess(response);
    }).catch(() => {
      onError("Please check your email and password");
    });
  };

  return (
    <Form className="application-form">
      <FormGroup>
        <Label for="email">Email</Label>
        <Input id="email" type="text" label="Email" value={ email } onChange={ handleEmailChange } placeholder="john.doe@companyname.com" />
      </FormGroup>
      { step === 1 && (
        <div className="text-center pt-3">
          <Button onClick={ checkAuthenticationMethod } color="primary" padded loading={ nextLoading }>Next</Button>
        </div>
      ) }
      { step === 2 && (
        <>
          <FormGroup>
            <Label for="email">Password</Label>
            <Input id="email" type="password" label="Email" value={ password } onChange={ handlePasswordChange } placeholder="6 characters minimum" />
          </FormGroup>
          <div className="text-center pt-3">
            <Button onClick={ handleSubmit } color="primary" padded>Login</Button>
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
