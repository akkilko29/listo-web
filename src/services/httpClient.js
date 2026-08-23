import { getApiBaseUrl } from "../config/apiConfig";
import { getStoredToken } from "./authStorage";

const PUBLIC_GET_PREFIXES = [
  "/api/categories",
  "/api/subcategories",
  "/api/products",
];

function isPublicGet(path, method) {
  if (String(method || "GET").toUpperCase() !== "GET") {
    return false;
  }

  if (
    /\/favorite/i.test(path) ||
    path.startsWith("/api/products/favorites") ||
    path.startsWith("/api/products/my")
  ) {
    return false;
  }

  return PUBLIC_GET_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function parseError(response, path) {
  let message = `API ${response.status}: ${path}`;

  try {
    const data = await response.json();
    message = data?.message || data?.error || data?.detail || message;
  } catch {
    /* ignore non-JSON error bodies */
  }

  throw new Error(message);
}

async function parseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    const idMatch = text.match(/"id"\s*:\s*(\d+)/);
    if (idMatch) {
      return { id: Number(idMatch[1]) };
    }

    return null;
  }
}

async function request(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method || "GET",
    headers,
    body: isFormData
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (!response.ok) {
    await parseError(response, path);
  }

  return parseBody(response);
}

export function apiGet(path) {
  return request(path, { method: "GET" });
}

export function apiPost(path, body) {
  return request(path, { method: "POST", body });
}

export function apiPostForm(path, formData) {
  return request(path, { method: "POST", body: formData });
}

export function apiDelete(path) {
  return request(path, { method: "DELETE" });
}

export function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}

export function apiPatch(path, body) {
  return request(path, { method: "PATCH", body });
}
