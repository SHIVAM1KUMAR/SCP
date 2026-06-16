import { useEffect, useMemo, useState } from "react";
import RealTimeClock from "../clock/realtimeCLock";
import NotificationMenu from "../notification/notificationmenu";
import ProfileMenu from "../profile/profileMenu";
import { useSupport } from "../../../hooks/useSupport";

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED = 65;

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
    <line x1={3} y1={6} x2={21} y2={6} />
    <line x1={3} y1={12} x2={21} y2={12} />
    <line x1={3} y1={18} x2={21} y2={18} />
  </svg>
);

export default function AdminAppBar({ open, handleDrawerOpen }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960);
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const name = user.name || "User";
  const role = user.role || "";
  const email = user.email || "";
  const roleLower = String(role || "").toLowerCase();
  const isSuperAdmin = roleLower === "superadmin";

  const { alertCount: supportAlertCount, fetchAlertCount } = useSupport({
    enableRealtime: true,
    loadTickets: false,
    loadAlerts: isSuperAdmin,
  });

  useEffect(() => {
    if (isSuperAdmin) {
      void fetchAlertCount?.();
    }
  }, [fetchAlertCount, isSuperAdmin]);

  const leftOffset = isMobile ? 0 : (open ? DRAWER_WIDTH : DRAWER_COLLAPSED);
  const badgeCount = useMemo(
    () => (isSuperAdmin ? supportAlertCount : undefined),
    [isSuperAdmin, supportAlertCount],
  );

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: leftOffset,
        right: 0,
        height: 64,
        zIndex: 1100,
        background: "#ffffff",
        borderBottom: "1px solid #e5e9f0",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
        transition: "left 0.2s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, gap: 8 }}>
        {(!open || isMobile) && (
          <button
            onClick={handleDrawerOpen}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "#1a6fa8",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              borderRadius: 6,
            }}
            aria-label="open drawer"
          >
            <MenuIcon />
          </button>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: isMobile ? 120 : 320,
              }}
            >
              {name}
            </span>

            {!isMobile && role && (
              <span style={{ fontSize: 13, color: "#64748b", flexShrink: 0 }}>
                ({role})
              </span>
            )}
          </div>

          <RealTimeClock />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, flexShrink: 0 }}>
        <NotificationMenu badgeCount={badgeCount} />
        <ProfileMenu name={name} role={role} email={email} />
      </div>
    </header>
  );
}
