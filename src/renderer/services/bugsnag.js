import Bugsnag from "@bugsnag/electron";

export const startBugsnag = (app, metadata, plugins = []) => {
  if (process.platform === "darwin") {
    Bugsnag.start({
      apiKey:               process.env.ELECTRON_WEBPACK_APP_BUGSNAG_API_KEY,
      appVersion:           app.getVersion(),
      enabledReleaseStages: ["production", "development"],
      releaseStage:         process.env.ELECTRON_WEBPACK_APP_ENV,
      metadata,
      plugins
    });
  }
};

export const setBugsnagUser = (id, email, name) => {
  if (process.platform === "darwin") {
    Bugsnag.setUser(id, email, name);
  }
};
