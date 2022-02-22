import React                    from "react";
import { askForFullDiskAccess } from "node-mac-permissions";
import { Trans, t }             from "@lingui/macro";
import { Helmet }               from "react-helmet";

import "./using_icloud.scss";

import Screenshot1 from "images/full-disk-access/1.png";
import Screenshot2 from "images/full-disk-access/2.png";

const HelpUsingIcloud = () => {
  const openSystemPreferences = (event) => {
    event.preventDefault();
    askForFullDiskAccess();
  };

  return (
    <div className="help-page">
      <Helmet>
        <title>{ t`Enable Full Disk Access - Scribe` }</title>
      </Helmet>
      <h1 className="mb-3"><Trans>Enable Full Disk Access</Trans></h1>
      <h2 className="mb-2">1. <a href="#" onClick={ openSystemPreferences }><Trans>Open system preferences</Trans></a></h2>
      <h2 className="mb-4">2. <Trans>Unlock your preferences</Trans></h2>
      <div className="ml-2 mb-4">
        <img src={ Screenshot1 } alt={ t`Full Disk Access unlock screenshot` } width="450px" />
      </div>
      <h2 className="mb-4">3. <Trans>Check the Scribe Application - The system will ask you to restart Scribe, do it.</Trans></h2>
      <div className="ml-2 mb-4">
        <img src={ Screenshot2 } alt={ t`Full Disk Access checked screenshot` } width="450px" />
      </div>
    </div>
  );
};

export default HelpUsingIcloud;
