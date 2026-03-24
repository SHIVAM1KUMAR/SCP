import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import ActivateCollegeModal from "./activateCollege";
import CollegeDetails       from "./collegeDetails";
import CollegeRegistrationForm from "../../component/forms/college/CollegeRegistrationForm";

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, opts = {}) {
  const res  = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json", ...authHeader() }, ...opts });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active:   { bg: "#f0fdf4", color: "#166634", border: "#86efac" },
    Pending:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
    Rejected: { bg: "#fff5f5", color: "#991b1b", border: "#fca5a5" },
    Inactive: { bg: "#f8fafc", color: "#64748b", border: "#cbd5e1" },
  };
  const s = map[status] || map.Inactive;
  return (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

// ─── Payment Badge ────────────────────────────────────────────────────────────
function PayBadge({ status }) {
  const map = {
    Paid:   { bg: "#f0fdf4", color: "#166634" },
    Unpaid: { bg: "#fff5f5", color: "#991b1b" },
    Waived: { bg: "#eff6ff", color: "#1d4ed8" },
  };
  const s = map[status] || { bg: "#f8fafc", color: "#64748b" };
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: s.bg, color: s.color }}>
      {status || "—"}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent, bg }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e9f0", padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value ?? "—"}</div>
        <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ college, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px", maxWidth: 380, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🗑️</div>
        <h3 style={{ textAlign: "center", fontSize: 17, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Delete College?</h3>
        <p style={{ textAlign: "center", fontSize: 13.5, color: "#64748b", lineHeight: 1.5, marginBottom: 24 }}>
          Are you sure you want to permanently delete <strong>{college?.collegeName}</strong>?<br />
          <span style={{ color: "#e53e3e", fontSize: 12 }}>This will also delete the college login account.</span>
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 40, border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#374151", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, height: 40, border: "none", borderRadius: 8, background: "#e53e3e", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Filter Tabs ───────────────────────────────────────────────────────
const STATUS_TABS = ["All", "Pending", "Active", "Rejected", "Inactive"];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CollegeManagement() {
  const toast = useToast();

  const [colleges,      setColleges]      = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [total,         setTotal]         = useState(0);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [page,          setPage]          = useState(1);
  const [rowsPerPage,   setRowsPerPage]   = useState(20);

  // Modal states
  const [activateTarget, setActivateTarget] = useState(null);  // college to activate/reject
  const [detailTarget,   setDetailTarget]   = useState(null);  // college to view
  const [deleteTarget,   setDeleteTarget]   = useState(null);  // college to delete
  const [showRegForm,    setShowRegForm]    = useState(false);

  const totalPages = Math.ceil(total / rowsPerPage);

  // ── Fetch colleges ──────────────────────────────────────────────────────────
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: rowsPerPage });
      if (search)                   params.set("search", search);
      if (statusFilter !== "All")   params.set("status", statusFilter);
      const data = await apiFetch(`/colleges?${params}`);
      setColleges(data.data);
      setTotal(data.total);
    } catch (e) {
      toast(e.message || "Failed to load colleges.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const data = await apiFetch("/colleges/stats");
      setStats(data.data);
    } catch {}
  };

  useEffect(() => { fetchColleges(); }, [fetchColleges]);
  useEffect(() => { fetchStats(); },   []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchColleges(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Activate ────────────────────────────────────────────────────────────────
  const handleActivate = async ({ paymentAmount, paymentNote }) => {
    const data = await apiFetch(`/colleges/${activateTarget._id}/activate`, {
      method: "POST",
      body: JSON.stringify({ paymentAmount, paymentNote }),
    });
    toast(data.message || "College activated!", "success");
    setActivateTarget(null);
    fetchColleges();
    fetchStats();
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const handleReject = async ({ rejectionReason }) => {
    const data = await apiFetch(`/colleges/${activateTarget._id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectionReason }),
    });
    toast(data.message || "College rejected.", "warning");
    setActivateTarget(null);
    fetchColleges();
    fetchStats();
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const c = deleteTarget;
    setDeleteTarget(null);
    try {
      await apiFetch(`/colleges/${c._id}`, { method: "DELETE" });
      toast(`"${c.collegeName}" deleted.`, "warning");
      fetchColleges();
      fetchStats();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  // ── Table styles ────────────────────────────────────────────────────────────
  const th = { padding: "12px 16px", fontSize: 12.5, fontWeight: 700, color: "#1a6fa8", background: "#f8fafc", borderBottom: "2px solid #e5e9f0", textAlign: "left", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.4px" };
  const td = { padding: "13px 16px", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f0f3f7" };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* Stats */}
      {/* <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Colleges"    value={stats?.total}    icon="🏫" accent="#1a6fa8" bg="#e8f4fd" />
        <StatCard label="Active Colleges"   value={stats?.active}   icon="✅" accent="#16a34a" bg="#f0fdf4" />
        <StatCard label="Pending Review"    value={stats?.pending}  icon="⏳" accent="#d97706" bg="#fffbeb" />
        <StatCard label="Rejected"          value={stats?.rejected} icon="❌" accent="#e53e3e" bg="#fff5f5" />
      </div> */}

      {/* Table card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e9f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f3f7", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Colleges</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#1a6fa8", fontWeight: 500 }}>Manage all registered colleges</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} width={14} height={14}>
                <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search colleges…"
                style={{ paddingLeft: 30, paddingRight: 12, height: 36, border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif", color: "#1e293b", outline: "none", width: 210, background: "#fff" }}
                onFocus={e => (e.target.style.borderColor = "#1a6fa8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
            <button onClick={() => setShowRegForm(true)}
              style={{ height: 36, padding: "0 16px", background: "#f8fafc", color: "#1a6fa8", border: "1.5px solid #1a6fa8", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
              🔗 Reg. Form
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: "1px solid #f0f3f7", overflowX: "auto" }}>
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => { setStatusFilter(tab); setPage(1); }}
              style={{ height: 42, padding: "0 16px", border: "none", background: "none", fontSize: 13, fontWeight: statusFilter === tab ? 700 : 500, color: statusFilter === tab ? "#1a6fa8" : "#94a3b8", borderBottom: statusFilter === tab ? "2px solid #1a6fa8" : "2px solid transparent", cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>College</th>
                <th style={th}>Code</th>
                <th style={th}>Type</th>
                <th style={th}>Email</th>
                <th style={th}>Status</th>
                <th style={th}>Payment</th>
                <th style={th}>Registered</th>
                <th style={{ ...th, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: "48px 0" }}>
                  <div style={{ display: "inline-block", width: 24, height: 24, border: "3px solid #e2e8f0", borderTopColor: "#1a6fa8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </td></tr>
              ) : colleges.length === 0 ? (
                <tr><td colSpan={9} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: "48px 0" }}>
                  {search || statusFilter !== "All" ? "No colleges match your filters." : "No colleges registered yet."}
                </td></tr>
              ) : colleges.map((c, i) => (
                <tr key={c._id}
                  onClick={() => setDetailTarget(c)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ ...td, color: "#94a3b8", width: 40 }}>{(page - 1) * rowsPerPage + i + 1}</td>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {c.documents?.logo
                        ? <img src={`${API}/${c.documents.logo}`} alt="" style={{ width: 30, height: 30, borderRadius: 6, objectFit: "contain", border: "1px solid #e2e8f0" }} />
                        : <div style={{ width: 30, height: 30, borderRadius: 6, background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🏫</div>
                      }
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{c.collegeName}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{c.address?.city}{c.address?.state ? `, ${c.address.state}` : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}><span style={{ fontFamily: "monospace", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{c.collegeCode}</span></td>
                  <td style={{ ...td, color: "#64748b" }}>{c.collegeType}</td>
                  <td style={{ ...td, color: "#52637a" }}>{c.email}</td>
                  <td style={td}><StatusBadge status={c.status} /></td>
                  <td style={td}><PayBadge status={c.paymentStatus} /></td>
                  <td style={{ ...td, color: "#94a3b8", fontSize: 12.5 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td style={{ ...td, textAlign: "center", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "nowrap" }} onClick={e => e.stopPropagation()}>

                      {/* Activate/Reject (only for Pending) */}
                      {c.status === "Pending" && (
                        <button onClick={() => setActivateTarget(c)} title="Review (Activate / Reject)"
                          style={{ background: "#fffbeb", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#d97706", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                          ⏳ Review
                        </button>
                      )}

                      {/* Re-activate if inactive/rejected */}
                      {(c.status === "Inactive" || c.status === "Rejected") && (
                        <button onClick={() => setActivateTarget(c)} title="Activate"
                          style={{ background: "#f0fdf4", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                          ✅ Activate
                        </button>
                      )}

                      {/* Delete */}
                      <button onClick={() => setDeleteTarget(c)} title="Delete"
                        style={{ background: "#fff5f5", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#e53e3e", display: "flex", alignItems: "center" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 20px", fontSize: 13, color: "#64748b", borderTop: "1px solid #f0f3f7", flexWrap: "wrap" }}>
            <span>{total} college{total !== 1 ? "s" : ""} total</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>Rows:</span>
                <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                  style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "2px 8px", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                  {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <span>Page {page} of {totalPages || 1}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ border: "1px solid #e2e8f0", borderRadius: 6, background: "none", padding: "3px 10px", fontSize: 16, cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#374151" }}>‹</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  style={{ border: "1px solid #e2e8f0", borderRadius: 6, background: "none", padding: "3px 10px", fontSize: 16, cursor: page >= totalPages ? "not-allowed" : "pointer", color: page >= totalPages ? "#cbd5e1" : "#374151" }}>›</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {activateTarget && (
        <ActivateCollegeModal
          college={activateTarget}
          onClose={() => setActivateTarget(null)}
          onActivate={handleActivate}
          onReject={handleReject}
        />
      )}
      {detailTarget && (
        <CollegeDetails
          college={detailTarget}
          onClose={() => setDetailTarget(null)}
          onUpdate={(updatedCollege) => {
            setColleges(prev => prev.map(c => c._id === updatedCollege._id ? updatedCollege : c));
            setDetailTarget(updatedCollege);
          }}
          onDelete={(id) => {
            setColleges(prev => prev.filter(c => c._id !== id));
            fetchStats();
            setDetailTarget(null);
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          college={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showRegForm && <CollegeRegistrationForm onClose={() => setShowRegForm(false)} />}
    </div>
  );
}