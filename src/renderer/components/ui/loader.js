import React     from "react";
import PropTypes from "prop-types";
import Loader    from "react-loader-spinner";

const AppLoader = ({ centered, ...otherProps }) => {
  const loader = <Loader type="Oval" height={ 30 } width={ 30 } color="#192eee" { ...otherProps } />;
  if (centered) {
    return <div className="d-flex mt-5 align-items-center justify-content-center" style={ { height: "300px" } }>{ loader }</div>;
  }
  return loader;
};

AppLoader.defaultProps = {
  centered: false
};

AppLoader.propTypes = {
  centered: PropTypes.bool
};

export default AppLoader;
