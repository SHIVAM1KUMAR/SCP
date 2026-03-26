import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminAppBar from "../component/ui/drawer/appBar";
import { DrawerHeader } from "../component/ui/drawer/drawerHeader";
import Sidebar from "../component/ui/drawer/sideBar";
import Breadcrumbs from "../component/ui/navigation/breadScrub";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";

const MOBILE_BP = 960;
const DRAWER_OPEN = 280;
const DRAWER_CLOSED = 65;

export default function MainLayout() {
  const { title, links } = useBreadcrumbs();
  const isMobile = () => window.innerWidth < MOBILE_BP;

  const [open, setOpen] = useState(!isMobile());

  useEffect(() => {
    const h = () => setOpen(!isMobile());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const marginLeft = isMobile() ? 0 : open ? DRAWER_OPEN : DRAWER_CLOSED;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100dvh",
        background: "#f4f6f9",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <AdminAppBar open={open} handleDrawerOpen={() => setOpen(true)} />
      <Sidebar
        open={open}
        handleDrawerClose={() => setOpen(false)}
        handleDrawerOpen={() => setOpen(true)}
      />

      <main
        style={{
          flexGrow: 1,
          minWidth: 0,
          marginLeft,
          transition: "margin-left 0.2s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Pushes content below fixed 64px AppBar */}
        <DrawerHeader />

        {/* Single breadcrumb + title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 24px 6px",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Breadcrumbs links={links} />

          {title && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1e293b",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Page content — pages render here via <Outlet /> */}
        <div style={{ padding: "8px 24px 28px", flexGrow: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
