import { useRef, useState, useEffect } from "react";
import { useToast } from "../../../../context/ToastContext";
import BasicCard from "../../card/Basic";
import { ProfileDetailRow } from "../../details/profiledetailRow";
import Button from "../../button/Button";
import Loader from "../../loader/Loader";
import TableSkeleton from "../../loader/TableSkeleton";
import ConfirmationModal from "../../modal/confirmationModal";
import BasicTable from "../../table/basicTable";
//import { useUserProfile } from "../../hooks/useUserProfile";
import { formatPhoneNumber } from "../../../../utils/formatPhoneNumber";
import dayjs from "dayjs";
import { useUserProfile } from "../../../../hooks/useUserProfile";
import { StudentModal } from "../../studentmanagement/StudentModal";
// ─── StudentInfo ──────────────────────────────────────────────────────────────
// AmniCare: PersonalInfo (user = student in EduAdmit)
// EduAdmit: MUI Grid/Box/Radio/Divider → Bootstrap row/col/hr
//           Redux → localStorage + useToast
// ─────────────────────────────────────────────────────────────────────────────

// Emergency contacts table columns (static, no state needed)
const emergencyContactColumns = [
  {
    key: "contactName",
    header: "Contact Name",
    minWidth: 140,
    render: (r) => <span style={{ fontWeight: 500 }}>{r.contactName}</span>,
  },
  {
    key: "relationship",
    header: "Relationship",
    minWidth: 120,
    render: (r) => r.relationship || "—",
  },
  {
    key: "email",
    header: "Email",
    minWidth: 200,
    render: (r) => r.email || "—",
  },
  {
    key: "phone",
    header: "Phone",
    minWidth: 130,
    render: (r) => formatPhoneNumber(r.phone) || "—",
  },
  {
    key: "address",
    header: "Address",
    minWidth: 120,
    render: (r) => r.address || "—",
  },
];

const SuperAdmin = ({ userMasterId, email, isSmallScreen }) => {
  const toast = useToast();

  // Read logged-in user from localStorage (replaces Redux state.auth)
  const authUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const {
    userProfile,
    isUserProfileLoading,
    updateProfile,
    isUpdatingProfile,
    setPrimaryAddress,
    isSettingPrimaryAddress,
    uploadProfilePic,
    isUploadingProfilePic,
    userProfileById,
    isUserProfileByIdLoading,
  } = useUserProfile(email, userMasterId);

  const fileInputRef = useRef(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

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

  const handlePrimary = (addressId) => {
    setSelectedAddressId(addressId);
    setOpenConfirmModal(true);
  };
  const handleSetPrimary = async () => {
    if (selectedAddressId && userProfile?.userMasterId) {
      await setPrimaryAddress.mutateAsync({
        addressId: selectedAddressId,
        userMasterId: userProfile?.userMasterId,
      });
      toast("Primary address updated.", "success");
    }
    setSelectedAddressId(null);
    setOpenConfirmModal(false);
  };

  const handleSubmit = async (data) => {
    if (!userProfile?.userMasterId) return;
    const nameParts = String(data?.studentName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const [firstName = "", ...remainingNames] = nameParts;
    const lastName = remainingNames.join(" ");
    const payload = {
      ...userProfile,
      firstName: firstName || userProfile?.firstName,
      lastName: lastName || userProfile?.lastName,
      email: data?.email || userProfile?.email,
      addresses: userProfile?.addresses?.map((a) => ({
        ...a,
        userMasterId: userProfile.userMasterId,
      })),
      emergencyContacts: userProfile?.emergencyContacts?.map((c) => ({
        ...c,
        userMasterId: userProfile.userMasterId,
      })),
    };
    await updateProfile.mutateAsync(payload);
    setOpenEditModal(false);
  };

  // Address table columns
  const addressColumns = [
    {
      key: "addressLine1",
      header: "Address Line 1",
      minWidth: 150,
      defaultSort: "asc",
    },
    {
      key: "addressLine2",
      header: "Address Line 2",
      minWidth: 150,
      render: (r) => r.addressLine2 || "—",
    },
    { key: "city", header: "City", minWidth: 100 },
    {
      key: "state",
      header: "State",
      minWidth: 140,
      render: (r) => r.state || r.stateId || "—",
    },
    { key: "zipCode", header: "ZIP Code", minWidth: 90 },
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
            onChange={() => handlePrimary(row?.addressId)}
            disabled={row?.isPrimary}
            style={{
              cursor: row?.isPrimary ? "not-allowed" : "pointer",
              width: 16,
              height: 16,
            }}
          />
          {isSettingPrimaryAddress && selectedAddressId === row?.addressId && (
            <Loader size={18} />
          )}
        </div>
      ),
    },
  ];

  if (isUserProfileLoading) return <TableSkeleton isHeader={false} />;

  return (
    <div>
      <BasicCard
        title="Student Profile"
        subtitle="Identity and personal details"
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
            {isSmallScreen ? "Edit" : "Edit Student Info"}
          </button>
        }
      >
        <div
          className="student-profile-combined-grid"
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
                background: "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
                border: "1px solid #dbeafe",
              }}
            >
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onClick={handleAvatarClick}
              >
                {userProfile?.imageUrl ? (
                  <img
                    src={userProfile.imageUrl}
                    alt="profile"
                    style={{
                      width: 108,
                      height: 108,
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow: "0 14px 32px rgba(13, 79, 130, 0.22)",
                      border: "4px solid rgba(255,255,255,0.85)",
                    }}
                  />
                ) : (
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
                    {userProfile?.firstName?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}
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
                  {[
                    userProfile?.firstName,
                    userProfile?.middleName,
                    userProfile?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                    authUser.name ||
                    "—"}
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
                      background: "#22c55e",
                    }}
                  />
                  {userProfile?.roleName || authUser.role || "Student"}
                </div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  {userProfile?.email || authUser.email}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
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
                    Role
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}
                  >
                    {userProfile?.roleName || authUser.role || "—"}
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
                    Enrollment
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}
                  >
                    {userProfile?.npiNumber || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <ProfileDetailRow
              label="First Name"
              value={userProfile?.firstName}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Middle Name"
              value={userProfile?.middleName}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Last Name" value={userProfile?.lastName} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Role" value={userProfile?.roleName} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Enrollment No"
              value={userProfile?.npiNumber}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Email" value={userProfile?.email} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Phone"
              value={formatPhoneNumber(userProfile?.phoneNumber) || "—"}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Date of Birth"
              value={
                userProfile?.dob
                  ? dayjs(userProfile.dob).format("MM/DD/YYYY")
                  : "—"
              }
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Gender"
              value={userProfile?.gender || "—"}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Enrollment Type"
              value={userProfile?.employmentType || "—"}
            />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow
              label="Enrollment Date"
              value={
                userProfile?.hireDate
                  ? dayjs(userProfile.hireDate).format("MM/DD/YYYY")
                  : "—"
              }
            />
          </div>
        </div>
      </BasicCard>

      <div className="row" style={{ marginTop: 10 }}>
        {/* ── Address card ── */}
        <div className="col-12" style={{ marginBottom: 10 }}>
          <BasicCard
            title="Address Information"
            subtitle="Physical location details"
          >
            <BasicTable
              columns={addressColumns}
              rows={userProfile?.addresses ?? []}
              emptyText="No address available"
            />
          </BasicCard>
        </div>

        {/* ── Emergency Contact card ── */}
        <div className="col-12">
          <BasicCard
            title="Emergency Contact"
            subtitle="People to contact in case of emergency"
          >
            <BasicTable
              columns={emergencyContactColumns}
              rows={userProfile?.emergencyContacts ?? []}
              emptyText="No emergency contacts available"
            />
          </BasicCard>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .student-profile-combined-grid {
            grid-template-columns: 1fr;
          }
          .student-profile-combined-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid #f0f3f7;
            padding-right: 0 !important;
            padding-bottom: 20px;
          }
        }
      `}</style>

      {/* Modals */}
      {openEditModal && (
        <StudentModal
          editData={{
            _id: userProfile?.userMasterId,
            studentName:
              [userProfile?.firstName, userProfile?.middleName, userProfile?.lastName]
                .filter(Boolean)
                .join(" ") || authUser?.name || "",
            email: userProfile?.email || authUser?.email || "",
            status: "Active",
          }}
          onClose={() => setOpenEditModal(false)}
          onSave={handleSubmit}
          saving={isUpdatingProfile}
        />
      )}

      {openConfirmModal && (
        <ConfirmationModal
          open={openConfirmModal}
          title="Set Primary Address"
          description="Are you sure you want to make this the primary address?"
          onClose={() => setOpenConfirmModal(false)}
          onConfirm={handleSetPrimary}
          confirmText="Confirm"
          confirmColor="success"
        />
      )}
    </div>
  );
};

export default SuperAdmin;
