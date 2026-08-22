const WISHLIST_KEY = "listo.wishlist";

export function getWishlistIds() {
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function isWishlisted(productId) {
  return getWishlistIds().includes(String(productId));
}

export function toggleWishlist(productId) {
  const id = String(productId);
  const current = getWishlistIds();
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];

  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  return next;
}
