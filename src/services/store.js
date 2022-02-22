import Store                  from "electron-store";
import { isOutlookInstalled } from "services/signature_installation/outlook_mac";
import { promises as fs }     from "fs";

const store = new Store();

export const initRenderer = () => {
  Store.initRenderer();
};

export const initialize = (app) => {
  if (store.has("is_subscription_active")) {
    store.delete("is_subscription_active");
  }

  if (store.get("launch_at_startup") === undefined) {
    store.set("launch_at_startup", true);
  }

  // Mac settings
  if (process.platform === "darwin") {
    if (store.get("update_outlook") === undefined) {
      isOutlookInstalled().then((exists) => {
        store.set("update_outlook", exists);
      }).catch(() => {
        store.set("update_outlook", false);
      });
    }

    if (store.get("update_apple_mail") === undefined) {
      store.set("update_apple_mail", true);
    }

    if (store.get("using_icloud_drive") === undefined) {
      // eslint-disable-next-line string-to-lingui/missing-lingui-transformation
      const iCloudFolderPath = `${app.getPath("home")}/Library/Mobile\ Documents/com~apple~mail/Data`;
      fs.readdir(iCloudFolderPath).then(() => {
        store.set("using_icloud_drive", true);
      }).catch(() => {
        store.set("using_icloud_drive", false);
      });
    }
  }
};

export default store;
