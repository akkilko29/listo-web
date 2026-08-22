const CATEGORY_ICONS = [
  { match: "mobile", icon: "fa-solid fa-mobile-screen-button" },
  { match: "car", icon: "fa-solid fa-car" },
  { match: "bike", icon: "fa-solid fa-motorcycle" },
  { match: "propert", icon: "fa-solid fa-house" },
  { match: "electronic", icon: "fa-solid fa-laptop" },
  { match: "commercial", icon: "fa-solid fa-truck" },
  { match: "job", icon: "fa-solid fa-briefcase" },
  { match: "furniture", icon: "fa-solid fa-couch" },
  { match: "fashion", icon: "fa-solid fa-shirt" },
  { match: "pet", icon: "fa-solid fa-paw" },
  { match: "book", icon: "fa-solid fa-book" },
  { match: "sport", icon: "fa-solid fa-book" },
  { match: "service", icon: "fa-solid fa-screwdriver-wrench" },
];

export const ALL_CATEGORIES_ITEM = {
  id: "all",
  name: "All Categories",
  description: "Browse every listing on Listo",
  icon: "fa-solid fa-table-cells-large",
};

export function getCategoryIcon(name) {
  const value = String(name || "").toLowerCase();
  const found = CATEGORY_ICONS.find((item) => value.includes(item.match));
  return found ? found.icon : "fa-solid fa-tag";
}

export function withCategoryMeta(category) {
  return {
    ...category,
    icon: getCategoryIcon(category.name),
  };
}
