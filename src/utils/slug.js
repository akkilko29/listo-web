export function toSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function entitySlug(item) {
  const backend = toSlug(item?.slug);
  if (backend) {
    return backend;
  }

  return toSlug(item?.name);
}

export function findBySlug(items, slug) {
  const wanted = toSlug(slug);
  if (!wanted) {
    return null;
  }

  return (items || []).find((item) => entitySlug(item) === wanted) || null;
}
