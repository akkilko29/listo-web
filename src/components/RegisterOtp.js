import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import listoLogo from "../assets/listo_logo.png";

function RegisterOtp({
  email,
  profilePhoto,
  onBack,
}) {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  /* =========================================
     OTP INPUT
  ========================================= */

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
    setError("");
  };

  /* =========================================
     VERIFY OTP
  ========================================= */

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit OTP."
      );

      return;
    }

    setVerifying(true);

    try {
      const data = new FormData();

      data.append(
        "email",
        email
      );

      data.append(
        "otp",
        otp
      );

      /*
       * Profile photo is sent during
       * OTP verification because your
       * backend endpoint expects it here.
       */

      if (profilePhoto) {
        data.append(
          "profilePhoto",
          profilePhoto
        );
      }

      const response = await fetch(
        "http://localhost:8080/api/auth/register/verify",
        {
          method: "POST",
          body: data,
        }
      );

      let result = {};

      try {
        result =
          await response.json();
      } catch {
        result = {};
      }

      /*
       * 201 Created = SUCCESS
       */

      if (!response.ok) {
        throw new Error(
          result.message ||
          "OTP verification failed."
        );
      }

      /*
       * If backend explicitly says
       * success:false
       */

      if (
        result.success === false
      ) {
        throw new Error(
          result.message ||
          "OTP verification failed."
        );
      }

      /*
       * =====================================
       * OTP SUCCESS
       * =====================================
       *
       * ONLY NOW go to login.
       */

      navigate(
        "/login",
        {
          replace: true,
          state: {
            message:
              "Registration successful. Please login.",
          },
        }
      );

    } catch (err) {
      setError(
        err.message ||
        "OTP verification failed. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  /* =========================================
     BACK
  ========================================= */

  const handleBack = () => {
    setOtp("");
    setError("");

    if (onBack) {
      onBack();
    }
  };

  /* =========================================
     UI
  ========================================= */

  return React.createElement(
    "div",
    {
      className:
        "register-card otp-card",
    },

    /* =======================================
       LOGO
    ======================================= */

    React.createElement(
      "div",
      {
        className:
          "login-icon",
      },

      React.createElement(
        "img",
        {
          src:
            listoLogo,

          alt:
            "Listo",

          className:
            "login-icon-image",
        }
      )
    ),

    /* =======================================
       HEADING
    ======================================= */

    React.createElement(
      "h1",
      null,
      "Verify Your Email"
    ),

    React.createElement(
      "p",
      {
        className:
          "register-subtitle",
      },
      "We’ve sent a 6-digit verification code to your email. If you haven’t received it, please check your spam or junk folder."
    ),

    React.createElement(
      "p",
      {
        className:
          "otp-email",
      },
      email
    ),

    /* =======================================
       ERROR
    ======================================= */

    error &&
      React.createElement(
        "div",
        {
          className:
            "auth-error",
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

    /* =======================================
       FORM
    ======================================= */

    React.createElement(
      "form",
      {
        className:
          "register-form otp-form",

        onSubmit:
          handleVerify,
      },

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
              "registerOtp",
          },

          "Verification Code ",

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
              "registerOtp",

            name:
              "otp",

            type:
              "text",

            inputMode:
              "numeric",

            maxLength:
              6,

            value:
              otp,

            onChange:
              handleOtpChange,

            placeholder:
              "000000",

            autoComplete:
              "one-time-code",

            autoFocus:
              true,

            required:
              true,
          }
        )
      ),

      /* =====================================
         VERIFY BUTTON
      ===================================== */

      React.createElement(
        "button",
        {
          type:
            "submit",

          className:
            "create-account-button",

          disabled:
            verifying,
        },

        React.createElement(
          "i",
          {
            className:
              verifying
                ? "fa-solid fa-spinner fa-spin"
                : "fa-solid fa-check",
          }
        ),

        verifying
          ? " VERIFYING..."
          : " VERIFY EMAIL"
      )
    ),

    /* =======================================
       BACK
    ======================================= */

    React.createElement(
      "p",
      {
        className:
          "otp-back-text",
      },

      "Wrong email? ",

      React.createElement(
        "button",
        {
          type:
            "button",

          className:
            "otp-back-button",

          onClick:
            handleBack,
        },
        "Go Back"
      )
    )
  );
}

export default RegisterOtp;