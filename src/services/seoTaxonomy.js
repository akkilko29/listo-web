import {
  getCategories,
  getSubcategoriesByCategory,
} from "./categoryService";
import { entitySlug } from "../utils/slug";

function isActive(item) {
  return item && item.active !== false;
}

export async function resolveCategoryBySlug(categorySlug) {
  const slug = String(categorySlug || "").trim();
  if (!slug) {
    return null;
  }

  const categories = (await getCategories()).filter(isActive);
  return categories.find((item) => entitySlug(item) === slug) || null;
}

export async function resolveSubcategoryBySlug(category, subcategorySlug) {
  if (!category?.id || !subcategorySlug) {
    return null;
  }

  const slug = String(subcategorySlug || "").trim();
  const subcategories = (await getSubcategoriesByCategory(category.id)).filter(
    isActive
  );

  return subcategories.find((item) => entitySlug(item) === slug) || null;
}
