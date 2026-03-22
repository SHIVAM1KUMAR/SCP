import { useEffect, useRef, useState } from "react";
import { useToast } from "../../../../context/ToastContext";
import BasicCard from "../../../ui/card/Basic";
import { ProfileDetailRow } from "../../details/profiledetailRow";
import Button from "../../button/Button";
import Loader from "../../loader/Loader";
import TableSkeleton from "../../loader/TableSkeleton";
import ConfirmationModal from "../../modal/confirmationModal";
import BasicTable from "../../table/basicTable";
import AddEditCollegeModal from "./addeditcollegeModal";
//import { useColleges } from "../../hooks/useColleges";       // your hook
//import { useUserProfile } from "../../hooks/useUserProfile"; // your hook
import { formatPhoneNumber } from "../../../../utils/formatPhoneNumber";

// ─── CollegeInfo ──────────────────────────────────────────────────────────────
// AmniCare: ProviderInfo (provider = college in EduAdmit)
// EduAdmit: MUI Grid/Box/Accordion/Chip/Radio → Bootstrap row/col + plain HTML
//           Redux → localStorage + useToast
// ─────────────────────────────────────────────────────────────────────────────

const CollegeInfo = ({
  email,
  collegeId,
  userMasterId,
  role,
  isSmallScreen,
}) => {
  const toast = useToast();

  const {
    college,
    isCollegeLoading,
    updateContactStatus,
    isUpdatingContactStatus,
  } = useColleges(collegeId);          // replaces useProviders

  const {
    uploadProfilePic,
    isUploadingProfilePic,
    userProfileById,
    isUserProfileByIdLoading,
  } = useUserProfile(email, userMasterId);

  const fileInputRef   = useRef(null);
  const [openEditModal,    setOpenEditModal]    = useState(false);
  const [selectedContact,  setSelectedContact]  = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  // Profile picture upload
  const handleAvatarClick  = () => fileInputRef.current?.click();
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await uploadProfilePic.mutateAsync(formData);
      toast("Profile picture updated.", "success");
    } catch {
      toast("Failed to upload picture.", "error");
    }
    e.target.value = "";
  };

  const handlePrimary = (row) => {
    setSelectedContact(row);
    setOpenConfirmModal(true);
  };

  const handleSetPrimary = async () => {
    const { collegeContactPersonId } = selectedContact; // replaces providerContactPersonId
    if (collegeContactPersonId && collegeId) {
      await updateContactStatus.mutateAsync({
        collegeContactId: collegeContactPersonId,
        collegeId:        Number(collegeId),
        isContactPrimary: true,
      });
      toast("Primary contact updated.", "success");
    }
    setSelectedContact(null);
    setOpenConfirmModal(false);
  };

  // Contact persons table columns (replaces contactColumns)
  const contactColumns = [
    { key: "firstName",  header: "First Name",  minWidth: 120, defaultSort: "asc" },
    { key: "middleName", header: "Middle Name", minWidth: 130, render: r => r?.middleName || "—" },
    { key: "lastName",   header: "Last Name",   minWidth: 120 },
    { key: "email",      header: "Email",       minWidth: 280 },
    { key: "phone",      header: "Phone",       minWidth: 140, render: r => formatPhoneNumber(r.phoneNumber) || "—" },
    {
      key: "isPrimary", header: "Primary", minWidth: 120,
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <input
            type="radio"
            className="form-check-input"
            checked={row.isPrimary}
            onChange={() => handlePrimary(row)}
            disabled={row?.isPrimary}
            style={{ cursor: row?.isPrimary ? "not-allowed" : "pointer", width: 16, height: 16 }}
          />
          {isUpdatingContactStatus && selectedContact?.collegeContactPersonId === row?.collegeContactPersonId && (
            <Loader size={18} />
          )}
        </div>
      ),
    },
  ];

  // Services / subscription feature columns
  const serviceColumns = [
    { key: "featureName", header: "Feature Name", minWidth: 300 },
    {
      key: "price", header: "Price", align: "right", minWidth: 120,
      render: r => `$${r.price.toLocaleString("en-US")}`,
    },
  ];

  const collegeTypeIds = college?.collegeTypeIds ?? [];

  if (isCollegeLoading) return <TableSkeleton isHeader={false} />;

  return (
    <div>
      <div className="row g-3">

        {/* ── College Identity card ── */}
        <div className="col-12 col-md-4">
          <BasicCard title="College Identity" subtitle="Visual representation">
            <div className="d-flex flex-column align-items-center py-3 gap-3">
              {/* Avatar */}
              <div style={{ position: "relative", cursor: "pointer" }} onClick={handleAvatarClick}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg, #1a6fa8, #0d4f82)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32, fontWeight: 700 }}>
                  {college?.collegeName?.charAt(0)?.toUpperCase() || "C"}
                </div>
                {(isUploadingProfilePic || isUserProfileByIdLoading) && (
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Loader size={24} />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              <div className="text-center">
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{college?.collegeName || "—"}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{role}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{college?.email}</div>
              </div>
            </div>
          </BasicCard>
        </div>

        {/* ── College Information card ── */}
        <div className="col-12 col-md-8">
          <BasicCard
            title="College Information"
            subtitle="Basic college details"
            actions={
              <Button onClick={() => setOpenEditModal(true)} disabled={true}>
                {isSmallScreen ? "Edit" : "Edit College Info"}
              </Button>
            }
          >
            <ProfileDetailRow label="College Name"  value={college?.collegeName} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="College Code"  value={college?.collegeCode} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="College Type"
              isElement
              value={collegeTypeIds.map(({ collegeTypeId, typeName }) => (
                <span key={collegeTypeId} className="badge border text-secondary fw-normal me-1" style={{ fontSize: 12, background: "#f8fafc" }}>
                  {typeName}
                </span>
              ))}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Description"   value={college?.description || "—"} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Email"         value={college?.email} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Phone"         value={formatPhoneNumber(college?.phone) || "—"} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Fax"           value={formatPhoneNumber(college?.fax) || "—"} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Status"        value={college?.isActive ? "Active" : "Inactive"} />
          </BasicCard>
        </div>

        {/* ── Address card ── */}
        <div className="col-12 col-xl-6">
          <BasicCard title="Address Information" subtitle="Physical location details">
            <ProfileDetailRow label="Address Line 1" value={college?.address1} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Address Line 2" value={college?.address2} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="City"  value={college?.city} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="State" value={college?.state} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="ZIP"   value={college?.zip} />
          </BasicCard>
        </div>

        {/* ── Contact Persons card ── */}
        <div className="col-12 col-xl-6">
          <BasicCard title="Contact Persons" subtitle="People associated with this college">
            <BasicTable
              columns={contactColumns}
              rows={college?.collegeContactPersonList ?? []}
              emptyText="No contacts available"
            />
          </BasicCard>
        </div>

        {/* ── Subscription & Services card ── */}
        <div className="col-12">
          <BasicCard
            title="Subscription & Services"
            subtitle="Active subscription plans and pricing breakdown per college type"
          >
            {collegeTypeIds.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {collegeTypeIds.map((ct) => {
                  const sub           = ct?.subscription;
                  if (!sub) return null;
                  const activeFeatures = sub.features?.filter(f => f.isActive) ?? [];
                  const totalPrice     = activeFeatures.reduce((s, f) => s + (f.price ?? 0), 0);

                  return (
                    <AccordionCard
                      key={ct.collegeTypeId}
                      title={ct.typeName}
                      badge={`${sub.subscriptionName} Plan`}
                      maxUsers={sub.maxUser}
                      totalPrice={totalPrice}
                    >
                      <BasicTable
                        columns={serviceColumns}
                        rows={activeFeatures}
                        emptyText="No features available"
                      />
                    </AccordionCard>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <span style={{ fontSize: 13, color: "#94a3b8" }}>No subscription plan</span>
              </div>
            )}
          </BasicCard>
        </div>
      </div>

      {/* Modals */}
      {openEditModal && (
        <AddEditCollegeModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          college={college}
          onSubmit={(data) => { console.log("Updating college:", data); setOpenEditModal(false); }}
          isLoading={false}
        />
      )}

      {openConfirmModal && (
        <ConfirmationModal
          open={openConfirmModal}
          title="Set Primary Contact"
          description={
            <>Are you sure you want to make <strong>{[selectedContact?.firstName, selectedContact?.middleName, selectedContact?.lastName].filter(Boolean).join(" ")}</strong> the primary contact?</>
          }
          onClose={() => setOpenConfirmModal(false)}
          onConfirm={handleSetPrimary}
          confirmText="Confirm"
          confirmColor="success"
        />
      )}
    </div>
  );
};

// ── Mini accordion card (replaces MUI Accordion) ─────────────────────────────
function AccordionCard({ title, badge, maxUsers, totalPrice, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #e5e9f0", borderRadius: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{title}</span>
          <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, border: "1px solid #b3d9f2", color: "#1a6fa8", background: "#e8f4fd", fontWeight: 600 }}>{badge}</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span style={{ fontSize: 13, color: "#64748b" }}>Max Users: <strong>{maxUsers}</strong></span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a6fa8" }}>${totalPrice.toLocaleString("en-US")}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5} width={14} height={14} style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid #e5e9f0", padding: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default CollegeInfo;