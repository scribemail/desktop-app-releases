export const isSubscriptionActive = (account) => (
  (account && account.subscription && account.subscription.active) || account.app_sumo_subscription
);
