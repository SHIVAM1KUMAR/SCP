import { Navigate } from "react-router-dom";
import NotFound from "../pages/not-found/notFound";

// ─── NotFoundRoute ────────────────────────────────────────────────────────────
// AmniCare: Redux state.auth.isAuthenticated
// EduAdmit: localStorage token check — same logic, no Redux
// ─────────────────────────────────────────────────────────────────────────────

const NotFoundGate = () => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // Logged out → send to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Logged in → real 404
  return <NotFound />;
};

export const NotFoundRoute = {
  path: "*",
  element: <NotFoundGate />,
};