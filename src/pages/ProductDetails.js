import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { resolveMediaUrl } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";
import { listingsHref, useAppLocation } from "../context/LocationContext";
import {
  deleteProduct,
  getProductById,
  getProducts,
  markProductSold,
} from "../services/productService";
import {
  getFavoriteStatus,
  isFavorite,
  toggleFavorite,
} from "../services/favoriteService";
import OfferModal, { buildOfferMessage } from "../components/OfferModal";
import { applySeo } from "../seo/applySeo";
import { breadcrumbJsonLd } from "../seo/breadcrumbJsonLd";
import { absoluteUrl } from "../config/seoConfig";
import { categoryPath, subcategoryPath } from "../seo/seoPaths";
import { getUserById } from "../services/authService";
import {
  getCurrentUserId,
  sendConversationMessage,
  startConversation,
} from "../services/conversationService";
import "../style/ProductDetails.css";
import "../style/SellerProfile.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { location } = useAppLocation();

  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);
  const [chatPending, setChatPending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [ownerPending, setOwnerPending] = useState("");
  const [seller, setSeller] = useState(null);

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
    if (loading) {
      return undefined;
    }

    if (error || !product) {
      applySeo({
        title: "Listing not found | LISTO",
        description: "This listing is not available on LISTO.",
        path: `/product/${id}`,
        noIndex: true,
      });
      return undefined;
    }

    const image = product.images?.[0] || product.image || "";
    const summary = String(product.description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    const locationLabel = product.location || "";
    const priceLabel = product.priceValue
      ? `₹${product.priceValue.toLocaleString("en-IN")}`
      : "";
    const title = priceLabel
      ? `${product.title} - ${priceLabel} | LISTO`
      : `${product.title} | LISTO`;
    const description =
      summary ||
      [product.title, "for sale on LISTO", locationLabel, priceLabel]
        .filter(Boolean)
        .join(". ");
    const path = `/product/${product.id}`;
    const crumbs = [{ name: "Home", path: "/" }];

    if (product.categoryName) {
      crumbs.push({
        name: product.categoryName,
        path: categoryPath({
          id: product.categoryId,
          name: product.categoryName,
        }),
      });
    }

    if (product.subCategoryName && product.categoryName) {
      crumbs.push({
        name: product.subCategoryName,
        path: subcategoryPath(
          { id: product.categoryId, name: product.categoryName },
          { id: product.subCategoryId, name: product.subCategoryName }
        ),
      });
    }

    crumbs.push({ name: product.title, path });

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: summary || product.title,
      image: image ? resolveMediaUrl(image) : undefined,
      category: product.categoryName || undefined,
      offers: {
        "@type": "Offer",
        url: absoluteUrl(path),
        priceCurrency: "INR",
        price: product.priceValue || undefined,
        availability: product.sold
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      },
    };

    applySeo({
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      path,
      image: image ? resolveMediaUrl(image) : undefined,
      type: "product",
      noIndex: false,
      jsonLdId: "listo-jsonld-page",
      jsonLd: [productSchema, breadcrumbJsonLd(crumbs, absoluteUrl)],
    });
  }, [product, loading, error, id]);

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

  useEffect(() => {
    if (!product?.sellerId) {
      setSeller(null);
      return undefined;
    }

    let cancelled = false;

    getUserById(product.sellerId)
      .then((user) => {
        if (!cancelled) {
          setSeller(user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSeller(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [product?.sellerId]);

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

  const handleChat = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (chatPending) {
      return;
    }

    setChatPending(true);
    setChatError("");

    try {
      const conversation = await startConversation(product.id);
      navigate(`/chat?id=${encodeURIComponent(conversation.id)}`);
    } catch (err) {
      setChatError(err.message || "Unable to start chat");
    } finally {
      setChatPending(false);
    }
  };

  const handleOffer = async (amount) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (offerSubmitting) {
      return;
    }

    setOfferSubmitting(true);
    setChatError("");

    try {
      const conversation = await startConversation(product.id);
      await sendConversationMessage(
        conversation.id,
        buildOfferMessage(amount, product.title)
      );
      setOfferOpen(false);
      navigate(`/chat?id=${encodeURIComponent(conversation.id)}`);
    } catch (err) {
      setChatError(err.message || "Unable to send offer");
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleMarkSold = async () => {
    if (ownerPending) {
      return;
    }

    setOwnerPending("sold");
    setChatError("");

    try {
      const updated = await markProductSold(product.id);
      if (updated) {
        setProduct(updated);
      } else {
        setProduct((current) => ({ ...current, sold: true, status: "SOLD" }));
      }
    } catch (err) {
      setChatError(err.message || "Unable to mark as sold");
    } finally {
      setOwnerPending("");
    }
  };

  const handleDeleteListing = async () => {
    if (ownerPending || !window.confirm("Delete this listing?")) {
      return;
    }

    setOwnerPending("delete");
    setChatError("");

    try {
      await deleteProduct(product.id);
      navigate("/my-listings");
    } catch (err) {
      setChatError(err.message || "Unable to delete listing");
      setOwnerPending("");
    }
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
  const isOwner =
    isAuthenticated &&
    product.sellerId &&
    String(product.sellerId) === getCurrentUserId();
  const sellerId = seller?.id || product.sellerId;
  const sellerName = seller?.name || product.sellerName || "Seller";
  const sellerLocation = [seller?.city, seller?.state].filter(Boolean).join(", ");

  const openSellerProfile = () => {
    if (sellerId) {
      navigate(`/seller/${sellerId}`);
    }
  };

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
              listingsHref(location, {
                category: product.categoryName,
                categoryId: String(product.categoryId),
              })
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

            React.createElement("p", { className: "product-price" }, product.price),

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

          React.createElement("h1", { className: "product-title" }, product.title),

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
            "button",
            {
              type: "button",
              className: "seller-profile-link",
              onClick: openSellerProfile,
              disabled: !sellerId,
            },

            seller?.profilePhotoUrl
              ? React.createElement("img", {
                  src: resolveMediaUrl(seller.profilePhotoUrl),
                  alt: sellerName,
                  className: "seller-photo",
                })
              : React.createElement(
                  "div",
                  { className: "seller-initials" },
                  sellerName
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
                React.createElement("strong", null, sellerName),
                React.createElement("i", {
                  className: "fa-solid fa-chevron-right",
                })
              ),

              React.createElement(
                "span",
                null,
                sellerLocation || (sellerId ? "View seller profile" : "Seller")
              )
            )
          ),

          React.createElement(
            "button",
            {
              type: "button",
              className: isOwner ? "offer-button" : "chat-seller-button",
              onClick: isOwner
                ? () => navigate(`/add-product/${product.id}`)
                : handleChat,
              disabled: !isOwner && chatPending,
            },

            React.createElement("i", {
              className: isOwner
                ? "fa-solid fa-pen"
                : "fa-regular fa-message",
            }),

            isOwner
              ? "EDIT LISTING"
              : chatPending
                ? "STARTING CHAT..."
                : "CHAT WITH SELLER"
          ),

          isOwner &&
            !product.sold &&
            React.createElement(
              "button",
              {
                type: "button",
                className: "offer-button",
                onClick: handleMarkSold,
                disabled: ownerPending === "sold",
              },
              React.createElement("i", { className: "fa-solid fa-check" }),
              ownerPending === "sold" ? "UPDATING..." : "MARK AS SOLD"
            ),

          isOwner &&
            React.createElement(
              "button",
              {
                type: "button",
                className: "offer-button",
                onClick: handleDeleteListing,
                disabled: ownerPending === "delete",
                style: { color: "#d44949", borderColor: "#f1c4c4" },
              },
              React.createElement("i", { className: "fa-solid fa-trash" }),
              ownerPending === "delete" ? "DELETING..." : "DELETE LISTING"
            ),

          !isOwner &&
            !product.sold &&
            React.createElement(
              "button",
              {
                type: "button",
                className: "offer-button",
                onClick: () => {
                  if (!isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  setOfferOpen(true);
                },
                disabled: offerSubmitting,
              },
              React.createElement("i", { className: "fa-solid fa-tag" }),
              "MAKE AN OFFER"
            ),

          chatError &&
            React.createElement(
              "p",
              { className: "listings-status listings-error" },
              chatError
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
      ),

    React.createElement(OfferModal, {
      open: offerOpen,
      listedPrice: product.priceValue,
      title: product.title,
      submitting: offerSubmitting,
      error: chatError,
      onClose: () => setOfferOpen(false),
      onSubmit: handleOffer,
    })
  );
}

export default ProductDetails;
