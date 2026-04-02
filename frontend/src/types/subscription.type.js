/**
 * @typedef {Object} SubscriptionFormValues
 * @property {string} subscriptionName
 * @property {string} subscriptionType
 * @property {string|number} months
 * @property {string|number} amount
 * @property {string} description
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} CollegeSubscriptionSelection
 * @property {string} subscriptionId
 * @property {string} paymentReceipt
 */

export const INITIAL_FORM_VALUES = {
  subscriptionName: "",
  subscriptionType: "Quarterly",
  months: 3,
  amount: "",
  description: "",
  isActive: true,
};

export const INITIAL_SELECTION_VALUES = {
  subscriptionId: "",
  paymentReceipt: null,
};

export const buildSubscriptionFormValues = (subscription) => {
  if (!subscription) return INITIAL_FORM_VALUES;

  return {
    ...INITIAL_FORM_VALUES,
    ...subscription,
    months: subscription.months ?? INITIAL_FORM_VALUES.months,
    amount: subscription.amount ?? "",
    isActive: subscription.isActive ?? true,
  };
};

export const getSubscriptionSelectionFromCollege = (college) => ({
  subscriptionId: college?.subscription?.subscriptionId || college?.subscriptionId || "",
  paymentReceipt:
    college?.documentFiles?.paymentReceipt?.url ||
    college?.documentFiles?.paymentReceipt?.path ||
    college?.documents?.paymentReceipt ||
    college?.paymentReceipt ||
    null,
});

export {};
