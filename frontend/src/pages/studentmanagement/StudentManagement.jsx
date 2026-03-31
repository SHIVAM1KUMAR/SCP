import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../hooks/useStudents";
import StudentRegistrationForm from "../../component/forms/student/studentRegistration";
import DeleteStudentModal from "./deleteStudentModal";
import { getAuth } from "../../store/slice/auth.slice";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import Button from "../../component/ui/button/Button";
import BasicTable from "../../component/ui/table/basicTable";
import { StatusBadge } from "../../component/ui/studentmanagement/StatusBadge";

export default function StudentManagement({ scope = "default", view = "all" } = {}) {
  const { students, isLoadingStudents, deleteStudent, fetchStudents, isDeletingStudent } = useStudents();

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const navigate = useNavigate();
  const { role, id, userMasterId } = getAuth();
  const roleLower = String(role || "").toLowerCase();
  const isCollege = scope === "college" || roleLower === "college";
  const currentCollegeId = id || userMasterId || null;
  const baseStudentRoute =
    roleLower === "admin"
      ? "/admin/students"
      : isCollege
        ? `/college/${view === "applied" ? "applied-students" : "students"}`
        : "/superadmin/students";

  const collegeAppliedStudents = useMemo(() => {
    if (!isCollege || !currentCollegeId) return [];
    return (
      students?.filter((student) =>
        (student.interestedColleges || []).some(
          (college) => String(college?._id || college) === String(currentCollegeId),
        ),
      ) || []
    );
  }, [currentCollegeId, isCollege, students]);

  const activeStudents = isCollege
    ? view === "applied"
      ? collegeAppliedStudents
      : (students || [])
    : (students || []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activeStudents.filter((s) =>
      [s.firstName, s.lastName, s.email, s.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [activeStudents, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);

  const canManageStudents = roleLower === "superadmin" || roleLower === "admin";

  const handleAdd = () => {
    setSelectedStudent(null);
    setOpenAddEditModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setOpenAddEditModal(true);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async ({ id }) => {
    await deleteStudent(id);
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleSaved = async (isEdit) => {
    if (!isEdit) setPage(1);
    await fetchStudents?.();
  };

  const columns = [
    {
      key: "index",
      header: "#",
      minWidth: 56,
      render: (_row, rowIndex) => start + rowIndex + 1,
    },
    {
      key: "student",
      header: "Student",
      minWidth: 210,
      render: (s) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0f2044" }}>
            {s.firstName} {s.lastName}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {s.address?.city || "-"} · {s.category || "-"}
          </div>
        </div>
      ),
    },
    { key: "gender", header: "Gender", minWidth: 100, render: (s) => s.gender || "-" },
    { key: "email", header: "Email", minWidth: 220, render: (s) => s.email || "-" },
    { key: "phone", header: "Phone", minWidth: 140, render: (s) => s.phone || "-" },
    {
      key: "tenthPercentage",
      header: "10th %",
      minWidth: 90,
      render: (s) => (s.tenthPercentage ? `${s.tenthPercentage}%` : "-"),
    },
    {
      key: "twelfthPercentage",
      header: "12th %",
      minWidth: 90,
      render: (s) => (s.twelfthPercentage ? `${s.twelfthPercentage}%` : "-"),
    },
    {
      key: "status",
      header: "Status",
      minWidth: 120,
      render: (s) => <StatusBadge status={s.status || "Pending"} />,
    },
    {
      key: "createdAt",
      header: "Applied",
      minWidth: 120,
      render: (s) => (s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "-"),
    },
    ...(canManageStudents
      ? [{
          key: "actions",
          header: "Actions",
          minWidth: 170,
          align: "center",
          render: (s) => (
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(s);
                }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(s);
                }}
              >
                Delete
              </Button>
            </div>
          ),
        }]
      : []),
  ];

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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid #f0f3f7",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f2044" }}>
              {isCollege && view === "applied"
                ? "Applied Students"
                : isCollege
                  ? "Student Management"
                  : "Students"}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>
              {isCollege && view === "applied"
                ? "Students who applied to your college"
                : isCollege
                  ? "All students in your management list"
                  : "Manage Student Applications"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", width: "100%", justifyContent: "flex-end" }}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search student…"
              width="320px"
              style={{ flex: "0 1 320px", minWidth: 240, maxWidth: 360 }}
            />
            {canManageStudents && (
              <Button onClick={handleAdd} variant="primary" style={{ flexShrink: 0 }}>
                + Add Student
              </Button>
            )}
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {isLoadingStudents ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={(student) => navigate(`${baseStudentRoute}/${student._id}`)}
              emptyText="No students found"
              tableStyle={{ minWidth: 900 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No students found
            </div>
          )}
        </div>

        {filtered.length > 0 && (
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
              {start + 1}–{Math.min(start + rowsPerPage, filtered.length)} of {filtered.length}
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
                ‹
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
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {openAddEditModal && (
        <StudentRegistrationForm
          student={selectedStudent}
          studentId={selectedStudent?._id || null}
          onSaved={handleSaved}
          onClose={() => setOpenAddEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteStudentModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setStudentToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          student={studentToDelete}
          loading={isDeletingStudent}
        />
      )}
    </div>
  );
}
