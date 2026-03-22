import { Navigate, Outlet } from "react-router-dom";

// ─── PublicRoute ──────────────────────────────────────────────────────────────
// If user is already authenticated, redirect them away from public pages
// (e.g. login page). AmniCare used Redux; we use localStorage token.
// ─────────────────────────────────────────────────────────────────────────────
export const PublicRoute = () => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  if (isAuthenticated) {
    // Redirect to the role-appropriate home page
    const user = (() => {
      try { return JSON.parse(localStorage.getItem("user") || "{}"); }
      catch { return {}; }
    })();

    const role = user.role || "";
    if (role === "SuperAdmin") return <Navigate to="/superadmin/college" replace />;
    if (role === "Admin")      return <Navigate to="/admin/college"      replace />;
    return                            <Navigate to="/user/admissions"    replace />;
  }

  return <Outlet />;
};