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
//import StudentDashboard from "../pages/studentmanagement/StudentDashboard";
import StudentManagement from "../pages/studentmanagement/StudentManagement";
import Payments from "../pages/payments/Payments";

const ROLE_ROUTES = {
  SuperAdmin: [
    { index: true, element: <Navigate to="college" replace /> },
    { path: "college", element: <CollegeManagement /> },
    { path: "college/:id", element: <CollegeDetails /> },
    { path: "students", element: <StudentManagement /> },
    { path: "payments", element: <Payments /> },
    { path: "account-settings", element: <AccountSettings /> },
  ],
  College: [
    { index: true, element: <Navigate to="college" replace /> },
    { path: "college", element: <CollegeManagement /> },
    { path: "college/:id", element: <CollegeDetails /> },
    { path: "students", element: <StudentManagement /> },
    { path: "account-settings", element: <AccountSettings /> },
  ],
  Student: [
    { index: true, element: <Navigate to="colleges" replace /> },
   // { path: "colleges", element: <StudentDashboard /> },
    { path: "account-settings", element: <AccountSettings /> },
  ],
};

const ROOT_REDIRECT = {
  SuperAdmin: "/superadmin/college",
  College: "/college/college",
  Student: "/student/colleges",
};

const AppRouter = () => {
  const auth = getAuth();
  const role = auth?.role;

  return useRoutes([
    ...AuthRoutes,
    {
      path: "/",
      element: role ? <ProtectedRoute /> : <Navigate to="/login" replace />,
      children: [
        {
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: (
                <Navigate to={ROOT_REDIRECT[role] ?? "/login"} replace />
              ),
            },
            {
              path: "superadmin",
              element: <Outlet />,
              children: ROLE_ROUTES.SuperAdmin,
            },
            {
              path: "college",
              element: <Outlet />,
              children: ROLE_ROUTES.College,
            },
            {
              path: "student",
              element: <Outlet />,
              children: ROLE_ROUTES.Student,
            },
          ],
        },
      ],
    },
    UnAuthorizedRoute,
    NotFoundRoute,
  ]);
};

export default AppRouter; // ✅ this was missing
