import React from "react";

function HeroSection() {
  const quickCategories = [
    {
      name: "Mobiles",
      icon: "fa-solid fa-mobile-screen-button",
    },
    {
      name: "Cars",
      icon: "fa-solid fa-car",
    },
    {
      name: "Laptops",
      icon: "fa-solid fa-laptop",
    },
    {
      name: "Real Estate",
      icon: "fa-solid fa-building",
    },
    {
      name: "Bikes",
      icon: "fa-solid fa-motorcycle",
    },
    {
      name: "Jobs",
      icon: "fa-solid fa-briefcase",
    },
  ];

  return React.createElement(
    "section",
    { className: "hero-section" },

    React.createElement(
      "div",
      { className: "hero-overlay" }
    ),

    React.createElement(
      "div",
      { className: "hero-content" },

      React.createElement(
        "h1",
        null,
        "What are you looking for today?"
      ),

      React.createElement(
        "p",
        null,
        "Browse over 1,50,000+ local verified listings near you"
      ),

      React.createElement(
        "div",
        { className: "hero-categories" },

        quickCategories.map((category) =>
          React.createElement(
            "button",
            {
              key: category.name,
              type: "button",
              className: "hero-category",
            },

            React.createElement("i", {
              className: category.icon,
            }),

            React.createElement(
              "span",
              null,
              category.name
            )
          )
        )
      )
    )
  );
}

export default HeroSection;