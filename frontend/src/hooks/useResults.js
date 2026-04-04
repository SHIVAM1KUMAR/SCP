import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

const apiGet = async (url, config = {}) => {
  const { data } = await axiosInstance.get(url, {
    ...config,
    headers: {
      ...getAuthHeaders(),
      ...(config.headers || {}),
    },
  });
  return data;
};

const apiPut = async (url, payload = {}) => {
  const { data } = await axiosInstance.put(url, payload, {
    headers: getAuthHeaders(),
  });
  return data;
};

export function useResults(toast = () => {}) {
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchResults = async (params = {}) => {
    setLoadingResults(true);
    try {
      const data = await apiGet(`/results${toQueryString(params)}`);
      const list = Array.isArray(data?.data) ? data.data : data?.data || [];
      setResults(list);
      return list;
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Error fetching results", "error");
      return [];
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchResultById = async (id) => {
    const data = await apiGet(`/results/${id}`);
    return data?.data || null;
  };

  const saveResult = async ({ id, payload } = {}) => {
    setSaving(true);
    try {
      const data = await apiPut(`/results/${id}`, payload);
      await fetchResults();
      toast(data?.message || "Result updated", "success");
      return data?.data || data;
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Failed to update result", "error");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    results,
    loadingResults,
    saving,
    fetchResults,
    fetchResultById,
    saveResult,
    setResults,
  };
}
