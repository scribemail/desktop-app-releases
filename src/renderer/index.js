import React                from "react";
import ReactDOM             from "react-dom";
import ApplicationContainer from "renderer/components/application/container";
import jquery               from "jquery";
import SessionProvider      from "renderer/contexts/session/provider";
import TimeAgo              from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";

import "bootstrap";
import "renderer/styles/application.scss";

TimeAgo.addDefaultLocale(en);

window.jQuery = jquery;
window.$ = jquery;

const RootComponent = () => (
  <SessionProvider>
    <ApplicationContainer />
  </SessionProvider>
);

ReactDOM.render(<RootComponent />, document.getElementById("app"));
