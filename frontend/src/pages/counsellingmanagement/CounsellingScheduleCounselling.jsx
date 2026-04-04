/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import BasicTable from "../../component/ui/table/basicTable";
import { useToast } from "../../context/ToastContext";
import { getAuth } from "../../store/slice/auth.slice";
import { useStudents } from "../../hooks/useStudents";
import { useCounselling } from "../../hooks/useCounselling";
import SessionModal from "../../component/forms/counselling/SessionModal";
import {
  SessionStatusBadge,
  SessionStatusSelect,
  normalizeSessionStatus,
} from "../../constant/counselling.jsx";

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

export default function CounsellingScheduleCounselling() {
  const toast = useToast();
  const auth = getAuth();
  const isCounsellor = auth.role === "Counsellor";
  const currentCollegeId = auth.collegeId || auth.id || auth.userMasterId || null;
  const currentCounsellorId = auth.counsellorId || auth.id || auth.userMasterId || null;
  const currentCounsellorLabel = auth.name || "Counsellor";
  const navigate = useNavigate();
  const {
    counsellors,
    sessions,
    loadingCounsellors,
    loadingSessions,
    fetchCounsellors,
    fetchSessions,
    saveSession,
  } = useCounselling({ enableRealtime: false, toast });
  const {
    students,
    isLoadingStudents,
    fetchStudents,
  } = useStudents();

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [modalVersion, setModalVersion] = useState(0);
  const [updatingSessionKey, setUpdatingSessionKey] = useState(null);

  useEffect(() => {
    if (!isCounsellor) {
      void fetchCounsellors?.();
    }
    void fetchSessions?.();
    void fetchStudents?.();
    // Run once on mount; the hook functions are recreated on render.
    // Keeping them in the dependency list would refetch forever.
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (sessions || []).filter((item) =>
      [
        item?.student?.firstName,
        item?.student?.lastName,
        item?.counsellor?.name,
        item?.college?.collegeName,
        item.status,
      ]
        .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [search, sessions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);
  const appliedStudents = useMemo(() => {
    if (!currentCollegeId) return students || [];
    return (students || []).filter((student) =>
      (student.interestedColleges || []).some(
        (college) => String(college?._id || college) === String(currentCollegeId),
      ),
    );
  }, [currentCollegeId, students]);
  const columns = [
    { key: "student", header: "Student", minWidth: 200, render: (item) => `${item.student?.firstName || ""} ${item.student?.lastName || ""}`.trim() || "-" },
    { key: "counsellor", header: "Counsellor", minWidth: 180, render: (item) => item.counsellor?.name || "-" },
    { key: "college", header: "College", minWidth: 200, render: (item) => item.college?.collegeName || "-" },
    {
      key: "followUp",
      header: "Follow-up",
      minWidth: 180,
      render: (item) => {
        const status = item.status || "Scheduled";

        if (normalizeSessionStatus(status) === "Rescheduled") {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <SessionStatusBadge status={status} />
            </div>
          );
        }

        return (
          <SessionStatusSelect
            value={status}
            loading={updatingSessionKey === item._id}
            disabled={updatingSessionKey === item._id}
            onChange={async (nextStatus) => {
              setUpdatingSessionKey(item._id);
              try {
                await saveSession({
                  id: item._id,
                  payload: {
                    status: normalizeSessionStatus(nextStatus),
                  },
                });
                await fetchStudents?.();
              } finally {
                setUpdatingSessionKey(null);
              }
            }}
          />
        );
      },
    },
    { key: "date", header: "Date", minWidth: 120, render: (item) => formatDate(item.scheduledDate || item.scheduledAt) },
    { key: "time", header: "Time", minWidth: 120, render: (item) => formatTime(item.scheduledTime) },
  ];

  const handleAdd = () => {
    setEditingSession(null);
    setModalVersion((v) => v + 1);
    setShowModal(true);
  };

  const handleRowClick = (item) => {
    navigate(`/college/counselling/session/${item._id}`);
  };

  const handleSchedule = async ({ id, payload }) => {
    await saveSession({ id, payload });
    setShowModal(false);
    setEditingSession(null);
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>Schedule Counselling</h2>
            <p style={subTitleStyle}>Book and manage counselling sessions</p>
          </div>

          <div style={toolbarStyle}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search sessions..."
              width="320px"
              style={{ flex: "0 1 320px", minWidth: 240 }}
            />
            <Button variant="primary" onClick={handleAdd}>
              + Schedule Session
            </Button>
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {loadingSessions || loadingCounsellors || isLoadingStudents ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={handleRowClick}
              emptyText="No sessions found"
              tableStyle={{ minWidth: 900 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No sessions found
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

      <SessionModal
        key={`${editingSession?._id || "new"}-${modalVersion}-${isCounsellor ? currentCounsellorId || "self" : "college"}`}
        open={showModal}
        session={editingSession}
        counsellors={isCounsellor ? [] : counsellors}
        students={appliedStudents}
        loading={false}
        fixedCounsellorId={isCounsellor ? currentCounsellorId : ""}
        fixedCounsellorLabel={isCounsellor ? currentCounsellorLabel : ""}
        onClose={() => {
          setShowModal(false);
          setEditingSession(null);
        }}
        onSubmit={handleSchedule}
      />
    </div>
  );
}

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
