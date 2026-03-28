// ─── src/constant/studentregistration.jsx ────────────────────────────────────

/**
 * Step labels for the StudentRegistrationForm step bar.
 * Order must match the step indices used in the form (0–4).
 */
export const STEPS = [
  "Personal Info",
  "Address",
  "Academic Records",
  "Documents",
  "Preview & Submit",
];

/**
 * Total number of steps — derived from STEPS so it stays in sync automatically.
 */
export const TOTAL_STEPS = STEPS.length;

/**
 * All 36 Indian states and Union Territories.
 * Used in the State dropdown for address.
 */
export const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

/**
 * Gender options for the Gender select field.
 */
export const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
];

/**
 * Blood group options for the Blood Group select field.
 */
export const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A−",
  "B+",
  "B−",
  "AB+",
  "AB−",
  "O+",
  "O−",
];

/**
 * Reservation / caste category options.
 */
export const CATEGORY_OPTIONS = [
  "General",
  "OBC",
  "SC",
  "ST",
  "EWS",
  "Other",
];

/**
 * Education board options for 10th and 12th marksheet fields.
 */
export const BOARD_OPTIONS = [
  "CBSE",
  "ICSE / ISC",
  "State Board",
  "IB (International Baccalaureate)",
  "NIOS",
  "Other",
];

/**
 * Entrance exam options for the Entrance Exam Name select field.
 */
export const EXAM_TYPE_OPTIONS = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "MHT-CET",
  "KCET",
  "WBJEE",
  "BITSAT",
  "COMEDK",
  "CUET",
  "GATE",
  "CAT",
  "MAT",
  "XAT",
  "GMAT",
  "Other Entrance Exam",
];

// ─── File upload constraints ──────────────────────────────────────────────────

/**
 * Accepted MIME types for photograph uploads (logo / passport photo).
 */
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

/**
 * Accepted MIME types for document uploads (marksheets, certificates, Aadhar).
 */
export const ACCEPTED_DOC_TYPES = "image/jpeg,image/png,application/pdf";

/**
 * Maximum allowed file size in megabytes.
 */
export const MAX_FILE_SIZE_MB = 5;

/**
 * Maximum allowed file size in bytes (derived from MAX_FILE_SIZE_MB).
 */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── RHF field lists per step ─────────────────────────────────────────────────
/**
 * Maps each step index to the react-hook-form field names that must be
 * validated before the user can proceed to the next step.
 *
 * Steps 3 (Documents) and 4 (Preview) are file-only / read-only steps —
 * they are not included here; their validation is handled separately
 * via validateFiles().
 */
export const STEP_RHF_FIELDS = {
  0: [
    "firstName",
    "lastName",
    "email",
    "phone",
    "dateOfBirth",
    "gender",
    "fatherName",
    "motherName",
  ],
  1: [
    "address.street",
    "address.city",
    "address.state",
    "address.pincode",
  ],
  2: [
    "tenthBoard",
    "tenthSchool",
    "tenthYear",
    "tenthMarks",
    "tenthPercentage",
    "twelfthBoard",
    "twelfthSchool",
    "twelfthYear",
    "twelfthMarks",
    "twelfthPercentage",
  ],
};

/**
 * Required document keys that must be present before the form can be submitted.
 * Used inside validateFiles() for step 3.
 */
export const REQUIRED_DOCUMENT_KEYS = [
  "photo",
  "aadharCard",
  "tenthMarksheet",
  "twelfthMarksheet",
];

/**
 * Human-readable labels for each document key.
 * Used in validation error messages.
 */
export const DOCUMENT_LABELS = {
  photo:            "Passport-size photograph",
  aadharCard:       "Aadhar card",
  tenthMarksheet:   "10th marksheet",
  twelfthMarksheet: "12th marksheet",
  entranceCert:     "Entrance exam certificate",
  casteCertificate: "Caste certificate",
};