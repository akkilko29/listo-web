import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { mountGoogleSignInButton } from "../services/googleAuth";
import loginIcon from "../assets/listo_logo.png";
import { trackCompleteRegistration } from "../services/metaPixel";

function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const container = googleButtonRef.current;
    if (!container) {
      return undefined;
    }

    let cancelled = false;
    let unmount = () => {};

    mountGoogleSignInButton(container, async (credential, mountError) => {
      if (cancelled) {
        return;
      }

      setError("");

      if (mountError || !credential) {
        setError(
          mountError?.message || "Google sign-in failed. Please try again."
        );
        return;
      }

      setGoogleSubmitting(true);

      try {
        await loginWithGoogle(credential);
        trackCompleteRegistration();
        navigate("/");
      } catch (err) {
        setError(err.message || "Google sign-in failed. Please try again.");
      } finally {
        setGoogleSubmitting(false);
      }
    })
      .then((cleanup) => {
        if (cancelled) {
          cleanup?.();
          return;
        }
        if (typeof cleanup === "function") {
          unmount = cleanup;
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Google Sign-In is unavailable");
        }
      });

    return () => {
      cancelled = true;
      unmount();
    };
  }, [loginWithGoogle, navigate]);

  return React.createElement(
    "main",
    { className: "login-page" },

    React.createElement(
      "div",
      { className: "login-card" },

      React.createElement(
        "div",
        { className: "login-icon" },
        React.createElement("img", {
          src: loginIcon,
          alt: "Login",
          className: "login-icon-image",
        })
      ),

      React.createElement("h1", null, "Welcome Back"),

      React.createElement(
        "p",
        { className: "login-subtitle" },
        "Enter your details below to access your MarketHub account."
      ),

      error &&
        React.createElement("div", { className: "auth-error" }, error),

      React.createElement(
        "form",
        {
          className: "login-form",
          onSubmit: handleSubmit,
        },

        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            { htmlFor: "email" },
            "Email Address ",
            React.createElement("span", { className: "required" }, "*")
          ),
          React.createElement("input", {
            id: "email",
            type: "email",
            value: email,
            placeholder: "example@example.com",
            onChange: (event) => setEmail(event.target.value),
            required: true,
            autoComplete: "email",
          })
        ),

        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            { htmlFor: "password" },
            "Password ",
            React.createElement("span", { className: "required" }, "*")
          ),
          React.createElement(
            "div",
            { className: "password-container" },
            React.createElement("input", {
              id: "password",
              type: showPassword ? "text" : "password",
              value: password,
              placeholder: "••••••••••••",
              onChange: (event) => setPassword(event.target.value),
              required: true,
              autoComplete: "current-password",
            }),
            React.createElement(
              "button",
              {
                type: "button",
                className: "password-toggle",
                onClick: () => setShowPassword(!showPassword),
                "aria-label": "Toggle password visibility",
              },
              React.createElement("i", {
                className: showPassword
                  ? "fa-regular fa-eye"
                  : "fa-regular fa-eye-slash",
              })
            )
          )
        ),

        React.createElement(
          "div",
          { className: "forgot-container" },
          React.createElement(
            Link,
            {
              to: "/forgot-password",
              className: "forgot-password",
            },
            "Forgot password?"
          )
        ),

        React.createElement(
          "button",
          {
            type: "submit",
            className: "login-button",
            disabled: submitting || googleSubmitting,
          },
          submitting ? "LOGGING IN..." : "LOG IN"
        )
      ),

      React.createElement(
        "div",
        { className: "login-divider" },
        React.createElement("span"),
        React.createElement("p", null, "OR"),
        React.createElement("span")
      ),

      React.createElement("div", {
        className: "google-button-host",
        ref: googleButtonRef,
      }),

      React.createElement(
        "p",
        { className: "register-text" },
        "Don't have an account? ",
        React.createElement(Link, { to: "/register" }, "Register")
      )
    )
  );
}

export default Login;
