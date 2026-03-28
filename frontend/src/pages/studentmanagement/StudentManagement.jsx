import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../hooks/useStudents";
import StudentRegistrationForm from "../../component/forms/student/studentRegistration";
import DeleteStudentModal from "./deleteStudentModal";
import { getAuth } from "../../store/slice/auth.slice";
import Loader from "../../component/ui/loader/Loader";

export default function StudentManagement() {
  const { students, isLoadingStudents, deleteStudent, fetchStudents, isDeletingStudent } = useStudents();

  const [search, setSearch]           = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage]               = useState(1);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent]   = useState(null);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [studentToDelete, setStudentToDelete]   = useState(null);

  const navigate = useNavigate();
  const { role } = getAuth();
  const baseStudentRoute =
    role === "Admin" ? "/admin/student" : "/superadmin/student";

  const filtered =
    students?.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
      );
    }) || [];

  const totalPages  = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage    = Math.min(page, totalPages);
  const start       = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);

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

  // DeleteStudentModal calls onConfirm({ id })
  const handleDeleteConfirm = async ({ id }) => {
    await deleteStudent(id);
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleSaved = async (isEdit) => {
    if (!isEdit) setPage(1);
    await fetchStudents?.();
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #e5e9f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* ── HEADER ── */}
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
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
              Students
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#1a6fa8", fontWeight: 500 }}>
              Manage Student Applications
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search student…"
              style={{
                height: 36, padding: "0 12px",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, width: 220,
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                height: 36, padding: "0 16px",
                background: "#1a6fa8", color: "#fff",
                border: "none", borderRadius: 8,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              + Add Student
            </button>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Student</th>
                <th style={th}>Gender</th>
                <th style={th}>Email</th>
                <th style={th}>Phone</th>
                <th style={th}>10th %</th>
                <th style={th}>12th %</th>
                <th style={th}>Status</th>
                <th style={th}>Applied</th>
                <th style={{ ...th, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingStudents ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 40 }}>
                    <Loader size={30} />
                  </td>
                </tr>
              ) : currentItems.length ? (
                currentItems.map((s, i) => (
                  <tr
                    key={s._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`${baseStudentRoute}/${s._id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>{start + i + 1}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>
                        {s.firstName} {s.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {s.address?.city || "-"} · {s.category || "-"}
                      </div>
                    </td>
                    <td style={td}>{s.gender || "-"}</td>
                    <td style={td}>{s.email}</td>
                    <td style={td}>{s.phone || "-"}</td>
                    <td style={td}>
                      {s.tenthPercentage ? `${s.tenthPercentage}%` : "-"}
                    </td>
                    <td style={td}>
                      {s.twelfthPercentage ? `${s.twelfthPercentage}%` : "-"}
                    </td>
                    <td style={td}>
                      <span
                        className={`badge bg-${
                          s.status === "Approved"
                            ? "success"
                            : s.status === "Pending"
                            ? "warning"
                            : s.status === "Rejected"
                            ? "danger"
                            : "secondary"
                        }`}
                      >
                        {s.status || "Pending"}
                      </span>
                    </td>
                    <td style={td}>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td
                      style={{ ...td, textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        <button
                          onClick={() => handleEdit(s)}
                          style={{
                            background: "#e8f4fd", border: "none", borderRadius: 6,
                            padding: "6px 12px", cursor: "pointer",
                            color: "#1a6fa8", fontSize: 12, fontWeight: 600,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(s)}
                          style={{
                            background: "#fff5f5", border: "none", borderRadius: 6,
                            padding: "6px 12px", cursor: "pointer",
                            color: "#e53e3e", fontSize: 12, fontWeight: 600,
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}
                  >
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {filtered.length > 0 && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              gap: 16, padding: "12px 20px", fontSize: 13, color: "#64748b",
              borderTop: "1px solid #f0f3f7",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                style={{
                  border: "1px solid #e2e8f0", borderRadius: 6,
                  padding: "2px 8px", fontSize: 13,
                  fontFamily: "'Outfit', sans-serif", color: "#1e293b",
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <span>
              {start + 1}–{Math.min(start + rowsPerPage, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  border: "1px solid #e2e8f0", borderRadius: 6, background: "none",
                  padding: "3px 10px", fontSize: 16,
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
                  border: "1px solid #e2e8f0", borderRadius: 6, background: "none",
                  padding: "3px 10px", fontSize: 16,
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

      {/* ── ADD / EDIT MODAL ── */}
      {openAddEditModal && (
        <StudentRegistrationForm
          student={selectedStudent}
          studentId={selectedStudent?._id || null}
          onSaved={handleSaved}
          onClose={() => setOpenAddEditModal(false)}
        />
      )}

      {/* ── DELETE MODAL ── */}
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

// ─── Table styles ─────────────────────────────────────────────────────────────
const th = {
  padding: "12px 16px", fontSize: 13, fontWeight: 600,
  color: "#1a6fa8", background: "#f8fafc",
  borderBottom: "2px solid #e5e9f0",
  textAlign: "left", whiteSpace: "nowrap",
};

const td = {
  padding: "13px 16px", fontSize: 13.5,
  color: "#374151", borderBottom: "1px solid #f0f3f7",
};