import { useState } from "react";
import BasicModal from "../../component/ui/modal/basicModal";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";

const ReviewStudentModal = ({
  student,
  onClose,
  onApprove,
  onReject,
  loading: externalLoading = false,
}) => {
  const [tab, setTab] = useState("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!student) return null;

  const fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
  const busy = loading || externalLoading;

  const handleApprove = async () => {
    if (!student?._id) {
      setError("Student ID missing");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await onApprove?.({ id: student._id, payload: {} });
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onReject?.({ id: student._id, payload: { rejectionReason } });
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  const actions = (
    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
      <Button variant="outlined" onClick={onClose} disabled={busy}>
        Cancel
      </Button>
      {tab === "approve" ? (
        <Button variant="success" onClick={handleApprove} disabled={busy}>
          {busy ? <Loader size={16} color="inherit" /> : null}
          {busy ? "Approving…" : "Approve"}
        </Button>
      ) : (
        <Button
          variant="danger"
          onClick={handleReject}
          disabled={busy}
          style={{ background: "#dc2626", borderColor: "#dc2626", color: "#fff" }}
        >
          {busy ? <Loader size={16} color="inherit" /> : null}
          {busy ? "Rejecting…" : "Reject"}
        </Button>
      )}
    </div>
  );

  return (
    <BasicModal open title="Review Student Application" onClose={onClose} maxWidth="md" actions={actions}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#e8eef8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              🎓
            </div>
            <div style={{ minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: 15, color: "#0f2044" }}>{fullName || "Unnamed Student"}</h4>
              <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {student.email}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 13.5,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "6px 16px",
            }}
          >
            <div><b>Phone:</b> {student.phone || "—"}</div>
            <div><b>Gender:</b> {student.gender || "—"}</div>
            <div><b>Category:</b> {student.category || "—"}</div>
            <div><b>Location:</b> {[student.address?.city, student.address?.state].filter(Boolean).join(", ") || "—"}</div>
            <div><b>10th %:</b> {student.tenthPercentage ? `${student.tenthPercentage}%` : "—"}</div>
            <div><b>12th %:</b> {student.twelfthPercentage ? `${student.twelfthPercentage}%` : "—"}</div>
            {student.entranceExamName && (
              <div style={{ gridColumn: "1 / -1" }}>
                <b>{student.entranceExamName}:</b> {student.entranceExamScore || "—"}
                {student.entranceExamRank ? ` · AIR #${student.entranceExamRank}` : ""}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button
            variant={tab === "approve" ? "success" : "outlined"}
            onClick={() => setTab("approve")}
          >
            Approve
          </Button>
          <Button
            variant={tab === "reject" ? "danger" : "outlined"}
            onClick={() => setTab("reject")}
            style={tab === "reject" ? { background: "#dc2626", borderColor: "#dc2626", color: "#fff" } : undefined}
          >
            Reject
          </Button>
        </div>

        {tab === "approve" ? (
          <div style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", padding: 12, borderRadius: 8, fontSize: 14 }}>
            This will approve <strong>{fullName}</strong>'s application and notify them at:
            <br />
            <strong>{student.email}</strong>
          </div>
        ) : (
          <textarea
            placeholder="Enter rejection reason (required)…"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #dbe3ee",
              minHeight: 90,
              resize: "vertical",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              outline: "none",
            }}
          />
        )}

        {error ? <p style={{ color: "#dc2626", margin: 0, fontSize: 13 }}>{error}</p> : null}
      </div>
    </BasicModal>
  );
};

export default ReviewStudentModal;
