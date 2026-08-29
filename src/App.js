import React from "react";

import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AttributionCapture from "./components/AttributionCapture";
import SeoHead from "./components/SeoHead";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import ProductListing from "./pages/ProductListing";
import AddProduct from "./pages/AddProduct";
import Wishlist from "./pages/Wishlist";
import Chat from "./pages/Chat";
import MyListings from "./pages/MyListings";
import Profile from "./pages/Profile";
import SellerProfile from "./pages/SellerProfile";
import InfoPage from "./pages/InfoPage";
import Sitemap from "./pages/Sitemap";

import Login from "./components/Login";
// Email/password registration is disabled. New users sign up with Google on /login.
// import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import "./style/App.css";
import "./style/MainLayout.css";
import "./style/AuthLayout.css";

import "./style/TopBar.css";
import "./style/Header.css";
import "./style/Footer.css";

import "./style/Login.css";
// import "./style/Register.css";
import "./style/ForgotPassword.css";

import "./style/Home.css";
import "./style/MegaMenuBar.css";
import "./style/HeroSection.css";
import "./style/AddProduct.css";
import "./style/Profile.css";
import "./style/SellerProfile.css";
import "./style/ResetPassword.css";

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

      React.createElement(AttributionCapture),
      React.createElement(SeoHead),

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
            path: "/category/:categorySlug/:subcategorySlug",
            element: React.createElement(ProductListing),
          }),
          React.createElement(Route, {
            path: "/category/:categorySlug",
            element: React.createElement(ProductListing),
          }),
          React.createElement(Route, {
            path: "/location/:citySlug/:categorySlug",
            element: React.createElement(ProductListing),
          }),
          React.createElement(Route, {
            path: "/location/:citySlug",
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
            path: "/seller/:id",
            element: React.createElement(SellerProfile),
          }),
          React.createElement(Route, {
            path: "/wishlist",
            element: React.createElement(Wishlist),
          }),
          React.createElement(Route, {
            path: "/chat",
            element: React.createElement(Chat),
          }),
          React.createElement(Route, {
            path: "/about",
            element: React.createElement(InfoPage, { slug: "about" }),
          }),
          React.createElement(Route, {
            path: "/contact",
            element: React.createElement(InfoPage, { slug: "contact" }),
          }),
          React.createElement(Route, {
            path: "/safety",
            element: React.createElement(InfoPage, { slug: "safety" }),
          }),
          React.createElement(Route, {
            path: "/terms",
            element: React.createElement(InfoPage, { slug: "terms" }),
          }),
          React.createElement(Route, {
            path: "/privacy",
            element: React.createElement(InfoPage, { slug: "privacy" }),
          }),
          React.createElement(Route, {
            path: "/sitemap",
            element: React.createElement(Sitemap),
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
            element: React.createElement(Navigate, {
              to: "/login",
              replace: true,
            }),
          }),
          // Email/password registration page (disabled)
          // React.createElement(Route, {
          //   path: "/register",
          //   element: React.createElement(Register),
          // }),
          React.createElement(Route, {
            path: "/forgot-password",
            element: React.createElement(ForgotPassword),
          }),
          React.createElement(Route, {
            path: "/reset-password",
            element: React.createElement(ResetPassword),
          })
        )
      )
    )
  )
  );
}

export default App;
