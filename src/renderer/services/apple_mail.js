import { promises as fs } from "fs";
import { remote }         from "electron";
import log                from "electron-log";
import plist              from "plist";
import findIndex          from "lodash/findIndex";
import { v4 as uuidv4 }   from "uuid";

const { app } = remote;

const signatureName = (email) => (
  `Scribe - ${email}`
);

const signatureDirectoryCandidates = () => {
  const directories = [];
  [6, 5, 4, 3].forEach((version) => {
    directories.push(`${app.getPath("home")}/Library/Mobile Documents/com~apple~mail/Data/V${version}/Signatures`);
  });
  [8, 7, 6, 5, 4, 3].forEach((version) => {
    directories.push(`${app.getPath("home")}/Library/Mail/V${version}/MailData/Signatures`);
  });
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

const getSignatureFilePath = (folderPath, email) => (
  new Promise((resolve, reject) => {
    const allSignatureFilePath = `${folderPath}/AllSignatures.plist`;
    fs.readFile(allSignatureFilePath, "utf8").then((data) => {
      let signatureUid = null;
      const plistData = plist.parse(data);
      const existingSignatureIndex = findIndex(plistData, (plistDataItem) => plistDataItem.SignatureName === signatureName(email));
      if (existingSignatureIndex !== -1) {
        signatureUid = plistData[existingSignatureIndex].SignatureUniqueId;
      } else {
        signatureUid = uuidv4();
        plistData.push({
          SignatureIsRich:   true,
          SignatureName:     signatureName(email),
          SignatureUniqueId: signatureUid
        });
        fs.writeFile(allSignatureFilePath, plist.build(plistData), (writeFileError) => {
          log.error(`writeFileError ${writeFileError}`);
          reject(writeFileError);
        });
      }
      resolve(`${folderPath}/${signatureUid}.mailsignature`);
    }).catch((error) => {
      log.error(`OpeningAllSignatureFile ${error}`);
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

export const updateSignatureForEmail = (email, html) => {
  getSignaturesFolder().then((folderPath) => {
    getSignatureFilePath(folderPath, email).then((filePath) => {
      writeHtml(filePath, html).catch((error) => {
        log.error(`writeSignatureFileError ${error}`);
      });
    });
  });
};
