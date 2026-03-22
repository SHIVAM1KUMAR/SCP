import AuthCard from "../auth/authCard";
import ForgotForm from "../../component/forms/forgot-password/ForgotForm";

// ─── ForgotPassword ───────────────────────────────────────────────────────────
// AmniCare: MUI Box + Card + CardContent + Logo + Divider + ForgotForm
// EduAdmit: AuthCard wrapper + ForgotForm — identical layout, zero MUI
// ─────────────────────────────────────────────────────────────────────────────

const ForgotPassword = () => {
  return (
    <AuthCard>
      <ForgotForm />
    </AuthCard>
  );
};

export default ForgotPassword;