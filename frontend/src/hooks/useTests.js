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

const apiPost = async (url, payload = {}) => {
  const { data } = await axiosInstance.post(url, payload, {
    headers: getAuthHeaders(),
  });
  return data;
};

const apiPut = async (url, payload = {}) => {
  const { data } = await axiosInstance.put(url, payload, {
    headers: getAuthHeaders(),
  });
  return data;
};

const apiDelete = async (url) => {
  const { data } = await axiosInstance.delete(url, {
    headers: getAuthHeaders(),
  });
  return data;
};

export function useTests(toast = () => {}) {
  const [tests, setTests] = useState([]);
  const [studentDashboard, setStudentDashboard] = useState(null);
  const [testAttempt, setTestAttempt] = useState(null);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingAttempt, setLoadingAttempt] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTests = async (params = {}) => {
    setLoadingTests(true);
    try {
      const data = await apiGet(`/tests${toQueryString(params)}`);
      const list = Array.isArray(data?.data) ? data.data : data?.data || [];
      setTests(list);
      return list;
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Error fetching tests", "error");
      return [];
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchTestById = async (id) => {
    const data = await apiGet(`/tests/${id}`);
    return data?.data || null;
  };

  const fetchStudentDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const data = await apiGet("/tests/student-dashboard");
      const dashboard = data?.data || null;
      setStudentDashboard(dashboard);
      return dashboard;
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Error fetching tests", "error");
      return null;
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchTestAttempt = async (id) => {
    setLoadingAttempt(true);
    try {
      const data = await apiGet(`/tests/${id}/attempt`);
      const record = data?.data || null;
      setTestAttempt(record?.attempt || null);
      return record;
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Error fetching test attempt", "error");
      return null;
    } finally {
      setLoadingAttempt(false);
    }
  };

  const startTestAttempt = async (id) => {
    const data = await apiPost(`/tests/${id}/attempt/start`);
    const record = data?.data || null;
    setTestAttempt(record);
    return record;
  };

  const heartbeatTestAttempt = async (id, payload = {}) => {
    const data = await apiPost(`/tests/${id}/attempt/heartbeat`, payload);
    const record = data?.data || null;
    setTestAttempt(record);
    return record;
  };

  const submitTestAttempt = async (id, payload = {}) => {
    const data = await apiPost(`/tests/${id}/attempt/submit`, payload);
    const record = data?.data || null;
    setTestAttempt(record);
    await fetchStudentDashboard();
    return record;
  };

  const saveTest = async ({ id, payload } = {}) => {
    setSaving(true);
    try {
      const data = id
        ? await apiPut(`/tests/${id}`, payload)
        : await apiPost("/tests", payload);
      await fetchTests();
      toast(data?.message || (id ? "Test updated" : "Test scheduled"), "success");
      return data?.data || data;
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Failed to save test", "error");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (id) => {
    const data = await apiDelete(`/tests/${id}`);
    await fetchTests();
    toast(data?.message || "Test deleted", "warning");
    return data;
  };

  return {
    tests,
    studentDashboard,
    loadingTests,
    loadingDashboard,
    loadingAttempt,
    saving,
    testAttempt,
    fetchTests,
    fetchTestById,
    fetchStudentDashboard,
    fetchTestAttempt,
    startTestAttempt,
    heartbeatTestAttempt,
    submitTestAttempt,
    saveTest,
    deleteTest,
    setTests,
    setTestAttempt,
  };
}
