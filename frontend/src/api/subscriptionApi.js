import axiosInstance from "./axiosInstance";

const toQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
};

export const getSubscriptions = async (params = {}) => {
  const { data } = await axiosInstance.get(`/subscriptions${toQueryString(params)}`);
  return data;
};

export const getSubscriptionById = async (id) => {
  const { data } = await axiosInstance.get(`/subscriptions/${id}`);
  return data;
};

export const addSubscription = async (subscriptionData) => {
  const { data } = await axiosInstance.post("/subscriptions", subscriptionData);
  return data;
};

export const updateSubscription = async (id, subscriptionData) => {
  const { data } = await axiosInstance.put(`/subscriptions/${id}`, subscriptionData);
  return data;
};

export const deleteSubscription = async (id) => {
  const { data } = await axiosInstance.delete(`/subscriptions/${id}`);
  return data;
};
