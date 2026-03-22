import { Link, useNavigate } from "react-router-dom";

// ─── Unauthorized ─────────────────────────────────────────────────────────────
// AmniCare: MUI Paper + Stack + Button (RouterLink + to={-1})
// EduAdmit: Plain div + React Router Link + useNavigate(-1)
//
// Note: AmniCare used `to={-1 as any}` to go back — we use useNavigate(-1)
// ─────────────────────────────────────────────────────────────────────────────

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f6f9",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          padding: 48,
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          border: "1px solid #e5e9f0",
          borderRadius: 12,
          backgroundColor: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {/* 403 title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {/* 403 in warning orange (mirrors color="warning.main") */}
          <span style={{ fontSize: 24, fontWeight: 700, color: "#d97706" }}>403</span>
          <span style={{ fontSize: 14, color: "#64748b" }}>—</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>Unauthorized</span>
        </div>

        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24, lineHeight: 1.6 }}>
          You don't have permission to access this page. Please contact an
          administrator or return to a safe location.
        </p>

        {/* Two action buttons (mirrors AmniCare's Stack direction="row") */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link
            to="/"
            className="btn btn-primary"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8, textDecoration: "none" }}
          >
            Go Home
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline-secondary"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8 }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;