import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { resolveMediaUrl } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";
import "../style/Profile.css";

function getInitials(name) {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function ProfileAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = resolveMediaUrl(user?.profilePhotoUrl);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  if (photoUrl && !imageFailed) {
    return React.createElement("img", {
      src: photoUrl,
      alt: user?.name || "Profile",
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

function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    refreshUser()
      .then((me) => {
        if (!cancelled) {
          setProfile(me || user);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setProfile(user);
          setError(err.message || "Unable to load profile");
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
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const location = [profile?.city, profile?.state].filter(Boolean).join(", ");

  return React.createElement(
    "main",
    { className: "profile-page" },

    React.createElement(
      "div",
      { className: "profile-page-container" },

      React.createElement(
        "div",
        { className: "profile-page-header" },
        React.createElement("h1", null, "My Profile"),
        React.createElement("p", null, "Your Listo account details")
      ),

      loading &&
        React.createElement("p", { className: "profile-page-status" }, "Loading profile..."),

      error &&
        React.createElement("div", { className: "profile-page-error" }, error),

      !loading &&
        React.createElement(
          "section",
          { className: "profile-page-card" },

          React.createElement(
            "div",
            { className: "profile-page-hero" },
            React.createElement(ProfileAvatar, { user: profile }),
            React.createElement(
              "div",
              { className: "profile-page-identity" },
              React.createElement("h2", null, profile?.name || "User"),
              React.createElement(
                "span",
                { className: "profile-role-badge" },
                profile?.role || "USER"
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
            detailRow("fa-regular fa-envelope", "Email", profile?.email),
            detailRow("fa-solid fa-phone", "Phone", profile?.phone),
            detailRow("fa-solid fa-city", "City", profile?.city),
            detailRow("fa-solid fa-map", "State", profile?.state)
          ),

          React.createElement(
            "div",
            { className: "profile-page-actions" },
            React.createElement(
              "button",
              {
                type: "button",
                className: "profile-action-button",
                onClick: () => navigate("/my-listings"),
              },
              React.createElement("i", { className: "fa-solid fa-box" }),
              " My Listings"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                className: "profile-action-button secondary",
                onClick: () => navigate("/wishlist"),
              },
              React.createElement("i", { className: "fa-regular fa-heart" }),
              " Favorites"
            )
          )
        )
    )
  );
}

export default Profile;
