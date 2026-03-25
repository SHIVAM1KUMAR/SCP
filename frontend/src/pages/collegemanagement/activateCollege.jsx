import { useState } from "react";
import Loader from "../../component/ui/loader/Loader";

const ActivateCollegeModal = ({
  college,
  onClose,
  onActivate,
  onReject,
  loading: externalLoading = false,
}) => {
  const [tab, setTab] = useState("activate");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!college) return null;

  // ✅ ACTIVATE
  const handleActivate = async () => {
    if (!college?._id) {
      setError("College ID missing");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onActivate?.({
        id: college._id,
        payload: {},
      });
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ REJECT
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onReject?.({
        id: college._id,
        payload: { rejectionReason },
      });
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        
        {/* Header */}
        <div style={header}>
          <div>
            <h3 style={{ margin: 0 }}>Review College</h3>
            <p style={sub}>
              Verify details before approval
            </p>
          </div>
          <button onClick={onClose} disabled={loading || externalLoading} style={closeBtn}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {/* College Info */}
          <div style={card}>
            <h4 style={{ margin: 0 }}>{college.collegeName}</h4>
            <p style={{ margin: "4px 0", color: "#666" }}>
              {college.collegeCode} • {college.collegeType}
            </p>

            <div style={{ marginTop: 10, fontSize: 14 }}>
              <div><b>Email:</b> {college.email}</div>
              <div><b>Phone:</b> {college.phone || "-"}</div>
              <div>
                <b>Location:</b>{" "}
                {[college.address?.city, college.address?.state].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={tabs}>
            <button
              style={tabBtn(tab === "activate", "#16a34a")}
              onClick={() => setTab("activate")}
            >
              Activate
            </button>
            <button
              style={tabBtn(tab === "reject", "#dc2626")}
              onClick={() => setTab("reject")}
            >
              Reject
            </button>
          </div>

          {/* Content */}
          {tab === "activate" ? (
            <div style={successBox}>
              This will activate the college and send login credentials to:
              <br />
              <b>{college.email}</b>
            </div>
          ) : (
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={textarea}
            />
          )}

          {/* Error */}
          {error && <p style={errorStyle}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={footer}>
          <button onClick={onClose} style={cancelBtn}>
            Cancel
          </button>

          {tab === "activate" ? (
            <button onClick={handleActivate} disabled={loading || externalLoading} style={greenBtn}>
              {loading || externalLoading ? <Loader size={16} color="inherit" /> : null}
              {loading || externalLoading ? "Activating..." : "Activate"}
            </button>
          ) : (
            <button onClick={handleReject} disabled={loading || externalLoading} style={redBtn}>
              {loading || externalLoading ? <Loader size={16} color="inherit" /> : null}
              {loading || externalLoading ? "Rejecting..." : "Reject"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateCollegeModal;


/// 🎨 STYLES

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  width: "100%",
  maxWidth: 520,
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  overflow: "hidden",
};

const header = {
  padding: "16px 20px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
};

const sub = {
  margin: 0,
  fontSize: 12,
  color: "#777",
};

const closeBtn = {
  border: "none",
  background: "#f3f4f6",
  borderRadius: "50%",
  width: 30,
  height: 30,
  cursor: "pointer",
  fontSize: 18,
};

const card = {
  background: "#f9fafb",
  padding: 14,
  borderRadius: 10,
  marginBottom: 16,
};

const tabs = {
  display: "flex",
  gap: 10,
  marginBottom: 16,
};

const tabBtn = (active, color) => ({
  flex: 1,
  padding: "10px",
  borderRadius: 8,
  border: active ? "none" : "1px solid #ddd",
  background: active ? color : "#fff",
  color: active ? "#fff" : "#333",
  fontWeight: 600,
  cursor: "pointer",
});

const successBox = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  padding: 12,
  borderRadius: 8,
  fontSize: 14,
};

const textarea = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  minHeight: 90,
};

const footer = {
  padding: 16,
  borderTop: "1px solid #eee",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const cancelBtn = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#fff",
};

const greenBtn = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "none",
  background: "#16a34a",
  color: "#fff",
  fontWeight: 600,
};

const redBtn = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "none",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 600,
};

const errorStyle = {
  color: "red",
  marginTop: 10,
  fontSize: 13,
};
