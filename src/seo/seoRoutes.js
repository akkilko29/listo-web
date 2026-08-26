import { absoluteUrl } from "../config/seoConfig";
import { POPULAR_LOCATIONS } from "../data/popularLocations";
import { splitLocation } from "../utils/productDisplay";
import { entitySlug, findBySlug, toSlug } from "../utils/slug";

export function categoryHref(category) {
  const slug = entitySlug(category);
  return slug ? `/category/${slug}` : "/listings";
}

export function subcategoryHref(category, subcategory) {
  const categorySlug = entitySlug(category);
  const subcategorySlug = entitySlug(subcategory);

  if (!categorySlug || !subcategorySlug) {
    return categoryHref(category);
  }

  return `/category/${categorySlug}/${subcategorySlug}`;
}

export function locationHref(locationLabel) {
  const city = splitLocation(locationLabel).city || String(locationLabel || "");
  const slug = toSlug(city);
  return slug ? `/location/${slug}` : "/listings";
}

export function locationCategoryHref(locationLabel, category) {
  const citySlug = toSlug(splitLocation(locationLabel).city || locationLabel);
  const categorySlug = entitySlug(category);

  if (!citySlug) {
    return categoryHref(category);
  }

  if (!categorySlug) {
    return `/location/${citySlug}`;
  }

  return `/location/${citySlug}/${categorySlug}`;
}

export function parsePopularLocation(locationLabel) {
  const { city, state } = splitLocation(locationLabel);
  if (!city) {
    return null;
  }

  return {
    label: locationLabel,
    city,
    state,
    slug: toSlug(city),
  };
}

export function getPopularSeoLocations() {
  const seen = new Set();

  return POPULAR_LOCATIONS.map(parsePopularLocation)
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item.slug)) {
        return false;
      }
      seen.add(item.slug);
      return true;
    });
}

export function findPopularLocationBySlug(citySlug) {
  return (
    getPopularSeoLocations().find((item) => item.slug === toSlug(citySlug)) ||
    null
  );
}

export function findCategoryBySlug(categories, slug) {
  return findBySlug(
    (categories || []).filter((item) => item.active !== false),
    slug
  );
}

export function findSubcategoryBySlug(subcategories, slug) {
  return findBySlug(
    (subcategories || []).filter((item) => item.active !== false),
    slug
  );
}

export function breadcrumbList(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items
      .filter((item) => item?.name && item?.path)
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path),
      })),
  };
}

export function listingSeoCopy({ categoryName, subcategoryName, cityName }) {
  const topic = subcategoryName || categoryName || "products";
  const topicLower = String(topic).toLowerCase();

  if (cityName && (categoryName || subcategoryName)) {
    return {
      title: `Buy & Sell ${topic} in ${cityName} | LISTO`,
      description: `Buy and sell ${topicLower} in ${cityName} on LISTO. Browse local listings and connect with buyers and sellers near you.`,
      h1: `Buy & Sell ${topic} in ${cityName}`,
    };
  }

  if (cityName) {
    return {
      title: `Buy & Sell in ${cityName} | LISTO`,
      description: `Buy and sell products in ${cityName} on LISTO. Post a free ad and connect with local buyers and sellers.`,
      h1: `Buy & Sell in ${cityName}`,
    };
  }

  return {
    title: `Buy & Sell ${topic} | LISTO`,
    description: `Buy and sell ${topicLower} on LISTO. Find new and used ${topicLower} from local sellers near you.`,
    h1: `Buy & Sell ${topic}`,
  };
}
