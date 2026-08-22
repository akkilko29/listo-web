import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import logo from "../assets/listo_logo.png";
import { resolveMediaUrl } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";
import { POPULAR_LOCATIONS } from "../data/popularLocations";
import {
  getCurrentCoordinates,
  reverseGeocode,
} from "../services/locationService";

const LOCATION_STORAGE_KEY = "listo.selectedLocation";

const ANDROID_APP_URL =
  import.meta.env.VITE_ANDROID_APP_URL ||
  "https://play.google.com/store/apps";
const IOS_APP_URL =
  import.meta.env.VITE_IOS_APP_URL || "https://apps.apple.com";

function getAppDownloadPlatform() {
  if (typeof navigator === "undefined") {
    return "desktop";
  }

  const userAgent = navigator.userAgent || "";
  const isIos =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (/android/i.test(userAgent)) {
    return "android";
  }

  if (isIos) {
    return "ios";
  }

  return "desktop";
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function UserAvatar({ user, className }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = resolveMediaUrl(user?.profilePhotoUrl);
  const initials = getInitials(user?.name);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  if (photoUrl && !imageFailed) {
    return React.createElement("img", {
      src: photoUrl,
      alt: user?.name || "Profile",
      className,
      onError: () => setImageFailed(true),
    });
  }

  return React.createElement("span", { className }, initials);
}

function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const [locationOpen, setLocationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("keyword") || ""
  );
  const [locationQuery, setLocationQuery] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [selectedLocation, setSelectedLocation] = useState(() => {
    return (
      window.localStorage.getItem(LOCATION_STORAGE_KEY) ||
      "Mumbai, Maharashtra"
    );
  });

  const locationRef = useRef(null);
  const profileRef = useRef(null);

  const popularLocations = POPULAR_LOCATIONS.filter((location) =>
    location.toLowerCase().includes(locationQuery.trim().toLowerCase())
  );

  useEffect(() => {
    setSearchQuery(searchParams.get("keyword") || "");
  }, [searchParams]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target)
      ) {
        setLocationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const selectLocation = (location) => {
    setSelectedLocation(location);
    window.localStorage.setItem(LOCATION_STORAGE_KEY, location);
    setLocationOpen(false);
    setLocationQuery("");
    setLocationError("");
  };

  const handleUseCurrentLocation = async () => {
    setDetectingLocation(true);
    setLocationError("");

    try {
      const coords = await getCurrentCoordinates();
      const label = await reverseGeocode(coords.latitude, coords.longitude);
      selectLocation(label);
    } catch (error) {
      setLocationError(error.message || "Unable to fetch current location");
    } finally {
      setDetectingLocation(false);
    }
  };

  const toggleLocation = () => {
    setLocationOpen(!locationOpen);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setLocationOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const keyword = searchQuery.trim();
    const params = new URLSearchParams();

    if (keyword) {
      params.set("keyword", keyword);
    }

    const query = params.toString();
    navigate(query ? `/listings?${query}` : "/listings");
  };

  const openProtected = (event, to) => {
    if (!isAuthenticated) {
      event.preventDefault();
      navigate("/login");
    }
  };

  const headerAction = (to, iconClass, label) =>
    React.createElement(
      Link,
      {
        to,
        className: "header-action",
        onClick: (event) => openProtected(event, to),
      },
      React.createElement("i", { className: iconClass }),
      React.createElement("span", null, label)
    );

  const appDownloadButton = (href, iconClass, label) =>
    React.createElement(
      "a",
      {
        href,
        className: "header-app-download",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      React.createElement("i", { className: iconClass }),
      React.createElement("span", null, label)
    );

  const appPlatform = getAppDownloadPlatform();
  const appDownloadButtonEl =
    appPlatform === "android"
      ? appDownloadButton(ANDROID_APP_URL, "fa-brands fa-google-play", "Android")
      : appPlatform === "ios"
        ? appDownloadButton(IOS_APP_URL, "fa-brands fa-apple", "iOS")
        : null;

  return React.createElement(
    "header",
    { className: "header" },

    /* =========================
       LOGO
    ========================= */

    React.createElement(
      Link,
      {
        to: "/",
        className: "header-logo",
      },

      React.createElement("img", {
        src: logo,
        alt: "Listo",
        className: "header-logo-image",
      }),

      React.createElement(
        "span",
        { className: "logo-name" },
        "Listo"
      )
    ),

    /* =========================
       LOCATION
    ========================= */

    React.createElement(
      "div",
      {
        className: "location-wrapper",
        ref: locationRef,
      },

      React.createElement(
        "button",
        {
          type: "button",
          className: "location-button",
          onClick: toggleLocation,
        },

        React.createElement("i", {
          className:
            "fa-solid fa-location-dot location-icon",
        }),

        React.createElement(
          "span",
          { className: "location-text" },
          selectedLocation
        ),

        React.createElement("i", {
          className: `fa-solid ${
            locationOpen
              ? "fa-chevron-up"
              : "fa-chevron-down"
          } location-chevron`,
        })
      ),

      locationOpen &&
        React.createElement(
          "div",
          { className: "location-dropdown" },

          React.createElement(
            "div",
            { className: "dropdown-title" },
            "Select Location"
          ),

          React.createElement("input", {
            type: "text",
            className: "location-search",
            placeholder: "Search city, area...",
            value: locationQuery,
            onChange: (event) => setLocationQuery(event.target.value),
          }),

          React.createElement(
            "button",
            {
              type: "button",
              className: "location-current-button",
              onClick: handleUseCurrentLocation,
              disabled: detectingLocation,
            },

            React.createElement("i", {
              className: detectingLocation
                ? "fa-solid fa-spinner fa-spin option-icon"
                : "fa-solid fa-location-crosshairs option-icon",
            }),

            React.createElement(
              "span",
              null,
              detectingLocation
                ? "Detecting current location..."
                : "Use current location"
            )
          ),

          locationError &&
            React.createElement(
              "div",
              { className: "location-error" },
              locationError
            ),

          React.createElement(
            "div",
            { className: "dropdown-title popular-title" },
            "Popular locations"
          ),

          React.createElement(
            "div",
            { className: "location-list" },

            popularLocations.length > 0
              ? popularLocations.map((location) =>
                  React.createElement(
                    "button",
                    {
                      key: location,
                      type: "button",
                      className: `location-option ${
                        selectedLocation === location ? "active" : ""
                      }`,
                      onClick: () => selectLocation(location),
                    },

                    React.createElement("i", {
                      className: "fa-solid fa-location-dot option-icon",
                    }),

                    React.createElement("span", null, location),

                    selectedLocation === location &&
                      React.createElement("i", {
                        className: "fa-solid fa-check option-check",
                      })
                  )
                )
              : React.createElement(
                  "div",
                  { className: "location-empty" },
                  "No matching locations"
                )
          )
        )
    ),

    /* =========================
       SEARCH
    ========================= */

    React.createElement(
      "form",
      {
        className: "search-container",
        onSubmit: handleSearch,
      },

      React.createElement("input", {
        type: "search",
        name: "keyword",
        value: searchQuery,
        onChange: (event) => setSearchQuery(event.target.value),
        placeholder:
          "Find Cars, Mobile Phones, Laptops and more...",
        autoComplete: "off",
      }),

      React.createElement(
        "button",
        {
          type: "submit",
          className: "search-button",
        },

        React.createElement("i", {
          className:
            "fa-solid fa-magnifying-glass",
        })
      )
    ),

    /* =========================
       WISHLIST + CHAT
    ========================= */

    appDownloadButtonEl &&
      React.createElement(
        "div",
        { className: "header-app-downloads" },
        appDownloadButtonEl
      ),

    React.createElement(
      "div",
      { className: "header-actions" },
      headerAction("/wishlist", "fa-regular fa-heart", "Wishlist"),
      headerAction("/chat", "fa-regular fa-comment-dots", "Chat")
    ),

    /* =========================
       AUTH SLOT
       Guest: Login icon
       User: circular profile
    ========================= */

    isAuthenticated
      ? React.createElement(
      "div",
      {
        className: "profile-wrapper",
        ref: profileRef,
      },

      React.createElement(
        "button",
        {
          type: "button",
          className: `profile-button ${
            profileOpen ? "profile-active" : ""
          }`,
          onClick: toggleProfile,
        },

        React.createElement(UserAvatar, {
          user,
          className: "profile-avatar",
        }),

        React.createElement("i", {
          className: `fa-solid ${
            profileOpen
              ? "fa-chevron-up"
              : "fa-chevron-down"
          } profile-chevron`,
        })
      ),

      /* =========================
         PROFILE DROPDOWN
      ========================= */

      profileOpen &&
        React.createElement(
          "div",
          { className: "profile-dropdown" },

          /* Profile Header */

          React.createElement(
            "div",
            { className: "profile-dropdown-header" },

            React.createElement(UserAvatar, {
              user,
              className: "profile-dropdown-avatar",
            }),

            React.createElement(
              "div",
              { className: "profile-info" },

              React.createElement(
                "strong",
                null,
                user?.name || "User"
              ),

              React.createElement(
                "span",
                null,
                "View and edit profile"
              )
            )
          ),

          /* Divider */

          React.createElement(
            "div",
            { className: "profile-divider" }
          ),

          /* Menu */

          React.createElement(
            "button",
            {
              type: "button",
              className: "profile-menu-item",
            },

            React.createElement("i", {
              className: "fa-regular fa-user",
            }),

            React.createElement(
              "span",
              null,
              "My Profile"
            )
          ),

          React.createElement(
            "button",
            {
              type: "button",
              className: "profile-menu-item",
            },

            React.createElement("i", {
              className: "fa-solid fa-box",
            }),

            React.createElement(
              "span",
              null,
              "My Listings"
            )
          ),

          React.createElement(
            "button",
            {
              type: "button",
              className: "profile-menu-item",
              onClick: () => {
                setProfileOpen(false);
                navigate("/wishlist");
              },
            },

            React.createElement("i", {
              className: "fa-regular fa-heart",
            }),

            React.createElement(
              "span",
              null,
              "Favorites"
            )
          ),

          React.createElement(
            "button",
            {
              type: "button",
              className: "profile-menu-item",
              onClick: () => {
                setProfileOpen(false);
                navigate("/chat");
              },
            },

            React.createElement("i", {
              className: "fa-regular fa-message",
            }),

            React.createElement(
              "span",
              null,
              "Messages"
            )
          ),

          React.createElement(
            "button",
            {
              type: "button",
              className: "profile-menu-item",
            },

            React.createElement("i", {
              className: "fa-solid fa-gear",
            }),

            React.createElement(
              "span",
              null,
              "Settings"
            )
          ),

          /* Divider */

          React.createElement(
            "div",
            { className: "profile-divider" }
          ),

          /* Logout */

          React.createElement(
            "button",
            {
              type: "button",
              className:
                "profile-menu-item logout-item",
              onClick: handleLogout,
            },

            React.createElement("i", {
              className:
                "fa-solid fa-arrow-right-from-bracket",
            }),

            React.createElement(
              "span",
              null,
              "Logout"
            )
          )
        )
      )
      : React.createElement(
          Link,
          {
            to: "/login",
            className: "header-login",
          },
          React.createElement("i", {
            className: "fa-regular fa-user header-login-icon",
          }),
          React.createElement("span", null, "Login")
        ),

    /* =========================
       SELL
    ========================= */

    React.createElement(
      Link,
      {
        to: "/add-product",
        className: "sell-button",
      },

      React.createElement("i", {
        className: "fa-solid fa-plus sell-icon",
      }),

      React.createElement(
        "span",
        null,
        "SELL"
      )
    )
  );
}

export default Header;