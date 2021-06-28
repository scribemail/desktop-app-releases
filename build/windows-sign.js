const childProcess = require("child_process");

exports.default = async function (configuration) {
  const { SSL_USERNAME, SSL_PASSWORD, SSL_TOTP_SECRET, APPVEYOR_BUILD_FOLDER } = process.env;

  childProcess.execSync(`cd ${APPVEYOR_BUILD_FOLDER} && dir`, {
    stdio: "inherit"
  });

  childProcess.execSync(
    `${APPVEYOR_BUILD_FOLDER}\\CodeSignTool-v1.2.0-windows\\CodeSignTool.bat sign -username=${SSL_USERNAME} -password="${SSL_PASSWORD}" --totp_secret="${SSL_TOTP_SECRET}" -input_file_path=${configuration.path} -output_dir_path=${configuration.path}`,
    {
      stdio: "inherit"
    }
  );
};
