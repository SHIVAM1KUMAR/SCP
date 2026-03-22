import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";

// ─── TokenExpiryHandler ───────────────────────────────────────────────────────
// Monitors JWT expiry and auto-logs out the user when it expires.
// AmniCare used Redux dispatch(logout()) + notistack enqueueSnackbar.
// We use localStorage + our ToastContext instead.
//
// Place this inside <BrowserRouter> and <ToastProvider> in App.jsx:
//   <TokenExpiryHandler />
// ─────────────────────────────────────────────────────────────────────────────
const TokenExpiryHandler = () => {
  const navigate     = useNavigate();
  const toast        = useToast();
  const hasLoggedOut = useRef(false); // prevents double-logout

  const handleLogout = () => {
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast("Session expired. You have been logged out.", "warning");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Try to read exp from JWT payload
    let exp = null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      exp = payload.exp; // seconds since epoch
    } catch {
      // Not a JWT or malformed — skip expiry check
      return;
    }

    if (!exp) return;

    const msUntilExpiry = exp * 1000 - Date.now();

    // Already expired
    if (msUntilExpiry <= 0) {
      handleLogout();
      return;
    }

    // Schedule auto-logout at exact expiry time
    const timer = setTimeout(handleLogout, msUntilExpiry);
    return () => clearTimeout(timer);
  }, []); // runs once on mount — same as AmniCare's [token, exp] but from localStorage

  return null;
};

export default TokenExpiryHandler;