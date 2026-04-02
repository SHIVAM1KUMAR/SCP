import { useEffect, useMemo, useState } from "react";
import {
  addSubscription,
  deleteSubscription as apiDeleteSubscription,
  getSubscriptionById,
  getSubscriptions,
  updateSubscription,
} from "../api/subscriptionApi";

export function useSubscriptions(subscriptionId = null, toast = () => {}) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const isDetailMode = !!subscriptionId;

  const fetchSubscriptions = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getSubscriptions(params);
      setSubscriptions(Array.isArray(data?.data) ? data.data : data?.data || []);
      return data;
    } catch (error) {
      toast("Error fetching subscriptions", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async (id = subscriptionId) => {
    if (!id) return null;
    setSubscriptionLoading(true);
    try {
      const data = await getSubscriptionById(id);
      const record = data?.data || data?.subscription || data || null;
      setSubscription(record);
      return record;
    } catch (error) {
      setSubscription(null);
      return null;
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    if (isDetailMode) {
      fetchSubscription(subscriptionId);
    } else {
      fetchSubscriptions();
    }
  }, [subscriptionId]);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((item) => item.isActive !== false && item.isDeleted !== true),
    [subscriptions],
  );

  const registerSubscription = async (payload) => {
    const data = await addSubscription(payload);
    await fetchSubscriptions();
    return data;
  };

  const updateSubscriptionRecord = async ({ id, payload } = {}) => {
    if (!id) {
      throw new Error("Subscription ID is required");
    }
    const data = await updateSubscription(id, payload);
    await fetchSubscriptions();
    if (isDetailMode) {
      await fetchSubscription(subscriptionId);
    }
    return data;
  };

  const deleteSubscriptionAsync = async (id) => {
    setDeleting(id);
    try {
      const data = await apiDeleteSubscription(id);
      await fetchSubscriptions();
      if (isDetailMode && String(subscriptionId) === String(id)) {
        setSubscription(null);
      }
      toast(data?.message || "Subscription deleted", "warning");
      return data;
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Delete failed", "error");
      throw error;
    } finally {
      setDeleting(null);
    }
  };

  return {
    subscriptions,
    activeSubscriptions,
    subscription,
    loading,
    subscriptionLoading,
    saving,
    deleting,
    isLoadingSubscriptions: loading,
    isSubscriptionLoading: subscriptionLoading,
    isDeletingSubscription: !!deleting,
    fetchSubscriptions,
    fetchSubscription,
    registerSubscription,
    updateSubscription: updateSubscriptionRecord,
    deleteSubscription: deleteSubscriptionAsync,
    deleteSubscriptionAsync,
  };
}
