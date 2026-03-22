// ─── auth.js ──────────────────────────────────────────────────────────────────
// AmniCare: Redux Toolkit slice (auth.slice.ts) + redux-persist
// EduAdmit: Plain localStorage helpers — same data shape, zero Redux
//
// Replaces:
//   setAuth(payload)  → dispatch(setAuth(payload))
//   logout()          → dispatch(logout())
//   state.auth.xyz    → getAuth().xyz
//
// Data shape matches AmniCare's AuthState exactly so all consuming
// components work without changes (just swap useSelector → getAuth())
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_KEY = "user";
const TOKEN_KEY = "token";

// ── Default / initial state (mirrors AmniCare's initialState) ─────────────────
const initialState = {
  name:            null,
  token:           null,
  isAuthenticated: false,
  role:            null,
  collegeId:       null,   // replaces providerId
  globalUserId:    null,
  userMasterId:    null,
  email:           null,
  exp:             null,
  permissions:     [],
  profilePicUrl:   null,
};

// ── Read ──────────────────────────────────────────────────────────────────────
export function getAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user  = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    if (!token || !user) return { ...initialState };

    return {
      ...initialState,
      ...user,
      token,
      isAuthenticated: true,
    };
  } catch {
    return { ...initialState };
  }
}

// ── Write — replaces dispatch(setAuth(payload)) ───────────────────────────────
export function setAuth(payload = {}) {
  const { token, ...rest } = payload;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Merge into existing user object (redux-persist behaviour)
  const current = (() => {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "{}"); }
    catch { return {}; }
  })();

  localStorage.setItem(AUTH_KEY, JSON.stringify({ ...current, ...rest }));
}

// ── Clear — replaces dispatch(logout()) ──────────────────────────────────────
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_KEY);
}

// ── Convenience: check auth without full read ─────────────────────────────────
export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

// ── Update a single field (e.g. profilePicUrl) ────────────────────────────────
// Mirrors: dispatch(setAuth({ ...authState, profilePicUrl: url }))
export function updateAuth(fields = {}) {
  const current = (() => {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "{}"); }
    catch { return {}; }
  })();
  localStorage.setItem(AUTH_KEY, JSON.stringify({ ...current, ...fields }));
}