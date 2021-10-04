import React                from "react";
import ReactDOM             from "react-dom";
import { app }              from "@electron/remote";
import Bugsnag              from "@bugsnag/electron";
import ApplicationContainer from "renderer/components/application/container";
import jquery               from "jquery";
import SessionProvider      from "renderer/contexts/session/provider";
import TimeAgo              from "javascript-time-ago";
import { startBugsnag }     from "services/bugsnag";
import BugsnagPluginReact   from "@bugsnag/plugin-react";

import "bootstrap";
import "renderer/styles/application.scss";

import { i18n }                             from "@lingui/core";
import { I18nProvider }                     from "@lingui/react";
import { en as enPlurals, fr as frPlurals } from "make-plural/plurals";
import { messages as enMessages }           from "locales/en/messages";
import { messages as frMessages }           from "locales/fr/messages";

import en from "javascript-time-ago/locale/en";

i18n.loadLocaleData("en", { plurals: enPlurals });
i18n.loadLocaleData("fr", { plurals: frPlurals });
i18n.load({ en: enMessages, fr: frMessages });
i18n.activate("en");

TimeAgo.addDefaultLocale(en);

window.jQuery = jquery;
window.$ = jquery;

startBugsnag(app, { process: { name: "renderer" } }, [new BugsnagPluginReact()]);

const ErrorBoundary = Bugsnag.getPlugin("react").createErrorBoundary(React);

const RootComponent = () => (
  <ErrorBoundary>
    <I18nProvider i18n={ i18n }>
      <SessionProvider>
        <ApplicationContainer />
      </SessionProvider>
    </I18nProvider>
  </ErrorBoundary>
);

ReactDOM.render(<RootComponent />, document.getElementById("app"));
