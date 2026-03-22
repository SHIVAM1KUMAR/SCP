import { Navigate, Outlet, useRoutes } from "react-router-dom";
import { ProtectedRoute }    from "../component/common/protected-route/protectedRoute";
import { AuthRoutes }        from "./AuthRoutes";
import { UnAuthorizedRoute } from "./Unauthorized";
import { NotFoundRoute }     from "./NotFoundRoute";
import { getAuth }           from "../store/slice/auth.slice";
import MainLayout            from "../layouts/MainLayout";
import AccountSettings       from "../pages/accountsetting/accountSetting";
import CollegeManagement     from "../pages/collegemanagement/CollegeManagement";

// Uncomment as you build each page:
// import IntakeManagement    from "../pages/intake/IntakeManagement";
// import StudentRegistration from "../pages/students/StudentRegistration";
// import Admissions          from "../pages/admissions/Admissions";

// ─── AppRouter ────────────────────────────────────────────────────────────────
// Uses EXPLICIT absolute paths matching exactly what Login.jsx navigates to:
//   SuperAdmin → /superadmin/college
//   Admin      → /admin/college
//   User       → /user/college
// ─────────────────────────────────────────────────────────────────────────────

const ComingSoon = () => (
  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
    This page is coming soon.
  </div>
);

const AppRouter = () => {
  const { role } = getAuth();

  // First route per role — for root redirect
  const firstRoute =
    role === "SuperAdmin" ? "/superadmin/college" :
    role === "Admin"      ? "/admin/college"      :
                            "/user/college";

  const routes = useRoutes([
    // ── Auth (public) routes ──────────────────────────────────────────────
    ...AuthRoutes,

    // ── Protected routes ──────────────────────────────────────────────────
    {
      path:    "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [

            // Root redirect → first allowed page
            { index: true, element: <Navigate to={firstRoute} replace /> },

            // ── SuperAdmin routes ──────────────────────────────────────
            {
              path: "superadmin",
              element: <Outlet />,
              children: [
                { index: true, element: <Navigate to="college" replace /> },
                { path: "college",    element: <CollegeManagement /> },
                { path: "intake",     element: <ComingSoon /> },
                { path: "students",   element: <ComingSoon /> },
                { path: "admissions", element: <ComingSoon /> },
                { path: "users",      element: <ComingSoon /> },
                { path: "roles",      element: <ComingSoon /> },
                { path: "reports",    element: <ComingSoon /> },
                { path: "settings",   element: <ComingSoon /> },
              ],
            },

            // ── Admin routes ───────────────────────────────────────────
            {
              path: "admin",
              element: <Outlet />,
              children: [
                { index: true, element: <Navigate to="college" replace /> },
                { path: "college",    element: <CollegeManagement /> },
                { path: "intake",     element: <ComingSoon /> },
                { path: "students",   element: <ComingSoon /> },
                { path: "admissions", element: <ComingSoon /> },
              ],
            },

            // ── User routes ────────────────────────────────────────────
            {
              path: "user",
              element: <Outlet />,
              children: [
                { index: true, element: <Navigate to="college" replace /> },
                { path: "college",    element: <CollegeManagement /> },
                { path: "admissions", element: <ComingSoon /> },
              ],
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