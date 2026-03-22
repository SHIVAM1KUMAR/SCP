// ─── DrawerHeader ─────────────────────────────────────────────────────────────
// AmniCare: MUI styled("div") with theme.mixins.toolbar height
// EduAdmit: Plain div with matching 64px height (toolbar equivalent)
//
// Used as the top section of the sidebar containing logo + close button.
// ─────────────────────────────────────────────────────────────────────────────

export const DrawerHeader = ({ children, style = {} }) => (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "flex-end",
        padding:        "0 8px",
        minHeight:      64,          // matches MUI theme.mixins.toolbar
        borderBottom:   "1px solid #f0f3f7",
        ...style,
      }}
    >
      {children}
    </div>
  );
  
  export default DrawerHeader;