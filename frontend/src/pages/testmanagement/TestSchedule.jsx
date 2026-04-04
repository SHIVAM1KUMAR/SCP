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
import { useTests } from "../../hooks/useTests";
import TestModal from "../../component/forms/tests/TestModal";
import { TestStatusBadge, TestStatusSelect, displayTestMode, normalizeTestStatus } from "../../constant/tests.jsx";

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

export default function TestSchedule() {
  const toast = useToast();
  const auth = getAuth();
  const currentCollegeId = auth.collegeId || auth.id || auth.userMasterId || null;
  const navigate = useNavigate();
  const { students, isLoadingStudents, fetchStudents } = useStudents();
  const {
    tests,
    loadingTests,
    saving,
    fetchTests,
    saveTest,
  } = useTests(toast);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [modalVersion, setModalVersion] = useState(0);
  const [updatingKey, setUpdatingKey] = useState(null);

  useEffect(() => {
    void fetchTests?.();
    void fetchStudents?.();
  }, []);

  const appliedStudents = useMemo(() => {
    if (!currentCollegeId) return students || [];
    return (students || []).filter((student) =>
      (student.interestedColleges || []).some(
        (college) => String(college?._id || college) === String(currentCollegeId),
      ),
    );
  }, [currentCollegeId, students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (tests || []).filter((item) =>
      [
        item?.title,
        item?.student?.firstName,
        item?.student?.lastName,
        item?.college?.collegeName,
        item?.mode,
        item?.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [search, tests]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);

  const columns = [
    { key: "student", header: "Student", minWidth: 180, render: (item) => `${item.student?.firstName || ""} ${item.student?.lastName || ""}`.trim() || "-" },
    { key: "title", header: "Test Title", minWidth: 220, render: (item) => item.title || "-" },
    { key: "mode", header: "Mode", minWidth: 160, render: (item) => displayTestMode(item.mode) },
    {
      key: "marks",
      header: "Marks",
      minWidth: 100,
      render: (item) => {
        if (item.mode !== "platform") return "-";
        const totalMarks = Array.isArray(item.questions)
          ? item.questions.reduce((sum, question) => sum + Number(question?.marks || 1), 0)
          : 0;
        return totalMarks || item.questions?.length || 0;
      },
    },
    { key: "date", header: "Date", minWidth: 120, render: (item) => formatDate(item.scheduledDate || item.scheduledAt) },
    { key: "time", header: "Time", minWidth: 120, render: (item) => formatTime(item.scheduledTime) },
    {
      key: "status",
      header: "Status",
      minWidth: 160,
      render: (item) => {
        const status = item.status || "Scheduled";
        const normalizedStatus = normalizeTestStatus(status);
        if (normalizedStatus === "Rescheduled" || normalizedStatus === "Completed") {
          return <TestStatusBadge status={status} />;
        }

        return (
          <TestStatusSelect
            value={status}
            loading={updatingKey === item._id}
            disabled={updatingKey === item._id}
            onChange={async (nextStatus) => {
              setUpdatingKey(item._id);
              try {
                await saveTest({
                  id: item._id,
                  payload: {
                    status: normalizeTestStatus(nextStatus),
                  },
                });
              } finally {
                setUpdatingKey(null);
              }
            }}
          />
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingTest(null);
    setModalVersion((v) => v + 1);
    setShowModal(true);
  };

  const handleRowClick = (item) => {
    navigate(`/college/tests/${item._id}`);
  };

  const handleSubmit = async ({ id, payload }) => {
    await saveTest({ id, payload });
    setShowModal(false);
    setEditingTest(null);
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>Schedule Test</h2>
            <p style={subTitleStyle}>Schedule platform tests or external links for applied students</p>
          </div>

          <div style={toolbarStyle}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search tests..."
              width="320px"
              style={{ flex: "0 1 320px", minWidth: 240 }}
            />
            <Button variant="primary" onClick={handleAdd}>
              + Schedule Test
            </Button>
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {loadingTests || isLoadingStudents ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={handleRowClick}
              emptyText="No tests found"
              tableStyle={{ minWidth: 980 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No tests found
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

      <TestModal
        key={`${editingTest?._id || "new"}-${modalVersion}`}
        open={showModal}
        test={editingTest}
        students={appliedStudents}
        loading={saving}
        onClose={() => {
          setShowModal(false);
          setEditingTest(null);
        }}
        onSubmit={handleSubmit}
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
