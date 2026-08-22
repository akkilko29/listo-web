import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getProductById, getProducts } from "../services/productService";
import { startChat } from "../services/chatStorage";
import {
  getFavoriteStatus,
  isFavorite,
  toggleFavorite,
} from "../services/favoriteService";
import "../style/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSelectedImage(0);

    Promise.all([getProductById(id), getProducts()])
      .then(([item, products]) => {
        if (cancelled) {
          return;
        }

        if (!item) {
          setError("Product not found");
          setProduct(null);
          return;
        }

        setProduct(item);
        setSimilarProducts(
          products
            .filter(
              (entry) =>
                String(entry.id) !== String(item.id) &&
                entry.categoryId === item.categoryId
            )
            .slice(0, 4)
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load product");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated || !id) {
      setSaved(false);
      return undefined;
    }

    getFavoriteStatus(id)
      .then((favorite) => {
        if (!cancelled) {
          setSaved(favorite);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSaved(isFavorite(id));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (favoritePending) {
      return;
    }

    setFavoritePending(true);

    try {
      const nextSaved = await toggleFavorite(id);
      setSaved(nextSaved);
    } catch {
      /* keep current heart state */
    } finally {
      setFavoritePending(false);
    }
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const chat = startChat({
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
    });

    navigate(`/chat?id=${encodeURIComponent(chat.id)}`);
  };

  if (loading) {
    return React.createElement(
      "div",
      { className: "product-details-page" },
      React.createElement("p", { className: "listings-status" }, "Loading product...")
    );
  }

  if (error || !product) {
    return React.createElement(
      "div",
      { className: "product-details-page" },
      React.createElement(
        "p",
        { className: "listings-status listings-error" },
        error || "Product not found"
      )
    );
  }

  const images = product.images.length > 0 ? product.images : [];

  return React.createElement(
    "div",
    { className: "product-details-page" },

    React.createElement(
      "div",
      { className: "product-breadcrumb" },

      React.createElement("span", { onClick: () => navigate("/"), style: { cursor: "pointer" } }, "Home"),

      React.createElement("i", { className: "fa-solid fa-chevron-right" }),

      React.createElement(
        "span",
        {
          onClick: () =>
            navigate(
              `/listings?category=${encodeURIComponent(product.categoryName)}&categoryId=${product.categoryId}`
            ),
          style: { cursor: "pointer" },
        },
        product.categoryName || "Listings"
      ),

      product.subCategoryName &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement("i", { className: "fa-solid fa-chevron-right" }),
          React.createElement("span", null, product.subCategoryName)
        ),

      React.createElement("i", { className: "fa-solid fa-chevron-right" }),

      React.createElement("strong", null, product.title)
    ),

    React.createElement(
      "section",
      { className: "product-main-section" },

      React.createElement(
        "div",
        { className: "product-left" },

        React.createElement(
          "div",
          { className: "product-gallery" },

          images.length > 0
            ? React.createElement("img", {
                src: images[selectedImage] || images[0],
                alt: product.title,
                className: "product-main-image",
              })
            : React.createElement(
                "div",
                { className: "product-main-image product-image-empty" },
                React.createElement("i", { className: "fa-regular fa-image" })
              ),

          images.length > 1 &&
            React.createElement(
              "div",
              { className: "product-thumbnails" },

              images.map((image, index) =>
                React.createElement(
                  "button",
                  {
                    key: `${image}-${index}`,
                    type: "button",
                    className: `product-thumbnail ${
                      selectedImage === index ? "selected" : ""
                    }`,
                    onClick: () => setSelectedImage(index),
                  },

                  React.createElement("img", {
                    src: image,
                    alt: `Product ${index + 1}`,
                  })
                )
              )
            )
        ),

        React.createElement(
          "div",
          { className: "product-info-box" },

          React.createElement("h2", null, "Description"),

          React.createElement("p", null, product.description || "No description provided.")
        ),

        product.attributes.length > 0 &&
          React.createElement(
            "div",
            { className: "product-info-box specifications-box" },

            React.createElement("h2", null, "Specifications"),

            React.createElement(
              "div",
              { className: "specifications-grid" },

              product.attributes.map((attribute) =>
                React.createElement(
                  "div",
                  {
                    key: attribute.attributeId || attribute.slug,
                    className: "specification-item",
                  },

                  React.createElement("span", null, attribute.name),

                  React.createElement("strong", null, attribute.value || "-")
                )
              )
            )
          )
      ),

      React.createElement(
        "aside",
        { className: "product-right" },

        React.createElement(
          "div",
          { className: "product-summary-card" },

          React.createElement(
            "div",
            { className: "product-price-row" },

            React.createElement("h1", null, product.price),

            React.createElement("i", {
              className: saved ? "fa-solid fa-heart" : "fa-regular fa-heart",
              onClick: handleWishlist,
              style: {
                cursor: favoritePending ? "wait" : "pointer",
                color: saved ? "#d44949" : undefined,
                opacity: favoritePending ? 0.6 : 1,
              },
            })
          ),

          React.createElement("h2", null, product.title),

          product.sold &&
            React.createElement("span", { className: "product-sold-label" }, "SOLD"),

          React.createElement(
            "div",
            { className: "product-location-row" },

            React.createElement("i", { className: "fa-solid fa-location-dot" }),

            React.createElement("span", null, product.location || "India"),

            React.createElement("time", null, product.time)
          )
        ),

        React.createElement(
          "div",
          { className: "seller-card" },

          React.createElement("h3", null, "Seller Profile"),

          React.createElement(
            "div",
            { className: "seller-profile" },

            React.createElement(
              "div",
              { className: "seller-initials" },
              (product.sellerName || "S")
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()
            ),

            React.createElement(
              "div",
              { className: "seller-details" },

              React.createElement(
                "div",
                { className: "seller-name" },
                React.createElement("strong", null, product.sellerName)
              ),

              React.createElement("span", null, product.condition || "Listed on Listo")
            )
          ),

          React.createElement(
            "button",
            {
              type: "button",
              className: "chat-seller-button",
              onClick: handleChat,
            },

            React.createElement("i", { className: "fa-regular fa-message" }),

            "CHAT WITH SELLER"
          )
        ),

        React.createElement(
          "div",
          { className: "safety-card" },

          React.createElement(
            "h3",
            null,
            React.createElement("i", { className: "fa-solid fa-circle-info" }),
            " Safety Tips for Buyers"
          ),

          React.createElement(
            "ul",
            null,
            React.createElement("li", null, "Meet the seller in a public place."),
            React.createElement("li", null, "Check the product thoroughly before paying."),
            React.createElement("li", null, "Avoid making advance payments.")
          )
        )
      )
    ),

    similarProducts.length > 0 &&
      React.createElement(
        "section",
        { className: "similar-section" },

        React.createElement(
          "div",
          { className: "similar-container" },

          React.createElement("h2", null, "Similar Recommendations"),

          React.createElement(
            "div",
            { className: "similar-grid" },

            similarProducts.map((item) =>
              React.createElement(
                "article",
                {
                  key: item.id,
                  className: "similar-card",
                  onClick: () => navigate(`/product/${item.id}`),
                  style: { cursor: "pointer" },
                },

                item.image
                  ? React.createElement("img", {
                      src: item.image,
                      alt: item.title,
                    })
                  : null,

                React.createElement(
                  "div",
                  { className: "similar-card-info" },
                  React.createElement("strong", null, item.price),
                  React.createElement("span", null, item.title)
                )
              )
            )
          )
        )
      )
  );
}

export default ProductDetails;
