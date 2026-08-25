import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import RegisterOtp from "./RegisterOtp";

import listoLogo from "../assets/listo_logo.png";

function Register() {
  const { register } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [otpStep, setOtpStep] =
    useState(false);

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    state: "",
    profilePhoto: null,
  });

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /* =========================================
     PROFILE PHOTO
  ========================================= */

  const handlePhotoChange = (event) => {
    const file =
      event.target.files?.[0] || null;

    setFormData((previous) => ({
      ...previous,
      profilePhoto: file,
    }));

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(
      file
        ? URL.createObjectURL(file)
        : ""
    );
  };

  /* =========================================
     REGISTER
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!acceptedTerms) {
      setError(
        "Please accept the Terms of Service and Privacy Policy."
      );

      return;
    }

    setSubmitting(true);

    try {
      /*
       * STEP 1
       *
       * POST /api/auth/register
       *
       * Backend sends OTP to email.
       */

      await register({
        name:
          formData.fullName.trim(),

        email:
          formData.email.trim(),

        password:
          formData.password,

        phone:
          formData.phone.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),
      });

      /*
       * IMPORTANT
       *
       * DO NOT navigate to login here.
       *
       * Move to OTP screen.
       */

      setOtpStep(true);

    } catch (err) {
      setError(
        err.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================
     OTP STEP
  ========================================= */

  if (otpStep) {
    return React.createElement(
      "main",
      {
        className: "register-page",
      },

      React.createElement(
        RegisterOtp,
        {
          email:
            formData.email.trim(),

          profilePhoto:
            formData.profilePhoto,

          onBack: () => {
            setOtpStep(false);
            setError("");
          },
        }
      )
    );
  }

  /* =========================================
     REGISTER PAGE
  ========================================= */

  return React.createElement(
    "main",
    {
      className: "register-page",
    },

    React.createElement(
      "div",
      {
        className: "register-card",
      },

      /* =====================================
         LOGO
      ===================================== */

      React.createElement(
        "div",
        {
          className: "login-icon",
        },

        React.createElement("img", {
          src: listoLogo,
          alt: "Listo",
          className: "login-icon-image",
        })
      ),

      /* =====================================
         HEADING
      ===================================== */

      React.createElement(
        "h1",
        null,
        "Create Your Account"
      ),

      React.createElement(
        "p",
        {
          className: "register-subtitle",
        },
        "Join our premium community of sellers and buyers today."
      ),

      /* =====================================
         ERROR
      ===================================== */

      error &&
        React.createElement(
          "div",
          {
            className: "auth-error",
          },

          React.createElement("i", {
            className:
              "fa-solid fa-circle-exclamation",
          }),

          React.createElement(
            "span",
            null,
            error
          )
        ),

      /* =====================================
         FORM
      ===================================== */

      React.createElement(
        "form",
        {
          className: "register-form",
          onSubmit: handleSubmit,
        },

        /* ===================================
           PROFILE PHOTO
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "register-photo-field",
          },

          React.createElement(
            "label",
            {
              className:
                "register-photo-preview",

              htmlFor:
                "profilePhoto",
            },

            photoPreview
              ? React.createElement(
                  "img",
                  {
                    src:
                      photoPreview,

                    alt:
                      "Profile preview",
                  }
                )
              : React.createElement(
                  "i",
                  {
                    className:
                      "fa-regular fa-user",
                  }
                )
          ),

          React.createElement(
            "div",
            {
              className:
                "register-photo-meta",
            },

            React.createElement(
              "label",
              {
                htmlFor:
                  "profilePhoto",
              },
              "Profile photo"
            ),

            React.createElement(
              "input",
              {
                id:
                  "profilePhoto",

                name:
                  "profilePhoto",

                type:
                  "file",

                accept:
                  "image/*",

                onChange:
                  handlePhotoChange,
              }
            )
          )
        ),

        /* ===================================
           FULL NAME
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "register-form-group",
          },

          React.createElement(
            "label",
            {
              htmlFor:
                "fullName",
            },

            "Full Name ",

            React.createElement(
              "span",
              {
                className:
                  "register-required",
              },
              "*"
            )
          ),

          React.createElement(
            "input",
            {
              id:
                "fullName",

              name:
                "fullName",

              type:
                "text",

              value:
                formData.fullName,

              onChange:
                handleChange,

              placeholder:
                "First Name Last Name",

              autoComplete:
                "name",

              required:
                true,
            }
          )
        ),

        /* ===================================
           EMAIL
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "register-form-group",
          },

          React.createElement(
            "label",
            {
              htmlFor:
                "registerEmail",
            },

            "Email Address ",

            React.createElement(
              "span",
              {
                className:
                  "register-required",
              },
              "*"
            )
          ),

          React.createElement(
            "input",
            {
              id:
                "registerEmail",

              name:
                "email",

              type:
                "email",

              value:
                formData.email,

              onChange:
                handleChange,

              placeholder:
                "example@example.com",

              autoComplete:
                "email",

              required:
                true,
            }
          )
        ),

        /* ===================================
           PHONE
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "register-form-group",
          },

          React.createElement(
            "label",
            {
              htmlFor:
                "phone",
            },

            "Phone Number ",

            React.createElement(
              "span",
              {
                className:
                  "register-required",
              },
              "*"
            )
          ),

          React.createElement(
            "input",
            {
              id:
                "phone",

              name:
                "phone",

              type:
                "tel",

              value:
                formData.phone,

              onChange:
                handleChange,

              placeholder:
                "9876543210",

              autoComplete:
                "tel",

              required:
                true,
            }
          )
        ),

        /* ===================================
           CITY + STATE
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "register-form-row",
          },

          /* CITY */

          React.createElement(
            "div",
            {
              className:
                "register-form-group",
            },

            React.createElement(
              "label",
              {
                htmlFor:
                  "city",
              },

              "City ",

              React.createElement(
                "span",
                {
                  className:
                    "register-required",
                },
                "*"
              )
            ),

            React.createElement(
              "input",
              {
                id:
                  "city",

                name:
                  "city",

                type:
                  "text",

                value:
                  formData.city,

                onChange:
                  handleChange,

                placeholder:
                  "Mumbai",

                required:
                  true,
              }
            )
          ),

          /* STATE */

          React.createElement(
            "div",
            {
              className:
                "register-form-group",
            },

            React.createElement(
              "label",
              {
                htmlFor:
                  "state",
              },

              "State ",

              React.createElement(
                "span",
                {
                  className:
                    "register-required",
                },
                "*"
              )
            ),

            React.createElement(
              "input",
              {
                id:
                  "state",

                name:
                  "state",

                type:
                  "text",

                value:
                  formData.state,

                onChange:
                  handleChange,

                placeholder:
                  "Maharashtra",

                required:
                  true,
              }
            )
          )
        ),

        /* ===================================
           PASSWORD
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "register-form-group",
          },

          React.createElement(
            "label",
            {
              htmlFor:
                "registerPassword",
            },

            "Password ",

            React.createElement(
              "span",
              {
                className:
                  "register-required",
              },
              "*"
            )
          ),

          React.createElement(
            "div",
            {
              className:
                "register-password-container",
            },

            React.createElement(
              "input",
              {
                id:
                  "registerPassword",

                name:
                  "password",

                type:
                  showPassword
                    ? "text"
                    : "password",

                value:
                  formData.password,

                onChange:
                  handleChange,

                placeholder:
                  "Create a strong password",

                autoComplete:
                  "new-password",

                required:
                  true,
              }
            ),

            React.createElement(
              "button",
              {
                type:
                  "button",

                className:
                  "register-password-toggle",

                onClick: () =>
                  setShowPassword(
                    !showPassword
                  ),

                "aria-label":
                  "Toggle password visibility",
              },

              React.createElement("i", {
                className:
                  showPassword
                    ? "fa-regular fa-eye"
                    : "fa-regular fa-eye-slash",
              })
            )
          )
        ),

        /* ===================================
           PASSWORD STRENGTH
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "password-strength",
          },

          React.createElement(
            "div",
            {
              className:
                "strength-header",
            },

            React.createElement(
              "span",
              null,
              "Password Strength"
            ),

            React.createElement(
              "span",
              {
                className:
                  "strength-status",
              },

              formData.password
                ? "Strong"
                : ""
            )
          ),

          React.createElement(
            "div",
            {
              className:
                "strength-bars",
            },

            React.createElement("span", {
              className:
                formData.password
                  ? "strength-active"
                  : "",
            }),

            React.createElement("span", {
              className:
                formData.password
                  ? "strength-active"
                  : "",
            }),

            React.createElement("span", {
              className:
                formData.password
                  ? "strength-active"
                  : "",
            })
          )
        ),

        /* ===================================
           TERMS
        =================================== */

        React.createElement(
          "label",
          {
            className:
              "terms-container",
          },

          React.createElement(
            "input",
            {
              type:
                "checkbox",

              checked:
                acceptedTerms,

              onChange:
                (event) =>
                  setAcceptedTerms(
                    event.target.checked
                  ),
            }
          ),

          React.createElement(
            "span",
            {
              className:
                "custom-checkbox",
            },

            acceptedTerms
              ? React.createElement(
                  "i",
                  {
                    className:
                      "fa-solid fa-check",
                  }
                )
              : null
          ),

          React.createElement(
            "span",
            {
              className:
                "terms-text",
            },

            "I accept and agree to the ",

            React.createElement(
              Link,
              {
                to:
                  "/terms",
              },
              "Terms of Service"
            ),

            " and ",

            React.createElement(
              Link,
              {
                to:
                  "/privacy",
              },
              "Privacy Policy"
            ),

            "."
          )
        ),

        /* ===================================
           CREATE ACCOUNT
        =================================== */

        React.createElement(
          "button",
          {
            type:
              "submit",

            className:
              "create-account-button",

            disabled:
              submitting,
          },

          submitting
            ? "SENDING OTP..."
            : "CREATE ACCOUNT"
        )
      ),

      /* =====================================
         LOGIN
      ===================================== */

      React.createElement(
        "p",
        {
          className:
            "already-account",
        },

        "Already have an account? ",

        React.createElement(
          Link,
          {
            to:
              "/login",
          },
          "Log in"
        )
      )
    )
  );
}

export default Register;