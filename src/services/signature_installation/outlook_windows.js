/* eslint-disable string-to-lingui/missing-lingui-transformation */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { app }                              from "@electron/remote";
import { existsSync, mkdirSync, writeFile } from "fs";
import Bugsnag                              from "@bugsnag/electron";
import regedit                              from "services/regedit_renderer";

async function updateDefaultSignatureInRegistrySync(email, finalSignatureName) {
  const accountNames = [];
  let accountNameFound = false;

  const keyPath = "HKCU\\Software\\Microsoft\\Office\\16.0\\Outlook\\Profiles\\Outlook\\9375CFF0413111d3B88A00104B2A6676";
  const result = await regedit.promisified.list(keyPath);
  const keyResult = result[keyPath];
  const allKeysResult = await regedit.promisified.list(keyResult.keys.map((key) => `${keyPath}\\${key}`));
  for (const [key, content] of Object.entries(allKeysResult)) {
    if (content.values["Account Name"] && content.values["Account Name"].value === email) {
      await regedit.promisified.putValue({
        [key]: {
          "New Signature":           { value: finalSignatureName, type: "REG_SZ" },
          "Reply-Forward Signature": { value: finalSignatureName, type: "REG_SZ" }
        }
      });
      accountNameFound = true;
      break;
    } else {
      accountNames.push(content.values["Account Name"].value);
    }
  }
  if (!accountNameFound) {
    Bugsnag.addMetadata("data", { email, accountNames, result });
    Bugsnag.notify(new Error("Registry key not found"));
    Bugsnag.clearMetadata("data");
  }
}

export const installOnOutlookWindows = (workspaceId, id, email, html) => {
  const oldSignatureName = `Scribe - ${email}`;
  const signatureName = `Scribe - ${email} - W${workspaceId}`;
  const dirPath = `${app.getPath("home")}/appdata/roaming/Microsoft/Signatures`;

  const finalSignatureName = existsSync(`${dirPath}/${oldSignatureName}.htm`) ? oldSignatureName : signatureName;
  const finalSignatureFileName = `${finalSignatureName}.htm`;

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    writeFile(`${dirPath}/${finalSignatureFileName}`, `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />${html}`, (error) => {
      if (error) {
        reject(error);
      } else {
        try {
          updateDefaultSignatureInRegistrySync(email, finalSignatureName);
          resolve();
        } catch (updateRegistryError) {
          reject(updateRegistryError);
        }
      }
    });
  });
};
