import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCategories,
  getCategoryAttributes,
  getSubcategoriesByCategory,
  getSubcategoryAttributes,
} from "../services/categoryService";
import {
  ALL_CATEGORIES_ITEM,
  withCategoryMeta,
} from "../utils/categoryMeta";
import { appendLocationParam, useAppLocation } from "../context/LocationContext";

function MegaMenuBar() {
  const navigate = useNavigate();
  const { location } = useAppLocation();
  const menuRef = useRef(null);
  const categoryRequestId = useRef(0);
  const subcategoryRequestId = useRef(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES_ITEM);
  const [subcategories, setSubcategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const menuCategories = [ALL_CATEGORIES_ITEM, ...categories];

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");

      try {
        const data = await getCategories();

        if (cancelled) {
          return;
        }

        setCategories(data.map(withCategoryMeta));
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCategoriesError("Unable to load categories.");
        setCategories([]);
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const loadCategoryDetails = async (category) => {
    if (!category || category.id === ALL_CATEGORIES_ITEM.id) {
      setSubcategories([]);
      setAttributes([]);
      setSelectedSubCategory(null);
      setDetailsError("");
      setDetailsLoading(false);
      return;
    }

    const requestId = categoryRequestId.current + 1;
    categoryRequestId.current = requestId;
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedSubCategory(null);

    try {
      const [nextSubcategories, nextAttributes] = await Promise.all([
        getSubcategoriesByCategory(category.id),
        getCategoryAttributes(category.id),
      ]);

      if (requestId !== categoryRequestId.current) {
        return;
      }

      setSubcategories(
        nextSubcategories.filter((item) => item.active !== false)
      );
      setAttributes(nextAttributes.filter((item) => item.active !== false));
    } catch (error) {
      if (requestId !== categoryRequestId.current) {
        return;
      }

      setDetailsError("Unable to load category details.");
      setSubcategories([]);
      setAttributes([]);
    } finally {
      if (requestId === categoryRequestId.current) {
        setDetailsLoading(false);
      }
    }
  };

  const loadSubcategoryAttributes = async (category, subCategory) => {
    if (!category || !subCategory) {
      return;
    }

    const requestId = subcategoryRequestId.current + 1;
    subcategoryRequestId.current = requestId;

    try {
      const nextAttributes = await getSubcategoryAttributes(
        category.id,
        subCategory.id
      );

      if (requestId !== subcategoryRequestId.current) {
        return;
      }

      setAttributes(nextAttributes.filter((item) => item.active !== false));
    } catch (error) {
      if (requestId !== subcategoryRequestId.current) {
        return;
      }
    }
  };

  const selectCategory = (category, { openMenu = true } = {}) => {
    setActiveCategory(category);

    if (openMenu) {
      setMenuOpen(true);
    }

    loadCategoryDetails(category);
  };

  const handleCategoryClick = (category) => {
    if (category.id === ALL_CATEGORIES_ITEM.id) {
      const nextOpen = !menuOpen;
      setActiveCategory(category);
      setMenuOpen(nextOpen);

      if (nextOpen) {
        loadCategoryDetails(category);
      }

      return;
    }

    selectCategory(category);
  };

  const goToListings = (category, subCategory) => {
    const params = new URLSearchParams();

    if (category && category.id !== ALL_CATEGORIES_ITEM.id) {
      params.set("category", category.name);
      params.set("categoryId", String(category.id));
    }

    if (subCategory) {
      params.set("subcategory", subCategory.name);
      params.set("subCategoryId", String(subCategory.id));
    }

    appendLocationParam(params, location);
    setMenuOpen(false);
    navigate(`/listings?${params.toString()}`);
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    loadSubcategoryAttributes(activeCategory, subCategory);
    goToListings(activeCategory, subCategory);
  };

  const handleAttributeClick = (attribute) => {
    const params = new URLSearchParams();

    if (activeCategory.id !== ALL_CATEGORIES_ITEM.id) {
      params.set("category", activeCategory.name);
      params.set("categoryId", String(activeCategory.id));
    }

    if (selectedSubCategory) {
      params.set("subcategory", selectedSubCategory.name);
      params.set("subCategoryId", String(selectedSubCategory.id));
    }

    params.set("attribute", attribute.slug || attribute.name);
    params.set("attributeId", String(attribute.id));
    appendLocationParam(params, location);

    setMenuOpen(false);
    navigate(`/listings?${params.toString()}`);
  };

  return React.createElement(
    "nav",
    {
      className: "mega-menu-bar",
      ref: menuRef,
    },

    React.createElement(
      "div",
      { className: "mega-menu-container" },

      categoriesLoading
        ? React.createElement(
            "span",
            { className: "mega-menu-loading" },
            "Loading categories..."
          )
        : categoriesError
          ? React.createElement(
              "span",
              { className: "mega-menu-error" },
              categoriesError
            )
          : menuCategories.map((category) =>
              React.createElement(
                "button",
                {
                  key: category.id,
                  type: "button",
                  className: `mega-menu-item ${
                    activeCategory.id === category.id ? "active" : ""
                  }`,
                  onClick: () => handleCategoryClick(category),
                  onMouseEnter: () => {
                    if (
                      menuOpen &&
                      category.id !== ALL_CATEGORIES_ITEM.id
                    ) {
                      selectCategory(category);
                    }
                  },
                },

                React.createElement("i", {
                  className: category.icon,
                }),

                React.createElement("span", null, category.name),

                category.id === ALL_CATEGORIES_ITEM.id &&
                  React.createElement("i", {
                    className: `fa-solid ${
                      menuOpen ? "fa-chevron-up" : "fa-chevron-down"
                    } all-category-arrow`,
                  })
              )
            )
    ),

    menuOpen &&
      React.createElement(
        "div",
        { className: "mega-dropdown" },

        React.createElement(
          "div",
          { className: "mega-sidebar" },

          React.createElement(
            "div",
            { className: "mega-sidebar-title" },
            "Categories"
          ),

          categories.map((category) =>
            React.createElement(
              "button",
              {
                key: category.id,
                type: "button",
                className: `mega-sidebar-item ${
                  activeCategory.id === category.id ? "selected" : ""
                }`,
                onMouseEnter: () => selectCategory(category),
                onClick: () => selectCategory(category),
              },

              React.createElement("i", {
                className: category.icon,
              }),

              React.createElement("span", null, category.name),

              React.createElement("i", {
                className: "fa-solid fa-chevron-right",
              })
            )
          )
        ),

        React.createElement(
          "div",
          { className: "mega-content" },

          React.createElement(
            "div",
            { className: "mega-content-header" },

            React.createElement(
              "div",
              null,

              React.createElement("h3", null, activeCategory.name),

              React.createElement(
                "p",
                null,
                activeCategory.description ||
                  `Explore ${activeCategory.name.toLowerCase()} listings`
              )
            ),

            activeCategory.id !== ALL_CATEGORIES_ITEM.id &&
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "view-all-button",
                  onClick: () => goToListings(activeCategory),
                },
                "View All"
              )
          ),

          detailsLoading
            ? React.createElement(
                "div",
                { className: "mega-status" },
                "Loading..."
              )
            : detailsError
              ? React.createElement(
                  "div",
                  { className: "mega-status mega-status-error" },
                  detailsError
                )
              : React.createElement(
                  React.Fragment,
                  null,

                  React.createElement(
                    "div",
                    { className: "mega-subcategories" },

                    activeCategory.id === ALL_CATEGORIES_ITEM.id
                      ? React.createElement(
                          "div",
                          { className: "mega-all-categories" },

                          React.createElement("i", {
                            className: "fa-solid fa-layer-group",
                          }),

                          React.createElement(
                            "div",
                            null,

                            React.createElement(
                              "strong",
                              null,
                              "Browse All Categories"
                            ),

                            React.createElement(
                              "p",
                              null,
                              "Hover a category to see its subcategories and filters."
                            )
                          )
                        )
                      : subcategories.length > 0
                        ? subcategories.map((subCategory) =>
                            React.createElement(
                              "button",
                              {
                                key: subCategory.id,
                                type: "button",
                                className: `mega-subcategory ${
                                  selectedSubCategory &&
                                  selectedSubCategory.id === subCategory.id
                                    ? "selected"
                                    : ""
                                }`,
                                onMouseEnter: () => {
                                  setSelectedSubCategory(subCategory);
                                  loadSubcategoryAttributes(
                                    activeCategory,
                                    subCategory
                                  );
                                },
                                onClick: () =>
                                  handleSubCategoryClick(subCategory),
                              },

                              React.createElement(
                                "span",
                                null,
                                subCategory.name
                              ),

                              React.createElement("i", {
                                className: "fa-solid fa-chevron-right",
                              })
                            )
                          )
                        : React.createElement(
                            "div",
                            { className: "mega-status" },
                            "No subcategories found."
                          )
                  ),

                  attributes.length > 0 &&
                    React.createElement(
                      "div",
                      { className: "mega-attributes" },

                      React.createElement(
                        "div",
                        { className: "mega-attributes-title" },
                        selectedSubCategory
                          ? `${selectedSubCategory.name} filters`
                          : "Filters"
                      ),

                      React.createElement(
                        "div",
                        { className: "mega-attributes-list" },

                        attributes.map((attribute) =>
                          React.createElement(
                            "button",
                            {
                              key: attribute.id,
                              type: "button",
                              className: "mega-attribute-chip",
                              onClick: () => handleAttributeClick(attribute),
                            },
                            attribute.name,
                            attribute.required
                              ? React.createElement(
                                  "span",
                                  { className: "mega-attribute-required" },
                                  "*"
                                )
                              : null
                          )
                        )
                      )
                    )
                )
        )
      )
  );
}

export default MegaMenuBar;
