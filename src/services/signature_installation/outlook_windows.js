import { app }                              from "@electron/remote";
import { existsSync, mkdirSync, writeFile } from "fs";
import Registry                             from "rage-edit";

const updateDefaultSignatureInRegistry = (email, finalSignatureName) => {
  const keyPath = "HKCU\\Software\\Microsoft\\Office\\16.0\\Outlook\\Profiles\\Outlook\\9375CFF0413111d3B88A00104B2A6676";
  return new Promise((resolve, reject) => {
    for (let i = 1; i < 10; i++) {
      const keyName = `0000000${i}`;
      const localKeyPath = `${keyPath}\\${keyName}`;
      Registry.get(localKeyPath, "Account Name").then((value) => {
        if (value === email) {
          Registry.set(localKeyPath, "New Signature", finalSignatureName).then(() => {
            Registry.set(localKeyPath, "Reply-Forward Signature", finalSignatureName).then((response) => {
              resolve(response);
            }).catch((error) => {
              reject(error);
            });
          }).catch((error) => {
            reject(error);
          });
        }
      });
    }
  });
};

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
        updateDefaultSignatureInRegistry(email, finalSignatureName).then(() => {
          resolve();
        }).catch((error2) => {
          reject(error2);
        });
      }
    });
  });
};
