export const formatPhoneNumber = (phone = "") => {
  const cleaned = phone.replace(/\D/g, "");
  // Add your phone formatting logic here
  // Example: (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    const area = cleaned.slice(0, 3);
    const prefix = cleaned.slice(3, 6);
    const line = cleaned.slice(6);
    return `(${area}) ${prefix}-${line}`;
  }
  return phone;
};

export default formatPhoneNumber;
