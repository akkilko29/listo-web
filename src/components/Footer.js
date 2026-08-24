import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/listo_logo.png";
import { listingsHref, useAppLocation } from "../context/LocationContext";
import { TRENDING_SEARCHES } from "../data/infoPages";
import { UI_CONFIG } from "../config/uiConfig";
import { getCategories } from "../services/categoryService";
import { limitCategories } from "../utils/categoryMeta";

function trendingHref(location, item, categories) {
  const match = (categories || []).find((category) => {
    const name = String(category.name || "").toLowerCase();
    return item.match.some((token) => name.includes(token));
  });

  if (match) {
    return listingsHref(location, {
      category: match.name,
      categoryId: String(match.id),
    });
  }

  return listingsHref(location, { keyword: item.keyword });
}

function Footer() {
  const { location } = useAppLocation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const data = await getCategories();

        if (!cancelled) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setCategories([]);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const popularCategories = limitCategories(
    categories,
    UI_CONFIG.footerMaxCategories
  );
  return React.createElement(
    "footer",
    { className: "footer" },

    /* =========================
       FOOTER MAIN
    ========================= */

    React.createElement(
      "div",
      { className: "footer-main" },

      /* =========================
         BRAND
      ========================= */

      React.createElement(
        "div",
        { className: "footer-brand" },

        React.createElement(
          Link,
          {
            to: "/",
            className: "footer-logo",
          },

          React.createElement("img", {
            src: logo,
            alt: "Listo",
            className: "footer-logo-image",
          }),

          React.createElement(
            "span",
            null,
            "Listo"
          )
        ),

        React.createElement(
          "p",
          null,

          "India's most trusted online classifieds platform",

          React.createElement("br"),

          "to buy & sell close-to-heart items with verified",

          React.createElement("br"),

          "local neighbors."
        )
      ),

      UI_CONFIG.showFooterCategories &&
        React.createElement(
          "div",
          { className: "footer-column" },

          React.createElement("h3", null, "POPULAR CATEGORIES"),

          popularCategories.map((category) =>
            React.createElement(
              Link,
              {
                key: category.id,
                to: listingsHref(location, {
                  category: category.name,
                  categoryId: String(category.id),
                }),
              },
              category.name
            )
          )
        ),

      /* =========================
         TRENDING SEARCHES
      ========================= */

      React.createElement(
        "div",
        { className: "footer-column" },

        React.createElement(
          "h3",
          null,
          "TRENDING SEARCHES"
        ),

        TRENDING_SEARCHES.map((item) =>
          React.createElement(
            Link,
            {
              key: item.label,
              to: trendingHref(location, item, categories),
            },
            item.label
          )
        )
      ),

      /* =========================
         ABOUT US
      ========================= */

      React.createElement(
        "div",
        { className: "footer-column" },

        React.createElement(
          "h3",
          null,
          "ABOUT US"
        ),

        React.createElement(Link, { to: "/about" }, "About Us"),
        React.createElement(Link, { to: "/contact" }, "Contact Support"),
        React.createElement(Link, { to: "/safety" }, "Safety & Security"),
        React.createElement(Link, { to: "/terms" }, "Terms of Use"),
        React.createElement(Link, { to: "/privacy" }, "Privacy Policy")
      )
    ),

    /* =========================
       FOOTER BOTTOM
    ========================= */

    React.createElement(
      "div",
      { className: "footer-bottom" },

      /* Copyright */

      React.createElement(
        "span",
        null,

        "© " + new Date().getFullYear() + " Listo. ",

        React.createElement("i", {
          className: "fa-solid fa-heart made-bihar-heart",
        }),

        " Made in Bihar. All rights reserved.",

        React.createElement("i", {
          className: "fa-solid fa-lock",
        }),

        " End-to-End Encrypted"
      ),

      /* Social Icons */

      React.createElement(
        "div",
        { className: "footer-social" },

        /* Facebook */

        React.createElement(
          "a",
          {
            href: "https://www.facebook.com/people/Listo-Listing/61593867205987/",
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": "Facebook",
          },

          React.createElement("i", {
            className: "fa-brands fa-facebook-f",
          })
        ),

        /* X */

        React.createElement(
          "a",
          {
            href: "https://x.com/listolisting",
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": "X",
          },

          React.createElement("i", {
            className: "fa-brands fa-x-twitter",
          })
        ),

        /* LinkedIn */

        React.createElement(
          "a",
          {
            href: "https://www.linkedin.com/company/listo-listing/",
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": "LinkedIn",
          },

          React.createElement("i", {
            className: "fa-brands fa-linkedin-in",
          })
        ),

        /* Instagram */

        React.createElement(
          "a",
          {
            href: "https://www.instagram.com/listolisting/",
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": "Instagram",
          },

          React.createElement("i", {
            className: "fa-brands fa-instagram",
          })
        )
      )
    )
  );
}

export default Footer;