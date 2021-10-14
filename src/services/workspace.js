export const isSubscriptionActive = (workspace) => (
  (workspace && workspace.subscription && workspace.subscription.active) || workspace.app_sumo_subscription
);
