/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import BasicTable from "../../component/ui/table/basicTable";
import { useToast } from "../../context/ToastContext";
import { useCounselling } from "../../hooks/useCounselling";
import CounsellorModal from "../../component/forms/counselling/CounsellorModal";

const formatAvailability = (slots = []) =>
  (slots || [])
    .map((slot) => [slot.day, slot.startTime, slot.endTime].filter(Boolean).join(" - "))
    .filter(Boolean)
    .join(", ") || "-";

export default function CounsellingAddCounsellor() {
  const toast = useToast();
  const navigate = useNavigate();
  const { counsellors, loadingCounsellors, fetchCounsellors, saveCounsellor } = useCounselling({ enableRealtime: false, toast });

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState(null);
  const [modalVersion, setModalVersion] = useState(0);

  useEffect(() => {
    void fetchCounsellors?.();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (counsellors || []).filter((item) =>
      [item.name, item.email, item.phone, item.department]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [counsellors, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);

  const columns = [
    { key: "name", header: "Name", minWidth: 180, render: (item) => item.name || "-" },
    { key: "email", header: "Email", minWidth: 220, render: (item) => item.email || "-" },
    { key: "phone", header: "Phone", minWidth: 140, render: (item) => item.phone || "-" },
    { key: "department", header: "Department", minWidth: 160, render: (item) => item.department || "-" },
    { key: "availability", header: "Availability", minWidth: 260, render: (item) => formatAvailability(item.availability) },
    {
      key: "status",
      header: "Status",
      minWidth: 110,
      render: (item) => (
        <span style={badge(item.status === "Active" ? "success" : "muted")}>{item.status || "-"}</span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingCounsellor(null);
    setModalVersion((v) => v + 1);
    setShowModal(true);
  };

  const handleSaved = async ({ id, payload }) => {
    await saveCounsellor({ id, payload });
    setShowModal(false);
    setEditingCounsellor(null);
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>Add Counsellor</h2>
            <p style={subTitleStyle}>Manage counsellor records for your college</p>
          </div>

          <div style={toolbarStyle}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search counsellor..."
              width="320px"
              style={{ flex: "0 1 320px", minWidth: 240 }}
            />
            <Button variant="primary" onClick={handleAdd}>
              + Add Counsellor
            </Button>
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {loadingCounsellors ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={(item) => navigate(`/college/counselling/${item._id}`)}
              emptyText="No counsellors found"
              tableStyle={{ minWidth: 860 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No counsellors found
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div style={paginationStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                style={selectStyle}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              {start + 1}–{Math.min(start + rowsPerPage, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={pagerButtonStyle(safePage === 1)}
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={pagerButtonStyle(safePage >= totalPages)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      <CounsellorModal
        key={`${editingCounsellor?._id || "new"}-${modalVersion}`}
        open={showModal}
        counsellor={editingCounsellor}
        loading={false}
        onClose={() => {
          setShowModal(false);
          setEditingCounsellor(null);
        }}
        onSubmit={handleSaved}
      />
    </div>
  );
}

const badge = (tone) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: tone === "success" ? "#ecfdf5" : "#f8fafc",
  color: tone === "success" ? "#047857" : "#64748b",
});

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e5e9f0",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid #f0f3f7",
  flexWrap: "wrap",
  gap: 12,
};

const titleStyle = { margin: 0, fontSize: 18, fontWeight: 700, color: "#0f2044" };
const subTitleStyle = { margin: "2px 0 0", fontSize: 12.5, color: "#64748b", fontWeight: 500 };
const toolbarStyle = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" };
const paginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 16,
  padding: "12px 20px 16px",
  fontSize: 13,
  color: "#64748b",
  borderTop: "1px solid #f0f3f7",
};
const selectStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: 13,
  fontFamily: "'Outfit', sans-serif",
  color: "#1e293b",
};
const pagerButtonStyle = (disabled) => ({
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  background: "none",
  padding: "3px 10px",
  fontSize: 16,
  cursor: disabled ? "not-allowed" : "pointer",
  color: disabled ? "#cbd5e1" : "#374151",
});
