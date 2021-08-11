import Bugsnag from "@bugsnag/electron";

export const startBugsnag = (app, metadata, plugins = []) => {
  Bugsnag.start({
    apiKey:               process.env.ELECTRON_WEBPACK_APP_BUGSNAG_API_KEY,
    appVersion:           app.getVersion(),
    enabledReleaseStages: ["production"],
    releaseStage:         process.env.ELECTRON_WEBPACK_APP_ENV,
    metadata,
    plugins
  });
};

export const setBugsnagUser = (id, email, name) => {
  Bugsnag.setUser(id, email, name);
};
