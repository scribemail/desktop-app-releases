import { getSignatureRawHtml, createSignatureInstallation } from "requests/signature";
import store                                                from "services/store";
import { updateSignatureForEmail }                          from "services/apple_mail";
import Bugsnag                                              from "@bugsnag/electron";
import { existsSync, mkdirSync, writeFile }                 from "fs";
import os                                                   from "os";
import { app }                                              from "@electron/remote";
import applescript                                          from "applescript";
import log                                                  from "electron-log";

const getOutlookAppleScript = (email, html) => {
  const signatureName = `Scribe - ${email}`;
  const signatureContent = html.replace(/"/g, "\\\"");
  return `
    tell application id "com.microsoft.Outlook"
      set signatureList to every signature whose name is "${signatureName}"
      if (count signatureList) is 0 then
        make new signature with properties { name: "${signatureName}", content: "${signatureContent}" }
      else
        set counter to 0
        repeat with signatureItem in signatureList
          set counter to counter + 1
          if counter is 1 then
          set the content of signatureItem to the "${signatureContent}"
          else
            delete signatureItem
          end if
        end repeat
      end if
    end tell
  `;
};

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

const writeFileForSignature = (id, email, html) => {
  if (process.platform === "darwin") {
    if (store.get("update_outlook")) {
      applescript.execString(getOutlookAppleScript(email, html), (err) => {
        if (err) {
          log.error(err);
        } else {
          createSignatureInstallation(id, { email_client: "outlook_mac", device_name: getComputerName(), metadata: getMetaData() }).catch(() => {});
        }
      });
    }
    if (store.get("update_apple_mail")) {
      updateSignatureForEmail(email, html).then(() => {
        createSignatureInstallation(id, { email_client: "apple_mail", device_name: getComputerName(), metadata: getMetaData() }).catch(() => {});
      }).catch((error) => {
        log.error(error);
      });
    }
  }
  if (process.platform === "win32") {
    const signatureFileName = `Scribe - ${email}.htm`;
    const dirPath = `${app.getPath("home")}/appdata/roaming/Microsoft/Signatures`;
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    writeFile(`${dirPath}/${signatureFileName}`, `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />${html}`, (err) => {
      if (err) {
        log.error(err);
        Bugsnag.notify(err);
      } else {
        createSignatureInstallation(id, { email_client: "outlook_windows", device_name: getComputerName(), metadata: getMetaData() }).catch((error) => {
          Bugsnag.notify(error);
        });
      }
    });
  }
};

export const updateSignature = (id, email, callback) => {
  getSignatureRawHtml(id).then((response) => {
    writeFileForSignature(id, email, response.data.raw_html);
    store.set(`signature_updates.${id}`, Date.now());
    if (callback) {
      callback();
    }
  });
};
