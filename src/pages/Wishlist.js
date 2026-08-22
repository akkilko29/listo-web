import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getProducts } from "../services/productService";
import { getWishlistIds, toggleWishlist } from "../services/wishlistStorage";
import "../style/ProductListing.css";

function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const loadWishlist = () => {
    const ids = getWishlistIds();
    setLoading(true);

    getProducts()
      .then((all) => {
        setProducts(all.filter((product) => ids.includes(String(product.id))));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return React.createElement(
    "div",
    { className: "product-listing-page" },

    React.createElement(
      "div",
      { className: "listing-breadcrumb" },
      React.createElement("span", { onClick: () => navigate("/"), style: { cursor: "pointer" } }, "Home"),
      React.createElement("i", { className: "fa-solid fa-chevron-right" }),
      React.createElement("strong", null, "Wishlist")
    ),

    React.createElement(
      "div",
      { className: "listing-top-bar" },
      React.createElement("h2", { style: { margin: 0, fontSize: 22 } }, "Your Wishlist")
    ),

    loading &&
      React.createElement("p", { className: "listings-status" }, "Loading wishlist..."),

    !loading && products.length === 0 &&
      React.createElement(
        "p",
        { className: "listings-status" },
        "No saved items yet. Tap the heart on a listing to add it here."
      ),

    !loading && products.length > 0 &&
      React.createElement(
        "div",
        { className: "listing-content", style: { display: "block", padding: "0 24px 40px" } },
        React.createElement(
          "div",
          { className: "results-grid" },
          products.map((product) =>
            React.createElement(
              "article",
              {
                key: product.id,
                className: "listing-card",
                onClick: () => navigate(`/product/${product.id}`),
              },
              React.createElement(
                "div",
                { className: "listing-image-wrapper" },
                product.image &&
                  React.createElement("img", { src: product.image, alt: product.title }),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    className: "listing-heart active",
                    onClick: (event) => {
                      event.stopPropagation();
                      toggleWishlist(product.id);
                      loadWishlist();
                    },
                  },
                  React.createElement("i", { className: "fa-solid fa-heart" })
                )
              ),
              React.createElement(
                "div",
                { className: "listing-card-content" },
                React.createElement("strong", { className: "listing-price" }, product.price),
                React.createElement("h3", null, product.title),
                React.createElement(
                  "div",
                  { className: "listing-meta" },
                  React.createElement("span", null, product.location),
                  React.createElement("span", null, product.time)
                )
              )
            )
          )
        )
      )
  );
}

export default Wishlist;
