import { promises as fs, existsSync, mkdirSync } from "fs";
import Bugsnag                                   from "@bugsnag/electron";
import { app }                                   from "@electron/remote";
import plist                                     from "plist";
import store                                     from "services/store";
import findIndex                                 from "lodash/findIndex";
import { v4 as uuidv4 }                          from "uuid";

const sendFileListsToBugsnag = () => {
  const path = store.get("using_icloud_drive") ? `${app.getPath("home")}/Library/Mobile\ Documents/com~apple~mail/Data` : `${app.getPath("home")}/Library/Mail`;
  fs.readdir(path).then((files) => {
    Bugsnag.addMetadata("files", { using_icloud_drive: store.get("using_icloud_drive"), files });
    Bugsnag.notify(new Error("No folder for Apple Mail"));
    Bugsnag.clearMetadata("files");
  }).catch(() => {
    Bugsnag.addMetadata("files", { using_icloud_drive: store.get("using_icloud_drive"), files: "no-access" });
    Bugsnag.notify(new Error("No folder for Apple Mail"));
    Bugsnag.clearMetadata("files");
  });
};

const signatureName = (plistData, workspaceId, email) => {
  const oldName = `Scribe - ${email}`;
  const oldNameSignatureIndex = findIndex(plistData, (plistDataItem) => plistDataItem.SignatureName === oldName);
  if (oldNameSignatureIndex !== -1) {
    return oldName;
  }
  return `Scribe - ${email} - W${workspaceId}`;
};

const signatureDirectoryCandidates = () => {
  const directories = [];
  if (store.get("using_icloud_drive")) {
    [6, 5, 4, 3].forEach((version) => {
      directories.push(`${app.getPath("home")}/Library/Mobile Documents/com~apple~mail/Data/V${version}`);
    });
  } else {
    [9, 8, 7, 6, 5, 4, 3].forEach((version) => {
      directories.push(`${app.getPath("home")}/Library/Mail/V${version}/MailData`);
    });
  }
  return directories;
};

const getSignaturesFolder = async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const path of signatureDirectoryCandidates()) {
    let result = null;
    try {
      // eslint-disable-next-line no-await-in-loop
      result = await fs.opendir(path);
    } catch (error) {
      // eslint-disable-next-line no-continue
      continue;
    }
    return result.path;
    // eslint-disable-next-line no-unreachable
    break;
  }
};

const createAllSignatureFileIfNotExisting = (folderPath, path) => {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath);
  }
  if (!existsSync(path)) {
    const fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<array/>
</plist>`;
    return fs.writeFile(path, fileContent);
  }
};

const getSignatureFilePath = (folderPath, workspaceId, email) => (
  new Promise((resolve, reject) => {
    const allSignatureFilePath = `${folderPath}/Signatures/AllSignatures.plist`;
    createAllSignatureFileIfNotExisting(`${folderPath}/Signatures`, allSignatureFilePath);
    fs.readFile(allSignatureFilePath, "utf8").then((data) => {
      let signatureUid = null;
      const plistData = plist.parse(data);
      const existingSignatureIndex = findIndex(plistData, (plistDataItem) => plistDataItem.SignatureName === signatureName(plistData, workspaceId, email));
      if (existingSignatureIndex !== -1) {
        signatureUid = plistData[existingSignatureIndex].SignatureUniqueId;
      } else {
        signatureUid = uuidv4();
        plistData.push({
          SignatureIsRich:   true,
          SignatureName:     signatureName(plistData, workspaceId, email),
          SignatureUniqueId: signatureUid
        });
        fs.writeFile(allSignatureFilePath, plist.build(plistData), (writeFileError) => {
          reject(writeFileError);
        });
      }
      resolve(`${folderPath}/Signatures/${signatureUid}.mailsignature`);
    }).catch((error) => {
      reject(error);
    });
  })
);

const writeHtml = (path, html) => {
  const fileContent = `Content-Transfer-Encoding: 7bit
Content-Type: text/html;
charset=us-ascii
Message-Id: <${uuidv4()}>
Mime-Version: 1.0 (Mac OS X Mail 7.2 \\(1874\\))

${html}`;
  return fs.writeFile(path, fileContent);
};

export const installOnAppleMail = (workspaceId, email, html) => (
  new Promise((resolve, reject) => {
    getSignaturesFolder().then((folderPath) => {
      if (folderPath === undefined) {
        sendFileListsToBugsnag();
        reject();
      } else {
        getSignatureFilePath(folderPath, workspaceId, email).then((filePath) => {
          writeHtml(filePath, html).then(() => {
            resolve();
          }).catch((error) => {
            Bugsnag.notify(error);
            reject(error);
          });
        });
      }
    });
  })
);
