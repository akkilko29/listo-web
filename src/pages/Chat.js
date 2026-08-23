import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import OfferModal, { buildOfferMessage } from "../components/OfferModal";
import {
  getConversation,
  getConversationMessages,
  getConversations,
  markConversationRead,
  sendConversationMessage,
} from "../services/conversationService";
import { listingsHref, useAppLocation } from "../context/LocationContext";
import { getProductById } from "../services/productService";
import "../style/Chat.css";

function isOfferMessage(text) {
  return /i'?d like to offer/i.test(String(text || ""));
}

function Chat() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { location } = useAppLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [listedPrice, setListedPrice] = useState(0);
  const messagesRef = useRef(null);

  const selectedId = searchParams.get("id") || "";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const loadConversations = async () => {
    setListLoading(true);
    setError("");

    try {
      const items = await getConversations();
      setChats(items);
      return items;
    } catch (err) {
      setError(err.message || "Unable to load conversations");
      setChats([]);
      return [];
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    loadConversations().then((items) => {
      if (cancelled) {
        return;
      }

      if (!searchParams.get("id") && items[0]) {
        setSearchParams({ id: String(items[0].id) }, { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedId) {
      setSelected(null);
      setMessages([]);
      return undefined;
    }

    let cancelled = false;
    setThreadLoading(true);

    Promise.all([
      getConversation(selectedId),
      getConversationMessages(selectedId),
    ])
      .then(async ([conversation, nextMessages]) => {
        if (cancelled) {
          return;
        }

        setSelected(conversation);
        setMessages(nextMessages);

        try {
          await markConversationRead(selectedId);
          if (!cancelled) {
            setChats((current) =>
              current.map((chat) =>
                String(chat.id) === String(selectedId)
                  ? { ...chat, unreadCount: 0 }
                  : chat
              )
            );
          }
        } catch {
          /* unread badge can stay until next refresh */
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load messages");
          setSelected(null);
          setMessages([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setThreadLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, selectedId]);

  useEffect(() => {
    const node = messagesRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, threadLoading, selectedId]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!selected || !text || sending) {
      return;
    }

    setSending(true);

    try {
      const message = await sendConversationMessage(selected.id, text);
      setDraft("");

      if (message) {
        setMessages((current) => [...current, message]);
      }

      const items = await getConversations();
      setChats(items);
    } catch (err) {
      setError(err.message || "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const activeChat =
    selected ||
    chats.find((chat) => String(chat.id) === String(selectedId)) ||
    null;

  const openOffer = async () => {
    if (!activeChat) {
      return;
    }

    setOfferOpen(true);
    setListedPrice(0);

    try {
      const product = await getProductById(activeChat.productId);
      setListedPrice(product?.priceValue || 0);
    } catch {
      setListedPrice(0);
    }
  };

  const handleOffer = async (amount) => {
    if (!activeChat || offerSubmitting) {
      return;
    }

    setOfferSubmitting(true);
    setError("");

    try {
      const message = await sendConversationMessage(
        activeChat.id,
        buildOfferMessage(amount, activeChat.productTitle)
      );

      if (message) {
        setMessages((current) => [...current, message]);
      }

      setOfferOpen(false);
      const items = await getConversations();
      setChats(items);
    } catch (err) {
      setError(err.message || "Unable to send offer");
    } finally {
      setOfferSubmitting(false);
    }
  };

  return React.createElement(
    "div",
    { className: "chat-page" },

    React.createElement(
      "aside",
      { className: "chat-list" },

      React.createElement("h2", null, "Chats"),

      React.createElement(
        "div",
        { className: "chat-list-scroll" },

      listLoading &&
        React.createElement("p", { className: "chat-list-empty" }, "Loading chats..."),

      !listLoading && chats.length === 0 &&
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
              String(activeChat?.id) === String(chat.id) ? "active" : ""
            }`,
            onClick: () => setSearchParams({ id: String(chat.id) }),
          },
          chat.productImage
            ? React.createElement("img", {
                src: chat.productImage,
                alt: chat.productTitle,
              })
            : React.createElement(
                "span",
                { className: "chat-list-fallback" },
                (chat.otherName || "S").slice(0, 1)
              ),
          React.createElement(
            "div",
            { className: "chat-list-copy" },
            React.createElement("strong", null, chat.otherName),
            React.createElement("span", null, chat.productTitle)
          ),
          chat.unreadCount > 0 &&
            React.createElement(
              "em",
              { className: "chat-unread-badge" },
              chat.unreadCount
            )
        )
      )
      ),
    ),

    React.createElement(
      "section",
      { className: "chat-thread" },

      error &&
        React.createElement("p", { className: "chat-error" }, error),

      !activeChat && !listLoading &&
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
              onClick: () => navigate(listingsHref(location)),
            },
            "Browse listings"
          )
        ),

      activeChat &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "header",
            { className: "chat-thread-header" },
            React.createElement(
              "div",
              null,
              React.createElement("strong", null, activeChat.otherName),
              React.createElement("span", null, activeChat.productTitle)
            ),
            React.createElement(
              "div",
              { className: "chat-thread-actions" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "chat-offer-button",
                  onClick: openOffer,
                },
                "Make an offer"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => navigate(`/product/${activeChat.productId}`),
                },
                "View listing"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "chat-messages", ref: messagesRef },
            threadLoading &&
              React.createElement("p", { className: "chat-list-empty" }, "Loading messages..."),
            !threadLoading &&
              messages.length === 0 &&
              React.createElement(
                "p",
                { className: "chat-list-empty" },
                "No messages yet. Say hello."
              ),
            messages.map((message) =>
              React.createElement(
                "div",
                {
                  key: message.id,
                  className: `chat-bubble ${message.from}${
                    isOfferMessage(message.text) ? " offer" : ""
                  }`,
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
              { type: "submit", disabled: !draft.trim() || sending },
              sending ? "Sending..." : "Send"
            )
          )
        )
    ),

    React.createElement(OfferModal, {
      open: offerOpen,
      listedPrice,
      title: activeChat?.productTitle || "",
      submitting: offerSubmitting,
      error,
      onClose: () => setOfferOpen(false),
      onSubmit: handleOffer,
    })
  );
}

export default Chat;
