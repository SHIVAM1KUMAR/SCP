import { useRef, useState } from "react";
import BasicModal from "../../modal/basicModal";
import Button from "../../button/Button";
import Loader from "../../loader/Loader";
// import StudentForm from "../../components/forms/student/StudentForm"; // wire when ready

// ─── AddEditStudentModal ──────────────────────────────────────────────────────
// AmniCare: AddEditPersonalInfoModal (user = student in EduAdmit)
// EduAdmit: Same 3-step modal pattern, renamed for student context
//
// Props:
//   open          — boolean
//   onClose       — fn
//   onSubmit      — fn(values)
//   studentDetail — existing student data for edit, null for add
//   isLoading     — boolean
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 3; // matches AmniCare's PersonalForm totalSteps = 3

const AddEditStudentModal = ({
  open,
  onClose,
  onSubmit,
  studentDetail = null,
  isLoading,
}) => {
  const isEdit     = Boolean(studentDetail);
  const formRef    = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const isLastStep = activeStep === TOTAL_STEPS - 1;

  const handleNext = async () => {
    if (!formRef.current) return;
    const success = await formRef.current.handleNext();
    if (success) setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (!formRef.current) return;
    formRef.current.handleBack();
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    formRef.current?.submitForm();
  };

  return (
    <BasicModal
      maxWidth="md"
      open={open}
      title={isEdit ? "Edit Student Details" : "Add Student Details"}
      onClose={onClose}
      actions={
        <div className="d-flex justify-content-between w-100">
          {/* Left — Cancel */}
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          {/* Right — Back / Next / Save */}
          <div className="d-flex gap-2">
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>

            {isLastStep ? (
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8 }}
              >
                {isLoading && <Loader size={18} color="inherit" />}
                {isEdit ? "Update" : "Save"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleNext}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8 }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* 
        TODO: Replace with StudentForm when ready:
        <StudentForm
          userId={studentDetail?.userMasterId}
          ref={formRef}
          formId="student-form"
          defaultValues={studentDetail ?? {}}
          onSubmit={onSubmit}
        />
      */}
      <div style={{ padding: "8px 0", color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
        StudentForm step {activeStep + 1} of {TOTAL_STEPS} — wire StudentForm here
      </div>
    </BasicModal>
  );
};

export default AddEditStudentModal;