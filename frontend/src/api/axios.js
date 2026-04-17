import axios from "axios";

// Prefer explicit env URL, otherwise same-origin /api. This avoids protocol/host mismatches in deployed environments.
const resolvedApiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const API = axios.create({
  baseURL: resolvedApiBaseUrl,
  withCredentials: true, // Crucial for HttpOnly Cookies
  timeout: 15000,
});

// Cookie-only auth path: browser sends HttpOnly token cookie via withCredentials.

export default API;
