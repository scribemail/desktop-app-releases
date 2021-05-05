import React      from "react";
import PropTypes  from "prop-types";
import { Button } from "renderer/components/ui";

import "./outlook.scss";

import Outlook from "images/email_providers/outlook.png";

const GoogleButton = ({ children, ...otherProps }) => (
  <Button
    className="d-flex align-items-center btn-outlook"
    { ...otherProps }
  >
    <span className="btn-outlook-icon d-flex align-items-center justify-content-center">
      <img src={ Outlook } alt="Gmail" width="20px" />
    </span>
    <span className="btn-outlook-text">{ children }</span>
  </Button>
);

GoogleButton.defaultProps = {};

GoogleButton.propTypes = {
  children: PropTypes.any.isRequired
};

export default GoogleButton;
