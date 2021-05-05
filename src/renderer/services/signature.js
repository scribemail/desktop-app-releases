import { getSignatureRawHtml } from "renderer/requests/signature";
import store                   from "renderer/services/store";
import fs                      from "fs";
import { remote }              from "electron";

const { app } = remote;

const writeFileForSignature = (email, html) => {
  if (process.platform === "darwin") {
    // const signatureFileName = `Scribe - ${email}.html`;
    // fs.writeFile(`${app.getPath("home")}/Library/Group Containers/UBF8T346G9.Office/Outlook/Outlook 15 Profiles/Main Profile/Data/Signatures/159/${signatureFileName}`, html, (err) => {
    //   if (err) {
    //     return;
    //   }
    // });
  }
  if (process.platform === "win32") {
    const signatureFileName = `Scribe - ${email}.htm`;
    fs.writeFile(`${app.getPath("home")}/appdata/roaming/Microsoft/Signatures/${signatureFileName}`, html, (err) => {
      if (err) {

      }
    });
  }
};

export const updateSignature = (id, email, callback) => {
  getSignatureRawHtml(id).then((response) => {
    writeFileForSignature(email, response.data.raw_html);
    store.set(`signature_updates.${id}`, Date.now());
    if (callback) {
      callback();
    }
  });
};
