import { useEffect } from "react";
import { useTheme } from "../../../hooks/useTheme";

// ─── ThemeProvider ────────────────────────────────────────────────────────────
// AmniCare used MUI ThemeProvider + createDynamicTheme to inject brand colors.
// We replicate this by injecting CSS variables on <:root> so Bootstrap and
// our inline styles can consume them.
//
// Usage: wrap your app with <AppThemeProvider> just like AmniCare did.
// ─────────────────────────────────────────────────────────────────────────────
export function AppThemeProvider({ children }) {
  const { data: themeConfig, isLoading } = useTheme();

  useEffect(() => {
    if (!themeConfig) return;

    const root = document.documentElement;

    // Inject brand colours as CSS variables (mirrors AmniCare's theme tokens)
    if (themeConfig.primaryColor) {
      root.style.setProperty("--brand-primary",       themeConfig.primaryColor);
      root.style.setProperty("--brand-primary-dark",  themeConfig.primaryDark  || themeConfig.primaryColor);
      root.style.setProperty("--brand-primary-light", themeConfig.primaryLight || themeConfig.primaryColor);
      // Override Bootstrap's primary
      root.style.setProperty("--bs-primary",          themeConfig.primaryColor);
      root.style.setProperty("--bs-btn-bg",           themeConfig.primaryColor);
    }

    if (themeConfig.secondaryColor) {
      root.style.setProperty("--brand-secondary", themeConfig.secondaryColor);
    }

    if (themeConfig.borderRadius) {
      root.style.setProperty("--brand-radius", `${themeConfig.borderRadius}px`);
      root.style.setProperty("--bs-border-radius", `${themeConfig.borderRadius}px`);
    }

    if (themeConfig.fontFamily) {
      root.style.setProperty("--brand-font", themeConfig.fontFamily);
      document.body.style.fontFamily = themeConfig.fontFamily;
    }
  }, [themeConfig]);

  // While theme loads, show nothing (same as AmniCare's `return null`)
  if (isLoading) return null;

  return <>{children}</>;
}