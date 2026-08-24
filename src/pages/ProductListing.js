import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  filterProductsPage,
  fromApiCondition,
  toApiCondition,
} from "../services/productService";
import {
  getCategories,
  getCategoryAttributes,
  getSubcategoriesByCategory,
  getSubcategoryAttributes,
} from "../services/categoryService";
import { isFavorite, ensureFavoritesLoaded, toggleFavorite } from "../services/favoriteService";
import { useAuth } from "../context/AuthContext";
import { appendLocationParam, useAppLocation } from "../context/LocationContext";
import { POPULAR_LOCATIONS } from "../data/popularLocations";
import "../style/ProductListing.css";

const PAGE_SIZE = 10;

const RESERVED_PARAMS = new Set([
  "keyword",
  "category",
  "categoryId",
  "subcategory",
  "subCategoryId",
  "location",
  "minPrice",
  "maxPrice",
  "condition",
  "sort",
  "page",
  "size",
  "attribute",
  "attributeId",
  "attributeValue",
]);

function getAttributeQuery(searchParams) {
  const attributes = {};

  searchParams.forEach((value, key) => {
    if (!RESERVED_PARAMS.has(key) && String(value).trim()) {
      attributes[key] = value;
    }
  });

  const legacySlug = searchParams.get("attribute");
  const legacyValue = searchParams.get("attributeValue");

  if (legacySlug && legacyValue && !attributes[legacySlug]) {
    attributes[legacySlug] = legacyValue;
  }

  return attributes;
}

function attributeInputType(dataType) {
  const type = String(dataType || "TEXT").toUpperCase();

  if (type === "NUMBER" || type === "DECIMAL" || type === "INTEGER") {
    return "number";
  }

  return "text";
}

function ProductListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { location: globalLocation, setLocation } = useAppLocation();

  const category = searchParams.get("category") || "All Categories";
  const subcategory = searchParams.get("subcategory");
  const categoryId = searchParams.get("categoryId") || "";
  const subCategoryId = searchParams.get("subCategoryId") || "";
  const keyword = searchParams.get("keyword") || "";
  const urlLocation = searchParams.get("location") || "";
  const locationParam = urlLocation || globalLocation || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const conditionParam = searchParams.get("condition") || "";
  const pageNumber = Math.max(1, Number(searchParams.get("page")) || 1);
  const appliedAttributes = getAttributeQuery(searchParams);

  const hydratedLocation = useRef(false);
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistTick, setWishlistTick] = useState(0);
  const [favoritePending, setFavoritePending] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filterAttributes, setFilterAttributes] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [sortBy, setSortBy] = useState("Date Published: Newest");
  const [filters, setFilters] = useState({
    keyword,
    categoryId,
    categoryName: category === "All Categories" ? "" : category,
    subCategoryId,
    subCategoryName: subcategory || "",
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    location: locationParam,
    condition: fromApiCondition(conditionParam),
    attributes: appliedAttributes,
  });

  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data.filter((item) => item.active !== false));
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

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    ensureFavoritesLoaded().then(() => {
      if (!cancelled) {
        setWishlistTick((value) => value + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (hydratedLocation.current) {
      return;
    }

    hydratedLocation.current = true;
    const nextLocation = searchParams.get("location") || "";
    if (nextLocation && nextLocation !== globalLocation) {
      setLocation(nextLocation);
    }
  }, [globalLocation, searchParams, setLocation]);

  useEffect(() => {
    setFilters((previous) => ({
      ...previous,
      keyword,
      categoryId,
      categoryName: category === "All Categories" ? "" : category,
      subCategoryId,
      subCategoryName: subcategory || "",
      location: locationParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      condition: fromApiCondition(conditionParam),
      attributes: appliedAttributes,
    }));
  }, [
    keyword,
    category,
    categoryId,
    subcategory,
    subCategoryId,
    locationParam,
    minPriceParam,
    maxPriceParam,
    conditionParam,
    searchParams,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (!filters.categoryId) {
      setSubcategories([]);
      return undefined;
    }

    getSubcategoriesByCategory(filters.categoryId)
      .then((data) => {
        if (!cancelled) {
          setSubcategories(data.filter((item) => item.active !== false));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSubcategories([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters.categoryId]);

  useEffect(() => {
    let cancelled = false;

    if (!filters.categoryId) {
      setFilterAttributes([]);
      return undefined;
    }

    const loader = filters.subCategoryId
      ? getSubcategoryAttributes(filters.categoryId, filters.subCategoryId)
      : getCategoryAttributes(filters.categoryId);

    loader
      .then((data) => {
        if (cancelled) {
          return;
        }

        setFilterAttributes(
          data
            .filter((item) => item.active !== false && item.filterable !== false)
            .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setFilterAttributes([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters.categoryId, filters.subCategoryId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    filterProductsPage({
      keyword,
      categoryId,
      subCategoryId,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      location: locationParam,
      condition: conditionParam,
      sort: sortBy,
      page: pageNumber - 1,
      size: PAGE_SIZE,
      attributes: appliedAttributes,
    })
      .then((page) => {
        if (!cancelled) {
          setProducts(page.products);
          setTotalElements(page.totalElements);
          setTotalPages(page.totalPages);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load products");
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
  }, [
    keyword,
    categoryId,
    subCategoryId,
    minPriceParam,
    maxPriceParam,
    locationParam,
    globalLocation,
    conditionParam,
    searchParams,
    sortBy,
    pageNumber,
  ]);

  useEffect(() => {
    if (!filtersOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLocationFilterChange = (value) => {
    handleFilterChange("location", value);

    const complete =
      !value ||
      POPULAR_LOCATIONS.includes(value) ||
      /^[^,]+,\s*[^,]+/.test(value);

    if (complete) {
      setLocation(value);
    }
  };

  const handleCategoryChange = (event) => {
    const nextId = event.target.value;
    const selected = categories.find((item) => String(item.id) === String(nextId));

    setFilters((previous) => ({
      ...previous,
      categoryId: nextId,
      categoryName: selected?.name || "",
      subCategoryId: "",
      subCategoryName: "",
      attributes: {},
    }));
  };

  const handleSubcategoryChange = (event) => {
    const nextId = event.target.value;
    const selected = subcategories.find(
      (item) => String(item.id) === String(nextId)
    );

    setFilters((previous) => ({
      ...previous,
      subCategoryId: nextId,
      subCategoryName: selected?.name || "",
      attributes: {},
    }));
  };

  const handleAttributeChange = (slug, value) => {
    setFilters((previous) => ({
      ...previous,
      attributes: {
        ...previous.attributes,
        [slug]: value,
      },
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.keyword) {
      params.set("keyword", filters.keyword);
    }

    if (filters.categoryId) {
      params.set("categoryId", filters.categoryId);
      params.set("category", filters.categoryName);
    }

    if (filters.subCategoryId) {
      params.set("subCategoryId", filters.subCategoryId);
      params.set("subcategory", filters.subCategoryName);
    }

    if (filters.location) {
      params.set("location", filters.location);
      setLocation(filters.location);
    } else {
      setLocation("");
    }

    if (filters.minPrice) {
      params.set("minPrice", filters.minPrice);
    }

    if (filters.maxPrice) {
      params.set("maxPrice", filters.maxPrice);
    }

    const condition = toApiCondition(filters.condition);
    if (condition) {
      params.set("condition", condition);
    }

    Object.entries(filters.attributes || {}).forEach(([slug, value]) => {
      if (String(value || "").trim()) {
        params.set(slug, String(value).trim());
      }
    });

    navigate(`/listings?${params.toString()}`);
    setFiltersOpen(false);
  };

  const goToPage = (nextPage) => {
    const params = new URLSearchParams(searchParams);

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    navigate(`/listings?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      categoryId: "",
      categoryName: "",
      subCategoryId: "",
      subCategoryName: "",
      minPrice: "",
      maxPrice: "",
      location: globalLocation || "",
      condition: "Any",
      attributes: {},
    });
    const params = new URLSearchParams();
    appendLocationParam(params, globalLocation);
    navigate(params.toString() ? `/listings?${params.toString()}` : "/listings");
  };

  const handleHeartClick = async (event, productId) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (favoritePending) {
      return;
    }

    setFavoritePending(String(productId));

    try {
      await toggleFavorite(productId);
      setWishlistTick((value) => value + 1);
    } catch {
      /* keep current heart state */
    } finally {
      setFavoritePending("");
    }
  };

  const heading = keyword
    ? `Results for "${keyword}"`
    : subcategory || category;

  const appliedFilterCount = [
    keyword,
    categoryId,
    subCategoryId,
    minPriceParam,
    maxPriceParam,
    locationParam,
    conditionParam,
    ...Object.keys(appliedAttributes),
  ].filter(Boolean).length;

  return React.createElement(
    "div",
    { className: "product-listing-page" },

    React.createElement(
      "div",
      { className: "listing-breadcrumb" },

      React.createElement("span", { onClick: () => navigate("/"), style: { cursor: "pointer" } }, "Home"),

      React.createElement("i", {
        className: "fa-solid fa-chevron-right",
      }),

      React.createElement("strong", null, heading)
    ),

    React.createElement(
      "div",
      { className: "listing-top-bar" },

      React.createElement(
        "div",
        { className: "active-filters" },

        React.createElement(
          "span",
          { className: "active-filter-label" },
          `${totalElements} listings`
        ),

        keyword &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            `Search: ${keyword}`
          ),

        categoryId &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            category
          ),

        subCategoryId &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            subcategory
          ),

        Object.entries(appliedAttributes).map(([slug, value]) =>
          React.createElement(
            "span",
            { key: slug, className: "filter-chip" },
            `${
              filterAttributes.find((item) => item.slug === slug)?.name || slug
            }: ${value}`
          )
        ),

        locationParam &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            `Location: ${locationParam}`
          )
      ),

      React.createElement(
        "div",
        { className: "listing-toolbar" },

        React.createElement(
          "button",
          {
            type: "button",
            className: "filter-open-button",
            onClick: () => {
              setFilters({
                keyword,
                categoryId,
                categoryName: category === "All Categories" ? "" : category,
                subCategoryId,
                subCategoryName: subcategory || "",
                minPrice: minPriceParam,
                maxPrice: maxPriceParam,
                location: locationParam,
                condition: fromApiCondition(conditionParam),
                attributes: appliedAttributes,
              });
              setFiltersOpen(true);
            },
          },
          React.createElement("i", { className: "fa-solid fa-sliders" }),
          "Filters",
          appliedFilterCount > 0 &&
            React.createElement(
              "span",
              { className: "filter-count-badge" },
              appliedFilterCount
            )
        ),

        React.createElement(
          "div",
          { className: "sort-wrapper" },

          React.createElement("span", null, "Sort by:"),

          React.createElement(
            "select",
            {
              value: sortBy,
              onChange: (event) => setSortBy(event.target.value),
            },

            React.createElement("option", null, "Date Published: Newest"),
            React.createElement("option", null, "Date Published: Oldest"),
            React.createElement("option", null, "Price: Low to High"),
            React.createElement("option", null, "Price: High to Low")
          )
        )
      )
    ),

    filtersOpen &&
      React.createElement(
        "div",
        {
          className: "filter-modal-backdrop",
          onClick: () => setFiltersOpen(false),
        },

        React.createElement(
          "div",
          {
            className: "filter-modal",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "listing-filter-title",
            onClick: (event) => event.stopPropagation(),
          },

          React.createElement(
            "div",
            { className: "filter-header" },

            React.createElement("h2", { id: "listing-filter-title" }, "Filters"),

            React.createElement(
              "div",
              { className: "filter-header-actions" },

              React.createElement(
                "button",
                {
                  type: "button",
                  className: "filter-clear-button",
                  onClick: clearFilters,
                },
                "Clear All"
              ),

              React.createElement(
                "button",
                {
                  type: "button",
                  className: "filter-close-button",
                  "aria-label": "Close filters",
                  onClick: () => setFiltersOpen(false),
                },
                React.createElement("i", { className: "fa-solid fa-xmark" })
              )
            )
          ),

          React.createElement(
            "div",
            { className: "filter-modal-body" },

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement("label", null, "KEYWORD"),

          React.createElement("input", {
            type: "text",
            placeholder: "Search listings",
            value: filters.keyword,
            onChange: (event) => handleFilterChange("keyword", event.target.value),
          })
        ),

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement("label", null, "CATEGORY"),

          React.createElement(
            "select",
            {
              value: filters.categoryId,
              onChange: handleCategoryChange,
            },
            React.createElement("option", { value: "" }, "All"),
            categories.map((item) =>
              React.createElement(
                "option",
                { key: item.id, value: item.id },
                item.name
              )
            )
          )
        ),

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement("label", null, "SUBCATEGORY"),

          React.createElement(
            "select",
            {
              value: filters.subCategoryId,
              onChange: handleSubcategoryChange,
              disabled: !filters.categoryId,
            },
            React.createElement("option", { value: "" }, "All"),
            subcategories.map((item) =>
              React.createElement(
                "option",
                { key: item.id, value: item.id },
                item.name
              )
            )
          )
        ),

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement("label", null, "BUDGET (PRICE RANGE)"),

          React.createElement(
            "div",
            { className: "price-inputs" },

            React.createElement(
              "div",
              null,
              React.createElement("small", null, "Min (₹)"),
              React.createElement("input", {
                type: "number",
                placeholder: "10,000",
                value: filters.minPrice,
                onChange: (event) =>
                  handleFilterChange("minPrice", event.target.value),
              })
            ),

            React.createElement(
              "div",
              null,
              React.createElement("small", null, "Max (₹)"),
              React.createElement("input", {
                type: "number",
                placeholder: "10,00,000",
                value: filters.maxPrice,
                onChange: (event) =>
                  handleFilterChange("maxPrice", event.target.value),
              })
            )
          )
        ),

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement("label", null, "LOCATION"),

          React.createElement(
            "div",
            { className: "location-filter" },

            React.createElement("input", {
              type: "text",
              list: "filter-popular-locations",
              placeholder: "City, State",
              value: filters.location,
              onChange: (event) =>
                handleLocationFilterChange(event.target.value),
            }),

            React.createElement(
              "datalist",
              { id: "filter-popular-locations" },
              POPULAR_LOCATIONS.map((item) =>
                React.createElement("option", { key: item, value: item })
              )
            ),

            React.createElement("i", {
              className: "fa-solid fa-location-dot",
            })
          )
        ),

        filterAttributes.map((attribute) =>
          React.createElement(
            "div",
            { key: attribute.id || attribute.slug, className: "filter-group" },

            React.createElement(
              "label",
              null,
              String(attribute.name || attribute.slug).toUpperCase()
            ),

            String(attribute.dataType || "").toUpperCase() === "BOOLEAN"
              ? React.createElement(
                  "select",
                  {
                    value: filters.attributes[attribute.slug] || "",
                    onChange: (event) =>
                      handleAttributeChange(attribute.slug, event.target.value),
                  },
                  React.createElement("option", { value: "" }, "All"),
                  React.createElement("option", { value: "true" }, "Yes"),
                  React.createElement("option", { value: "false" }, "No")
                )
              : React.createElement("input", {
                  type: attributeInputType(attribute.dataType),
                  placeholder: `All ${attribute.name || "values"}`,
                  value: filters.attributes[attribute.slug] || "",
                  onChange: (event) =>
                    handleAttributeChange(attribute.slug, event.target.value),
                })
          )
        ),

        React.createElement(
          "div",
          { className: "filter-group condition-group" },

          React.createElement("label", null, "CONDITION"),

          ["Any", "Brand New", "Like New", "Good", "Fair", "Poor"].map((option) =>
            React.createElement(
              "label",
              {
                key: option,
                className: "radio-option",
              },
              React.createElement("input", {
                type: "radio",
                name: "condition",
                checked: filters.condition === option,
                onChange: () => handleFilterChange("condition", option),
              }),
              React.createElement("span", null, option)
            )
          )
        )
          ),

          React.createElement(
            "div",
            { className: "filter-modal-footer" },
            React.createElement(
              "button",
              {
                type: "button",
                className: "apply-filter-button",
                onClick: applyFilters,
              },
              "APPLY FILTERS"
            )
          )
        )
      ),

    React.createElement(
      "div",
      { className: "listing-content" },

      React.createElement(
        "main",
        { className: "listing-results" },

        loading &&
          React.createElement("p", { className: "listings-status" }, "Loading products..."),

        error &&
          React.createElement("p", { className: "listings-status listings-error" }, error),

        !loading && !error && products.length === 0 &&
          React.createElement(
            "p",
            { className: "listings-status" },
            "No products found."
          ),

        !loading && !error && products.length > 0 &&
          React.createElement(
            "div",
            { className: "results-grid" },

            products.map((product) =>
              React.createElement(
                "article",
                {
                  key: `${product.id}-${wishlistTick}`,
                  className: "listing-card",
                  onClick: () => navigate(`/product/${product.id}`),
                },

                React.createElement(
                  "div",
                  { className: "listing-image-wrapper" },

                  product.image
                    ? React.createElement("img", {
                        src: product.image,
                        alt: product.title,
                      })
                    : React.createElement(
                        "div",
                        { className: "listing-image-empty" },
                        React.createElement("i", { className: "fa-regular fa-image" })
                      ),

                  product.featured &&
                    React.createElement(
                      "span",
                      { className: "listing-featured" },
                      "FEATURED"
                    ),

                  product.sold &&
                    React.createElement(
                      "span",
                      { className: "listing-sold" },
                      "SOLD"
                    ),

                  React.createElement(
                    "button",
                    {
                      type: "button",
                      className: `listing-heart ${
                        isFavorite(product.id) ? "active" : ""
                      }`,
                      disabled: favoritePending === String(product.id),
                      onClick: (event) => handleHeartClick(event, product.id),
                    },
                    React.createElement("i", {
                      className: isFavorite(product.id)
                        ? "fa-solid fa-heart"
                        : "fa-regular fa-heart",
                    })
                  )
                ),

                React.createElement(
                  "div",
                  { className: "listing-card-content" },

                  React.createElement(
                    "strong",
                    { className: "listing-price" },
                    product.price
                  ),

                  React.createElement("h3", null, product.title),

                  React.createElement(
                    "div",
                    { className: "listing-meta" },

                    React.createElement(
                      "span",
                      null,
                      React.createElement("i", {
                        className: "fa-solid fa-location-dot",
                      }),
                      product.location || "India"
                    ),

                    React.createElement("span", null, product.time)
                  )
                )
              )
            )
          ),

        !loading && totalPages > 1 &&
          React.createElement(
            "div",
            { className: "listing-pagination" },

            React.createElement(
              "button",
              {
                type: "button",
                disabled: pageNumber === 1,
                onClick: () => goToPage(pageNumber - 1),
              },
              React.createElement("i", {
                className: "fa-solid fa-chevron-left",
              })
            ),

            Array.from({ length: totalPages }, (_, index) => index + 1).map((pageItem) =>
              React.createElement(
                "button",
                {
                  key: pageItem,
                  type: "button",
                  className: pageNumber === pageItem ? "active" : "",
                  onClick: () => goToPage(pageItem),
                },
                pageItem
              )
            ),

            React.createElement(
              "button",
              {
                type: "button",
                disabled: pageNumber === totalPages,
                onClick: () => goToPage(pageNumber + 1),
              },
              React.createElement("i", {
                className: "fa-solid fa-chevron-right",
              })
            )
          )
      )
    )
  );
}

export default ProductListing;
