import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useStudents } from "../../hooks/studentmanagement/useStudents";
import { StatusBadge } from "../../component/ui/studentmanagement/StatusBadge";
import { ConfirmModal } from "../../component/ui/studentmanagement/ConfirmModal";
import { StudentModal } from "../../component/ui/studentmanagement/StudentModal";

export default function StudentManagement() {
  const toast = useToast();
  
  const { students, fetchStudents, handleSave, handleDelete, handleActivate, loading, saving, activating } = useStudents(toast);

  const [search, setSearch]             = useState("");
  const [rowsPerPage, setRowsPerPage]   = useState(20);
  const [page, setPage]                 = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const [editData, setEditData]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const onSave = async (form) => {
    const success = await handleSave(form, editData);
    if (success) {
      setShowModal(false);
      setEditData(null);
    }
  };

  const onDelete = async () => {
    const success = await handleDelete(deleteTarget);
    if (success) setDeleteTarget(null);
  };

  const filtered   = students.filter(s => {
    const q = search.toLowerCase();
    return s.studentName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const start      = (page - 1) * rowsPerPage;
  const paginated  = filtered.slice(start, start + rowsPerPage);

  const th = { padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#1a6fa8", background: "#f8fafc", borderBottom: "2px solid #e5e9f0", textAlign: "left", whiteSpace: "nowrap" };
  const td = { padding: "13px 16px", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f0f3f7" };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Table card */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e9f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f3f7", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Students</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#1a6fa8", fontWeight: 500 }}>Manage Student Intake</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} width={14} height={14}>
                <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
              </svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search Student..."
                style={{ paddingLeft: 30, paddingRight: 12, height: 36, border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif", color: "#1e293b", outline: "none", width: 200, background: "#fff" }}
                onFocus={e => (e.target.style.borderColor = "#1a6fa8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
            <button onClick={() => { setEditData(null); setShowModal(true); }}
              style={{ height: 36, padding: "0 16px", background: "#1a6fa8", color: "#fff", border: "none", borderRadius: 8, fontSize: 13.5, fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Student
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Student Name</th>
                <th style={th}>Email</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: "48px 0" }}>
                  {search ? "No students match your search." : "No students yet — click 'Add Student' to get started."}
                </td></tr>
              ) : (
                paginated.map((s, i) => (
                  <tr key={s._id || i}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ ...td, color: "#94a3b8", width: 40 }}>{start + i + 1}</td>
                    <td style={{ ...td, fontWeight: 500, color: "#1e293b" }}>{s.studentName}</td>
                    <td style={{ ...td, color: "#52637a" }}>{s.email}</td>
                    <td style={td}><StatusBadge status={s.status} /></td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        {s.status === "Inactive" && (
                           <button onClick={() => handleActivate(s._id)} disabled={activating === s._id} title="Activate"
                             style={{ background: "#edf7ee", border: "none", borderRadius: 6, padding: "6px 10px", cursor: activating === s._id ? "not-allowed" : "pointer", color: "#2a7a35", display: "flex", alignItems: "center", fontSize: 12, fontWeight: 600 }}>
                             {activating === s._id ? "..." : "Activate"}
                           </button>
                        )}
                        <button onClick={() => { setEditData(s); setShowModal(true); }} title="Edit"
                          style={{ background: "#e8f4fd", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#1a6fa8", display: "flex", alignItems: "center" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(s)} title="Delete"
                          style={{ background: "#fff5f5", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#e53e3e", display: "flex", alignItems: "center" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, padding: "12px 20px", fontSize: 13, color: "#64748b", borderTop: "1px solid #f0f3f7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Rows:</span>
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "2px 8px", fontSize: 13, fontFamily: "'Outfit', sans-serif", color: "#1e293b" }}>
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <span>{start + 1}–{Math.min(start + rowsPerPage, filtered.length)} of {filtered.length}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ border: "1px solid #e2e8f0", borderRadius: 6, background: "none", padding: "3px 10px", fontSize: 16, cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#374151" }}>‹</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                style={{ border: "1px solid #e2e8f0", borderRadius: 6, background: "none", padding: "3px 10px", fontSize: 16, cursor: page >= totalPages ? "not-allowed" : "pointer", color: page >= totalPages ? "#cbd5e1" : "#374151" }}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal    && <StudentModal editData={editData} saving={saving} onClose={() => { setShowModal(false); setEditData(null); }} onSave={onSave} />}
      {deleteTarget && <ConfirmModal student={deleteTarget} onConfirm={onDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
