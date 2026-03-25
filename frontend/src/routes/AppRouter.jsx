import { Navigate, Outlet, useRoutes } from "react-router-dom";
import { ProtectedRoute } from "../component/common/protected-route/protectedRoute";
import { AuthRoutes } from "./AuthRoutes";
import { UnAuthorizedRoute } from "./Unauthorized";
import { NotFoundRoute } from "./NotFoundRoute";
import { getAuth } from "../store/slice/auth.slice";

import MainLayout from "../layouts/MainLayout";
import AccountSettings from "../pages/accountsetting/accountSetting";

import CollegeManagement from "../pages/collegemanagement/CollegeManagement";
import CollegeDetails from "../pages/collegemanagement/collegeDetails";
import CollegeRegistrationForm from "../component/forms/college/CollegeRegistrationForm";

import StudentDashboard from "../pages/studentmanagement/StudentDashboard";
import StudentManagement from "../pages/studentmanagement/StudentManagement";

import Payments from "../pages/payments/Payments";

// ─── Coming Soon ─────────────────────────────
const ComingSoon = () => (
  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
    This page is coming soon.
  </div>
);

// ─── Role Routes ─────────────────────────────
const ROLE_ROUTES = {
  SuperAdmin: [
    { index: true, element: <Navigate to="college" replace /> },

    { path: "college", element: <CollegeManagement /> },
    { path: "college/:id", element: <CollegeDetails /> },

    { path: "students", element: <StudentManagement /> },
    { path: "payments", element: <Payments /> },

    { path: "intake", element: <ComingSoon /> },
    { path: "admissions", element: <ComingSoon /> },
    { path: "users", element: <ComingSoon /> },
    { path: "roles", element: <ComingSoon /> },
    { path: "reports", element: <ComingSoon /> },
    { path: "settings", element: <ComingSoon /> },
  ],

  Admin: [
    { index: true, element: <Navigate to="college" replace /> },

    { path: "college", element: <CollegeManagement /> },
    { path: "college/:id", element: <CollegeDetails /> },

    { path: "students", element: <StudentManagement /> },

    { path: "intake", element: <ComingSoon /> },
    { path: "admissions", element: <ComingSoon /> },
  ],

  Student: [
    { index: true, element: <Navigate to="colleges" replace /> },
    { path: "colleges", element: <StudentDashboard /> },
  ],
};

// ─── Router ─────────────────────────────────
const AppRouter = () => {
  const auth = getAuth();
  const role = auth?.role;

  const routes = useRoutes([
    // ✅ Public Routes (Login, Signup etc.)
    ...AuthRoutes,

    // Optional public page
    {
      path: "/college/register",
      element: <CollegeRegistrationForm />,
    },

    // ✅ Protected Routes
    {
      path: "/",
      element: role ? <ProtectedRoute /> : <Navigate to="/login" replace />,
      children: [
        {
          element: <MainLayout />,
          children: [
            // Default redirect after login
            {
              index: true,
              element: (
                <Navigate
                  to={
                    role === "SuperAdmin"
                      ? "/superadmin/college"
                      : role === "Admin"
                      ? "/admin/college"
                      : "/student/colleges"
                  }
                  replace
                />
              ),
            },

            // Role-based routes
            {
              path: "superadmin",
              element: <Outlet />,
              children: ROLE_ROUTES.SuperAdmin,
            },
            {
              path: "admin",
              element: <Outlet />,
              children: ROLE_ROUTES.Admin,
            },
            {
              path: "student",
              element: <Outlet />,
              children: ROLE_ROUTES.Student,
            },

            // Shared routes
            { path: "account-settings", element: <AccountSettings /> },
          ],
        },
      ],
    },

    // Error routes
    UnAuthorizedRoute,
    NotFoundRoute,
  ]);

  return routes;
};

export default AppRouter;