import { API_ENDPOINTS } from "../config/apiConfig";
import { apiGet } from "./httpClient";

const cache = {
  categories: null,
  subcategories: {},
  categoryAttributes: {},
  categoryAttributeById: {},
  subcategoryAttributes: {},
  attributeOptions: {},
};

function getCacheKey(categoryId, subCategoryId) {
  return `${categoryId}:${subCategoryId}`;
}

function unwrapItem(data) {
  if (!data || typeof data !== "object") {
    return null;
  }

  if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    return data.data;
  }

  if (data.id || data.name || data.slug) {
    return data;
  }

  return null;
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

export async function getCategoryAttribute(categoryId, attributeId) {
  if (!categoryId || !attributeId) {
    return null;
  }

  const key = getCacheKey(categoryId, attributeId);

  if (cache.categoryAttributeById[key]) {
    return cache.categoryAttributeById[key];
  }

  const data = await apiGet(
    API_ENDPOINTS.categoryAttributeById(categoryId, attributeId)
  );
  const attribute = unwrapItem(data);

  if (attribute) {
    cache.categoryAttributeById[key] = attribute;
  }

  return attribute;
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

export function isSelectAttribute(dataType) {
  const type = String(dataType || "").toUpperCase();
  return type === "SELECT" || type === "ENUM" || type === "DROPDOWN";
}

export async function getCategoryAttributeOptions(attributeId) {
  if (!attributeId) {
    return [];
  }

  if (cache.attributeOptions[attributeId]) {
    return cache.attributeOptions[attributeId];
  }

  const data = await apiGet(
    API_ENDPOINTS.categoryAttributeOptions(attributeId)
  );
  const options = unwrapList(data).filter((item) => item.active !== false);
  cache.attributeOptions[attributeId] = options;
  return options;
}

export async function attachAttributeOptions(attributes) {
  const list = Array.isArray(attributes) ? attributes : [];

  return Promise.all(
    list.map(async (attribute) => {
      if (!isSelectAttribute(attribute.dataType)) {
        return {
          ...attribute,
          options: Array.isArray(attribute.options) ? attribute.options : [],
        };
      }

      try {
        const options = await getCategoryAttributeOptions(attribute.id);
        return { ...attribute, options };
      } catch {
        return { ...attribute, options: [] };
      }
    })
  );
}
