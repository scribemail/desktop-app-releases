import store from "services/store";
import { t } from "@lingui/macro";

export const clientNames = () => {
  if (process.platform === "win32") {
    return t`Outlook`;
  }
  if (store.get("update_apple_mail") && store.get("update_outlook")) {
    return t`Outlook and Apple Mail`;
  }
  if (store.get("update_outlook")) {
    return t`Outlook`;
  }
  return t`Apple Mail`;
};
