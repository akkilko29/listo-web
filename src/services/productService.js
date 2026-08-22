import { API_ENDPOINTS } from "../config/apiConfig";
import { apiGet } from "./httpClient";
import { mapProduct, unwrapList } from "../utils/productDisplay";

export async function getProducts() {
  const data = await apiGet(API_ENDPOINTS.products);
  return unwrapList(data).map(mapProduct);
}

export async function searchProducts(keyword) {
  const query = String(keyword || "").trim();

  if (!query) {
    return getProducts();
  }

  const needle = query.toLowerCase();
  const matchKeyword = (product) =>
    `${product.title} ${product.description} ${product.categoryName} ${product.subCategoryName} ${product.location}`
      .toLowerCase()
      .includes(needle);

  try {
    const params = new URLSearchParams({ keyword: query });
    const data = await apiGet(
      `${API_ENDPOINTS.productsSearch}?${params.toString()}`
    );
    const results = unwrapList(data).map(mapProduct);

    if (results.length === 0) {
      const products = await getProducts();
      return products.filter(matchKeyword);
    }

    return results.some(matchKeyword) ? results.filter(matchKeyword) : results;
  } catch {
    const products = await getProducts();
    return products.filter(matchKeyword);
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
