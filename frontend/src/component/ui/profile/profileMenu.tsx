import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import LogoutModal from "./logoutModal";   // ← lowercase 'l' matches your actual filename

// ─── ProfileMenu ──────────────────────────────────────────────────────────────
// AmniCare: MUI Avatar + Menu + MenuItem + Redux dispatch(logout()) + notistack
// EduAdmit: Custom avatar dropdown + localStorage + useToast
// ─────────────────────────────────────────────────────────────────────────────

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}>
    <circle cx={12} cy={12} r={3} />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1={21} y1={12} x2={9} y2={12} />
  </svg>
);

const MENU_ITEMS = [
  {
    key:    "account-settings",
    label:  "Account Settings",
    icon:   <SettingsIcon />,
    action: "account-settings",
    url:    "account-settings",
  },
];

import React from 'react';

interface ProfileMenuProps {
  name: string;
  role?: string;
  email: string;
}

export default function ProfileMenu({ name, role, email }: ProfileMenuProps) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const toast      = useToast();
const menuRef = useRef<HTMLDivElement>(null);

  const [open,       setOpen]       = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const profilePicUrl = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.profilePicUrl || null;
    } catch {
      return null;
    }
  }, []);

  const initial     = name?.charAt(0)?.toUpperCase() || "U";
  const lastSegment = location.pathname.split("/").filter(Boolean).pop();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

const [menuItemHover, setMenuItemHover] = useState<'account-settings' | 'logout' | null>(null);

const handleMenuAction = useCallback((action) => {
  setOpen(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase();

  if (action === "account-settings") {
    navigate(`/${role}/account-settings`); // ✅ FIXED
  }

  if (action === "logout") {
    setLogoutOpen(true);
  }
}, [navigate]);

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast("Logout successfully", "success");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="position-relative" ref={menuRef}>

        {/* Avatar button */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={`Profile menu for ${name}`}
          aria-expanded={open}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "50%" }}
        >
          {(profilePicUrl && !hasImageError) ? (
            <img
              src={profilePicUrl}
              alt={`${name}'s profile`}
              onError={() => setHasImageError(true)}
              loading="lazy"
              style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #e5e9f0" }}
            />
          ) : (
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, #1a6fa8, #0d4f82)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 15,
              fontFamily: "'Outfit', sans-serif",
              border: "1.5px solid #e5e9f0",
            }}>
              {initial}
            </div>
          )}
        </button>

        {/* Dropdown panel */}
        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            minWidth: 230, background: "#fff",
            borderRadius: 10, border: "1px solid #e5e9f0",
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            zIndex: 2000, overflow: "hidden",
            fontFamily: "'Outfit', sans-serif",
          }}>

            {/* User info */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f3f7" }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1e293b" }}>{name}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{email}</div>
              {role && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                  background: "#e8f4fd", color: "#1a6fa8", border: "1px solid #b3d9f2",
                  display: "inline-block", marginTop: 4,
                }}>
                  {role}
                </span>
              )}
            </div>

            {/* Menu items */}
{MENU_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => handleMenuAction(item.action as 'account-settings' | 'logout')}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "10px 16px",
    background: lastSegment === 'account-settings' 
      ? "#f0f7ff" 
      : menuItemHover === 'account-settings' 
        ? "#f8fafc" 
        : "none",
                  border: "none", cursor: "pointer",
                  fontSize: 13.5, color: "#374151",
                  fontFamily: "'Outfit', sans-serif",
                  textAlign: "left", transition: "background 0.13s",
                }}
                onMouseEnter={() => setMenuItemHover('account-settings' as const)}
                onMouseLeave={() => setMenuItemHover(null)}
              >
                <span style={{ color: "#64748b" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}

            <hr style={{ margin: "4px 0", borderColor: "#f0f3f7" }} />

            {/* Logout */}
            <button
              onClick={() => handleMenuAction("logout")}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 16px",
                background: menuItemHover === "logout" ? "#fff5f5" : "none",
                border: "none", cursor: "pointer", fontSize: 13.5,
                color: "#e53e3e", fontFamily: "'Outfit', sans-serif",
                textAlign: "left", transition: "background 0.13s",
              }}
              onMouseEnter={() => setMenuItemHover("logout")}
              onMouseLeave={() => setMenuItemHover(null)}
              aria-label="Logout"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Logout confirmation modal */}
      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLogout={handleLogoutConfirm}
      />
    </>
  );
}