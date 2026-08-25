import React, { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import listoLogo from "../assets/listo_logo.png";

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  /*
   * Token comes from:
   *
   * /reset-password?token=UUID
   */

  const token =
    searchParams.get("token");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Check reset token
     */

    if (!token) {
      setError(
        "Invalid or expired password reset link."
      );

      return;
    }

    /*
     * Password validation
     */

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }

    /*
     * Confirm password
     */

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    setSubmitting(true);

    try {
      /*
       * =====================================
       * RESET PASSWORD API
       * =====================================
       */

      const response = await fetch(
        "http://localhost:8080/api/auth/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            token: token,

            newPassword:
              password,
          }),
        }
      );

      /*
       * Read response
       */

      let result = {};

      try {
        result =
          await response.json();
      } catch {
        result = {};
      }

      /*
       * Backend error
       */

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Unable to reset password."
        );
      }

      /*
       * Backend may return:
       *
       * success:false
       */

      if (
        result.success === false
      ) {
        throw new Error(
          result.message ||
          "Unable to reset password."
        );
      }

      /*
       * =====================================
       * SUCCESS
       * =====================================
       */

      setSuccess(
        result.message ||
        "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      /*
       * Redirect to login
       * after a short delay.
       */

      setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true,
            state: {
              message:
                "Password reset successfully. Please login.",
            },
          }
        );
      }, 1500);

    } catch (err) {

      setError(
        err.message ||
        "Unable to reset password."
      );

    } finally {

      setSubmitting(false);
    }
  };

  /* =========================================
     UI
  ========================================= */

  return React.createElement(
    "main",
    {
      className:
        "reset-password-page",
    },

    React.createElement(
      "div",
      {
        className:
          "reset-password-card",
      },

      /* =====================================
         LOGO
      ===================================== */

      React.createElement(
        "div",
        {
          className:
            "reset-password-icon",
        },

        React.createElement(
          "img",
          {
            src:
              listoLogo,

            alt:
              "Listo",

            className:
              "reset-password-logo",
          }
        )
      ),

      /* =====================================
         HEADING
      ===================================== */

      React.createElement(
        "h1",
        null,
        "Set New Password"
      ),

      React.createElement(
        "p",
        {
          className:
            "reset-password-subtitle",
        },
        "Create a new password for your Listo account."
      ),

      /* =====================================
         ERROR
      ===================================== */

      error &&
        React.createElement(
          "div",
          {
            className:
              "reset-password-error",
          },

          React.createElement(
            "i",
            {
              className:
                "fa-solid fa-circle-exclamation",
            }
          ),

          React.createElement(
            "span",
            null,
            error
          )
        ),

      /* =====================================
         SUCCESS
      ===================================== */

      success &&
        React.createElement(
          "div",
          {
            className:
              "reset-password-success",
          },

          React.createElement(
            "i",
            {
              className:
                "fa-solid fa-circle-check",
            }
          ),

          React.createElement(
            "span",
            null,
            success
          )
        ),

      /* =====================================
         FORM
      ===================================== */

      React.createElement(
        "form",
        {
          className:
            "reset-password-form",

          onSubmit:
            handleSubmit,
        },

        /* ===================================
           NEW PASSWORD
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "reset-form-group",
          },

          React.createElement(
            "label",
            {
              htmlFor:
                "newPassword",
            },

            "New Password ",

            React.createElement(
              "span",
              {
                className:
                  "reset-required",
              },
              "*"
            )
          ),

          React.createElement(
            "div",
            {
              className:
                "reset-password-input-wrapper",
            },

            React.createElement(
              "input",
              {
                id:
                  "newPassword",

                type:
                  showPassword
                    ? "text"
                    : "password",

                value:
                  password,

                onChange:
                  (event) => {
                    setPassword(
                      event.target.value
                    );

                    setError("");
                  },

                placeholder:
                  "Enter new password",

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
                  "reset-password-toggle",

                onClick:
                  () =>
                    setShowPassword(
                      !showPassword
                    ),

                "aria-label":
                  "Toggle password visibility",
              },

              React.createElement(
                "i",
                {
                  className:
                    showPassword
                      ? "fa-regular fa-eye"
                      : "fa-regular fa-eye-slash",
                }
              )
            )
          )
        ),

        /* ===================================
           CONFIRM PASSWORD
        =================================== */

        React.createElement(
          "div",
          {
            className:
              "reset-form-group",
          },

          React.createElement(
            "label",
            {
              htmlFor:
                "confirmPassword",
            },

            "Confirm Password ",

            React.createElement(
              "span",
              {
                className:
                  "reset-required",
              },
              "*"
            )
          ),

          React.createElement(
            "div",
            {
              className:
                "reset-password-input-wrapper",
            },

            React.createElement(
              "input",
              {
                id:
                  "confirmPassword",

                type:
                  showConfirmPassword
                    ? "text"
                    : "password",

                value:
                  confirmPassword,

                onChange:
                  (event) => {
                    setConfirmPassword(
                      event.target.value
                    );

                    setError("");
                  },

                placeholder:
                  "Confirm new password",

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
                  "reset-password-toggle",

                onClick:
                  () =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    ),

                "aria-label":
                  "Toggle password visibility",
              },

              React.createElement(
                "i",
                {
                  className:
                    showConfirmPassword
                      ? "fa-regular fa-eye"
                      : "fa-regular fa-eye-slash",
                }
              )
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
              "reset-password-strength",
          },

          React.createElement(
            "div",
            {
              className:
                "reset-strength-header",
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
                  "reset-strength-status",
              },

              password.length >= 8
                ? "Strong"
                : password.length > 0
                ? "Weak"
                : ""
            )
          ),

          React.createElement(
            "div",
            {
              className:
                "reset-strength-bars",
            },

            React.createElement(
              "span",
              {
                className:
                  password.length >= 4
                    ? "reset-strength-active"
                    : "",
              }
            ),

            React.createElement(
              "span",
              {
                className:
                  password.length >= 8
                    ? "reset-strength-active"
                    : "",
              }
            ),

            React.createElement(
              "span",
              {
                className:
                  password.length >= 10
                    ? "reset-strength-active"
                    : "",
              }
            )
          )
        ),

        /* ===================================
           SUBMIT
        =================================== */

        React.createElement(
          "button",
          {
            type:
              "submit",

            className:
              "reset-password-button",

            disabled:
              submitting ||
              !token,
          },

          React.createElement(
            "i",
            {
              className:
                submitting
                  ? "fa-solid fa-spinner fa-spin"
                  : "fa-solid fa-key",
            }
          ),

          submitting
            ? "UPDATING..."
            : "UPDATE PASSWORD"
        )
      ),

      /* =====================================
         LOGIN
      ===================================== */

      React.createElement(
        "p",
        {
          className:
            "reset-login-text",
        },

        "Remember your password? ",

        React.createElement(
          "a",
          {
            href:
              "/login",
          },
          "Log in"
        )
      )
    )
  );
}

export default ResetPassword;