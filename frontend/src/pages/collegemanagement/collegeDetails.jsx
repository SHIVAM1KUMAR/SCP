// ─── CollegeDetails ───────────────────────────────────────────────────────────
// Shows full college profile. Used as a modal or a dedicated page.
// Props: college (object), onClose (fn, optional — omit if used as a page)
// ─────────────────────────────────────────────────────────────────────────────

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      {items.filter(([, v]) => v).map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500, marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 500 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

export default function CollegeDetails({ college, onClose }) {
  if (!college) return null;

  const a = college.address || {};
  const b = college.bankDetails || {};
  const d = college.documents || {};

  const fullAddress = [a.street, a.city, a.state, a.pincode, a.country].filter(Boolean).join(", ");

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
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {d.logo
            ? <img src={`${API}/${d.logo}`} alt="logo" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "contain", border: "1px solid #e2e8f0" }} />
            : <div style={{ width: 52, height: 52, borderRadius: 10, background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🏫</div>
          }
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{college.collegeName}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{college.collegeCode}</span>
              <StatusBadge status={college.status} />
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
        )}
      </div>

      <div style={{ padding: "24px" }}>

        {/* Basic */}
        <Section title="Basic Information">
          <InfoGrid items={[
            ["Type",          college.collegeType],
            ["Est. Year",     college.establishedYear],
            ["Affiliation",   college.affiliation],
            ["Email",         college.email],
            ["Phone",         college.phone],
            ["Website",       college.website ? <a href={college.website} target="_blank" rel="noreferrer" style={{ color: "#1a6fa8" }}>{college.website}</a> : null],
          ]} />
        </Section>

        {/* Address */}
        {fullAddress && (
          <Section title="Address">
            <div style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.7 }}>
              {a.street && <div>{a.street}</div>}
              {(a.city || a.state) && <div>{[a.city, a.state].filter(Boolean).join(", ")} {a.pincode}</div>}
              {a.country && <div>{a.country}</div>}
            </div>
          </Section>
        )}

        {/* Payment & Activation */}
        <Section title="Payment & Activation">
          <InfoGrid items={[
            ["Payment Status",  college.paymentStatus],
            ["Amount Paid",     college.paymentAmount ? `₹${college.paymentAmount.toLocaleString("en-IN")}` : "—"],
            ["Payment Date",    college.paymentDate ? new Date(college.paymentDate).toLocaleDateString("en-IN") : "—"],
            ["Activated On",    college.activatedAt ? new Date(college.activatedAt).toLocaleDateString("en-IN") : "—"],
            ["Payment Note",    college.paymentNote],
            ["Rejection Reason",college.rejectionReason],
          ]} />
        </Section>

        {/* Bank */}
        {(b.bankName || b.accountNumber) && (
          <Section title="Bank Details">
            <InfoGrid items={[
              ["Account Holder", b.accountHolderName],
              ["Account No.",    b.accountNumber ? `••••${b.accountNumber.slice(-4)}` : null],
              ["Bank",           b.bankName],
              ["IFSC",           b.ifscCode],
              ["Branch",         b.branch],
            ]} />
          </Section>
        )}

        {/* Documents */}
        {(d.affiliationCert || d.registrationCert || d.logo) && (
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
        <div style={{ fontSize: 12, color: "#cbd5e1", textAlign: "right" }}>
          Registered: {college.createdAt ? new Date(college.createdAt).toLocaleString("en-IN") : "—"}
          {" · "}
          Updated: {college.updatedAt ? new Date(college.updatedAt).toLocaleString("en-IN") : "—"}
        </div>
      </div>
    </Wrapper>
  );
}