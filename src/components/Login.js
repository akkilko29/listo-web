import React, { useState } from "react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Login:", {
      email,
      password,
    });
  };

  return React.createElement(
    "main",
    { className: "login-page" },

    React.createElement(
      "div",
      { className: "login-card" },

      /* Login Icon */

      React.createElement(
        "div",
        { className: "login-icon" },

        React.createElement("i", {
          className: "fa-solid fa-database",
        })
      ),

      /* Heading */

      React.createElement(
        "h1",
        null,
        "Welcome Back"
      ),

      React.createElement(
        "p",
        { className: "login-subtitle" },
        "Enter your details below to access your MarketHub account."
      ),

      /* Form */

      React.createElement(
        "form",
        {
          className: "login-form",
          onSubmit: handleSubmit,
        },

        /* Email */

        React.createElement(
          "div",
          { className: "form-group" },

          React.createElement(
            "label",
            { htmlFor: "email" },
            "Email Address ",
            React.createElement(
              "span",
              { className: "required" },
              "*"
            )
          ),

          React.createElement("input", {
            id: "email",
            type: "email",
            value: email,
            placeholder: "alex.rivera@gmail.com",
            onChange: (event) =>
              setEmail(event.target.value),
            required: true,
          })
        ),

        /* Password */

        React.createElement(
          "div",
          { className: "form-group" },

          React.createElement(
            "label",
            { htmlFor: "password" },
            "Password ",
            React.createElement(
              "span",
              { className: "required" },
              "*"
            )
          ),

          React.createElement(
            "div",
            { className: "password-container" },

            React.createElement("input", {
              id: "password",
              type: showPassword
                ? "text"
                : "password",
              value: password,
              placeholder: "••••••••••••",
              onChange: (event) =>
                setPassword(event.target.value),
              required: true,
            }),

            React.createElement(
              "button",
              {
                type: "button",
                className: "password-toggle",
                onClick: () =>
                  setShowPassword(!showPassword),
                "aria-label":
                  "Toggle password visibility",
              },

              React.createElement("i", {
                className: showPassword
                  ? "fa-regular fa-eye"
                  : "fa-regular fa-eye-slash",
              })
            )
          )
        ),

        /* Forgot Password */

        React.createElement(
          "div",
          { className: "forgot-container" },

          React.createElement(
            "a",
            {
              href: "#forgot-password",
              className: "forgot-password",
            },
            "Forgot password?"
          )
        ),

        /* Login Button */

        React.createElement(
          "button",
          {
            type: "submit",
            className: "login-button",
          },
          "LOG IN"
        )
      ),

      /* OR */

      React.createElement(
        "div",
        { className: "login-divider" },

        React.createElement("span"),

        React.createElement(
          "p",
          null,
          "OR"
        ),

        React.createElement("span")
      ),

      /* Google */

      React.createElement(
        "button",
        {
          type: "button",
          className: "google-button",
        },

        React.createElement(
          "span",
          { className: "google-icon" },
          "G"
        ),

        React.createElement(
          "span",
          null,
          "Continue with Google"
        )
      ),

      /* Register */

      React.createElement(
        "p",
        { className: "register-text" },

        "Don't have an account? ",

        React.createElement(
          "a",
          {
            href: "#register",
          },
          "Register"
        )
      )
    )
  );
}

export default Login;