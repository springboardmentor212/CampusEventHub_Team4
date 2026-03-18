import axios from "axios";

// Prefer explicit env URL, otherwise same-origin /api. This avoids protocol/host mismatches in deployed environments.
const resolvedApiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const API = axios.create({
  baseURL: resolvedApiBaseUrl,
  withCredentials: true, // Crucial for HttpOnly Cookies
  timeout: 15000,
});

// Since we are moving to Cookies, we don't strictly need the Authorization header interceptor
// but we'll keep it for backward compatibility if the server still accepts Bearer tokens
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
