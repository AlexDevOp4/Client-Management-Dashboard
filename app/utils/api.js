import axios from "axios";

const API = axios.create({
  baseURL:
    "https://client-management-dashboard-backend-production.up.railway.app/api",
  // "http://localhost:8080/api", // Local development
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Keep this
});

// REMOVE Authorization injection
API.interceptors.request.use((config) => config);

// Keep the response handler
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      return Promise.reject();
    }
    return Promise.reject(err);
  }
);

export default API;
