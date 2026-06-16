/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCounselling } from "../../../hooks/useCounselling";
import { useSupport } from "../../../hooks/useSupport";
import { useToast } from "../../../context/ToastContext";
import { getAuth } from "../../../store/slice/auth.slice";

const BellIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} width={20} height={20}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const BackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><polyline points="15 18 9 12 15 6" /></svg>;
const CheckAllIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><polyline points="1 12 5 16 13 8" /><polyline points="9 12 13 16 21 8" /></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BANNER_STYLES = {
  info: { background: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
  warning: { background: "#fffbeb", border: "#fde68a", color: "#92400e" },
  error: { background: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
  success: { background: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
};

function NotificationBanner({ type = "info", message, style = {} }) {
  const palette = BANNER_STYLES[type] || BANNER_STYLES.info;
  return (
    <div
      style={{
        padding: "11px 14px",
        background: palette.background,
        border: `1px solid ${palette.border}`,
        borderRadius: 9,
        fontSize: 13,
        color: palette.color,
        fontFamily: "'Outfit', sans-serif",
        lineHeight: 1.5,
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        ...style,
      }}
    >
      <span style={{ flexShrink: 0, marginTop: 1 }}>*</span>
      <span>{message}</span>
    </div>
  );
}

function NotificationMenuView({ badgeCount = null } = {}) {
  const toast = useToast();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [socketEnabled, setSocketEnabled] = useState(true);
  const auth = getAuth();
  const role = String(auth?.role || "").toLowerCase();
  const isSuperAdmin = role === "superadmin";
  const silentToast = useMemo(() => () => {}, []);

  const { notifications, unreadCount, fetchNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useCounselling({
    enableRealtime: socketEnabled,
    toast,
  });
  const { tickets: supportTickets } = useSupport({
    enableRealtime: socketEnabled && isSuperAdmin,
    toast: silentToast,
    loadTickets: isSuperAdmin,
    loadAlerts: false,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setSelected(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (notification.kind === "support") {
      setOpen(false);
      setSelected(null);
      navigate(`/superadmin/support/${notification.ticketId}`);
      return;
    }
    setSelected(notification);
    if (!notification.isRead) {
      await markNotificationRead(notification._id);
    }
  };

  const handleClear = async () => {
    await markAllNotificationsRead();
  };

  const handleClearAll = async () => {
    await clearNotifications();
    setSelected(null);
  };

  const supportNotificationItems = isSuperAdmin
    ? (supportTickets || [])
        .filter((ticket) => String(ticket.status || "").toLowerCase() === "open")
        .map((ticket) => ({
          _id: `support-${ticket._id}`,
          kind: "support",
          ticketId: ticket._id,
          title: `Support Ticket: ${ticket.subject || ticket.ticketNo || "New ticket"}`,
          message: `${ticket.creator?.name || ticket.creatorRole || "A user"} raised a support ticket${ticket.category ? ` in ${ticket.category}` : ""}.`,
          createdAt: ticket.createdAt,
          type: "support",
          category: ticket.category || "Support",
          recipientRole: "SuperAdmin",
          isRead: false,
        }))
    : [];

  const mergedNotifications = [...notifications.map((notification) => ({ ...notification, kind: "counselling" })), ...supportNotificationItems]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const visibleCount = unreadCount + supportNotificationItems.length;

  return (
    <div className="position-relative" ref={menuRef}>
      <button
        onClick={() => {
          setOpen((value) => !value);
          setSelected(null);
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: 6,
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          borderRadius: 8,
          transition: "transform 0.15s ease",
        }}
      >
        {badgeCount !== null ? (
          <BellIcon filled={badgeCount > 0} />
        ) : (
          <BellIcon filled={unreadCount > 0} />
        )}
        {(badgeCount !== null ? badgeCount : unreadCount) > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              background: "#e53e3e",
              color: "#fff",
              borderRadius: "50%",
              width: 17,
              height: 17,
              fontSize: 9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            {(badgeCount !== null ? badgeCount : unreadCount) > 9 ? "9+" : (badgeCount !== null ? badgeCount : unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 380,
            maxHeight: 480,
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e9f0",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            display: "flex",
            flexDirection: "column",
            zIndex: 2000,
            overflow: "hidden",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {!selected ? (
            <>
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f3f7", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>Notifications</span>
                  {(badgeCount !== null ? badgeCount : unreadCount) > 0 && (
                    <span style={{ background: "#1a6fa8", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>
                      {visibleCount > 9 ? "9+" : visibleCount}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {unreadCount > 0 && (
                    <button onClick={handleClear} style={actionButtonStyle}>
                      <CheckAllIcon /> Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll} style={actionButtonStyle}>
                      <TrashIcon /> Clear
                    </button>
                  )}
                  <button onClick={() => setSocketEnabled((value) => !value)} style={actionButtonStyle}>
                    {socketEnabled ? "Live" : "Offline"}
                  </button>
                </div>
              </div>

              <div style={{ overflowY: "auto", flex: 1 }}>
                {mergedNotifications.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", gap: 8 }}>
                    <BellIcon filled={false} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>No notifications</span>
                    <span style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>Nothing to display right now.</span>
                  </div>
                ) : (
                  mergedNotifications.map((notification, index) => (
                    <div key={notification._id || `${notification.title}-${index}`}>
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          cursor: "pointer",
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                          background: notification.kind === "support" ? "rgba(15,32,68,0.04)" : notification.isRead ? "transparent" : "rgba(26,111,168,0.05)",
                          borderLeft: `3px solid ${notification.kind === "support" ? "#0f2044" : notification.isRead ? "transparent" : "#1a6fa8"}`,
                          border: "none",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                      >
                        <div style={{ paddingTop: 4, flexShrink: 0 }}>
                          {!notification.isRead && notification.kind !== "support" ? (
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a6fa8" }} />
                          ) : notification.kind === "support" ? (
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0f2044" }} />
                          ) : (
                            <div style={{ width: 8, height: 8 }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: notification.isRead ? 500 : 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                              {notification.title || (notification.kind === "support" ? "Support Ticket" : "Counselling update")}
                            </span>
                            <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
                              {formatDateTime(notification.createdAt)}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {notification.message}
                          </span>
                          {notification.kind === "support" && (
                            <span style={{ display: "inline-flex", marginTop: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#0f2044", background: "#e8eef8", borderRadius: 999, padding: "3px 8px" }}>
                              Support
                            </span>
                          )}
                        </div>
                      </button>
                      {index < notifications.length - 1 && <hr style={{ margin: "0 16px", borderColor: "#f0f3f7", opacity: 0.6 }} />}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f0f3f7", flexShrink: 0 }}>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}>
                  <BackIcon />
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Notification Detail</span>
              </div>

              <div style={{ padding: 20, overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{selected.title || "Counselling update"}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #cbd5e1", color: "#334155", background: "#f8fafc" }}>
                    {selected.type || "info"}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, marginBottom: 16 }}>{selected.message}</p>
                <div style={{ display: "grid", gap: 12 }}>
                  <DetailLine label="Audience" value={selected.recipientRole} />
                  <DetailLine label="Category" value={selected.category || "-"} />
                  <DetailLine label="Created" value={formatDateTime(selected.createdAt)} />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DetailLine({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#1e293b" }}>{value || "-"}</div>
    </div>
  );
}

const actionButtonStyle = {
  background: "none",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  cursor: "pointer",
  color: "#1a6fa8",
  fontSize: 12,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 8px",
};

export default function NotificationMenu(props = {}) {
  const { message, type, style, badgeCount = null } = props;
  if (message !== undefined) {
    return <NotificationBanner type={type} message={message} style={style} />;
  }
  return <NotificationMenuView badgeCount={badgeCount} />;
}
