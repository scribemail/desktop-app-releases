const { exec } = require("child_process");
const find = require("lodash/find");

exports.default = async function returnInTuneFiles(context) {
  const { appOutDir, packager, electronPlatformName } = context;
  const appVersion = packager.appInfo.productFilename;

  const pkgPath = find(context.artifactPaths, (localPath) => localPath.includes(".pkg"));
  const exePath = find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));

  console.log("pkgPath", pkgPath);
  console.log("exePath", exePath);

  if (electronPlatformName === "darwin") {
    const command = `${appOutDir.replace("dist", "build")}/IntuneAppUtil -c ${pkgPath} -o ${appOutDir}`;
    console.log("mac command", command);
    await exec(command);

    return [`${appOutDir}/${pkgPath}.intunemac`];
  }

  console.log("win command 1", `mkdir ${appOutDir}/intune-source`);
  await exec(`mkdir ${appOutDir}/intune-source`);
  console.log("win command 2", `copy /B /Y ${exePath} ${exePath.replace("dist", "dist/intune-source")}`);
  await exec(`copy /B /Y ${exePath} ${exePath.replace("dist", "dist/intune-source")}`);
  console.log("win command 3", `${appOutDir.replace("dist", "build")}/IntuneWinAppUtil.exe -c "${appOutDir}/intune-source" -s "${appOutDir}/Scribe Setup ${appVersion}.exe" -o ${appOutDir}`);
  await exec(`${appOutDir.replace("dist", "build")}/IntuneWinAppUtil.exe -c "${appOutDir}/intune-source" -s "${appOutDir}/Scribe Setup ${appVersion}.exe" -o ${appOutDir}`);

  return [`${appOutDir}/${exePath.gsub(".exe", "")}.intunemac`];
};
