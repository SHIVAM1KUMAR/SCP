/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";
import BasicModal from "../../component/ui/modal/basicModal";
import DeleteActionButton from "../../component/ui/modal/DeleteActionButton";
import { useToast } from "../../context/ToastContext";
import { getAuth } from "../../store/slice/auth.slice";
import { useStudents } from "../../hooks/useStudents";
import { useTests } from "../../hooks/useTests";
import TestModal from "../../component/forms/tests/TestModal";
import { C, font, SectionCard, InfoField, ActionBtn } from "../../component/ui/studentmanagement/StudentDetailParts";
import { TestStatusBadge, displayTestMode } from "../../constant/tests.jsx";

const formatDate = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
};

const formatTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(`1970-01-01T${value}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const getQuestionOptions = (question = {}) =>
  Array.isArray(question.options) ? question.options.filter((option) => String(option || "").trim()) : [];

const getQuestionMarks = (question = {}) => Number(question?.marks || 1) || 1;

export default function TestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const auth = getAuth();
  const {
    tests,
    loadingTests,
    saving,
    fetchTestById,
    fetchTests,
    saveTest,
    deleteTest,
  } = useTests(toast);
  const { students, fetchStudents, isLoadingStudents } = useStudents();

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [test, setTest] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editVersion, setEditVersion] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoadingDetail(true);
      try {
        const record = await fetchTestById(id);
        setTest(record);
      } catch (error) {
        toast(error?.response?.data?.message || error?.message || "Failed to load test", "error");
      } finally {
        setLoadingDetail(false);
      }
    };
    if (id) void load();
  }, [id]);

  useEffect(() => {
    void fetchStudents?.();
  }, []);

  const detail = useMemo(
    () => test || tests.find((item) => String(item._id) === String(id)) || null,
    [test, tests, id],
  );
  const appliedStudents = useMemo(() => {
    const collegeId = auth.collegeId || auth.id || auth.userMasterId || detail?.college?._id || detail?.collegeId?._id || null;
    if (!collegeId) return students || [];
    return (students || []).filter((student) =>
      (student.interestedColleges || []).some(
        (college) => String(college?._id || college) === String(collegeId),
      ),
    );
  }, [auth.collegeId, auth.id, auth.userMasterId, detail, students]);
  const backPath = "/college/tests";
  const totalMarks = useMemo(
    () => Array.isArray(detail?.questions)
      ? detail.questions.reduce((sum, question) => sum + getQuestionMarks(question), 0)
      : 0,
    [detail],
  );
  const canEditTest = String(detail?.status || "").trim() !== "Completed";

  const handleSave = async ({ id: testId, payload }) => {
    const saved = await saveTest({ id: testId, payload });
    if (saved?._id) {
      setTest(saved);
      await fetchTests();
    }
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await deleteTest(id);
    navigate(backPath);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .td-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 760px) { .td-grid { grid-template-columns: 1fr; } }
        .td-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .question-grid { display: grid; gap: 12px; }
        .question-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 560px) { .question-options { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: "#f4f6fb", minHeight: "100vh", padding: "20px 16px 48px", fontFamily: font.body }}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: C.navyLight, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>
                  📝
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 5px", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {detail?.title || "Test Details"}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <TestStatusBadge status={detail?.status || "Scheduled"} />
                    <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                      {formatDate(detail?.scheduledDate || detail?.scheduledAt)}
                    </span>
                    <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.navyLight, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                      {displayTestMode(detail?.mode)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="td-actions">
                <ActionBtn label="Back" variant="default" onClick={() => navigate(backPath)} />
                {canEditTest ? (
                  <ActionBtn label="Edit" variant="primary" icon="✏️" onClick={() => { setEditVersion((v) => v + 1); setShowEditModal(true); }} />
                ) : (
                  <div style={{ fontSize: 13, color: "#64748b", padding: "8px 10px" }}>Completed tests are read-only</div>
                )}
                <ActionBtn label="Delete" variant="danger" icon="🗑" onClick={() => setShowDeleteModal(true)} />
              </div>
            </div>
          </div>
        </div>

        {loadingDetail || loadingTests || isLoadingStudents ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, gap: 14 }}>
            <Loader size={28} />
          </div>
        ) : detail ? (
          <div className="td-grid">
            <SectionCard title="Test Information" icon="🧪">
              <div className="sd-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoField label="Test Title" value={detail.title || "-"} fullWidth />
                <InfoField label="Student" value={`${detail.student?.firstName || ""} ${detail.student?.lastName || ""}`.trim() || "-"} />
                <InfoField label="College" value={detail.college?.collegeName || "-"} />
                <InfoField label="Mode" value={displayTestMode(detail.mode)} />
                <InfoField label="Date" value={formatDate(detail.scheduledDate || detail.scheduledAt)} />
                <InfoField label="Time" value={formatTime(detail.scheduledTime)} />
                <InfoField label="Status" value={detail.status || "-"} />
                <InfoField label="Total Marks" value={totalMarks || detail.questions?.length || 0} />
                <InfoField label="Notes" value={detail.notes || "-"} fullWidth />
                {detail.mode === "link" && (
                  <InfoField label="Test Link" value={detail.testLink || "-"} fullWidth />
                )}
              </div>
            </SectionCard>

            <SectionCard title="Questions / Preview" icon="📚">
              {detail.mode === "platform" ? (
                <div className="question-grid">
                  {(detail.questions || []).length ? (
                    detail.questions.map((question, index) => {
                      const options = getQuestionOptions(question);
                      const correctOption = options[question.correctAnswerIndex] || "-";
                      return (
                        <div
                          key={`${question._id || index}`}
                          style={{
                            border: `1px solid ${C.border}`,
                            borderRadius: 12,
                            background: C.cream,
                            padding: 16,
                            display: "grid",
                            gap: 12,
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.slateXl, textTransform: "uppercase" }}>
                            Question {index + 1}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>
                            {question.questionText || "-"}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>
                            Marks: {getQuestionMarks(question)}
                          </div>
                          <div className="question-options">
                            {options.map((option, optionIndex) => (
                              <div
                                key={`${index}-${optionIndex}`}
                                style={{
                                  border: `1px solid ${optionIndex === question.correctAnswerIndex ? C.gold : C.border}`,
                                  borderRadius: 10,
                                  padding: "10px 12px",
                                  background: optionIndex === question.correctAnswerIndex ? "#fffbeb" : "#fff",
                                  color: C.navy,
                                  fontSize: 13,
                                  fontWeight: optionIndex === question.correctAnswerIndex ? 700 : 500,
                                }}
                              >
                                {option || "-"}
                              </div>
                            ))}
                          </div>
                          <InfoField label="Correct Answer" value={correctOption} fullWidth />
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: C.slateXl, fontSize: 14 }}>No questions added</div>
                  )}
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <InfoField label="External Link" value={detail.testLink || "-"} fullWidth />
                  <div style={{ color: C.slate, fontSize: 14 }}>
                    Open the provided link when it is time to take the test.
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        ) : (
          <div style={{ color: "#64748b", fontSize: 14 }}>Test not found.</div>
        )}
      </div>

      <TestModal
        key={`${detail?._id || "new"}-${editVersion}`}
        open={showEditModal}
        test={detail}
        students={appliedStudents}
        loading={saving}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSave}
      />

      <BasicModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Test"
        maxWidth="sm"
        actions={(
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="outlined" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <DeleteActionButton onClick={handleDelete} />
          </div>
        )}
      >
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
          <p style={{ margin: 0, fontSize: 15, color: "#334155" }}>Are you sure you want to delete</p>
          <p style={{ margin: "6px 0", fontWeight: 700, fontSize: 16, color: "#111827" }}>{detail?.title}</p>
          <p style={{ fontSize: 13, color: "#64748b" }}>This action cannot be undone.</p>
        </div>
      </BasicModal>
    </>
  );
}
