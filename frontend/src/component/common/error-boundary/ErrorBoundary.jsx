import { Component } from "react";

// ─── ErrorBoundary ────────────────────────────────────────────────────────────
// Catches unhandled UI errors and shows a fallback screen.
// Replace console.error with Sentry / LogRocket if needed.
// ─────────────────────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ maxWidth: 480 }}>
          <div
            className="d-flex flex-column align-items-center justify-content-center text-center"
            style={{ minHeight: "100dvh", gap: 16 }}
          >
            {/* Error icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={64}
              height={64}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#dc3545"
              strokeWidth={1.5}
            >
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>

            <h5 className="fw-semibold mb-0">Something went wrong</h5>

            <p className="text-muted mb-0">
              An unexpected error occurred. Please reload the page.
            </p>

            <button
              className="btn btn-primary"
              onClick={this.handleReload}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;