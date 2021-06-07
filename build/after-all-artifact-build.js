const { exec } = require("child_process");
const find = require("lodash/find");
const path = require("path");

exports.default = async function returnInTuneFiles(context) {
  console.log(context)
  const { outDir, artifactPaths } = context;

  const pkgPath = find(artifactPaths, (localPath) => localPath.includes(".pkg"));
  const exePath = find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));

  console.log("pkgPath", pkgPath);
  console.log("exePath", exePath);

  if (pkgPath) {
    const command = `${outDir.replace("dist", "build")}/IntuneAppUtil -c ${pkgPath} -o ${outDir}`;
    console.log("mac command", command);
    await exec(command);

    return [`${outDir}/${pkgPath}.intunemac`];
  }

  const exeFileName = path.basename(exePath);

  console.log("win command 1", `mkdir ${outDir}/intune-source`);
  await exec(`mkdir ${outDir}/intune-source`);
  console.log("win command 2", `copy /B /Y ${exePath} ${exePath.replace("dist", "dist/intune-source")}`);
  await exec(`copy /B /Y ${exePath} ${exePath.replace("dist", "dist/intune-source")}`);
  console.log("win command 3", `${outDir.replace("dist", "build")}/IntuneWinAppUtil.exe -c "${outDir}/intune-source" -s "${exeFileName}" -o ${outDir}`);
  await exec(`${outDir.replace("dist", "build")}/IntuneWinAppUtil.exe -c "${outDir}/intune-source" -s "${exeFileName}" -o ${outDir}`);

  return [`${outDir}/${exePath.gsub(".exe", "")}.intunewin`];
};
