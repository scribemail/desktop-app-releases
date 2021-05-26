require("dotenv").config({ path: ".intune.env" });

const path = require("path");
const { exec } = require("child_process");
const find = require("lodash/find");
const compact = require("lodash/compact");

exports.default = async function generateInTuneFiles(context) {
  const pkgPath = find(context.artifactPaths, (localPath) => localPath.includes(".pkg"));
  const exePath = false;// find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));

  const promise1 = new Promise((resolve, reject) => {
    if (exePath) {
      const exeFileName = path.basename(exePath);
      const windowsDirName = __dirname.replace(/\//g, "\\");

      exec(`mkdir -p ${__dirname.replace("build", "dist")}/intune_source && cp '${__dirname.replace("build", "dist")}/${exeFileName}' '${__dirname.replace("build", "dist")}/intune_source/${exeFileName}'`);

      const command = `\\\\Mac\\Host\\${windowsDirName}\\IntuneWinAppUtil.exe -c \\\\Mac\\Host\\${windowsDirName.replace("build", "dist")}\\intune_source -s '${exeFileName}' -o \\\\Mac\\Host\\${windowsDirName.replace("build", "dist")}`;
      exec(`prlctl exec ${process.env.VM_ID} --current-user ${command}`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(`${pkgPath}.intunewin`);
        }
      });
    } else { resolve(); }
  });

  const promise2 = new Promise((resolve, reject) => {
    if (pkgPath) {
      const command = `${__dirname}/IntuneAppUtil -c ${pkgPath} -o ${__dirname.replace("build", "dist")}`;
      exec(command, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(`${pkgPath}.intunemac`);
        }
      });
    } else { resolve(); }
  });

  const data = await Promise.all([promise1, promise2]);

  return compact(data);
};
