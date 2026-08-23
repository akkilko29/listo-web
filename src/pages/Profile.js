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

function formFromUser(user) {
  return {
    name: user?.name || "",
    phone: user?.phone || "",
    city: user?.city || "",
    state: user?.state || "",
  };
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

function field(id, label, value, onChange, options = {}) {
  return React.createElement(
    "div",
    { className: "profile-form-field", key: id },
    React.createElement(
      "label",
      { htmlFor: id },
      label,
      options.required
        ? React.createElement("span", { className: "profile-required" }, " *")
        : null
    ),
    React.createElement("input", {
      id,
      type: options.type || "text",
      value,
      onChange,
      placeholder: options.placeholder || "",
      required: Boolean(options.required),
      readOnly: Boolean(options.readOnly),
      disabled: Boolean(options.disabled),
    })
  );
}

function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState(() => formFromUser(user));
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        if (cancelled) {
          return;
        }

        const next = me || user;
        setProfile(next);
        setForm(formFromUser(next));
      })
      .catch((err) => {
        if (!cancelled) {
          setProfile(user);
          setForm(formFromUser(user));
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

  const handleChange = (name) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const phone = form.phone.trim();
    const city = form.city.trim();
    const state = form.state.trim();

    if (!name || !phone || !city || !state) {
      setError("Please fill name, phone, city, and state");
      return;
    }

    setSaving(true);

    try {
      const updated = await updateProfile({ name, phone, city, state });
      setProfile(updated || { ...profile, name, phone, city, state });
      setForm(formFromUser(updated || { ...form, name, phone, city, state }));
      setSuccess("Profile updated");
    } catch (err) {
      setError(err.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(formFromUser(profile));
    setError("");
    setSuccess("");
  };

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
        React.createElement("p", null, "View and update your Listo account details")
      ),

      loading &&
        React.createElement("p", { className: "profile-page-status" }, "Loading profile..."),

      error &&
        React.createElement("div", { className: "profile-page-error" }, error),

      success &&
        React.createElement("div", { className: "profile-page-success" }, success),

      !loading &&
        React.createElement(
          "form",
          {
            className: "profile-page-card",
            onSubmit: handleSubmit,
          },

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
            { className: "profile-form-grid" },
            field("profile-email", "Email", profile?.email || "", undefined, {
              type: "email",
              readOnly: true,
              disabled: true,
            }),
            field("profile-name", "Full name", form.name, handleChange("name"), {
              required: true,
              placeholder: "Your name",
            }),
            field("profile-phone", "Phone", form.phone, handleChange("phone"), {
              type: "tel",
              required: true,
              placeholder: "9876543210",
            }),
            field("profile-city", "City", form.city, handleChange("city"), {
              required: true,
              placeholder: "Patna",
            }),
            field("profile-state", "State", form.state, handleChange("state"), {
              required: true,
              placeholder: "Bihar",
            })
          ),

          React.createElement(
            "div",
            { className: "profile-page-actions" },
            React.createElement(
              "button",
              {
                type: "submit",
                className: "profile-action-button",
                disabled: saving,
              },
              saving ? "SAVING..." : "SAVE CHANGES"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                className: "profile-action-button secondary",
                onClick: handleReset,
                disabled: saving,
              },
              "RESET"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                className: "profile-action-button secondary",
                onClick: () => navigate("/my-listings"),
              },
              "MY LISTINGS"
            )
          )
        )
    )
  );
}

export default Profile;
