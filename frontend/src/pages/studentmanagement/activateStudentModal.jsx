import { useState } from "react";
import BasicModal from "../../component/ui/modal/basicModal";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";

const ActivateStudentModal = ({
  student,
  onClose,
  onActivate,
  onReject,
  loading: externalLoading = false,
}) => {
  const [tab, setTab] = useState("activate");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!student) return null;

  const fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
  const busy = loading || externalLoading;

  const handleActivate = async () => {
    if (!student?._id) {
      setError("Student ID missing");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onActivate?.({ id: student._id, payload: {} });
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
      {tab === "activate" ? (
        <Button variant="success" onClick={handleActivate} disabled={busy}>
          {busy ? <Loader size={16} color="inherit" /> : null}
          {busy ? "Activating…" : "Activate"}
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
    <BasicModal open title="Activate Student" onClose={onClose} maxWidth="md" actions={actions}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h4 style={{ margin: 0, color: "#0f2044" }}>{fullName || "—"}</h4>
          <p style={{ margin: "4px 0", color: "#64748b" }}>
            {student.gender || "—"} • {student.category || "—"}
          </p>

          <div style={{ marginTop: 10, fontSize: 14, display: "grid", gap: 6 }}>
            <div><b>Email:</b> {student.email || "—"}</div>
            <div><b>Phone:</b> {student.phone || "—"}</div>
            <div>
              <b>Location:</b>{" "}
              {[student.address?.city, student.address?.state].filter(Boolean).join(", ") || "—"}
            </div>
            <div>
              <b>10th:</b> {student.tenthPercentage ? `${student.tenthPercentage}%` : "—"}
              &nbsp;&nbsp;
              <b>12th:</b> {student.twelfthPercentage ? `${student.twelfthPercentage}%` : "—"}
            </div>
            {student.entranceExamName && (
              <div>
                <b>{student.entranceExamName}:</b> {student.entranceExamScore || "—"}
                {student.entranceExamRank ? ` · AIR #${student.entranceExamRank}` : ""}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button
            variant={tab === "activate" ? "success" : "outlined"}
            onClick={() => setTab("activate")}
          >
            Activate
          </Button>
          <Button
            variant={tab === "reject" ? "danger" : "outlined"}
            onClick={() => setTab("reject")}
            style={tab === "reject" ? { background: "#dc2626", borderColor: "#dc2626", color: "#fff" } : undefined}
          >
            Reject
          </Button>
        </div>

        {tab === "activate" ? (
          <div style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", padding: 12, borderRadius: 8, fontSize: 14 }}>
            This will activate the student and send login credentials to:
            <br />
            <b>{student.email}</b>
          </div>
        ) : (
          <textarea
            placeholder="Enter rejection reason..."
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

export default ActivateStudentModal;
