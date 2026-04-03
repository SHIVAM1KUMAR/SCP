/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";
import BasicModal from "../../component/ui/modal/basicModal";
import DeleteActionButton from "../../component/ui/modal/DeleteActionButton";
import { useToast } from "../../context/ToastContext";
import { useStudents } from "../../hooks/useStudents";
import { useCounselling } from "../../hooks/useCounselling";
import SessionModal from "../../component/forms/counselling/SessionModal";
import { C, font, SectionCard, InfoField, ActionBtn } from "../../component/ui/studentmanagement/StudentDetailParts";
import { FollowUpStatusBadge, getFollowUpStatusForCollege } from "../../component/ui/studentmanagement/FollowUpStatus";

const displayStatus = (status = "") => (status === "Completed" ? "Counseled" : status || "-");

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

export default function CounsellingSessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    counsellors,
    sessions,
    loadingSessions,
    fetchSessionById,
    fetchSessions,
    saveSession,
    deleteSession,
  } = useCounselling({ enableRealtime: false, toast });
  const { students, isLoadingStudents, fetchStudents } = useStudents();

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [session, setSession] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editVersion, setEditVersion] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoadingDetail(true);
      try {
        const record = await fetchSessionById(id);
        setSession(record);
      } catch (error) {
        toast(error?.response?.data?.message || error?.message || "Failed to load session", "error");
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
    () => session || sessions.find((item) => String(item._id) === String(id)) || null,
    [session, sessions, id],
  );
  const studentRecord = useMemo(
    () => students.find((item) => String(item._id) === String(detail?.student?._id || detail?.studentId?._id || detail?.studentId)) || detail?.student || null,
    [students, detail],
  );
  const backPath = "/college/counselling/schedule";

  const handleSave = async ({ id: sessionId, payload }) => {
    const saved = await saveSession({ id: sessionId, payload });
    if (saved?._id) {
      setSession(saved);
      await fetchSessions();
    }
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await deleteSession(id);
    navigate(backPath);
  };

  const studentName = `${detail?.student?.firstName || ""} ${detail?.student?.lastName || ""}`.trim() || "-";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .cs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 760px) { .cs-grid { grid-template-columns: 1fr; } }
        .cs-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      `}</style>

      <div style={{ background: "#f4f6fb", minHeight: "100vh", padding: "20px 16px 48px", fontFamily: font.body }}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: C.navyLight, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>
                  📅
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 5px", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Counselling Session Details
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.slate, fontFamily: font.body, letterSpacing: "0.8px", background: C.navyLight, padding: "3px 10px", borderRadius: 6 }}>
                      {displayStatus(detail?.status)}
                    </span>
                    <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                      {formatDate(detail?.scheduledDate || detail?.scheduledAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="cs-actions">
                <ActionBtn label="Back" variant="default" onClick={() => navigate(backPath)} />
                <ActionBtn label="Edit" variant="primary" icon="✏️" onClick={() => { setEditVersion((v) => v + 1); setShowEditModal(true); }} />
                <ActionBtn label="Delete" variant="danger" icon="🗑" onClick={() => setShowDeleteModal(true)} />
              </div>
            </div>
          </div>
        </div>

        {loadingDetail || loadingSessions || isLoadingStudents ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, gap: 14 }}>
            <Loader size={28} />
          </div>
        ) : detail ? (
          <div className="cs-grid">
            <SectionCard title="Session Information" icon="🧾">
              <div className="sd-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoField label="Student" value={studentName} fullWidth />
                <InfoField label="Counsellor" value={detail.counsellor?.name || "-"} />
                <InfoField label="College" value={detail.college?.collegeName || "-"} />
                <InfoField label="Date" value={formatDate(detail.scheduledDate || detail.scheduledAt)} />
                <InfoField label="Time" value={formatTime(detail.scheduledTime)} />
                <InfoField label="Status" value={displayStatus(detail.status)} />
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.slateXl, letterSpacing: "0.7px", textTransform: "uppercase", fontFamily: font.body, marginBottom: 5 }}>
                    Follow-up Status
                  </div>
                  <div style={{ minHeight: 42, display: "flex", alignItems: "center", padding: "10px 13px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.cream }}>
                    <FollowUpStatusBadge
                      status={getFollowUpStatusForCollege(studentRecord, detail.college?._id || detail.collegeId?._id, "college")}
                      variant="extended"
                    />
                  </div>
                </div>
                <InfoField label="Notes" value={detail.notes || "-"} fullWidth />
              </div>
            </SectionCard>

            <SectionCard title="Student & Counsellor" icon="👥">
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: C.cream }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.slateXl, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                    Student
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    <InfoField label="Name" value={studentName} />
                    <InfoField label="Email" value={detail.student?.email || "-"} />
                    <InfoField label="Phone" value={detail.student?.phone || "-"} />
                  </div>
                </div>

                <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: C.cream }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.slateXl, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                    Counsellor
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    <InfoField label="Name" value={detail.counsellor?.name || "-"} />
                    <InfoField label="Email" value={detail.counsellor?.email || "-"} />
                    <InfoField label="Phone" value={detail.counsellor?.phone || "-"} />
                    <InfoField label="Department" value={detail.counsellor?.department || "-"} />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : (
          <div style={{ color: "#64748b", fontSize: 14 }}>Session not found.</div>
        )}
      </div>

      <SessionModal
        key={`${detail?._id || "new"}-${editVersion}`}
        open={showEditModal}
        session={detail}
        counsellors={counsellors}
        students={students}
        loading={false}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSave}
      />

      <BasicModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Session"
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
          <p style={{ margin: "6px 0", fontWeight: 700, fontSize: 16, color: "#111827" }}>
            {studentName} on {formatDate(detail?.scheduledDate || detail?.scheduledAt)}
          </p>
          <p style={{ fontSize: 13, color: "#64748b" }}>This action cannot be undone.</p>
        </div>
      </BasicModal>
    </>
  );
}
