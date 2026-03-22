import { Navigate, Outlet } from "react-router-dom";

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Redirects to login if user is not authenticated.
// AmniCare used Redux state.auth.isAuthenticated
// We use localStorage token (same logic, no Redux needed)
// ─────────────────────────────────────────────────────────────────────────────
export const ProtectedRoute = ({ redirectTo = "/login" }) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};