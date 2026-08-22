const CHATS_KEY = "listo.chats";

function readChats() {
  try {
    const raw = window.localStorage.getItem(CHATS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeChats(chats) {
  window.localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  return chats;
}

export function getChats() {
  return readChats().sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}

export function getChatById(id) {
  return getChats().find((chat) => String(chat.id) === String(id)) || null;
}

export function startChat(payload) {
  const chats = readChats();
  const existing = chats.find(
    (chat) =>
      String(chat.sellerId) === String(payload.sellerId) &&
      String(chat.productId) === String(payload.productId)
  );

  if (existing) {
    return existing;
  }

  const chat = {
    id: `${payload.sellerId}-${payload.productId}-${Date.now()}`,
    sellerId: payload.sellerId,
    sellerName: payload.sellerName || "Seller",
    productId: payload.productId,
    productTitle: payload.productTitle || "Listing",
    productImage: payload.productImage || "",
    messages: [
      {
        id: `msg-${Date.now()}`,
        from: "system",
        text: `You started a chat about "${payload.productTitle || "this listing"}".`,
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  writeChats([chat, ...chats]);
  return chat;
}

export function sendMessage(chatId, text) {
  const message = String(text || "").trim();
  if (!message) {
    return getChatById(chatId);
  }

  const chats = readChats();
  const next = chats.map((chat) => {
    if (String(chat.id) !== String(chatId)) {
      return chat;
    }

    return {
      ...chat,
      messages: [
        ...(chat.messages || []),
        {
          id: `msg-${Date.now()}`,
          from: "me",
          text: message,
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  });

  writeChats(next);
  return next.find((chat) => String(chat.id) === String(chatId)) || null;
}
