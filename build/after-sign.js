require("dotenv").config({ path: ".after-sign.env" });

// eslint-disable-next-line import/no-extraneous-dependencies
const { notarize } = require("electron-notarize");
const { log } = require("builder-util");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  const appName = context.packager.appInfo.productFilename;

  if (electronPlatformName === "darwin") {
    log.info({ bundleId: "com.scribe-mail.scribe" }, "Notarizing mac app");
    notarize({
      tool:            "notarytool",
      appBundleId:     "com.scribe-mail.scribe",
      appPath:         `${appOutDir}/${appName}.app`,
      appleId:         process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId:          process.env.APPLE_TEAM_ID
    });
    log.info({ bundleId: "com.scribe-mail.scribe" }, "Mac app notarized");
    return true;
  }
};
