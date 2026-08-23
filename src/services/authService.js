import { API_ENDPOINTS } from "../config/apiConfig";
import { apiGet, apiPost, apiPostForm } from "./httpClient";

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
