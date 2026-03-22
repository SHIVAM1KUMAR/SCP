import { useLocation } from "react-router-dom";

// ─── useBreadcrumbs ───────────────────────────────────────────────────────────
// AmniCare: TypeScript with BreadcrumbLink interface
// EduAdmit: Plain JS — exact same logic
//
// Skips numeric segments (IDs) in the URL
// Returns: { links: [{ label, href }], title }
// ─────────────────────────────────────────────────────────────────────────────

// Human-readable labels for known path segments
const SEGMENT_LABELS = {
  superadmin:      "Super Admin",
  college:         "College Management",
  intake:          "Intake Management",
  students:        "Student Management",
  admissions:      "Admissions",
  subscriptions:   "Subscriptions & Billing",
  users:           "User Management",
  list:            "Users",
  roles:           "Roles & Permissions",
  reports:         "Reports & Analytics",
  settings:        "Settings",
  dashboard:       "Dashboard",
  courses:         "Courses & Programs",
  tests:           "Test Schedule",
  counselling:     "Counsellor Booking",
  counsellors:     "Counsellors",
  appointments:    "Appointments",
  slots:           "Slots",
  payments:        "Fee & Payments",
  applications:    "Applications",
  approved:        "Approved",
  rejected:        "Rejected",
  colleges:        "Browse Colleges",
  notifications:   "Notifications",
  profile:         "My Profile",
  "account-settings": "Account Settings",
};

const toLabel = (segment) =>
  SEGMENT_LABELS[segment] ||
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

export function useBreadcrumbs() {
  const { pathname } = useLocation();

  const segments = pathname.split("/").filter(Boolean);

  const links = [];
  let currentPath = "";

  segments.forEach((segment) => {
    currentPath += "/" + segment;

    // Skip numeric segments (IDs) — same as AmniCare
    if (!/^\d+$/.test(segment)) {
      links.push({
        label: toLabel(segment),
        href:  currentPath,
      });
    }
  });

  const title = links.length ? links[links.length - 1].label : "";

  return { links, title };
}