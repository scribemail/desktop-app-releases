import Store from "electron-store";

const store = new Store();

if (store.has("is_subscription_active")) {
  store.delete("is_subscription_active");
}

export default store;
