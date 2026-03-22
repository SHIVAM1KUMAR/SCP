import AuthCard from "../auth/authCard";
import VerifyOtpForm from "../../component/forms/verify-otp/VerifyOtpForm";

// ─── VerifyOtp ────────────────────────────────────────────────────────────────
// AmniCare: MUI Box + Card + CardContent + Logo + Divider + VerifyOtpForm
// EduAdmit: AuthCard wrapper + VerifyOtpForm — identical layout, zero MUI
// ─────────────────────────────────────────────────────────────────────────────

const VerifyOtp = () => {
  return (
    <AuthCard>
      <VerifyOtpForm />
    </AuthCard>
  );
};

export default VerifyOtp;