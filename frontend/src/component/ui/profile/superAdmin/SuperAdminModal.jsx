import { useMemo, useState } from "react";

const EMPTY_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  roleName: "",
  npiNumber: "",
  employmentType: "",
  gender: "",
  dob: "",
  hireDate: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  contactName: "",
  relationship: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
};

const inputStyle = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  border: "1.5px solid #e2eaf4",
  borderRadius: 10,
  fontSize: 13.5,
  fontFamily: "'Outfit', sans-serif",
  color: "#1e293b",
  backgroundColor: "#f8fafc",
  outline: "none",
  transition: "border-color 0.18s, box-shadow 0.18s, background 0.18s",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.55px",
  fontFamily: "'Outfit', sans-serif",
};

const fieldIcons = {
  firstName: "👤",
  middleName: "👤",
  lastName: "👤",
  email: "✉️",
  phoneNumber: "📞",
  gender: "⚧",
  roleName: "🏷️",
  npiNumber: "🪪",
  employmentType: "🏢",
  dob: "🎂",
  hireDate: "📅",
};

const selectOptions = {
  gender: ["Male", "Female", "Other", "Prefer not to say"],
  employmentType: ["Internal", "External", "Contractor", "Consultant"],
};

function Field({ label, fieldKey, value, onChange, type = "text", placeholder }) {
  const [focused, setFocused] = useState(false);
  const isSelect = !!selectOptions[fieldKey];
  const isReadOnly = fieldKey === "email";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>
        <span style={{ fontSize: 13 }}>{fieldIcons[fieldKey]}</span>
        {label}
      </label>
      {isSelect ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            cursor: "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            backgroundColor: focused ? "#fff" : "#f8fafc",
            paddingRight: 36,
            borderColor: focused ? "#1a6fa8" : "#e2eaf4",
            boxShadow: focused ? "0 0 0 3px rgba(26,111,168,0.10)" : "none",
            color: value ? "#1e293b" : "#94a3b8",
          }}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {selectOptions[fieldKey].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          style={{
            ...inputStyle,
            borderColor: focused ? "#1a6fa8" : "#e2eaf4",
            boxShadow: focused ? "0 0 0 3px rgba(26,111,168,0.10)" : "none",
            background: isReadOnly ? "#eef2f7" : focused ? "#fff" : "#f8fafc",
            cursor: isReadOnly ? "not-allowed" : "text",
          }}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          readOnly={isReadOnly}
        />
      )}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
      paddingBottom: 10, borderBottom: "1.5px solid #f1f5f9",
    }}>
      <div style={{ width: 3, height: 16, borderRadius: 99, background: "#1a6fa8" }} />
      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1a6fa8", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {title}
      </span>
    </div>
  );
}

export default function SuperAdminModal({ editData, onClose, onSave, saving }) {
  const isEdit = !!editData?._id || !!editData?.email || !!editData?.firstName || !!editData?.lastName;

  const initialForm = useMemo(() => {
    if (!isEdit) return EMPTY_FORM;
    return {
      ...EMPTY_FORM,
      firstName: editData.firstName || "",
      middleName: editData.middleName || "",
      lastName: editData.lastName || "",
      email: editData.email || "",
      phoneNumber: editData.phoneNumber || "",
      roleName: editData.roleName || "",
      npiNumber: editData.npiNumber || "",
      employmentType: editData.employmentType || "",
      gender: editData.gender || "",
      dob: editData.dob ? String(editData.dob).slice(0, 10) : "",
      hireDate: editData.hireDate ? String(editData.hireDate).slice(0, 10) : "",
      addressLine1: editData.addresses?.[0]?.addressLine1 || "",
      addressLine2: editData.addresses?.[0]?.addressLine2 || "",
      city: editData.addresses?.[0]?.city || "",
      state: editData.addresses?.[0]?.state || "",
      zipCode: editData.addresses?.[0]?.zipCode || "",
      contactName: editData.emergencyContacts?.[0]?.contactName || "",
      relationship: editData.emergencyContacts?.[0]?.relationship || "",
      contactEmail: editData.emergencyContacts?.[0]?.email || "",
      contactPhone: editData.emergencyContacts?.[0]?.phone || "",
      contactAddress: editData.emergencyContacts?.[0]?.address || "",
    };
  }, [editData, isEdit]);

  const [form, setForm] = useState(initialForm);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const completedFields = Object.values(form).filter(Boolean).length;
  const totalFields = Object.keys(form).length;
  const progress = Math.round((completedFields / totalFields) * 100);

  return (
    <>
      <style>{`
        @keyframes sa-spin { to { transform: rotate(360deg); } }
        .sa-input:focus, .sa-select:focus {
          border-color: #1a6fa8 !important;
          box-shadow: 0 0 0 3px rgba(26,111,168,0.10) !important;
          background: #fff !important;
        }
        .sa-input::placeholder { color: #c0ccd8; }
        .sa-overlay::-webkit-scrollbar { width: 5px; }
        .sa-overlay::-webkit-scrollbar-track { background: transparent; }
        .sa-overlay::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .sa-cancel-btn:hover { background: #f8fafc !important; border-color: #cbd5e1 !important; }
        .sa-save-btn:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(26,111,168,0.45) !important; }
        .sa-close-btn:hover { background: rgba(255,255,255,0.22) !important; }
      `}</style>

      {/*
        KEY FIX: The overlay itself is scrollable (overflowY: auto).
        The modal card has NO maxHeight and NO overflow:hidden on its own —
        it just grows naturally. This means the header can never be clipped.
      */}
      <div
        className="sa-overlay"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          overflowY: "auto",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            maxWidth: 780,
            width: "100%",
            margin: "0 auto",
            boxShadow: "0 24px 80px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.06)",
            fontFamily: "'Outfit', sans-serif",
          }}
        >

          {/* ── Gradient Header ── */}
          <div style={{
            background: "linear-gradient(135deg, #1a6fa8 0%, #0e4f80 100%)",
            padding: "22px 28px 20px",
            position: "relative",
            overflow: "hidden",
            borderRadius: "18px 18px 0 0",
          }}>
            {/* Decorative blobs */}
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -20, right: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17,
                  }}>
                    🛡️
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                    {isEdit ? "Edit Super Admin Profile" : "Create Super Admin Profile"}
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.65)", paddingLeft: 46 }}>
                  {isEdit ? "Update super admin details below" : "Fill in the details to create a new super admin"}
                </p>
              </div>

              <button
                className="sa-close-btn"
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 18,
                  lineHeight: 1,
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                ×
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: 16, paddingLeft: 46 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Profile Completion</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{progress}%</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: 99,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "24px 28px", borderRadius: "0 0 18px 18px", background: "#fff" }}>

            {/* Personal Information */}
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Personal Information" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                <Field label="First Name"  fieldKey="firstName"   value={form.firstName}   onChange={v => set("firstName", v)}   placeholder="Super" />
                <Field label="Middle Name" fieldKey="middleName"  value={form.middleName}  onChange={v => set("middleName", v)}  placeholder="—" />
                <Field label="Last Name"   fieldKey="lastName"    value={form.lastName}    onChange={v => set("lastName", v)}    placeholder="Admin" />
                <Field label="Email"       fieldKey="email"       value={form.email}       onChange={v => set("email", v)}       type="email" placeholder="admin@example.com" />
                <Field label="Phone"       fieldKey="phoneNumber" value={form.phoneNumber} onChange={v => set("phoneNumber", v)} placeholder="+91 99999 00000" />
                <Field label="Gender"      fieldKey="gender"      value={form.gender}      onChange={v => set("gender", v)}      placeholder="Select gender" />
              </div>
            </div>

            {/* Role & Account */}
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Role & Account" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                <Field label="Role Name"    fieldKey="roleName"       value={form.roleName}       onChange={v => set("roleName", v)}       placeholder="Super Admin" />
                <Field label="Admin ID"     fieldKey="npiNumber"      value={form.npiNumber}      onChange={v => set("npiNumber", v)}      placeholder="SA-001" />
                <Field label="Account Type" fieldKey="employmentType" value={form.employmentType} onChange={v => set("employmentType", v)} placeholder="Select type" />
              </div>
            </div>

            {/* Dates */}
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Dates" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                <Field label="Date of Birth" fieldKey="dob"      value={form.dob}      onChange={v => set("dob", v)}      type="date" placeholder="" />
                <Field label="Joined On"     fieldKey="hireDate" value={form.hireDate} onChange={v => set("hireDate", v)} type="date" placeholder="" />
              </div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Address Information" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Address Line 1" fieldKey="addressLine1" value={form.addressLine1} onChange={(v) => set("addressLine1", v)} placeholder="Street / house / office" />
                </div>
                <Field label="Address Line 2" fieldKey="addressLine2" value={form.addressLine2} onChange={(v) => set("addressLine2", v)} placeholder="Apartment, landmark, etc." />
                <Field label="City" fieldKey="city" value={form.city} onChange={(v) => set("city", v)} placeholder="City" />
                <Field label="State" fieldKey="state" value={form.state} onChange={(v) => set("state", v)} placeholder="State" />
                <Field label="ZIP Code" fieldKey="zipCode" value={form.zipCode} onChange={(v) => set("zipCode", v)} placeholder="ZIP Code" />
              </div>
            </div>

            {/* Emergency contact */}
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Emergency Contact" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                <Field label="Contact Name" fieldKey="contactName" value={form.contactName} onChange={(v) => set("contactName", v)} placeholder="Contact person" />
                <Field label="Relationship" fieldKey="relationship" value={form.relationship} onChange={(v) => set("relationship", v)} placeholder="Relation" />
                <Field label="Contact Email" fieldKey="contactEmail" value={form.contactEmail} onChange={(v) => set("contactEmail", v)} type="email" placeholder="contact@example.com" />
                <Field label="Contact Phone" fieldKey="contactPhone" value={form.contactPhone} onChange={(v) => set("contactPhone", v)} placeholder="+91 99999 00000" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Contact Address" fieldKey="contactAddress" value={form.contactAddress} onChange={(v) => set("contactAddress", v)} placeholder="Contact address" />
                </div>
              </div>
            </div>

            {/* Validation hint */}
            {!(form.firstName && form.lastName && form.email) && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px",
                background: "#fff8ed",
                border: "1px solid #fde8bb",
                borderRadius: 8,
                marginBottom: 18,
                }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span style={{ fontSize: 12, color: "#92400e", fontWeight: 500 }}>
                  First name, last name, and email are required to {isEdit ? "update" : "create"} this profile.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                className="sa-cancel-btn"
                onClick={onClose}
                style={{
                  flex: 1,
                  height: 44,
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  background: "#fff",
                  color: "#374151",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                Cancel
              </button>

              <button
                className="sa-save-btn"
                onClick={() => onSave(form)}
                disabled={saving}
                style={{
                  flex: 2,
                  height: 44,
                  border: "none",
                  borderRadius: 10,
                  background: saving
                    ? "#93c5e8"
                    : "linear-gradient(135deg, #1a6fa8 0%, #0e4f80 100%)",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: "0.2px",
                  boxShadow: !saving ? "0 4px 14px rgba(26,111,168,0.35)" : "none",
                  transition: "box-shadow 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                {saving ? (
                  <>
                    <span style={{
                      display: "inline-block", width: 14, height: 14,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "sa-spin 0.7s linear infinite",
                    }} />
                    {isEdit ? "Updating…" : "Creating…"}
                  </>
                ) : (
                  isEdit ? "✓ Update Profile":"Update Profile"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
