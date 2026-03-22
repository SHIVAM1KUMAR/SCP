import { useMemo } from "react";
import {
  SuperAdminMenuItems,
  CollegeMenuItems,
  StudentMenuItems,
} from "../component/ui/drawer/MenuItems";
import { getAccessibleModuleIds } from "../utils/getAccessibleModuleIds";
import { getFilteredMenuItems }   from "../utils/getFilteredMenuItems";

// ─── useMenuItems ─────────────────────────────────────────────────────────────
// AmniCare: useSelector(state.auth.role) + useSelector(state.auth.permissions)
// EduAdmit: localStorage.getItem("user") + localStorage.getItem("permissions")
//
// Returns filtered menu items based on role + permissions from JWT
// Same logic as AmniCare's useMenuItems — just reads from localStorage
// ─────────────────────────────────────────────────────────────────────────────

export const useMenuItems = () => {
  // Read from localStorage — set by useAuth on login
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const permissions = (() => {
    try { return JSON.parse(localStorage.getItem("permissions") || "[]"); } catch { return []; }
  })();

  const role = user.role || "";

  return useMemo(() => {
    if (!role) return [];

    // Exact same as AmniCare
    const AllMenuItems =
      role === "SuperAdmin" ? SuperAdminMenuItems :
      role === "College"    ? CollegeMenuItems    :
      role === "Student"    ? StudentMenuItems     : [];

    const accessibleModuleIds = getAccessibleModuleIds(permissions);
    return getFilteredMenuItems(AllMenuItems, accessibleModuleIds, permissions);

  }, [role, JSON.stringify(permissions)]);
};