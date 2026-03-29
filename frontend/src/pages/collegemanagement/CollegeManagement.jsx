import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useColleges } from "../../hooks/useCollege";
import { useStudents } from "../../hooks/useStudents";
import CollegeRegistrationForm from "../../component/forms/college/CollegeRegistrationForm";
import DeleteCollegeModal from "./deletecollegeModal";
import { getAuth } from "../../store/slice/auth.slice";
import Loader from "../../component/ui/loader/Loader";

export default function CollegeManagement() {
  const { colleges, isLoadingColleges, deleteCollege, fetchColleges, isDeletingCollege, toggleInterestAsync } = useColleges();

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState(null);

  const navigate = useNavigate();
  const { role, email, id, userMasterId } = getAuth();
  const roleLower = String(role || "").toLowerCase();
  const isStudent = roleLower === "student";
  const showPaymentColumn = !isStudent;
  const baseCollegeRoute = roleLower === "admin" ? "/admin/college" : isStudent ? "/student/colleges" : "/superadmin/college";
  const studentLookupId = isStudent ? (id || userMasterId || null) : null;
  const { student: currentStudent, fetchStudent: fetchCurrentStudent } = useStudents(studentLookupId);

  const filtered = colleges?.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.collegeName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.collegeCode?.toLowerCase().includes(q)
    );
  }) || [];

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);
  const appliedCollegeIds = new Set(
    (currentStudent?.interestedColleges || []).map((college) => String(college?._id || college)),
  );

  const handleAdd = () => {
    setSelectedCollege(null);
    setOpenAddEditModal(true);
  };

  const handleApply = async (college) => {
    if (!email) return;
    if (appliedCollegeIds.has(String(college._id))) return;
    await toggleInterestAsync({ id: college._id, studentEmail: email });
    await fetchCurrentStudent?.();
  };

  const handleEdit = (college) => {
    setSelectedCollege(college);
    setOpenAddEditModal(true);
  };

  const handleDeleteClick = (college) => {
    setCollegeToDelete(college);
    setShowDeleteModal(true);
  };

  // ✅ FIX: onConfirm now receives the id directly and calls deleteCollege
  // DeleteCollegeModal calls onConfirm({ id }) — we extract id here
  const handleDeleteConfirm = async ({ id }) => {
    await deleteCollege(id);
    setShowDeleteModal(false);
    setCollegeToDelete(null);
  };

  const handleSaved = async (isEdit) => {
    if (!isEdit) setPage(1);
    await fetchColleges?.();
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
        {/* HEADER */}
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
              {isStudent ? "College List" : "Colleges"}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#1a6fa8", fontWeight: 500 }}>
              {isStudent ? "Browse colleges and apply for counselling" : "Manage College Applications"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search college..."
              style={{
                height: 36, padding: "0 12px",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, width: 220,
              }}
            />
            {!isStudent && (
              <button
                onClick={handleAdd}
                style={{
                  height: 36, padding: "0 16px",
                  background: "#1a6fa8", color: "#fff",
                  border: "none", borderRadius: 8,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                + Add College
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>College</th>
                <th style={th}>Type</th>
                <th style={th}>Email</th>
                <th style={th}>Status</th>
                {showPaymentColumn && <th style={th}>Payment</th>}
                <th style={th}>Registered</th>
                <th style={{ ...th, textAlign: "center" }}>{isStudent ? "Apply" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingColleges ? (
                <tr>
                  <td colSpan={showPaymentColumn ? 8 : 7} style={{ textAlign: "center", padding: 40 }}>
                    <Loader size={30} />
                  </td>
                </tr>
              ) : currentItems.length ? (
                currentItems.map((c, i) => (
                  <tr
                    key={c._id}
                    style={{ cursor: isStudent ? "default" : "pointer" }}
                    onClick={() => navigate(`${baseCollegeRoute}/${c._id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>{start + i + 1}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{c.collegeName}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {c.collegeCode} • {c.address?.city || "-"}
                      </div>
                    </td>
                    <td style={td}>{c.collegeType}</td>
                    <td style={td}>{c.email}</td>
                    <td style={td}>
                      <span className={`badge bg-${c.status === "Active" ? "success" : c.status === "Pending" ? "warning" : c.status === "Rejected" ? "danger" : "secondary"}`}>
                        {c.status}
                      </span>
                    </td>
                    {showPaymentColumn && (
                      <td style={td}>
                        <span className={`badge bg-${c.paymentStatus === "Paid" ? "success" : "danger"}`}>
                          {c.paymentStatus || "-"}
                        </span>
                      </td>
                    )}
                    <td style={td}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                    <td style={{ ...td, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                      {isStudent ? (
                        <button
                          onClick={() => handleApply(c)}
                          disabled={appliedCollegeIds.has(String(c._id))}
                          style={{
                            background: appliedCollegeIds.has(String(c._id)) ? "#e8f4fd" : "#0f2044",
                            color: appliedCollegeIds.has(String(c._id)) ? "#1a6fa8" : "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 14px",
                            cursor: appliedCollegeIds.has(String(c._id)) ? "not-allowed" : "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            opacity: appliedCollegeIds.has(String(c._id)) ? 0.9 : 1,
                          }}
                        >
                          {appliedCollegeIds.has(String(c._id)) ? "Applied" : "Apply"}
                        </button>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                          <button
                            onClick={() => handleEdit(c)}
                            style={{
                              background: "#e8f4fd", border: "none", borderRadius: 6,
                              padding: "6px 12px", cursor: "pointer",
                              color: "#1a6fa8", fontSize: 12, fontWeight: 600,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(c)}
                            style={{
                              background: "#fff5f5", border: "none", borderRadius: 6,
                              padding: "6px 12px", cursor: "pointer",
                              color: "#e53e3e", fontSize: 12, fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showPaymentColumn ? 8 : 7} style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
                    No colleges found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filtered.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            gap: 16, padding: "12px 20px", fontSize: 13, color: "#64748b",
            borderTop: "1px solid #f0f3f7",
          }}>
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
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <span>{start + 1}–{Math.min(start + rowsPerPage, filtered.length)} of {filtered.length}</span>
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
              >‹</button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={{
                  border: "1px solid #e2e8f0", borderRadius: 6, background: "none",
                  padding: "3px 10px", fontSize: 16,
                  cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                  color: safePage >= totalPages ? "#cbd5e1" : "#374151",
                }}
              >›</button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {!isStudent && openAddEditModal && (
        <CollegeRegistrationForm
          college={selectedCollege}
          collegeId={selectedCollege?._id || null}
          onSaved={handleSaved}
          onClose={() => setOpenAddEditModal(false)}
        />
      )}

      {/* DELETE MODAL */}
      {!isStudent && showDeleteModal && (
        <DeleteCollegeModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCollegeToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}  // ✅ receives { id } from modal
          college={collegeToDelete}
          loading={isDeletingCollege}
        />
      )}
    </div>
  );
}

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
