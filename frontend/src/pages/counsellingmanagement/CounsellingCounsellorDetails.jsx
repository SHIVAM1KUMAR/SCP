/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";
import BasicModal from "../../component/ui/modal/basicModal";
import DeleteActionButton from "../../component/ui/modal/DeleteActionButton";
import { useToast } from "../../context/ToastContext";
import { getAuth } from "../../store/slice/auth.slice";
import { useCounselling } from "../../hooks/useCounselling";
import CounsellorModal from "../../component/forms/counselling/CounsellorModal";
import { C, font, SectionCard, InfoField, ActionBtn } from "../../component/ui/studentmanagement/StudentDetailParts";

const availabilityText = (slots = []) =>
  (slots || [])
    .map((slot) => [slot.day, slot.startTime, slot.endTime].filter(Boolean).join(" - "))
    .filter(Boolean)
    .join(", ") || "-";

export default function CounsellingCounsellorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const auth = getAuth();
  const role = String(auth?.role || "").toLowerCase();
  const isCollege = role === "college";
  const isSuperAdmin = role === "superadmin";

  const {
    counsellors,
    loadingCounsellors,
    fetchCounsellorById,
    fetchCounsellors,
    saveCounsellor,
    deleteCounsellor,
  } = useCounselling({ enableRealtime: false, toast });

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [counsellor, setCounsellor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editVersion, setEditVersion] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoadingDetail(true);
      try {
        const record = await fetchCounsellorById(id);
        setCounsellor(record);
      } catch (error) {
        toast(error?.response?.data?.message || error?.message || "Failed to load counsellor", "error");
      } finally {
        setLoadingDetail(false);
      }
    };
    if (id) void load();
  }, [id]);

  const detail = useMemo(
    () => counsellor || counsellors.find((item) => String(item._id) === String(id)) || null,
    [counsellor, counsellors, id],
  );
  const backPath = isSuperAdmin ? "/superadmin/counselling" : "/college/counselling/add-counsellor";

  const handleSave = async ({ id: counsellorId, payload }) => {
    const saved = await saveCounsellor({ id: counsellorId, payload });
    if (saved?._id) {
      setCounsellor(saved);
      await fetchCounsellors();
    }
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await deleteCounsellor(id);
    navigate(backPath);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .cd-grid { display: grid; grid-template-columns: 1fr 0.9fr; gap: 20px; }
        @media (max-width: 760px) { .cd-grid { grid-template-columns: 1fr; } }
        .cd-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      `}</style>

      <div style={{ background: "#f4f6fb", minHeight: "100vh", padding: "20px 16px 48px", fontFamily: font.body }}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: C.navyLight, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>
                  🗨️
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 5px", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {detail?.name || "Counsellor Details"}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.slate, fontFamily: font.body, letterSpacing: "0.8px", background: C.navyLight, padding: "3px 10px", borderRadius: 6 }}>
                      {detail?.department || "Counselling"}
                    </span>
                    <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                      {detail?.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>

                <div className="cd-actions">
                  <ActionBtn label="Back" variant="default" onClick={() => navigate(backPath)} />
                  {isCollege && (
                    <>
                    <ActionBtn label="Edit" variant="primary" icon="✏️" onClick={() => { setEditVersion((v) => v + 1); setShowEditModal(true); }} />
                    <ActionBtn label="Delete" variant="danger" icon="🗑" onClick={() => setShowDeleteModal(true)} />
                  </>
                  )}
                </div>
            </div>
          </div>
        </div>

        {loadingDetail || loadingCounsellors ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, gap: 14 }}>
            <Loader size={28} />
          </div>
        ) : detail ? (
          <div className="cd-grid">
            <SectionCard title="Basic Information" icon="📋">
              <div className="sd-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoField label="Name" value={detail.name} fullWidth />
                <InfoField label="Email" value={detail.email} />
                <InfoField label="Phone" value={detail.phone} />
                <InfoField label="Department" value={detail.department} />
                <InfoField label="Status" value={detail.status} />
                <InfoField label="College" value={detail.college?.collegeName || detail.collegeId?.collegeName || "-"} fullWidth />
                <InfoField label="Created" value={detail.createdAt ? new Date(detail.createdAt).toLocaleDateString("en-IN") : "-"} />
                <InfoField label="Updated" value={detail.updatedAt ? new Date(detail.updatedAt).toLocaleDateString("en-IN") : "-"} />
              </div>
            </SectionCard>

            <SectionCard title="Availability" icon="🕒">
              <div style={{ display: "grid", gap: 12 }}>
                {(detail.availability || []).length ? (
                  detail.availability.map((slot, index) => (
                    <div
                      key={`${slot.day}-${index}`}
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        background: C.cream,
                        padding: 14,
                        display: "grid",
                        gap: 6,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{slot.day || "-"}</div>
                      <div style={{ fontSize: 13, color: C.slate }}>
                        {slot.startTime || "-"} - {slot.endTime || "-"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: C.slateXl, fontSize: 14 }}>No availability added</div>
                )}
                <div style={{ marginTop: 6 }}>
                  <InfoField label="All Slots" value={availabilityText(detail.availability)} fullWidth />
                </div>
              </div>
            </SectionCard>
          </div>
        ) : (
          <div style={{ color: "#64748b", fontSize: 14 }}>Counsellor not found.</div>
        )}
      </div>

      <CounsellorModal
        key={`${detail?._id || "new"}-${editVersion}`}
        open={showEditModal}
        counsellor={detail}
        loading={false}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSave}
      />

      <BasicModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Counsellor"
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
          <p style={{ margin: "6px 0", fontWeight: 700, fontSize: 16, color: "#111827" }}>{detail?.name}</p>
          <p style={{ fontSize: 13, color: "#64748b" }}>This action cannot be undone.</p>
        </div>
      </BasicModal>
    </>
  );
}
