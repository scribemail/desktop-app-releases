import React     from "react";
import PropTypes from "prop-types";

import "./icon.scss";

const Icon = ({ icon, size, className, spinning, verticalAlign, lineHeight, ...otherProps }) => {
  const finalClassName = () => {
    let value = `icon icon-${icon}`;
    if (size) {
      value = `${value} icon-${size}`;
    }
    if (className) {
      value = `${value} ${className}`;
    }
    if (spinning) {
      value = `${value} icon-is-spinning`;
    }
    return value;
  };

  return <i style={ { lineHeight, verticalAlign } } className={ finalClassName() } { ...otherProps } />;
};

Icon.defaultProps = {
  size:          null,
  className:     null,
  spinning:      false,
  verticalAlign: "top",
  lineHeight:    "inherit"
};

Icon.propTypes = {
  icon:          PropTypes.string.isRequired,
  size:          PropTypes.string,
  className:     PropTypes.string,
  spinning:      PropTypes.bool,
  verticalAlign: PropTypes.string,
  lineHeight:    PropTypes.string
};

export default Icon;
