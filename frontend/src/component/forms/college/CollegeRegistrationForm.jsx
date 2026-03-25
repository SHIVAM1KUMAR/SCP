
import React, {
  useState, useRef, useEffect, forwardRef,
} from "react";
import {
  useForm, FormProvider, useFormContext, useFieldArray,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useColleges } from "../../../hooks/useCollege";


// ─── Constants (inline — swap for your import if preferred) ──────────────────
export const COLLEGE_TYPES = [
  "Government", "Private", "Deemed University", "Autonomous",
  "Affiliated", "Central University", "State University", "Other",
];

export const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// ─── Config ───────────────────────────────────────────────────────────────────
const STEPS             = ["Basic Info", "Address", "Documents", "Courses", "Payment"];
const ACCEPTED_IMAGE    = ".jpg,.jpeg,.png";
const ACCEPTED_DOC      = ".jpg,.jpeg,.png,.pdf";
const MAX_MB            = 5;
const MAX_BYTES         = MAX_MB * 1024 * 1024;

// ─── Default values ───────────────────────────────────────────────────────────
export const EMPTY_COURSE = {
  courseName: "", courseCode: "", duration: "",
  totalSeats: "", fees: "", description: "",
};

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

// ─── Yup helpers ──────────────────────────────────────────────────────────────
const optionalFile = (label) =>
  Yup.mixed().nullable()
    .test("fileSize", `${label} must be under ${MAX_MB} MB`,
      (v) => !v || v.size <= MAX_BYTES);

const requiredFile = (label) =>
  Yup.mixed().required(`${label} is required`)
    .test("fileSize", `${label} must be under ${MAX_MB} MB`,
      (v) => !!v && v.size <= MAX_BYTES);

// ─── Yup schemas ──────────────────────────────────────────────────────────────
const basicInfoSchema = Yup.object({
  collegeName:     Yup.string().trim().min(3,"Min 3 chars").max(150,"Max 150 chars").required("College name is required"),
  collegeCode:     Yup.string().trim().min(2,"Min 2 chars").max(20,"Max 20 chars")
                     .matches(/^[A-Z0-9]+$/,"Uppercase letters & numbers only").required("College code is required"),
  email:           Yup.string().trim().email("Enter a valid email").required("Email is required"),
  phone:           Yup.string().trim().matches(/^[+\d][\d\s\-().]{7,14}$/,"Enter a valid phone number").required("Phone is required"),
  website:         Yup.string().url("Must be a valid URL (include https://)").nullable().transform(v => v===""?null:v).optional(),
  establishedYear: Yup.number().typeError("Enter a valid year").integer().min(1800,"Min 1800")
                     .max(new Date().getFullYear(),`Max ${new Date().getFullYear()}`).nullable()
                     .transform((val,orig)=>orig===""?null:val).optional(),
  collegeType:     Yup.string().oneOf(COLLEGE_TYPES,"Select a valid type").required("College type is required"),
  affiliation:     Yup.string().max(150,"Max 150 chars").optional(),
});

const addressSchema = Yup.object({
  address: Yup.object({
    street:  Yup.string().trim().min(5,"Min 5 chars").required("Street is required"),
    city:    Yup.string().trim().min(2,"Min 2 chars").required("City is required"),
    state:   Yup.string().oneOf(INDIA_STATES,"Select a valid state").required("State is required"),
    pincode: Yup.string().matches(/^\d{6}$/,"Must be exactly 6 digits").required("PIN code is required"),
    country: Yup.string().optional(),
  }),
});

const documentsSchema = Yup.object({
  affiliationCert:  requiredFile("Affiliation certificate"),
  logo:             optionalFile("College logo"),
  registrationCert: optionalFile("Registration certificate"),
});

export const courseItemSchema = Yup.object({
  courseName:  Yup.string().trim().min(2,"Min 2 chars").max(100,"Max 100 chars").required("Course name is required"),
  courseCode:  Yup.string().trim().min(2,"Min 2 chars").max(20,"Max 20 chars").required("Course code is required"),
  duration:    Yup.string().max(30,"Max 30 chars").optional(),
  totalSeats:  Yup.number().typeError("Must be a number").integer("Whole number only")
                 .min(1,"At least 1 seat").max(10000,"Max 10,000").required("Total seats is required"),
  fees:        Yup.number().typeError("Must be a number").min(0,"Cannot be negative")
                 .max(10000000,"Value too high").required("Fees is required"),
  description: Yup.string().max(500,"Max 500 chars").optional(),
});

const coursesSchema  = Yup.object({ courses: Yup.array().of(courseItemSchema).optional() });
const paymentSchema  = Yup.object({ paymentReceipt: requiredFile("Payment receipt") });

const STEP_SCHEMAS = [basicInfoSchema, addressSchema, documentsSchema, coursesSchema, paymentSchema];

// Fields to trigger per RHF step (used for live validation scoping)
const STEP_RHF_FIELDS = {
  0: ["collegeName","collegeCode","email","phone","website","establishedYear","collegeType","affiliation"],
  1: ["address.street","address.city","address.state","address.pincode"],
  3: ["courses"],
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy:    "#0f2044", navyMid: "#1a3460", navyLt: "#e8eef8",
  gold:    "#c9973a", goldLt:  "#fef3d7",
  cream:   "#faf8f4", white:   "#ffffff",
  slate:   "#64748b", slateXl: "#94a3b8", border: "#e2e8f4",
  red:     "#dc2626", redBg:   "#fef2f2", redBdr: "#fecaca",
  green:   "#16a34a", greenBg: "#f0fdf4",
  shadow:  "0 8px 40px rgba(15,32,68,0.18)",
};
const font = { display: "'DM Serif Display',Georgia,serif", body: "'DM Sans',system-ui,sans-serif" };

// ─── Input style helpers ──────────────────────────────────────────────────────
const mkInp = (hasErr) => ({
  width:"100%", height:44, padding:"0 13px",
  border:`1.5px solid ${hasErr?C.red:C.border}`,
  borderRadius:9, fontSize:14, fontFamily:font.body, color:C.navy,
  background:hasErr?C.redBg:C.white, outline:"none", boxSizing:"border-box",
  transition:"border-color .15s,box-shadow .15s",
});
const iFocus = (e,err) => {
  e.target.style.borderColor = err?C.red:C.gold;
  e.target.style.boxShadow   = `0 0 0 3px ${err?"rgba(220,38,38,.12)":"rgba(201,151,58,.18)"}`;
};
const iBlur  = (e,err) => {
  e.target.style.borderColor = err?C.red:C.border;
  e.target.style.boxShadow   = "none";
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children, span }) {
  return (
    <div style={{ gridColumn:span?"1/-1":undefined, display:"flex", flexDirection:"column", gap:4 }}>
      {label && (
        <label style={{ fontSize:11.5, fontWeight:700, color:C.slate,
          letterSpacing:"0.5px", textTransform:"uppercase", fontFamily:font.body }}>
          {label}{required && <span style={{ color:C.red, marginLeft:2 }}>*</span>}
        </label>
      )}
      {children}
      {error
        ? <p style={{ margin:0, fontSize:12, color:C.red, fontFamily:font.body,
            display:"flex", alignItems:"center", gap:4 }}>
            <span>⚠</span>{error}
          </p>
        : hint
        ? <p style={{ margin:0, fontSize:11.5, color:C.slateXl, fontFamily:font.body }}>{hint}</p>
        : null}
    </div>
  );
}

// ─── RHF text / number input — live validation ────────────────────────────────
function RHFInput({ name, label, required, hint, type="text", placeholder, span, xStyle={}, ...rest }) {
  const { register, trigger, formState:{ errors } } = useFormContext();
  const err = name.split(".").reduce((o,k)=>o?.[k],errors)?.message;
  return (
    <Field label={label} required={required} error={err} hint={hint} span={span}>
      <input
        {...register(name, {
          onChange: () => trigger(name),   // ← live validation on each keystroke
        })}
        type={type} placeholder={placeholder}
        style={{ ...mkInp(!!err), ...xStyle }}
        onFocus={e=>iFocus(e,!!err)} onBlur={e=>{ iBlur(e,!!err); trigger(name); }}
        {...rest}
      />
    </Field>
  );
}

// ─── RHF select — live validation ────────────────────────────────────────────
function RHFSelect({ name, label, required, hint, placeholder, options, span }) {
  const { register, trigger, formState:{ errors } } = useFormContext();
  const err = name.split(".").reduce((o,k)=>o?.[k],errors)?.message;
  return (
    <Field label={label} required={required} error={err} hint={hint} span={span}>
      <select
        {...register(name, { onChange: ()=>trigger(name) })}
        style={{ ...mkInp(!!err), cursor:"pointer", appearance:"none",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2364748b' d='M5 7L0 0h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 13px center", paddingRight:34 }}
        onFocus={e=>iFocus(e,!!err)} onBlur={e=>{ iBlur(e,!!err); trigger(name); }}>
        <option value="">{placeholder}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
}

// ─── File field ───────────────────────────────────────────────────────────────
function FileField({ label, name, accept, onChange, value, required, error, hint }) {
  const ref = useRef();
  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <div
        onClick={()=>ref.current.click()}
        style={{ border:`1.5px dashed ${error?C.red:value?"#86efac":C.border}`,
          borderRadius:10, padding:"13px 15px", cursor:"pointer",
          background:error?C.redBg:value?C.greenBg:C.cream,
          display:"flex", alignItems:"center", gap:12, transition:"all .15s" }}
        onMouseEnter={e=>(e.currentTarget.style.borderColor=C.gold)}
        onMouseLeave={e=>(e.currentTarget.style.borderColor=error?C.red:value?"#86efac":C.border)}>
        <div style={{ width:36, height:36, borderRadius:8, flexShrink:0,
          background:value?"#dcfce7":error?C.redBdr:C.navyLt,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>
          {value?"✅":error?"⚠️":"📎"}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, fontFamily:font.body,
            color:value?C.green:error?C.red:C.navy }}>
            {value?value.name:"Click to upload"}
          </div>
          <div style={{ fontSize:11.5, color:C.slateXl, marginTop:1, fontFamily:font.body }}>
            {accept.replace(/\./g,"").toUpperCase().split(",").join(", ")} · max {MAX_MB} MB
          </div>
        </div>
      </div>
      <input ref={ref} type="file" accept={accept} style={{ display:"none" }}
        onChange={e=>onChange(name, e.target.files[0])} />
    </Field>
  );
}

// ─── Step 0 — Basic Info ──────────────────────────────────────────────────────
function StepBasic() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
      <RHFInput name="collegeName" label="College Name" required span
        placeholder="e.g. St. Xavier's College of Engineering"
        hint="Full official name as per records" />
      <RHFInput name="collegeCode" label="College Code" required
        placeholder="e.g. SXC001" xStyle={{ textTransform:"uppercase" }}
        hint="2–20 uppercase letters/numbers" />
      <RHFSelect name="collegeType" label="College Type" required
        placeholder="Select type…" options={COLLEGE_TYPES} />
      <RHFInput name="email" type="email" label="Official Email" required
        placeholder="admin@college.edu.in" />
      <RHFInput name="phone" type="tel" label="Phone Number" required
        placeholder="+91 99999 00000" />
      <RHFInput name="website" label="Website"
        placeholder="https://www.college.edu.in" hint="Include https://" />
      <RHFInput name="establishedYear" type="number" label="Established Year"
        placeholder="e.g. 1985" min="1800" max={String(new Date().getFullYear())}
        hint={`1800 – ${new Date().getFullYear()}`} />
      <RHFInput name="affiliation" label="Affiliated University" span
        placeholder="e.g. Mumbai University" />
    </div>
  );
}

// ─── Step 1 — Address ─────────────────────────────────────────────────────────
function StepAddress() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <RHFInput name="address.street" label="Street / Area" required span
        placeholder="123, College Road, Near Landmark" hint="At least 5 characters" />
      <RHFInput name="address.city" label="City" required placeholder="Mumbai" />
      <RHFSelect name="address.state" label="State" required
        placeholder="Select state…" options={INDIA_STATES} />
      <RHFInput name="address.pincode" label="PIN Code" required
        placeholder="400001" maxLength={6} hint="Exactly 6 digits" />
      <RHFInput name="address.country" label="Country" placeholder="India" />
    </div>
  );
}

// ─── Step 2 — Documents ───────────────────────────────────────────────────────
function StepDocuments({ files, onFileChange, fileErrors }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ padding:"11px 14px", background:"#fffbeb",
        border:"1px solid #fde68a", borderRadius:9,
        fontSize:13, color:"#92400e", fontFamily:font.body }}>
        📋 Upload scanned copies. Max {MAX_MB} MB per file.
      </div>
      <FileField label="College Logo" name="logo" accept={ACCEPTED_IMAGE}
        value={files.logo} onChange={onFileChange} error={fileErrors?.logo} hint="JPG / PNG — optional" />
      <FileField label="Affiliation Certificate" name="affiliationCert" required
        accept={ACCEPTED_DOC} value={files.affiliationCert} onChange={onFileChange}
        error={fileErrors?.affiliationCert} hint="Required — JPG, PNG or PDF" />
      <FileField label="Registration Certificate" name="registrationCert"
        accept={ACCEPTED_DOC} value={files.registrationCert} onChange={onFileChange}
        error={fileErrors?.registrationCert} hint="Optional" />
    </div>
  );
}

// ─── Step 3 — Courses ─────────────────────────────────────────────────────────
function StepCourses() {
  const { control, formState:{ errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name:"courses" });
  const [adding,  setAdding]  = useState(false);
  const [draft,   setDraft]   = useState(EMPTY_COURSE);
  const [draftErr,setDraftErr]= useState({});

  const setD = (k,v) => setDraft(d=>({...d,[k]:v}));

  const addCourse = async () => {
    try {
      await courseItemSchema.validate(draft, { abortEarly:false });
      append({ ...draft, totalSeats:Number(draft.totalSeats), fees:Number(draft.fees) });
      setDraft(EMPTY_COURSE); setDraftErr({}); setAdding(false);
    } catch (err) {
      const e={};
      err.inner.forEach(i=>(e[i.path]=i.message));
      setDraftErr(e);
    }
  };

  const DI = ({ field, label, placeholder, type="text", required }) => (
    <Field label={label} required={required} error={draftErr[field]}>
      <input type={type} placeholder={placeholder} value={draft[field]}
        onChange={e=>{ setD(field,e.target.value); setDraftErr(prev=>({...prev,[field]:undefined})); }}
        style={mkInp(!!draftErr[field])}
        onFocus={e=>iFocus(e,!!draftErr[field])} onBlur={e=>iBlur(e,!!draftErr[field])} />
    </Field>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {fields.length>0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {fields.map((f,i)=>(
            <div key={f.id} style={{ border:`1px solid ${C.border}`, borderRadius:10,
              padding:"13px 15px", background:C.cream, position:"relative" }}>
              <button type="button" onClick={()=>remove(i)} style={{
                position:"absolute", top:10, right:10, background:"#fee2e2",
                border:"none", borderRadius:6, color:C.red, cursor:"pointer",
                fontSize:12, padding:"3px 8px", fontFamily:font.body, fontWeight:600 }}>
                Remove
              </button>
              <div style={{ fontSize:14, fontWeight:700, color:C.navy,
                fontFamily:font.body, paddingRight:72 }}>
                {f.courseName}
                <span style={{ fontSize:11, fontWeight:600, background:C.navyLt,
                  padding:"2px 7px", borderRadius:4, marginLeft:8,
                  color:C.navyMid, fontFamily:"monospace" }}>
                  {f.courseCode}
                </span>
              </div>
              <div style={{ fontSize:12.5, color:C.slate, marginTop:3, fontFamily:font.body }}>
                {[f.duration&&`Duration: ${f.duration}`,
                  `Seats: ${f.totalSeats}`,
                  `Fees: ₹${Number(f.fees).toLocaleString("en-IN")}`
                ].filter(Boolean).join("  ·  ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.courses?.message && (
        <p style={{ margin:0, fontSize:12, color:C.red, fontFamily:font.body }}>
          ⚠ {errors.courses.message}
        </p>
      )}

      {!adding ? (
        <button type="button" onClick={()=>setAdding(true)} style={{
          padding:"12px", border:`1.5px dashed ${C.gold}`,
          borderRadius:9, background:"#fffdf7", color:C.gold,
          fontWeight:700, cursor:"pointer", fontFamily:font.body, fontSize:14,
          display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          + Add Course
        </button>
      ) : (
        <div style={{ border:`1px solid ${C.border}`, borderRadius:11, padding:18,
          background:C.white, boxShadow:"0 4px 16px rgba(15,32,68,.07)" }}>
          <p style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:C.navy, fontFamily:font.body }}>
            New Course
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <DI field="courseName" label="Course Name" required placeholder="e.g. B.Tech Computer Science" />
            </div>
            <DI field="courseCode" label="Course Code" required placeholder="e.g. BTCSE" />
            <DI field="duration"   label="Duration"    placeholder="e.g. 4 Years" />
            <DI field="totalSeats" label="Total Seats" required type="number" placeholder="e.g. 120" />
            <DI field="fees"       label="Annual Fees (₹)" required type="number" placeholder="e.g. 150000" />
            <div style={{ gridColumn:"1/-1" }}>
              <Field label="Description" error={draftErr.description}>
                <textarea
                  style={{ ...mkInp(!!draftErr.description), height:72, resize:"none", paddingTop:10, lineHeight:1.5 }}
                  value={draft.description}
                  onChange={e=>{ setD("description",e.target.value); setDraftErr(p=>({...p,description:undefined})); }}
                  placeholder="Brief description (max 500 chars)…"
                  onFocus={e=>iFocus(e,!!draftErr.description)}
                  onBlur={e=>iBlur(e,!!draftErr.description)} />
              </Field>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:9, marginTop:14 }}>
            <button type="button"
              onClick={()=>{ setAdding(false); setDraftErr({}); setDraft(EMPTY_COURSE); }}
              style={{ padding:"8px 16px", background:"none", border:`1px solid ${C.border}`,
                borderRadius:7, color:C.slate, fontWeight:500,
                cursor:"pointer", fontFamily:font.body, fontSize:13 }}>
              Cancel
            </button>
            <button type="button" onClick={addCourse} style={{
              padding:"8px 18px", background:C.navy, color:C.white,
              border:"none", borderRadius:7, fontWeight:700,
              cursor:"pointer", fontFamily:font.body, fontSize:13 }}>
              Save Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 — Payment ─────────────────────────────────────────────────────────
function StepPayment({ files, onFileChange, fileErrors }) {
  // Use import.meta.env if on Vite, otherwise fallback
  const upiId = (typeof import.meta !== "undefined" && import.meta.env?.VITE_UPI_ID) || "college@upi";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ padding:18, background:C.cream, border:`1px solid ${C.border}`,
        borderRadius:12, textAlign:"center" }}>
        <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:C.navy, fontFamily:font.body }}>
          Scan QR to Pay Registration Fee
        </p>
        <div style={{ width:130, height:130, margin:"0 auto 12px",
          background:C.white, border:`1px solid ${C.border}`, borderRadius:9,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, color:C.slateXl, fontFamily:font.body }}>
          [QR CODE]
        </div>
        <p style={{ margin:"0 0 5px", fontSize:13, color:C.slate, fontFamily:font.body }}>
          Or pay to UPI ID:
        </p>
        <div style={{ fontWeight:700, fontSize:15, color:C.gold, fontFamily:font.body }}>
          {upiId}
        </div>
      </div>
      <div style={{ padding:18, background:C.white, border:`1px solid ${C.border}`, borderRadius:12 }}>
        <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:C.navy, fontFamily:font.body }}>
          Upload Payment Proof
        </p>
        <FileField label="Payment Receipt / Screenshot" name="paymentReceipt" required
          accept={ACCEPTED_DOC} value={files.paymentReceipt}
          onChange={onFileChange} error={fileErrors?.paymentReceipt}
          hint="JPG, PNG or PDF — required" />
      </div>
    </div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", marginBottom:24, overflowX:"auto", gap:0 }}>
      {STEPS.map((label,i)=>{
        const done=i<current, active=i===current;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex:i<STEPS.length-1?1:"none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, minWidth:50 }}>
              <div style={{
                width:36, height:36, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:700, flexShrink:0, fontFamily:font.body,
                background:done?C.gold:active?C.navy:"#eef2f8",
                color:done||active?C.white:C.slateXl,
                border:active?`3px solid ${C.gold}`:"none",
                boxShadow:active?"0 0 0 4px rgba(201,151,58,.18)":"none",
                transition:"all .2s",
              }}>
                {done?"✓":i+1}
              </div>
              <span style={{ fontSize:10, fontWeight:active?700:500, fontFamily:font.body,
                textAlign:"center", color:active?C.navy:done?C.gold:C.slateXl, whiteSpace:"nowrap" }}>
                {label}
              </span>
            </div>
            {i<STEPS.length-1 && (
              <div style={{ flex:1, height:2, minWidth:16, marginBottom:20,
                background:done?C.gold:C.border, transition:"background .2s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Backdrop ─────────────────────────────────────────────────────────────────
// Defined BEFORE CollegeRegistrationForm so it is available (no hoisting issue)
function Backdrop({ children, onClose, zIndex=10001 }) {
  return (
    <div
      style={{ position:"fixed", inset:0, zIndex,
        background:"rgba(10,20,44,.6)", backdropFilter:"blur(4px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"12px", fontFamily:font.body }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose?.(); }}
    >
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * Props:
 *  onClose        — () => void           close handler
 *  college        — object | null        pre-populated values for edit mode
 *  collegeId      — string | null        id used when PATCHing
 *  readOnly       — boolean              disable all inputs (optional)
 */
const CollegeRegistrationForm = forwardRef(function CollegeRegistrationForm(
  { onClose, college: defaultValues = null, collegeId = null, readOnly = false },
  ref,
) {
  const { updateCollege, registerCollege } = useColleges();
  const isEdit = !!defaultValues && Object.keys(defaultValues).length > 0;

  const [step,       setStep]       = useState(0);
  const [files,      setFiles]      = useState(INITIAL_FILE_VALUES);
  const [fileErrors, setFileErrors] = useState({});
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);

  // Single resolver covering ALL steps — values never lost on step change
  const methods = useForm({
    defaultValues: isEdit ? defaultValues : INITIAL_FORM_VALUES,
   resolver: yupResolver(
  Yup.object()
    .concat(basicInfoSchema)
    .concat(addressSchema)
    .concat(documentsSchema)   // ✅ add this
    .concat(coursesSchema)
    .concat(paymentSchema) 
),
    mode:          "onChange",     // ← live validation on every change
    reValidateMode:"onChange",
  });

  const { handleSubmit, trigger, getValues, setError, clearErrors, reset } = methods;

  // ── FIX: Reset form when edit data changes (edit button opens form with prev data) ──
  useEffect(() => {
  if (isEdit && defaultValues) {
    reset(defaultValues);
    setStep(0);
    // Preserve existing files in edit mode if available
    setFiles({
      logo: defaultValues?.logo || null,
      affiliationCert: defaultValues?.affiliationCert || null,
      registrationCert: defaultValues?.registrationCert || null,
      paymentReceipt: defaultValues?.paymentReceipt || null,
    });
    setFileErrors({});
    setSuccess(false);
  }
}, [defaultValues, isEdit, reset]);

  // Expose helpers to parent via ref
  React.useImperativeHandle(ref, () => ({
    handleNext,
    handleBack,
    submitForm: handleSubmit(doSubmit),
  }));

  const setFile = (k, file) => {
    setFiles(f=>({...f,[k]:file}));
    setFileErrors(e=>({...e,[k]:undefined}));   // clear error immediately on file pick
  };

  const validateFiles = async (atStep) => {
    const s = atStep!==undefined ? atStep : step;
    const data = s===2
      ? { logo:files.logo, affiliationCert:files.affiliationCert, registrationCert:files.registrationCert }
      : { paymentReceipt:files.paymentReceipt };
    try {
      await STEP_SCHEMAS[s].validate(data, { abortEarly:false });
      setFileErrors({});
      return true;
    } catch (err) {
      const e={};
      err.inner.forEach(i=>(e[i.path]=i.message));
      setFileErrors(e);
      return false;
    }
  };

  const validateRHF = async () => {
    const fields = STEP_RHF_FIELDS[step] || [];
    const results = await Promise.all(fields.map(f=>trigger(f)));
    return results.every(Boolean);
  };

  const handleNext = async () => {
    let ok = false;
    if (step===2 || step===4) {
      ok = await validateFiles();
    } else {
      ok = await validateRHF();
    }
    if (ok) { clearErrors(); setStep(s=>s+1); }
  };

  const handleBack = () => {
    setFileErrors({});
    clearErrors();
    setStep(s=>s-1);
  };

  const doSubmit = async (data) => {
  if (!(await validateFiles(4))) return;

  if (isEdit && !collegeId) {
    alert("College ID missing!");
    return;
  }

  setLoading(true);

  try {
    const fd = new FormData();

    fd.append("collegeName", data.collegeName);
    fd.append("collegeCode", data.collegeCode);
    fd.append("email", data.email);
    fd.append("phone", data.phone);
    fd.append("website", data.website || "");
    fd.append("establishedYear", data.establishedYear || "");
    fd.append("collegeType", data.collegeType);
    fd.append("affiliation", data.affiliation || "");
    fd.append("address", JSON.stringify(data.address));
    fd.append("courses", JSON.stringify(data.courses || []));

    Object.entries(files).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });

    if (isEdit) {
      updateCollege({
        id: collegeId,
        payload: fd,
      });
    } else {
      registerCollege(fd);
    }

    setSuccess(true);
  } catch (e) {
    setFileErrors((prev) => ({
      ...prev,
      _submit: "Submission failed",
    }));
  } finally {
    setLoading(false);
  }
};

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <Backdrop onClose={onClose}>
        <div style={{ background:C.white, borderRadius:18, padding:"48px 40px",
          maxWidth:440, width:"100%", textAlign:"center", boxShadow:C.shadow }}>
          <div style={{ width:72, height:72, borderRadius:"50%",
            background:C.greenBg, display:"flex", alignItems:"center",
            justifyContent:"center", margin:"0 auto 18px", fontSize:36 }}>✅</div>
          <h2 style={{ fontFamily:font.display, fontSize:24, color:C.navy,
            margin:"0 0 10px", fontWeight:400 }}>
            {isEdit ? "Changes Saved!" : "Registration Submitted!"}
          </h2>
          <p style={{ fontSize:14, color:C.slate, lineHeight:1.75,
            margin:"0 0 26px", fontFamily:font.body }}>
            {isEdit
              ? <>Details for <strong style={{ color:C.navy }}>{getValues("collegeName")}</strong> have been updated successfully.</>
              : <>Your application for <strong style={{ color:C.navy }}>{getValues("collegeName")}</strong>{" "}
                  with {getValues("courses")?.length||0} course(s) has been received. Our team will review and verify payment.</>
            }
          </p>
          <button onClick={onClose} style={{ padding:"10px 26px", background:C.navy,
            color:C.white, border:"none", borderRadius:9, fontWeight:700,
            fontFamily:font.body, fontSize:14, cursor:"pointer" }}>
            Close
          </button>
        </div>
      </Backdrop>
    );
  }

  // ── Form modal ────────────────────────────────────────────────────────────
  return (
    <Backdrop onClose={onClose} zIndex={10001}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        .cd-scroll::-webkit-scrollbar{width:4px}
        .cd-scroll::-webkit-scrollbar-thumb{background:#dde3ed;border-radius:4px}
        .cd-nav:hover:not(:disabled){opacity:.85;transform:translateY(-1px)}
        .cd-nav{transition:all .18s}
        @keyframes spin{to{transform:rotate(360deg)}}
        .cd-close:hover{background:rgba(255,255,255,0.28)!important}
      `}</style>

      <div style={{
        position:"relative", width:"100%", maxWidth:700,
        maxHeight:"96vh", background:C.white, borderRadius:18,
        boxShadow:C.shadow, display:"flex", flexDirection:"column",
        overflow:"hidden",
      }}>

        {/* ── STICKY HEADER — close button is PART of the flex row, never hidden ── */}
        <div style={{
          flexShrink:0, padding:"16px 22px",
          background:`linear-gradient(135deg,${C.navy} 0%,${C.navyMid} 100%)`,
          borderRadius:"18px 18px 0 0",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          // overflow must NOT be hidden here so the button is always visible
        }}>
          <div style={{ minWidth:0 }}>
            <h1 style={{ fontFamily:font.display, fontSize:20, color:C.white,
              margin:0, fontWeight:400, whiteSpace:"nowrap",
              overflow:"hidden", textOverflow:"ellipsis" }}>
              {isEdit ? "Edit College" : "Register Your College"}
            </h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,.55)",
              margin:"2px 0 0", fontFamily:font.body }}>
              Complete all {STEPS.length} steps to {isEdit?"save changes":"apply for listing"}
            </p>
          </div>

          {/* ── CLOSE BUTTON — always visible, in header flex row ── */}
          <button
            className="cd-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
            style={{
              flexShrink:0, width:34, height:34, borderRadius:"50%",
              background:"rgba(255,255,255,.14)",
              border:"1.5px solid rgba(255,255,255,.28)",
              color:C.white, fontSize:20, lineHeight:1,
              cursor:"pointer", display:"flex",
              alignItems:"center", justifyContent:"center",
              transition:"background .15s",
              // Ensure it's never clipped
              position:"relative", zIndex:1,
            }}
          >
            ×
          </button>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="cd-scroll" style={{ flex:1, overflowY:"auto", padding:"24px 28px 28px" }}>
          <StepBar current={step} />

          <div style={{ marginBottom:20, paddingBottom:13, borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"1.1px",
              textTransform:"uppercase", color:C.gold, fontFamily:font.body }}>
              Step {step+1} of {STEPS.length}
            </span>
            <h2 style={{ fontFamily:font.body, fontSize:15, fontWeight:700,
              color:C.navy, margin:"2px 0 0" }}>
              {STEPS[step]}
            </h2>
          </div>

          {/* FormProvider wraps everything — NO key={step} so values persist */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(doSubmit)} noValidate>

              {step===0 && <StepBasic />}
              {step===1 && <StepAddress />}
              {step===2 && <StepDocuments files={files} onFileChange={setFile} fileErrors={fileErrors} />}
              {step===3 && <StepCourses />}
              {step===4 && <StepPayment  files={files} onFileChange={setFile} fileErrors={fileErrors} />}

              {/* Global submit error */}
              {fileErrors._submit && (
                <div style={{ marginTop:14, padding:"10px 14px",
                  background:C.redBg, border:`1px solid ${C.redBdr}`,
                  borderRadius:8, fontSize:13, color:C.red,
                  fontFamily:font.body, display:"flex", gap:7, alignItems:"flex-start" }}>
                  <span style={{ flexShrink:0 }}>⚠️</span>
                  <span>{fileErrors._submit}</span>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display:"flex", justifyContent:"space-between",
                marginTop:24, gap:10, paddingTop:18, borderTop:`1px solid ${C.border}` }}>

                <button type="button" onClick={handleBack} disabled={step===0}
                  className="cd-nav"
                  style={{ height:42, padding:"0 20px",
                    border:`1.5px solid ${C.border}`, borderRadius:9,
                    background:C.white, fontFamily:font.body,
                    color:step===0?C.slateXl:C.navy,
                    fontSize:13.5, fontWeight:600,
                    cursor:step===0?"not-allowed":"pointer",
                    opacity:step===0?0.45:1,
                    display:"flex", alignItems:"center", gap:5 }}>
                  ← Back
                </button>

                {step<STEPS.length-1 ? (
                  <button type="button" onClick={handleNext} className="cd-nav"
                    style={{ height:42, padding:"0 28px", border:"none",
                      borderRadius:9, background:C.navy, color:C.white,
                      fontSize:13.5, fontWeight:700, cursor:"pointer",
                      fontFamily:font.body, boxShadow:"0 4px 12px rgba(15,32,68,.22)",
                      display:"flex", alignItems:"center", gap:5 }}>
                    Continue →
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="cd-nav"
                    style={{ height:42, padding:"0 24px", border:"none",
                      borderRadius:9, fontFamily:font.body,
                      background:loading?C.slateXl:`linear-gradient(135deg,${C.navy},${C.navyMid})`,
                      color:C.white, fontSize:13.5, fontWeight:700,
                      cursor:loading?"not-allowed":"pointer",
                      boxShadow:loading?"none":"0 4px 14px rgba(15,32,68,.28)",
                      display:"flex", alignItems:"center", gap:7 }}>
                    {loading
                      ? <><span style={{ width:13, height:13,
                          border:"2px solid rgba(255,255,255,.35)",
                          borderTopColor:"#fff", borderRadius:"50%", display:"inline-block",
                          animation:"spin .7s linear infinite" }} />Submitting…</>
                      : isEdit ? "Save Changes ✓" : "Submit Application ✓"}
                  </button>
                )}
              </div>

            </form>
          </FormProvider>
        </div>
      </div>
    </Backdrop>
  );
});

export default CollegeRegistrationForm;