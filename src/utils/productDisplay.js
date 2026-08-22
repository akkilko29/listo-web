import { resolveMediaUrl } from "../config/apiConfig";

export function unwrapList(data) {
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

export function formatPrice(price) {
  const amount = Number(price);

  if (Number.isNaN(amount)) {
    return "₹ 0";
  }

  return `₹ ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatTimeAgo(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return minutes <= 1 ? "1 min ago" : `${minutes} mins ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hr ago" : `${hours} hrs ago`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getPrimaryImage(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return "";
  }

  const primary = images.find((image) => image.primary) || images[0];
  return resolveMediaUrl(primary.imageUrl);
}

export function getProductImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return [...images]
    .sort((a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)))
    .map((image) => resolveMediaUrl(image.imageUrl))
    .filter(Boolean);
}

export function mapProduct(product) {
  const city = product.city || "";
  const state = product.state || "";
  const location = [city, state].filter(Boolean).join(", ");

  return {
    id: product.id,
    sellerId: product.sellerId,
    sellerName: product.sellerName || "Seller",
    categoryId: product.categoryId,
    categoryName: product.categoryName || "",
    subCategoryId: product.subCategoryId,
    subCategoryName: product.subCategoryName || "",
    title: product.title || "Untitled listing",
    description: product.description || "",
    price: formatPrice(product.price),
    priceValue: Number(product.price) || 0,
    condition: product.condition || "",
    city,
    state,
    location,
    viewCount: product.viewCount || 0,
    status: product.status || "",
    createdAt: product.createdAt,
    time: formatTimeAgo(product.createdAt),
    image: getPrimaryImage(product.images),
    images: getProductImages(product.images),
    attributes: product.attributes || [],
    featured: product.status === "ACTIVE" && Number(product.viewCount) >= 50,
    sold: String(product.status).toUpperCase() === "SOLD",
  };
}

export function filterProducts(products, filters = {}) {
  return products.filter((product) => {
    if (filters.categoryId && String(product.categoryId) !== String(filters.categoryId)) {
      return false;
    }

    if (
      filters.subCategoryId &&
      String(product.subCategoryId) !== String(filters.subCategoryId)
    ) {
      return false;
    }

    if (filters.location) {
      const query = filters.location.trim().toLowerCase();
      const haystack = `${product.city} ${product.state} ${product.location}`.toLowerCase();
      if (query && !haystack.includes(query)) {
        return false;
      }
    }

    if (filters.minPrice && product.priceValue < Number(filters.minPrice)) {
      return false;
    }

    if (filters.maxPrice && product.priceValue > Number(filters.maxPrice)) {
      return false;
    }

    if (filters.condition === "NEW" && product.condition !== "NEW") {
      return false;
    }

    if (filters.condition === "USED" && product.condition === "NEW") {
      return false;
    }

    return true;
  });
}

export function sortProducts(products, sortBy) {
  const next = [...products];

  if (sortBy === "Date Published: Oldest") {
    next.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === "Price: Low to High") {
    next.sort((a, b) => a.priceValue - b.priceValue);
  } else if (sortBy === "Price: High to Low") {
    next.sort((a, b) => b.priceValue - a.priceValue);
  } else {
    next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return next;
}
