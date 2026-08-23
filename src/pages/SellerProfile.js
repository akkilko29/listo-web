import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { resolveMediaUrl } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/authService";
import { getCurrentUserId } from "../services/conversationService";
import { getProducts } from "../services/productService";
import "../style/Profile.css";
import "../style/TrendingClassifieds.css";
import "../style/SellerProfile.css";

function getInitials(name) {
  if (!name) {
    return "S";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function SellerAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = resolveMediaUrl(user?.profilePhotoUrl);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  if (photoUrl && !imageFailed) {
    return React.createElement("img", {
      src: photoUrl,
      alt: user?.name || "Seller",
      className: "profile-page-photo",
      onError: () => setImageFailed(true),
    });
  }

  return React.createElement(
    "span",
    { className: "profile-page-photo profile-page-photo-fallback" },
    getInitials(user?.name)
  );
}

function detailRow(icon, label, value) {
  return React.createElement(
    "div",
    { className: "profile-detail-row", key: label },
    React.createElement("i", { className: icon }),
    React.createElement(
      "div",
      null,
      React.createElement("span", { className: "profile-detail-label" }, label),
      React.createElement(
        "strong",
        { className: "profile-detail-value" },
        value || "—"
      )
    )
  );
}

function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile =
    (currentUser?.id && String(currentUser.id) === String(id)) ||
    (getCurrentUserId() && String(getCurrentUserId()) === String(id));

  useEffect(() => {
    if (!id) {
      setError("Seller not found");
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      getUserById(id),
      getProducts().catch(() => []),
    ])
      .then(([user, products]) => {
        if (cancelled) {
          return;
        }

        if (!user) {
          setSeller(null);
          setListings([]);
          setError("Seller not found");
          return;
        }

        setSeller(user);
        setListings(
          (products || []).filter(
            (product) => String(product.sellerId) === String(user.id)
          )
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setSeller(null);
          setListings([]);
          setError(err.message || "Unable to load seller profile");
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

  const location = [seller?.city, seller?.state].filter(Boolean).join(", ");

  return React.createElement(
    "main",
    { className: "profile-page seller-profile-page" },

    React.createElement(
      "div",
      { className: "profile-page-container seller-profile-container" },

      React.createElement(
        "div",
        { className: "profile-page-header" },
        React.createElement("h1", null, "Seller Profile"),
        React.createElement("p", null, "Public seller information on Listo")
      ),

      loading &&
        React.createElement("p", { className: "profile-page-status" }, "Loading seller..."),

      error &&
        React.createElement("div", { className: "profile-page-error" }, error),

      !loading &&
        seller &&
        React.createElement(
          "section",
          { className: "profile-page-card" },

          React.createElement(
            "div",
            { className: "profile-page-hero" },
            React.createElement(SellerAvatar, { user: seller }),
            React.createElement(
              "div",
              { className: "profile-page-identity" },
              React.createElement("h2", null, seller.name || "Seller"),
              React.createElement(
                "span",
                { className: "profile-role-badge" },
                seller.role || "USER"
              ),
              location &&
                React.createElement(
                  "p",
                  { className: "profile-page-location" },
                  React.createElement("i", {
                    className: "fa-solid fa-location-dot",
                  }),
                  location
                )
            )
          ),

          React.createElement(
            "div",
            { className: "profile-detail-grid" },
            detailRow("fa-regular fa-envelope", "Email", seller.email),
            detailRow("fa-solid fa-phone", "Phone", seller.phone),
            detailRow("fa-solid fa-city", "City", seller.city),
            detailRow("fa-solid fa-map", "State", seller.state)
          ),

          isOwnProfile &&
            React.createElement(
              "div",
              { className: "profile-page-actions" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "profile-action-button",
                  onClick: () => navigate("/profile"),
                },
                "EDIT YOUR PROFILE"
              )
            )
        ),

      !loading &&
        seller &&
        React.createElement(
          "section",
          { className: "seller-listings-section" },
          React.createElement(
            "h2",
            { className: "seller-listings-title" },
            listings.length
              ? `Listings by ${seller.name || "this seller"}`
              : "No listings from this seller yet"
          ),

          listings.length > 0 &&
            React.createElement(
              "div",
              { className: "classifieds-grid" },
              listings.map((listing) =>
                React.createElement(
                  "article",
                  {
                    key: listing.id,
                    className: "classified-card",
                    onClick: () => navigate(`/product/${listing.id}`),
                  },
                  React.createElement(
                    "div",
                    { className: "classified-image-wrapper" },
                    listing.image
                      ? React.createElement("img", {
                          src: listing.image,
                          alt: listing.title,
                          className: "classified-image",
                        })
                      : React.createElement(
                          "div",
                          {
                            className:
                              "classified-image classified-image-empty",
                          },
                          React.createElement("i", {
                            className: "fa-regular fa-image",
                          })
                        ),
                    listing.sold &&
                      React.createElement(
                        "span",
                        { className: "sold-badge" },
                        "SOLD"
                      )
                  ),
                  React.createElement(
                    "div",
                    { className: "classified-content" },
                    React.createElement(
                      "div",
                      { className: "classified-price" },
                      listing.price
                    ),
                    React.createElement("h3", null, listing.title),
                    React.createElement(
                      "div",
                      { className: "classified-meta" },
                      React.createElement(
                        "span",
                        null,
                        React.createElement("i", {
                          className: "fa-solid fa-location-dot",
                        }),
                        listing.location || "India"
                      ),
                      React.createElement("span", null, listing.time)
                    )
                  )
                )
              )
            )
        )
    )
  );
}

export default SellerProfile;
