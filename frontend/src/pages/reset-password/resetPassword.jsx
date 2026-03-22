import AuthCard from "../auth/authCard";
import ResetForm from "../../component/forms/reset-password/ResetForm";

// ─── ResetPassword ────────────────────────────────────────────────────────────
// AmniCare: MUI Box + Card + CardContent + Logo + Divider + ResetForm
// EduAdmit: AuthCard wrapper + ResetForm — identical layout, zero MUI
// ─────────────────────────────────────────────────────────────────────────────

const ResetPassword = () => {
  return (
    <AuthCard>
      <ResetForm />
    </AuthCard>
  );
};

export default ResetPassword;