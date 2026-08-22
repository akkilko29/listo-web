/**
 * Backend API configuration
 *
 * Change DEFAULT_API_BASE_URL (or VITE_API_BASE_URL in .env)
 * before production deploy.
 *
 * Local:  http://localhost:8080
 * Prod:   https://api.yourdomain.com
 *
 * In `npm run dev`, requests use the Vite /api proxy so the
 * browser does not hit CORS errors.
 */
const DEFAULT_API_BASE_URL = "http://localhost:8080";

export const API_ORIGIN = String(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export const API_BASE_URL = import.meta.env.DEV ? "" : API_ORIGIN;

export const API_ENDPOINTS = {
  categories: "/api/categories",
  subcategoriesByCategory: (categoryId) =>
    `/api/subcategories/category/${categoryId}`,
  categoryAttributes: (categoryId) =>
    `/api/categories/${categoryId}/attributes/all`,
  subcategoryAttributes: (categoryId, subCategoryId) =>
    `/api/categories/${categoryId}/subcategories/${subCategoryId}/attributes`,
};
