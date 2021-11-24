import Store                                from "electron-store";
import map                                  from "lodash/map";
import { isSubscriptionActiveForWorkspace } from "services/workspaces";

const store = new Store();

if (store.has("is_subscription_active")) {
  store.delete("is_subscription_active");
}

export const setWorkspaces = (workspaces) => {
  store.set("workspaces", map(workspaces, (workspace) => { return { id: workspace, isSubscriptionActive: isSubscriptionActiveForWorkspace(workspace) }; }));
};

export default store;
