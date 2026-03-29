import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import ActivateCollegeModal from "../collegemanagement/activateCollege";

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '');
const BASE_URL = API.replace(/\/api\/?$/, "");

const toFileUrl = (value) => {
  if (!value) return "";
  const normalized = String(value).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) return normalized;
  const uploadsMatch = normalized.match(/(?:^|\/)uploads\/(.+)$/i);
  if (uploadsMatch?.[1]) {
    const uploadPath = uploadsMatch[1]
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${BASE_URL}/uploads/${uploadPath}`;
  }
  return `${BASE_URL}/${normalized.replace(/^\/+/, "")}`;
};

const getDocumentRef = (docs, key) =>
  docs?.[key]?.url || docs?.[key]?.path || docs?.[key] || "";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, opts = {}) {
  const res  = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json", ...authHeader() }, ...opts });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
}

export default function Payments() {
  const toast = useToast();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [receiptTarget, setReceiptTarget] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/colleges/payments");
      setColleges(data.data);
    } catch (e) {
      toast("Failed to load payments.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const verifyPayment = async ({ id }) => {
    try {
      const data = await apiFetch(`/colleges/payments/${id}/verify`, { method: "PATCH" });
      toast(data.message || "Payment verified and college activated!", "success");
      fetchPayments();
      setShowReviewModal(false);
      setSelectedCollege(null);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const rejectCollege = async ({ id, payload }) => {
    try {
      const res = await fetch(`${API}/colleges/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload || {}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Rejection failed");
      toast(data.message || "College rejected", "warning");
      fetchPayments();
      setShowReviewModal(false);
      setSelectedCollege(null);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const openReview = (college) => {
    setSelectedCollege(college);
    setShowReviewModal(true);
  };

  const th = { padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#1a6fa8", background: "#f8fafc", borderBottom: "2px solid #e5e9f0", textAlign: "left" };
  const td = { padding: "13px 16px", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f0f3f7" };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e9f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f3f7" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Payments & Verification</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#1a6fa8", fontWeight: 500 }}>Verify uploaded receipts to activate colleges</p>
        </div>

        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>College Name</th>
                <th style={th}>Email</th>
                <th style={th}>Reg Date</th>
                <th style={th}>Payment Status</th>
                <th style={{ ...th, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ ...td, textAlign: "center", padding: "40px" }}>Loading...</td></tr>
              ) : colleges.length === 0 ? (
                <tr><td colSpan={5} style={{ ...td, textAlign: "center", padding: "40px" }}>No colleges pending payment verification.</td></tr>
              ) : colleges.map(c => (
                <tr key={c._id}>
                  <td style={{ ...td, fontWeight: 600 }}>{c.collegeName}</td>
                  <td style={td}>{c.email}</td>
                  <td style={td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={td}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.paymentStatus === 'Verified' ? "#f0fdf4" : c.paymentStatus === 'Uploaded' ? "#fffbeb" : "#f8fafc", color: c.paymentStatus === 'Verified' ? "#166634" : c.paymentStatus === 'Uploaded' ? "#d97706" : "#475569" }}>
                      {c.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      {getDocumentRef(c.documentFiles || c.documents || {}, "paymentReceipt") && (
                        <button
                          onClick={() => setReceiptTarget(getDocumentRef(c.documentFiles || c.documents || {}, "paymentReceipt"))}
                          style={{ padding: "6px 12px", background: "#f0f7ff", color: "#1a6fa8", border: "1px solid #bfdbfe", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12 }}
                        >
                          View Receipt
                        </button>
                      )}
                      {(c.paymentStatus === 'Uploaded' || c.paymentStatus === 'Pending') && c.status === 'Pending' && (
                        <button
                          onClick={() => openReview(c)}
                          style={{ padding: "6px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12 }}
                        >
                          Review & Activate
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/superadmin/college/${c._id}`)}
                        style={{ padding: "6px 12px", background: "#fff", color: "#1e293b", border: "1px solid #dbe1ea", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12 }}
                      >
                        View College
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {receiptTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, maxWidth: 600, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Payment Receipt</h3>
              <button onClick={() => setReceiptTarget(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center" }}>
              {receiptTarget.toLowerCase().includes(".pdf") ? (
                <iframe src={toFileUrl(receiptTarget)} width="100%" height="500px" title="Receipt" />
              ) : (
                <img src={toFileUrl(receiptTarget)} alt="Receipt" style={{ maxWidth: "100%", objectFit: "contain" }} />
              )}
            </div>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <a href={toFileUrl(receiptTarget)} download target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: "10px 20px", background: "#1a6fa8", color: "#fff", textDecoration: "none", borderRadius: 6, fontWeight: 600 }}>
                Download Receipt
              </a>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedCollege && (
        <ActivateCollegeModal
          college={selectedCollege}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedCollege(null);
          }}
          onActivate={verifyPayment}
          onReject={rejectCollege}
        />
      )}
    </div>
  );
}
