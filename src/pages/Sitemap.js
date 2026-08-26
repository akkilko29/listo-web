import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCategories } from "../services/categoryService";
import {
  categoryPath,
  getPopularSeoLocations,
  locationPath,
  seoListingPath,
} from "../seo/seoPaths";
import { SOCIAL_LINKS, TRENDING_SEARCHES } from "../data/infoPages";
import { useAppLocation } from "../context/LocationContext";
import "../style/Sitemap.css";

function trendingHref(location, item, categories) {
  const match = (categories || []).find((category) => {
    const name = String(category.name || "").toLowerCase();
    return item.match.some((token) => name.includes(token));
  });

  if (match) {
    return seoListingPath({
      category: match,
      locationLabel: location,
    });
  }

  return seoListingPath({ locationLabel: location });
}

function SitemapSection({ title, children }) {
  return React.createElement(
    "section",
    { className: "sitemap-section" },
    React.createElement("h2", null, title),
    React.createElement("ul", { className: "sitemap-list" }, children)
  );
}

function SitemapLink({ to, children }) {
  return React.createElement(
    "li",
    null,
    React.createElement(Link, { to }, children)
  );
}

function Sitemap() {
  const { location } = useAppLocation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCategories = categories.filter((item) => item.active !== false);

  return React.createElement(
    "main",
    { className: "sitemap-page" },
    React.createElement(
      "div",
      { className: "sitemap-card" },
      React.createElement("h1", null, "Sitemap"),
      React.createElement(
        "p",
        { className: "sitemap-subtitle" },
        "Find every public page and listing path on Listo."
      ),

      React.createElement(
        "div",
        { className: "sitemap-grid" },

        React.createElement(
          SitemapSection,
          { title: "Discover" },
          React.createElement(SitemapLink, { to: "/" }, "Home"),
          React.createElement(SitemapLink, { to: "/listings" }, "All listings"),
          React.createElement(SitemapLink, { to: "/add-product" }, "Post a listing"),
          TRENDING_SEARCHES.map((item) =>
            React.createElement(
              SitemapLink,
              {
                key: item.label,
                to: trendingHref(location, item, categories),
              },
              item.label
            )
          )
        ),

        React.createElement(
          SitemapSection,
          { title: "Account" },
          React.createElement(SitemapLink, { to: "/login" }, "Login"),
          React.createElement(SitemapLink, { to: "/register" }, "Register"),
          React.createElement(SitemapLink, { to: "/forgot-password" }, "Forgot password"),
          React.createElement(SitemapLink, { to: "/profile" }, "My profile"),
          React.createElement(SitemapLink, { to: "/my-listings" }, "My listings"),
          React.createElement(SitemapLink, { to: "/wishlist" }, "Wishlist"),
          React.createElement(SitemapLink, { to: "/chat" }, "Messages")
        ),

        React.createElement(
          SitemapSection,
          { title: "Company" },
          React.createElement(SitemapLink, { to: "/about" }, "About Us"),
          React.createElement(SitemapLink, { to: "/contact" }, "Contact Support"),
          React.createElement(SitemapLink, { to: "/safety" }, "Safety & Security"),
          React.createElement(SitemapLink, { to: "/terms" }, "Terms of Use"),
          React.createElement(SitemapLink, { to: "/privacy" }, "Privacy Policy")
        ),

        React.createElement(
          SitemapSection,
          { title: "Social" },
          SOCIAL_LINKS.map((item) =>
            React.createElement(
              "li",
              { key: item.href },
              React.createElement(
                "a",
                {
                  href: item.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                item.label
              )
            )
          )
        )
      ),

      activeCategories.length > 0 &&
        React.createElement(
          SitemapSection,
          { title: "Categories" },
          activeCategories.map((category) =>
            React.createElement(
              SitemapLink,
              {
                key: category.id,
                to: categoryPath(category),
              },
              category.name
            )
          )
        ),

      React.createElement(
        SitemapSection,
        { title: "Locations" },
        getPopularSeoLocations().map((place) =>
          React.createElement(
            SitemapLink,
            {
              key: place.citySlug,
              to: locationPath(place.citySlug),
            },
            place.city
          )
        )
      )
    )
  );
}

export default Sitemap;
