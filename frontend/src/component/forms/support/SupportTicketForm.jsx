import { useEffect, useMemo, useState } from "react";
import Button from "../../ui/button/Button";
import { CONTACT_PREFERENCE_OPTIONS, SUPPORT_CATEGORY_OPTIONS } from "../../../constant/support";
import { getAuth } from "../../../store/slice/auth.slice";

const baseFieldStyle = {
  width: "100%",
  height: 40,
  borderRadius: 8,
  border: "1px solid #dbe3ef",
  padding: "0 12px",
  fontSize: 13,
  fontFamily: "'Outfit', sans-serif",
  outline: "none",
  color: "#1e293b",
  background: "#fff",
  boxSizing: "border-box",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: 14,
  alignItems: "start",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  letterSpacing: "0.02em",
  textTransform: "uppercase",
};

const helperPanelStyle = {
  minWidth: 0,
  border: "1px solid #e5e9f0",
  borderRadius: 10,
  background: "#f8fafc",
  padding: "10px 12px",
};

const helperTitleStyle = {
  fontSize: 11.5,
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  marginBottom: 4,
};

const helperTextStyle = {
  fontSize: 12.5,
  color: "#64748b",
  lineHeight: 1.45,
};

const formStyle = {
  display: "grid",
  gap: 16,
};

const buttonRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
};

const buildInitialForm = (authEmail = "", initialValues = null) => ({
  subject: initialValues?.subject || "",
  category: initialValues?.category || "General",
  description: initialValues?.description || "",
  contactEmail: initialValues?.contactEmail || authEmail || "",
  contactPhone: initialValues?.contactPhone || "",
  contactPreference: initialValues?.contactPreference || "Email",
});

export default function SupportTicketForm({
  onSubmit,
  loading = false,
  initialValues = null,
  submitLabel = "Raise Support Ticket",
}) {
  const auth = getAuth();
  const authEmail = useMemo(() => auth.email || "", [auth.email]);
  const [form, setForm] = useState(() => buildInitialForm(authEmail, initialValues));

  useEffect(() => {
    setForm(buildInitialForm(authEmail, initialValues));
  }, [authEmail, initialValues]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSubmit?.(form);
    if (result) {
      setForm(buildInitialForm(authEmail, null));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Subject</label>
          <input
            value={form.subject}
            onChange={(e) => setField("subject", e.target.value)}
            placeholder="Enter issue subject"
            style={baseFieldStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            style={baseFieldStyle}
          >
            {SUPPORT_CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Contact Email</label>
          <input
            value={form.contactEmail}
            onChange={(e) => setField("contactEmail", e.target.value)}
            placeholder="Email address"
            type="email"
            style={baseFieldStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Contact Phone</label>
          <input
            value={form.contactPhone}
            onChange={(e) => setField("contactPhone", e.target.value)}
            placeholder="Phone number"
            style={baseFieldStyle}
          />
        </div>
      </div>

      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Preferred Contact</label>
          <select
            value={form.contactPreference}
            onChange={(e) => setField("contactPreference", e.target.value)}
            style={baseFieldStyle}
          >
            {CONTACT_PREFERENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={helperPanelStyle}>
          <div style={helperTitleStyle}>Contact Tip</div>
          <div style={helperTextStyle}>Use email, phone, or both. The support team will update the ticket status after review.</div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Explain the issue clearly"
          rows={5}
          style={{
            ...baseFieldStyle,
            height: 120,
            padding: "10px 12px",
            resize: "vertical",
          }}
        />
      </div>

      <div style={buttonRowStyle}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
