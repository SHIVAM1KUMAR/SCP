import { Navigate, Outlet, useRoutes } from "react-router-dom";
import { ProtectedRoute }    from "../component/common/protected-route/protectedRoute";
import { AuthRoutes }        from "./AuthRoutes";
import { UnAuthorizedRoute } from "./Unauthorized";
import { NotFoundRoute }     from "./NotFoundRoute";
import { getAuth }           from "../store/slice/auth.slice";
import MainLayout            from "../layouts/MainLayout";
import AccountSettings       from "../pages/accountsetting/accountSetting";
import CollegeManagement     from "../pages/collegemanagement/CollegeManagement";
import StudentDashboard      from "../pages/students/StudentDashboard";
import StudentManagement     from "../pages/students/StudentManagement";

// Uncomment as you build each page:
// import IntakeManagement    from "../pages/intake/IntakeManagement";
// import Admissions          from "../pages/admissions/Admissions";

// ─── Shared "Coming Soon" ───────────────────────────────────────────────────
const ComingSoon = () => (
  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
    This page is coming soon.
  </div>
);

// ─── Role-Based Route Definitions ───────────────────────────────────────────
// Define routes based on access to isolate logic centrally instead of repeating.
const ROLE_ROUTES = {
  SuperAdmin: [
    { index: true, element: <Navigate to="college" replace /> },
    { path: "college",    element: <CollegeManagement /> },
    { path: "intake",     element: <ComingSoon /> },
    { path: "students",   element: <StudentManagement /> },
    { path: "admissions", element: <ComingSoon /> },
    { path: "users",      element: <ComingSoon /> },
    { path: "roles",      element: <ComingSoon /> },
    { path: "reports",    element: <ComingSoon /> },
    { path: "settings",   element: <ComingSoon /> },
  ],
  Admin: [
    { index: true, element: <Navigate to="college" replace /> },
    { path: "college",    element: <CollegeManagement /> },
    { path: "intake",     element: <ComingSoon /> },
    { path: "students",   element: <StudentManagement /> },
    { path: "admissions", element: <ComingSoon /> },
  ],
  College: [
    { index: true, element: <Navigate to="counselor" replace /> },
    { path: "counselor",  element: <ComingSoon /> },
  ],
  Student: [
    { index: true, element: <Navigate to="colleges" replace /> },
    { path: "colleges",   element: <StudentDashboard /> },
    { path: "admissions", element: <ComingSoon /> },
  ],
};

const AppRouter = () => {
  const { role } = getAuth();
  
  const currentRoleRoutes = ROLE_ROUTES[role] || ROLE_ROUTES.Student;

  const firstRoute =
    role === "SuperAdmin" ? "/superadmin/college" :
    role === "Admin"      ? "/admin/college" :
    role === "College"    ? "/college/counselor" :
                            "/student/colleges";

  const routes = useRoutes([
    // ── Auth (public) routes ──────────────────────────────────────────────
    ...AuthRoutes,

    // ── Protected routes ──────────────────────────────────────────────────
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [
            // Root redirect → first allowed page
            { index: true, element: <Navigate to={firstRoute} replace /> },

            // Dynamically load the correct route tree based on the user's role
            {
              path: (role || "user").toLowerCase(),
              element: <Outlet />,
              children: currentRoleRoutes,
            },

            // ── Shared routes ──────────────────────────────────────────
            { path: "account-settings", element: <AccountSettings /> },
          ],
        },
      ],
    },

    // ── Error routes ──────────────────────────────────────────────────────
    UnAuthorizedRoute,
    NotFoundRoute,   // catch-all — must be last
  ]);

  return routes;
};

export default AppRouter;