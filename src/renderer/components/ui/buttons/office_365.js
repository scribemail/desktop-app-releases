import React      from "react";
import PropTypes  from "prop-types";
import { Button } from "renderer/components/ui";

import "./office_365.scss";

import Office365 from "images/email_providers/office365.png";

const GoogleButton = ({ children, ...otherProps }) => (
  <Button
    className="d-flex align-items-center btn-office-365"
    { ...otherProps }
  >
    <span className="btn-office-365-icon d-flex align-items-center justify-content-center">
      <img src={ Office365 } alt="Office 365" width="20px" />
    </span>
    <span className="btn-office-365-text">{ children }</span>
  </Button>
);

GoogleButton.defaultProps = {
  loading: false
};

GoogleButton.propTypes = {
  loading:  PropTypes.bool,
  children: PropTypes.any.isRequired
};

export default GoogleButton;
