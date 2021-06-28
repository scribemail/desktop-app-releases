const childProcess = require("child_process");

exports.default = async function (configuration) {
  const { SSL_USERNAME, SSL_PASSWORD, SSL_TOTP_SECRET } = process.env;

  childProcess.execSync(
    `C:\\projects\\desktop-app\\CodeSignTool-v1.2.0-windows\\CodeSignTool sign -username=${SSL_USERNAME} -password="${SSL_PASSWORD}" --totp_secret="${SSL_TOTP_SECRET}" -input_file_path=${configuration.path} -output_dir_path=${configuration.path}`,
    {
      stdio: "inherit"
    }
  );
};
