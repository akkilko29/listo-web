import React from "react";
import { Outlet } from "react-router-dom";

import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

import "../style/AuthLayout.css";

function AuthLayout() {
  return React.createElement(
    "div",
    { className: "auth-layout" },

    React.createElement(TopBar),

    React.createElement(
      "main",
      { className: "auth-content" },
      React.createElement(Outlet)
    ),

    React.createElement(Footer)
  );
}

export default AuthLayout;