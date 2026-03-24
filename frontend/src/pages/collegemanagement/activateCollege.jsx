import { useState } from "react";

// ─── ActivateCollegeModal ─────────────────────────────────────────────────────
// Props:
//   college    — college object
//   onClose    — fn
//   onActivate — fn({ paymentAmount, paymentNote }) → Promise
//   onReject   — fn({ rejectionReason }) → Promise
// ─────────────────────────────────────────────────────────────────────────────

export default function ActivateCollegeModal({ college, onClose, onActivate, onReject }) {
  const [tab,             setTab]             = useState("activate"); // "activate" | "reject"
  const [paymentAmount,   setPaymentAmount]   = useState("");
  const [paymentNote,     setPaymentNote]     = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  if (!college) return null;

  const handleActivate = async () => {
    setError("");
    setLoading(true);
    try {
      await onActivate({ paymentAmount: Number(paymentAmount) || 0, paymentNote });
    } catch (e) {
      setError(e.message || "Activation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { setError("Please provide a rejection reason."); return; }
    setError("");
    setLoading(true);
    try {
      await onReject({ rejectionReason });
    } catch (e) {
      setError(e.message || "Rejection failed.");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: "100%", height: 42, padding: "0 12px",
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 13.5, fontFamily: "'Outfit', sans-serif",
    color: "#1e293b", background: "#fff", outline: "none",
    boxSizing: "border-box",
  };

  const InfoRow = ({ label, value }) => value ? (
    <div style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
      <span style={{ color: "#94a3b8", width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#1e293b", fontWeight: 500, wordBreak: "break-word" }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.20)", fontFamily: "'Outfit', sans-serif" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Review College Application</h3>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94a3b8" }}>Review details before activating or rejecting</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
        </div>

        {/* College Info Summary */}
        <div style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            {college.documents?.logo
              ? <img src={`${API}/${college.documents.logo}`} alt="logo" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "contain", border: "1px solid #e2e8f0", background: "#fff" }} />
              : <div style={{ width: 52, height: 52, borderRadius: 10, background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏫</div>
            }
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{college.collegeName}</div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                <span style={{ fontFamily: "monospace", background: "#e2e8f0", padding: "1px 6px", borderRadius: 4 }}>{college.collegeCode}</span>
                {" · "}{college.collegeType}
              </div>
            </div>
          </div>

          <InfoRow label="Email"        value={college.email} />
          <InfoRow label="Phone"        value={college.phone} />
          <InfoRow label="Website"      value={college.website} />
          <InfoRow label="Established"  value={college.establishedYear} />
          <InfoRow label="Affiliation"  value={college.affiliation} />
          <InfoRow label="Address"      value={[college.address?.street, college.address?.city, college.address?.state, college.address?.pincode].filter(Boolean).join(", ")} />
          <InfoRow label="Bank"         value={college.bankDetails?.bankName ? `${college.bankDetails.bankName} · ${college.bankDetails.ifscCode}` : null} />
          <InfoRow label="Registered"   value={college.createdAt ? new Date(college.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null} />

          {/* Documents */}
          {(college.documents?.affiliationCert || college.documents?.registrationCert) && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {college.documents.affiliationCert && (
                <a href={`${API}/${college.documents.affiliationCert}`} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, color: "#1d4ed8", textDecoration: "none", fontWeight: 500 }}>
                  📄 Affiliation Cert
                </a>
              )}
              {college.documents.registrationCert && (
                <a href={`${API}/${college.documents.registrationCert}`} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, color: "#1d4ed8", textDecoration: "none", fontWeight: 500 }}>
                  📄 Registration Cert
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9" }}>
          {[["activate", "✅ Activate"], ["reject", "❌ Reject"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setError(""); }}
              style={{ flex: 1, height: 44, border: "none", background: "none", fontSize: 13.5, fontWeight: tab === key ? 700 : 500, color: tab === key ? (key === "reject" ? "#e53e3e" : "#1a6fa8") : "#94a3b8", borderBottom: tab === key ? `2px solid ${key === "reject" ? "#e53e3e" : "#1a6fa8"}` : "2px solid transparent", cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 0.15s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "20px 24px" }}>
          {tab === "activate" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: "12px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 13, color: "#166634" }}>
                ✅ Activating will create a login account for this college and send credentials to <strong>{college.email}</strong>.
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Payment Amount Received (₹)
                </label>
                <input style={inp} type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 5000 — leave blank if waived"
                  onFocus={e => (e.target.style.borderColor = "#1a6fa8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Payment Note (optional)
                </label>
                <textarea value={paymentNote} onChange={e => setPaymentNote(e.target.value)}
                  placeholder="e.g. Received via UPI on 20 Mar 2026 — Txn ID: XXXX"
                  style={{ ...inp, height: 80, padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
                  onFocus={e => (e.target.style.borderColor = "#1a6fa8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: "12px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#991b1b" }}>
                ❌ This will mark the college as <strong>Rejected</strong>. No login account will be created.
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Rejection Reason <span style={{ color: "#e53e3e" }}>*</span>
                </label>
                <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Documents insufficient / Payment not received / Incomplete application"
                  style={{ ...inp, height: 100, padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
                  onFocus={e => (e.target.style.borderColor = "#e53e3e")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#991b1b" }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: "12px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose}
            style={{ height: 42, padding: "0 20px", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#374151", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
            Cancel
          </button>
          {tab === "activate" ? (
            <button onClick={handleActivate} disabled={loading}
              style={{ height: 42, padding: "0 24px", border: "none", borderRadius: 8, background: loading ? "#86efac" : "#16a34a", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
              {loading ? "Activating…" : "✅ Activate College"}
            </button>
          ) : (
            <button onClick={handleReject} disabled={loading}
              style={{ height: 42, padding: "0 24px", border: "none", borderRadius: 8, background: loading ? "#fca5a5" : "#e53e3e", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
              {loading ? "Rejecting…" : "❌ Reject College"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}