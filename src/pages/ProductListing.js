import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { getProducts, searchProducts } from "../services/productService";
import { isWishlisted, toggleWishlist } from "../services/wishlistStorage";
import { filterProducts, sortProducts } from "../utils/productDisplay";
import { useAuth } from "../context/AuthContext";
import "../style/ProductListing.css";

const PAGE_SIZE = 8;

function ProductListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const category = searchParams.get("category") || "All Categories";
  const subcategory = searchParams.get("subcategory");
  const categoryId = searchParams.get("categoryId");
  const subCategoryId = searchParams.get("subCategoryId");
  const keyword = searchParams.get("keyword") || "";
  const locationParam = searchParams.get("location") || "";

  const [sortBy, setSortBy] = useState("Date Published: Newest");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistTick, setWishlistTick] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    category: category,
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    location: locationParam,
    condition: "Any",
  });

  useEffect(() => {
    setFilters((previous) => ({
      ...previous,
      category,
      location: locationParam,
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    }));
  }, [category, locationParam, searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setCurrentPage(1);

    const loader = keyword ? searchProducts(keyword) : getProducts();

    loader
      .then((products) => {
        if (!cancelled) {
          setAllProducts(products);
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
  }, [keyword]);

  const visibleProducts = useMemo(() => {
    const conditionFilter =
      filters.condition === "Brand New / Unused"
        ? "NEW"
        : filters.condition === "Any"
          ? ""
          : "USED";

    const filtered = filterProducts(allProducts, {
      categoryId,
      subCategoryId,
      keyword,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      condition: conditionFilter,
    });

    return sortProducts(filtered, sortBy);
  }, [
    allProducts,
    categoryId,
    subCategoryId,
    keyword,
    filters.location,
    filters.minPrice,
    filters.maxPrice,
    filters.condition,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pagedProducts = visibleProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (filters.location) {
      params.set("location", filters.location);
    } else {
      params.delete("location");
    }

    if (filters.minPrice) {
      params.set("minPrice", filters.minPrice);
    } else {
      params.delete("minPrice");
    }

    if (filters.maxPrice) {
      params.set("maxPrice", filters.maxPrice);
    } else {
      params.delete("maxPrice");
    }

    navigate(`/listings?${params.toString()}`);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "All Categories",
      minPrice: "",
      maxPrice: "",
      location: "",
      condition: "Any",
    });
    navigate("/listings");
    setCurrentPage(1);
  };

  const handleHeartClick = (event, productId) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toggleWishlist(productId);
    setWishlistTick((value) => value + 1);
  };

  const heading = keyword
    ? `Results for "${keyword}"`
    : subcategory || `${category}${filters.location ? ` in ${filters.location}` : ""}`;

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
          `${visibleProducts.length} listings`
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

        filters.location &&
          React.createElement(
            "span",
            { className: "filter-chip" },
            `Location: ${filters.location}`
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
    ),

    React.createElement(
      "div",
      { className: "listing-content" },

      React.createElement(
        "aside",
        { className: "filter-sidebar" },

        React.createElement(
          "div",
          { className: "filter-header" },

          React.createElement("h2", null, "Filters"),

          React.createElement(
            "button",
            {
              type: "button",
              onClick: clearFilters,
            },
            "Clear All"
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
              placeholder: "City or state",
              value: filters.location,
              onChange: (event) =>
                handleFilterChange("location", event.target.value),
            }),

            React.createElement("i", {
              className: "fa-solid fa-location-dot",
            })
          )
        ),

        React.createElement(
          "div",
          { className: "filter-group condition-group" },

          React.createElement("label", null, "CONDITION"),

          ["Any", "Brand New / Unused", "Gently Used"].map((option) =>
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
        ),

        React.createElement(
          "button",
          {
            type: "button",
            className: "apply-filter-button",
            onClick: applyFilters,
          },
          "APPLY FILTERS"
        )
      ),

      React.createElement(
        "main",
        { className: "listing-results" },

        loading &&
          React.createElement("p", { className: "listings-status" }, "Loading products..."),

        error &&
          React.createElement("p", { className: "listings-status listings-error" }, error),

        !loading && !error && pagedProducts.length === 0 &&
          React.createElement(
            "p",
            { className: "listings-status" },
            "No products found."
          ),

        !loading && !error && pagedProducts.length > 0 &&
          React.createElement(
            "div",
            { className: "results-grid" },

            pagedProducts.map((product) =>
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
                        isWishlisted(product.id) ? "active" : ""
                      }`,
                      onClick: (event) => handleHeartClick(event, product.id),
                    },
                    React.createElement("i", {
                      className: isWishlisted(product.id)
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

        !loading && visibleProducts.length > PAGE_SIZE &&
          React.createElement(
            "div",
            { className: "listing-pagination" },

            React.createElement(
              "button",
              {
                type: "button",
                disabled: page === 1,
                onClick: () => setCurrentPage(page - 1),
              },
              React.createElement("i", {
                className: "fa-solid fa-chevron-left",
              })
            ),

            Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) =>
              React.createElement(
                "button",
                {
                  key: pageNumber,
                  type: "button",
                  className: page === pageNumber ? "active" : "",
                  onClick: () => setCurrentPage(pageNumber),
                },
                pageNumber
              )
            ),

            React.createElement(
              "button",
              {
                type: "button",
                disabled: page === totalPages,
                onClick: () => setCurrentPage(page + 1),
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
