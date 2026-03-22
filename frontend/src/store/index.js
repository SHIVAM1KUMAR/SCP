// ─── store/index.js ───────────────────────────────────────────────────────────
// AmniCare: Redux configureStore + persistStore + persistReducer
// EduAdmit: Re-exports all auth helpers — drop-in for import paths
//
// Replaces:
//   import { store, persistor } from "../store"          → not needed
//   import type { RootState }   from "../store"          → not needed
//   import type { AppDispatch } from "../store"          → not needed
//   useSelector((s: RootState) => s.auth)                → useAuthState()
// ─────────────────────────────────────────────────────────────────────────────

export { getAuth, setAuth, logout, isAuthenticated, updateAuth } from "./auth";

// ── useAuthState hook — replaces useSelector((s) => s.auth) everywhere ────────
// Usage:  const { name, role, email } = useAuthState();
//
// Note: this is NOT reactive (won't re-render on localStorage change within
// the same tab). For reactive updates, use the AuthContext below instead.
import { useState, useEffect } from "react";
import { getAuth } from "./auth";

export function useAuthState() {
  const [auth, setAuthState] = useState(() => getAuth());

  useEffect(() => {
    // Re-read on storage events (cross-tab sync)
    const handler = () => setAuthState(getAuth());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return auth;
}