import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { categoryPath, getPopularSeoLocations, locationCategoryPath, locationPath, subcategoryPath } from "../src/seo/seoPaths.js";

const SITE_URL = "https://listolisting.in";
const API_ORIGIN = (
  process.env.VITE_API_BASE_URL || "https://listolisting.online"
).replace(/\/$/, "");

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }

  return response.json();
}

function urlEntry(loc, changefreq, priority, lastmod) {
  const lines = [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
  ];

  if (lastmod) {
    lines.splice(2, 0, `    <lastmod>${xmlEscape(lastmod)}</lastmod>`);
  }

  lines.push("  </url>");
  return lines.join("\n");
}

function toLastmod(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function isActive(item) {
  return item && item.active !== false;
}

async function loadCategories() {
  const data = await fetchJson(`${API_ORIGIN}/api/categories`);
  return unwrapList(data).filter(isActive);
}

async function loadSubcategories(categoryId) {
  const data = await fetchJson(
    `${API_ORIGIN}/api/subcategories/category/${categoryId}`
  );
  return unwrapList(data).filter(isActive);
}

async function loadProducts() {
  const products = [];
  const seen = new Set();

  for (let page = 0; page < 40; page += 1) {
    let data;

    try {
      data = await fetchJson(
        `${API_ORIGIN}/api/products?page=${page}&size=50`
      );
    } catch {
      if (page === 0) {
        data = await fetchJson(`${API_ORIGIN}/api/products`);
      } else {
        break;
      }
    }

    const batch = unwrapList(data).filter((item) => {
      if (item?.id == null) {
        return false;
      }

      const status = String(item.status || "").toUpperCase();
      if (status === "SOLD" || status === "DELETED" || status === "INACTIVE") {
        return false;
      }

      return true;
    });
    if (batch.length === 0) {
      break;
    }

    batch.forEach((item) => {
      const id = String(item.id);
      if (!seen.has(id)) {
        seen.add(id);
        products.push(item);
      }
    });

    if (batch.length < 50) {
      break;
    }
  }

  return products;
}

async function hasPublicListings(filters = {}) {
  const params = new URLSearchParams({
    page: "0",
    size: "1",
  });

  if (filters.categoryId) {
    params.set("categoryId", String(filters.categoryId));
  }

  if (filters.subCategoryId) {
    params.set("subCategoryId", String(filters.subCategoryId));
  }

  if (filters.city) {
    params.set("city", String(filters.city));
  }

  if (filters.state) {
    params.set("state", String(filters.state));
  }

  try {
    const data = await fetchJson(
      `${API_ORIGIN}/api/products/filter?${params.toString()}`
    );
    const total = Number(data?.totalElements);
    if (!Number.isNaN(total)) {
      return total > 0;
    }

    return unwrapList(data).length > 0;
  } catch {
    return false;
  }
}

export async function generateSitemapXml() {
  const urls = new Map();

  const add = (pathname, changefreq, priority, lastmod) => {
    const loc = `${SITE_URL}${pathname}`;
    if (!urls.has(loc)) {
      urls.set(loc, { changefreq, priority, lastmod });
    }
  };

  add("/", "daily", "1.0");
  add("/listings", "hourly", "0.9");
  add("/about", "monthly", "0.7");
  add("/contact", "monthly", "0.6");
  add("/safety", "monthly", "0.6");
  add("/terms", "yearly", "0.4");
  add("/privacy", "yearly", "0.4");
  add("/sitemap", "weekly", "0.5");

  let categories = [];
  try {
    categories = await loadCategories();
  } catch (error) {
    console.warn("Sitemap: categories unavailable", error.message);
  }

  for (const category of categories) {
    const categoryHasListings = await hasPublicListings({
      categoryId: category.id,
    });

    if (categoryHasListings) {
      add(categoryPath(category), "daily", "0.8");
    }

    try {
      const subcategories = await loadSubcategories(category.id);
      for (const subcategory of subcategories) {
        const subcategoryHasListings = await hasPublicListings({
          categoryId: category.id,
          subCategoryId: subcategory.id,
        });

        if (subcategoryHasListings) {
          add(subcategoryPath(category, subcategory), "daily", "0.7");
        }
      }
    } catch (error) {
      console.warn(
        `Sitemap: subcategories unavailable for ${category.id}`,
        error.message
      );
    }
  }

  const locations = getPopularSeoLocations();

  for (const location of locations) {
    const locationHasListings = await hasPublicListings({
      city: location.city,
      state: location.state,
    });

    if (locationHasListings) {
      add(locationPath(location.citySlug), "daily", "0.7");
    }

    for (const category of categories) {
      const comboHasListings = await hasPublicListings({
        categoryId: category.id,
        city: location.city,
        state: location.state,
      });

      if (comboHasListings) {
        add(locationCategoryPath(location.citySlug, category), "daily", "0.6");
      }
    }
  }

  try {
    const products = await loadProducts();
    products.forEach((product) => {
      add(
        `/product/${product.id}`,
        "weekly",
        "0.6",
        toLastmod(product.updatedAt || product.createdAt)
      );
    });
  } catch (error) {
    console.warn("Sitemap: products unavailable", error.message);
  }

  const body = Array.from(urls.entries())
    .map(([loc, meta]) =>
      urlEntry(loc, meta.changefreq, meta.priority, meta.lastmod)
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export async function writeSitemap(targetFile) {
  const xml = await generateSitemapXml();
  await mkdir(path.dirname(targetFile), { recursive: true });
  await writeFile(targetFile, xml, "utf8");
  return targetFile;
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectRun) {
  const target = path.resolve(process.cwd(), "public/sitemap.xml");
  writeSitemap(target)
    .then((file) => {
      console.log(`Wrote ${file}`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
