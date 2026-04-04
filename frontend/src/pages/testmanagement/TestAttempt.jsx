/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";
import { useToast } from "../../context/ToastContext";
import { useTests } from "../../hooks/useTests";
import { C, font, SectionCard, InfoField, ActionBtn } from "../../component/ui/studentmanagement/StudentDetailParts";
import { displayTestMode, TestStatusBadge } from "../../constant/tests.jsx";

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

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

const submitWithKeepalive = async (id, payload = {}) => {
  await fetch(`${apiBase}/tests/${id}/attempt/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });
};

const getAttemptStartTime = (attempt, detail) => {
  const value = attempt?.startedAt || attempt?.createdAt || detail?.scheduledAt || detail?.scheduledDate;
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const getDurationMinutes = (detail) => Number(detail?.durationMinutes || 30) || 30;

const formatCountdown = (seconds) => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

export default function TestAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    fetchTestById,
    fetchTestAttempt,
    startTestAttempt,
    heartbeatTestAttempt,
    submitTestAttempt,
    loadingAttempt,
  } = useTests(toast);

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const heartbeatRef = useRef(null);
  const submittedRef = useRef(false);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const record = await fetchTestById(id);
        setTest(record);

        const attemptRecord = await fetchTestAttempt(id);
        if (attemptRecord?.attempt) {
          setAttempt(attemptRecord.attempt);
          const nextAnswers = {};
          (attemptRecord.attempt.answers || []).forEach((answer) => {
            nextAnswers[String(answer.questionId || "")] = Number.isInteger(answer.selectedOptionIndex)
              ? answer.selectedOptionIndex
              : "";
          });
          setAnswers(nextAnswers);
          setMarkedForReview({});
          submittedRef.current = ["Submitted", "Expired"].includes(String(attemptRecord.attempt.status || ""));
        } else {
          const started = await startTestAttempt(id);
          setAttempt(started);
        }
      } catch (error) {
        toast(error?.response?.data?.message || error?.message || "Failed to load test attempt", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) void load();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const detail = useMemo(() => test || null, [test]);
  const totalMarks = useMemo(
    () => Array.isArray(detail?.questions)
      ? detail.questions.reduce((sum, question) => sum + getQuestionMarks(question), 0)
      : 0,
    [detail],
  );
  const durationMinutes = useMemo(() => getDurationMinutes(detail), [detail]);
  const startTime = useMemo(() => getAttemptStartTime(attempt, detail), [attempt, detail]);
  const timeLeftSeconds = useMemo(() => {
    const endAt = startTime.getTime() + durationMinutes * 60 * 1000;
    return Math.max(0, Math.floor((endAt - now) / 1000));
  }, [startTime, durationMinutes, now]);
  const isTimeUp = timeLeftSeconds <= 0 && Boolean(detail);
  const questionList = Array.isArray(detail?.questions) ? detail.questions : [];
  const questionStats = useMemo(() => {
    const total = questionList.length;
    const answered = questionList.reduce((count, question, index) => {
      const qid = String(question.id || question._id || index);
      return count + (answers[qid] !== undefined && answers[qid] !== "" ? 1 : 0);
    }, 0);
    const marked = Object.values(markedForReview).filter(Boolean).length;
    return {
      total,
      answered,
      marked,
      left: Math.max(0, total - answered),
    };
  }, [questionList, answers, markedForReview]);

  const syncHeartbeat = async (nextAnswers = answers) => {
    if (!id || submittedRef.current) return;
    try {
      const payload = {
        answers: Object.entries(nextAnswers).map(([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        })),
      };
      const next = await heartbeatTestAttempt(id, payload);
      if (next) setAttempt(next);
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Failed to save progress", "error");
    }
  };

  useEffect(() => {
    if (!detail || submittedRef.current) return undefined;
    heartbeatRef.current = setInterval(() => {
      void syncHeartbeat();
    }, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        void submitWithKeepalive(id, {
          answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
            questionId,
            selectedOptionIndex,
          })),
          autoSubmitted: true,
        });
      }
    };

    const handlePageHide = () => {
      void submitWithKeepalive(id, {
        answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        })),
        autoSubmitted: true,
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    };
  }, [detail, answers]);

  useEffect(() => {
    if (!isTimeUp || submittedRef.current || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    void handleSubmit(true);
  }, [isTimeUp]);

  const handleSubmit = async (autoSubmitted = false) => {
    if (submitting || submittedRef.current) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        })),
        autoSubmitted,
      };
      const saved = await submitTestAttempt(id, payload);
      if (saved) {
        submittedRef.current = true;
        setAttempt(saved);
        toast(autoSubmitted ? "Time is up. Test submitted automatically." : "Test submitted successfully", "success");
        navigate("/student/tests");
      }
    } catch (error) {
      toast(error?.response?.data?.message || error?.message || "Failed to submit test", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingAttempt) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader size={30} />
      </div>
    );
  }

  if (!detail) {
    return <div style={{ padding: 24 }}>Test not found.</div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .qa-shell { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 18px; align-items: start; }
        .qa-sticky { position: sticky; top: 20px; }
        .qa-nav { display: grid; gap: 10px; }
        .qa-nav-btn { width: 100%; text-align: left; border: 1px solid #dbe3ee; background: #fff; border-radius: 14px; padding: 12px 14px; font-family: inherit; cursor: pointer; box-shadow: 0 1px 2px rgba(15, 32, 68, 0.04); }
        .qa-nav-btn.active { border-color: ${C.gold}; background: #fffbeb; }
        .qa-nav-btn.answered { border-color: #86efac; background: #dcfce7; }
        .qa-nav-btn.review { border-color: #c084fc; background: #f3e8ff; }
        .qa-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .qa-legend-item { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid #dbe3ee; background: #fff; color: #334155; }
        .qa-legend-dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
        .qa-legend-dot.answered { background: #22c55e; }
        .qa-legend-dot.unanswered { background: #94a3b8; }
        .qa-legend-dot.review { background: #a855f7; }
        .qa-summary { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .qa-summary-chip { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; border: 1px solid #dbe3ee; background: #fff; color: #334155; }
        .qa-summary-chip strong { font-size: 13px; }
        .qa-main { display: grid; gap: 14px; }
        .qa-options { display: grid; gap: 10px; }
        @media (max-width: 980px) {
          .qa-shell { grid-template-columns: 1fr; }
          .qa-sticky { position: static; }
        }
      `}</style>

      <div style={{ background: "#f4f6fb", minHeight: "100vh", padding: "20px 16px 48px", fontFamily: font.body }}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 5px" }}>
                  {detail.title || "Test Attempt"}
                </h1>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <TestStatusBadge status={attempt?.status || detail.status || "Scheduled"} />
                  <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                    {formatDate(detail.scheduledDate || detail.scheduledAt)}
                  </span>
                  <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.navyLight, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                    {displayTestMode(detail.mode)}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: isTimeUp ? "#b91c1c" : C.slate,
                    fontFamily: font.body,
                    background: isTimeUp ? "#fef2f2" : C.cream,
                    border: `1px solid ${isTimeUp ? "#fecaca" : C.border}`,
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontWeight: 700,
                  }}>
                    Time Left: {formatCountdown(timeLeftSeconds)}
                  </span>
                  <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                    Total Marks: {totalMarks || detail.questions?.length || 0}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <ActionBtn label="Back" variant="default" onClick={() => navigate("/student/tests")} />
                <Button variant="primary" onClick={() => handleSubmit(false)} disabled={submitting || submittedRef.current || isTimeUp}>
                  {submitting || submittedRef.current ? "Submitted" : isTimeUp ? "Time Up" : "Submit Test"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="qa-shell">
          <div className="qa-sticky">
            <SectionCard title="Question Navigator" icon="🧭">
              <div className="qa-summary">
                <span className="qa-summary-chip"><strong>{questionStats.answered}</strong> Answered</span>
                <span className="qa-summary-chip"><strong>{questionStats.marked}</strong> Marked</span>
                <span className="qa-summary-chip"><strong>{questionStats.left}</strong> Left</span>
                <span className="qa-summary-chip"><strong>{questionStats.total}</strong> Total</span>
              </div>
              <div className="qa-legend">
                <span className="qa-legend-item"><span className="qa-legend-dot answered" />Answered</span>
                <span className="qa-legend-item"><span className="qa-legend-dot unanswered" />Unanswered</span>
                <span className="qa-legend-item"><span className="qa-legend-dot review" />Marked for review</span>
              </div>
              <div className="qa-nav">
                {questionList.length ? questionList.map((question, index) => {
                  const qid = String(question.id || question._id || index);
                  const answered = answers[qid] !== undefined && answers[qid] !== "";
                  const review = Boolean(markedForReview[qid]);
                  return (
                    <button
                      key={qid}
                      type="button"
                      className={`qa-nav-btn ${review ? "review" : ""} ${answered ? "answered" : ""}`}
                      onClick={() => {
                        const element = document.getElementById(`question-${qid}`);
                        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Question {index + 1}</div>
                        <span style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: review ? "#a855f7" : answered ? "#22c55e" : "#94a3b8",
                          flexShrink: 0,
                        }} />
                      </div>
                      <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>
                        {review ? "Marked for review" : answered ? "Answered" : "Unanswered"}
                      </div>
                    </button>
                  );
                }) : <div style={{ color: C.slate, fontSize: 14 }}>No questions added</div>}
              </div>
            </SectionCard>
          </div>

          <div className="qa-main">
            <SectionCard title="Test Information" icon="🧪">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoField label="College" value={detail.college?.collegeName || "-"} />
                <InfoField label="Date" value={formatDate(detail.scheduledDate || detail.scheduledAt)} />
                <InfoField label="Time" value={formatTime(detail.scheduledTime)} />
                <InfoField label="Status" value={attempt?.status || detail.status || "-"} />
                <InfoField label="Duration" value={`${durationMinutes} minutes`} />
              </div>
            </SectionCard>

            <SectionCard title="Questions" icon="📝">
              {detail.mode === "platform" ? (
                <div className="qa-options">
                {questionList.length ? questionList.map((question, index) => {
                  const options = getQuestionOptions(question);
                  const qid = String(question.id || question._id || index);
                  const selectedValue = answers[qid];
                  const review = Boolean(markedForReview[qid]);
                  return (
                      <div
                        id={`question-${qid}`}
                        key={qid}
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 12,
                          background: C.cream,
                          padding: 16,
                          display: "grid",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.slateXl, textTransform: "uppercase" }}>
                            Question {index + 1}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>Marks: {getQuestionMarks(question)}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>
                          {question.questionText || "-"}
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                          {options.map((option, optionIndex) => {
                            const selected = Number(selectedValue) === optionIndex;
                            return (
                              <label
                                key={`${qid}-${optionIndex}`}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  border: `1px solid ${selected ? C.gold : C.border}`,
                                  borderRadius: 10,
                                  padding: "10px 12px",
                                  background: selected ? "#fffbeb" : "#fff",
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`question-${qid}`}
                                  checked={selected}
                                  onChange={() => {
                                    const next = { ...answers, [qid]: optionIndex };
                                    setAnswers(next);
                                  }}
                                />
                                <span style={{ color: C.navy, fontSize: 13, fontWeight: selected ? 700 : 500 }}>
                                  {option || "-"}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => setMarkedForReview((prev) => ({ ...prev, [qid]: !prev[qid] }))}
                            style={{
                              border: "1px solid #dbe3ee",
                              background: review ? "#faf5ff" : "#fff",
                              color: review ? "#7c3aed" : "#334155",
                              borderRadius: 10,
                              padding: "8px 12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {review ? "Unmark Review" : "Mark for Review"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAnswers((prev) => {
                                const next = { ...prev };
                                delete next[qid];
                                return next;
                              });
                            }}
                            style={{
                              border: "1px solid #dbe3ee",
                              background: "#fff",
                              color: "#334155",
                              borderRadius: 10,
                              padding: "8px 12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Clear Answer
                          </button>
                        </div>
                        </div>
                      );
                    }) : <div style={{ color: C.slateXl, fontSize: 14 }}>No questions added</div>}
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <InfoField label="External Link" value={detail.testLink || "-"} fullWidth />
                  <div style={{ color: C.slate, fontSize: 14 }}>Open the provided link when it is time to take the test.</div>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
