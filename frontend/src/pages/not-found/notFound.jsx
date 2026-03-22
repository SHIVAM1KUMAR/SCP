import { Link } from "react-router-dom";

// ─── NotFound ─────────────────────────────────────────────────────────────────
// AmniCare: MUI Paper + Stack + Typography + Button (RouterLink)
// EduAdmit: Plain div + Bootstrap button + React Router Link
// ─────────────────────────────────────────────────────────────────────────────

export default function NotFound() {
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {/* 404 in red (mirrors color="error") */}
          <span style={{ fontSize: 24, fontWeight: 700, color: "#e53e3e" }}>404</span>
          <span style={{ fontSize: 14, color: "#64748b" }}>—</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>Page Not Found</span>
        </div>

        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link
          to="/"
          className="btn btn-primary"
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8, textDecoration: "none" }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}