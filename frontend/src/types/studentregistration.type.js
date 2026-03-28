// ─── src/types/studentregistration.type.js ───────────────────────────────────

/**
 * Default form values for StudentRegistrationForm.
 * Used as defaultValues in useForm() for both add and edit modes.
 */
export const INITIAL_FORM_VALUES = {
  // ── Personal ──────────────────────────────────────────────────────────────
  firstName:     "",
  lastName:      "",
  email:         "",
  phone:         "",
  dateOfBirth:   "",
  age:           "",
  gender:        "",
  bloodGroup:    "",
  category:      "",
  nationality:   "Indian",
  aadharNumber:  "",

  // ── Guardian ──────────────────────────────────────────────────────────────
  fatherName:    "",
  motherName:    "",
  guardianPhone: "",

  // ── Address ───────────────────────────────────────────────────────────────
  address: {
    street:  "",
    city:    "",
    state:   "",
    pincode: "",
    country: "India",
  },

  // ── Academics ─────────────────────────────────────────────────────────────
  tenthBoard:        "",
  tenthSchool:       "",
  tenthYear:         "",
  tenthMarks:        "",
  tenthPercentage:   "",

  twelfthBoard:        "",
  twelfthSchool:       "",
  twelfthYear:         "",
  twelfthMarks:        "",
  twelfthPercentage:   "",

  entranceExamName:   "",
  entranceExamRollNo: "",
  entranceExamYear:   "",
  entranceExamScore:  "",
  entranceExamRank:   "",
  otherExamDetails:   "",
};

/**
 * Default file state for all document uploads.
 * Each key maps to a File object (new upload) or a string URL (existing file from server).
 */
export const INITIAL_FILE_VALUES = {
  photo:            null,
  aadharCard:       null,
  tenthMarksheet:   null,
  twelfthMarksheet: null,
  entranceCert:     null,
  casteCertificate: null,
};

/**
 * Keys that map to which FormData field name each file is sent as.
 * Useful for building FormData in the submit handler.
 *
 * @example
 *   FILE_FIELD_KEYS.forEach((key) => {
 *     if (files[key] && !isExistingFileRef(files[key])) fd.append(key, files[key]);
 *   });
 */
export const FILE_FIELD_KEYS = Object.keys(INITIAL_FILE_VALUES);

/**
 * Builds the complete FormData payload from RHF form data + files.
 * Call this inside doSubmit() instead of manually calling fd.append() for each field.
 *
 * @param {object} data   - RHF getValues() result
 * @param {object} files  - current files state { photo, aadharCard, ... }
 * @param {Function} isExistingFileRef - helper that checks if value is already a server URL
 * @returns {FormData}
 */
export const buildStudentFormData = (data, files, isExistingFileRef) => {
  const fd = new FormData();

  // ── Personal ──────────────────────────────────────────────────────────────
  fd.append("firstName",     data.firstName);
  fd.append("lastName",      data.lastName);
  fd.append("email",         data.email);
  fd.append("phone",         data.phone);
  fd.append("dateOfBirth",   data.dateOfBirth);
  fd.append("age",           data.age           || "");
  fd.append("gender",        data.gender);
  fd.append("bloodGroup",    data.bloodGroup    || "");
  fd.append("category",      data.category      || "");
  fd.append("nationality",   data.nationality   || "");
  fd.append("aadharNumber",  data.aadharNumber  || "");
  fd.append("fatherName",    data.fatherName);
  fd.append("motherName",    data.motherName    || "");
  fd.append("guardianPhone", data.guardianPhone || "");

  // ── Address (JSON) ────────────────────────────────────────────────────────
  fd.append("address", JSON.stringify(data.address));

  // ── Academics ─────────────────────────────────────────────────────────────
  fd.append("tenthBoard",          data.tenthBoard);
  fd.append("tenthSchool",         data.tenthSchool);
  fd.append("tenthYear",           data.tenthYear);
  fd.append("tenthMarks",          data.tenthMarks);
  fd.append("tenthPercentage",     data.tenthPercentage);
  fd.append("twelfthBoard",        data.twelfthBoard);
  fd.append("twelfthSchool",       data.twelfthSchool);
  fd.append("twelfthYear",         data.twelfthYear);
  fd.append("twelfthMarks",        data.twelfthMarks);
  fd.append("twelfthPercentage",   data.twelfthPercentage);
  fd.append("entranceExamName",    data.entranceExamName   || "");
  fd.append("entranceExamRollNo",  data.entranceExamRollNo || "");
  fd.append("entranceExamYear",    data.entranceExamYear   || "");
  fd.append("entranceExamScore",   data.entranceExamScore  || "");
  fd.append("entranceExamRank",    data.entranceExamRank   || "");
  fd.append("otherExamDetails",    data.otherExamDetails   || "");

  // ── Files (only new uploads, not existing server URLs) ────────────────────
  FILE_FIELD_KEYS.forEach((key) => {
    if (files[key] && !isExistingFileRef(files[key])) {
      fd.append(key, files[key]);
    }
  });

  return fd;
};