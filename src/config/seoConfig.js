export const SITE_NAME = "LISTO";
export const SITE_URL = "https://listolisting.in";
export const SITE_TAGLINE = "Buy & Sell Products Near You | Free Classifieds";

export const HOME_TITLE =
  "LISTO - Buy & Sell Products Near You | Free Classifieds";

export const HOME_DESCRIPTION =
  "Buy and sell mobiles, bikes, cars, furniture, electronics, fashion and more on LISTO. Post your ad for free and connect with local buyers and sellers near you.";

export const HOME_OG_DESCRIPTION =
  "Buy and sell products locally on LISTO. Post your ad for free and connect with buyers and sellers near you.";

export const DEFAULT_DESCRIPTION = HOME_DESCRIPTION;

export const DEFAULT_KEYWORDS =
  "LISTO, free classifieds, buy and sell, local marketplace, mobiles, bikes, cars, furniture, electronics, fashion, jobs, services";

export function getSiteUrl() {
  const envUrl = String(import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
  if (envUrl) {
    return envUrl;
  }

  return SITE_URL;
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
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    ogTitle: HOME_TITLE,
    ogDescription: HOME_OG_DESCRIPTION,
  },
  "/home": {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    ogTitle: HOME_TITLE,
    ogDescription: HOME_OG_DESCRIPTION,
  },
  "/listings": {
    title: "Browse Listings | LISTO",
    description:
      "Search local classified ads on LISTO. Filter by category, city, price and condition to find mobiles, bikes, cars, furniture, electronics, fashion, jobs and more near you.",
  },
  "/about": {
    title: "About LISTO | Local Marketplace",
    description:
      "LISTO is an India-wide local classifieds marketplace where people buy and sell mobiles, bikes, cars, furniture, electronics, fashion and more near them.",
  },
  "/contact": {
    title: "Contact Support | LISTO",
    description:
      "Get help with your LISTO account, listing or chat. Email support@listolisting.in for account issues, safety reports and marketplace questions.",
  },
  "/safety": {
    title: "Safety & Security Tips | LISTO",
    description:
      "Stay safe on LISTO: meet in public, inspect items before you pay, never share OTPs, and keep buyer-seller chat on the platform.",
  },
  "/terms": {
    title: "Terms of Use | LISTO",
    description:
      "Read LISTO's terms of use for posting listings, chatting with buyers and sellers, and using the classifieds marketplace lawfully.",
  },
  "/privacy": {
    title: "Privacy Policy | LISTO",
    description:
      "Learn how LISTO collects and uses account, listing and chat information to run a secure local classifieds marketplace. We do not sell your personal data.",
  },
  "/sitemap": {
    title: "Sitemap | LISTO",
    description:
      "Browse every public LISTO page: home, listings, categories, account, company information and social profiles.",
  },
  "/login": {
    title: "Login | LISTO",
    description: "Sign in to LISTO to post ads, chat with buyers and sellers, and manage your listings.",
    noIndex: true,
  },
  "/register": {
    title: "Create Account | LISTO",
    description: "Register on LISTO to post free classified ads and start buying and selling locally.",
    noIndex: true,
  },
  "/forgot-password": {
    title: "Forgot Password | LISTO",
    description: "Reset your LISTO account password.",
    noIndex: true,
  },
  "/reset-password": {
    title: "Reset Password | LISTO",
    description: "Choose a new password for your LISTO account.",
    noIndex: true,
  },
  "/profile": {
    title: "My Profile | LISTO",
    description: "Update your LISTO profile, photo, city and password.",
    noIndex: true,
  },
  "/wishlist": {
    title: "Wishlist | LISTO",
    description: "Saved classified ads on LISTO.",
    noIndex: true,
  },
  "/chat": {
    title: "Messages | LISTO",
    description: "Chat with buyers and sellers on LISTO.",
    noIndex: true,
  },
  "/my-listings": {
    title: "My Listings | LISTO",
    description: "Manage the ads you posted on LISTO.",
    noIndex: true,
  },
  "/add-product": {
    title: "Post an Ad | LISTO",
    description: "Post a free classified ad on LISTO. Add photos, price, location and category details.",
    noIndex: true,
  },
};
