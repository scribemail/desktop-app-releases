import React, { useState }         from "react";
import PropTypes                   from "prop-types";
import { createSession }           from "renderer/requests/session";
import { Form, Button }            from "renderer/components/ui";
import { Input, FormGroup, Label } from "reactstrap";

const SessionForm = ({ onError, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

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
      <FormGroup>
        <Label for="email">Password</Label>
        <Input id="email" type="password" label="Email" value={ password } onChange={ handlePasswordChange } placeholder="6 characters minimum" />
      </FormGroup>
      <div className="text-center pt-3">
        <Button onClick={ handleSubmit } color="primary" padded>Login</Button>
      </div>
    </Form>
  );
};

SessionForm.propTypes = {
  onError:        PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired
};

export default SessionForm;
