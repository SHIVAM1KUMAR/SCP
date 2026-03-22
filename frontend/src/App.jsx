import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import AppRouter from "./routes/AppRouter";
import TokenExpiryHandler from "./component/common/token-handler/TokenExpiryHandler";
import ErrorBoundary from "./component/common/error-boundary/ErrorBoundary";

// ─── App ──────────────────────────────────────────────────────────────────────
// AmniCare: BrowserRouter + TokenExpiryHandler + AppRouter
// EduAdmit: Same structure + ToastProvider (replaces notistack SnackbarProvider)
//           ErrorBoundary moved here from main.jsx (cleaner split)
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <TokenExpiryHandler />
          <AppRouter />
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;