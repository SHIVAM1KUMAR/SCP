import StudentRegistrationForm from "../../component/forms/student/studentRegistration";

const AddEditStudentModal = ({
  open,
  onClose,
  student = null,
}) => {
  if (!open) return null;

  return (
    <StudentRegistrationForm
      student={student}
      studentId={student?._id || null}
      onClose={onClose}
    />
  );
};

export default AddEditStudentModal;
