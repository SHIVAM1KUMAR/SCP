/**
 * StudentDetails.jsx
 * Keeps the same page flow, but pushes the visual pieces into shared UI helpers.
 */

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useStudents } from "../../hooks/useStudents";
import StudentRegistrationForm from "../../component/forms/student/studentRegistration";
import {
  C,
  font,
  SectionCard,
  InfoField,
  FileCard,
  PhotoAvatar,
  ActionBtn,
  AcademicBadge,
} from "../../component/ui/studentmanagement/StudentDetailParts";
import { StatusBadge } from "../../component/ui/studentmanagement/StatusBadge";
import {
  FollowUpStatusBadge,
  normalizeFollowUpStatus,
} from "../../component/ui/studentmanagement/FollowUpStatus";
import DeleteStudentModal from "./deleteStudentModal";
import ReviewStudentModal from "./reveiwStudentmodal";
import { getAuth } from "../../store/slice/auth.slice";
import ActivateStudentModal from "./activateStudentModal";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FILE_BASE_URL = BASE_URL.replace(/\/api\/?$/, "");

const getDocumentRef = (docs, key) =>
  docs?.[key]?.url || docs?.[key]?.path || docs?.[key] || "";

export default function StudentDetails({ studentId: studentIdProp = null, embedded = false } = {}) {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { role } = getAuth();
  const roleLower = String(role || "").toLowerCase();
  const isStudent = roleLower === "student";
  const isAdmin = roleLower === "admin";
  const isCollege = roleLower === "college";
  const location = useLocation();
  const isAppliedRoute = location.pathname.includes("/applied-students");
  const listRoute = isStudent
    ? "/student/colleges"
    : isAdmin
      ? "/admin/students"
      : isCollege
        ? isAppliedRoute
          ? "/college/applied-students"
          : "/college/students"
        : "/superadmin/students";
  const studentId = studentIdProp ?? routeId;

  const {
    student: studentResponse,
    isStudentLoading,
    isStudentError,
    deleteStudentAsync,
    activateStudentAsync,
    approveStudentAsync,
    rejectStudentAsync,
    fetchStudent,
    updateStudentFollowUpStatus,
    isDeletingStudent,
    isActivatingStudent,
    isApprovingStudent,
    isRejectingStudent,
  } = useStudents(studentId);

  const student = studentResponse?.data?.data || studentResponse?.data || studentResponse || {};

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const autoMarkedVisitedRef = useRef(null);

  const canManageStudent = !embedded && (isAdmin || roleLower === "superadmin");
  const showCollegeActions = !embedded && isCollege;
  const showProfileActions = embedded && isStudent;
  const canActivateStudent = canManageStudent && ["Approved", "Inactive"].includes(student.status);

  useEffect(() => {
    if (!isCollege || embedded || !student?._id) return;

    const normalizedStatus = normalizeFollowUpStatus(student.followUpStatus);
    const shouldMarkVisited =
      normalizedStatus !== "Visited" &&
      normalizedStatus !== "Counseled" &&
      autoMarkedVisitedRef.current !== student._id;

    if (!shouldMarkVisited) return;

    autoMarkedVisitedRef.current = student._id;
    void updateStudentFollowUpStatus(student._id, "Visited").catch(() => {
      autoMarkedVisitedRef.current = null;
    });
  }, [embedded, isCollege, student?._id, student?.followUpStatus, updateStudentFollowUpStatus]);

  const pageStyle = embedded
    ? { background: "transparent", minHeight: "auto", padding: 0, fontFamily: font.body }
    : { background: "#f4f6fb", minHeight: "100vh", padding: "20px 16px 48px", fontFamily: font.body };

  if (isStudentLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 14, fontFamily: font.body }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.gold, animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 14, color: C.slateXl }}>Loading student details...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isStudentError || !student || Object.keys(student).length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16, fontFamily: font.body }}>
        <span style={{ fontSize: 48 }}>🎓</span>
        <p style={{ fontSize: 16, color: C.slateXl, margin: 0 }}>Student not found or was deleted.</p>
        <ActionBtn label="Back to Students" variant="primary" onClick={() => navigate(listRoute)} />
      </div>
    );
  }

  const docs = student.documentFiles || student.documents || student.docs || {};
  const addr = student.address || {};
  const fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();

  const handleDeleteConfirm = async ({ id }) => {
    const result = await deleteStudentAsync(id);
    setShowDeleteModal(false);
    navigate(listRoute);
    return true;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .sd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 760px) { .sd-grid { grid-template-columns: 1fr; } .sd-full { grid-column: 1 !important; } }
        .sd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 540px) { .sd-info-grid { grid-template-columns: 1fr; } .sd-info-grid > * { grid-column: 1 !important; } }
        .sd-doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .sd-doc-grid { grid-template-columns: 1fr; } }
        .sd-header-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .sd-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .sd-academic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 540px) { .sd-academic-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={pageStyle}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding: "20px 24px" }}>
            <div className="sd-header-row">
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                <PhotoAvatar docs={docs} fileBaseUrl={FILE_BASE_URL} />
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 5px", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fullName || "Unnamed Student"}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <StatusBadge status={student.status || "Pending"} />
                    {!embedded && roleLower !== "student" && (
                      <FollowUpStatusBadge status={student.followUpStatus || "Unvisited"} />
                    )}
                    {student.gender && (
                      <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>{student.gender}</span>
                    )}
                    {student.category && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.slate, fontFamily: font.body, letterSpacing: "0.8px", background: C.navyLight, padding: "3px 10px", borderRadius: 6 }}>{student.category}</span>
                    )}
                  </div>
                </div>
              </div>

              {canManageStudent && (
                <div className="sd-actions">
                  <ActionBtn label="Back" variant="default" onClick={() => navigate(listRoute)} />
                  {student.status !== "Approved" && (
                    <ActionBtn label="Review" variant="success" icon="✓" onClick={() => setShowReviewModal(true)} disabled={isApprovingStudent || isRejectingStudent} />
                  )}
                  {canActivateStudent && (
                    <ActionBtn label="Activate" variant="success" icon="✓" onClick={() => setShowActivateModal(true)} disabled={isActivatingStudent || isRejectingStudent} />
                  )}
                  <ActionBtn label="Edit" variant="primary" icon="✏" onClick={() => setShowEditModal(true)} />
                  <ActionBtn label="Delete" variant="danger" icon="🗑" onClick={() => setShowDeleteModal(true)} disabled={isDeletingStudent} />
                </div>
              )}

              {showCollegeActions && (
                <div className="sd-actions">
                  <ActionBtn label="Back" variant="default" onClick={() => navigate(listRoute)} />
                </div>
              )}

              {showProfileActions && (
                <div className="sd-actions">
                  <ActionBtn label="Edit" variant="primary" icon="✏" onClick={() => setShowEditModal(true)} />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 0, marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 14, flexWrap: "wrap" }}>
              {[
                { label: "10th %", value: student.tenthPercentage ? `${student.tenthPercentage}%` : "—", icon: "📗" },
                { label: "12th %", value: student.twelfthPercentage ? `${student.twelfthPercentage}%` : "—", icon: "📘" },
                { label: "Entrance Exam", value: student.entranceExamName || "—", icon: "🏆" },
                { label: "AIR / Score", value: student.entranceExamRank ? `#${student.entranceExamRank}` : student.entranceExamScore || "—", icon: "🎯" },
              ].map((s, i) => (
                <div key={i} style={{ flex: "1 1 120px", padding: "8px 14px", borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize: 11, color: C.slateXl, fontFamily: font.body, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: font.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sd-grid">
          <SectionCard title="Personal Information" icon="👤">
            <div className="sd-info-grid">
              <InfoField label="Full Name" value={fullName} fullWidth />
              <InfoField label="Email" value={student.email} />
              <InfoField label="Mobile" value={student.phone} />
              <InfoField label="Date of Birth" value={student.dateOfBirth} />
              <InfoField label="Age" value={student.age} />
              <InfoField label="Blood Group" value={student.bloodGroup} />
              <InfoField label="Nationality" value={student.nationality} />
              <InfoField label="Aadhar No." value={student.aadharNumber ? `•••• •••• ${student.aadharNumber.slice(-4)}` : ""} mono />
            </div>
          </SectionCard>

          <SectionCard title="Parent / Guardian" icon="👨‍👩‍👦">
            <div className="sd-info-grid">
              <InfoField label="Father / Son of" value={student.fatherName} fullWidth />
              <InfoField label="Mother's Name" value={student.motherName} />
              <InfoField label="Guardian Phone" value={student.guardianPhone} />
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.slateXl, letterSpacing: "0.7px", textTransform: "uppercase", marginBottom: 12 }}>📍 Address</div>
              <div className="sd-info-grid">
                <InfoField label="Street / Area" value={addr.street} fullWidth />
                <InfoField label="City" value={addr.city} />
                <InfoField label="State" value={addr.state} />
                <InfoField label="PIN Code" value={addr.pincode} mono />
                <InfoField label="Country" value={addr.country} />
              </div>
            </div>
          </SectionCard>

          <div className="sd-full" style={{ gridColumn: "1/-1" }}>
            <SectionCard title="Academic Records" icon="📚">
              <div className="sd-academic-grid" style={{ marginBottom: 20 }}>
                <AcademicBadge label="Class 10th" pct={student.tenthPercentage} board={student.tenthBoard} year={student.tenthYear} />
                <AcademicBadge label="Class 12th" pct={student.twelfthPercentage} board={student.twelfthBoard} year={student.twelfthYear} />
              </div>

              <div className="sd-info-grid">
                <InfoField label="10th School" value={student.tenthSchool} />
                <InfoField label="10th Marks" value={student.tenthMarks} />
                <InfoField label="12th School" value={student.twelfthSchool} />
                <InfoField label="12th Marks" value={student.twelfthMarks} />
              </div>

              {student.entranceExamName && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.slateXl, letterSpacing: "0.7px", textTransform: "uppercase", marginBottom: 12 }}>🏆 Entrance Exam</div>
                  <div className="sd-info-grid">
                    <InfoField label="Exam Name" value={student.entranceExamName} />
                    <InfoField label="Roll Number" value={student.entranceExamRollNo} mono />
                    <InfoField label="Year" value={student.entranceExamYear} />
                    <InfoField label="Score" value={student.entranceExamScore} />
                    <InfoField label="AIR" value={student.entranceExamRank} />
                    <InfoField label="Other Details" value={student.otherExamDetails} fullWidth />
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="sd-full" style={{ gridColumn: "1/-1" }}>
            <SectionCard title="Documents & Files" icon="📄">
              <div className="sd-doc-grid" style={{ padding: "20px 24px" }}>
                <FileCard label="Passport Photograph" filename={getDocumentRef(docs, "photo")} required fileBaseUrl={FILE_BASE_URL} />
                <FileCard label="Aadhar Card" filename={getDocumentRef(docs, "aadharCard")} required fileBaseUrl={FILE_BASE_URL} />
                <FileCard label="10th Marksheet" filename={getDocumentRef(docs, "tenthMarksheet")} required fileBaseUrl={FILE_BASE_URL} />
                <FileCard label="12th Marksheet" filename={getDocumentRef(docs, "twelfthMarksheet")} required fileBaseUrl={FILE_BASE_URL} />
                <FileCard label="Entrance Exam Certificate" filename={getDocumentRef(docs, "entranceCert")} fileBaseUrl={FILE_BASE_URL} />
                <FileCard label="Caste Certificate" filename={getDocumentRef(docs, "casteCertificate")} fileBaseUrl={FILE_BASE_URL} />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {showEditModal && (
        <StudentRegistrationForm
          student={student}
          studentId={student?._id || null}
          onSaved={async () => { await fetchStudent?.(); setShowEditModal(false); }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteStudentModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          student={student}
          loading={isDeletingStudent}
        />
      )}

      {showReviewModal && (
        <ReviewStudentModal
          student={student}
          onClose={() => setShowReviewModal(false)}
          onApprove={approveStudentAsync}
          onReject={rejectStudentAsync}
          loading={isApprovingStudent || isRejectingStudent}
        />
      )}

      {showActivateModal && (
        <ActivateStudentModal
          student={student}
          onClose={() => setShowActivateModal(false)}
          onActivate={activateStudentAsync}
          onReject={rejectStudentAsync}
          loading={isActivatingStudent || isRejectingStudent}
        />
      )}
    </>
  );
}
