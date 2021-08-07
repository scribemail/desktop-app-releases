import { getSignatureRawHtml, createSignatureInstallation } from "renderer/requests/signature";
import store                                                from "renderer/services/store";
import { updateSignatureForEmail }                          from "renderer/services/apple_mail";
import fs                                                   from "fs";
import os                                                   from "os";
import { remote }                                           from "electron";
import applescript                                          from "applescript";
import log                                                  from "electron-log";

const { app } = remote;

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
    type:     os.type(),
    platform: os.platform(),
    arch:     os.arch(),
    release:  os.release()
  };
};

const writeFileForSignature = (id, email, html) => {
  if (process.platform === "darwin") {
    if (store.get("update_outlook")) {
      applescript.execString(getOutlookAppleScript(email, html), (err) => {
        if (err) {
          log.error(err);
        }
      });
      createSignatureInstallation(id, { email_client: "outlook_mac", device_name: getComputerName(), metadata: getMetaData() }).catch(() => {});
    }
    if (store.get("update_apple_mail")) {
      updateSignatureForEmail(email, html);
      createSignatureInstallation(id, { email_client: "apple_mail", device_name: getComputerName(), metadata: getMetaData() }).catch(() => {});
    }
  }
  if (process.platform === "win32") {
    const signatureFileName = `Scribe - ${email}.htm`;
    fs.writeFile(`${app.getPath("home")}/appdata/roaming/Microsoft/Signatures/${signatureFileName}`, `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />${html}`, (err) => {
      if (err) {
        log.error(err);
      }
    });
    createSignatureInstallation(id, { email_client: "outlook_windows", device_name: getComputerName(), metadata: getMetaData() }).catch(() => {});
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
