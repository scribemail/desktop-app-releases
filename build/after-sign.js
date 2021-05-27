require("dotenv").config({ path: ".after-sign.env" });

// const path = require("path");
// const { exec } = require("child_process");
// const find = require("lodash/find");

// eslint-disable-next-line import/no-extraneous-dependencies
const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  const appName = context.packager.appInfo.productFilename;
  // const appVersion = context.packager.appInfo.productFilename;

  if (electronPlatformName === "darwin") {
    // eslint-disable-next-line no-console
    console.log("Notarizing mac app");

    return notarize({
      appBundleId:     "com.scribe-mail.scribe",
      appPath:         `${appOutDir}/${appName}.app`,
      appleId:         process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      ascProvider:     process.env.APPLE_TEAM
    });

    // const pkgPath = `${appOutDir}/${appName}.pkg`;

    // const promise = new Promise((resolve, reject) => {
    //   // eslint-disable-next-line no-console
    //   console.log("Generating .intunemac file");
    //   const command = `${__dirname}/IntuneAppUtil -c ${pkgPath} -o ${__dirname.replace("build", "dist")}`;
    //   exec(command, (error) => {
    //     if (error) {
    //       reject(error);
    //     } else {
    //       resolve();
    //     }
    //   });
    // });

    // return promise;
  }

  // const exePath = false;// find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));
  // const promise = new Promise((resolve, reject) => {
  //   if (exePath) {
  //     // eslint-disable-next-line no-console
  //     console.log("Generating .intunewin file");
  //     const exeFileName = path.basename(exePath);
  //     const windowsDirName = __dirname.replace(/\//g, "\\");

  //     exec(`mkdir -p ${__dirname.replace("build", "dist")}/intune_source && cp '${__dirname.replace("build", "dist")}/${exeFileName}' '${__dirname.replace("build", "dist")}/intune_source/${exeFileName}'`);

  //     const command = `\\\\Mac\\Host\\${windowsDirName}\\IntuneWinAppUtil.exe -c \\\\Mac\\Host\\${windowsDirName.replace("build", "dist")}\\intune_source -s '${exeFileName}' -o \\\\Mac\\Host\\${windowsDirName.replace("build", "dist")}`;
  //     exec(`prlctl exec ${process.env.VM_ID} --current-user ${command}`, (error) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve();
  //       }
  //     });
  //   } else { resolve(); }
  // });

  // return promise;
};
