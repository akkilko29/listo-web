import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getCurrentUserId } from "../services/conversationService";
import {
  deleteProduct,
  getProducts,
  markProductSold,
} from "../services/productService";
import "../style/ProductListing.css";

function MyListings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const loadListings = () => {
    const sellerId = getCurrentUserId();
    setLoading(true);
    setError("");

    getProducts()
      .then((items) => {
        setProducts(
          items.filter((item) => String(item.sellerId) === String(sellerId))
        );
      })
      .catch((err) => {
        setError(err.message || "Unable to load your listings");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadListings();
    }
  }, [isAuthenticated]);

  const handleSold = async (event, productId) => {
    event.stopPropagation();
    if (pendingId) {
      return;
    }

    setPendingId(String(productId));
    try {
      await markProductSold(productId);
      loadListings();
    } catch (err) {
      setError(err.message || "Unable to mark as sold");
    } finally {
      setPendingId("");
    }
  };

  const handleDelete = async (event, productId) => {
    event.stopPropagation();
    if (pendingId || !window.confirm("Delete this listing?")) {
      return;
    }

    setPendingId(String(productId));
    try {
      await deleteProduct(productId);
      setProducts((current) =>
        current.filter((item) => String(item.id) !== String(productId))
      );
    } catch (err) {
      setError(err.message || "Unable to delete listing");
    } finally {
      setPendingId("");
    }
  };

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
      React.createElement("strong", null, "My Listings")
    ),
    React.createElement(
      "div",
      { className: "listing-top-bar" },
      React.createElement("h2", { style: { margin: 0, fontSize: 22 } }, "My Listings"),
      React.createElement(
        "button",
        {
          type: "button",
          className: "apply-filter-button",
          onClick: () => navigate("/add-product"),
        },
        "Post new ad"
      )
    ),
    loading &&
      React.createElement("p", { className: "listings-status" }, "Loading your listings..."),
    error &&
      React.createElement("p", { className: "listings-status listings-error" }, error),
    !loading && products.length === 0 &&
      React.createElement(
        "p",
        { className: "listings-status" },
        "You have not posted any ads yet."
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
                product.image
                  ? React.createElement("img", { src: product.image, alt: product.title })
                  : React.createElement(
                      "div",
                      { className: "listing-image-empty" },
                      React.createElement("i", { className: "fa-regular fa-image" })
                    ),
                product.sold &&
                  React.createElement("span", { className: "listing-sold" }, "SOLD")
              ),
              React.createElement(
                "div",
                { className: "listing-card-content" },
                React.createElement("strong", { className: "listing-price" }, product.price),
                React.createElement("h3", null, product.title),
                React.createElement(
                  "div",
                  { className: "listing-meta" },
                  React.createElement("span", null, product.location || "India"),
                  React.createElement("span", null, product.time)
                ),
                React.createElement(
                  "div",
                  { className: "owner-listing-actions", onClick: (event) => event.stopPropagation() },
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      onClick: () => navigate(`/add-product/${product.id}`),
                    },
                    "Edit"
                  ),
                  !product.sold &&
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        disabled: pendingId === String(product.id),
                        onClick: (event) => handleSold(event, product.id),
                      },
                      "Mark sold"
                    ),
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      className: "danger",
                      disabled: pendingId === String(product.id),
                      onClick: (event) => handleDelete(event, product.id),
                    },
                    "Delete"
                  )
                )
              )
            )
          )
        )
      )
  );
}

export default MyListings;
