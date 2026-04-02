import Subscription from "../../models/subscription/subscriptionModal.js";

const DEFAULT_SUBSCRIPTIONS = [
  {
    subscriptionName: "Quarterly",
    subscriptionType: "Quarterly",
    months: 3,
    amount: 3000,
    description: "3 month plan",
    isActive: true,
    isDefault: true,
  },
  {
    subscriptionName: "Half Yearly",
    subscriptionType: "Half Yearly",
    months: 6,
    amount: 6000,
    description: "6 month plan",
    isActive: true,
    isDefault: true,
  },
  {
    subscriptionName: "Yearly",
    subscriptionType: "Yearly",
    months: 12,
    amount: 12000,
    description: "12 month plan",
    isActive: true,
    isDefault: true,
  },
];

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeType = (value) => {
  const text = String(value || "").trim().toLowerCase();
  if (text === "quarterly") return "Quarterly";
  if (text === "half yearly" || text === "half-yearly" || text === "halfyearly") return "Half Yearly";
  if (text === "yearly" || text === "annual") return "Yearly";
  if (text === "custom") return "Custom";
  return "";
};

const buildDefaultName = (subscriptionType, months) => {
  if (subscriptionType === "Quarterly") return "Quarterly";
  if (subscriptionType === "Half Yearly") return "Half Yearly";
  if (subscriptionType === "Yearly") return "Yearly";
  return `${months || 0} Month Plan`;
};

const ensureDefaultSubscriptions = async () => {
  const activeCount = await Subscription.countDocuments({ isDeleted: { $ne: true } });
  if (activeCount > 0) return;
  await Subscription.insertMany(DEFAULT_SUBSCRIPTIONS);
};

const serializeSubscription = (subscription) => {
  if (!subscription) return null;
  const obj = subscription.toObject ? subscription.toObject() : { ...subscription };
  return {
    ...obj,
    displayName: obj.subscriptionName || buildDefaultName(obj.subscriptionType, obj.months),
  };
};

const normalizeSubscriptionSnapshot = async (subscriptionId) => {
  if (!subscriptionId) return null;
  const subscription = await Subscription.findOne({ _id: subscriptionId, isDeleted: { $ne: true } });
  if (!subscription) return null;

  return {
    subscriptionId: subscription._id,
    subscriptionName: subscription.subscriptionName,
    subscriptionType: subscription.subscriptionType,
    months: subscription.months,
    amount: subscription.amount,
  };
};

export const getSubscriptions = async (req, res) => {
  try {
    await ensureDefaultSubscriptions();

    const { search, status } = req.query;
    const query = { isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { subscriptionName: { $regex: search, $options: "i" } },
        { subscriptionType: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "Active") {
      query.isActive = true;
    } else if (status === "Inactive") {
      query.isActive = false;
    }

    const subscriptions = await Subscription.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: subscriptions.map(serializeSubscription) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getActiveSubscriptions = async (req, res) => {
  try {
    await ensureDefaultSubscriptions();
    const subscriptions = await Subscription.find({ isDeleted: { $ne: true }, isActive: true }).sort({ months: 1, amount: 1 });
    return res.json({ success: true, data: subscriptions.map(serializeSubscription) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    return res.json({ success: true, data: serializeSubscription(subscription) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const subscriptionType = normalizeType(req.body.subscriptionType);
    const months = toNumber(req.body.months);
    const amount = toNumber(req.body.amount);
    const subscriptionName = String(req.body.subscriptionName || "").trim() || buildDefaultName(subscriptionType, months);

    if (!subscriptionType) {
      return res.status(400).json({ success: false, message: "Subscription type is required" });
    }
    if (!months || months < 1) {
      return res.status(400).json({ success: false, message: "Subscription months are required" });
    }
    if (amount === null || amount < 0) {
      return res.status(400).json({ success: false, message: "Subscription amount is required" });
    }

    const existing = await Subscription.findOne({ subscriptionName, isDeleted: { $ne: true } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Subscription name already exists" });
    }

    const subscription = await Subscription.create({
      subscriptionName,
      subscriptionType,
      months,
      amount,
      description: String(req.body.description || "").trim(),
      isActive: req.body.isActive !== undefined ? String(req.body.isActive) === "true" || req.body.isActive === true : true,
      isDefault: false,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: serializeSubscription(subscription),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    const subscriptionType = normalizeType(req.body.subscriptionType || subscription.subscriptionType);
    const months = toNumber(req.body.months ?? subscription.months);
    const amount = toNumber(req.body.amount ?? subscription.amount);
    const nextName = String(req.body.subscriptionName || "").trim() || buildDefaultName(subscriptionType, months);

    if (!subscriptionType) {
      return res.status(400).json({ success: false, message: "Subscription type is required" });
    }
    if (!months || months < 1) {
      return res.status(400).json({ success: false, message: "Subscription months are required" });
    }
    if (amount === null || amount < 0) {
      return res.status(400).json({ success: false, message: "Subscription amount is required" });
    }

    subscription.subscriptionName = nextName;
    subscription.subscriptionType = subscriptionType;
    subscription.months = months;
    subscription.amount = amount;
    subscription.description = req.body.description !== undefined ? String(req.body.description || "").trim() : subscription.description;
    if (req.body.isActive !== undefined) {
      subscription.isActive = String(req.body.isActive) === "true" || req.body.isActive === true;
    }

    await subscription.save();

    return res.json({
      success: true,
      message: "Subscription updated successfully",
      data: serializeSubscription(subscription),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true },
    );

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    return res.json({ success: true, message: "Subscription deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export { normalizeSubscriptionSnapshot };
