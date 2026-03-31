import { useEffect, useState } from "react";
import BasicModal from "../modal/basicModal";
import Button from "../button/Button";

const PaymentReviewModal = ({
  college,
  open = false,
  onClose,
  onActivate,
  onReject,
  loading: externalLoading = false,
}) => {
  const [tab, setTab] = useState("activate");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const collegeId = college?._id;

  useEffect(() => {
    if (!open) return;
    setTab("activate");
    setRejectionReason("");
    setError("");
  }, [open, collegeId]);

  if (!open || !college) return null;

  const isBusy = loading || externalLoading;

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
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onReject?.({
        id: college._id,
        payload: { rejectionReason },
      });
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicModal
      open={open}
      title="Review Payment"
      onClose={onClose}
      maxWidth="md"
      disableClose={isBusy}
      actions={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          {tab === "activate" ? (
            <Button variant="success" onClick={handleActivate} loading={isBusy}>
              {isBusy ? "Activating..." : "Activate"}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={handleReject}
              loading={isBusy}
              style={{ background: "#dc2626", color: "#fff", border: "1px solid #dc2626" }}
            >
              {isBusy ? "Rejecting..." : "Reject"}
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            background: "#f8fafc",
            padding: 14,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
          }}
        >
          <h4 style={{ margin: 0, color: "#0f172a", fontSize: 16, fontWeight: 700 }}>
            {college.collegeName}
          </h4>
          <p style={{ margin: "4px 0", color: "#64748b", fontSize: 13 }}>
            {college.collegeCode} - {college.collegeType}
          </p>
          <div style={{ marginTop: 10, fontSize: 13.5, color: "#334155", lineHeight: 1.7 }}>
            <div><b>Email:</b> {college.email}</div>
            <div><b>Phone:</b> {college.phone || "-"}</div>
            <div>
              <b>Location:</b> {[college.address?.city, college.address?.state].filter(Boolean).join(", ") || "-"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setTab("activate")}
            style={tabButton(tab === "activate", "#16a34a")}
          >
            Activate
          </button>
          <button
            type="button"
            onClick={() => setTab("reject")}
            style={tabButton(tab === "reject", "#dc2626")}
          >
            Reject
          </button>
        </div>

        {tab === "activate" ? (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              padding: 12,
              borderRadius: 10,
              fontSize: 14,
              color: "#14532d",
            }}
          >
            This will activate the college and send login credentials to:
            <br />
            <b>{college.email}</b>
          </div>
        ) : (
          <textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            style={textareaStyle}
          />
        )}

        {error && (
          <p style={{ margin: 0, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
            {error}
          </p>
        )}
      </div>
    </BasicModal>
  );
};

const tabButton = (active, color) => ({
  flex: "1 1 160px",
  padding: "10px 14px",
  borderRadius: 10,
  border: active ? "none" : "1px solid #dbe4f0",
  background: active ? color : "#fff",
  color: active ? "#fff" : "#334155",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Outfit', sans-serif",
});

const textareaStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #dbe4f0",
  minHeight: 96,
  fontFamily: "'Outfit', sans-serif",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  resize: "vertical",
};

export default PaymentReviewModal;
