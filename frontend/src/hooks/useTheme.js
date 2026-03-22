// ─── useTheme ─────────────────────────────────────────────────────────────────
// AmniCare: OmniCare color palette
// EduAdmit: EduAdmit color palette — same structure, same return shape
// ─────────────────────────────────────────────────────────────────────────────

export function useTheme() {
    const isLoading = false;
    const isError   = false;
  
    const data = {
      colors: {
        primary:   "#1a6fa8",   // EduAdmit blue — sidebar, buttons, links
        secondary: "#0d2d4a",   // Dark navy — sidebar background top
        success:   "#28a745",   // Green — active badges, success toasts
        error:     "#e53e3e",   // Red — delete, error states
        warning:   "#d97706",   // Amber — 403, warning toasts
        info:      "#3b82f6",   // Blue — info toasts, highlights
        dark:      "#0a1f36",   // Sidebar background bottom
        light:     "#f4f6f9",   // Page background
        border:    "#e5e9f0",   // Card borders, dividers
        text: {
          primary:   "#1e293b", // Headings, labels
          secondary: "#64748b", // Subtext, descriptions
          muted:     "#94a3b8", // Placeholders, disabled
        },
      },
      borderRadius: 8,
      fontFamily:   "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    };
  
    return { data, isLoading, isError };
  }