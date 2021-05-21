import React                from "react";
import ReactDOM             from "react-dom";
import { remote }           from "electron";
import Bugsnag              from "@bugsnag/electron";
import ApplicationContainer from "renderer/components/application/container";
import jquery               from "jquery";
import SessionProvider      from "renderer/contexts/session/provider";
import TimeAgo              from "javascript-time-ago";
import { startBugsnag }     from "renderer/services/bugsnag";
import BugsnagPluginReact   from "@bugsnag/plugin-react";

import en from "javascript-time-ago/locale/en";

import "bootstrap";
import "renderer/styles/application.scss";

TimeAgo.addDefaultLocale(en);

window.jQuery = jquery;
window.$ = jquery;

const { app } = remote;

startBugsnag(app, { process: { name: "renderer" } }, [new BugsnagPluginReact()]);

const ErrorBoundary = Bugsnag.getPlugin("react").createErrorBoundary(React);

const RootComponent = () => (
  <ErrorBoundary>
    <SessionProvider>
      <ApplicationContainer />
    </SessionProvider>
  </ErrorBoundary>
);

ReactDOM.render(<RootComponent />, document.getElementById("app"));
