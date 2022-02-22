import React           from "react";
import { ipcRenderer } from "electron";
import { Trans, t }    from "@lingui/macro";
import { Helmet }      from "react-helmet";

import "./using_icloud.scss";

import Screenshot1 from "images/icloud-drive/1.png";
import Screenshot2 from "images/icloud-drive/2.png";

const HelpUsingIcloud = () => {
  const openSystemPreferences = (event) => {
    event.preventDefault();
    ipcRenderer.send("open-preferences");
  };

  return (
    <div className="help-page">
      <Helmet>
        <title>{ t`Am I using iCloud Drive for Mail - Scribe` }</title>
      </Helmet>
      <h1 className="mb-3"><Trans>Am I using iCloud Drive for Mail?</Trans></h1>
      <h2 className="mb-2">1. <a href="#" onClick={ openSystemPreferences }><Trans>Open system preferences</Trans></a></h2>
      <h2 className="mb-2">2. <Trans>Go to Apple ID then iCloud</Trans></h2>
      <h2 className="mb-4">3. <Trans>If iCloud Drive is checked, click on options</Trans></h2>
      <div className="ml-2 mb-4">
        <img src={ Screenshot1 } alt={ t`iCloud Drive checked screenshot` } width="450px" />
      </div>
      <h2 className="mb-4">4. <Trans>I there is a checkmark next to email, you are using iCloud Drive for Mail</Trans></h2>
      <div className="ml-2 mb-4">
        <img src={ Screenshot2 } alt={ t`iCloud Drive for Mail checked screenshot` } width="450px" />
      </div>
    </div>
  );
};

export default HelpUsingIcloud;
