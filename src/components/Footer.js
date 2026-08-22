import React from "react";
import logo from "../assets/listo_logo.png";

function Footer() {
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
          "a",
          {
            href: "/",
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

      /* =========================
         POPULAR CATEGORIES
      ========================= */

      React.createElement(
        "div",
        { className: "footer-column" },

        React.createElement(
          "h3",
          null,
          "POPULAR CATEGORIES"
        ),

        React.createElement(
          "a",
          { href: "#cars" },
          "Cars & Vehicles"
        ),

        React.createElement(
          "a",
          { href: "#smartphones" },
          "Smartphones & Tabs"
        ),

        React.createElement(
          "a",
          { href: "#real-estate" },
          "Real Estate"
        ),

        React.createElement(
          "a",
          { href: "#laptops" },
          "Laptops & Tech"
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

        React.createElement(
          "a",
          { href: "#bikes" },
          "Bikes & Scooters"
        ),

        React.createElement(
          "a",
          { href: "#furniture" },
          "Home Furniture"
        ),

        React.createElement(
          "a",
          { href: "#fashion" },
          "Fashion & Apparel"
        ),

        React.createElement(
          "a",
          { href: "#jobs" },
          "Jobs & Services"
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

        React.createElement(
          "a",
          { href: "#support" },
          "Contact Support"
        ),

        React.createElement(
          "a",
          { href: "#safety" },
          "Safety & Security"
        ),

        React.createElement(
          "a",
          { href: "#terms" },
          "Terms of Use"
        ),

        React.createElement(
          "a",
          { href: "#privacy" },
          "Privacy Policy"
        )
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
            href: "#facebook",
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
            href: "#x",
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
            href: "#linkedin",
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
            href: "#instagram",
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