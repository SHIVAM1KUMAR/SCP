import { Navigate } from "react-router-dom";
import Unauthorized from "../pages/Unauthorized/Unauthorized";

// ─── UnAuthorizedRoute ────────────────────────────────────────────────────────
// AmniCare: Redux state.auth.isAuthenticated
// EduAdmit: localStorage token check — same logic, no Redux
// ─────────────────────────────────────────────────────────────────────────────

const UnauthorizedGate = () => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // Logged out → send to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Logged in → real 403
  return <Unauthorized />;
};

export const UnAuthorizedRoute = {
  path: "unauthorized",
  element: <UnauthorizedGate />,
};