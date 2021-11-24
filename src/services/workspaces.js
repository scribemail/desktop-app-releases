export const isSubscriptionActiveForWorkspace = (workspace) => (
  (workspace && workspace.subscription && workspace.subscription.active && !workspace.subscription.too_much_seats) || (workspace.app_sumo_subscription && !workspace.app_sumo_subscription.too_much_seats)
);
