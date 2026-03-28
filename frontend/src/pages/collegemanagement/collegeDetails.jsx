/**
 * CollegeDetails.jsx
 * Fixed: responsive grid (single column on small screens), scroll inside cards.
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useColleges } from "../../hooks/useCollege";
import CollegeRegistrationForm from "../../component/forms/college/CollegeRegistrationForm";
import DeleteCollegeModal from "./deletecollegeModal";
import ActivateCollegeModal from "./activateCollege";
import { getAuth } from "../../store/slice/auth.slice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
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

// ─── Design tokens ─────────────────────────────────────────────────────────────
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
  Active:   { bg: C.greenBg, color: C.green,  border: "#bbf7d0", dot: C.green  },
  Pending:  { bg: C.amberBg, color: C.amber,  border: "#fde68a", dot: C.amber  },
  Rejected: { bg: C.redBg,   color: C.red,    border: "#fecaca", dot: C.red    },
  Inactive: { bg: "#f1f5f9", color: C.slate,  border: C.border,  dot: C.slateXl },
};

// ─── Components ────────────────────────────────────────────────────────────────

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
            {isImage?"🖼️":isPdf?"📕":"📎"}
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

function LogoAvatar({ docs }) {
  const logoRef = getDocumentRef(docs, "logo");
  const logoUrl = toFileUrl(logoRef);
  const [broken, setBroken] = useState(false);
  return (
    <div style={{ width:64, height:64, borderRadius:14, background:logoUrl&&!broken?"transparent":C.navyLight, border:`2px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
      {logoUrl && !broken
        ? <img src={logoUrl} alt="logo" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={()=>setBroken(true)} />
        : <span style={{ fontSize:28 }}>🏛️</span>}
    </div>
  );
}

function ActionBtn({ label, onClick, variant="default", icon, disabled }) {
  const styles = {
    default: { bg:C.white,  color:C.navy,  border:`1.5px solid ${C.border}` },
    primary: { bg:C.navy,   color:C.white, border:"none" },
    success: { bg:C.green,  color:C.white, border:"none" },
    danger:  { bg:C.red,    color:C.white, border:"none" },
  };
  const s = styles[variant] || styles.default;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ height:40, padding:"0 16px", background:s.bg, color:s.color, border:s.border, borderRadius:9, fontSize:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", fontFamily:font.body, display:"flex", alignItems:"center", gap:6, transition:"all 0.18s", flexShrink:0, opacity:disabled?0.6:1 }}
      onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.opacity="0.85"; e.currentTarget.style.transform="translateY(-1px)"; }}}
      onMouseLeave={e=>{ e.currentTarget.style.opacity=disabled?"0.6":"1"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      {icon && <span>{icon}</span>}{label}
    </button>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function CollegeDetails({ collegeId: collegeIdProp = null, embedded = false } = {}) {
  const { id: routeId } = useParams();
  const navigate   = useNavigate();
  const { role }   = getAuth();
  const listRoute  = role === "Admin" ? "/admin/college" : "/superadmin/college";
  const collegeId = collegeIdProp ?? routeId;

  const {
    college: collegeResponse,
    isCollegeLoading,
    isCollegeError,
    deleteCollegeAsync,
    activateCollegeAsync,
    rejectCollegeAsync,
    fetchCollege,
    isDeletingCollege,
    isActivatingCollege,
    isRejectingCollege,
  } = useColleges(collegeId);

  const college = collegeResponse?.data?.data || collegeResponse?.data || collegeResponse || {};

  const [showEditModal,     setShowEditModal]     = useState(false);
  const [showDeleteModal,   setShowDeleteModal]   = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const pageStyle = embedded
    ? { background:"transparent", minHeight:"auto", padding:0, fontFamily:font.body }
    : { background:"#f4f6fb", minHeight:"100vh", padding:"20px 16px 48px", fontFamily:font.body };
  const showManagementActions = !embedded;

  // ── Loading ──
  if (isCollegeLoading) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, gap:14, fontFamily:font.body }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:`3px solid ${C.border}`, borderTopColor:C.gold, animation:"spin 0.8s linear infinite" }} />
        <span style={{ fontSize:14, color:C.slateXl }}>Loading college details…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not found / error ──
  if (isCollegeError || !college || Object.keys(college).length === 0) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, gap:16, fontFamily:font.body }}>
        <span style={{ fontSize:48 }}>🏛️</span>
        <p style={{ fontSize:16, color:C.slateXl, margin:0 }}>College not found or was deleted.</p>
        <button onClick={()=>navigate(listRoute)} style={{ padding:"10px 24px", background:C.navy, color:C.white, border:"none", borderRadius:9, fontWeight:600, cursor:"pointer", fontFamily:font.body, fontSize:14 }}>
          ← Back to Colleges
        </button>
      </div>
    );
  }

  const docs             = college.documentFiles || college.documents || college.docs || {};
  const addr             = college.address || {};
  const establishedValue = college.established || college.establishedYear || "—";

  // ✅ Receives { id } from DeleteCollegeModal, navigates away after delete
  const handleDeleteConfirm = async ({ id: collegeId }) => {
    await deleteCollegeAsync(collegeId);
    setShowDeleteModal(false);
    navigate(listRoute);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ✅ Responsive grid: 2 cols on wide, 1 col on narrow */
        .cd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 760px) {
          .cd-grid { grid-template-columns: 1fr; }
          .cd-full { grid-column: 1 !important; }
        }

        /* ✅ Responsive info grid inside cards */
        .cd-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 540px) {
          .cd-info-grid { grid-template-columns: 1fr; }
          .cd-info-grid > * { grid-column: 1 !important; }
        }

        /* ✅ Responsive doc grid */
        .cd-doc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .cd-doc-grid { grid-template-columns: 1fr; }
        }

        /* ✅ Header actions wrap on small screens */
        .cd-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .cd-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
      `}</style>

      <div
        style={pageStyle}
        data-embedded={embedded ? "true" : "false"}
        data-management={showManagementActions ? "true" : "false"}
      >

        {/* ── Hero Header ── */}
        <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.border}`, boxShadow:C.shadowMd, overflow:"hidden", marginBottom:20 }}>
          <div style={{ height:5, background:`linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding:"20px 24px" }}>
            <div className="cd-header-row">
              {/* Identity */}
              <div style={{ display:"flex", alignItems:"center", gap:16, minWidth:0 }}>
                <LogoAvatar docs={docs} />
                <div style={{ minWidth:0 }}>
                  <h1 style={{ fontFamily:font.display, fontSize:22, fontWeight:400, color:C.navy, margin:"0 0 5px", letterSpacing:"-0.3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {college.collegeName || "Unnamed College"}
                  </h1>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.slate, fontFamily:font.body, letterSpacing:"0.8px", background:C.navyLight, padding:"3px 10px", borderRadius:6 }}>{college.collegeCode||"—"}</span>
                    <StatusBadge status={college.status||"Inactive"} />
                    {college.collegeType && <span style={{ fontSize:12, color:C.slate, fontFamily:font.body, background:C.cream, border:`1px solid ${C.border}`, padding:"3px 10px", borderRadius:6 }}>{college.collegeType}</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="cd-actions">
                <ActionBtn label="← Back" variant="default" onClick={()=>navigate(listRoute)} />
                {college.status !== "Active" && (
                  <ActionBtn label="Activate" variant="success" icon="✓" onClick={()=>setShowActivateModal(true)} disabled={isActivatingCollege||isRejectingCollege} />
                )}
                <ActionBtn label="Edit" variant="primary" icon="✏️" onClick={()=>setShowEditModal(true)} />
                <ActionBtn label="Delete" variant="danger" icon="🗑" onClick={()=>setShowDeleteModal(true)} disabled={isDeletingCollege} />
              </div>
            </div>

            {/* Stats strip */}
            <div style={{ display:"flex", gap:0, marginTop:16, borderTop:`1px solid ${C.border}`, paddingTop:14, flexWrap:"wrap" }}>
              {[
                { label:"Courses",        value:college.courses?.length||0,  icon:"📚" },
                { label:"Established",    value:college.established||"—",    icon:"📅" },
                { label:"Affiliation",    value:college.affiliation||"—",    icon:"🎓" },
                { label:"Payment",        value:college.paymentStatus||"—",  icon:"💳" },
              ].map((s,i)=>(
                <div key={i} style={{ flex:"1 1 120px", padding:"8px 14px", borderRight:i<3?`1px solid ${C.border}`:"none" }}>
                  <div style={{ fontSize:11, color:C.slateXl, fontFamily:font.body, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:3 }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.navy, fontFamily:font.body, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="cd-grid">

          {/* Basic Info */}
          <SectionCard title="Basic Information" icon="📋">
            <div className="cd-info-grid">
              <InfoField label="College Name"   value={college.collegeName}   fullWidth />
              <InfoField label="College Code"   value={college.collegeCode}   mono />
              <InfoField label="Type"           value={college.collegeType} />
              <InfoField label="Email"          value={college.email} />
              <InfoField label="Phone"          value={college.phone} />
              <InfoField label="Website"        value={college.website} />
              <InfoField label="Established"    value={establishedValue} />
              <InfoField label="Affiliation"    value={college.affiliation} />
              <InfoField label="Payment Status" value={college.paymentStatus} />
              <InfoField label="Location"       value={college.location} />
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard title="Address Information" icon="📍">
            <div className="cd-info-grid">
              <InfoField label="Street / Area" value={addr.street}  fullWidth />
              <InfoField label="City"          value={addr.city} />
              <InfoField label="State"         value={addr.state} />
              <InfoField label="PIN Code"      value={addr.pincode} mono />
              <InfoField label="Country"       value={addr.country} />
            </div>
          </SectionCard>

          {/* Documents — full width */}
          <div className="cd-full" style={{ gridColumn:"1/-1" }}>
            <SectionCard title="Documents & Files" icon="📄">
              <div className="cd-doc-grid" style={{ padding:"20px 24px" }}>
                <FileCard label="College Logo"             filename={getDocumentRef(docs,"logo")} />
                <FileCard label="Affiliation Certificate"  filename={getDocumentRef(docs,"affiliationCert")}  required />
                <FileCard label="Registration Certificate" filename={getDocumentRef(docs,"registrationCert")} />
                <FileCard label="Payment Receipt"          filename={getDocumentRef(docs,"paymentReceipt")}   required />
              </div>
            </SectionCard>
          </div>

          {/* Courses — full width */}
          <div className="cd-full" style={{ gridColumn:"1/-1" }}>
            <SectionCard title={`Courses Offered (${college.courses?.length||0})`} icon="📚" noPad>
              {!college.courses || college.courses.length === 0 ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", gap:10 }}>
                  <span style={{ fontSize:40, opacity:0.25 }}>📚</span>
                  <p style={{ margin:0, fontSize:14, color:C.slateXl, fontFamily:font.body }}>No courses added yet</p>
                </div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:font.body }}>
                  <thead>
                    <tr style={{ background:C.cream, borderBottom:`2px solid ${C.border}` }}>
                      {["#","Course Name","Code","Duration","Total Seats","Annual Fees (₹)","Description"].map(h=>(
                        <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.slate, letterSpacing:"0.6px", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {college.courses.map((c,i)=>(
                      <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, transition:"background 0.15s" }}
                        onMouseEnter={e=>(e.currentTarget.style.background=C.cream)}
                        onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                        <td style={{ padding:"13px 16px", fontSize:12, color:C.slateXl, fontWeight:600 }}>{String(i+1).padStart(2,"0")}</td>
                        <td style={{ padding:"13px 16px", fontSize:14, fontWeight:700, color:C.navy }}>{c.courseName}</td>
                        <td style={{ padding:"13px 16px" }}>
                          <span style={{ fontSize:12, fontWeight:700, fontFamily:"monospace", background:C.navyLight, color:C.navyMid, padding:"3px 8px", borderRadius:5 }}>{c.courseCode}</span>
                        </td>
                        <td style={{ padding:"13px 16px", fontSize:13.5, color:C.slate }}>{c.duration||<span style={{ color:C.slateXl }}>—</span>}</td>
                        <td style={{ padding:"13px 16px", fontSize:13.5, color:C.navy, fontWeight:600 }}>
                          {c.totalSeats ? <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ fontSize:12 }}>👥</span>{c.totalSeats}</span> : <span style={{ color:C.slateXl }}>—</span>}
                        </td>
                        <td style={{ padding:"13px 16px", fontSize:13.5, fontWeight:600, color:C.green }}>
                          {c.fees ? `₹ ${Number(c.fees).toLocaleString("en-IN")}` : <span style={{ color:C.slateXl }}>—</span>}
                        </td>
                        <td style={{ padding:"13px 16px", fontSize:12.5, color:C.slate, maxWidth:220 }}>
                          {c.description
                            ? <span title={c.description} style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{c.description}</span>
                            : <span style={{ color:C.slateXl }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
          </div>

        </div>{/* end grid */}
      </div>

      {/* ── Modals ── */}
      {showEditModal && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(10,20,44,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:700, maxHeight:"92vh", overflow:"hidden", boxShadow:"0 24px 64px rgba(15,32,68,0.18)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.cream, flexShrink:0 }}>
              <h5 style={{ margin:0, fontSize:16, fontWeight:700, color:C.navy, fontFamily:font.body }}>Edit College</h5>
              <button onClick={()=>setShowEditModal(false)} style={{ width:32, height:32, borderRadius:"50%", background:C.white, border:`1px solid ${C.border}`, fontSize:18, color:C.slate, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
            <div style={{ overflowY:"auto", flex:1 }}>
              <CollegeRegistrationForm
                college={college}
                collegeId={college?._id||null}
                onSaved={async()=>{ await fetchCollege?.(); setShowEditModal(false); }}
                onClose={()=>setShowEditModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteCollegeModal
          show={showDeleteModal}
          onClose={()=>setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          college={college}
          loading={isDeletingCollege}
        />
      )}

      {showActivateModal && (
        <ActivateCollegeModal
          college={college}
          onClose={()=>setShowActivateModal(false)}
          onActivate={activateCollegeAsync}
          onReject={rejectCollegeAsync}
          loading={isActivatingCollege||isRejectingCollege}
        />
      )}
    </>
  );
}
