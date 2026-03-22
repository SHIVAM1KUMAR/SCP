import { Navigate } from "react-router-dom";
import AuthLayout    from "../layouts/AuthLayout";
import Login         from "../pages/login/Login";
import ForgotPassword from "../pages/forgetpassword/forgetPassword";
import ResetPassword  from "../pages/reset-password/resetPassword";
import VerifyOtp      from "../pages/verify-otp/verifyOtp";
import { PublicRoute } from "../component/common/public-route/publicRoute";  // ← your actual path

// ─────────────────────────────────────────────────────────────────────────────

export const AuthRoutes = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/auth",
        element: <AuthLayout />,
        children: [
          { index: true,             element: <Navigate to="login" replace /> },
          { path: "login",           element: <Login /> },
          { path: "forgot-password", element: <ForgotPassword /> },
          { path: "reset-password",  element: <ResetPassword /> },
          { path: "verify-otp",      element: <VerifyOtp /> },
        ],
      },
    ],
  },
];