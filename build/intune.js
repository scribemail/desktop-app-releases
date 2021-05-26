require("dotenv").config({ path: ".intune.env" });

const path = require("path");
const { exec } = require("child_process");
const find = require("lodash/find");

exports.default = async function generateInTuneFiles(context) {
  const { electronPlatformName } = context;
  const pkgPath = find(context.artifactPaths, (localPath) => localPath.includes(".pkg"));
  const exePath = find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));
  const exeFileName = path.basename(exePath);
  const windowsDirName = __dirname.replace(/\//g, "\\");

  return new Promise((resolve, reject) => {
    if (electronPlatformName === "darwin") {
      exec(`${__dirname}/IntuneAppUtil -c ${pkgPath} -o ${__dirname}/../dist`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve([`${pkgPath}.intunemac`]);
        }
      });
    } else {
      // const command = `\\\\Mac\\Host\\${windowsDirName}\\IntuneWinAppUtil.exe -c \\\\Mac\\Host\\${windowsDirName.replace("build", "dist")} -s '${exeFileName}' -o \\\\Mac\\Host\\${windowsDirName.replace("build", "dist")}`;
      // exec(`prlctl exec ${process.env.VM_ID} --current-user ${command}`, (error) => {
      //   if (error) {
      //     reject(error);
      //   } else {
      //     resolve([`${pkgPath}.intunewin`]);
      //   }
      // });
    }
  });
};
