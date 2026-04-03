/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import BasicTable from "../../component/ui/table/basicTable";
import { useToast } from "../../context/ToastContext";
import { useCounselling } from "../../hooks/useCounselling";

const formatDate = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
};

const formatTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(`1970-01-01T${value}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const displayStatus = (status = "") => (status === "Completed" ? "Counseled" : status || "-");

export default function CounsellingStudent() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    studentDashboard,
    loadingDashboard,
    fetchStudentDashboard,
  } = useCounselling({ enableRealtime: false, toast });

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    void fetchStudentDashboard?.();
  }, []);

  const sessions = studentDashboard?.sessions || [];

  const filteredSessions = useMemo(() => {
    const q = search.toLowerCase();
    return sessions.filter((item) =>
      [
        item?.counsellor?.name,
        item?.college?.collegeName,
        item.status,
        item?.notes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [search, sessions]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filteredSessions.slice(start, start + rowsPerPage);

  const columns = [
    { key: "counsellor", header: "Counsellor", minWidth: 180, render: (item) => item.counsellor?.name || "-" },
    { key: "college", header: "College", minWidth: 220, render: (item) => item.college?.collegeName || "-" },
    { key: "date", header: "Date", minWidth: 120, render: (item) => formatDate(item.scheduledDate || item.scheduledAt) },
    { key: "time", header: "Time", minWidth: 120, render: (item) => formatTime(item.scheduledTime) },
    {
      key: "status",
      header: "Status",
      minWidth: 120,
      render: (item) => <span style={badge(item.status)}>{displayStatus(item.status)}</span>,
    },
  ];

  const handleRowClick = (item) => {
    navigate(`/student/counselling/${item._id}`);
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>Your Schedule Counselling</h2>
            <p style={subTitleStyle}>View your counselling bookings row by row and open a session to see the booking details.</p>
          </div>

          <div style={toolbarStyle}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search counselling bookings..."
              width="340px"
              style={{ flex: "0 1 340px", minWidth: 250 }}
            />
            <button type="button" onClick={() => fetchStudentDashboard?.()} style={refreshButton}>
              Refresh
            </button>
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {loadingDashboard ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={handleRowClick}
              emptyText="No counselling appointments found"
              tableStyle={{ minWidth: 860 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No counselling appointments found
            </div>
          )}
        </div>

        {filteredSessions.length > 0 && (
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
              {start + 1}â€“{Math.min(start + rowsPerPage, filteredSessions.length)} of {filteredSessions.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={pagerButtonStyle(safePage === 1)}
              >
                â€¹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={pagerButtonStyle(safePage >= totalPages)}
              >
                â€º
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const badge = (status) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: status === "Completed" ? "#ecfdf5" : status === "Missed" ? "#fef2f2" : status === "Rescheduled" ? "#eff6ff" : "#f8fafc",
  color: status === "Completed" ? "#047857" : status === "Missed" ? "#b91c1c" : status === "Rescheduled" ? "#1d4ed8" : "#64748b",
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
const refreshButton = {
  background: "#fff",
  border: "1px solid #dbe3ee",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  color: "#0f2044",
  cursor: "pointer",
};
