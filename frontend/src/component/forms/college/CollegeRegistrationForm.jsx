import { useState, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = ["Basic Info", "Address", "Documents", "Courses Offered", "Payment"];

const COLLEGE_TYPES = ["Government", "Private", "Deemed", "Autonomous"];

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const INITIAL_FORM = {
  collegeName: "", collegeCode: "", email: "", phone: "", website: "",
  establishedYear: "", collegeType: "", affiliation: "",
  address: { street: "", city: "", state: "", pincode: "", country: "India" },
  courses: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inp = {
  width: "100%", height: 44, padding: "0 14px",
  border: "1.5px solid #e2e8f0", borderRadius: 10,
  fontSize: 14, fontFamily: "'Outfit', sans-serif",
  color: "#1e293b", background: "#fff", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.15s",
};
const lbl = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#64748b", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.4px",
};
const fieldFocus = (e) => (e.target.style.borderColor = "#1a6fa8");
const fieldBlur  = (e) => (e.target.style.borderColor = "#e2e8f0");

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label style={lbl}>{label}{required && <span style={{ color: "#e53e3e" }}> *</span>}</label>
      {children}
    </div>
  );
}

// ─── File Upload Field ────────────────────────────────────────────────────────
function FileField({ label, name, accept, onChange, value, required }) {
  const ref = useRef();
  return (
    <div>
      <label style={lbl}>{label}{required && <span style={{ color: "#e53e3e" }}> *</span>}</label>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: "1.5px dashed #cbd5e1", borderRadius: 10, padding: "16px 14px",
          cursor: "pointer", background: value ? "#f0fdf4" : "#fafbfc",
          display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#1a6fa8")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = value ? "#86efac" : "#cbd5e1")}
      >
        <span style={{ fontSize: 22 }}>{value ? "✅" : "📎"}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: value ? "#166634" : "#475569" }}>
            {value ? value.name : "Click to upload"}
          </div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
            {accept?.replace(/\./g, "").toUpperCase().split(",").join(", ")} — max 5 MB
          </div>
        </div>
      </div>
      <input ref={ref} type="file" name={name} accept={accept} style={{ display: "none" }}
        onChange={e => onChange(name, e.target.files[0])} />
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────
function StepBasic({ form, set }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div style={{ gridColumn: "1/-1" }}>
        <Field label="College Name" required>
          <input style={inp} value={form.collegeName} onChange={e => set("collegeName", e.target.value)}
            placeholder="e.g. St. Xavier's College of Engineering" onFocus={fieldFocus} onBlur={fieldBlur} />
        </Field>
      </div>
      <Field label="College Code" required>
        <input style={{ ...inp, textTransform: "uppercase" }} value={form.collegeCode}
          onChange={e => set("collegeCode", e.target.value.toUpperCase())}
          placeholder="e.g. SXC001" onFocus={fieldFocus} onBlur={fieldBlur} />
      </Field>
      <Field label="College Type" required>
        <select value={form.collegeType} onChange={e => set("collegeType", e.target.value)}
          style={{ ...inp, cursor: "pointer" }} onFocus={fieldFocus} onBlur={fieldBlur}>
          <option value="">Select type…</option>
          {COLLEGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Official Email" required>
        <input style={inp} type="email" value={form.email}
          onChange={e => set("email", e.target.value)}
          placeholder="admin@college.edu.in" onFocus={fieldFocus} onBlur={fieldBlur} />
      </Field>
      <Field label="Phone Number" required>
        <input style={inp} type="tel" value={form.phone}
          onChange={e => set("phone", e.target.value)}
          placeholder="+91 99999 00000" onFocus={fieldFocus} onBlur={fieldBlur} />
      </Field>
      <Field label="Website">
        <input style={inp} value={form.website}
          onChange={e => set("website", e.target.value)}
          placeholder="https://www.college.edu.in" onFocus={fieldFocus} onBlur={fieldBlur} />
      </Field>
      <Field label="Established Year">
        <input style={inp} type="number" value={form.establishedYear}
          onChange={e => set("establishedYear", e.target.value)}
          placeholder="e.g. 1985" min="1800" max={new Date().getFullYear()}
          onFocus={fieldFocus} onBlur={fieldBlur} />
      </Field>
      <div style={{ gridColumn: "1/-1" }}>
        <Field label="Affiliated University">
          <input style={inp} value={form.affiliation}
            onChange={e => set("affiliation", e.target.value)}
            placeholder="e.g. Mumbai University" onFocus={fieldFocus} onBlur={fieldBlur} />
        </Field>
      </div>
    </div>
  );
}

function StepAddress({ form, setAddr }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div style={{ gridColumn: "1/-1" }}>
        <Field label="Street / Area" required>
          <input style={inp} value={form.address.street}
            onChange={e => setAddr("street", e.target.value)}
            placeholder="123, College Road, Near …" onFocus={fieldFocus} onBlur={fieldBlur} />
        </Field>
      </div>
      <Field label="City" required>
        <input style={inp} value={form.address.city}
          onChange={e => setAddr("city", e.target.value)}
          placeholder="Mumbai" onFocus={fieldFocus} onBlur={fieldBlur} />
      </Field>
      <Field label="State" required>
        <select value={form.address.state} onChange={e => setAddr("state", e.target.value)}
          style={{ ...inp, cursor: "pointer" }} onFocus={fieldFocus} onBlur={fieldBlur}>
          <option value="">Select state…</option>
          {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="PIN Code" required>
        <input style={inp} value={form.address.pincode}
          onChange={e => setAddr("pincode", e.target.value)}
          placeholder="400001" maxLength={6} onFocus={fieldFocus} onBlur={fieldBlur} />
      </Field>
      <Field label="Country">
        <input style={inp} value={form.address.country}
          onChange={e => setAddr("country", e.target.value)}
          placeholder="India" onFocus={fieldFocus} onBlur={fieldBlur} />
      </Field>
    </div>
  );
}

function StepDocuments({ files, onFileChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ padding: "12px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 13, color: "#92400e" }}>
        📋 Upload clear scanned copies or photos. Max 5 MB per file. Accepted: JPG, PNG, PDF.
      </div>
      <FileField label="College Logo" name="logo" accept=".jpg,.jpeg,.png"
        value={files.logo} onChange={onFileChange} />
      <FileField label="Affiliation Certificate" name="affiliationCert" required
        accept=".jpg,.jpeg,.png,.pdf" value={files.affiliationCert} onChange={onFileChange} />
      <FileField label="Registration Certificate" name="registrationCert"
        accept=".jpg,.jpeg,.png,.pdf" value={files.registrationCert} onChange={onFileChange} />
    </div>
  );
}

function StepCourses({ form, setForm }) {
  const [adding, setAdding] = useState(false);
  const [courseForm, setCourseForm] = useState({ courseName: "", courseCode: "", duration: "", totalSeats: "", fees: "", description: "" });

  const setC = (k, v) => setCourseForm(f => ({ ...f, [k]: v }));

  const addCourse = () => {
    if (!courseForm.courseName || !courseForm.courseCode || !courseForm.totalSeats || !courseForm.fees) return;
    setForm(f => ({ ...f, courses: [...f.courses, courseForm] }));
    setCourseForm({ courseName: "", courseCode: "", duration: "", totalSeats: "", fees: "", description: "" });
    setAdding(false);
  };

  const removeCourse = (idx) => {
    setForm(f => ({ ...f, courses: f.courses.filter((_, i) => i !== idx) }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {form.courses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {form.courses.map((c, i) => (
            <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#f8fafc", position: "relative" }}>
               <button onClick={() => removeCourse(i)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#e53e3e", cursor: "pointer", fontSize: 18 }}>🗑️</button>
               <h4 style={{ margin: "0 0 6px", fontSize: 15, color: "#1e293b", paddingRight: 30 }}>{c.courseName} <span style={{ fontSize: 12, fontWeight: 500, background: "#e2e8f0", padding: "2px 6px", borderRadius: 4 }}>{c.courseCode}</span></h4>
               <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Duration: {c.duration || "N/A"} | Seats: {c.totalSeats} | Fees: ₹{c.fees}</p>
            </div>
          ))}
        </div>
      )}
      {!adding ? (
        <button onClick={() => setAdding(true)} style={{ padding: "12px", border: "1.5px dashed #1a6fa8", borderRadius: 8, background: "#f0f7ff", color: "#1a6fa8", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>+</span> Add Course
        </button>
      ) : (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h4 style={{ margin: "0 0 16px", fontSize: 15 }}>Add New Course</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Field label="Course Name" required><input style={inp} value={courseForm.courseName} onChange={e=>setC("courseName", e.target.value)} placeholder="e.g. B.Tech Computer Science" /></Field></div>
            <Field label="Course Code" required><input style={inp} value={courseForm.courseCode} onChange={e=>setC("courseCode", e.target.value)} placeholder="e.g. BTCSE" /></Field>
            <Field label="Duration"><input style={inp} value={courseForm.duration} onChange={e=>setC("duration", e.target.value)} placeholder="e.g. 4 Years" /></Field>
            <Field label="Total Seats" required><input style={inp} type="number" value={courseForm.totalSeats} onChange={e=>setC("totalSeats", e.target.value)} placeholder="e.g. 120" /></Field>
            <Field label="Fees (per year)" required><input style={inp} type="number" value={courseForm.fees} onChange={e=>setC("fees", e.target.value)} placeholder="e.g. 150000" /></Field>
            <div style={{ gridColumn: "1/-1" }}><Field label="Description"><textarea style={{...inp, height: 80, resize: "none", paddingTop: 10}} value={courseForm.description} onChange={e=>setC("description", e.target.value)} placeholder="Brief description of the course..." /></Field></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
             <button onClick={() => setAdding(false)} style={{ padding: "8px 16px", background: "none", border: "none", color: "#64748b", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
             <button onClick={addCourse} disabled={!courseForm.courseName || !courseForm.courseCode || !courseForm.totalSeats || !courseForm.fees} style={{ padding: "8px 16px", background: "#1a6fa8", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", opacity: (!courseForm.courseName || !courseForm.courseCode || !courseForm.totalSeats || !courseForm.fees) ? 0.6 : 1 }}>Save Course</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepPayment({ files, onFileChange }) {
  const upiId = import.meta.env.VITE_UPI_ID || "college@upi";
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ padding: "16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, textAlign: "center" }}>
         <h4 style={{ margin: "0 0 12px", fontSize: 16, color: "#1e293b" }}>Scan QR to Pay Registration Fee</h4>
         <div style={{ width: 150, height: 150, margin: "0 auto 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", height: "100%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>[QR CODE]</div>
         </div>
         <p style={{ margin: "0 0 8px", fontSize: 14, color: "#475569" }}>Scan QR or pay to UPI ID below:</p>
         <div style={{ fontWeight: 700, fontSize: 16, color: "#1a6fa8" }}>{upiId}</div>
      </div>
      
      <div style={{ padding: "20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
         <h4 style={{ margin: "0 0 16px", fontSize: 15, color: "#1e293b" }}>Submit Payment Proof</h4>
         <FileField label="Upload Payment Receipt / Screenshot" name="paymentReceipt" required
          accept=".jpg,.jpeg,.png,.pdf" value={files.paymentReceipt} onChange={onFileChange} />
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32, overflowX: "auto", paddingBottom: 10 }}>
      {STEPS.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 14, fontWeight: 700,
                background: done ? "#1a6fa8" : active ? "#1a6fa8" : "#f1f5f9",
                color: done || active ? "#fff" : "#94a3b8",
                border: active ? "2px solid #1a6fa8" : "none",
                boxShadow: active ? "0 0 0 4px #e8f4fd" : "none",
                transition: "all 0.3s",
                flexShrink: 0
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 11.5, fontWeight: active ? 700 : 500, color: active ? "#1a6fa8" : done ? "#64748b" : "#94a3b8", whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, minWidth: 30, height: 2, background: done ? "#1a6fa8" : "#e2e8f0", margin: "0 8px", marginBottom: 22, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Validation per step ──────────────────────────────────────────────────────
function validate(step, form, files) {
  if (step === 0) {
    if (!form.collegeName.trim())  return "College Name is required.";
    if (!form.collegeCode.trim())  return "College Code is required.";
    if (!form.email.trim())        return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email.";
    if (!form.phone.trim())        return "Phone is required.";
    if (!form.collegeType)         return "College Type is required.";
  }
  if (step === 1) {
    if (!form.address.street.trim())  return "Street is required.";
    if (!form.address.city.trim())    return "City is required.";
    if (!form.address.state)          return "State is required.";
    if (!form.address.pincode.trim()) return "PIN Code is required.";
    if (!/^\d{6}$/.test(form.address.pincode)) return "PIN Code must be 6 digits.";
  }
  if (step === 2) {
    if (!files.affiliationCert) return "Affiliation Certificate is required.";
  }
  if (step === 3) {
    // courses optional? We can require at least 1
    // if (form.courses.length === 0) return "Please add at least one course.";
  }
  if (step === 4) {
    if (!files.paymentReceipt) return "Payment Receipt is required.";
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CollegeRegistrationForm({ onClose }) {
  const [form,    setForm]    = useState(INITIAL_FORM);
  const [files,   setFiles]   = useState({});
  const [step,    setStep]    = useState(0);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set     = (k, v)    => setForm(f => ({ ...f, [k]: v }));
  const setAddr = (k, v)    => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));
  const setFile = (k, file) => setFiles(f => ({ ...f, [k]: file }));

  const handleNext = () => {
    const err = validate(step, form, files);
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  };

  const handleBack = () => { setError(""); setStep(s => s - 1); };

  const handleSubmit = async () => {
    const err = validate(step, form, files);
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    try {
      const fd = new FormData();
      // Flatten form fields
      fd.append("collegeName",    form.collegeName);
      fd.append("collegeCode",    form.collegeCode);
      fd.append("email",          form.email);
      fd.append("phone",          form.phone);
      fd.append("website",        form.website);
      fd.append("establishedYear",form.establishedYear);
      fd.append("collegeType",    form.collegeType);
      fd.append("affiliation",    form.affiliation);
      fd.append("courses",        JSON.stringify(form.courses));
      
      // Nested objects
      fd.append("address[street]",  form.address.street);
      fd.append("address[city]",    form.address.city);
      fd.append("address[state]",   form.address.state);
      fd.append("address[pincode]", form.address.pincode);
      fd.append("address[country]", form.address.country);
      
      // Files
      if (files.logo)             fd.append("logo",             files.logo);
      if (files.affiliationCert)  fd.append("affiliationCert",  files.affiliationCert);
      if (files.registrationCert) fd.append("registrationCert", files.registrationCert);
      if (files.paymentReceipt)   fd.append("paymentReceipt",   files.paymentReceipt);

      const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000";
      const res = await fetch(`${API_URL}/colleges/register`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.10)" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 12px" }}>Registration Submitted!</h2>
          <p style={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.7, margin: "0 0 28px" }}>
            Your application for <strong>{form.collegeName}</strong> along with {form.courses.length} courses and payment receipt has been received.<br />
            Our team will review your details and verify payment.
          </p>
          <button onClick={onClose} style={{ padding: "10px 24px", background: "#1a6fa8", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    );
  }

  // ── Form Modal ──────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="hide-scroll" style={{ width: "100%", maxWidth: 640, maxHeight: "95vh", overflowY: "auto", background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.10)", position: "relative" }}>
        
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: 24, color: "#94a3b8", cursor: "pointer", zIndex: 10 }}>×</button>

        <div style={{ padding: "36px 40px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Register College</h1>
            <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>Complete all steps to apply for listing</p>
          </div>

          <StepBar current={step} />

          {/* Step content */}
          {step === 0 && <StepBasic   form={form} set={set} />}
          {step === 1 && <StepAddress form={form} setAddr={setAddr} />}
          {step === 2 && <StepDocuments files={files} onFileChange={setFile} />}
          {step === 3 && <StepCourses form={form} setForm={setForm} />}
          {step === 4 && <StepPayment files={files} onFileChange={setFile} />}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#991b1b", display: "flex", alignItems: "center", gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
            <button
              onClick={handleBack}
              disabled={step === 0}
              style={{ height: 44, padding: "0 24px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff", color: step === 0 ? "#cbd5e1" : "#374151", fontSize: 14, fontWeight: 500, cursor: step === 0 ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                style={{ height: 44, padding: "0 32px", border: "none", borderRadius: 10, background: "#1a6fa8", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ height: 44, padding: "0 32px", border: "none", borderRadius: 10, background: loading ? "#93c5fd" : "#1a6fa8", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 8 }}
              >
                {loading ? "Submitting…" : "Submit Application ✓"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}