import { API_ENDPOINTS } from "../config/apiConfig";
import { apiPost, apiPostForm } from "./httpClient";

export function loginRequest(email, password) {
  return apiPost(API_ENDPOINTS.login, { email, password });
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
