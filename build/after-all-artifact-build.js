const { exec } = require("child_process");
const find = require("lodash/find");
const path = require("path");

exports.default = async function returnInTuneFiles(context) {
  const { outDir, artifactPaths } = context;

  const pkgPath = find(artifactPaths, (localPath) => localPath.includes(".pkg"));
  const exePath = find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));

  if (pkgPath) {
    const command = `${outDir.replace("dist", "build")}/IntuneAppUtil -c ${pkgPath} -o ${outDir}`;
    const result = await exec(command);
    console.log(command, result);

    return [`${outDir}/${pkgPath}.intunemac`];
  }

  const exeFileName = path.basename(exePath);

  const mkdirCommand = `mkdir "${outDir}\\intune-source"`;
  const { stdout, stderr } = await exec(mkdirCommand);
  console.log(mkdirCommand, stdout, stderr);

  const copyCommand = `copy /B /Y "${exePath}" "${exePath.replace("dist", "dist\\intune-source")}"`;
  const { stdout: stdout2, stderr: stderr2 } = await exec(copyCommand);
  console.log(copyCommand, stdout2, stderr2);

  const finalCommand = `${outDir.replace("dist", "build")}\\IntuneWinAppUtil.exe -c "${outDir}\\intune-source" -s "${exeFileName}" -o "${outDir}"`;
  const { stdout: stdout3, stderr: stderr3 } = await exec(finalCommand);
  console.log(finalCommand, stdout3, stderr3);

  return [`${exePath.replace(".exe", "")}.intunewin`];
};
