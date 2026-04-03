import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import axiosInstance from "../api/axiosInstance";
import { getAuth } from "../store/slice/auth.slice";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getApiRoot = () => {
  const base = axiosInstance.defaults.baseURL || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
  if (!base) return window.location.origin;

  try {
    return new URL(base, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
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

const apiPatch = async (url, payload = {}) => {
  const { data } = await axiosInstance.patch(url, payload, {
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

export function useCounselling({ enableRealtime = false, toast = () => {} } = {}) {
  const auth = getAuth();
  const [counsellors, setCounsellors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [studentDashboard, setStudentDashboard] = useState(null);
  const [loadingCounsellors, setLoadingCounsellors] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const fetchCounsellors = async (params = {}) => {
    setLoadingCounsellors(true);
    try {
      const data = await apiGet(`/counselling/counsellors${toQueryString(params)}`);
      const list = Array.isArray(data?.data) ? data.data : data?.data || [];
      setCounsellors(list);
      return list;
    } finally {
      setLoadingCounsellors(false);
    }
  };

  const fetchCounsellorById = async (id) => {
    const data = await apiGet(`/counselling/counsellors/${id}`);
    return data?.data || null;
  };

  const fetchSessions = async (params = {}) => {
    setLoadingSessions(true);
    try {
      const data = await apiGet(`/counselling/sessions${toQueryString(params)}`);
      const list = Array.isArray(data?.data) ? data.data : data?.data || [];
      setSessions(list);
      return list;
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchSessionById = async (id) => {
    const data = await apiGet(`/counselling/sessions/${id}`);
    return data?.data || null;
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await apiGet("/counselling/notifications");
      const list = Array.isArray(data?.data) ? data.data : data?.data || [];
      setNotifications(list);
      return list;
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchStudentDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const data = await apiGet("/counselling/student-dashboard");
      const dashboard = data?.data || null;
      setStudentDashboard(dashboard);
      return dashboard;
    } finally {
      setLoadingDashboard(false);
    }
  };

  const saveCounsellor = async ({ id, payload } = {}) => {
    const isEdit = !!id;
    const data = isEdit
      ? await apiPut(`/counselling/counsellors/${id}`, payload)
      : await apiPost("/counselling/counsellors", payload);
    await fetchCounsellors();
    toast(data?.message || (isEdit ? "Counsellor updated" : "Counsellor created"), "success");
    return data?.data || data;
  };

  const deleteCounsellor = async (id) => {
    const data = await apiDelete(`/counselling/counsellors/${id}`);
    await fetchCounsellors();
    toast(data?.message || "Counsellor deleted", "warning");
    return data;
  };

  const deleteSession = async (id) => {
    const data = await apiDelete(`/counselling/sessions/${id}`);
    await fetchSessions();
    toast(data?.message || "Session deleted", "warning");
    return data;
  };

  const saveSession = async ({ id, payload } = {}) => {
    const isEdit = !!id;
    const data = isEdit
      ? await apiPut(`/counselling/sessions/${id}`, payload)
      : await apiPost("/counselling/sessions", payload);
    await fetchSessions();
    toast(data?.message || (isEdit ? "Session updated" : "Session scheduled"), "success");
    return data?.data || data;
  };

  const markNotificationRead = async (id) => {
    const data = await apiPatch(`/counselling/notifications/${id}/read`, {});
    setNotifications((prev) =>
      prev.map((notification) => (String(notification._id) === String(id) ? { ...notification, isRead: true } : notification)),
    );
    return data;
  };

  const markAllNotificationsRead = async () => {
    const data = await apiPatch("/counselling/notifications/read-all", {});
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    return data;
  };

  const clearNotifications = async () => {
    const data = await apiDelete("/counselling/notifications/clear");
    setNotifications([]);
    return data;
  };

  useEffect(() => {
    if (!enableRealtime || !auth?.token) return undefined;

    const socket = io(getApiRoot(), {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_notifications", {
        role: auth.role,
        collegeId: auth.collegeId,
        studentId: auth.id || auth.userMasterId,
      });
    });

    socket.on("counselling_notification", (payload) => {
      setNotifications((prev) => [payload, ...prev.filter((item) => String(item._id) !== String(payload._id))]);
      if (payload?.message) {
        toast(payload.message, payload.type || "info");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [auth?.collegeId, auth?.id, auth?.role, auth?.token, auth?.userMasterId, enableRealtime, toast]);

  return {
    counsellors,
    sessions,
    notifications,
    studentDashboard,
    unreadCount,
    loadingCounsellors,
    loadingSessions,
    loadingNotifications,
    loadingDashboard,
    fetchCounsellors,
    fetchCounsellorById,
    fetchSessions,
    fetchSessionById,
    fetchNotifications,
    fetchStudentDashboard,
    saveCounsellor,
    deleteCounsellor,
    saveSession,
    deleteSession,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    setCounsellors,
    setSessions,
    setNotifications,
  };
}
