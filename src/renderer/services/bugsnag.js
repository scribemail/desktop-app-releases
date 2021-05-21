import Bugsnag from "@bugsnag/electron";
import log     from "electron-log";

export const startBugsnag = (app, metadata, plugins = []) => {
  log.info(metadata);
  Bugsnag.start({
    apiKey:               process.env.ELECTRON_WEBPACK_APP_BUGSNAG_API_KEY,
    appVersion:           app.getVersion(),
    enabledReleaseStages: ["production", "development"],
    releaseStage:         process.env.ELECTRON_WEBPACK_APP_ENV,
    metadata,
    plugins
  });
};
