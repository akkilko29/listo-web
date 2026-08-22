import { API_ENDPOINTS, resolveMediaUrl } from "../config/apiConfig";
import { formatPrice, formatTimeAgo, unwrapList } from "../utils/productDisplay";
import { apiDelete, apiGet, apiPost } from "./httpClient";

let favoriteIds = new Set();
let cacheLoaded = false;

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }

  return Boolean(value);
}

export function mapFavorite(item) {
  const city = item.productCity || "";
  const state = item.productState || "";
  const image = resolveMediaUrl(item.primaryImageUrl);

  return {
    id: item.productId,
    favoriteId: item.id,
    title: item.productTitle || "Untitled listing",
    price: formatPrice(item.productPrice),
    priceValue: Number(item.productPrice) || 0,
    city,
    state,
    location: [city, state].filter(Boolean).join(", "),
    image,
    images: image ? [image] : [],
    createdAt: item.createdAt,
    time: formatTimeAgo(item.createdAt),
  };
}

export function clearFavoriteCache() {
  favoriteIds = new Set();
  cacheLoaded = false;
}

export function isFavorite(productId) {
  return favoriteIds.has(String(productId));
}

export async function getFavorites() {
  const data = await apiGet(API_ENDPOINTS.productFavorites);
  const items = unwrapList(data).map(mapFavorite);
  favoriteIds = new Set(items.map((item) => String(item.id)));
  cacheLoaded = true;
  return items;
}

export async function getFavoriteStatus(productId) {
  const data = await apiGet(API_ENDPOINTS.productFavorite(productId));
  const favorite = toBoolean(data);
  const id = String(productId);

  if (favorite) {
    favoriteIds.add(id);
  } else {
    favoriteIds.delete(id);
  }

  return favorite;
}

export async function addFavorite(productId) {
  const data = await apiPost(API_ENDPOINTS.productFavorite(productId));
  favoriteIds.add(String(productId));
  return data && (data.productId || data.id) ? mapFavorite(data) : null;
}

export async function removeFavorite(productId) {
  await apiDelete(API_ENDPOINTS.productFavorite(productId));
  favoriteIds.delete(String(productId));
}

export async function ensureFavoritesLoaded() {
  if (cacheLoaded) {
    return favoriteIds;
  }

  try {
    await getFavorites();
  } catch {
    cacheLoaded = true;
  }

  return favoriteIds;
}

export async function toggleFavorite(productId) {
  const id = String(productId);

  if (!cacheLoaded) {
    try {
      await getFavoriteStatus(id);
      cacheLoaded = true;
    } catch {
      cacheLoaded = true;
    }
  }

  if (favoriteIds.has(id)) {
    await removeFavorite(id);
    return false;
  }

  await addFavorite(id);
  return true;
}
