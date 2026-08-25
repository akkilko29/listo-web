import { SOCIAL_LINKS } from "../data/infoPages";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  PRIVATE_PATH_PREFIXES,
  ROUTE_SEO,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
} from "../config/seoConfig";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "campaign_id",
  "registration_source",
  "registration_method",
]);

function upsertMetaByName(name, content) {
  if (!content) {
    return;
  }

  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertMetaByProperty(property, content) {
  if (!content) {
    return;
  }

  let element = document.head.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) {
    return;
  }

  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  if (!data) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function isPrivatePath(pathname) {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function canonicalPath(pathname, search = "") {
  const path = pathname === "/home" ? "/" : pathname || "/";
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  Array.from(params.keys()).forEach((key) => {
    if (TRACKING_PARAMS.has(key)) {
      params.delete(key);
    }
  });

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function seoForLocation(pathname, search = "") {
  const exact = ROUTE_SEO[pathname];
  const privatePage = isPrivatePath(pathname);
  const path = canonicalPath(pathname, search);

  if (pathname.startsWith("/product/")) {
    return {
      title: "Listing | Listo",
      description: DEFAULT_DESCRIPTION,
      path,
      noIndex: false,
    };
  }

  if (pathname.startsWith("/seller/")) {
    return {
      title: "Seller on Listo",
      description: "View a Listo seller profile and their local classified listings.",
      path,
      noIndex: false,
    };
  }

  return {
    title: exact?.title || `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: exact?.description || DEFAULT_DESCRIPTION,
    path,
    noIndex: Boolean(exact?.noIndex || privatePage),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    email: "support@listo.in",
    description: DEFAULT_DESCRIPTION,
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    areaServed: "IN",
    sameAs: SOCIAL_LINKS.map((item) => item.href),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/listings?keyword={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: getSiteUrl(),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DEFAULT_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };
}

export function applySeo({
  title,
  description,
  path,
  image,
  noIndex = false,
  keywords,
  type = "website",
  jsonLd,
  jsonLdId = "listo-jsonld-page",
} = {}) {
  if (typeof document === "undefined") {
    return;
  }

  const pageTitle = title || `${SITE_NAME} | ${SITE_TAGLINE}`;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const canonical = absoluteUrl(path || "/");
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const robots = noIndex ? "noindex, nofollow" : "index, follow";

  document.title = pageTitle;
  document.documentElement.lang = "en-IN";

  upsertMetaByName("description", pageDescription);
  upsertMetaByName("keywords", keywords || DEFAULT_KEYWORDS);
  upsertMetaByName("robots", robots);
  upsertMetaByName("googlebot", robots);
  upsertMetaByName("author", SITE_NAME);
  upsertMetaByName("theme-color", "#0F172A");

  upsertMetaByName("twitter:card", "summary_large_image");
  upsertMetaByName("twitter:title", pageTitle);
  upsertMetaByName("twitter:description", pageDescription);
  upsertMetaByName("twitter:image", ogImage);
  upsertMetaByName("twitter:site", "@listolisting");

  upsertMetaByProperty("og:site_name", SITE_NAME);
  upsertMetaByProperty("og:title", pageTitle);
  upsertMetaByProperty("og:description", pageDescription);
  upsertMetaByProperty("og:type", type);
  upsertMetaByProperty("og:url", canonical);
  upsertMetaByProperty("og:image", ogImage);
  upsertMetaByProperty("og:locale", "en_IN");

  upsertLink("canonical", canonical);

  const pagePath = String(path || "/").split("?")[0];
  if (noIndex) {
    upsertJsonLd("listo-jsonld-org", null);
  } else if (pagePath === "/") {
    upsertJsonLd("listo-jsonld-org", [
      organizationJsonLd(),
      websiteJsonLd(),
      webApplicationJsonLd(),
    ]);
  } else {
    upsertJsonLd("listo-jsonld-org", [organizationJsonLd(), websiteJsonLd()]);
  }

  upsertJsonLd(jsonLdId, jsonLd || null);
}
