import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { UI_CONFIG } from "../config/uiConfig";

function MainLayout() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

  return React.createElement(
    "div",
    { className: `app-layout${isChatPage ? " chat-layout" : ""}` },

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
