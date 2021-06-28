const childProcess = require("child_process");
const path = require("path");
const fs = require("fs");

exports.default = function (configuration) {
  const { SSL_USERNAME, SSL_PASSWORD, SSL_TOTP_SECRET, APPVEYOR_BUILD_FOLDER } = process.env;
  const fileName = path.basename(configuration.path);
  const filePath = path.dirname(configuration.path);

  childProcess.execSync(`if not exist "${APPVEYOR_BUILD_FOLDER}\\tmp\\files-to-sign" mkdir -p "${APPVEYOR_BUILD_FOLDER}\\tmp\\files-to-sign"`, { stdio: "inherit" });

  fs.renameSync(configuration.path, `${APPVEYOR_BUILD_FOLDER}/tmp/files-to-sign/${fileName}`);

  childProcess.execSync(
    `cd ${APPVEYOR_BUILD_FOLDER}\\CodeSignTool-v1.2.0-windows && CodeSignTool.bat sign -username=${SSL_USERNAME} -password="${SSL_PASSWORD}" -totp_secret="${SSL_TOTP_SECRET}" -input_file_path=${APPVEYOR_BUILD_FOLDER}\\tmp\\files-to-sign\\${fileName} -output_dir_path=${filePath}`,
    { stdio: "inherit" }
  );
};
