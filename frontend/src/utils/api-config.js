import axios from "axios";
import { API_BASE_URL } from "./environment";

// Create a custom axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  withCredentials: false, // No credentials mode to avoid CORS issues
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

// Debug function for inspecting the exact request details
const debugRequest = (config) => {
  console.log(`
==== DEBUG REQUEST ====
URL: ${config.url.startsWith("http") ? config.url : config.baseURL + config.url}
Method: ${config.method.toUpperCase()}
Headers: ${JSON.stringify(config.headers)}
Timeout: ${config.timeout}ms
=======================
`);
  return config;
};

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

    // Debug the request
    return debugRequest(config);
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
    // Log a snippet of the response data for debugging
    console.log(
      "[API] Response data preview:",
      typeof response.data === "object"
        ? JSON.stringify(response.data).substring(0, 100) + "..."
        : response.data.substring(0, 100) + "..."
    );
    return response;
  },
  (error) => {
    // Handle common errors here

    // Add retry functionality for network errors
    if (
      error.message.includes("Network Error") ||
      error.code === "ECONNABORTED"
    ) {
      const originalRequest = error.config;
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        console.log("[API] Retrying request after network error...");
        return new Promise((resolve) =>
          setTimeout(() => resolve(api(originalRequest)), 1000)
        );
      }
    }
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
        // Attempt to fetch the URL directly with fetch API as a fallback
        console.log("[API] Attempting fallback fetch to diagnose the issue...");
        fetch(`${error.config?.baseURL}${error.config?.url}`, {
          method: error.config?.method.toUpperCase(),
          headers: { "Content-Type": "application/json" },
          mode: "no-cors", // Try with no-cors mode
        })
          .then((resp) => {
            console.log("[API] Fallback fetch response:", resp);
          })
          .catch((err) => {
            console.error("[API] Fallback fetch also failed:", err);
          });
      }

      // Check if it's a timeout
      if (error.code === "ECONNABORTED") {
        console.error(
          "[API] Request timed out - server might be overloaded or unreachable"
        );
      }
    } else {
      // Something else happened while setting up the request
      console.error("[API] Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Export the enhanced axios instance
export default api;
