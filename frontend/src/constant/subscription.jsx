export const SUBSCRIPTION_TYPES = ["Quarterly", "Half Yearly", "Yearly", "Custom"];

export const SUBSCRIPTION_TYPE_META = {
  Quarterly: {
    label: "Quarterly",
    months: 3,
    description: "3 month subscription",
  },
  "Half Yearly": {
    label: "Half Yearly",
    months: 6,
    description: "6 month subscription",
  },
  Yearly: {
    label: "Yearly",
    months: 12,
    description: "12 month subscription",
  },
  Custom: {
    label: "Custom",
    months: null,
    description: "Create your own plan",
  },
};

export const SUBSCRIPTION_TYPE_OPTIONS = SUBSCRIPTION_TYPES;

export const PRESET_SUBSCRIPTION_MONTHS = {
  Quarterly: 3,
  "Half Yearly": 6,
  Yearly: 12,
};

export const DEFAULT_UPI_ID = import.meta.env.VITE_UPI_ID || "college@upi";

export const buildSubscriptionDisplayName = (subscription = {}) =>
  subscription.subscriptionName ||
  subscription.displayName ||
  `${subscription.months || 0} Month Plan`;

export const buildSubscriptionAmountLabel = (subscription = {}) =>
  `₹${Number(subscription?.amount || 0).toLocaleString("en-IN")}`;
