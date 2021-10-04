import Bugsnag from "@bugsnag/electron";

export const startBugsnag = (app, metadata, plugins = []) => {
  const defaultOptions = {
    metadata,
    plugins
  };
  let options = defaultOptions;
  if (metadata.process.name === "main") {
    options = {
      apiKey:               process.env.ELECTRON_WEBPACK_APP_BUGSNAG_API_KEY,
      appVersion:           app.getVersion(),
      enabledReleaseStages: ["production"],
      releaseStage:         process.env.ELECTRON_WEBPACK_APP_ENV,
      ...defaultOptions
    };
  }
  Bugsnag.start(options);
};

export const setBugsnagUser = (id, email, name) => {
  Bugsnag.setUser(id, email, name);
};
