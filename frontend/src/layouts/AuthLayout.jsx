import { Outlet } from "react-router-dom";

// ─── AuthLayout ───────────────────────────────────────────────────────────────
// AmniCare: MUI Box with minHeight="100dvh"
// EduAdmit: Plain div — exact same behaviour, zero MUI dependency
// ─────────────────────────────────────────────────────────────────────────────

const AuthLayout = () => {
  return (
    <div style={{ minHeight: "100dvh", width: "100%", overflow: "hidden" }}>
      <Outlet />
    </div>
  );
};

export default AuthLayout;