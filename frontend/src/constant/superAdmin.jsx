export const SUPER_ADMIN_FORM_DEFAULTS = {
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

export const SUPER_ADMIN_INPUT_STYLE = {
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

export const SUPER_ADMIN_LABEL_STYLE = {
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

export const SUPER_ADMIN_FIELD_ICONS = {
  firstName: "FN",
  middleName: "MN",
  lastName: "LN",
  email: "@",
  phoneNumber: "PH",
  gender: "G",
  roleName: "RN",
  npiNumber: "ID",
  employmentType: "ET",
  dob: "DOB",
  hireDate: "DATE",
};

export const SUPER_ADMIN_SELECT_OPTIONS = {
  gender: ["Male", "Female", "Other", "Prefer not to say"],
  employmentType: ["Internal", "External", "Contractor", "Consultant"],
};
