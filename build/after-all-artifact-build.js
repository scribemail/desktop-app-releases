require("dotenv").config({ path: ".after-sign.env" });

const find = require("lodash/find");
const compact = require("lodash/compact");

exports.default = async function returnInTuneFiles(context) {
  const pkgPath = find(context.artifactPaths, (localPath) => localPath.includes(".pkg"));
  const exePath = find(context.artifactPaths, (localPath) => localPath.includes("Setup") && !localPath.includes("blockmap"));

  console.log(compact([pkgPath ? `${__dirname}/${pkgPath}.intunemac` : null, exePath ? `${__dirname}/${exePath.gsub(".exe", "")}.intunemac` : null]));
  return compact([pkgPath ? `${__dirname}/${pkgPath}.intunemac` : null, exePath ? `${__dirname}/${exePath.gsub(".exe", "")}.intunemac` : null]);
};
