/**
 * Backend API configuration
 *
 * Local Vite (`npm run dev` / `npm run preview`) calls `/api/...`
 * on the same origin. vite.config.js proxies that to the backend,
 * so the browser never makes a cross-origin request (no CORS).
 *
 * Production builds on a real domain use VITE_API_BASE_URL.
 */
const DEFAULT_API_BASE_URL = "http://127.0.0.1:8080";

export const API_ORIGIN = String(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getApiBaseUrl() {
  if (import.meta.env.DEV) {
    return "";
  }

  if (typeof window !== "undefined" && isLocalHost(window.location.hostname)) {
    return "";
  }

  return API_ORIGIN;
}

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  products: "/api/products",
  productsSearch: "/api/products/search",
  productsFilter: "/api/products/filter",
  productById: (id) => `/api/products/${id}`,
  productFavorite: (id) => `/api/products/${id}/favorite`,
  productFavorites: "/api/products/favorites",
  categories: "/api/categories",
  subcategoriesByCategory: (categoryId) =>
    `/api/subcategories/category/${categoryId}`,
  categoryAttributes: (categoryId) =>
    `/api/categories/${categoryId}/attributes/all`,
  categoryAttributeById: (categoryId, attributeId) =>
    `/api/categories/${categoryId}/attributes/${attributeId}`,
  subcategoryAttributes: (categoryId, subCategoryId) =>
    `/api/categories/${categoryId}/subcategories/${subCategoryId}/attributes`,
};

export function resolveMediaUrl(path) {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
