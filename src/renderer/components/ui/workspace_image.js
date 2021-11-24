import React                from "react";
import PropTypes            from "prop-types";
import classNames           from "classnames";
import { t }                from "@lingui/macro";
import toUpper              from "lodash/toUpper";
import Avatar               from "@mui/material/Avatar";
import { departmentColors } from "services/colors";

import cssVariables from "renderer/styles/variables.scss";

const stringAsciiPRNG = (value, m) => {
  const charCodes = [...value].map((letter) => letter.charCodeAt(0));
  const len = charCodes.length;

  const a = (len % (m - 1)) + 1;
  const c = charCodes.reduce((current, next) => current + next, "") % m;

  let random = charCodes[0] % m;
  for (let i = 0; i < len; i++) {
    random = ((a * random) + c) % m;
  }

  return random;
};

const WorkspaceImage = ({ className, workspace, size, fontSize, ...otherProps }) => {
  const initials = () => (
    toUpper(`${workspace.name ? workspace.name[0] : ""}`)
  );

  const color = () => {
    const colorIndex = stringAsciiPRNG(workspace.name, departmentColors.length);
    return departmentColors[colorIndex];
  };

  return (
    <Avatar
      sx={ { width: size, height: size, bgcolor: workspace.cropped_picture_blob ? cssVariables.contentWhiteColor : color(), fontSize: `${fontSize}px`, color: cssVariables.contentDarkColor, lineHeight: `${size}px` } }
      src={ workspace.cropped_picture_blob ? workspace.cropped_picture_blob.profile_picture_uploader_url : null }
      alt={ t`${workspace.name} logo` }
      className={ classNames("workspace-image-avatar", className) }
      { ...otherProps }
    >
      { initials() }
    </Avatar>
  );
};

WorkspaceImage.defaultProps = {
  className: "",
  size:      30,
  fontSize:  14
};

WorkspaceImage.propTypes = {
  workspace: PropTypes.object.isRequired,
  className: PropTypes.string,
  size:      PropTypes.number,
  fontSize:  PropTypes.number
};

export default WorkspaceImage;
