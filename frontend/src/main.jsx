import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

// ─── main.jsx ─────────────────────────────────────────────────────────────────
// AmniCare removed:
//   ❌ SnackbarProvider     → replaced by our ToastContext in App.jsx
//   ❌ Provider (Redux)     → replaced by localStorage (store/auth.js)
//   ❌ PersistGate          → not needed, localStorage is always available
//   ❌ MuiThemeProvider     → no MUI, Bootstrap loaded via index.css / CDN
//   ❌ CssBaseline (MUI)    → Bootstrap resets handle this
//   ❌ LocalizationProvider → no MUI date pickers, using native inputs
//
// Kept:
//   ✅ QueryClientProvider  → still using react-query for API calls
//   ✅ React.StrictMode     → same as AmniCare
//   ✅ ErrorBoundary        → moved into App.jsx
// ─────────────────────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      refetchOnWindowFocus: false,
      staleTime:          1000 * 60 * 5, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);