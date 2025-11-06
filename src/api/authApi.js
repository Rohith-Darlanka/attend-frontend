import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authApi = axios.create({
  baseURL: BASE_URL + "/api", // ✅ Use env variable
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to ensure credentials are sent
authApi.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Auth API Error:", error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log("Unauthorized - cookies may not be set properly");
    }
    return Promise.reject(error);
  }
);

export default authApi;
