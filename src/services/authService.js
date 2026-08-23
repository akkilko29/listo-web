import { API_ENDPOINTS } from "../config/apiConfig";
import { apiGet, apiPost, apiPostForm, apiPut } from "./httpClient";

export function mapUser(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const source = payload.user || payload.data || payload;
  if (source.id == null && !source.email) {
    return null;
  }

  return {
    id: source.id,
    name: source.name || "",
    email: source.email || "",
    phone: source.phone || "",
    city: source.city || "",
    state: source.state || "",
    profilePhotoUrl: source.profilePhotoUrl || "",
    role: source.role || "USER",
  };
}

export function loginRequest(email, password) {
  return apiPost(API_ENDPOINTS.login, { email, password });
}

export function getCurrentUser() {
  return apiGet(API_ENDPOINTS.usersMe).then(mapUser);
}

export function getUserById(id) {
  if (!id) {
    return Promise.resolve(null);
  }

  return apiGet(API_ENDPOINTS.userById(id)).then(mapUser);
}

export function updateCurrentUser({ name, phone, city, state }) {
  return apiPut(API_ENDPOINTS.usersMe, {
    name: String(name || "").trim(),
    phone: String(phone || "").trim(),
    city: String(city || "").trim(),
    state: String(state || "").trim(),
  }).then(mapUser);
}

export function uploadProfilePhoto(file) {
  if (!file) {
    return Promise.reject(new Error("Please choose a photo"));
  }

  const formData = new FormData();
  formData.append("file", file);
  return apiPostForm(API_ENDPOINTS.usersMePhoto, formData).then(mapUser);
}

export async function changePassword({ oldPassword, newPassword }) {
  const data = await apiPut(API_ENDPOINTS.usersMePassword, {
    oldPassword: String(oldPassword || ""),
    newPassword: String(newPassword || ""),
  });

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  return data?.message || "Password changed successfully";
}

export function registerRequest({
  name,
  email,
  password,
  phone,
  city,
  state,
  profilePhoto,
}) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("phone", phone);
  formData.append("city", city);
  formData.append("state", state);

  if (profilePhoto) {
    formData.append("profilePhoto", profilePhoto);
  }

  return apiPostForm(API_ENDPOINTS.register, formData);
}
