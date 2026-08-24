import React from "react";
import { Link } from "react-router-dom";

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
        Link,
        { to: "/contact" },
        "Help & Support"
      )
    )
  );
}

export default TopBar;