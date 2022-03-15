import React            from "react";
import PropTypes        from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { CustomInput }  from "reactstrap";

import "./checkbox.scss";

const Checkbox = ({ onChange, checked, label, ...otherProps }) => {
  const uniqueId = uuidv4();

  return (
    <CustomInput type="switch" id={ `switch-${uniqueId}` } onChange={ onChange } checked={ checked } label={ label } { ...otherProps } />
  );
};

Checkbox.defaultProps = {
  checked: false,
  label:   ""
};

Checkbox.propTypes = {
  onChange: PropTypes.func.isRequired,
  checked:  PropTypes.bool,
  label:    PropTypes.string
};

export default Checkbox;
