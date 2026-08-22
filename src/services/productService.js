import { API_ENDPOINTS } from "../config/apiConfig";
import { apiDelete, apiGet, apiPatch, apiPost, apiPostForm, apiPut } from "./httpClient";
import {
  filterProducts,
  mapProduct,
  sortProducts,
  splitLocation,
  unwrapList,
  unwrapProductPage,
} from "../utils/productDisplay";

const SORT_QUERY = {
  "Date Published: Newest": "createdAt,desc",
  "Date Published: Oldest": "createdAt,asc",
  "Price: Low to High": "price,asc",
  "Price: High to Low": "price,desc",
};

function setParam(params, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  const text = String(value).trim();
  if (!text) {
    return;
  }

  params.set(key, text);
}

export function toApiCondition(condition) {
  if (condition === "Brand New / Unused" || condition === "NEW") {
    return "NEW";
  }

  if (condition === "Gently Used" || condition === "USED") {
    return "USED";
  }

  return "";
}

export function fromApiCondition(condition) {
  if (condition === "NEW") {
    return "Brand New / Unused";
  }

  if (condition === "USED") {
    return "Gently Used";
  }

  return "Any";
}

export async function getProducts() {
  const data = await apiGet(API_ENDPOINTS.products);
  return unwrapList(data).map(mapProduct);
}

export async function getMyProducts() {
  const data = await apiGet(API_ENDPOINTS.productsMy);
  return unwrapList(data).map(mapProduct);
}

export async function searchProducts(keyword) {
  const page = await filterProductsPage({ keyword, page: 0, size: 50 });
  return page.products;
}

export async function filterProductsPage(options = {}) {
  const pageIndex = Math.max(0, Number(options.page) || 0);
  const size = Math.max(1, Number(options.size) || 10);
  const location = splitLocation(options.location || "");
  const city = options.city || location.city;
  const state = options.state || location.state;
  const params = new URLSearchParams();

  setParam(params, "keyword", options.keyword);
  setParam(params, "categoryId", options.categoryId);
  setParam(params, "subCategoryId", options.subCategoryId);
  setParam(params, "minPrice", options.minPrice);
  setParam(params, "maxPrice", options.maxPrice);
  setParam(params, "city", city);
  setParam(params, "state", state);
  setParam(params, "condition", toApiCondition(options.condition));
  setParam(params, "sort", SORT_QUERY[options.sort] || options.sort);
  params.set("page", String(pageIndex));
  params.set("size", String(size));

  Object.entries(options.attributes || {}).forEach(([slug, value]) => {
    setParam(params, slug, value);
  });

  try {
    const data = await apiGet(
      `${API_ENDPOINTS.productsFilter}?${params.toString()}`
    );
    return unwrapProductPage(data);
  } catch {
    const products = await getProducts();
    const filtered = filterProducts(products, {
      categoryId: options.categoryId,
      subCategoryId: options.subCategoryId,
      keyword: options.keyword,
      location: [city, state].filter(Boolean).join(", "),
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
      condition: toApiCondition(options.condition),
      attribute: options.attribute,
      attributeValue: options.attributeValue,
    });
    const sorted = sortProducts(filtered, options.sort);
    const start = pageIndex * size;

    return {
      products: sorted.slice(start, start + size),
      totalElements: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / size) || 1),
      page: pageIndex,
      size,
    };
  }
}

export async function getProductById(id) {
  if (!id) {
    return null;
  }

  try {
    const data = await apiGet(API_ENDPOINTS.productById(id));
    if (data && (data.id || data.data)) {
      return mapProduct(data.data || data);
    }
  } catch {
    /* fall back to the products list */
  }

  const products = await getProducts();
  return products.find((product) => String(product.id) === String(id)) || null;
}

function toProductPayload(input) {
  return {
    title: String(input.title || "").trim(),
    description: String(input.description || "").trim(),
    price: Number(input.price),
    condition: String(input.condition || "GOOD").trim(),
    city: String(input.city || "").trim(),
    state: String(input.state || "").trim(),
    categoryId: Number(input.categoryId),
    subCategoryId: Number(input.subCategoryId),
    attributes: (input.attributes || [])
      .filter((item) => item.attributeId && String(item.value || "").trim())
      .map((item) => ({
        attributeId: Number(item.attributeId),
        value: String(item.value).trim(),
      })),
  };
}

export async function createProduct(input) {
  const data = await apiPost(API_ENDPOINTS.products, toProductPayload(input));
  return mapProduct(data.data || data);
}

export async function updateProduct(id, input) {
  const data = await apiPut(
    API_ENDPOINTS.productById(id),
    toProductPayload(input)
  );
  return mapProduct(data.data || data);
}

export async function uploadProductImage(productId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiPostForm(
    API_ENDPOINTS.productImagesUpload(productId),
    formData
  );
  return data;
}

export async function markProductSold(id) {
  const data = await apiPatch(API_ENDPOINTS.productSold(id));
  return data ? mapProduct(data.data || data) : null;
}

export async function deleteProduct(id) {
  await apiDelete(API_ENDPOINTS.productById(id));
}
