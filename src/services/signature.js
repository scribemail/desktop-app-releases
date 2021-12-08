import { getSignatureRawHtml, createSignatureInstallation } from "requests/signature";
import store                                                from "services/store";
import { installOnOutlookMac }                              from "services/signature_installation/outlook_mac";
import { installOnAppleMail }                               from "services/signature_installation/apple_mail";
import os                                                   from "os";
import Bugsnag                                              from "@bugsnag/electron";
import { installOnOutlookWindows }                          from "services/signature_installation/outlook_windows";
import { app }                                              from "@electron/remote";
import log                                                  from "electron-log";

const getComputerName = () => os.hostname();

const getMetaData = () => {
  return {
    os_type:     os.type(),
    os_platform: os.platform(),
    os_arch:     os.arch(),
    os_release:  os.release(),
    app_version: app.getVersion()
  };
};

const writeFileForSignature = (workspaceId, id, email, html) => {
  if (process.platform === "darwin") {
    if (store.get("update_outlook")) {
      installOnOutlookMac(workspaceId, email, html).then(() => {
        createSignatureInstallation(id, { email_client: "outlook_mac", device_name: getComputerName(), metadata: getMetaData() }).catch((error) => {
          Bugsnag.notify(error);
        });
      }).catch((error) => {
        log.error(error);
      });
    }
    if (store.get("update_apple_mail")) {
      installOnAppleMail(workspaceId, email, html).then(() => {
        createSignatureInstallation(id, { email_client: "apple_mail", device_name: getComputerName(), metadata: getMetaData() }).catch((error) => {
          Bugsnag.notify(error);
        });
      }).catch((error) => {
        log.error(error);
      });
    }
  }
  if (process.platform === "win32") {
    installOnOutlookWindows(workspaceId, id, email, html).then(() => {
      createSignatureInstallation(id, { email_client: "outlook_windows", device_name: getComputerName(), metadata: getMetaData() }).catch((error) => {
        Bugsnag.notify(error);
      });
    }).catch((error) => {
      Bugsnag.notify(error);
    });
  }
};

export const updateSignature = (workspaceId, id, email, callback) => {
  getSignatureRawHtml(id).then((response) => {
    writeFileForSignature(workspaceId, id, email, response.data.raw_html);
    store.set(`signature_updates.${id}`, Date.now());
    if (callback) {
      callback();
    }
  }).catch(() => {});
};
