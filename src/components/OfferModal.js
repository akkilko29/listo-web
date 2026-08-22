import React, { useState } from "react";

import "../style/OfferModal.css";

function formatOfferAmount(value) {
  const amount = Number(value);
  if (Number.isNaN(amount) || amount <= 0) {
    return "";
  }
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function buildOfferMessage(amount, title) {
  const formatted = formatOfferAmount(amount);
  const listing = title ? ` for "${title}"` : "";
  return `I'd like to offer ₹ ${formatted}${listing}.`;
}

function OfferModal({
  open,
  listedPrice,
  title,
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  const [amount, setAmount] = useState("");

  if (!open) {
    return null;
  }

  const listedValue = Number(listedPrice) || 0;
  const suggestions = [90, 80, 70]
    .map((percent) => Math.round((listedValue * percent) / 100))
    .filter((value, index, list) => value > 0 && list.indexOf(value) === index);

  const handleSubmit = (event) => {
    event.preventDefault();
    const offer = Number(String(amount).replace(/,/g, ""));
    if (!offer || offer <= 0) {
      return;
    }
    onSubmit(offer);
  };

  return React.createElement(
    "div",
    {
      className: "offer-modal-backdrop",
      onClick: onClose,
    },
    React.createElement(
      "form",
      {
        className: "offer-modal",
        onClick: (event) => event.stopPropagation(),
        onSubmit: handleSubmit,
      },
      React.createElement("h3", null, "Make an offer"),
      React.createElement(
        "p",
        null,
        title ? `For ${title}` : "Send your price to the seller."
      ),
      listedValue > 0 &&
        React.createElement(
          "span",
          { className: "offer-listed-price" },
          `Listed at ₹ ${formatOfferAmount(listedValue)}`
        ),
      React.createElement("input", {
        type: "number",
        min: "1",
        step: "1",
        value: amount,
        onChange: (event) => setAmount(event.target.value),
        placeholder: "Enter your offer (₹)",
        autoFocus: true,
      }),
      suggestions.length > 0 &&
        React.createElement(
          "div",
          { className: "offer-suggestions" },
          suggestions.map((value) =>
            React.createElement(
              "button",
              {
                key: value,
                type: "button",
                onClick: () => setAmount(String(value)),
              },
              `₹ ${formatOfferAmount(value)}`
            )
          )
        ),
      error && React.createElement("p", { className: "offer-modal-error" }, error),
      React.createElement(
        "div",
        { className: "offer-modal-actions" },
        React.createElement(
          "button",
          { type: "button", className: "offer-modal-cancel", onClick: onClose },
          "Cancel"
        ),
        React.createElement(
          "button",
          {
            type: "submit",
            className: "offer-modal-submit",
            disabled: submitting || !Number(amount),
          },
          submitting ? "Sending..." : "Send offer"
        )
      )
    )
  );
}

export default OfferModal;
