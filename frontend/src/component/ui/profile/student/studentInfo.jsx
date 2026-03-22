import { useRef, useState, useEffect } from "react";
import { useToast } from "../../../../context/ToastContext";
import BasicCard from "../../card/Basic";
import { ProfileDetailRow } from "../../../../component/ui/details/profiledetailRow";
import Button from "../../button/Button";
import Loader from "../../loader/Loader";
import TableSkeleton from "../../loader/TableSkeleton";
import ConfirmationModal from "../../modal/confirmationModal";
import BasicTable from "../../table/basicTable";
import AddEditStudentModal from "./addeditstudentModal";
//import { useUserProfile } from "../../hooks/useUserProfile";
import { formatPhoneNumber } from "../../../../utils/formatPhoneNumber";
import dayjs from "dayjs";

// ─── StudentInfo ──────────────────────────────────────────────────────────────
// AmniCare: PersonalInfo (user = student in EduAdmit)
// EduAdmit: MUI Grid/Box/Radio/Divider → Bootstrap row/col/hr
//           Redux → localStorage + useToast
// ─────────────────────────────────────────────────────────────────────────────

// Emergency contacts table columns (static, no state needed)
const emergencyContactColumns = [
  { key: "contactName",  header: "Contact Name",  minWidth: 140, render: r => <span style={{ fontWeight: 500 }}>{r.contactName}</span> },
  { key: "relationship", header: "Relationship",  minWidth: 120, render: r => r.relationship || "—" },
  { key: "email",        header: "Email",          minWidth: 200, render: r => r.email || "—" },
  { key: "phone",        header: "Phone",          minWidth: 130, render: r => formatPhoneNumber(r.phone) || "—" },
  { key: "address",      header: "Address",        minWidth: 120, render: r => r.address || "—" },
];

const StudentInfo = ({ userMasterId, email, isSmallScreen }) => {
  const toast = useToast();

  // Read logged-in user from localStorage (replaces Redux state.auth)
  const authUser = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

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

  const fileInputRef            = useRef(null);
  const [selectedAddressId,  setSelectedAddressId]  = useState(null);
  const [openConfirmModal,   setOpenConfirmModal]   = useState(false);
  const [openEditModal,      setOpenEditModal]      = useState(false);

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

  const handlePrimary    = (addressId) => { setSelectedAddressId(addressId); setOpenConfirmModal(true); };
  const handleSetPrimary = async () => {
    if (selectedAddressId && userProfile?.userMasterId) {
      await setPrimaryAddress.mutateAsync({ addressId: selectedAddressId, userMasterId: userProfile?.userMasterId });
      toast("Primary address updated.", "success");
    }
    setSelectedAddressId(null);
    setOpenConfirmModal(false);
  };

  const handleSubmit = async (data) => {
    if (!userProfile?.userMasterId) return;
    const payload = {
      ...data,
      addresses:         data.addresses?.map(a => ({ ...a, userMasterId: userProfile.userMasterId })),
      emergencyContacts: data.emergencyContacts?.map(c => ({ ...c, userMasterId: userProfile.userMasterId })),
    };
    await updateProfile.mutateAsync(payload);
    setOpenEditModal(false);
  };

  // Address table columns
  const addressColumns = [
    { key: "addressLine1", header: "Address Line 1", minWidth: 150, defaultSort: "asc" },
    { key: "addressLine2", header: "Address Line 2", minWidth: 150, render: r => r.addressLine2 || "—" },
    { key: "city",         header: "City",            minWidth: 100 },
    { key: "state",        header: "State",           minWidth: 140, render: r => r.state || r.stateId || "—" },
    { key: "zipCode",      header: "ZIP Code",        minWidth: 90  },
    {
      key: "isPrimary", header: "Primary", minWidth: 120,
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <input
            type="radio"
            className="form-check-input"
            checked={row.isPrimary}
            onChange={() => handlePrimary(row?.addressId)}
            disabled={row?.isPrimary}
            style={{ cursor: row?.isPrimary ? "not-allowed" : "pointer", width: 16, height: 16 }}
          />
          {isSettingPrimaryAddress && selectedAddressId === row?.addressId && <Loader size={18} />}
        </div>
      ),
    },
  ];

  if (isUserProfileLoading) return <TableSkeleton isHeader={false} />;

  return (
    <div>
      <div className="row g-3">

        {/* ── Profile Picture card ── */}
        <div className="col-12 col-md-4">
          <BasicCard title="Profile Picture" subtitle="Your photo">
            <div className="d-flex flex-column align-items-center py-3 gap-3">
              <div style={{ position: "relative", cursor: "pointer" }} onClick={handleAvatarClick}>
                {userProfile?.imageUrl ? (
                  <img src={userProfile.imageUrl} alt="profile" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg, #1a6fa8, #0d4f82)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32, fontWeight: 700 }}>
                    {userProfile?.firstName?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}
                {(isUploadingProfilePic || isUserProfileByIdLoading) && (
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Loader size={24} />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              <div className="text-center">
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{authUser.name || "—"}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{authUser.role}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{authUser.email}</div>
              </div>
            </div>
          </BasicCard>
        </div>

        {/* ── Personal Information card ── */}
        <div className="col-12 col-md-8">
          <BasicCard
            title="Personal Information"
            subtitle="Basic student details"
            actions={
              <Button onClick={() => setOpenEditModal(true)}>
                {isSmallScreen ? "Edit" : "Edit Student Info"}
              </Button>
            }
          >
            <ProfileDetailRow label="First Name"       value={userProfile?.firstName} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Middle Name"      value={userProfile?.middleName} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Last Name"        value={userProfile?.lastName} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Role"             value={userProfile?.roleName} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Enrollment No"    value={userProfile?.npiNumber} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Email"            value={userProfile?.email} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Phone"            value={formatPhoneNumber(userProfile?.phoneNumber) || "—"} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Date of Birth"    value={userProfile?.dob ? dayjs(userProfile.dob).format("MM/DD/YYYY") : "—"} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Gender"           value={userProfile?.gender || "—"} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Enrollment Type"  value={userProfile?.employmentType || "—"} />
            <hr className="my-0" style={{ borderColor: "#f0f3f7" }} />
            <ProfileDetailRow label="Enrollment Date"  value={userProfile?.hireDate ? dayjs(userProfile.hireDate).format("MM/DD/YYYY") : "—"} />
          </BasicCard>
        </div>

        {/* ── Address card ── */}
        <div className="col-12">
          <BasicCard title="Address Information" subtitle="Physical location details">
            <BasicTable
              columns={addressColumns}
              rows={userProfile?.addresses ?? []}
              emptyText="No address available"
            />
          </BasicCard>
        </div>

        {/* ── Emergency Contact card ── */}
        <div className="col-12">
          <BasicCard title="Emergency Contact" subtitle="People to contact in case of emergency">
            <BasicTable
              columns={emergencyContactColumns}
              rows={userProfile?.emergencyContacts ?? []}
              emptyText="No emergency contacts available"
            />
          </BasicCard>
        </div>
      </div>

      {/* Modals */}
      {openEditModal && (
        <AddEditStudentModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSubmit={handleSubmit}
          isLoading={isUpdatingProfile}
          studentDetail={userProfile}
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

export default StudentInfo;