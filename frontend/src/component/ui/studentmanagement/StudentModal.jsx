import { useState } from "react";
import Button from "../button/Button";

const EMPTY_FORM = { studentName: "", email: "", status: "Inactive" };

export function StudentModal({ editData, onClose, onSave, saving }) {
  const isEdit = !!editData?._id;
  const [form, setForm] = useState(
    isEdit
      ? { studentName: editData.studentName || "", email: editData.email || "", status: editData.status || "Inactive" }
      : EMPTY_FORM
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = { width: "100%", height: 42, padding: "0 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13.5, fontFamily: "'Outfit', sans-serif", color: "#1e293b", background: "#fff", outline: "none" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.3px" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "28px", maxWidth: 460, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.16)", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{isEdit ? "Edit Student" : "Add Student"}</h3>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94a3b8" }}>{isEdit ? "Update student details" : "Fill in details to add a new student"}</p>
          </div>
          <Button variant="icon" size="icon" onClick={onClose} style={{ color: "#94a3b8" }}>
            ×
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={lbl}>Student Name</label><input style={inp} placeholder="e.g. John Doe" value={form.studentName} onChange={e => set("studentName", e.target.value)} onFocus={e => (e.target.style.borderColor = "#1a6fa8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} /></div>
          <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="student@example.com" value={form.email} onChange={e => set("email", e.target.value)} onFocus={e => (e.target.style.borderColor = "#1a6fa8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} /></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Button variant="outlined" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)} disabled={saving || !form.studentName || !form.email} fullWidth>
            {saving ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save Changes" : "Add Student")}
          </Button>
        </div>
      </div>
    </div>
  );
}
