import { useSearchParams } from "react-router-dom";
import AuthCard from "../auth/authCard";
import ResetForm from "../../component/forms/reset-password/ResetForm";

// ─── ResetPassword ────────────────────────────────────────────────────────────
// AmniCare: MUI Box + Card + CardContent + Logo + Divider + ResetForm
// EduAdmit: AuthCard wrapper + ResetForm — identical layout, zero MUI
// ─────────────────────────────────────────────────────────────────────────────

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <AuthCard>
      <ResetForm token={token} />
    </AuthCard>
  );
};

export default ResetPassword;
