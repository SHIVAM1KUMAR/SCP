import { Link, useNavigate } from "react-router-dom";

const HomeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={14}
    height={14}
    style={{ marginBottom: 1 }}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    width={14}
    height={14}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function Breadcrumbs({ links = [] }) {
  const navigate = useNavigate();
  const previousLink = links.length > 1 ? links[links.length - 2] : null;

  return (
    <>
      <style>{`
        .bc-desktop { display: flex; }
        .bc-mobile   { display: none; }
        @media (max-width: 767px) {
          .bc-desktop { display: none; }
          .bc-mobile   { display: flex; }
        }
      `}</style>

      <div style={{ fontFamily: "'Outfit', sans-serif" }}>
        {/* Desktop breadcrumb trail */}
        <nav
          className="bc-desktop"
          aria-label="breadcrumb"
          style={{ fontSize: 13 }}
        >
          <ol
            style={{
              listStyle: "none",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px 6px",
              margin: 0,
              padding: 0,
            }}
          >
            <li>
              <Link
                to="/"
                style={{
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <HomeIcon />
              </Link>
            </li>
            {links.map((link, index) => {
              const isLast = index === links.length - 1;
              return (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span style={{ color: "#cbd5e1", fontSize: 12 }}>›</span>
                  {isLast ? (
                    <span style={{ fontWeight: 500, color: "#1e293b" }}>
                      {link.label}
                    </span>
                  ) : (
                    <Link
                      to={link.href || "/"}
                      style={{ color: "#1a6fa8", textDecoration: "none" }}
                      onMouseEnter={(e) =>
                        (e.target.style.textDecoration = "underline")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.textDecoration = "none")
                      }
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Mobile back button */}
        <div className="bc-mobile" style={{ alignItems: "center", gap: 8 }}>
          <button
            onClick={() => navigate(previousLink?.href || "/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              padding: "2px 4px",
              display: "flex",
              alignItems: "center",
              borderRadius: 4,
            }}
          >
            <BackIcon />
          </button>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
            {previousLink?.label || "Home"}
          </span>
        </div>
      </div>
    </>
  );
}
