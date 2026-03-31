export const buildSuperAdminPayload = (form, userProfile = {}) => {
  const hasAddressData = [
    form?.addressLine1,
    form?.addressLine2,
    form?.city,
    form?.state,
    form?.zipCode,
  ].some((value) => String(value || "").trim() !== "");

  const hasEmergencyContactData = [
    form?.contactName,
    form?.relationship,
    form?.contactEmail,
    form?.contactPhone,
    form?.contactAddress,
  ].some((value) => String(value || "").trim() !== "");

  const nextAddress = {
    addressLine1: form?.addressLine1 || userProfile?.addresses?.[0]?.addressLine1 || "",
    addressLine2: form?.addressLine2 || userProfile?.addresses?.[0]?.addressLine2 || "",
    city: form?.city || userProfile?.addresses?.[0]?.city || "",
    state: form?.state || userProfile?.addresses?.[0]?.state || "",
    zipCode: form?.zipCode || userProfile?.addresses?.[0]?.zipCode || "",
    isPrimary: true,
  };

  const nextEmergencyContact = {
    contactName: form?.contactName || userProfile?.emergencyContacts?.[0]?.contactName || "",
    relationship: form?.relationship || userProfile?.emergencyContacts?.[0]?.relationship || "",
    email: form?.contactEmail || userProfile?.emergencyContacts?.[0]?.email || "",
    phone: form?.contactPhone || userProfile?.emergencyContacts?.[0]?.phone || "",
    address: form?.contactAddress || userProfile?.emergencyContacts?.[0]?.address || "",
  };

  return {
    firstName: form?.firstName || userProfile?.firstName || "",
    middleName: form?.middleName || userProfile?.middleName || "",
    lastName: form?.lastName || userProfile?.lastName || "",
    email: form?.email || userProfile?.email || "",
    phoneNumber: form?.phoneNumber || userProfile?.phoneNumber || "",
    roleName: form?.roleName || userProfile?.roleName || "",
    npiNumber: form?.npiNumber || userProfile?.npiNumber || "",
    employmentType: form?.employmentType || userProfile?.employmentType || "",
    gender: form?.gender || userProfile?.gender || "",
    dob: form?.dob || userProfile?.dob || "",
    hireDate: form?.hireDate || userProfile?.hireDate || "",
    addresses: hasAddressData ? [nextAddress] : (userProfile?.addresses || []),
    emergencyContacts: hasEmergencyContactData
      ? [nextEmergencyContact]
      : (userProfile?.emergencyContacts || []),
  };
};
