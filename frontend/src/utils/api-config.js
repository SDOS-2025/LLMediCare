import axios from "axios";
import { API_BASE_URL } from "./environment";

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor for authentication tokens if needed
axios.interceptors.request.use(
  (config) => {
    // You can add auth token logic here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with an error status
      console.error(
        "Response error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // Request was made but no response received
      console.error("Request error:", error.request);
    } else {
      // Something else happened while setting up the request
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axios;
