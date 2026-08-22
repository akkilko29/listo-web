import { API_ENDPOINTS, resolveMediaUrl } from "../config/apiConfig";
import { unwrapList } from "../utils/productDisplay";
import { getStoredToken, getStoredUser } from "./authStorage";
import { apiGet, apiPatch, apiPost } from "./httpClient";

function getTokenUserId() {
  const token = getStoredToken();

  if (!token) {
    return "";
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return String(payload.sub || payload.userId || payload.id || "");
  } catch {
    return "";
  }
}

export function getCurrentUserId() {
  const user = getStoredUser();
  return String(user?.id || user?.userId || getTokenUserId() || "");
}

function toCount(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (value && typeof value === "object") {
    return Number(value.unreadCount ?? value.count ?? 0) || 0;
  }

  return 0;
}

export function mapConversation(item, currentUserId = getCurrentUserId()) {
  const isSeller = String(item.sellerId) === String(currentUserId);

  return {
    id: item.id,
    productId: item.productId,
    productTitle: item.productTitle || "Listing",
    productImage: resolveMediaUrl(item.productImageUrl),
    buyerId: item.buyerId,
    buyerName: item.buyerName || "Buyer",
    sellerId: item.sellerId,
    sellerName: item.sellerName || "Seller",
    otherName: isSeller ? item.buyerName || "Buyer" : item.sellerName || "Seller",
    unreadCount: toCount(item.unreadCount),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function mapMessage(item, currentUserId = getCurrentUserId()) {
  return {
    id: item.id,
    conversationId: item.conversationId,
    senderId: item.senderId,
    senderName: item.senderName,
    content: item.content || "",
    text: item.content || "",
    read: Boolean(item.read),
    createdAt: item.createdAt,
    from: String(item.senderId) === String(currentUserId) ? "me" : "them",
  };
}

export async function startConversation(productId) {
  const data = await apiPost(API_ENDPOINTS.conversationByProduct(productId));
  return mapConversation(data);
}

export async function getConversations() {
  const data = await apiGet(API_ENDPOINTS.conversations);
  return unwrapList(data)
    .map((item) => mapConversation(item))
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
}

export async function getConversation(id) {
  const data = await apiGet(API_ENDPOINTS.conversationById(id));
  return data ? mapConversation(data) : null;
}

export async function getConversationMessages(id) {
  const data = await apiGet(API_ENDPOINTS.conversationMessages(id));
  return unwrapList(data).map((item) => mapMessage(item));
}

export async function sendConversationMessage(id, content) {
  const text = String(content || "").trim();

  if (!text) {
    return null;
  }

  const params = new URLSearchParams({ content: text });
  const data = await apiPost(
    `${API_ENDPOINTS.conversationMessages(id)}?${params.toString()}`
  );
  return data ? mapMessage(data) : null;
}

export async function markConversationRead(id) {
  await apiPatch(API_ENDPOINTS.conversationMessageRead(id));
}

export async function getConversationUnreadCount(id) {
  const data = await apiGet(API_ENDPOINTS.conversationUnreadCount(id));
  return toCount(data);
}
