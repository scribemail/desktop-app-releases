import React                      from "react";
import PropTypes                  from "prop-types";
import { Form as ReactstrapForm } from "reactstrap";

import "./form.scss";

const Form = (props) => (
  <ReactstrapForm className="application-form" { ...props } />
);

export default Form;
