import Button from "../button/Button";

export function ConfirmModal({ student, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px", maxWidth: 380, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth={2} width={24} height={24}>
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
        </div>
        <h3 style={{ textAlign: "center", fontSize: 17, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Delete Student?</h3>
        <p style={{ textAlign: "center", fontSize: 13.5, color: "#64748b", lineHeight: 1.5, marginBottom: 24 }}>
          Are you sure you want to delete <strong>{student?.studentName}</strong>? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="outlined" onClick={onCancel} fullWidth>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} fullWidth>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
