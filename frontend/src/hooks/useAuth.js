import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const ROLE_MAP = {
  superadmin: "SuperAdmin",
  college: "College",
  student: "Student",
};

const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const useAuth = () => {

  const login = async (email, password) => {
    const response = await axios.post(
      `${BASE_URL}/auth/superadmin/login`,
      { email, password }
    );

    const data = response.data;
    const token = data.token;
    const user = data.user || data;
    const decoded = decodeJWT(token);

    const normalizedRole =
      ROLE_MAP[(decoded?.role || user?.role || "").toLowerCase()] ||
      "Student";

    const permissions = decoded?.permissions || data.permissions || [];

    localStorage.setItem("token", token);

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user?.id || user?._id || null,
        name: decoded?.name || user?.name || "User",
        email: decoded?.email || user?.email || email,
        role: normalizedRole,
        collegeId: decoded?.collegeId || user?.collegeId || null,
        studentId: decoded?.studentId || user?.studentId || null,
      })
    );

    localStorage.setItem("permissions", JSON.stringify(permissions));

    return { role: normalizedRole, permissions };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
  };

  return { login, logout };
};