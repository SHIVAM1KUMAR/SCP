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
import StudentDetails from "../pages/studentmanagement/studentDetails";
import Payments from "../pages/paymentsmanagement/Payments";
import SubscriptionManagement from "../pages/subscriptionManagement/SubscriptionManagement";
import CounsellingSuperAdmin from "../pages/counsellingmanagement/CounsellingSuperAdmin";
import CounsellingAddCounsellor from "../pages/counsellingmanagement/CounsellingAddCounsellor";
import CounsellingScheduleCounselling from "../pages/counsellingmanagement/CounsellingScheduleCounselling";
import CounsellingStudent from "../pages/counsellingmanagement/CounsellingStudent";
import CounsellingStudentSessionDetails from "../pages/counsellingmanagement/CounsellingStudentSessionDetails";
import CounsellingCounsellorDetails from "../pages/counsellingmanagement/CounsellingCounsellorDetails";
import CounsellingSessionDetails from "../pages/counsellingmanagement/CounsellingSessionDetails";
import TestSchedule from "../pages/testmanagement/TestSchedule";
import TestDetails from "../pages/testmanagement/TestDetails";
import TestStudent from "../pages/testmanagement/TestStudent";
import TestStudentDetails from "../pages/testmanagement/TestStudentDetails";
import TestAttempt from "../pages/testmanagement/TestAttempt";
import StudentAdmissions from "../pages/admissions/StudentAdmissions";
import SuperAdminAdmissions from "../pages/admissions/SuperAdminAdmissions";

const ROLE_ROUTES = {
  SuperAdmin: [
    { index: true, element: <Navigate to="college" replace /> },
    { path: "college", element: <CollegeManagement /> },
    { path: "college/:id", element: <CollegeDetails /> },
    { path: "students", element: <StudentManagement /> },
    { path: "students/:id", element: <StudentDetails /> },
    { path: "counselling", element: <CounsellingSuperAdmin /> },
    { path: "counselling/:id", element: <CounsellingCounsellorDetails /> },
    { path: "admissions", element: <SuperAdminAdmissions /> },
    { path: "subscriptions", element: <SubscriptionManagement /> },
    { path: "payments", element: <Payments /> },
    { path: "account-settings", element: <AccountSettings /> },
  ],
  Admin: [
    { index: true, element: <Navigate to="college" replace /> },
    { path: "college", element: <CollegeManagement /> },
    { path: "college/:id", element: <CollegeDetails /> },
    { path: "students", element: <StudentManagement /> },
    { path: "students/:id", element: <StudentDetails /> },
    { path: "account-settings", element: <AccountSettings /> },
  ],
  College: [
    { index: true, element: <Navigate to="students" replace /> },
    { path: "students", element: <StudentManagement scope="college" view="all" /> },
    { path: "students/:id", element: <StudentDetails /> },
    { path: "applied-students", element: <StudentManagement scope="college" view="applied" /> },
    { path: "applied-students/:id", element: <StudentDetails /> },
    { path: "counselling", element: <Navigate to="counselling/add-counsellor" replace /> },
    { path: "counselling/add-counsellor", element: <CounsellingAddCounsellor /> },
    { path: "counselling/schedule", element: <CounsellingScheduleCounselling /> },
    { path: "counselling/:id", element: <CounsellingCounsellorDetails /> },
    { path: "counselling/session/:id", element: <CounsellingSessionDetails /> },
    { path: "tests", element: <TestSchedule /> },
    { path: "tests/:id", element: <TestDetails /> },
    { path: "account-settings", element: <AccountSettings /> },
  ],
  Student: [
    { index: true, element: <Navigate to="colleges" replace /> },
    { path: "colleges", element: <CollegeManagement /> },
    { path: "colleges/:id", element: <CollegeDetails /> },
    { path: "admissions", element: <StudentAdmissions /> },
    { path: "applied-colleges", element: <Navigate to="admissions" replace /> },
    { path: "applied-colleges/:id", element: <CollegeDetails /> },
    { path: "counselling", element: <CounsellingStudent /> },
    { path: "counselling/:id", element: <CounsellingStudentSessionDetails /> },
    { path: "tests", element: <TestStudent /> },
    { path: "tests/:id", element: <TestStudentDetails /> },
    { path: "tests/:id/attempt", element: <TestAttempt /> },
    { path: "account-settings", element: <AccountSettings /> },
  ],
};

const ROOT_REDIRECT = {
  SuperAdmin: "/superadmin/college",
  Admin: "/admin/college",
  College: "/college/students",
  Student: "/student/colleges",
  Counsellor: "/college/counselling/schedule",
};

const AppRouter = () => {
  const auth = getAuth();
  const role = auth?.role;
  const blockCounsellor = (element) =>
    role === "Counsellor" ? <Navigate to="/college/counselling/schedule" replace /> : element;

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
              path: "admin",
              element: <Outlet />,
              children: ROLE_ROUTES.Admin,
            },
            {
              path: "college",
              element: <Outlet />,
              children: ROLE_ROUTES.College.map((route) => {
                if (role !== "Counsellor") return route;

                const blockedPaths = new Set([
                  "students",
                  "students/:id",
                  "applied-students",
                  "applied-students/:id",
                  "counselling",
                  "counselling/add-counsellor",
                  "counselling/:id",
                  "tests",
                  "tests/:id",
                ]);

                if (route.index) {
                  return { ...route, element: <Navigate to="counselling/schedule" replace /> };
                }
                if (blockedPaths.has(route.path)) {
                  return { ...route, element: blockCounsellor(route.element) };
                }
                return route;
              }),
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
