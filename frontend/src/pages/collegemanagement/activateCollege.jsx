import { useState } from "react";

const ActivateCollegeModal = ({
  college,
  onClose,
  onActivate,
  onReject,
}) => {
  const [tab, setTab] = useState("activate");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!college) return null;

  const handleActivate = async () => {
    setError("");
    setLoading(true);
    try {
      await onActivate({
        paymentAmount: Number(paymentAmount) || 0,
        paymentNote,
      });
      onClose();
    } catch (e) {
      setError(e.message || "Activation failed");
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
      await onReject({ rejectionReason });
      onClose();
    } catch (e) {
      setError(e.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">

          {/* Header */}
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title fw-semibold">Review College</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body pt-0">

            {/* College Info */}
            <div className="mb-4">
              <h6 className="fw-bold mb-1">{college.collegeName}</h6>
              <small className="text-muted">
                {college.collegeCode} • {college.collegeType}
              </small>
            </div>

            <div className="row g-3 mb-4 text-muted small">
              <div className="col-md-6">
                <div>Email</div>
                <div className="text-dark fw-medium">{college.email}</div>
              </div>
              <div className="col-md-6">
                <div>Phone</div>
                <div className="text-dark fw-medium">{college.phone || "-"}</div>
              </div>
              <div className="col-12">
                <div>Address</div>
                <div className="text-dark fw-medium">
                  {[
                    college.address?.street,
                    college.address?.city,
                    college.address?.state,
                  ].filter(Boolean).join(", ") || "-"}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${tab === "activate" ? "active" : ""}`}
                  onClick={() => { setTab("activate"); setError(""); }}
                >
                  Activate
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${tab === "reject" ? "active text-danger" : ""}`}
                  onClick={() => { setTab("reject"); setError(""); }}
                >
                  Reject
                </button>
              </li>
            </ul>

            {/* Activate Tab Content */}
            {tab === "activate" && (
              <>
                <div className="alert alert-success py-3">
                  Activating will create login credentials and send them to{" "}
                  <strong>{college.email}</strong>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Payment Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount (optional)"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Payment Note</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Add any note about payment (optional)"
                  />
                </div>
              </>
            )}

            {/* Reject Tab Content */}
            {tab === "reject" && (
              <>
                <div className="alert alert-danger py-3">
                  This action will permanently reject the college application.
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection"
                  />
                </div>
              </>
            )}

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger mt-3">{error}</div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 pt-0">
            <button
              className="btn btn-outline-secondary px-4"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            {tab === "activate" ? (
              <button
                className="btn btn-success px-4"
                onClick={handleActivate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Activating...
                  </>
                ) : (
                  "Activate"
                )}
              </button>
            ) : (
              <button
                className="btn btn-danger px-4"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Rejecting...
                  </>
                ) : (
                  "Reject"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateCollegeModal;