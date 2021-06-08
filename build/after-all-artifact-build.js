const { exec } = require("child_process");
const find = require("lodash/find");
const path = require("path");

exports.default = async function returnInTuneFiles(context) {
  const { outDir, artifactPaths } = context;

  const pkgPath = find(artifactPaths, (localPath) => localPath.includes(".pkg"));
  const exePath = find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));

  if (pkgPath) {
    const command = `${outDir.replace("dist", "build")}/IntuneAppUtil -c ${pkgPath} -o ${outDir}`;
    await exec(command);

    return [`${outDir}/${pkgPath}.intunemac`];
  }

  const exeFileName = path.basename(exePath);

  await exec(`mkdir ${outDir}/intune-source`);
  await exec(`copy /B /Y ${exePath} ${exePath.replace("dist", "dist/intune-source")}`);
  await exec(`${outDir.replace("dist", "build")}/IntuneWinAppUtil.exe -c "${outDir}/intune-source" -s "${exeFileName}" -o ${outDir}`);

  return [`${exePath.replace(".exe", "")}.intunewin`];
};
