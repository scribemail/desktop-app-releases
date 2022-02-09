/* eslint-disable string-to-lingui/missing-lingui-transformation */
/* eslint-disable no-await-in-loop */
import { app }                              from "@electron/remote";
import { existsSync, mkdirSync, writeFile } from "fs";
import Bugsnag                              from "@bugsnag/electron";
import Registry                             from "rage-edit";

async function updateDefaultSignatureInRegistrySync(email, finalSignatureName) {
  const keyPath = "HKCU\\Software\\Microsoft\\Office\\16.0\\Outlook\\Profiles\\Outlook\\9375CFF0413111d3B88A00104B2A6676";
  const nextAccountId = await Registry.get(keyPath, "NextAccountId");
  const accountNames = [];
  let accountNameFound = false;
  for (let i = 1; i < nextAccountId; i += 1) {
    const keyName = `${i}`.padStart(8, "0");
    const localKeyPath = `${keyPath}\\${keyName}`;
    const accountName = await Registry.get(localKeyPath, "Account Name");
    if (accountName === email) {
      await Registry.set(localKeyPath, "New Signature", finalSignatureName);
      await Registry.set(localKeyPath, "Reply-Forward Signature", finalSignatureName);
      accountNameFound = true;
      break;
    } else {
      accountNames.push(accountName);
    }
  }
  if (!accountNameFound) {
    Bugsnag.notify({ email, accountNames });
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
