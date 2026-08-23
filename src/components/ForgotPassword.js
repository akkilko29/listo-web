import React, { useState } from "react";

import loginIcon from "../assets/listo_logo.png";
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Forgot password:", email);

    setSubmitted(true);
  };

  return React.createElement(
    "main",
    { className: "forgot-password-page" },

    React.createElement(
      "div",
      { className: "forgot-password-card" },

      /* Icon */

      React.createElement(
        "div",
        { className: "login-icon" },
      
        React.createElement("img", {
          src: loginIcon,
          alt: "Login",
          className: "login-icon-image",
        })
      ),

      /* Heading */

      React.createElement(
        "h1",
        null,
        "Forgot Password?"
      ),

      React.createElement(
        "p",
        { className: "forgot-password-subtitle" },
        "Enter the email address associated with your Listo account and we'll send you a link to reset your password."
      ),

      /* Success Message */

      submitted &&
        React.createElement(
          "div",
          { className: "forgot-success-message" },

          React.createElement("i", {
            className: "fa-solid fa-circle-check",
          }),

          React.createElement(
            "span",
            null,
            "Reset link has been sent to your email."
          )
        ),

      /* Form */

      React.createElement(
        "form",
        {
          className: "forgot-password-form",
          onSubmit: handleSubmit,
        },

        React.createElement(
          "div",
          { className: "forgot-form-group" },

          React.createElement(
            "label",
            { htmlFor: "forgotEmail" },

            "Email Address ",

            React.createElement(
              "span",
              { className: "forgot-required" },
              "*"
            )
          ),

          React.createElement(
            "div",
            { className: "forgot-input-wrapper" },

            React.createElement("i", {
              className: "fa-regular fa-envelope",
            }),

            React.createElement("input", {
              id: "forgotEmail",
              type: "email",
              value: email,
              placeholder: "example@example.com",
              onChange: (event) =>
                setEmail(event.target.value),
              required: true,
            })
          )
        ),

        React.createElement(
          "button",
          {
            type: "submit",
            className: "forgot-submit-button",
          },

          React.createElement("i", {
            className: "fa-solid fa-paper-plane",
          }),

          "SEND RESET LINK"
        )
      ),

      /* Back to Login */

      React.createElement(
        "p",
        { className: "back-login-text" },

        React.createElement("i", {
          className: "fa-solid fa-arrow-left",
        }),

        " ",

        React.createElement(
          "a",
          {
            href: "/login",
          },
          "Back to Login"
        )
      )
    )
  );
}

export default ForgotPassword;