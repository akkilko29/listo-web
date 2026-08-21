import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ProductDetails from "./pages/ProductDetails";
import ProductListing from "./pages/ProductListing";

import "./style/App.css";
import "./style/MainLayout.css";
import "./style/TopBar.css";
import "./style/Header.css";
import "./style/Footer.css";
import "./style/Login.css";
import "./style/Register.css";
import "./style/Home.css";
import "./style/MegaMenuBar.css";
import "./style/HeroSection.css";

function App() {
  return React.createElement(
    BrowserRouter,
    null,

    React.createElement(
      Routes,
      null,

      React.createElement(
        Route,
        {
          element: React.createElement(MainLayout),
        },

        React.createElement(
          Route,
          {
            path: "/",
            element: React.createElement(Home),
          }
        ),

        React.createElement(
          Route,
          {
            path: "/home",
            element: React.createElement(Home),
          }
        ),

        React.createElement(
          Route,
          {
            path: "/login",
            element: React.createElement(Login),
          }
        ),

        React.createElement(
          Route,
          {
            path: "/register",
            element: React.createElement(Register),
          }
        ),
        React.createElement(
          Route,
          {
            path: "/product/:id",
            element: React.createElement(ProductDetails),
          }
        ),
        React.createElement(
          Route,
          {
            path: "/listings",
            element: React.createElement(ProductListing),
          }
        )
      )
    )
  );
}

export default App;