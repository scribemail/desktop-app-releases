import { getSignatureRawHtml, createSignatureInstallation } from "requests/signature";
import store                                                from "services/store";
import { installOnOutlookMac }                              from "services/signature_installation/outlook_mac";
import { installOnAppleMail }                               from "services/signature_installation/apple_mail";
import os                                                   from "os";
import Bugsnag                                              from "@bugsnag/electron";
import { installOnOutlookWindows }                          from "services/signature_installation/outlook_windows";
import { app }                                              from "@electron/remote";

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

const writeFilesForSignature = (workspaceId, id, email, html) => {
  const promises = [];
  if (process.platform === "darwin") {
    if (store.get("update_outlook")) {
      const outlookMacPromise = new Promise((resolve, reject) => {
        installOnOutlookMac(workspaceId, email, html).then(() => {
          createSignatureInstallation(id, { email_client: "outlook_mac", device_name: getComputerName(), metadata: getMetaData() }).then(() => {
            resolve();
          }).catch((error) => {
            Bugsnag.notify(error);
            reject(error);
          });
        }).catch((error) => {
          Bugsnag.notify(error);
          reject(error);
        });
      });
      promises.push(outlookMacPromise);
    }
    if (store.get("update_apple_mail")) {
      const appleMailPromise = new Promise((resolve, reject) => {
        installOnAppleMail(workspaceId, email, html).then(() => {
          createSignatureInstallation(id, { email_client: "apple_mail", device_name: getComputerName(), metadata: getMetaData() }).then(() => {
            resolve();
          }).catch((error) => {
            Bugsnag.notify(error);
            reject(error);
          });
        }).catch((error) => {
          Bugsnag.notify(error);
          reject(error);
        });
      });
      promises.push(appleMailPromise);
    }
  }
  if (process.platform === "win32") {
    const outlookWindowsPromise = new Promise((resolve, reject) => {
      installOnOutlookWindows(workspaceId, id, email, html).then(() => {
        createSignatureInstallation(id, { email_client: "outlook_windows", device_name: getComputerName(), metadata: getMetaData() }).then(() => {
          resolve();
        }).catch((error) => {
          Bugsnag.notify(error);
          reject(error);
        });
      }).catch((error) => {
        Bugsnag.notify(error);
        reject(error);
      });
    });
    promises.push(outlookWindowsPromise);
  }

  return promises;
};

export const updateSignature = (workspaceId, id, email) => (
  new Promise((resolve, reject) => {
    getSignatureRawHtml(id).then((response) => {
      Promise.all(writeFilesForSignature(workspaceId, id, email, response.data.raw_html)).then(() => {
        resolve();
      }).catch(() => {
        reject();
      });
    }).catch(() => {
      reject();
    });
  })
);
