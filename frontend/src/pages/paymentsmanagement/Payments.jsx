import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import BasicTable from "../../component/ui/table/basicTable";
import Button from "../../component/ui/button/Button";
import { StatusBadge } from "../../component/ui/studentmanagement/StatusBadge";
import PaymentReviewModal from "../../component/ui/paymentsmanagement/PaymentReviewModal";
import ReceiptPreviewModal from "../../component/ui/paymentsmanagement/ReceiptPreviewModal";

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";
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
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeader() },
    ...opts,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
}

export default function Payments() {
  const toast = useToast();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [receiptTarget, setReceiptTarget] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/colleges/payments");
      setColleges(data.data || []);
    } catch (e) {
      toast("Failed to load payments.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    setPage(1);
  }, [colleges.length]);

  const verifyPayment = async ({ id }) => {
    try {
      const data = await apiFetch(`/colleges/payments/${id}/verify`, { method: "PATCH" });
      toast(data.message || "Payment verified and college activated!", "success");
      await fetchPayments();
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
      await fetchPayments();
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

  const totalPages = Math.max(1, Math.ceil(colleges.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = colleges.slice(start, start + rowsPerPage);

  const columns = useMemo(() => [
    {
      key: "collegeName",
      header: "College Name",
      minWidth: 220,
      render: (c) => <span style={{ fontWeight: 700, color: "#0f2044" }}>{c.collegeName}</span>,
    },
    {
      key: "email",
      header: "Email",
      minWidth: 240,
      render: (c) => c.email || "-",
    },
    {
      key: "createdAt",
      header: "Reg Date",
      minWidth: 120,
      render: (c) => (c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "-"),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      minWidth: 150,
      render: (c) => <StatusBadge status={c.paymentStatus || c.status || "Pending"} />,
    },
    {
      key: "actions",
      header: "Action",
      minWidth: 320,
      align: "center",
      render: (c) => {
        const receiptRef = getDocumentRef(c.documentFiles || c.documents || {}, "paymentReceipt");
        return (
          <div
            style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}
            onClick={(e) => e.stopPropagation()}
          >
            {receiptRef && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setReceiptTarget(receiptRef)}
                style={{
                  background: "#f0f7ff",
                  color: "#1a6fa8",
                  border: "1px solid #bfdbfe",
                }}
              >
                View Receipt
              </Button>
            )}
            {(c.paymentStatus === "Uploaded" || c.paymentStatus === "Pending") && c.status === "Pending" && (
              <Button
                variant="success"
                size="small"
                onClick={() => openReview(c)}
              >
                Review & Activate
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/superadmin/college/${c._id}`)}
            >
              View College
            </Button>
          </div>
        );
      },
    },
  ], [navigate]);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e9f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f3f7",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
            Payments & Verification
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#1a6fa8", fontWeight: 500 }}>
            Verify uploaded receipts to activate colleges
          </p>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          <BasicTable
            columns={columns}
            rows={currentItems}
            isLoading={loading}
            emptyText="No colleges pending payment verification."
            tableStyle={{ minWidth: 1020 }}
          />
        </div>

        {colleges.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 16,
              padding: "12px 20px 16px",
              fontSize: 13,
              color: "#64748b",
              borderTop: "1px solid #f0f3f7",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 13,
                  fontFamily: "'Outfit', sans-serif",
                  color: "#1e293b",
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              {start + 1}-{Math.min(start + rowsPerPage, colleges.length)} of {colleges.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  background: "none",
                  padding: "3px 10px",
                  fontSize: 16,
                  cursor: safePage === 1 ? "not-allowed" : "pointer",
                  color: safePage === 1 ? "#cbd5e1" : "#374151",
                }}
              >
                {"<"}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  background: "none",
                  padding: "3px 10px",
                  fontSize: 16,
                  cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                  color: safePage >= totalPages ? "#cbd5e1" : "#374151",
                }}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>

      <ReceiptPreviewModal
        open={Boolean(receiptTarget)}
        receiptTarget={receiptTarget}
        receiptUrl={toFileUrl(receiptTarget)}
        onClose={() => setReceiptTarget(null)}
      />

      <PaymentReviewModal
        open={showReviewModal}
        college={selectedCollege}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedCollege(null);
        }}
        onActivate={verifyPayment}
        onReject={rejectCollege}
      />
    </div>
  );
}
