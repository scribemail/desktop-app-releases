import React                          from "react";
import PropTypes                      from "prop-types";
import classNames                     from "classnames";
import { Button as ReactstrapButton } from "reactstrap";

import "./base.scss";

const Button = ({ className, loading, disabled, children, padded, fontSize, ...otherProps }) => {
  const isDisabled = disabled || loading;

  return (
    <ReactstrapButton
      className={ classNames("app-button", className, {
        "btn-padded-sm":  padded === "sm",
        "btn-padded":     typeof padded === "boolean" && padded,
        "btn-small-font": fontSize === "sm"
      }) }
      disabled={ isDisabled }
      style={ disabled ? { pointerEvents: "none" } : {} }
      { ...otherProps }
    >
      { children }
    </ReactstrapButton>
  );
};

Button.defaultProps = {
  className: "",
  loading:   false,
  disabled:  false,
  padded:    null,
  fontSize:  null
};

Button.propTypes = {
  className: PropTypes.string,
  loading:   PropTypes.bool,
  disabled:  PropTypes.bool,
  children:  PropTypes.any.isRequired,
  padded:    PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  fontSize:  PropTypes.string
};

export default Button;
