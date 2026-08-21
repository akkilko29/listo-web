import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import "../style/ProductListing.css";

function ProductListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = searchParams.get("category") || "Cars & Vehicles";
  const location = searchParams.get("location") || "Mumbai";

  const [sortBy, setSortBy] = useState("Date Published: Newest");

  const [filters, setFilters] = useState({
    category: category,
    minPrice: "",
    maxPrice: "",
    location: location,
    condition: "Any",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const products = [
    {
      id: 101,
      image:
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=500&q=80",
      price: "₹ 8,45,000",
      title: "Honda City ZX i-VTEC (2022) • First Owner, First Registration",
      location: "Bandra, Mumbai",
      time: "2 hrs ago",
      featured: true,
    },
    {
      id: 102,
      image:
        "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=500&q=80",
      price: "₹ 9,15,000",
      title: "Hyundai Creta SX Petrol (2022) • 2nd Owner, Automatic",
      location: "Andheri West, Mumbai",
      time: "4 hrs ago",
      featured: false,
    },
    {
      id: 103,
      image:
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=80",
      price: "₹ 4,75,000",
      title: "Maruti Swift VXI (2020) • Single Owner, Low Run 12K km",
      location: "Thane West, Thane",
      time: "5 hrs ago",
      featured: false,
    },
    {
      id: 104,
      image:
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=500&q=80",
      price: "₹ 6,40,000",
      title: "Honda Civic 1.8 VTi • Pune Tech International",
      location: "Powai, Mumbai",
      time: "Today",
      featured: false,
    },
    {
      id: 105,
      image:
        "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=500&q=80",
      price: "₹ 2,90,000",
      title: "Tata Tiago XZ Plus (2019) • Reverse Petrol, Automatic",
      location: "Navi Mumbai",
      time: "Yesterday",
      featured: false,
    },
    {
      id: 106,
      image:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80",
      price: "₹ 9,99,999",
      title: "Toyota Innova Crysta 2.4 GX Diesel • Spacious 7 Seater",
      location: "Worli, Mumbai",
      time: "2 days ago",
      featured: false,
    },
  ];

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.category) {
      params.set("category", filters.category);
    }

    if (filters.location) {
      params.set("location", filters.location);
    }

    if (filters.minPrice) {
      params.set("minPrice", filters.minPrice);
    }

    if (filters.maxPrice) {
      params.set("maxPrice", filters.maxPrice);
    }

    navigate(`/listings?${params.toString()}`);

    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "Cars & Vehicles",
      minPrice: "",
      maxPrice: "",
      location: "Mumbai",
      condition: "Any",
    });

    navigate("/listings?category=Cars%20%26%20Vehicles&location=Mumbai");

    setCurrentPage(1);
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return React.createElement(
    "div",
    { className: "product-listing-page" },

    /* =========================
       BREADCRUMB
    ========================= */

    React.createElement(
      "div",
      { className: "listing-breadcrumb" },

      React.createElement("span", null, "Home"),

      React.createElement("i", {
        className: "fa-solid fa-chevron-right",
      }),

      React.createElement("span", null, "Cars & Vehicles"),

      React.createElement("i", {
        className: "fa-solid fa-chevron-right",
      }),

      React.createElement(
        "strong",
        null,
        "Used Cars in Mumbai"
      )
    ),

    /* =========================
       ACTIVE FILTERS
    ========================= */

    React.createElement(
      "div",
      { className: "listing-top-bar" },

      React.createElement(
        "div",
        { className: "active-filters" },

        React.createElement(
          "span",
          { className: "active-filter-label" },
          "Active Filters:"
        ),

        React.createElement(
          "span",
          { className: "filter-chip" },
          "Budget: Under ₹10L",
          React.createElement("i", {
            className: "fa-solid fa-xmark",
          })
        ),

        React.createElement(
          "span",
          { className: "filter-chip" },
          "Location: Mumbai",
          React.createElement("i", {
            className: "fa-solid fa-xmark",
          })
        ),

        React.createElement(
          "span",
          { className: "filter-chip" },
          "Condition: Gently Used",
          React.createElement("i", {
            className: "fa-solid fa-xmark",
          })
        )
      ),

      React.createElement(
        "div",
        { className: "sort-wrapper" },

        React.createElement(
          "span",
          null,
          "Sort by:"
        ),

        React.createElement(
          "select",
          {
            value: sortBy,
            onChange: (event) =>
              setSortBy(event.target.value),
          },

          React.createElement(
            "option",
            null,
            "Date Published: Newest"
          ),

          React.createElement(
            "option",
            null,
            "Date Published: Oldest"
          ),

          React.createElement(
            "option",
            null,
            "Price: Low to High"
          ),

          React.createElement(
            "option",
            null,
            "Price: High to Low"
          )
        )
      )
    ),

    /* =========================
       CONTENT
    ========================= */

    React.createElement(
      "div",
      { className: "listing-content" },

      /* =========================
         FILTER SIDEBAR
      ========================= */

      React.createElement(
        "aside",
        { className: "filter-sidebar" },

        React.createElement(
          "div",
          { className: "filter-header" },

          React.createElement(
            "h2",
            null,
            "Filters"
          ),

          React.createElement(
            "button",
            {
              type: "button",
              onClick: clearFilters,
            },
            "Clear All"
          )
        ),

        /* Category */

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement(
            "label",
            null,
            "CATEGORY"
          ),

          React.createElement(
            "select",
            {
              value: filters.category,
              onChange: (event) =>
                handleFilterChange(
                  "category",
                  event.target.value
                ),
            },

            React.createElement(
              "option",
              null,
              "Cars & Vehicles"
            ),

            React.createElement(
              "option",
              null,
              "Cars"
            ),

            React.createElement(
              "option",
              null,
              "SUVs"
            ),

            React.createElement(
              "option",
              null,
              "Sedans"
            ),

            React.createElement(
              "option",
              null,
              "Hatchbacks"
            )
          )
        ),

        /* Price */

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement(
            "label",
            null,
            "BUDGET (PRICE RANGE)"
          ),

          React.createElement(
            "div",
            { className: "price-inputs" },

            React.createElement(
              "div",
              null,

              React.createElement(
                "small",
                null,
                "Min (₹)"
              ),

              React.createElement("input", {
                type: "number",
                placeholder: "10,000",
                value: filters.minPrice,
                onChange: (event) =>
                  handleFilterChange(
                    "minPrice",
                    event.target.value
                  ),
              })
            ),

            React.createElement(
              "div",
              null,

              React.createElement(
                "small",
                null,
                "Max (₹)"
              ),

              React.createElement("input", {
                type: "number",
                placeholder: "10,00,000",
                value: filters.maxPrice,
                onChange: (event) =>
                  handleFilterChange(
                    "maxPrice",
                    event.target.value
                  ),
              })
            )
          )
        ),

        /* Location */

        React.createElement(
          "div",
          { className: "filter-group" },

          React.createElement(
            "label",
            null,
            "LOCATION"
          ),

          React.createElement(
            "div",
            { className: "location-filter" },

            React.createElement("input", {
              type: "text",
              value: filters.location,
              onChange: (event) =>
                handleFilterChange(
                  "location",
                  event.target.value
                ),
            }),

            React.createElement("i", {
              className: "fa-solid fa-location-dot",
            })
          )
        ),

        /* Condition */

        React.createElement(
          "div",
          { className: "filter-group condition-group" },

          React.createElement(
            "label",
            null,
            "VEHICLE CONDITION"
          ),

          React.createElement(
            "label",
            { className: "radio-option" },

            React.createElement("input", {
              type: "radio",
              name: "condition",
              checked:
                filters.condition === "Gently Used",
              onChange: () =>
                handleFilterChange(
                  "condition",
                  "Gently Used"
                ),
            }),

            React.createElement(
              "span",
              null,
              "Gently Used"
            )
          ),

          React.createElement(
            "label",
            { className: "radio-option" },

            React.createElement("input", {
              type: "radio",
              name: "condition",
              checked:
                filters.condition ===
                "Brand New / Unused",
              onChange: () =>
                handleFilterChange(
                  "condition",
                  "Brand New / Unused"
                ),
            }),

            React.createElement(
              "span",
              null,
              "Brand New / Unused"
            )
          ),

          React.createElement(
            "label",
            { className: "radio-option" },

            React.createElement("input", {
              type: "radio",
              name: "condition",
              checked:
                filters.condition ===
                "Needs minor work",
              onChange: () =>
                handleFilterChange(
                  "condition",
                  "Needs minor work"
                ),
            }),

            React.createElement(
              "span",
              null,
              "Needs minor work"
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

      /* =========================
         PRODUCTS
      ========================= */

      React.createElement(
        "main",
        { className: "listing-results" },

        React.createElement(
          "div",
          { className: "results-grid" },

          products.map((product) =>
            React.createElement(
              "article",
              {
                key: product.id,
                className: "listing-card",
                onClick: () =>
                  handleProductClick(product.id),
              },

              React.createElement(
                "div",
                { className: "listing-image-wrapper" },

                React.createElement("img", {
                  src: product.image,
                  alt: product.title,
                }),

                product.featured &&
                  React.createElement(
                    "span",
                    { className: "listing-featured" },
                    "FEATURED"
                  ),

                React.createElement("button", {
                  type: "button",
                  className: "listing-heart",
                  onClick: (event) => {
                    event.stopPropagation();
                  },
                }, React.createElement("i", {
                  className: "fa-regular fa-heart",
                }))
              ),

              React.createElement(
                "div",
                { className: "listing-card-content" },

                React.createElement(
                  "strong",
                  { className: "listing-price" },
                  product.price
                ),

                React.createElement(
                  "h3",
                  null,
                  product.title
                ),

                React.createElement(
                  "div",
                  { className: "listing-meta" },

                  React.createElement(
                    "span",
                    null,

                    React.createElement("i", {
                      className:
                        "fa-solid fa-location-dot",
                    }),

                    product.location
                  ),

                  React.createElement(
                    "span",
                    null,
                    product.time
                  )
                )
              )
            )
          )
        ),

        /* =========================
           PAGINATION
        ========================= */

        React.createElement(
          "div",
          { className: "listing-pagination" },

          React.createElement(
            "button",
            {
              type: "button",
              disabled: currentPage === 1,
              onClick: () =>
                handlePageChange(currentPage - 1),
            },
            React.createElement("i", {
              className: "fa-solid fa-chevron-left",
            })
          ),

          [1, 2, 3].map((page) =>
            React.createElement(
              "button",
              {
                key: page,
                type: "button",
                className:
                  currentPage === page
                    ? "active"
                    : "",
                onClick: () =>
                  handlePageChange(page),
              },
              page
            )
          ),

          React.createElement(
            "button",
            {
              type: "button",
              onClick: () =>
                handlePageChange(currentPage + 1),
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