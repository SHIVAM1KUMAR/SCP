export default function ResetForm() {
    return (
      <div style={{ fontFamily: "'Outfit', sans-serif" }}>
        <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
          Reset Password
        </h5>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
          Enter your new password below.
        </p>
  
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            style={{ width: "100%", height: 42, padding: "0 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: "none" }}
            onFocus={e => (e.target.style.borderColor = "#1a6fa8")}
            onBlur={e  => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
  
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            style={{ width: "100%", height: 42, padding: "0 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: "none" }}
            onFocus={e => (e.target.style.borderColor = "#1a6fa8")}
            onBlur={e  => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
  
        <button
          type="button"
          style={{ width: "100%", height: 44, background: "linear-gradient(135deg, #1a6fa8, #0d4f82)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: "pointer" }}
        >
          Reset Password
        </button>
      </div>
    );
  }