import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { resolveMediaUrl } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";
import { changePassword, requestAccountDeletion } from "../services/authService";
import { clearAllClientData } from "../services/authStorage";
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
      autoComplete: options.autoComplete || "off",
    })
  );
}

function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser, updateProfile, updateProfilePhoto, logout } =
    useAuth();
  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState(() => formFromUser(user));
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteResult, setDeleteResult] = useState(null);

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

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }

    setError("");
    setSuccess("");
    setUploadingPhoto(true);

    try {
      const updated = await updateProfilePhoto(file);
      if (updated) {
        setProfile(updated);
        setForm(formFromUser(updated));
      }
      setSuccess("Profile photo updated");
    } catch (err) {
      setError(err.message || "Unable to update profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordChange = (name) => (event) => {
    const value = event.target.value;
    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const oldPassword = passwordForm.oldPassword;
    const newPassword = passwordForm.newPassword;
    const confirmPassword = passwordForm.confirmPassword;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    if (newPassword === oldPassword) {
      setPasswordError("New password must be different from the current password");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);

    try {
      const message = await changePassword({ oldPassword, newPassword });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess(message || "Password changed successfully");
    } catch (err) {
      setPasswordError(err.message || "Unable to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteResult(null);
    setDeletingAccount(true);

    try {
      const data = await requestAccountDeletion();
      const message =
        data?.message ||
        "Account deletion requested. Your account and related data will be permanently deleted after 30 days unless you log in again.";
      clearAllClientData();
      logout();
      navigate("/login", {
        replace: true,
        state: { message },
      });
    } catch (err) {
      setDeleteError(err.message || "Unable to request account deletion");
      setDeletingAccount(false);
    }
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
            React.createElement(
              "div",
              { className: "profile-photo-wrap" },
              React.createElement(ProfileAvatar, { user: profile }),
              React.createElement("input", {
                id: "profile-photo-input",
                className: "profile-photo-input",
                type: "file",
                accept: "image/*",
                onChange: handlePhotoChange,
                disabled: uploadingPhoto,
              }),
              React.createElement(
                "label",
                {
                  htmlFor: "profile-photo-input",
                  className: "profile-photo-change",
                },
                uploadingPhoto ? "Uploading..." : "Change photo"
              )
            ),
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
              placeholder: "City",
            }),
            field("profile-state", "State", form.state, handleChange("state"), {
              required: true,
              placeholder: "State",
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
                disabled: saving || uploadingPhoto,
              },
              saving ? "SAVING..." : "SAVE CHANGES"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                className: "profile-action-button secondary",
                onClick: handleReset,
                disabled: saving || uploadingPhoto,
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
        ),

      !loading &&
        React.createElement(
          "form",
          {
            className: "profile-page-card profile-password-card",
            onSubmit: handlePasswordSubmit,
          },

          React.createElement(
            "div",
            { className: "profile-password-header" },
            React.createElement("h2", null, "Change password"),
            React.createElement(
              "p",
              null,
              "Use your current password to set a new one"
            )
          ),

          passwordError &&
            React.createElement(
              "div",
              { className: "profile-page-error profile-inline-message" },
              passwordError
            ),

          passwordSuccess &&
            React.createElement(
              "div",
              { className: "profile-page-success profile-inline-message" },
              passwordSuccess
            ),

          React.createElement(
            "div",
            { className: "profile-form-grid" },
            field(
              "profile-old-password",
              "Current password",
              passwordForm.oldPassword,
              handlePasswordChange("oldPassword"),
              {
                type: "password",
                required: true,
                placeholder: "Current password",
                autoComplete: "current-password",
              }
            ),
            field(
              "profile-new-password",
              "New password",
              passwordForm.newPassword,
              handlePasswordChange("newPassword"),
              {
                type: "password",
                required: true,
                placeholder: "New password",
                autoComplete: "new-password",
              }
            ),
            field(
              "profile-confirm-password",
              "Confirm new password",
              passwordForm.confirmPassword,
              handlePasswordChange("confirmPassword"),
              {
                type: "password",
                required: true,
                placeholder: "Confirm new password",
                autoComplete: "new-password",
              }
            )
          ),

          React.createElement(
            "div",
            { className: "profile-page-actions" },
            React.createElement(
              "button",
              {
                type: "submit",
                className: "profile-action-button",
                disabled: changingPassword,
              },
              changingPassword ? "UPDATING..." : "UPDATE PASSWORD"
            )
          )
        ),

      !loading &&
        React.createElement(
          "section",
          { className: "profile-page-card profile-password-card profile-danger-card" },

          React.createElement(
            "div",
            { className: "profile-password-header" },
            React.createElement("h2", null, "Delete account"),
            React.createElement(
              "p",
              null,
              "Request permanent deletion of your account and related data. Deletion is scheduled 30 days after you confirm. Logging in again during that period cancels the request."
            )
          ),

          deleteError &&
            React.createElement(
              "div",
              { className: "profile-page-error profile-inline-message" },
              deleteError
            ),

          deleteResult &&
            React.createElement(
              "div",
              { className: "profile-page-success profile-inline-message" },
              deleteResult.message ||
                "Account deletion requested. Your account will be permanently deleted after 30 days unless you log in again."
            ),

          React.createElement(
            "div",
            { className: "profile-page-actions" },
            !deleteConfirming &&
              !deleteResult &&
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "profile-action-button danger",
                  onClick: () => {
                    setDeleteError("");
                    setDeleteConfirming(true);
                  },
                  disabled: deletingAccount,
                },
                "DELETE ACCOUNT"
              ),
            deleteConfirming &&
              !deleteResult &&
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "profile-action-button danger",
                  onClick: handleDeleteAccount,
                  disabled: deletingAccount,
                },
                deletingAccount ? "REQUESTING..." : "CONFIRM DELETE"
              ),
            deleteConfirming &&
              !deleteResult &&
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "profile-action-button secondary",
                  onClick: () => {
                    setDeleteConfirming(false);
                    setDeleteError("");
                  },
                  disabled: deletingAccount,
                },
                "CANCEL"
              )
          )
        )
    )
  );
}

export default Profile;
