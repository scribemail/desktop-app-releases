require("dotenv").config({ path: ".after-sign.env" });
const { log } = require("builder-util");

// eslint-disable-next-line import/no-extraneous-dependencies
const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  const appName = context.packager.appInfo.productFilename;

  if (electronPlatformName === "darwin") {
    log.info({ preset: "react-cra" }, "Notarizing mac app");
    notarize({
      tool:            "notarytool",
      appBundleId:     "com.scribe-mail.scribe",
      appPath:         `${appOutDir}/${appName}.app`,
      appleId:         process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      // ascProvider:     process.env.APPLE_TEAM_ID
      teamId:          process.env.APPLE_TEAM_ID
    });
    log.info({ preset: "react-cra" }, "Mac app notarized");
    return true;
  }
};
