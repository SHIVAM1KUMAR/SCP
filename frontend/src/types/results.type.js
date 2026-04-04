export const buildResultInitialForm = (result = null) => ({
  resultStatus: result?.resultStatus || "Pending",
  scholarshipAmount:
    result?.scholarshipAmount !== undefined && result?.scholarshipAmount !== null
      ? String(result.scholarshipAmount)
      : "",
  scholarshipType: result?.scholarshipType || "",
  resultNote: result?.resultNote || "",
});
