import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../services/productService";
import "../style/TrendingClassifieds.css";

function TrendingClassifieds() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((products) => {
        if (!cancelled) {
          setListings(products.slice(0, 8));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load listings");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return React.createElement(
    "section",
    { className: "trending-section" },

    React.createElement(
      "div",
      { className: "home-section-container" },

      React.createElement(
        "div",
        { className: "trending-header" },

        React.createElement(
          "h2",
          { className: "home-section-title" },
          "Trending Classifieds"
        ),

        React.createElement(
          "button",
          {
            type: "button",
            className: "view-listings-button",
            onClick: () => navigate("/listings"),
          },
          "View All Listings"
        )
      ),

      loading &&
        React.createElement(
          "p",
          { className: "listings-status" },
          "Loading listings..."
        ),

      error &&
        React.createElement(
          "p",
          { className: "listings-status listings-error" },
          error
        ),

      !loading && !error && listings.length === 0 &&
        React.createElement(
          "p",
          { className: "listings-status" },
          "No listings available yet."
        ),

      !loading && !error && listings.length > 0 &&
        React.createElement(
          "div",
          { className: "classifieds-grid" },

          listings.map((listing) =>
            React.createElement(
              "article",
              {
                key: listing.id,
                className: "classified-card",
                onClick: () => navigate(`/product/${listing.id}`),
              },

              React.createElement(
                "div",
                { className: "classified-image-wrapper" },

                listing.image
                  ? React.createElement("img", {
                      src: listing.image,
                      alt: listing.title,
                      className: "classified-image",
                    })
                  : React.createElement(
                      "div",
                      { className: "classified-image classified-image-empty" },
                      React.createElement("i", {
                        className: "fa-regular fa-image",
                      })
                    ),

                listing.featured &&
                  React.createElement(
                    "span",
                    { className: "featured-badge" },
                    "FEATURED"
                  ),

                listing.sold &&
                  React.createElement(
                    "span",
                    { className: "sold-badge" },
                    "SOLD"
                  )
              ),

              React.createElement(
                "div",
                { className: "classified-content" },

                React.createElement(
                  "div",
                  { className: "classified-price" },
                  listing.price
                ),

                React.createElement("h3", null, listing.title),

                React.createElement(
                  "div",
                  { className: "classified-meta" },

                  React.createElement(
                    "span",
                    null,
                    React.createElement("i", {
                      className: "fa-solid fa-location-dot",
                    }),
                    listing.location || "India"
                  ),

                  React.createElement("span", null, listing.time)
                )
              )
            )
          )
        )
    )
  );
}

export default TrendingClassifieds;
