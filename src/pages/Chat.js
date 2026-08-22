import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getChats, getChatById, sendMessage } from "../services/chatStorage";
import "../style/Chat.css";

function Chat() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState("");
  const [tick, setTick] = useState(0);

  const chats = useMemo(() => {
    tick;
    return getChats();
  }, [tick]);

  const selectedId = searchParams.get("id") || chats[0]?.id || "";
  const selected = selectedId ? getChatById(selectedId) : null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSend = (event) => {
    event.preventDefault();
    if (!selected || !draft.trim()) {
      return;
    }

    sendMessage(selected.id, draft);
    setDraft("");
    setTick((value) => value + 1);
  };

  return React.createElement(
    "div",
    { className: "chat-page" },

    React.createElement(
      "aside",
      { className: "chat-list" },

      React.createElement("h2", null, "Chats"),

      chats.length === 0 &&
        React.createElement(
          "p",
          { className: "chat-list-empty" },
          "No conversations yet."
        ),

      chats.map((chat) =>
        React.createElement(
          "button",
          {
            key: chat.id,
            type: "button",
            className: `chat-list-item ${
              selected?.id === chat.id ? "active" : ""
            }`,
            onClick: () => setSearchParams({ id: chat.id }),
          },
          chat.productImage
            ? React.createElement("img", {
                src: chat.productImage,
                alt: chat.productTitle,
              })
            : React.createElement(
                "span",
                { className: "chat-list-fallback" },
                (chat.sellerName || "S").slice(0, 1)
              ),
          React.createElement(
            "div",
            null,
            React.createElement("strong", null, chat.sellerName),
            React.createElement("span", null, chat.productTitle)
          )
        )
      )
    ),

    React.createElement(
      "section",
      { className: "chat-thread" },

      !selected &&
        React.createElement(
          "div",
          { className: "chat-empty" },
          React.createElement("i", { className: "fa-regular fa-comments" }),
          React.createElement("h2", null, "No messages yet"),
          React.createElement(
            "p",
            null,
            "Open a listing and tap Chat with seller to start a conversation."
          ),
          React.createElement(
            "button",
            {
              type: "button",
              className: "apply-filter-button",
              onClick: () => navigate("/listings"),
            },
            "Browse listings"
          )
        ),

      selected &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "header",
            { className: "chat-thread-header" },
            React.createElement(
              "div",
              null,
              React.createElement("strong", null, selected.sellerName),
              React.createElement("span", null, selected.productTitle)
            ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => navigate(`/product/${selected.productId}`),
              },
              "View listing"
            )
          ),
          React.createElement(
            "div",
            { className: "chat-messages" },
            (selected.messages || []).map((message) =>
              React.createElement(
                "div",
                {
                  key: message.id,
                  className: `chat-bubble ${message.from}`,
                },
                message.text
              )
            )
          ),
          React.createElement(
            "form",
            { className: "chat-composer", onSubmit: handleSend },
            React.createElement("input", {
              value: draft,
              onChange: (event) => setDraft(event.target.value),
              placeholder: "Type a message...",
            }),
            React.createElement(
              "button",
              { type: "submit", disabled: !draft.trim() },
              "Send"
            )
          )
        )
    )
  );
}

export default Chat;
