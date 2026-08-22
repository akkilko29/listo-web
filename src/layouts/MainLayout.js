import React from "react";
import { Outlet } from "react-router-dom";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { UI_CONFIG } from "../config/uiConfig";

function MainLayout() {
  return React.createElement(
    "div",
    { className: "app-layout" },

    React.createElement(TopBar),

    React.createElement(Header),

    React.createElement(
      "main",
      { className: "page-content" },
      React.createElement(Outlet)
    ),

    UI_CONFIG.showFooter && React.createElement(Footer)
  );
}

export default MainLayout;