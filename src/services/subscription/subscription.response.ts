export type SubscriptionDetails = {
  subscription: Subscription;
  pack: SubscriptionPack;
};

export type Subscription = {
  subscriptionId: string;
  packId: string;
  expiresAt: number;
};

export type SubscriptionPack = {
  privileges: string[];
};
