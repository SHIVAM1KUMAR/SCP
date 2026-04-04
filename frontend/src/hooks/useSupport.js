import { useEffect, useMemo, useCallback, useState } from "react";
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

const apiPatch = async (url, payload = {}) => {
  const { data } = await axiosInstance.patch(url, payload, {
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

export function useSupport({ enableRealtime = false, toast = () => {}, loadTickets = true, loadAlerts = true } = {}) {
  const auth = getAuth();
  const [tickets, setTickets] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [contact, setContact] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const unreadCount = useMemo(() => alertCount, [alertCount]);

  const fetchTickets = useCallback(async (params = {}) => {
    if (!loadTickets) return [];
    setLoadingTickets(true);
    try {
      const data = await apiGet(`/support${toQueryString(params)}`);
      const list = Array.isArray(data?.data) ? data.data : data?.data || [];
      setTickets(list);
      return list;
    } catch (error) {
      toast(error?.response?.data?.message || "Error fetching support tickets", "error");
      return [];
    } finally {
      setLoadingTickets(false);
    }
  }, [loadTickets, toast]);

  const fetchTicketById = useCallback(async (id) => {
    setLoadingTicket(true);
    try {
      const data = await apiGet(`/support/${id}`);
      const record = data?.data || null;
      setTicket(record);
      return record;
    } catch (error) {
      toast(error?.response?.data?.message || "Error fetching support ticket", "error");
      setTicket(null);
      return null;
    } finally {
      setLoadingTicket(false);
    }
  }, [toast]);

  const fetchAlertCount = useCallback(async () => {
    if (!loadAlerts) return 0;
    if (String(auth?.role || "").toLowerCase() !== "superadmin") return 0;
    setLoadingAlerts(true);
    try {
      const data = await apiGet("/support/alerts");
      const count = Number(data?.data?.alertCount || 0);
      setAlertCount(Number.isNaN(count) ? 0 : count);
      return count;
    } catch {
      return 0;
    } finally {
      setLoadingAlerts(false);
    }
  }, [auth?.role, loadAlerts]);

  const fetchSupportContact = useCallback(async () => {
    try {
      const data = await apiGet("/support/contact");
      const record = data?.data || null;
      setContact(record);
      return record;
    } catch {
      setContact(null);
      return null;
    }
  }, []);

  const createSupportTicket = useCallback(async (payload = {}) => {
    try {
      const data = await apiPost("/support", payload);
      toast(data?.message || "Support ticket created", "success");
      await fetchTickets();
      await fetchAlertCount();
      return data?.data || data;
    } catch (error) {
      toast(error?.response?.data?.message || "Failed to create support ticket", "error");
      return null;
    }
  }, [fetchAlertCount, fetchTickets, toast]);

  const updateSupportTicketStatus = useCallback(async (id, payload = {}) => {
    const targetId = id?._id || id;
    if (!targetId) return null;
    setUpdatingStatus(targetId);
    try {
      const data = await apiPatch(`/support/${targetId}/status`, payload);
      toast(data?.message || "Support ticket updated", "success");
      await fetchTickets();
      await fetchAlertCount();
      if (ticket?._id && String(ticket._id) === String(targetId)) {
        setTicket(data?.data || null);
      }
      return data?.data || data;
    } catch (error) {
      toast(error?.response?.data?.message || "Failed to update support ticket", "error");
      return null;
    } finally {
      setUpdatingStatus(null);
    }
  }, [fetchAlertCount, fetchTickets, ticket, toast]);

  const updateSupportTicket = useCallback(async (id, payload = {}) => {
    const targetId = id?._id || id;
    if (!targetId) return null;
    try {
      const data = await apiPut(`/support/${targetId}`, payload);
      toast(data?.message || "Support ticket updated", "success");
      await fetchTickets();
      if (ticket?._id && String(ticket._id) === String(targetId)) {
        setTicket(data?.data || null);
      }
      return data?.data || data;
    } catch (error) {
      toast(error?.response?.data?.message || "Failed to update support ticket", "error");
      return null;
    }
  }, [fetchTickets, ticket, toast]);

  const deleteSupportTicket = useCallback(async (id) => {
    const targetId = id?._id || id;
    if (!targetId) return null;
    try {
      const data = await apiDelete(`/support/${targetId}`);
      toast(data?.message || "Support ticket deleted", "warning");
      await fetchTickets();
      if (ticket?._id && String(ticket._id) === String(targetId)) {
        setTicket(null);
      }
      return data;
    } catch (error) {
      toast(error?.response?.data?.message || "Failed to delete support ticket", "error");
      return null;
    }
  }, [fetchTickets, ticket, toast]);

  useEffect(() => {
    if (loadTickets) {
      void fetchTickets();
    }
    if (loadAlerts) {
      void fetchAlertCount();
    }
    void fetchSupportContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTickets, loadAlerts]);

  useEffect(() => {
    if (!enableRealtime || !auth?.token) return undefined;

    const socket = io(getApiRoot(), {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_support", {
        role: auth.role,
        collegeId: auth.collegeId,
        studentId: auth.id || auth.userMasterId,
      });
    });

    socket.on("support_ticket_created", (payload) => {
      if (loadTickets) {
        setTickets((prev) => [payload, ...prev.filter((item) => String(item._id) !== String(payload._id))]);
      }
      if (loadAlerts && String(auth?.role || "").toLowerCase() === "superadmin") {
        setAlertCount((prev) => prev + 1);
      }
    });

    socket.on("support_ticket_updated", (payload) => {
      if (loadTickets) {
        setTickets((prev) =>
          prev.map((item) => (String(item._id) === String(payload._id) ? { ...item, ...payload } : item)),
        );
      }
      if (loadAlerts && String(auth?.role || "").toLowerCase() === "superadmin") {
        void fetchAlertCount();
      }
      if (ticket?._id && String(ticket._id) === String(payload._id)) {
        setTicket((prev) => ({ ...prev, ...payload }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [auth?.collegeId, auth?.id, auth?.role, auth?.token, auth?.userMasterId, enableRealtime, loadAlerts, loadTickets]);

  return {
    tickets,
    ticket,
    contact,
    alertCount,
    unreadCount,
    loadingTickets,
    loadingTicket,
    loadingAlerts,
    updatingStatus,
    fetchTickets,
    fetchTicketById,
    fetchSupportContact,
    fetchAlertCount,
    createSupportTicket,
    updateSupportTicket,
    deleteSupportTicket,
    updateSupportTicketStatus,
    setTickets,
    setTicket,
    setAlertCount,
  };
}
