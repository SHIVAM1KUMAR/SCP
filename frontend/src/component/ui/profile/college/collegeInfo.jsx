import { useRef, useState } from "react";
import { useToast } from "../../../../context/ToastContext";
import BasicCard from "../../../ui/card/Basic";
import { ProfileDetailRow } from "../../details/profiledetailRow";
import Button from "../../button/Button";
import Loader from "../../loader/Loader";
import TableSkeleton from "../../loader/TableSkeleton";
import ConfirmationModal from "../../modal/confirmationModal";
import BasicTable from "../../table/basicTable";
import CollegeRegistrationForm from "../../../forms/college/CollegeRegistrationForm";
import { formatPhoneNumber } from "../../../../utils/formatPhoneNumber";
import { useColleges } from "../../../../hooks/useCollege";
import { useUserProfile } from "../../../../hooks/useUserProfile";

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
  } = useColleges(collegeId);

  const address = college?.address || {};
  const collegeTypes =
    college?.collegeTypeIds?.length > 0
      ? college.collegeTypeIds.map(({ collegeTypeId, typeName }) => ({
          key: collegeTypeId || typeName,
          label: typeName,
        }))
      : college?.collegeType
        ? [{ key: college.collegeType, label: college.collegeType }]
        : [];
  const establishedYear = college?.established || college?.establishedYear;
  const statusValue =
    college?.status || (college?.isActive ? "Active" : "Inactive");
  const fullAddress = [
    address?.street,
    address?.city,
    address?.state,
    address?.pincode,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const { uploadProfilePic, isUploadingProfilePic, isUserProfileByIdLoading } =
    useUserProfile(email, userMasterId);

  const fileInputRef = useRef(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const handleAvatarClick = () => fileInputRef.current?.click();
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
    const { collegeContactPersonId } = selectedContact;
    if (collegeContactPersonId && collegeId) {
      await updateContactStatus.mutateAsync({
        collegeContactId: collegeContactPersonId,
        collegeId: Number(collegeId),
        isContactPrimary: true,
      });
      toast("Primary contact updated.", "success");
    }
    setSelectedContact(null);
    setOpenConfirmModal(false);
  };

  const contactColumns = [
    {
      key: "firstName",
      header: "First Name",
      minWidth: 120,
      defaultSort: "asc",
    },
    {
      key: "middleName",
      header: "Middle Name",
      minWidth: 130,
      render: (r) => r?.middleName || "—",
    },
    { key: "lastName", header: "Last Name", minWidth: 120 },
    { key: "email", header: "Email", minWidth: 280 },
    {
      key: "phone",
      header: "Phone",
      minWidth: 140,
      render: (r) => formatPhoneNumber(r.phoneNumber) || "—",
    },
    {
      key: "isPrimary",
      header: "Primary",
      minWidth: 120,
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <input
            type="radio"
            className="form-check-input"
            checked={row.isPrimary}
            onChange={() => handlePrimary(row)}
            disabled={row?.isPrimary}
            style={{
              cursor: row?.isPrimary ? "not-allowed" : "pointer",
              width: 16,
              height: 16,
            }}
          />
          {isUpdatingContactStatus &&
            selectedContact?.collegeContactPersonId ===
              row?.collegeContactPersonId && <Loader size={18} />}
        </div>
      ),
    },
  ];

  const serviceColumns = [
    { key: "featureName", header: "Feature Name", minWidth: 300 },
    {
      key: "price",
      header: "Price",
      align: "right",
      minWidth: 120,
      render: (r) => `$${r.price.toLocaleString("en-US")}`,
    },
  ];

  const collegeTypeIds = college?.collegeTypeIds ?? [];

  if (isCollegeLoading) return <TableSkeleton isHeader={false} />;

  return (
    <div>
      <BasicCard
        title="College Profile"
        subtitle="Identity and basic college details"
        actions={
          <button
            style={{
              height: 36,
              padding: "0 16px",
              background: "#1a6fa8",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => setOpenEditModal(true)}
          >
            {isSmallScreen ? "Edit" : "Edit College Info"}
          </button>
        }
      >
        <div
          className="college-profile-combined-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 1fr) minmax(420px, 2fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              borderRight: "1px solid #f0f3f7",
              paddingRight: 24,
            }}
          >
            <div
              className="d-flex flex-column align-items-center py-3 gap-3"
              style={{
                padding: 20,
                borderRadius: 18,
                background:
                  "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
                border: "1px solid #dbeafe",
              }}
            >
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onClick={handleAvatarClick}
              >
                <div
                  style={{
                    width: 108,
                    height: 108,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1a6fa8, #0d4f82)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 38,
                    fontWeight: 700,
                    boxShadow: "0 14px 32px rgba(13, 79, 130, 0.22)",
                    border: "4px solid rgba(255,255,255,0.85)",
                  }}
                >
                  {college?.collegeName?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 2,
                    bottom: 2,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "1px solid #dbeafe",
                    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1a6fa8",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  ✎
                </div>
                {(isUploadingProfilePic || isUserProfileByIdLoading) && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Loader size={24} />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <div className="text-center">
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#1e293b",
                    marginBottom: 4,
                  }}
                >
                  {college?.collegeName || "—"}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "#ffffff",
                    border: "1px solid #dbeafe",
                    fontSize: 12,
                    color: "#1a6fa8",
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        statusValue === "Active" ? "#22c55e" : "#f59e0b",
                    }}
                  />
                  {role}
                </div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  {college?.email}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    marginTop: 8,
                  }}
                >
                  Click the avatar to upload a profile image
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 6,
                }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: 4,
                    }}
                  >
                    Status
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                    {statusValue}
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: 4,
                    }}
                  >
                    Code
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                    {college?.collegeCode || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <ProfileDetailRow
              label="College Name"
              value={college?.collegeName}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="College Code"
              value={college?.collegeCode}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="College Type"
              isElement
              value={collegeTypes.map(({ key, label }) => (
                <span
                  key={key}
                  className="badge border text-secondary fw-normal me-1"
                  style={{ fontSize: 12, background: "#f8fafc" }}
                >
                  {label}
                </span>
              ))}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Established" value={establishedYear} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Affiliation"
              value={college?.affiliation}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Description"
              value={college?.description || "—"}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Email" value={college?.email} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Phone"
              value={formatPhoneNumber(college?.phone) || "—"}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Website" value={college?.website} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Status" value={statusValue} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Payment Status"
              value={college?.paymentStatus}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Location"
              value={college?.location || fullAddress}
            />
          </div>
        </div>
      </BasicCard>

      <div className="row">
        {/* ── Address ── */}
        <div className="col-12 col-xl-6" style={{ marginTop: 10 }}>
          <BasicCard
            title="Address Information"
            subtitle="Physical location details"
          >
            <ProfileDetailRow label="Street / Area" value={address?.street} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="City" value={address?.city} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="State" value={address?.state} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="PIN Code" value={address?.pincode} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Country" value={address?.country} />
          </BasicCard>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .college-profile-combined-grid {
            grid-template-columns: 1fr;
          }
          .college-profile-combined-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid #f0f3f7;
            padding-right: 0 !important;
            padding-bottom: 20px;
          }
        }
      `}</style>

      {/* ── Edit Modal — same CollegeRegistrationForm used in CollegeManagement ── */}
      {openEditModal && (
        <CollegeRegistrationForm
          college={college}
          collegeId={collegeId}
          onSaved={() => setOpenEditModal(false)}
          onClose={() => setOpenEditModal(false)}
        />
      )}

      {/* ── Confirm Primary Contact ── */}
      {openConfirmModal && (
        <ConfirmationModal
          open={openConfirmModal}
          title="Set Primary Contact"
          description={
            <>
              Are you sure you want to make{" "}
              <strong>
                {[
                  selectedContact?.firstName,
                  selectedContact?.middleName,
                  selectedContact?.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </strong>{" "}
              the primary contact?
            </>
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

// ── AccordionCard ─────────────────────────────────────────────────────────────
function AccordionCard({ title, badge, maxUsers, totalPrice, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #e5e9f0", borderRadius: 8 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
            {title}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 10px",
              borderRadius: 20,
              border: "1px solid #b3d9f2",
              color: "#1a6fa8",
              background: "#e8f4fd",
              fontWeight: 600,
            }}
          >
            {badge}
          </span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Max Users: <strong>{maxUsers}</strong>
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a6fa8" }}>
            ${totalPrice.toLocaleString("en-US")}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2.5}
            width={14}
            height={14}
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          >
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
