import { Children } from "react";

// ─── StepperContainer ─────────────────────────────────────────────────────────
// Shows only the child at `activeStep` index, hides others.
// AmniCare used MUI Box with sx={{ display }} — replaced with plain div.
// ─────────────────────────────────────────────────────────────────────────────
export default function StepperContainer({ activeStep, children }) {
  return (
    <>
      {Children.map(children, (child, index) => (
        <div
          key={index}
          style={{ display: activeStep === index ? "block" : "none" }}
        >
          {child}
        </div>
      ))}
    </>
  );
}