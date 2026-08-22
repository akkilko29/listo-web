import { API_ENDPOINTS } from "../config/apiConfig";
import { apiGet } from "./httpClient";

const cache = {
  categories: null,
  subcategories: {},
  categoryAttributes: {},
  subcategoryAttributes: {},
};

function getCacheKey(categoryId, subCategoryId) {
  return `${categoryId}:${subCategoryId}`;
}

export async function getCategories() {
  if (cache.categories) {
    return cache.categories;
  }

  const data = await apiGet(API_ENDPOINTS.categories);
  const categories = unwrapList(data);
  cache.categories = categories;
  return cache.categories;
}

function unwrapList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
}

export async function getSubcategoriesByCategory(categoryId) {
  if (!categoryId) {
    return [];
  }

  if (cache.subcategories[categoryId]) {
    return cache.subcategories[categoryId];
  }

  const data = await apiGet(
    API_ENDPOINTS.subcategoriesByCategory(categoryId)
  );
  cache.subcategories[categoryId] = unwrapList(data);
  return cache.subcategories[categoryId];
}

export async function getCategoryAttributes(categoryId) {
  if (!categoryId) {
    return [];
  }

  if (cache.categoryAttributes[categoryId]) {
    return cache.categoryAttributes[categoryId];
  }

  const data = await apiGet(
    API_ENDPOINTS.categoryAttributes(categoryId)
  );
  cache.categoryAttributes[categoryId] = unwrapList(data);
  return cache.categoryAttributes[categoryId];
}

export async function getSubcategoryAttributes(categoryId, subCategoryId) {
  if (!categoryId || !subCategoryId) {
    return [];
  }

  const key = getCacheKey(categoryId, subCategoryId);

  if (cache.subcategoryAttributes[key]) {
    return cache.subcategoryAttributes[key];
  }

  const data = await apiGet(
    API_ENDPOINTS.subcategoryAttributes(categoryId, subCategoryId)
  );
  cache.subcategoryAttributes[key] = unwrapList(data);
  return cache.subcategoryAttributes[key];
}
