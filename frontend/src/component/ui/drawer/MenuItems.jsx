// ─── MenuItems.jsx ────────────────────────────────────────────────────────────
// DATA-DRIVEN sidebar menu.
// To show a menu item: uncomment its line in ENABLED_MODULE_IDS below.
// The sidebar will automatically show/hide items based on this list.
//
// Module IDs:
//   1 = College Management
//   2 = Intake Management
//   3 = Student Registration
//   4 = Admissions
//   5 = User Management (has children: 8=Users, 9=Roles)
//   6 = Reports
//   7 = Settings
// ─────────────────────────────────────────────────────────────────────────────

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const I = (d, d2) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18} style={{ flexShrink: 0 }}>
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

export const Icons = {
  College:    I("M22 10v6M2 10l10-5 10 5-10 5z", "M6 12v5c3 3 9 3 12 0v-5"),
  Intake:     (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
      <rect x={3} y={4} width={18} height={18} rx={2} />
      <line x1={16} y1={2} x2={16} y2={6} /><line x1={8} y1={2} x2={8} y2={6} /><line x1={3} y1={10} x2={21} y2={10} />
    </svg>
  ),
  Students:   (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx={9} cy={7} r={4} />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Admission:  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><polyline points="9 15 11 17 15 13" />
    </svg>
  ),
  Users:      (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx={9} cy={7} r={4} />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Roles:      I("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"),
  Reports:    (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1={16} y1={13} x2={8} y2={13} /><line x1={16} y1={17} x2={8} y2={17} />
    </svg>
  ),
  Settings:   (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
      <circle cx={12} cy={12} r={3} />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// ALL POSSIBLE MENU ITEMS
// Each item has a stable moduleId used for permission checks
// ─────────────────────────────────────────────────────────────────────────────
const ALL_MENU_ITEMS = {
  SuperAdmin: [
    { moduleId: 1, label: "College Management",   icon: Icons.College,   path: "/superadmin/college"    },
    { moduleId: 2, label: "Intake Management",    icon: Icons.Intake,    path: "/superadmin/intake"     },
    { moduleId: 3, label: "Student Management", icon: Icons.Students,  path: "/superadmin/students"   },
    { moduleId: 4, label: "Admissions",           icon: Icons.Admission, path: "/superadmin/admissions" },
    {
      moduleId: 5, label: "User Management", icon: Icons.Users, path: "/superadmin/users",
      children: [
        { subModuleId: 8, label: "Users", icon: Icons.Students, path: "/superadmin/users"  },
        { subModuleId: 9, label: "Roles", icon: Icons.Roles,    path: "/superadmin/roles"  },
      ],
    },
    { moduleId: 6, label: "Reports",  icon: Icons.Reports,  path: "/superadmin/reports"  },
    { moduleId: 7, label: "Settings", icon: Icons.Settings, path: "/superadmin/settings" },
  ],

  Admin: [
    { moduleId: 1, label: "College Management",   icon: Icons.College,   path: "/admin/college"    },
    { moduleId: 2, label: "Intake Management",    icon: Icons.Intake,    path: "/admin/intake"     },
    { moduleId: 3, label: "Student Management", icon: Icons.Students,  path: "/admin/students"   },
    { moduleId: 4, label: "Admissions",           icon: Icons.Admission, path: "/admin/admissions" },
  ],

  Student: [
    { moduleId: 1, label: "College List",    icon: Icons.College,   path: "/student/colleges" },
    { moduleId: 4, label: "My Applications", icon: Icons.Admission, path: "/student/admissions" },
  ],

  College: [
    { moduleId: 1, label: "Dashboard",       icon: Icons.College,   path: "/college/counselor" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ ENABLED MODULE IDs — uncomment an ID to show it in the sidebar
// ─────────────────────────────────────────────────────────────────────────────
const ENABLED_MODULE_IDS = [
  1,   // College Management
  // 2,   // Intake Management
  3,   // Student Management
  // 4,   // Admissions
  // 5,   // User Management
  // 6,   // Reports
  // 7,   // Settings
];

// ─────────────────────────────────────────────────────────────────────────────
// getMenuByRole — filters items by ENABLED_MODULE_IDS
// ─────────────────────────────────────────────────────────────────────────────
export const getMenuByRole = (role = "") => {
  const items = ALL_MENU_ITEMS[role] || ALL_MENU_ITEMS.Student;
  return items.filter(item => ENABLED_MODULE_IDS.includes(item.moduleId));
};

// Named exports for backward compat
export const SuperAdminMenuItems = ALL_MENU_ITEMS.SuperAdmin.filter(i => ENABLED_MODULE_IDS.includes(i.moduleId));
export const AdminMenuItems      = ALL_MENU_ITEMS.Admin.filter(i => ENABLED_MODULE_IDS.includes(i.moduleId));
export const CollegeMenuItems    = ALL_MENU_ITEMS.College.filter(i => ENABLED_MODULE_IDS.includes(i.moduleId));
export const StudentMenuItems    = ALL_MENU_ITEMS.Student.filter(i => ENABLED_MODULE_IDS.includes(i.moduleId));