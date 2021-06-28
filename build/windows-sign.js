const childProcess = require("child_process");

exports.default = async function (configuration) {
  const { SSL_USERNAME, SSL_PASSWORD, SSL_TOTP_SECRET } = process.env.SSL_USERNAME;

  childProcess.execSync(
    `CodeSignTool sign -username=${SSL_USERNAME} -password="${SSL_PASSWORD}" --totp_secret="${SSL_TOTP_SECRET}" -input_file_path=${configuration.path} -output_dir_path=${configuration.path}`,
    {
      stdio: "inherit"
    }
  );
};
