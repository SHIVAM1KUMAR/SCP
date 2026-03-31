import { useState } from "react";
import Button from "../button/Button";

const C = {
  navy: "#0f2044",
  navyMid: "#1a3460",
  navyLight: "#e8eef8",
  gold: "#c9973a",
  goldLt: "#fef3d7",
  cream: "#faf8f4",
  white: "#ffffff",
  slate: "#64748b",
  slateXl: "#94a3b8",
  border: "#e2e8f4",
  red: "#dc2626",
  green: "#16a34a",
  amber: "#d97706",
  shadow: "0 2px 16px rgba(15,32,68,0.08)",
  shadowMd: "0 4px 24px rgba(15,32,68,0.11)",
};

const font = {
  display: "'DM Serif Display', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
};

function SectionCard({ title, icon, children, noPad }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden", minWidth: 0 }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, background: C.cream }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: font.body, letterSpacing: "0.2px" }}>{title}</h3>
      </div>
      <div style={noPad ? { overflowX: "auto" } : { padding: "20px 24px" }}>
        {children}
      </div>
    </div>
  );
}

function InfoField({ label, value, fullWidth, mono }) {
  return (
    <div style={{ gridColumn: fullWidth ? "1/-1" : undefined, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.slateXl, letterSpacing: "0.7px", textTransform: "uppercase", fontFamily: font.body, marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: value ? C.navy : C.slateXl, fontFamily: mono ? "monospace" : font.body, background: value ? C.cream : "#f8fafc", border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px", minHeight: 42, display: "flex", alignItems: "center", letterSpacing: mono ? "0.5px" : undefined, wordBreak: "break-all" }}>
        {value || <span style={{ color: C.slateXl, fontStyle: "italic", fontSize: 13 }}>Not provided</span>}
      </div>
    </div>
  );
}

function getFileUrl(value, fileBaseUrl) {
  if (!value) return "";
  const normalized = String(value).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) return normalized;
  const uploadsMatch = normalized.match(/(?:^|\/)uploads\/(.+)$/i);
  if (uploadsMatch?.[1]) {
    const uploadPath = uploadsMatch[1].split("/").map((s) => encodeURIComponent(s)).join("/");
    return `${fileBaseUrl}/uploads/${uploadPath}`;
  }
  if (/^[a-zA-Z]:\//.test(normalized)) {
    return `${fileBaseUrl}/uploads/${encodeURIComponent(normalized.split("/").pop())}`;
  }
  return `${fileBaseUrl}/${normalized.replace(/^\/+/, "")}`;
}

function FileCard({ label, filename, required, fileBaseUrl }) {
  const fileRef = typeof filename === "string" ? filename : filename?.url || filename?.path || filename?.name || "";
  const fileUrl = getFileUrl(fileRef, fileBaseUrl);

  if (!fileUrl) {
    return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.slateXl, letterSpacing: "0.7px", textTransform: "uppercase", fontFamily: font.body, marginBottom: 5 }}>
          {label}{required && <span style={{ color: C.red }}> *</span>}
        </div>
        <div style={{ border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: "16px", background: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22, opacity: 0.3 }}>📄</span>
          <span style={{ fontSize: 13, color: C.slateXl, fontStyle: "italic" }}>No file uploaded</span>
        </div>
      </div>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileRef);
  const isPdf = /\.pdf$/i.test(fileRef);
  const name = fileRef.split("/").pop();

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.slateXl, letterSpacing: "0.7px", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "13px 16px", background: C.cream, display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: isImage ? "#e0f2fe" : isPdf ? "#fee2e2" : "#e8eef8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isImage ? "🖼️" : isPdf ? "📕" : "📎"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ fontSize: 12, color: C.slateXl }}>Click to view</div>
          </div>
          <span style={{ color: C.gold, flexShrink: 0 }}>↗</span>
        </div>
      </a>
    </div>
  );
}

function PhotoAvatar({ docs, fileBaseUrl }) {
  const photoRef = docs?.photo?.url || docs?.photo?.path || docs?.photo || "";
  const photoUrl = getFileUrl(photoRef, fileBaseUrl);
  const [broken, setBroken] = useState(false);
  return (
    <div style={{ width: 64, height: 64, borderRadius: 14, background: photoUrl && !broken ? "transparent" : C.navyLight, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      {photoUrl && !broken
        ? <img src={photoUrl} alt="student" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setBroken(true)} />
        : <span style={{ fontSize: 28 }}>🎓</span>}
    </div>
  );
}

function ActionBtn({ label, onClick, variant = "default", icon, disabled }) {
  return (
    <Button
      variant={variant === "default" ? "outlined" : variant === "success" ? "success" : variant === "danger" ? "danger" : "primary"}
      onClick={onClick}
      disabled={disabled}
      size="medium"
      style={{ height: 40, padding: "0 16px", fontFamily: font.body, flexShrink: 0 }}
    >
      {icon && <span>{icon}</span>}{label}
    </Button>
  );
}

function AcademicBadge({ label, pct, board, year }) {
  const color = pct >= 75 ? C.green : pct >= 50 ? C.amber : C.red;
  return (
    <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.slateXl, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color, fontFamily: font.display }}>{pct ? `${pct}%` : "—"}</span>
      </div>
      <div style={{ fontSize: 12, color: C.slate }}>{board || "—"} {year ? `· ${year}` : ""}</div>
    </div>
  );
}

export {
  C,
  font,
  SectionCard,
  InfoField,
  FileCard,
  PhotoAvatar,
  ActionBtn,
  AcademicBadge,
};
