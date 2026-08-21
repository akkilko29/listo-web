import React from "react";
import "../style/BrowseCategories.css";

function BrowseCategories() {
  const categories = [
    {
      name: "Vehicles",
      icon: "fa-solid fa-car-side",
      className: "vehicles",
    },
    {
      name: "Properties",
      icon: "fa-solid fa-building",
      className: "properties",
    },
    {
      name: "Mobiles",
      icon: "fa-solid fa-mobile-screen-button",
      className: "mobiles",
    },
    {
      name: "Jobs",
      icon: "fa-solid fa-suitcase",
      className: "jobs",
    },
    {
      name: "Electronics",
      icon: "fa-solid fa-laptop",
      className: "electronics",
    },
    {
      name: "Furniture",
      icon: "fa-solid fa-couch",
      className: "furniture",
    },
    {
      name: "Fashion",
      icon: "fa-solid fa-shirt",
      className: "fashion",
    },
    {
      name: "Pets",
      icon: "fa-solid fa-paw",
      className: "pets",
    },
  ];

  const handleCategoryClick = (category) => {
    console.log("Category:", category);
  };

  return React.createElement(
    "section",
    { className: "browse-categories-section" },

    React.createElement(
      "div",
      { className: "home-section-container" },

      React.createElement(
        "h2",
        { className: "home-section-title" },
        "Browse Categories"
      ),

      React.createElement(
        "div",
        { className: "browse-categories-grid" },

        categories.map((category) =>
          React.createElement(
            "button",
            {
              key: category.name,
              type: "button",
              className: `browse-category-item ${category.className}`,
              onClick: () =>
                handleCategoryClick(category.name),
            },

            React.createElement(
              "span",
              { className: "browse-category-icon" },

              React.createElement("i", {
                className: category.icon,
              })
            ),

            React.createElement(
              "span",
              { className: "browse-category-name" },
              category.name
            )
          )
        )
      )
    )
  );
}

export default BrowseCategories;