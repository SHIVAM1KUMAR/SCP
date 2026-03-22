//import Logo from "../../assets/images/logo.png";

// ─── AuthCard ─────────────────────────────────────────────────────────────────
// Shared card wrapper used by ForgotPassword, ResetPassword, VerifyOtp
// Replaces the repeated MUI Box + Card + CardContent + Logo + Divider pattern
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthCard({ children }) {
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        backgroundColor: "#f4f6f9",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 16,
          border: "1px solid #e5e9f0",
          background: "#fff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            padding: "clamp(24px, 5vw, 48px)",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Branding */}
          <div style={{ textAlign: "center" }}>
            <img
              src={Logo}
              alt="EduAdmit Logo"
              onError={e => { e.target.style.display = "none"; }}
              style={{ height: 80, objectFit: "contain" }}
            />
            <hr style={{ marginTop: 16, borderColor: "#e5e9f0" }} />
          </div>

          {/* Form content */}
          {children}
        </div>
      </div>
    </div>
  );
}