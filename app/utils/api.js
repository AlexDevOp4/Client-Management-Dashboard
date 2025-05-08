import axios from "axios";

const API = axios.create({
  baseURL:
    "https://client-management-dashboard-backend-production.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      return Promise.reject(); // Optionally redirect to login
    }
    return Promise.reject(err);
  }
);

export default API;
