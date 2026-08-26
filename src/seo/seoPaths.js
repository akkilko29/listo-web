import { POPULAR_LOCATIONS } from "../data/popularLocations.js";
import { entitySlug, toSlug } from "../utils/slug.js";

export function parsePopularLocation(label) {
  const value = String(label || "").trim();
  if (!value) {
    return null;
  }

  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  const city = parts[0] || "";
  const state = parts.slice(1).join(", ");
  const citySlug = toSlug(city);

  if (!citySlug) {
    return null;
  }

  return {
    label: value,
    city,
    state,
    citySlug,
  };
}

export function getPopularSeoLocations() {
  const seen = new Set();

  return POPULAR_LOCATIONS.map(parsePopularLocation).filter((item) => {
    if (!item || seen.has(item.citySlug)) {
      return false;
    }

    seen.add(item.citySlug);
    return true;
  });
}

export function findPopularLocationBySlug(citySlug) {
  const slug = toSlug(citySlug);
  return getPopularSeoLocations().find((item) => item.citySlug === slug) || null;
}

export function findPopularLocationByLabel(label) {
  const parsed = parsePopularLocation(label);
  if (!parsed) {
    return null;
  }

  return (
    getPopularSeoLocations().find((item) => item.citySlug === parsed.citySlug) ||
    null
  );
}

export function categoryPath(category) {
  const slug = entitySlug(category);
  return slug ? `/category/${slug}` : "/listings";
}

export function subcategoryPath(category, subcategory) {
  const categorySlug = entitySlug(category);
  const subSlug = entitySlug(subcategory);

  if (!categorySlug || !subSlug) {
    return categoryPath(category);
  }

  return `/category/${categorySlug}/${subSlug}`;
}

export function locationPath(citySlug) {
  const slug = toSlug(citySlug);
  return slug ? `/location/${slug}` : "/listings";
}

export function locationCategoryPath(citySlug, category) {
  const city = toSlug(citySlug);
  const categorySlug = entitySlug(category);

  if (!city || !categorySlug) {
    return locationPath(citySlug);
  }

  return `/location/${city}/${categorySlug}`;
}

export function seoListingPath({
  category,
  subcategory,
  locationLabel,
} = {}) {
  const popular = findPopularLocationByLabel(locationLabel);

  if (popular && category?.id) {
    return locationCategoryPath(popular.citySlug, category);
  }

  if (popular && !category?.id) {
    return locationPath(popular.citySlug);
  }

  if (category?.id && subcategory?.id) {
    return subcategoryPath(category, subcategory);
  }

  if (category?.id) {
    return categoryPath(category);
  }

  return "/listings";
}
