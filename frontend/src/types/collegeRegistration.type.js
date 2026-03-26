/**
 * @file collegeRegistration.types.js
 * All JSDoc typedefs for the College Registration form.
 * Import these in any file that needs IDE autocompletion / type safety.
 *
 * Usage:
 *   import "./collegeRegistration.types"; // side-effect import for types only
 *   // OR reference individual typedefs via JSDoc @type / @param tags
 */

// ─────────────────────────────────────────────────────────────────────────────
// Address
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} AddressForm
 * @property {string} street   - Street name / area
 * @property {string} city     - City name
 * @property {string} state    - Indian state (one of INDIA_STATES)
 * @property {string} pincode  - 6-digit PIN code
 * @property {string} country  - Country (default "India")
 */

// ─────────────────────────────────────────────────────────────────────────────
// Course
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} CourseForm
 * @property {string}        courseName  - Full course name
 * @property {string}        courseCode  - Short code, e.g. "BTCSE"
 * @property {string}        duration    - Duration string, e.g. "4 Years"
 * @property {string|number} totalSeats  - Total intake capacity
 * @property {string|number} fees        - Annual fees in INR
 * @property {string}        description - Optional course description
 */

// ─────────────────────────────────────────────────────────────────────────────
// Main College Form
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} CollegeFormValues
 * @property {string}       collegeName     - Full official name
 * @property {string}       collegeCode     - Unique college code (uppercase)
 * @property {string}       email           - Official contact email
 * @property {string}       phone           - Contact phone number
 * @property {string}       website         - College website URL (optional)
 * @property {string|number} establishedYear - Year of establishment (optional)
 * @property {string}       collegeType     - One of COLLEGE_TYPES
 * @property {string}       affiliation     - Affiliated university name (optional)
 * @property {AddressForm}  address         - Nested address object
 * @property {CourseForm[]} courses         - List of offered courses
 */

// ─────────────────────────────────────────────────────────────────────────────
// File Uploads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} FileFields
 * @property {File|null} logo             - College logo image (optional)
 * @property {File|null} affiliationCert  - Affiliation certificate (required)
 * @property {File|null} registrationCert - Registration certificate (optional)
 * @property {File|null} paymentReceipt   - Payment receipt (required on submit)
 */

// ─────────────────────────────────────────────────────────────────────────────
// File validation errors (keyed by FileFields key + optional _submit)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} FileErrors
 * @property {string} [logo]
 * @property {string} [affiliationCert]
 * @property {string} [registrationCert]
 * @property {string} [paymentReceipt]
 * @property {string} [_submit]   - Global submission error
 */

export const INITIAL_FORM_VALUES = {
  collegeName: "", collegeCode: "", email: "", phone: "",
  website: "", establishedYear: "", collegeType: "", affiliation: "",
  address: { street: "", city: "", state: "", pincode: "", country: "India" },
  courses: [],
};

export const INITIAL_FILE_VALUES = {
  logo: null, affiliationCert: null,
  registrationCert: null, paymentReceipt: null,
};

export const EMPTY_COURSE = {
  courseName: "", courseCode: "", duration: "",
  totalSeats: "", fees: "", description: "",
};

export {}; // keeps this a module so typedefs are importable
