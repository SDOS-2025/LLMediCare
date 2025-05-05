import axios from "axios";
import { API_BASE_URL } from "./environment";

// Create a custom axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout - shorter than previous 30s
  withCredentials: false, // No credentials mode to avoid CORS issues
  headers: {
    "Content-Type": "application/json",
    'ngrok-skip-browser-warning': 'true',
    Accept: "application/json",
  },
});

// Add request interceptor for logging and token handling
api.interceptors.request.use(
  (config) => {
    console.log(
      `[API] ${config.method.toUpperCase()} request to ${config.url}`
    );

    // Add timestamps to avoid caching issues
    if (config.method === "get") {
      config.params = config.params || {};
      config.params["_t"] = Date.now();
    }

    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API] Response from ${response.config.url}: Status ${response.status}`
    );
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with an error status
      console.error(
        `[API] Server error ${error.response.status} from ${error.config?.url}:`,
        error.response.data
      );
    } else if (error.request) {
      // Request was made but no response received
      console.error(
        `[API] No response received from ${error.config?.url} (timeout: ${error.config?.timeout}ms)`,
        error.request
      );

      // Check if it's a network error
      if (error.message.includes("Network Error")) {
        console.error("[API] Network error - check if server is accessible");
      }

      // Check if it's a timeout
      if (error.code === "ECONNABORTED") {
        console.error("[API] Request timed out - server might be overloaded");
      }
    } else {
      // Something else happened while setting up the request
      console.error("[API] Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
