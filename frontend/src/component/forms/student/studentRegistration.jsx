import React, {
  useState, useEffect, forwardRef,
} from "react";
import {
  useForm, FormProvider, useFormContext,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

// ─── Existing UI component imports ───────────────────────────────────────────
import Button from "../../ui/button/Button";
import TextField from "../../ui/textfeild/textFeild.jsx";
import Select from "../../ui/select/selectFeild.jsx";
import Card from "../../ui/card/Basic.jsx";
import Loader from "../../ui/loader/Loader";
import FileUpload from "../../ui/file/uploadFile.jsx";
import Modal from "../../ui/modal/basicModal.jsx";
import Notification from "../../ui/notification/notificationmenu.jsx";

// ─── App-level imports ────────────────────────────────────────────────────────
import { useStudents } from "../../../hooks/useStudents.js"; // adjust to your hook path

// ─── Constants ────────────────────────────────────────────────────────────────

import {
  STEPS, INDIA_STATES, GENDER_OPTIONS, BLOOD_GROUP_OPTIONS,
  CATEGORY_OPTIONS, BOARD_OPTIONS, EXAM_TYPE_OPTIONS,
  ACCEPTED_IMAGE_TYPES, ACCEPTED_DOC_TYPES,
  MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES,
  STEP_RHF_FIELDS, REQUIRED_DOCUMENT_KEYS, DOCUMENT_LABELS,
} from "../../../constant/studentregistration.jsx";

import {
  INITIAL_FORM_VALUES, INITIAL_FILE_VALUES,
  buildStudentFormData,
} from "../../../types/studentregistration.type.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isExistingFileRef = (v) => typeof v === "string" && v.trim() !== "";

const resolveExistingFile = (student, key) =>
  student?.documentFiles?.[key]?.url ||
  student?.documentFiles?.[key]?.path ||
  student?.documents?.[key] ||
  student?.[key] ||
  null;

const buildFormValues = (student) => {
  if (!student) return INITIAL_FORM_VALUES;
  return {
    ...INITIAL_FORM_VALUES,
    ...student,
    address: { ...INITIAL_FORM_VALUES.address, ...(student.address || {}) },
  };
};

// ─── Yup schemas ──────────────────────────────────────────────────────────────
const personalSchema = Yup.object({
  firstName:   Yup.string().trim().min(2).max(60).required("First name is required"),
  lastName:    Yup.string().trim().min(1).max(60).required("Last name is required"),
  email:       Yup.string().trim().email("Enter a valid email").required("Email is required"),
  phone:       Yup.string().trim()
                 .matches(/^[+\d][\d\s\-().]{7,14}$/, "Enter a valid phone number")
                 .required("Phone is required"),
  dateOfBirth: Yup.string().required("Date of birth is required"),
  gender:      Yup.string().oneOf(GENDER_OPTIONS).required("Gender is required"),
  fatherName:  Yup.string().trim().min(2).required("Father / guardian name is required"),
  motherName:  Yup.string().trim().min(2).optional(),
  aadharNumber:Yup.string()
                 .matches(/^\d{12}$/, "Aadhar must be exactly 12 digits")
                 .nullable().transform((v,o) => o===""?null:v).optional(),
  guardianPhone:Yup.string().trim()
                 .matches(/^[+\d][\d\s\-().]{7,14}$/, "Enter a valid phone number")
                 .nullable().transform((v,o) => o===""?null:v).optional(),
});

const addressSchema = Yup.object({
  address: Yup.object({
    street:  Yup.string().trim().min(5).required("Street is required"),
    city:    Yup.string().trim().min(2).required("City is required"),
    state:   Yup.string().oneOf(INDIA_STATES).required("State is required"),
    pincode: Yup.string().matches(/^\d{6}$/, "Must be exactly 6 digits").required("PIN code is required"),
    country: Yup.string().optional(),
  }),
});

const academicSchema = Yup.object({
  tenthBoard:        Yup.string().oneOf(BOARD_OPTIONS).required("10th board is required"),
  tenthSchool:       Yup.string().trim().min(3).required("School name is required"),
  tenthYear:         Yup.number().typeError("Enter a valid year").integer().min(1990).max(new Date().getFullYear()).required("Year is required"),
  tenthMarks:        Yup.number().typeError("Must be a number").min(0).required("Marks / CGPA is required"),
  tenthPercentage:   Yup.number().typeError("Must be a number").min(0).max(100).required("Percentage is required"),
  twelfthBoard:      Yup.string().oneOf(BOARD_OPTIONS).required("12th board is required"),
  twelfthSchool:     Yup.string().trim().min(3).required("School / college name is required"),
  twelfthYear:       Yup.number().typeError("Enter a valid year").integer().min(1990).max(new Date().getFullYear()).required("Year is required"),
  twelfthMarks:      Yup.number().typeError("Must be a number").min(0).required("Marks / CGPA is required"),
  twelfthPercentage: Yup.number().typeError("Must be a number").min(0).max(100).required("Percentage is required"),
});

// ─── RHF wired wrappers ───────────────────────────────────────────────────────
function RHFTextField({ name, label, required, hint, type = "text", placeholder, span, ...rest }) {
  const { trigger } = useFormContext();
  return (
    <div style={{ gridColumn: span ? "1/-1" : undefined }}>
      <TextField
        name={name}
        label={label}
        type={type}
        placeholder={placeholder}
        helperText={hint}
        required={required}
        onChange={() => trigger(name)}
        onBlur={() => trigger(name)}
        fullWidth
        {...rest}
      />
    </div>
  );
}

function RHFSelect({ name, label, required, hint, placeholder, options, span }) {
  const { trigger } = useFormContext();
  return (
    <div style={{ gridColumn: span ? "1/-1" : undefined }}>
      <Select
        name={name}
        label={label}
        placeholder={placeholder}
        options={options.map((o) => ({ label: o, value: o }))}
        helperText={hint}
        required={required}
        fullWidth
        onChange={() => trigger(name)}
      />
    </div>
  );
}

// ─── Step 1 — Personal Info ───────────────────────────────────────────────────
function StepPersonal() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Identity */}
      <div>
        <p style={sectionLabel}>👤 Student Identity</p>
        <div style={grid2}>
          <RHFTextField name="firstName"   label="First Name"      required placeholder="Rahul" />
          <RHFTextField name="lastName"    label="Last Name"       required placeholder="Sharma" />
          <RHFTextField name="email"       label="Email Address"   required type="email" placeholder="rahul@example.com" />
          <RHFTextField name="phone"       label="Mobile Number"   required type="tel" placeholder="+91 99999 00000" />
          <RHFTextField name="dateOfBirth" label="Date of Birth"   required type="date" />
          <RHFTextField name="age"         label="Age"                       type="number" placeholder="18" hint="Auto-calculated if left blank" />
          <RHFSelect    name="gender"      label="Gender"          required placeholder="Select…" options={GENDER_OPTIONS} />
          <RHFSelect    name="bloodGroup"  label="Blood Group"               placeholder="Select…" options={BLOOD_GROUP_OPTIONS} />
          <RHFSelect    name="category"    label="Category"                  placeholder="Select category…" options={CATEGORY_OPTIONS} />
          <RHFTextField name="nationality" label="Nationality"               placeholder="Indian" />
          <RHFTextField name="aadharNumber" label="Aadhar Number"            placeholder="XXXX XXXX XXXX" hint="12-digit number (no spaces)" />
        </div>
      </div>

      {/* Guardian */}
      <div>
        <p style={sectionLabel}>👨‍👩‍👦 Parent / Guardian Details</p>
        <div style={grid2}>
          <RHFTextField name="fatherName"    label="Father's Name / Son of" required placeholder="Mr. Rajesh Sharma" />
          <RHFTextField name="motherName"    label="Mother's Name"                    placeholder="Mrs. Sunita Sharma" />
          <RHFTextField name="guardianPhone" label="Guardian's Phone"                 type="tel" placeholder="+91 88888 00000" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 — Address ─────────────────────────────────────────────────────────
function StepAddress() {
  return (
    <div style={grid2}>
      <RHFTextField name="address.street"  label="Street / Area"  required span placeholder="House No. 12, Gandhi Nagar, Near Bus Stand" hint="At least 5 characters" />
      <RHFTextField name="address.city"    label="City / District" required     placeholder="Lucknow" />
      <RHFSelect    name="address.state"   label="State"           required     placeholder="Select state…" options={INDIA_STATES} />
      <RHFTextField name="address.pincode" label="PIN Code"        required     placeholder="226001" hint="Exactly 6 digits" />
      <RHFTextField name="address.country" label="Country"                      placeholder="India" />
    </div>
  );
}

// ─── Step 3 — Academic Records ────────────────────────────────────────────────
function StepAcademics() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 10th */}
      <div>
        <p style={sectionLabel}>📗 Class 10th Details</p>
        <div style={grid2}>
          <RHFSelect    name="tenthBoard"       label="Board"            required placeholder="Select board…"    options={BOARD_OPTIONS} />
          <RHFTextField name="tenthSchool"      label="School Name"      required placeholder="Delhi Public School" />
          <RHFTextField name="tenthYear"        label="Passing Year"     required type="number" placeholder="2020" />
          <RHFTextField name="tenthMarks"       label="Total Marks / CGPA" required type="number" placeholder="485 or 9.2" hint="Out of total marks or CGPA" />
          <RHFTextField name="tenthPercentage"  label="Percentage (%)"   required type="number" placeholder="96.5" />
        </div>
      </div>

      {/* 12th */}
      <div>
        <p style={sectionLabel}>📘 Class 12th Details</p>
        <div style={grid2}>
          <RHFSelect    name="twelfthBoard"       label="Board"             required placeholder="Select board…"    options={BOARD_OPTIONS} />
          <RHFTextField name="twelfthSchool"      label="School / College"  required placeholder="St. Mary's Intermediate College" />
          <RHFTextField name="twelfthYear"        label="Passing Year"      required type="number" placeholder="2022" />
          <RHFTextField name="twelfthMarks"       label="Total Marks / CGPA" required type="number" placeholder="470 or 9.0" hint="Out of total marks or CGPA" />
          <RHFTextField name="twelfthPercentage"  label="Percentage (%)"    required type="number" placeholder="92.0" />
        </div>
      </div>

      {/* Entrance Exam */}
      <div>
        <p style={sectionLabel}>🏆 Entrance Exam Details <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>(Optional)</span></p>
        <div style={grid2}>
          <RHFSelect    name="entranceExamName"    label="Exam Name"          placeholder="Select exam…"    options={EXAM_TYPE_OPTIONS} />
          <RHFTextField name="entranceExamRollNo"  label="Roll Number"        placeholder="240110012345" />
          <RHFTextField name="entranceExamYear"    label="Exam Year"          type="number" placeholder="2024" />
          <RHFTextField name="entranceExamScore"   label="Score / Marks"      type="number" placeholder="250" />
          <RHFTextField name="entranceExamRank"    label="All India Rank"     type="number" placeholder="15000" />
          <RHFTextField name="otherExamDetails"    label="Other Exam / Certificate Details" span placeholder="e.g. IELTS 7.5, NDA Stage 1 cleared, etc." hint="Any other relevant exam or certificate" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 — Documents ───────────────────────────────────────────────────────
function StepDocuments({ files, onFileChange, fileErrors }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Notification
        type="warning"
        message={`Upload clear scanned copies or photos. Max ${MAX_FILE_SIZE_MB} MB per file. Accepted: JPG, PNG, PDF.`}
      />

      <div style={grid2}>
        <FileUpload
          label="Passport-size Photograph"
          name="photo"
          accept={ACCEPTED_IMAGE_TYPES}
          value={files.photo}
          onChange={(file) => onFileChange("photo", file)}
          error={fileErrors?.photo}
          hint="JPG / PNG — required"
          required
        />

        <FileUpload
          label="Aadhar Card"
          name="aadharCard"
          accept={ACCEPTED_DOC_TYPES}
          value={files.aadharCard}
          onChange={(file) => onFileChange("aadharCard", file)}
          error={fileErrors?.aadharCard}
          hint="JPG, PNG or PDF — required"
          required
        />

        <FileUpload
          label="10th Marksheet"
          name="tenthMarksheet"
          accept={ACCEPTED_DOC_TYPES}
          value={files.tenthMarksheet}
          onChange={(file) => onFileChange("tenthMarksheet", file)}
          error={fileErrors?.tenthMarksheet}
          hint="Required — JPG, PNG or PDF"
          required
        />

        <FileUpload
          label="12th Marksheet"
          name="twelfthMarksheet"
          accept={ACCEPTED_DOC_TYPES}
          value={files.twelfthMarksheet}
          onChange={(file) => onFileChange("twelfthMarksheet", file)}
          error={fileErrors?.twelfthMarksheet}
          hint="Required — JPG, PNG or PDF"
          required
        />

        <FileUpload
          label="Entrance Exam Certificate / Scorecard"
          name="entranceCert"
          accept={ACCEPTED_DOC_TYPES}
          value={files.entranceCert}
          onChange={(file) => onFileChange("entranceCert", file)}
          error={fileErrors?.entranceCert}
          hint="Optional — JPG, PNG or PDF"
        />

        <FileUpload
          label="Caste Certificate"
          name="casteCertificate"
          accept={ACCEPTED_DOC_TYPES}
          value={files.casteCertificate}
          onChange={(file) => onFileChange("casteCertificate", file)}
          error={fileErrors?.casteCertificate}
          hint="Optional — if applicable"
        />
      </div>
    </div>
  );
}

// ─── Step 5 — Preview & Submit ────────────────────────────────────────────────
function StepPreview({ files }) {
  const { getValues } = useFormContext();
  const v = getValues();
  const addr = v.address || {};

  const row = (label, value) => (
    <div style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid #f0f3f7" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", minWidth: 160, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: value ? "#0f2044" : "#94a3b8", fontStyle: value ? "normal" : "italic" }}>
        {value || "Not provided"}
      </span>
    </div>
  );

  const fileCount = Object.values(files).filter((f) => f && f !== null).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Notification
        type="warning"
        message="Please review all details carefully before submitting. You can go back to edit any section."
      />

      {/* Personal */}
      <Card style={{ padding: "16px 20px" }}>
        <p style={sectionLabel}>👤 Personal Details</p>
        {row("Full Name", `${v.firstName || ""} ${v.lastName || ""}`.trim())}
        {row("Email", v.email)}
        {row("Mobile", v.phone)}
        {row("Date of Birth", v.dateOfBirth)}
        {row("Age", v.age)}
        {row("Gender", v.gender)}
        {row("Blood Group", v.bloodGroup)}
        {row("Category", v.category)}
        {row("Aadhar Number", v.aadharNumber ? "•••• •••• " + v.aadharNumber.slice(-4) : "")}
        {row("Father / Guardian", v.fatherName)}
        {row("Mother's Name", v.motherName)}
        {row("Guardian Phone", v.guardianPhone)}
      </Card>

      {/* Address */}
      <Card style={{ padding: "16px 20px" }}>
        <p style={sectionLabel}>📍 Address</p>
        {row("Street", addr.street)}
        {row("City", addr.city)}
        {row("State", addr.state)}
        {row("PIN Code", addr.pincode)}
        {row("Country", addr.country)}
      </Card>

      {/* Academics */}
      <Card style={{ padding: "16px 20px" }}>
        <p style={sectionLabel}>📚 Academic Records</p>
        {row("10th Board", v.tenthBoard)}
        {row("10th School", v.tenthSchool)}
        {row("10th Year", v.tenthYear)}
        {row("10th Marks", v.tenthMarks)}
        {row("10th Percentage", v.tenthPercentage ? `${v.tenthPercentage}%` : "")}
        <div style={{ height: 8 }} />
        {row("12th Board", v.twelfthBoard)}
        {row("12th School", v.twelfthSchool)}
        {row("12th Year", v.twelfthYear)}
        {row("12th Marks", v.twelfthMarks)}
        {row("12th Percentage", v.twelfthPercentage ? `${v.twelfthPercentage}%` : "")}
        {v.entranceExamName && (
          <>
            <div style={{ height: 8 }} />
            {row("Entrance Exam", v.entranceExamName)}
            {row("Roll No.", v.entranceExamRollNo)}
            {row("Score", v.entranceExamScore)}
            {row("AIR", v.entranceExamRank)}
          </>
        )}
      </Card>

      {/* Documents */}
      <Card style={{ padding: "16px 20px" }}>
        <p style={sectionLabel}>📄 Documents Uploaded</p>
        <div style={{ fontSize: 14, color: "#0f2044", fontWeight: 600 }}>
          {fileCount} file{fileCount !== 1 ? "s" : ""} uploaded
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          {Object.entries({
            photo: "Photograph",
            aadharCard: "Aadhar Card",
            tenthMarksheet: "10th Marksheet",
            twelfthMarksheet: "12th Marksheet",
            entranceCert: "Entrance Certificate",
            casteCertificate: "Caste Certificate",
          })
            .filter(([k]) => files[k])
            .map(([, label]) => label)
            .join(" · ")}
        </div>
      </Card>
    </div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24, overflowX: "auto", gap: 0 }}>
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 54 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, flexShrink: 0,
                background: done ? "#c9973a" : active ? "#0f2044" : "#eef2f8",
                color: done || active ? "#fff" : "#94a3b8",
                border: active ? "3px solid #c9973a" : "none",
                boxShadow: active ? "0 0 0 4px rgba(201,151,58,.18)" : "none",
                transition: "all .2s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500, textAlign: "center",
                color: active ? "#0f2044" : done ? "#c9973a" : "#94a3b8",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, minWidth: 12, marginBottom: 20, background: done ? "#c9973a" : "#e2e8f4", transition: "background .2s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Submit overlay ───────────────────────────────────────────────────────────
function SubmitOverlay({ isEdit }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10, borderRadius: 18,
      background: "rgba(15,32,68,0.55)", backdropFilter: "blur(3px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
    }}>
      <Loader size={36} color="inherit" />
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "0.2px" }}>
        {isEdit ? "Saving changes…" : "Submitting application…"}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const StudentRegistrationForm = forwardRef(function StudentRegistrationForm(
  { onClose, onSaved, student: defaultValues = null, studentId = null },
  ref,
) {
  const { updateStudent, registerStudent } = useStudents();
  const isEdit = !!defaultValues && Object.keys(defaultValues).length > 0;

  const [step, setStep]             = useState(0);
  const [files, setFiles]           = useState(INITIAL_FILE_VALUES);
  const [fileErrors, setFileErrors] = useState({});
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

  const methods = useForm({
    defaultValues: isEdit ? buildFormValues(defaultValues) : INITIAL_FORM_VALUES,
    resolver: yupResolver(
      Yup.object()
        .concat(personalSchema)
        .concat(addressSchema)
        .concat(academicSchema),
    ),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { handleSubmit, trigger, getValues, clearErrors, reset } = methods;

  // Sync when defaultValues change (edit re-open)
  useEffect(() => {
    if (isEdit && defaultValues) {
      reset(buildFormValues(defaultValues));
      setStep(0);
      setFiles({
        photo:            resolveExistingFile(defaultValues, "photo"),
        aadharCard:       resolveExistingFile(defaultValues, "aadharCard"),
        tenthMarksheet:   resolveExistingFile(defaultValues, "tenthMarksheet"),
        twelfthMarksheet: resolveExistingFile(defaultValues, "twelfthMarksheet"),
        entranceCert:     resolveExistingFile(defaultValues, "entranceCert"),
        casteCertificate: resolveExistingFile(defaultValues, "casteCertificate"),
      });
      setFileErrors({});
      setSuccess(false);
      return;
    }
    reset(INITIAL_FORM_VALUES);
    setFiles(INITIAL_FILE_VALUES);
    setStep(0);
    setFileErrors({});
    setSuccess(false);
  }, [defaultValues, isEdit, reset]);

  React.useImperativeHandle(ref, () => ({
    handleNext,
    handleBack,
    submitForm: handleSubmit(doSubmit),
  }));

  const setFile = (k, file) => {
    setFiles((f) => ({ ...f, [k]: file }));
    setFileErrors((e) => ({ ...e, [k]: undefined }));
  };

  // File validation per step
  const validateFiles = async (atStep) => {
    const s = atStep !== undefined ? atStep : step;
    setFileErrors({});

    if (s === 3) {
      // Required: photo, aadharCard, tenthMarksheet, twelfthMarksheet
      const required = ["photo", "aadharCard", "tenthMarksheet", "twelfthMarksheet"];
      const labels = {
        photo:            "Passport-size photograph",
        aadharCard:       "Aadhar card",
        tenthMarksheet:   "10th marksheet",
        twelfthMarksheet: "12th marksheet",
      };

      for (const key of required) {
        const hasExisting = isExistingFileRef(resolveExistingFile(defaultValues, key));
        if (!files[key] && !hasExisting) {
          setFileErrors({ [key]: `${labels[key]} is required` });
          return false;
        }
      }

      for (const [key, file] of Object.entries(files)) {
        if (file && !isExistingFileRef(file) && file.size > MAX_FILE_SIZE_BYTES) {
          setFileErrors({ [key]: `File must be under ${MAX_FILE_SIZE_MB} MB` });
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const validateRHF = async () => {
    const fields = STEP_RHF_FIELDS[step] || [];
    const results = await Promise.all(fields.map((f) => trigger(f)));
    return results.every(Boolean);
  };

  const handleNext = async () => {
    const ok = step === 3 ? await validateFiles() : await validateRHF();
    if (ok) { clearErrors(); setStep((s) => s + 1); }
    return ok;
  };

  const handleBack = () => {
    setFileErrors({});
    clearErrors();
    setStep((s) => s - 1);
  };

  const doSubmit = async (data) => {
    // Re-validate all RHF steps
    const allFields = [
      ...STEP_RHF_FIELDS[0],
      ...STEP_RHF_FIELDS[1],
      ...STEP_RHF_FIELDS[2],
    ];
    const results = await Promise.all(allFields.map((f) => trigger(f)));
    if (!results.every(Boolean)) {
      const s0ok = await Promise.all(STEP_RHF_FIELDS[0].map((f) => trigger(f)));
      const s1ok = await Promise.all(STEP_RHF_FIELDS[1].map((f) => trigger(f)));
      if (!s0ok.every(Boolean)) { setStep(0); return; }
      if (!s1ok.every(Boolean)) { setStep(1); return; }
      setStep(2);
      return;
    }

    if (!(await validateFiles(3))) { setStep(3); return; }
    if (isEdit && !studentId) { alert("Student ID missing!"); return; }

    setLoading(true);
    try {
      const fd = new FormData();

      // Personal
      fd.append("firstName",    data.firstName);
      fd.append("lastName",     data.lastName);
      fd.append("email",        data.email);
      fd.append("phone",        data.phone);
      fd.append("dateOfBirth",  data.dateOfBirth);
      fd.append("age",          data.age || "");
      fd.append("gender",       data.gender);
      fd.append("bloodGroup",   data.bloodGroup || "");
      fd.append("category",     data.category || "");
      fd.append("nationality",  data.nationality || "");
      fd.append("aadharNumber", data.aadharNumber || "");
      fd.append("fatherName",   data.fatherName);
      fd.append("motherName",   data.motherName || "");
      fd.append("guardianPhone",data.guardianPhone || "");

      // Address
      fd.append("address", JSON.stringify(data.address));

      // Academics
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
      fd.append("entranceExamName",    data.entranceExamName || "");
      fd.append("entranceExamRollNo",  data.entranceExamRollNo || "");
      fd.append("entranceExamYear",    data.entranceExamYear || "");
      fd.append("entranceExamScore",   data.entranceExamScore || "");
      fd.append("entranceExamRank",    data.entranceExamRank || "");
      fd.append("otherExamDetails",    data.otherExamDetails || "");

      // Files
      Object.entries(files).forEach(([k, v]) => {
        if (v && !isExistingFileRef(v)) fd.append(k, v);
      });

      if (isEdit) {
        await updateStudent({ id: studentId, payload: fd });
      } else {
        await registerStudent(fd);
      }

      try { await onSaved?.(isEdit); } catch { /* keep going */ }
      setSuccess(true);
    } catch (e) {
      setFileErrors((prev) => ({
        ...prev,
        _submit: e?.response?.data?.message || "Submission failed. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    const vals = getValues();
    return (
      <Modal open onClose={onClose} maxWidth={440}>
        <div style={{ textAlign: "center", padding: "48px 40px" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#f0fdf4", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 18px", fontSize: 36,
          }}>
            ✅
          </div>
          <h2 style={{ fontSize: 24, color: "#0f2044", margin: "0 0 10px", fontWeight: 600 }}>
            {isEdit ? "Changes Saved!" : "Application Submitted!"}
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75, margin: "0 0 26px" }}>
            {isEdit
              ? <>Details for <strong>{vals.firstName} {vals.lastName}</strong> have been updated successfully.</>
              : <>Application for <strong>{vals.firstName} {vals.lastName}</strong> has been received. The college will review your profile.</>}
          </p>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  // ── Form modal ──────────────────────────────────────────────────────────────
  return (
    <Modal
      open
      onClose={!loading ? onClose : undefined}
      maxWidth={840}
    >
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "96vh", maxHeight: "96vh", overflow: "hidden" }}>

        {loading && <SubmitOverlay isEdit={isEdit} />}

        {/* HEADER */}
        <div style={{
          flexShrink: 0, padding: "16px 22px",
          background: "linear-gradient(135deg,#0f2044 0%,#1a3460 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 20, color: "#fff", margin: 0, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {isEdit ? "Edit Student Profile" : "Student Admission Form"}
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", margin: "2px 0 0" }}>
              Complete all {STEPS.length} steps to {isEdit ? "save changes" : "submit your application"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { if (!loading) onClose(); }}
            disabled={loading}
            aria-label="Close"
            style={{ color: "#fff", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.28)" }}
          >
            ×
          </Button>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 28px 28px" }}>
          <StepBar current={step} />

          {/* Step title */}
          <div style={{ marginBottom: 20, paddingBottom: 13, borderBottom: "1px solid #e2e8f4" }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "1.1px", textTransform: "uppercase", color: "#c9973a" }}>
              Step {step + 1} of {STEPS.length}
            </span>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f2044", margin: "2px 0 0" }}>
              {STEPS[step]}
            </h2>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()} noValidate>

              {step === 0 && <StepPersonal />}
              {step === 1 && <StepAddress />}
              {step === 2 && <StepAcademics />}
              {step === 3 && <StepDocuments files={files} onFileChange={setFile} fileErrors={fileErrors} />}
              {step === 4 && <StepPreview files={files} />}

              {/* Global submit error */}
              {fileErrors._submit && (
                <Notification
                  type="error"
                  message={fileErrors._submit}
                  style={{ marginTop: 14 }}
                />
              )}

              {/* Navigation */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginTop: 24, gap: 10, paddingTop: 18, borderTop: "1px solid #e2e8f4",
              }}>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 0 || loading}
                >
                  ← Back
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Continue →
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit(doSubmit)}
                    disabled={loading}
                    loading={loading}
                  >
                    {loading
                      ? (isEdit ? "Saving..." : "Submitting...")
                      : (isEdit ? "Save Changes" : "Submit Application")}
                  </Button>
                )}
              </div>

            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
});

export default StudentRegistrationForm;

// ─── Shared style helpers (local to this file) ────────────────────────────────
const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const sectionLabel = {
  margin: "0 0 12px",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.8px",
  textTransform: "uppercase",
  color: "#c9973a",
};