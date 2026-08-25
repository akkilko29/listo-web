import React, { useState } from "react";
import { Link } from "react-router-dom";

import loginIcon from "../assets/listo_logo.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitted(false);

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to send reset link."
        );
      }

      if (result.success === false) {
        throw new Error(
          result.message ||
            "Unable to send reset link."
        );
      }

      setSubmitted(true);

    } catch (err) {
      setError(
        err.message ||
          "Unable to send reset link. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return React.createElement(
    "main",
    {
      className:
        "forgot-password-page",
    },

    React.createElement(
      "div",
      {
        className:
          "forgot-password-card",
      },

      /* =====================================
         ICON
      ===================================== */

      React.createElement(
        "div",
        {
          className:
            "login-icon",
        },

        React.createElement("img", {
          src: loginIcon,

          alt: "Listo",

          className:
            "login-icon-image",
        })
      ),

      /* =====================================
         HEADING
      ===================================== */

      React.createElement(
        "h1",
        null,
        "Forgot Password?"
      ),

      React.createElement(
        "p",
        {
          className:
            "forgot-password-subtitle",
        },
        "Enter the email address associated with your Listo account and we'll send you a link to reset your password."
      ),

      /* =====================================
         ERROR
      ===================================== */

      error &&
        React.createElement(
          "div",
          {
            className:
              "forgot-error-message",
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
         SUCCESS
      ===================================== */

      submitted &&
        React.createElement(
          "div",
          {
            className:
              "forgot-success-message",
          },

          React.createElement("i", {
            className:
              "fa-solid fa-circle-check",
          }),

          React.createElement(
            "span",
            null,
            "If an account exists for that email, a reset link has been sent. Please check your inbox and spam folder."
          )
        ),

      /* =====================================
         FORM
      ===================================== */

      React.createElement(
        "form",
        {
          className:
            "forgot-password-form",

          onSubmit:
            handleSubmit,
        },

        /* EMAIL */

        React.createElement(
          "div",
          {
            className:
              "forgot-form-group",
          },

          React.createElement(
            "label",
            {
              htmlFor:
                "forgotEmail",
            },

            "Email Address ",

            React.createElement(
              "span",
              {
                className:
                  "forgot-required",
              },
              "*"
            )
          ),

          React.createElement(
            "div",
            {
              className:
                "forgot-input-wrapper",
            },

            React.createElement("i", {
              className:
                "fa-regular fa-envelope",
            }),

            React.createElement(
              "input",
              {
                id:
                  "forgotEmail",

                type:
                  "email",

                value:
                  email,

                placeholder:
                  "example@example.com",

                onChange:
                  (event) => {
                    setEmail(
                      event.target.value
                    );

                    setError("");
                    setSubmitted(false);
                  },

                required:
                  true,

                autoComplete:
                  "email",
              }
            )
          )
        ),

        /* ===================================
           SUBMIT BUTTON
        =================================== */

        React.createElement(
          "button",
          {
            type:
              "submit",

            className:
              "forgot-submit-button",

            disabled:
              submitting,
          },

          React.createElement("i", {
            className:
              submitting
                ? "fa-solid fa-spinner fa-spin"
                : "fa-solid fa-paper-plane",
          }),

          submitting
            ? "SENDING..."
            : "SEND RESET LINK"
        )
      ),

      /* =====================================
         BACK TO LOGIN
      ===================================== */

      React.createElement(
        "p",
        {
          className:
            "back-login-text",
        },

        React.createElement("i", {
          className:
            "fa-solid fa-arrow-left",
        }),

        " ",

        React.createElement(
          Link,
          {
            to:
              "/login",
          },
          "Back to Login"
        )
      )
    )
  );
}

export default ForgotPassword;