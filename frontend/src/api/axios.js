import axios from "axios";

// Standardizing API URL via Environment Variables
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Crucial for HttpOnly Cookies
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
