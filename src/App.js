import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import ProductListing from "./pages/ProductListing";
import AddProduct from "./pages/AddProduct";
import Wishlist from "./pages/Wishlist";
import Chat from "./pages/Chat";
import MyListings from "./pages/MyListings";
import Profile from "./pages/Profile";

import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";

import "./style/App.css";
import "./style/MainLayout.css";
import "./style/AuthLayout.css";

import "./style/TopBar.css";
import "./style/Header.css";
import "./style/Footer.css";

import "./style/Login.css";
import "./style/Register.css";
import "./style/ForgotPassword.css";

import "./style/Home.css";
import "./style/MegaMenuBar.css";
import "./style/HeroSection.css";
import "./style/AddProduct.css";
import "./style/Profile.css";

function App() {
  return React.createElement(
    BrowserRouter,
    null,

    React.createElement(
      AuthProvider,
      null,

      React.createElement(
        LocationProvider,
        null,

      React.createElement(
        Routes,
        null,

        React.createElement(
          Route,
          {
            element: React.createElement(MainLayout),
          },

          React.createElement(Route, {
            path: "/",
            element: React.createElement(Home),
          }),

          React.createElement(Route, {
            path: "/home",
            element: React.createElement(Home),
          }),

          React.createElement(Route, {
            path: "/product/:id",
            element: React.createElement(ProductDetails),
          }),

          React.createElement(Route, {
            path: "/listings",
            element: React.createElement(ProductListing),
          }),
          React.createElement(Route, {
            path: "/add-product",
            element: React.createElement(AddProduct),
          }),
          React.createElement(Route, {
            path: "/add-product/:id",
            element: React.createElement(AddProduct),
          }),
          React.createElement(Route, {
            path: "/my-listings",
            element: React.createElement(MyListings),
          }),
          React.createElement(Route, {
            path: "/profile",
            element: React.createElement(Profile),
          }),
          React.createElement(Route, {
            path: "/wishlist",
            element: React.createElement(Wishlist),
          }),
          React.createElement(Route, {
            path: "/chat",
            element: React.createElement(Chat),
          })
        ),

        React.createElement(
          Route,
          {
            element: React.createElement(AuthLayout),
          },

          React.createElement(Route, {
            path: "/login",
            element: React.createElement(Login),
          }),

          React.createElement(Route, {
            path: "/register",
            element: React.createElement(Register),
          }),
          React.createElement(Route, {
            path: "/forgot-password",
            element: React.createElement(ForgotPassword),
          })
        )
      )
    )
  )
  );
}

export default App;
