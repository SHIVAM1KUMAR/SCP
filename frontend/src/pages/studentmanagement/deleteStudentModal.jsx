import { useState } from "react";
import DeleteConfirmationModal from "../../component/ui/modal/deleteConfirmationModal";

const DeleteStudentModal = ({
  show,
  onClose,
  onConfirm,
  student,
  loading: externalLoading = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!show || !student) return null;

  const fullName = `${student?.firstName || ""} ${student?.lastName || ""}`.trim();
  const isLoading = loading || externalLoading;

  const handleDelete = async () => {
    if (!student?._id) {
      setError("Student ID missing");
      return;
    }

    setError("");
    setLoading(true);
    const startedAt = Date.now();

    try {
      await onConfirm?.({ id: student._id });
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 250) await new Promise((resolve) => setTimeout(resolve, 250 - elapsed));
      setLoading(false);
    }
  };

  return (
    <DeleteConfirmationModal
      open={show}
      title="Delete Student"
      description={`Are you sure you want to delete ${fullName || "this student"}? This action cannot be undone.`}
      onClose={onClose}
      onConfirm={handleDelete}
      isLoading={isLoading}
    >
      {error ? (
        <p style={{ color: "#dc2626", margin: "12px 0 0", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
          {error}
        </p>
      ) : null}
    </DeleteConfirmationModal>
  );
};

export default DeleteStudentModal;
