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

  if (/\/favorite/i.test(path) || path.startsWith("/api/products/favorites")) {
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

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  const token = getStoredToken();
  if (token && !headers.Authorization && !isPublicGet(path, options.method)) {
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
