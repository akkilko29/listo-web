import React from "react";

function TopBar() {
  return React.createElement(
    "div",
    { className: "top-bar" },

    React.createElement(
      "span",
      null,
      "India's Largest Classifieds Platform"
    ),

    React.createElement(
      "div",
      { className: "top-bar-links" },

      React.createElement(
        "a",
        { href: "#support" },
        "Help & Support"
      ),

      React.createElement(
        "a",
        { href: "#premium" },
        "Explore Premium"
      )
    )
  );
}

export default TopBar;