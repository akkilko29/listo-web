import React, { useState } from "react";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!acceptedTerms) {
      alert("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    console.log("Register:", formData);
  };

  return React.createElement(
    "main",
    { className: "register-page" },

    React.createElement(
      "div",
      { className: "register-card" },

      // Icon
      React.createElement(
        "div",
        { className: "register-icon" },
        React.createElement("i", {
          className: "fa-solid fa-database",
        })
      ),

      // Heading
      React.createElement(
        "h1",
        null,
        "Create Your Account"
      ),

      React.createElement(
        "p",
        { className: "register-subtitle" },
        "Join our premium community of sellers and buyers today."
      ),

      React.createElement(
        "form",
        {
          className: "register-form",
          onSubmit: handleSubmit,
        },

        // Full Name
        React.createElement(
          "div",
          { className: "register-form-group" },

          React.createElement(
            "label",
            { htmlFor: "fullName" },
            "Full Name ",
            React.createElement(
              "span",
              { className: "register-required" },
              "*"
            )
          ),

          React.createElement("input", {
            id: "fullName",
            name: "fullName",
            type: "text",
            value: formData.fullName,
            onChange: handleChange,
            placeholder: "Alex Rivera",
            required: true,
          })
        ),

        // Email
        React.createElement(
          "div",
          { className: "register-form-group" },

          React.createElement(
            "label",
            { htmlFor: "registerEmail" },
            "Email Address ",
            React.createElement(
              "span",
              { className: "register-required" },
              "*"
            )
          ),

          React.createElement("input", {
            id: "registerEmail",
            name: "email",
            type: "email",
            value: formData.email,
            onChange: handleChange,
            placeholder: "alex.rivera@gmail.com",
            required: true,
          })
        ),

        // Phone
        React.createElement(
          "div",
          { className: "register-form-group" },

          React.createElement(
            "label",
            { htmlFor: "phone" },
            "Phone Number ",
            React.createElement(
              "span",
              { className: "register-required" },
              "*"
            )
          ),

          React.createElement("input", {
            id: "phone",
            name: "phone",
            type: "tel",
            value: formData.phone,
            onChange: handleChange,
            placeholder: "+91 98765 43210",
            required: true,
          })
        ),

        // Password
        React.createElement(
          "div",
          { className: "register-form-group" },

          React.createElement(
            "label",
            { htmlFor: "registerPassword" },
            "Password ",
            React.createElement(
              "span",
              { className: "register-required" },
              "*"
            )
          ),

          React.createElement(
            "div",
            { className: "register-password-container" },

            React.createElement("input", {
              id: "registerPassword",
              name: "password",
              type: showPassword ? "text" : "password",
              value: formData.password,
              onChange: handleChange,
              placeholder: "Create a strong password",
              required: true,
            }),

            React.createElement(
              "button",
              {
                type: "button",
                className: "register-password-toggle",
                onClick: () =>
                  setShowPassword(!showPassword),
              },

              React.createElement("i", {
                className: showPassword
                  ? "fa-regular fa-eye"
                  : "fa-regular fa-eye-slash",
              })
            )
          )
        ),

        // Password strength
        React.createElement(
          "div",
          { className: "password-strength" },

          React.createElement(
            "div",
            { className: "strength-header" },

            React.createElement(
              "span",
              null,
              "Password Strength"
            ),

            React.createElement(
              "span",
              { className: "strength-status" },
              formData.password ? "Strong" : ""
            )
          ),

          React.createElement(
            "div",
            { className: "strength-bars" },

            React.createElement("span", {
              className: formData.password
                ? "strength-active"
                : "",
            }),

            React.createElement("span", {
              className: formData.password
                ? "strength-active"
                : "",
            }),

            React.createElement("span", {
              className: formData.password
                ? "strength-active"
                : "",
            })
          )
        ),

        // Terms
        React.createElement(
          "label",
          { className: "terms-container" },

          React.createElement("input", {
            type: "checkbox",
            checked: acceptedTerms,
            onChange: (event) =>
              setAcceptedTerms(event.target.checked),
          }),

          React.createElement(
            "span",
            { className: "custom-checkbox" },
            acceptedTerms
              ? React.createElement("i", {
                  className: "fa-solid fa-check",
                })
              : null
          ),

          React.createElement(
            "span",
            { className: "terms-text" },
            "I accept and agree to the ",

            React.createElement(
              "a",
              { href: "#terms" },
              "Terms of Service"
            ),

            " and ",

            React.createElement(
              "a",
              { href: "#privacy" },
              "Privacy Policy"
            ),

            "."
          )
        ),

        // Create account
        React.createElement(
          "button",
          {
            type: "submit",
            className: "create-account-button",
          },
          "CREATE ACCOUNT"
        )
      ),

      // OR
      React.createElement(
        "div",
        { className: "register-divider" },

        React.createElement("span"),

        React.createElement(
          "p",
          null,
          "OR"
        ),

        React.createElement("span")
      ),

      // Google
      React.createElement(
        "button",
        {
          type: "button",
          className: "register-google-button",
        },

        React.createElement(
          "span",
          { className: "register-google-icon" },
          "G"
        ),

        React.createElement(
          "span",
          null,
          "Sign up with Google"
        )
      ),

      // Login
      React.createElement(
        "p",
        { className: "already-account" },

        "Already have an account? ",

        React.createElement(
          "a",
          { href: "/login" },
          "Log in"
        )
      )
    )
  );
}

export default Register;