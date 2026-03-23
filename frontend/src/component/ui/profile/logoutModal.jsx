import BasicModal from "../modal/basicModal";
import Button from "../button/Button";

// ─── LogoutModal ──────────────────────────────────────────────────────────────
// AmniCare: MUI Button + Typography + BasicModal
// EduAdmit: Our BasicModal + Bootstrap Button — exact same props API
// ─────────────────────────────────────────────────────────────────────────────

const LogoutModal = ({ open, onClose, onLogout }) => {
  return (
    <BasicModal
      open={open}
      onClose={onClose}
      title="Confirm Logout"
      maxWidth="xs"
      actions={
        <div style={{ display: "flex", gap: 12, width: "100%", justifyContent: "flex-end" }}>
          <button 
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
            onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(220, 38, 38, 0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.2)";
            }}
          >
            Logout
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0" }}>
        <div style={{ background: "#fee2e2", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2.5} width={24} height={24}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <p style={{ fontSize: 15, color: "#334155", fontFamily: "'Outfit', sans-serif", margin: 0, textAlign: "center", fontWeight: 500 }}>
          Are you sure you want to end your session?
        </p>
        <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'Outfit', sans-serif", margin: "8px 0 0 0", textAlign: "center" }}>
          You will need to sign in again to access your dashboard.
        </p>
      </div>
    </BasicModal>
  );
};

export default LogoutModal;