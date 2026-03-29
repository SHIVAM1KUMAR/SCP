/**
 * StudentDetails.jsx
 * Matches CollegeDetails.jsx pattern — responsive grid, same design tokens.
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudents } from "../../hooks/useStudents";
import StudentRegistrationForm from "../../component/forms/student/studentRegistration";
import DeleteStudentModal from "./deleteStudentModal";
import ReviewStudentModal from "./reveiwStudentmodal";
import { getAuth } from "../../store/slice/auth.slice";
import ActivateStudentModal from "./activateStudentModal";

const BASE_URL      = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FILE_BASE_URL = BASE_URL.replace(/\/api\/?$/, "");

const toFileUrl = (value) => {
  if (!value) return "";
  const normalized = String(value).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) return normalized;
  const uploadsMatch = normalized.match(/(?:^|\/)uploads\/(.+)$/i);
  if (uploadsMatch?.[1]) {
    const uploadPath = uploadsMatch[1].split("/").map((s) => encodeURIComponent(s)).join("/");
    return `${FILE_BASE_URL}/uploads/${uploadPath}`;
  }
  if (/^[a-zA-Z]:\//.test(normalized)) {
    return `${FILE_BASE_URL}/uploads/${encodeURIComponent(normalized.split("/").pop())}`;
  }
  return `${FILE_BASE_URL}/${normalized.replace(/^\/+/, "")}`;
};

const getDocumentRef = (docs, key) =>
  docs?.[key]?.url || docs?.[key]?.path || docs?.[key] || "";

// ─── Design tokens (same as college) ──────────────────────────────────────────
const C = {
  navy: "#0f2044", navyMid: "#1a3460", navyLight: "#e8eef8",
  gold: "#c9973a", goldLt: "#fef3d7",
  cream: "#faf8f4", white: "#ffffff",
  slate: "#64748b", slateXl: "#94a3b8", border: "#e2e8f4",
  red: "#dc2626", redBg: "#fef2f2",
  green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb",
  shadow: "0 2px 16px rgba(15,32,68,0.08)",
  shadowMd: "0 4px 24px rgba(15,32,68,0.11)",
};
const font = {
  display: "'DM Serif Display', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
};

const STATUS = {
  Approved: { bg: C.greenBg, color: C.green,  border: "#bbf7d0", dot: C.green  },
  Pending:  { bg: C.amberBg, color: C.amber,  border: "#fde68a", dot: C.amber  },
  Rejected: { bg: C.redBg,   color: C.red,    border: "#fecaca", dot: C.red    },
  Inactive: { bg: "#f1f5f9", color: C.slate,  border: C.border,  dot: C.slateXl },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.Inactive;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontSize:12, fontWeight:700, fontFamily:font.body, letterSpacing:"0.4px" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
      {status}
    </span>
  );
}

function SectionCard({ title, icon, children, noPad }) {
  return (
    <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflow:"hidden", minWidth:0 }}>
      <div style={{ padding:"16px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10, background:C.cream }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:C.navy, fontFamily:font.body, letterSpacing:"0.2px" }}>{title}</h3>
      </div>
      <div style={noPad ? { overflowX:"auto" } : { padding:"20px 24px" }}>
        {children}
      </div>
    </div>
  );
}

function InfoField({ label, value, fullWidth, mono }) {
  return (
    <div style={{ gridColumn:fullWidth?"1/-1":undefined, minWidth:0 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.slateXl, letterSpacing:"0.7px", textTransform:"uppercase", fontFamily:font.body, marginBottom:5 }}>
        {label}
      </div>
      <div style={{ fontSize:14, fontWeight:500, color:value?C.navy:C.slateXl, fontFamily:mono?"monospace":font.body, background:value?C.cream:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:9, padding:"10px 13px", minHeight:42, display:"flex", alignItems:"center", letterSpacing:mono?"0.5px":undefined, wordBreak:"break-all" }}>
        {value || <span style={{ color:C.slateXl, fontStyle:"italic", fontSize:13 }}>Not provided</span>}
      </div>
    </div>
  );
}

function FileCard({ label, filename, required }) {
  const fileRef = typeof filename === "string" ? filename : filename?.url || filename?.path || filename?.name || "";
  const fileUrl = toFileUrl(fileRef);

  if (!fileUrl) {
    return (
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.slateXl, letterSpacing:"0.7px", textTransform:"uppercase", fontFamily:font.body, marginBottom:5 }}>
          {label}{required && <span style={{ color:C.red }}> *</span>}
        </div>
        <div style={{ border:`1.5px dashed ${C.border}`, borderRadius:10, padding:"16px", background:"#f8fafc", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:22, opacity:0.3 }}>📄</span>
          <span style={{ fontSize:13, color:C.slateXl, fontStyle:"italic" }}>No file uploaded</span>
        </div>
      </div>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileRef);
  const isPdf   = /\.pdf$/i.test(fileRef);
  const name    = fileRef.split("/").pop();

  return (
    <div style={{ minWidth:0 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.slateXl, letterSpacing:"0.7px", textTransform:"uppercase", marginBottom:5 }}>{label}</div>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
        <div style={{ border:`1.5px solid ${C.border}`, borderRadius:10, padding:"13px 16px", background:C.cream, display:"flex", alignItems:"center", gap:13, cursor:"pointer" }}>
          <div style={{ width:40, height:40, borderRadius:8, flexShrink:0, background:isImage?"#e0f2fe":isPdf?"#fee2e2":"#e8eef8", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {isImage ? "🖼️" : isPdf ? "📕" : "📎"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:13, color:C.navy, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</div>
            <div style={{ fontSize:12, color:C.slateXl }}>Click to view</div>
          </div>
          <span style={{ color:C.gold, flexShrink:0 }}>↗</span>
        </div>
      </a>
    </div>
  );
}

function PhotoAvatar({ docs }) {
  const photoRef = getDocumentRef(docs, "photo");
  const photoUrl = toFileUrl(photoRef);
  const [broken, setBroken] = useState(false);
  return (
    <div style={{ width:64, height:64, borderRadius:14, background:photoUrl&&!broken?"transparent":C.navyLight, border:`2px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
      {photoUrl && !broken
        ? <img src={photoUrl} alt="student" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={() => setBroken(true)} />
        : <span style={{ fontSize:28 }}>🎓</span>}
    </div>
  );
}

function ActionBtn({ label, onClick, variant = "default", icon, disabled }) {
  const styles = {
    default: { bg:C.white, color:C.navy, border:`1.5px solid ${C.border}` },
    primary: { bg:C.navy,  color:C.white, border:"none" },
    success: { bg:C.green, color:C.white, border:"none" },
    danger:  { bg:C.red,   color:C.white, border:"none" },
  };
  const s = styles[variant] || styles.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ height:40, padding:"0 16px", background:s.bg, color:s.color, border:s.border, borderRadius:9, fontSize:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", fontFamily:font.body, display:"flex", alignItems:"center", gap:6, transition:"all 0.18s", flexShrink:0, opacity:disabled?0.6:1 }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.opacity="0.85"; e.currentTarget.style.transform="translateY(-1px)"; }}}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = disabled ? "0.6" : "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {icon && <span>{icon}</span>}{label}
    </button>
  );
}

function AcademicBadge({ label, pct, board, year }) {
  const color = pct >= 75 ? C.green : pct >= 50 ? C.amber : C.red;
  return (
    <div style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px", minWidth:0 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.slateXl, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
        <span style={{ fontSize:26, fontWeight:700, color, fontFamily:font.display }}>{pct ? `${pct}%` : "—"}</span>
      </div>
      <div style={{ fontSize:12, color:C.slate }}>{board || "—"} {year ? `· ${year}` : ""}</div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function StudentDetails({ studentId: studentIdProp = null, embedded = false } = {}) {
  const { id: routeId } = useParams();
  const navigate        = useNavigate();
  const { role }        = getAuth();
  const roleLower       = String(role || "").toLowerCase();
  const isStudent       = roleLower === "student";
  const isAdmin         = roleLower === "admin";
  const listRoute       = isStudent ? "/student/colleges" : isAdmin ? "/admin/student" : "/superadmin/student";
  const studentId       = studentIdProp ?? routeId;

  const {
    student: studentResponse,
    isStudentLoading,
    isStudentError,
    deleteStudentAsync,
    activateStudentAsync,
    approveStudentAsync,
    rejectStudentAsync,
    fetchStudent,
    isDeletingStudent,
    isActivatingStudent,
    isApprovingStudent,
    isRejectingStudent,
  } = useStudents(studentId);

  const student = studentResponse?.data?.data || studentResponse?.data || studentResponse || {};

  const [showEditModal,    setShowEditModal]    = useState(false);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [showReviewModal,  setShowReviewModal]  = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const showManagementActions = !embedded && !isStudent;
  const showProfileActions = embedded && isStudent;
  const canActivateStudent =
    showManagementActions &&
    ["Approved", "Inactive"].includes(student.status);

  const pageStyle = embedded
    ? { background:"transparent", minHeight:"auto", padding:0, fontFamily:font.body }
    : { background:"#f4f6fb", minHeight:"100vh", padding:"20px 16px 48px", fontFamily:font.body };

  // ── Loading ──
  if (isStudentLoading) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, gap:14, fontFamily:font.body }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:`3px solid ${C.border}`, borderTopColor:C.gold, animation:"spin 0.8s linear infinite" }} />
        <span style={{ fontSize:14, color:C.slateXl }}>Loading student details…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not found / error ──
  if (isStudentError || !student || Object.keys(student).length === 0) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, gap:16, fontFamily:font.body }}>
        <span style={{ fontSize:48 }}>🎓</span>
        <p style={{ fontSize:16, color:C.slateXl, margin:0 }}>Student not found or was deleted.</p>
        <button
          onClick={() => navigate(listRoute)}
          style={{ padding:"10px 24px", background:C.navy, color:C.white, border:"none", borderRadius:9, fontWeight:600, cursor:"pointer", fontFamily:font.body, fontSize:14 }}
        >
          ← Back to Students
        </button>
      </div>
    );
  }

  const docs  = student.documentFiles || student.documents || student.docs || {};
  const addr  = student.address || {};
  const fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();

  const handleDeleteConfirm = async ({ id }) => {
    await deleteStudentAsync(id);
    setShowDeleteModal(false);
    navigate(listRoute);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .sd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 760px) {
          .sd-grid { grid-template-columns: 1fr; }
          .sd-full { grid-column: 1 !important; }
        }
        .sd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 540px) {
          .sd-info-grid { grid-template-columns: 1fr; }
          .sd-info-grid > * { grid-column: 1 !important; }
        }
        .sd-doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .sd-doc-grid { grid-template-columns: 1fr; } }
        .sd-header-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .sd-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .sd-academic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 540px) { .sd-academic-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={pageStyle}>

        {/* ── Hero Header ── */}
        <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.border}`, boxShadow:C.shadowMd, overflow:"hidden", marginBottom:20 }}>
          <div style={{ height:5, background:`linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding:"20px 24px" }}>
            <div className="sd-header-row">
              {/* Identity */}
              <div style={{ display:"flex", alignItems:"center", gap:16, minWidth:0 }}>
                <PhotoAvatar docs={docs} />
                <div style={{ minWidth:0 }}>
                  <h1 style={{ fontFamily:font.display, fontSize:22, fontWeight:400, color:C.navy, margin:"0 0 5px", letterSpacing:"-0.3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {fullName || "Unnamed Student"}
                  </h1>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <StatusBadge status={student.status || "Pending"} />
                    {student.gender && (
                      <span style={{ fontSize:12, color:C.slate, fontFamily:font.body, background:C.cream, border:`1px solid ${C.border}`, padding:"3px 10px", borderRadius:6 }}>{student.gender}</span>
                    )}
                    {student.category && (
                      <span style={{ fontSize:12, fontWeight:700, color:C.slate, fontFamily:font.body, letterSpacing:"0.8px", background:C.navyLight, padding:"3px 10px", borderRadius:6 }}>{student.category}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {showManagementActions && (
                <div className="sd-actions">
                  <ActionBtn label="← Back" variant="default" onClick={() => navigate(listRoute)} />
                  {student.status !== "Approved" && (
                    <ActionBtn label="Review" variant="success" icon="✓" onClick={() => setShowReviewModal(true)} disabled={isApprovingStudent || isRejectingStudent} />
                  )}
                  {canActivateStudent && (
                    <ActionBtn
                      label="Activate"
                      variant="success"
                      icon="✓"
                      onClick={() => setShowActivateModal(true)}
                      disabled={isActivatingStudent || isRejectingStudent}
                    />
                  )}
                  <ActionBtn label="Edit" variant="primary" icon="✏️" onClick={() => setShowEditModal(true)} />
                  <ActionBtn label="Delete" variant="danger" icon="🗑" onClick={() => setShowDeleteModal(true)} disabled={isDeletingStudent} />
                </div>
              )}

              {showProfileActions && (
                <div className="sd-actions">
                  <ActionBtn label="Edit" variant="primary" icon="✏️" onClick={() => setShowEditModal(true)} />
                  <ActionBtn label="Delete" variant="danger" icon="🗑" onClick={() => setShowDeleteModal(true)} disabled={isDeletingStudent} />
                </div>
              )}
            </div>

            {/* Stats strip */}
            <div style={{ display:"flex", gap:0, marginTop:16, borderTop:`1px solid ${C.border}`, paddingTop:14, flexWrap:"wrap" }}>
              {[
                { label:"10th %",         value: student.tenthPercentage  ? `${student.tenthPercentage}%`  : "—", icon:"📗" },
                { label:"12th %",         value: student.twelfthPercentage ? `${student.twelfthPercentage}%` : "—", icon:"📘" },
                { label:"Entrance Exam",  value: student.entranceExamName  || "—", icon:"🏆" },
                { label:"AIR / Score",    value: student.entranceExamRank  ? `#${student.entranceExamRank}` : student.entranceExamScore || "—", icon:"🎯" },
              ].map((s, i) => (
                <div key={i} style={{ flex:"1 1 120px", padding:"8px 14px", borderRight:i<3?`1px solid ${C.border}`:"none" }}>
                  <div style={{ fontSize:11, color:C.slateXl, fontFamily:font.body, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:3 }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.navy, fontFamily:font.body, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="sd-grid">

          {/* Personal Info */}
          <SectionCard title="Personal Information" icon="👤">
            <div className="sd-info-grid">
              <InfoField label="Full Name"     value={fullName}              fullWidth />
              <InfoField label="Email"         value={student.email} />
              <InfoField label="Mobile"        value={student.phone} />
              <InfoField label="Date of Birth" value={student.dateOfBirth} />
              <InfoField label="Age"           value={student.age} />
              <InfoField label="Blood Group"   value={student.bloodGroup} />
              <InfoField label="Nationality"   value={student.nationality} />
              <InfoField label="Aadhar No."    value={student.aadharNumber ? "•••• •••• " + student.aadharNumber.slice(-4) : ""} mono />
            </div>
          </SectionCard>

          {/* Guardian Info */}
          <SectionCard title="Parent / Guardian" icon="👨‍👩‍👦">
            <div className="sd-info-grid">
              <InfoField label="Father / Son of" value={student.fatherName}    fullWidth />
              <InfoField label="Mother's Name"   value={student.motherName} />
              <InfoField label="Guardian Phone"  value={student.guardianPhone} />
            </div>

            {/* Address inside same card */}
            <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.slateXl, letterSpacing:"0.7px", textTransform:"uppercase", marginBottom:12 }}>📍 Address</div>
              <div className="sd-info-grid">
                <InfoField label="Street / Area" value={addr.street}  fullWidth />
                <InfoField label="City"          value={addr.city} />
                <InfoField label="State"         value={addr.state} />
                <InfoField label="PIN Code"      value={addr.pincode} mono />
                <InfoField label="Country"       value={addr.country} />
              </div>
            </div>
          </SectionCard>

          {/* Academic Records — full width */}
          <div className="sd-full" style={{ gridColumn:"1/-1" }}>
            <SectionCard title="Academic Records" icon="📚">
              <div className="sd-academic-grid" style={{ marginBottom:20 }}>
                <AcademicBadge
                  label="Class 10th"
                  pct={student.tenthPercentage}
                  board={student.tenthBoard}
                  year={student.tenthYear}
                />
                <AcademicBadge
                  label="Class 12th"
                  pct={student.twelfthPercentage}
                  board={student.twelfthBoard}
                  year={student.twelfthYear}
                />
              </div>

              <div className="sd-info-grid">
                <InfoField label="10th School"      value={student.tenthSchool} />
                <InfoField label="10th Marks"       value={student.tenthMarks} />
                <InfoField label="12th School"      value={student.twelfthSchool} />
                <InfoField label="12th Marks"       value={student.twelfthMarks} />
              </div>

              {/* Entrance exam */}
              {student.entranceExamName && (
                <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.slateXl, letterSpacing:"0.7px", textTransform:"uppercase", marginBottom:12 }}>🏆 Entrance Exam</div>
                  <div className="sd-info-grid">
                    <InfoField label="Exam Name"   value={student.entranceExamName} />
                    <InfoField label="Roll Number" value={student.entranceExamRollNo} mono />
                    <InfoField label="Year"        value={student.entranceExamYear} />
                    <InfoField label="Score"       value={student.entranceExamScore} />
                    <InfoField label="AIR"         value={student.entranceExamRank} />
                    <InfoField label="Other Details" value={student.otherExamDetails} fullWidth />
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Documents — full width */}
          <div className="sd-full" style={{ gridColumn:"1/-1" }}>
            <SectionCard title="Documents & Files" icon="📄">
              <div className="sd-doc-grid" style={{ padding:"20px 24px" }}>
                <FileCard label="Passport Photograph"           filename={getDocumentRef(docs, "photo")}            required />
                <FileCard label="Aadhar Card"                   filename={getDocumentRef(docs, "aadharCard")}       required />
                <FileCard label="10th Marksheet"               filename={getDocumentRef(docs, "tenthMarksheet")}   required />
                <FileCard label="12th Marksheet"               filename={getDocumentRef(docs, "twelfthMarksheet")} required />
                <FileCard label="Entrance Exam Certificate"    filename={getDocumentRef(docs, "entranceCert")} />
                <FileCard label="Caste Certificate"            filename={getDocumentRef(docs, "casteCertificate")} />
              </div>
            </SectionCard>
          </div>

        </div>{/* end grid */}
      </div>

      {/* ── Modals ── */}
      {showEditModal && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(10,20,44,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:700, maxHeight:"92vh", overflow:"hidden", boxShadow:"0 24px 64px rgba(15,32,68,0.18)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.cream, flexShrink:0 }}>
              <h5 style={{ margin:0, fontSize:16, fontWeight:700, color:C.navy, fontFamily:font.body }}>Edit Student</h5>
              <button onClick={() => setShowEditModal(false)} style={{ width:32, height:32, borderRadius:"50%", background:C.white, border:`1px solid ${C.border}`, fontSize:18, color:C.slate, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
            <div style={{ overflowY:"auto", flex:1 }}>
              <StudentRegistrationForm
                student={student}
                studentId={student?._id || null}
                onSaved={async () => { await fetchStudent?.(); setShowEditModal(false); }}
                onClose={() => setShowEditModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteStudentModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          student={student}
          loading={isDeletingStudent}
        />
      )}

      {showReviewModal && (
        <ReviewStudentModal
          student={student}
          onClose={() => setShowReviewModal(false)}
          onApprove={approveStudentAsync}
          onReject={rejectStudentAsync}
          loading={isApprovingStudent || isRejectingStudent}
        />
      )}

      {showActivateModal && (
        <ActivateStudentModal
          student={student}
          onClose={() => setShowActivateModal(false)}
          onActivate={activateStudentAsync}
          onReject={rejectStudentAsync}
          loading={isActivatingStudent || isRejectingStudent}
        />
      )}
    </>
  );
}
