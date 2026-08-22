const TOKEN_STORAGE_KEY = "accessToken";
const USER_STORAGE_KEY = "listo.user";
const TOKEN_COOKIE_NAME = "accessToken";

function getJwtMaxAgeSeconds(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload?.exp) {
      return Math.max(payload.exp - now, 0);
    }
  } catch {
    /* fall through */
  }

  return 7 * 24 * 60 * 60;
}

function writeTokenCookie(token) {
  const maxAge = getJwtMaxAgeSeconds(token);
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearTokenCookie() {
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
}

export function getStoredUser() {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSession(token, user) {
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    writeTokenCookie(token);
  }

  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
  clearTokenCookie();
}
