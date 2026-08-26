import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppLocation } from "../context/LocationContext";
import { UI_CONFIG } from "../config/uiConfig";
import { getCategories } from "../services/categoryService";
import { seoListingPath } from "../seo/seoPaths";
import { limitCategories, withCategoryMeta } from "../utils/categoryMeta";

function HeroSection() {
  const navigate = useNavigate();
  const { location } = useAppLocation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const data = await getCategories();

        if (!cancelled) {
          setCategories(data.map(withCategoryMeta));
        }
      } catch (error) {
        if (!cancelled) {
          setCategories([]);
        }
      }
    };

    if (UI_CONFIG.showHeroCategories) {
      loadCategories();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCategories = limitCategories(
    categories,
    UI_CONFIG.heroMaxCategories
  );

  const openCategory = (category) => {
    navigate(
      seoListingPath({
        category,
        locationLabel: location,
      })
    );
  };

  return React.createElement(
    "section",
    { className: "hero-section" },

    React.createElement("div", { className: "hero-overlay" }),

    React.createElement(
      "div",
      { className: "hero-content" },

      React.createElement("h1", null, "Buy & Sell Products Near You"),

      React.createElement(
        "p",
        null,
        "A local marketplace to post free ads and connect with buyers and sellers near you"
      ),

      UI_CONFIG.showHeroCategories &&
        visibleCategories.length > 0 &&
        React.createElement(
          "div",
          { className: "hero-categories" },

          visibleCategories.map((category) =>
            React.createElement(
              "button",
              {
                key: category.id,
                type: "button",
                className: "hero-category",
                onClick: () => openCategory(category),
              },

              React.createElement("i", {
                className: category.icon,
              }),

              React.createElement("span", null, category.name)
            )
          )
        )
    )
  );
}

export default HeroSection;
