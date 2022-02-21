import Store              from "electron-store";
import { promises as fs } from "fs";

const store = new Store();

export const initRenderer = () => {
  Store.initRenderer();
};

export const initialize = () => {
  if (store.has("is_subscription_active")) {
    store.delete("is_subscription_active");
  }

  if (store.get("launch_at_startup") === undefined) {
    store.set("launch_at_startup", true);
  }

  if (store.get("update_outlook") === undefined) {
    store.set("update_outlook", true);
  }

  if (store.get("update_apple_mail") === undefined) {
    store.set("update_apple_mail", true);
  }

  if (store.get("using_icloud_drive") === undefined) {
    const iCloudFolderPath = `${app.getPath("home")}/Library/Mobile\ Documents/com~apple~mail/Data`;
    fs.readdir(iCloudFolderPath).then(() => {
      store.set("using_icloud_drive", true);
    }).catch(() => {
      store.set("using_icloud_drive", false);
    });
  }
};

export default store;
