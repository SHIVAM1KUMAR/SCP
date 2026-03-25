import { useRef, useState } from "react";
import BasicModal from "../../modal/basicModal";
import Button from "../../button/Button";
import Loader from "../../loader/Loader";
// import CollegeForm from "../../components/forms/college/CollegeForm"; // wire when ready

// ─── AddEditCollegeModal ──────────────────────────────────────────────────────
// AmniCare: AddEditProviderModal (provider = college in EduAdmit)
// EduAdmit: Same multi-step modal pattern, renamed for college context
//
// Props:
//   open        — boolean
//   onClose     — fn
//   onSubmit    — fn(values)
//   college     — existing college data for edit, null for add
//   isLoading   — boolean
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4; // match your CollegeForm steps

const AddEditCollegeModal = ({
  open,
  onClose,
  onSubmit,
  college    = null,
  isLoading  = false,
}) => {
  const isEdit     = Boolean(college);
  const formRef    = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!formRef.current?.submitForm) return;
    setSubmitting(true);
    try {
      await formRef.current.submitForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BasicModal
      maxWidth="md"
      open={open}
      title={isEdit ? "Edit College" : "Add College"}
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
                disabled={isLoading || submitting}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8 }}
              >
                {(isLoading || submitting) && <Loader size={18} color="inherit" />}
                {(isLoading || submitting) ? "Saving..." : (isEdit ? "Update" : "Save")}
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
        TODO: Replace with your CollegeForm component when ready:
        <CollegeForm
          ref={formRef}
          formId="college-form"
          defaultValues={college ?? {}}
          onSubmit={onSubmit}
        />
      */}
      <div style={{ padding: "8px 0", color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
        CollegeForm step {activeStep + 1} of {TOTAL_STEPS} — wire CollegeForm here
      </div>
    </BasicModal>
  );
};

export default AddEditCollegeModal;
