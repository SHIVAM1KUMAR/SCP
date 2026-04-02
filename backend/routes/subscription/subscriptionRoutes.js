import express from "express";
import {
  getSubscriptions,
  getSubscriptionById,
  getActiveSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../../controllers/subscription/subscriptionController.js";

const router = express.Router();

router.get("/active", getActiveSubscriptions);
router.get("/", getSubscriptions);
router.post("/", createSubscription);
router.get("/:id", getSubscriptionById);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

export default router;
