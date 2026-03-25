import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useColleges } from "../../hooks/useCollege";
import CollegeRegistrationForm from "../../component/forms/college/CollegeRegistrationForm";
import DeleteCollegeModal from "./deletecollegeModal";   // ← Import the clean modal we made

export default function CollegeManagement() {
  const { colleges, isLoadingColleges, deleteCollege } = useColleges();
  
  const [search, setSearch] = useState("");
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);   // for Edit
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Filter colleges
  const filtered = colleges?.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.collegeName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }) || [];

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Open Add Modal
  const handleAdd = () => {
    setSelectedCollege(null);
    setOpenAddEditModal(true);
  };

  // Open Edit Modal with pre-filled data
  const handleEdit = (college) => {
    setSelectedCollege(college);
    setOpenAddEditModal(true);
  };

  // Open Delete Confirmation
  const handleDeleteClick = (college) => {
    setCollegeToDelete(college);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (collegeToDelete) {
      deleteCollege(collegeToDelete._id);
    }
    setShowDeleteModal(false);
    setCollegeToDelete(null);
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
              Colleges
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#1a6fa8", fontWeight: 500 }}>
              Manage College Applications
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search college..."
              style={{
                height: 36,
                padding: "0 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                width: 220,
              }}
            />

            <button
              onClick={handleAdd}
              style={{
                height: 36,
                padding: "0 16px",
                background: "#1a6fa8",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add College
            </button>
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
                <th style={th}>Payment</th>
                <th style={th}>Registered</th>
                <th style={{ ...th, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingColleges ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 40 }}>
                    <div className="spinner-border text-primary" />
                  </td>
                </tr>
              ) : currentItems.length ? (
                currentItems.map((c, i) => (
                  <tr
                    key={c._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/superadmin/college/${c._id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>{startIndex + i + 1}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>
                        {c.collegeName}
                      </div>
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
                    <td style={td}>
                      <span className={`badge bg-${c.paymentStatus === "Paid" ? "success" : "danger"}`}>
                        {c.paymentStatus || "-"}
                      </span>
                    </td>
                    <td style={td}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td
                      style={{ ...td, textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        <button
                          onClick={() => handleEdit(c)}
                          style={{
                            background: "#e8f4fd",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            cursor: "pointer",
                            color: "#1a6fa8",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c)}
                          style={{
                            background: "#fff5f5",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            cursor: "pointer",
                            color: "#e53e3e",
                            fontSize: 12,
                            fontWeight: 600,
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
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
                    No colleges found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "16px 0" }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} style={paginationBtn}>
              Prev
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                style={{
                  ...paginationBtn,
                  border: currentPage === idx + 1 ? "2px solid #1a6fa8" : "1px solid #ccc",
                  background: currentPage === idx + 1 ? "#e8f4fd" : "#fff",
                }}
              >
                {idx + 1}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} style={paginationBtn}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {openAddEditModal && (
        <div
          onClick={() => setOpenAddEditModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 0,
              borderRadius: 10,
              width: "95%",
              maxWidth: 900,
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <CollegeRegistrationForm
              college={selectedCollege} 
               //college={college}
               collegeId={college._id}          // ← Pre-filled when editing
              onClose={() => setOpenAddEditModal(false)}
            />
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <DeleteCollegeModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          college={collegeToDelete}
          loading={false}           // You can connect real loading state later
        />
      )}
    </div>
  );
}

/* Reusable Styles */
const th = {
  padding: "12px 16px",
  fontSize: 13,
  fontWeight: 600,
  color: "#1a6fa8",
  background: "#f8fafc",
  borderBottom: "2px solid #e5e9f0",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const td = {
  padding: "13px 16px",
  fontSize: 13.5,
  color: "#374151",
  borderBottom: "1px solid #f0f3f7",
};

const paginationBtn = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  cursor: "pointer",
};