const { log } = require("builder-util");
const { execSync } = require("child_process");
const find = require("lodash/find");
const path = require("path");

exports.default = async function returnInTuneFiles(context) {
  const { outDir, artifactPaths } = context;

  const pkgPath = find(artifactPaths, (localPath) => localPath.includes(".pkg"));
  const exePath = find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));

  if (pkgPath) {
    log.info({ preset: "react-cra" }, "Creating .intunemac file");
    const command = `${outDir.replace("dist", "build")}/IntuneAppUtil -c ${pkgPath} -o ${outDir}`;
    execSync(command, { stdio: "inherit" });
    log.info({ preset: "react-cra" }, ".intunemac file created");
    return [`${pkgPath}.intunemac`];
  }

  log.info({ preset: "react-cra" }, "Creating .intunewin file");
  const exeFileName = path.basename(exePath);

  const mkdirCommand = `mkdir "${outDir}\\intune-source"`;
  execSync(mkdirCommand, { stdio: "inherit" });

  const copyCommand = `copy /B /Y "${exePath}" "${exePath.replace("dist", "dist\\intune-source")}"`;
  execSync(copyCommand, { stdio: "inherit" });

  const finalCommand = `${outDir.replace("dist", "build")}\\IntuneWinAppUtil.exe -c "${outDir}\\intune-source" -s "${exeFileName}" -o "${outDir}"`;
  execSync(finalCommand, { stdio: "inherit" });

  log.info({ preset: "react-cra" }, ".intunewin file created");
  return [`${exePath.replace(".exe", "")}.intunewin`];
};
