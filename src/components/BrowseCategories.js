import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppLocation } from "../context/LocationContext";
import { getCategories } from "../services/categoryService";
import { seoListingPath } from "../seo/seoPaths";
import { UI_CONFIG } from "../config/uiConfig";
import { withCategoryMeta } from "../utils/categoryMeta";

import "../style/BrowseCategories.css";

function BrowseCategories() {
  const navigate = useNavigate();
  const { location } = useAppLocation();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getCategories();

        if (!cancelled) {
          setCategories(data.map(withCategoryMeta));
        }
      } catch (loadError) {
        console.error("Failed to load categories:", loadError);

        if (!cancelled) {
          setError("Unable to load categories.");
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const openCategory = (category) => {
    navigate(
      seoListingPath({
        category,
        locationLabel: location,
      })
    );
  };

  // Limit the number of categories shown on the home page
  const visibleCategories = categories.slice(
    0,
    UI_CONFIG.browseMaxCategories
  );

  return React.createElement(
    "section",
    {
      className: "browse-categories-section",
    },

    React.createElement(
      "div",
      {
        className: "home-section-container",
      },

      React.createElement(
        "h2",
        {
          className: "home-section-title",
        },
        "Browse Categories"
      ),

      // Loading state
      loading
        ? React.createElement(
            "div",
            {
              className: "browse-categories-status",
            },
            "Loading categories..."
          )

        // Error state
        : error
          ? React.createElement(
              "div",
              {
                className: "browse-categories-status error",
              },
              error
            )

          // Categories
          : React.createElement(
              "div",
              {
                className: "browse-categories-grid",
              },

              visibleCategories.length > 0
                ? visibleCategories.map((category) =>
                    React.createElement(
                      "button",
                      {
                        key: category.id,
                        type: "button",
                        className: `browse-category-item ${category.theme || ""}`,
                        onClick: () => openCategory(category),
                      },

                      React.createElement(
                        "span",
                        {
                          className: "browse-category-icon",
                        },

                        React.createElement("i", {
                          className: category.icon || "fa-solid fa-tag",
                        })
                      ),

                      React.createElement(
                        "span",
                        {
                          className: "browse-category-name",
                        },
                        category.name
                      )
                    )
                  )
                : React.createElement(
                    "div",
                    {
                      className: "browse-categories-status",
                    },
                    "No categories available."
                  )
            )
    )
  );
}

export default BrowseCategories;