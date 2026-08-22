const CATEGORY_ICONS = [
  { match: "mobile", icon: "fa-solid fa-mobile-screen-button", theme: "mobiles" },
  { match: "car", icon: "fa-solid fa-car", theme: "vehicles" },
  { match: "bike", icon: "fa-solid fa-motorcycle", theme: "vehicles" },
  { match: "propert", icon: "fa-solid fa-house", theme: "properties" },
  { match: "electronic", icon: "fa-solid fa-laptop", theme: "electronics" },
  { match: "commercial", icon: "fa-solid fa-truck", theme: "commercial" },
  { match: "job", icon: "fa-solid fa-briefcase", theme: "jobs" },
  { match: "furniture", icon: "fa-solid fa-couch", theme: "furniture" },
  { match: "fashion", icon: "fa-solid fa-shirt", theme: "fashion" },
  { match: "pet", icon: "fa-solid fa-paw", theme: "pets" },
  { match: "book", icon: "fa-solid fa-book", theme: "books" },
  { match: "sport", icon: "fa-solid fa-book", theme: "books" },
  { match: "service", icon: "fa-solid fa-screwdriver-wrench", theme: "services" },
];

export const ALL_CATEGORIES_ITEM = {
  id: "all",
  name: "All Categories",
  description: "Browse every listing on Listo",
  icon: "fa-solid fa-table-cells-large",
};

export function getCategoryIcon(name) {
  const found = findCategoryMeta(name);
  return found ? found.icon : "fa-solid fa-tag";
}

export function getCategoryTheme(name) {
  const found = findCategoryMeta(name);
  return found ? found.theme : "default";
}

function findCategoryMeta(name) {
  const value = String(name || "").toLowerCase();
  return CATEGORY_ICONS.find((item) => value.includes(item.match));
}

export function withCategoryMeta(category) {
  return {
    ...category,
    icon: getCategoryIcon(category.name),
    theme: getCategoryTheme(category.name),
  };
}

export function limitCategories(categories, maxCount) {
  if (!maxCount || maxCount <= 0) {
    return categories;
  }

  return categories.slice(0, maxCount);
}
