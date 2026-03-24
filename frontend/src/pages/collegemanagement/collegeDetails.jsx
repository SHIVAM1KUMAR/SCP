import { useState } from "react";
import { useToast } from "../../context/ToastContext";

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '');

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

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
      {items.filter(([, v]) => v !== undefined && v !== null && v !== "").map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500, marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 500 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

export default function CollegeDetails({ college, onClose, onUpdate, onDelete }) {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(college ? { ...college } : null);
  const [saving, setSaving] = useState(false);

  if (!college) return null;

  const a = college.address || {};
  const b = college.bankDetails || {};
  const d = college.documents || {};

  const fullAddress = [a.street, a.city, a.state, a.pincode, a.country].filter(Boolean).join(", ");

  const inpStyle = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "'Outfit', sans-serif" };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/colleges/${college._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to update");
      toast("College updated successfully", "success");
      setIsEditing(false);
      if (onUpdate) onUpdate(data.data);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${college.collegeName}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/colleges/${college._id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to delete");
      toast("College deleted", "success");
      if (onDelete) onDelete(college._id);
      if (onClose) onClose();
    } catch(e) {
      toast(e.message, "error");
    }
  };

  const Wrapper = onClose
    ? ({ children }) => (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Outfit', sans-serif" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            {children}
          </div>
        </div>
      )
    : ({ children }) => <div style={{ fontFamily: "'Outfit', sans-serif", padding: "24px", background: "#fff", borderRadius: 16 }}>{children}</div>;

  return (
    <Wrapper>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {d.logo
            ? <img src={`${API}/${d.logo}`} alt="logo" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain", border: "1px solid #e2e8f0" }} />
            : <div style={{ width: 44, height: 44, borderRadius: 10, background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏫</div>
          }
          <div>
            {isEditing ? (
              <input value={form.collegeName} onChange={e => setForm({...form, collegeName: e.target.value})} style={{...inpStyle, width: 200, fontWeight: 700}}/>
            ) : (
              <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{college.collegeName}</div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{college.collegeCode}</span>
              <StatusBadge status={college.status} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} style={{ background: "#f1f5f9", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", color: "#475569", fontWeight: 600, fontSize: 13 }}>Edit</button>
              <button onClick={handleDelete} style={{ background: "#fff5f5", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", color: "#e53e3e", fontWeight: 600, fontSize: 13 }}>Delete</button>
            </>
          ) : (
            <>
              <button onClick={() => { setIsEditing(false); setForm({...college}); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", color: "#475569", fontWeight: 600, fontSize: 13 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ background: "#1a6fa8", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>{saving ? "Saving..." : "Save"}</button>
            </>
          )}
          {onClose && (
            <button onClick={onClose} style={{ pointerEvents: saving ? 'none': 'auto', background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Basic Information */}
        <Section title="Basic Information">
          {isEditing ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{fontSize: 12, color: "#64748b"}}>Type</label><input value={form.collegeType||""} onChange={e=>setForm({...form, collegeType: e.target.value})} style={inpStyle}/></div>
              <div><label style={{fontSize: 12, color: "#64748b"}}>Est. Year</label><input type="number" value={form.establishedYear||""} onChange={e=>setForm({...form, establishedYear: e.target.value})} style={inpStyle}/></div>
              <div><label style={{fontSize: 12, color: "#64748b"}}>Affiliation</label><input value={form.affiliation||""} onChange={e=>setForm({...form, affiliation: e.target.value})} style={inpStyle}/></div>
              <div><label style={{fontSize: 12, color: "#64748b"}}>Email</label><input value={form.email||""} onChange={e=>setForm({...form, email: e.target.value})} style={inpStyle}/></div>
              <div><label style={{fontSize: 12, color: "#64748b"}}>Phone</label><input value={form.phone||""} onChange={e=>setForm({...form, phone: e.target.value})} style={inpStyle}/></div>
              <div><label style={{fontSize: 12, color: "#64748b"}}>Website</label><input value={form.website||""} onChange={e=>setForm({...form, website: e.target.value})} style={inpStyle}/></div>
            </div>
          ) : (
            <InfoGrid items={[
              ["Type",          college.collegeType],
              ["Est. Year",     college.establishedYear],
              ["Affiliation",   college.affiliation],
              ["Email",         college.email],
              ["Phone",         college.phone],
              ["Website",       college.website ? <a href={college.website} target="_blank" rel="noreferrer" style={{ color: "#1a6fa8" }}>{college.website}</a> : null],
            ]} />
          )}
        </Section>

        {/* Address */}
        {(fullAddress || isEditing) && (
          <Section title="Address">
            {isEditing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1/-1" }}><label style={{fontSize: 12, color: "#64748b"}}>Street</label><input value={form.address?.street||""} onChange={e=>setForm({...form, address: {...form.address, street: e.target.value}})} style={inpStyle}/></div>
                <div><label style={{fontSize: 12, color: "#64748b"}}>City</label><input value={form.address?.city||""} onChange={e=>setForm({...form, address: {...form.address, city: e.target.value}})} style={inpStyle}/></div>
                <div><label style={{fontSize: 12, color: "#64748b"}}>State</label><input value={form.address?.state||""} onChange={e=>setForm({...form, address: {...form.address, state: e.target.value}})} style={inpStyle}/></div>
                <div><label style={{fontSize: 12, color: "#64748b"}}>Pincode</label><input value={form.address?.pincode||""} onChange={e=>setForm({...form, address: {...form.address, pincode: e.target.value}})} style={inpStyle}/></div>
                <div><label style={{fontSize: 12, color: "#64748b"}}>Country</label><input value={form.address?.country||""} onChange={e=>setForm({...form, address: {...form.address, country: e.target.value}})} style={inpStyle}/></div>
              </div>
            ) : (
              <div style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.7 }}>
                {a.street && <div>{a.street}</div>}
                {(a.city || a.state) && <div>{[a.city, a.state].filter(Boolean).join(", ")} {a.pincode}</div>}
                {a.country && <div>{a.country}</div>}
              </div>
            )}
          </Section>
        )}

        {/* Courses */}
        <Section title="Courses Offered">
          {(!form.courses || form.courses.length === 0) && !isEditing && (
             <div style={{fontSize: 13, color: "#94a3b8"}}>No courses added</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(form.courses || []).map((c, i) => (
              <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc", position: "relative" }}>
                 {isEditing && (
                   <button onClick={() => setForm({...form, courses: form.courses.filter((_, idx) => idx !== i)})} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "#e53e3e", cursor: "pointer", fontSize: 16 }}>×</button>
                 )}
                 {isEditing ? (
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingRight: 20 }}>
                     <input value={c.courseName||""} onChange={e=>{const nc=[...form.courses]; nc[i].courseName=e.target.value; setForm({...form, courses:nc})}} placeholder="Course Name" style={inpStyle}/>
                     <input value={c.courseCode||""} onChange={e=>{const nc=[...form.courses]; nc[i].courseCode=e.target.value; setForm({...form, courses:nc})}} placeholder="Code" style={inpStyle}/>
                     <input value={c.duration||""} onChange={e=>{const nc=[...form.courses]; nc[i].duration=e.target.value; setForm({...form, courses:nc})}} placeholder="Duration" style={inpStyle}/>
                     <input type="number" value={c.fees||""} onChange={e=>{const nc=[...form.courses]; nc[i].fees=e.target.value; setForm({...form, courses:nc})}} placeholder="Fees" style={inpStyle}/>
                   </div>
                 ) : (
                   <>
                     <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>{c.courseName} ({c.courseCode})</div>
                     <div style={{ fontSize: 12, color: "#64748b" }}>Duration: {c.duration || "N/A"} | Seats: {c.totalSeats || "N/A"} | Fees: ₹{c.fees}</div>
                   </>
                 )}
              </div>
            ))}
            {isEditing && (
              <button onClick={() => setForm({...form, courses: [...(form.courses||[]), {courseName:"", courseCode:"", duration:"", totalSeats:"", fees:""}]})} style={{ padding: "8px", border: "1.5px dashed #cbd5e1", borderRadius: 8, background: "#fafbfc", color: "#475569", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>+ Add Course</button>
            )}
          </div>
        </Section>

        {/* Documents */}
        {!isEditing && (d.affiliationCert || d.registrationCert || d.logo) && (
          <Section title="Documents">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {d.logo && (
                <a href={`${API}/${d.logo}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", textDecoration: "none", fontWeight: 500 }}>
                  🖼️ Logo
                </a>
              )}
              {d.affiliationCert && (
                <a href={`${API}/${d.affiliationCert}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 13, color: "#1d4ed8", textDecoration: "none", fontWeight: 500 }}>
                  📄 Affiliation Cert
                </a>
              )}
              {d.registrationCert && (
                <a href={`${API}/${d.registrationCert}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 13, color: "#1d4ed8", textDecoration: "none", fontWeight: 500 }}>
                  📄 Registration Cert
                </a>
              )}
            </div>
          </Section>
        )}

        {/* Timestamps */}
        {!isEditing && (
          <div style={{ fontSize: 12, color: "#cbd5e1", textAlign: "right" }}>
            Registered: {college.createdAt ? new Date(college.createdAt).toLocaleString("en-IN") : "—"}
            {" · "}
            Updated: {college.updatedAt ? new Date(college.updatedAt).toLocaleString("en-IN") : "—"}
          </div>
        )}
      </div>
    </Wrapper>
  );
}