/**
 * Environment configuration file
 * Contains configurations for different environments (development, production)
 */

// Check if we have runtime configuration from window.APP_CONFIG
const getRuntimeConfig = () => {
  if (typeof window !== "undefined" && window.APP_CONFIG) {
    return {
      API_BASE_URL: window.APP_CONFIG.API_BASE_URL,
      USER_API_PATH: window.APP_CONFIG.USER_API_PATH,
      AI_API_PATH: window.APP_CONFIG.AI_API_PATH,
    };
  }
  return null;
};

// Check for locally stored configuration that overrides the default
const getLocalConfig = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const localConfig = window.localStorage.getItem("APP_CONFIG");
    if (localConfig) {
      try {
        return JSON.parse(localConfig);
      } catch (e) {
        console.error("Error parsing local config:", e);
      }
    }
  }
  return null;
};

// Base API URLs
const ENVIRONMENTS = {
  development: {
    API_BASE_URL: "http://localhost:8000",
    USER_API_PATH: "/api/user",
    AI_API_PATH: "/api/ai",
  },
  production: {
    API_BASE_URL:
      "https://devserver-main--splendorous-melba-fc5384.netlify.app",
    USER_API_PATH: "/api/user",
    AI_API_PATH: "/api/ai",
  },
};

// Determine current environment
const ENV =
  process.env.NODE_ENV === "production" ? "production" : "development";

// Priority: 1. Local storage config, 2. Runtime config, 3. Environment config
export const config =
  getLocalConfig() || getRuntimeConfig() || ENVIRONMENTS[ENV];

// Convenience exports for the most commonly used URLs
export const API_BASE_URL = config.API_BASE_URL;
export const USER_API_URL = `${config.API_BASE_URL}${config.USER_API_PATH}`;
export const AI_API_URL = `${config.API_BASE_URL}${config.AI_API_PATH}`;

// Helper function to update the API URL at runtime
export const updateApiUrl = (newUrl) => {
  if (typeof window !== "undefined" && window.localStorage) {
    const updatedConfig = { ...config, API_BASE_URL: newUrl };
    window.localStorage.setItem("APP_CONFIG", JSON.stringify(updatedConfig));
    console.log(
      `API URL updated to: ${newUrl}. Refresh the page to apply changes.`
    );
    return true;
  }
  return false;
};
