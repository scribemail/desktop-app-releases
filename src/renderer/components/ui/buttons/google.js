import React      from "react";
import PropTypes  from "prop-types";
import classNames from "classnames";
import { Button } from "renderer/components/ui";

import "./google.scss";

import GoogleWorkspace from "images/email_providers/google-worspace.png";

const GoogleButton = ({ children, className, ...otherProps }) => (
  <Button
    className={ classNames("d-flex align-items-center btn-google", className) }
    { ...otherProps }
  >
    <span className="btn-google-icon d-flex align-items-center justify-content-center">
      <img src={ GoogleWorkspace } alt="Gmail" width="20px" />
    </span>
    <span className="btn-google-text">{ children }</span>
  </Button>
);

GoogleButton.defaultProps = {
  className: null
};

GoogleButton.propTypes = {
  className: PropTypes.string,
  children:  PropTypes.any.isRequired
};

export default GoogleButton;
