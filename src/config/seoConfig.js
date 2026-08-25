export const SITE_NAME = "Listo";
export const SITE_TAGLINE = "Buy and sell locally with verified neighbours";
export const DEFAULT_DESCRIPTION =
  "Listo is India's neighbourhood classifieds marketplace. Buy and sell mobiles, bikes, furniture, fashion, jobs and services near you. Post a free ad, chat with local sellers, and find trusted deals in your city.";
export const DEFAULT_KEYWORDS =
  "Listo, classifieds India, buy and sell, local marketplace, post free ad, used mobiles, bikes, furniture, jobs near me, Bihar classifieds";

export function getSiteUrl() {
  const envUrl = String(import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return window.location.origin;
    }
  }

  return "https://listolisting.in";
}

export function absoluteUrl(path = "/") {
  const value = String(path || "/");
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${getSiteUrl()}${value.startsWith("/") ? value : `/${value}`}`;
}

export const DEFAULT_OG_IMAGE = "/listo-logo.png";

export const PRIVATE_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/profile",
  "/chat",
  "/wishlist",
  "/my-listings",
  "/add-product",
];

export const ROUTE_SEO = {
  "/": {
    title: "Listo | Local Classifieds to Buy & Sell Near You",
    description: DEFAULT_DESCRIPTION,
  },
  "/home": {
    title: "Listo | Local Classifieds to Buy & Sell Near You",
    description: DEFAULT_DESCRIPTION,
  },
  "/listings": {
    title: "Browse Listings | Listo Classifieds",
    description:
      "Search local classified ads on Listo. Filter by category, city, price and condition to find mobiles, vehicles, furniture, fashion, jobs and more near you.",
  },
  "/about": {
    title: "About Listo | Neighbourhood Marketplace",
    description:
      "Listo is a local classifieds platform from Bihar that helps people buy and sell close-to-heart items with verified neighbours across Indian cities and towns.",
  },
  "/contact": {
    title: "Contact Support | Listo",
    description:
      "Get help with your Listo account, listing or chat. Email support@listo.in for account issues, safety reports and marketplace questions.",
  },
  "/safety": {
    title: "Safety & Security Tips | Listo",
    description:
      "Stay safe on Listo: meet in public, inspect items before you pay, never share OTPs, and keep buyer-seller chat on the platform.",
  },
  "/terms": {
    title: "Terms of Use | Listo",
    description:
      "Read Listo's terms of use for posting listings, chatting with buyers and sellers, and using the classifieds marketplace lawfully.",
  },
  "/privacy": {
    title: "Privacy Policy | Listo",
    description:
      "Learn how Listo collects and uses account, listing and chat information to run a secure local classifieds marketplace. We do not sell your personal data.",
  },
  "/sitemap": {
    title: "Sitemap | Listo",
    description:
      "Browse every public Listo page: home, listings, categories, account, company information and social profiles.",
  },
  "/login": {
    title: "Login | Listo",
    description: "Sign in to Listo to post ads, chat with buyers and sellers, and manage your listings.",
    noIndex: true,
  },
  "/register": {
    title: "Create Account | Listo",
    description: "Register on Listo to post free classified ads and start buying and selling locally.",
    noIndex: true,
  },
  "/forgot-password": {
    title: "Forgot Password | Listo",
    description: "Reset your Listo account password.",
    noIndex: true,
  },
  "/reset-password": {
    title: "Reset Password | Listo",
    description: "Choose a new password for your Listo account.",
    noIndex: true,
  },
  "/profile": {
    title: "My Profile | Listo",
    description: "Update your Listo profile, photo, city and password.",
    noIndex: true,
  },
  "/wishlist": {
    title: "Wishlist | Listo",
    description: "Saved classified ads on Listo.",
    noIndex: true,
  },
  "/chat": {
    title: "Messages | Listo",
    description: "Chat with buyers and sellers on Listo.",
    noIndex: true,
  },
  "/my-listings": {
    title: "My Listings | Listo",
    description: "Manage the ads you posted on Listo.",
    noIndex: true,
  },
  "/add-product": {
    title: "Post an Ad | Listo",
    description: "Post a free classified ad on Listo. Add photos, price, location and category details.",
    noIndex: true,
  },
};
