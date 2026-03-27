import React, {
  useState, useEffect, forwardRef,
} from "react";
import {
  useForm, FormProvider, useFormContext, useFieldArray,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

// ─── Existing UI component imports ───────────────────────────────────────────
import Button from "../../ui/button/Button";
import TextField from "../../ui/textfeild/textFeild.jsx";        // note: folder is "textfeild"
import Select from "../../ui/select/selectFeild.jsx";
import Card from "../../ui/card/Basic.jsx";
import Loader from "../../ui/loader/Loader";
import FileUpload from "../../ui/file/uploadFile.jsx";           // adjust export name if different
import Modal from "../../ui/modal/basicModal.jsx";                    // backdrop / modal wrapper
import Notification from "../../ui/notification/notificationmenu.jsx";

// ─── App-level imports ────────────────────────────────────────────────────────
import { useColleges } from "../../../hooks/useCollege";
import {
  STEPS,
  COLLEGE_TYPES,
  INDIA_STATES,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_DOC_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from "../../../constant/collegeRegistration.jsx";
import {
  INITIAL_FORM_VALUES,
  INITIAL_FILE_VALUES,
  EMPTY_COURSE,
} from "../../../types/collegeRegistration.type.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCEPTED_IMAGE = ACCEPTED_IMAGE_TYPES;
const ACCEPTED_DOC   = ACCEPTED_DOC_TYPES;
const MAX_MB         = MAX_FILE_SIZE_MB;
const MAX_BYTES      = MAX_FILE_SIZE_BYTES;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isExistingFileRef = (value) =>
  typeof value === "string" && value.trim() !== "";

const buildFormValues = (college) => {
  if (!college) return INITIAL_FORM_VALUES;
  return {
    ...INITIAL_FORM_VALUES,
    ...college,
    establishedYear: college.establishedYear || college.established || "",
    address: { ...INITIAL_FORM_VALUES.address, ...(college.address || {}) },
    courses: Array.isArray(college.courses) ? college.courses : [],
  };
};

const resolveExistingFileValue = (college, key) =>
  college?.documentFiles?.[key]?.url ||
  college?.documentFiles?.[key]?.path ||
  college?.documents?.[key] ||
  college?.docs?.[key] ||
  college?.[key] ||
  null;

// ─── Yup schemas ──────────────────────────────────────────────────────────────
const basicInfoSchema = Yup.object({
  collegeName:     Yup.string().trim().min(3).max(150).required("College name is required"),
  collegeCode:     Yup.string().trim().min(2).max(20)
                    .matches(/^[A-Z0-9]+$/, "Uppercase letters & numbers only")
                    .required("College code is required"),
  email:           Yup.string().trim().email("Enter a valid email").required("Email is required"),
  phone:           Yup.string().trim()
                    .matches(/^[+\d][\d\s\-().]{7,14}$/, "Enter a valid phone number")
                    .required("Phone is required"),
  website:         Yup.string().url("Must be a valid URL (include https://)").nullable()
                    .transform((v) => (v === "" ? null : v)).optional(),
  establishedYear: Yup.number().typeError("Enter a valid year").integer()
                    .min(1800).max(new Date().getFullYear()).nullable()
                    .transform((val, orig) => (orig === "" ? null : val)).optional(),
  collegeType:     Yup.string().oneOf(COLLEGE_TYPES).required("College type is required"),
  affiliation:     Yup.string().max(150).optional(),
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

// eslint-disable-next-line react-refresh/only-export-components
export const courseItemSchema = Yup.object({
  courseName:  Yup.string().trim().min(2).max(100).required("Course name is required"),
  courseCode:  Yup.string().trim().min(2).max(20).required("Course code is required"),
  duration:    Yup.string().max(30).optional(),
  totalSeats:  Yup.number().typeError("Must be a number").integer("Whole number only")
               .min(1).max(10000).required("Total seats is required"),
  fees:        Yup.number().typeError("Must be a number").min(0).max(10000000).required("Fees is required"),
  description: Yup.string().max(500).optional(),
});

const coursesSchema = Yup.object({
  courses: Yup.array().of(courseItemSchema).optional(),
});

const STEP_RHF_FIELDS = {
  0: ["collegeName", "collegeCode", "email", "phone", "website", "establishedYear", "collegeType", "affiliation"],
  1: ["address.street", "address.city", "address.state", "address.pincode"],
  3: ["courses"],
};

// ─── Reusable RHF-wired wrappers ──────────────────────────────────────────────

/** Wraps your existing <TextField> with react-hook-form wiring */
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

/** Wraps your existing <Select> with react-hook-form wiring */
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

// ─── Step 1 — Basic Info ──────────────────────────────────────────────────────
function StepBasic() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
      <RHFTextField name="collegeName"     label="College Name"        required span placeholder="St. Xavier's College of Engineering" hint="Full official name as per records" />
      <RHFTextField name="collegeCode"     label="College Code"        required placeholder="SXC001"               hint="2–20 uppercase letters/numbers" />
      <RHFSelect    name="collegeType"     label="College Type"        required placeholder="Select type…"         options={COLLEGE_TYPES} />
      <RHFTextField name="email"           label="Official Email"      required type="email" placeholder="admin@college.edu.in" />
      <RHFTextField name="phone"           label="Phone Number"        required type="tel"   placeholder="+91 99999 00000" />
      <RHFTextField name="website"         label="Website"                       placeholder="https://www.college.edu.in" hint="Include https://" />
      <RHFTextField name="establishedYear" label="Established Year"              type="number" placeholder="1985" hint={`1800 – ${new Date().getFullYear()}`} />
      <RHFTextField name="affiliation"     label="Affiliated University"         span placeholder="e.g. Mumbai University" />
    </div>
  );
}

// ─── Step 2 — Address ─────────────────────────────────────────────────────────
function StepAddress() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <RHFTextField name="address.street"  label="Street / Area"  required span placeholder="123, College Road, Near Landmark" hint="At least 5 characters" />
      <RHFTextField name="address.city"    label="City"           required     placeholder="Mumbai" />
      <RHFSelect    name="address.state"   label="State"          required     placeholder="Select state…" options={INDIA_STATES} />
      <RHFTextField name="address.pincode" label="PIN Code"       required     placeholder="400001" hint="Exactly 6 digits" />
      <RHFTextField name="address.country" label="Country"                     placeholder="India" />
    </div>
  );
}

// ─── Step 3 — Documents ───────────────────────────────────────────────────────
function StepDocuments({ files, onFileChange, fileErrors }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Notification
        type="warning"
        message={`Upload scanned copies. Max ${MAX_MB} MB per file.`}
      />

      <FileUpload
        label="College Logo"
        name="logo"
        accept={ACCEPTED_IMAGE}
        value={files.logo}
        onChange={(file) => onFileChange("logo", file)}
        error={fileErrors?.logo}
        hint="JPG / PNG — optional"
      />

      <FileUpload
        label="Affiliation Certificate"
        name="affiliationCert"
        accept={ACCEPTED_DOC}
        value={files.affiliationCert}
        onChange={(file) => onFileChange("affiliationCert", file)}
        error={fileErrors?.affiliationCert}
        hint="Required — JPG, PNG or PDF"
        required
      />

      <FileUpload
        label="Registration Certificate"
        name="registrationCert"
        accept={ACCEPTED_DOC}
        value={files.registrationCert}
        onChange={(file) => onFileChange("registrationCert", file)}
        error={fileErrors?.registrationCert}
        hint="Optional"
      />
    </div>
  );
}

// ─── Step 4 — Courses ─────────────────────────────────────────────────────────
function CourseDraftTextField({ label, placeholder, type = "text", required, value, error, onChange }) {
  return (
    <TextField
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error}
      required={required}
      fullWidth
    />
  );
}

function StepCourses() {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "courses" });
  const [adding, setAdding] = useState(false);
  const [draft, setDraft]   = useState(EMPTY_COURSE);
  const [draftErr, setDraftErr] = useState({});
  const setD = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const addCourse = async () => {
    try {
      await courseItemSchema.validate(draft, { abortEarly: false });
      append({ ...draft, totalSeats: Number(draft.totalSeats), fees: Number(draft.fees) });
      setDraft(EMPTY_COURSE);
      setDraftErr({});
      setAdding(false);
    } catch (err) {
      const e = {};
      err.inner.forEach((i) => (e[i.path] = i.message));
      setDraftErr(e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Added courses list */}
      {fields.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {fields.map((f, i) => (
            <Card key={f.id} style={{ position: "relative", padding: "13px 15px" }}>
              <Button
                variant="danger"
                size="sm"
                onClick={() => remove(i)}
                style={{ position: "absolute", top: 10, right: 10 }}
              >
                Remove
              </Button>
              <div style={{ fontWeight: 700, paddingRight: 72 }}>
                {f.courseName}
                <span style={{ fontSize: 11, background: "#e8eef8", padding: "2px 7px", borderRadius: 4, marginLeft: 8, fontFamily: "monospace" }}>
                  {f.courseCode}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>
                {[
                  f.duration && `Duration: ${f.duration}`,
                  `Seats: ${f.totalSeats}`,
                  `Fees: ₹${Number(f.fees).toLocaleString("en-IN")}`,
                ].filter(Boolean).join("  ·  ")}
              </div>
            </Card>
          ))}
        </div>
      )}

      {errors.courses?.message && (
        <Notification type="error" message={errors.courses.message} />
      )}

      {/* Add course toggle */}
      {!adding ? (
        <Button variant="outline" onClick={() => setAdding(true)} fullWidth>
          + Add Course
        </Button>
      ) : (
        <Card style={{ padding: 18 }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>New Course</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <CourseDraftTextField
                label="Course Name" required placeholder="B.Tech Computer Science"
                value={draft.courseName} error={draftErr.courseName}
                onChange={(e) => { setD("courseName", e.target.value); setDraftErr((p) => ({ ...p, courseName: undefined })); }}
              />
            </div>
            <CourseDraftTextField
              label="Course Code" required placeholder="BTCSE"
              value={draft.courseCode} error={draftErr.courseCode}
              onChange={(e) => { setD("courseCode", e.target.value); setDraftErr((p) => ({ ...p, courseCode: undefined })); }}
            />
            <CourseDraftTextField
              label="Duration" placeholder="4 Years"
              value={draft.duration} error={draftErr.duration}
              onChange={(e) => { setD("duration", e.target.value); setDraftErr((p) => ({ ...p, duration: undefined })); }}
            />
            <CourseDraftTextField
              label="Total Seats" required type="number" placeholder="120"
              value={draft.totalSeats} error={draftErr.totalSeats}
              onChange={(e) => { setD("totalSeats", e.target.value); setDraftErr((p) => ({ ...p, totalSeats: undefined })); }}
            />
            <CourseDraftTextField
              label="Annual Fees (₹)" required type="number" placeholder="150000"
              value={draft.fees} error={draftErr.fees}
              onChange={(e) => { setD("fees", e.target.value); setDraftErr((p) => ({ ...p, fees: undefined })); }}
            />
            <div style={{ gridColumn: "1/-1" }}>
              <TextField
                label="Description"
                multiline
                rows={3}
                placeholder="Brief description (max 500 chars)…"
                value={draft.description}
                onChange={(e) => { setD("description", e.target.value); setDraftErr((p) => ({ ...p, description: undefined })); }}
                error={!!draftErr.description}
                helperText={draftErr.description}
                fullWidth
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 14 }}>
            <Button variant="outline" onClick={() => { setAdding(false); setDraftErr({}); setDraft(EMPTY_COURSE); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={addCourse}>
              Save Course
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Step 5 — Payment ─────────────────────────────────────────────────────────
function StepPayment({ files, onFileChange, fileErrors }) {
  const upiId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_UPI_ID) ||
    "college@upi";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* QR / UPI block */}
      <Card style={{ padding: 18, textAlign: "center" }}>
        <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>
          Scan QR to Pay Registration Fee
        </p>
        <div
          style={{
            width: 130, height: 130, margin: "0 auto 12px",
            background: "#fff", border: "1px solid #e2e8f4",
            borderRadius: 9, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 12, color: "#94a3b8",
          }}
        >
          [QR CODE]
        </div>
        <p style={{ margin: "0 0 5px", fontSize: 13, color: "#64748b" }}>
          Or pay to UPI ID:
        </p>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#c9973a" }}>
          {upiId}
        </div>
      </Card>

      {/* Upload proof */}
      <Card style={{ padding: 18 }}>
        <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>
          Upload Payment Proof
        </p>
        <FileUpload
          label="Payment Receipt / Screenshot"
          name="paymentReceipt"
          accept={ACCEPTED_DOC}
          value={files.paymentReceipt}
          onChange={(file) => onFileChange("paymentReceipt", file)}
          error={fileErrors?.paymentReceipt}
          hint="JPG, PNG or PDF — required"
          required
        />
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 50 }}>
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
              <div style={{ flex: 1, height: 2, minWidth: 16, marginBottom: 20, background: done ? "#c9973a" : "#e2e8f4", transition: "background .2s" }} />
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

// ─── Main component ────────────────────────────────────────────────────────────
const CollegeRegistrationForm = forwardRef(function CollegeRegistrationForm(
  { onClose, onSaved, college: defaultValues = null, collegeId = null },
  ref,
) {
  const { updateCollege, registerCollege } = useColleges();
  const isEdit = !!defaultValues && Object.keys(defaultValues).length > 0;

  const [step, setStep]           = useState(0);
  const [files, setFiles]         = useState(INITIAL_FILE_VALUES);
  const [fileErrors, setFileErrors] = useState({});
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const methods = useForm({
    defaultValues: isEdit ? buildFormValues(defaultValues) : INITIAL_FORM_VALUES,
    resolver: yupResolver(
      Yup.object()
        .concat(basicInfoSchema)
        .concat(addressSchema)
        .concat(coursesSchema),
    ),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { handleSubmit, trigger, getValues, clearErrors, reset } = methods;

  // Sync when defaultValues change (edit mode re-open)
  useEffect(() => {
    if (isEdit && defaultValues) {
      reset(buildFormValues(defaultValues));
      setStep(0);
      setFiles({
        logo:             resolveExistingFileValue(defaultValues, "logo"),
        affiliationCert:  resolveExistingFileValue(defaultValues, "affiliationCert"),
        registrationCert: resolveExistingFileValue(defaultValues, "registrationCert"),
        paymentReceipt:   resolveExistingFileValue(defaultValues, "paymentReceipt"),
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

  const validateFiles = async (atStep) => {
    const s = atStep !== undefined ? atStep : step;
    setFileErrors({});

    if (s === 2) {
      const hasExisting = isExistingFileRef(resolveExistingFileValue(defaultValues, "affiliationCert"));
      if (!files.affiliationCert && !hasExisting) {
        setFileErrors({ affiliationCert: "Affiliation certificate is required" });
        return false;
      }
      for (const [key, file] of Object.entries({ logo: files.logo, affiliationCert: files.affiliationCert, registrationCert: files.registrationCert })) {
        if (file && !isExistingFileRef(file) && file.size > MAX_BYTES) {
          setFileErrors({ [key]: `File must be under ${MAX_MB} MB` });
          return false;
        }
      }
      return true;
    }

    if (s === 4) {
      const hasExistingReceipt = isExistingFileRef(resolveExistingFileValue(defaultValues, "paymentReceipt"));
      if (!isEdit && !files.paymentReceipt) {
        setFileErrors({ paymentReceipt: "Payment receipt is required" });
        return false;
      }
      if (isEdit && !files.paymentReceipt && !hasExistingReceipt) {
        setFileErrors({ paymentReceipt: "Payment receipt is required" });
        return false;
      }
      if (files.paymentReceipt && !isExistingFileRef(files.paymentReceipt) && files.paymentReceipt.size > MAX_BYTES) {
        setFileErrors({ paymentReceipt: `File must be under ${MAX_MB} MB` });
        return false;
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
    const ok = step === 2 || step === 4 ? await validateFiles() : await validateRHF();
    if (ok) { clearErrors(); setStep((s) => s + 1); }
    return ok;
  };

  const handleBack = () => {
    setFileErrors({});
    clearErrors();
    setStep((s) => s - 1);
  };

  const doSubmit = async (data) => {
    // Re-validate all RHF fields
    const allFields = [...STEP_RHF_FIELDS[0], ...STEP_RHF_FIELDS[1]];
    const results   = await Promise.all(allFields.map((f) => trigger(f)));
    if (!results.every(Boolean)) {
      const step0ok = await Promise.all(STEP_RHF_FIELDS[0].map((f) => trigger(f)));
      setStep(step0ok.every(Boolean) ? 1 : 0);
      return;
    }

    if (!(await validateFiles(4))) { setStep(4); return; }
    if (isEdit && !collegeId) { alert("College ID missing!"); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("collegeName",     data.collegeName);
      fd.append("collegeCode",     data.collegeCode);
      fd.append("email",           data.email);
      fd.append("phone",           data.phone);
      fd.append("website",         data.website || "");
      fd.append("establishedYear", data.establishedYear || "");
      fd.append("collegeType",     data.collegeType);
      fd.append("affiliation",     data.affiliation || "");
      fd.append("address",         JSON.stringify(data.address));
      fd.append("courses",         JSON.stringify(data.courses || []));

      Object.entries(files).forEach(([k, v]) => {
        if (v && !isExistingFileRef(v)) fd.append(k, v);
      });

      if (isEdit) {
        await updateCollege({ id: collegeId, payload: fd });
      } else {
        await registerCollege(fd);
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
            {isEdit ? "Changes Saved!" : "Registration Submitted!"}
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75, margin: "0 0 26px" }}>
            {isEdit
              ? <>Details for <strong>{getValues("collegeName")}</strong> have been updated successfully.</>
              : <>Your application for <strong>{getValues("collegeName")}</strong> with {getValues("courses")?.length || 0} course(s) has been received.</>}
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
      /* pass whatever props your Modal accepts for full-height scrollable content */
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
              {isEdit ? "Edit College" : "Register Your College"}
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", margin: "2px 0 0" }}>
              Complete all {STEPS.length} steps to {isEdit ? "save changes" : "apply for listing"}
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

              {step === 0 && <StepBasic />}
              {step === 1 && <StepAddress />}
              {step === 2 && <StepDocuments files={files} onFileChange={setFile} fileErrors={fileErrors} />}
              {step === 3 && <StepCourses />}
              {step === 4 && <StepPayment  files={files} onFileChange={setFile} fileErrors={fileErrors} />}

              {/* Global submit error */}
              {fileErrors._submit && (
                <Notification
                  type="error"
                  message={fileErrors._submit}
                  style={{ marginTop: 14 }}
                />
              )}

              {/* Navigation buttons */}
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

export default CollegeRegistrationForm;
