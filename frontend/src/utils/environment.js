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

// Base API URLs
const ENVIRONMENTS = {
  development: {
    API_BASE_URL: "http://localhost:8000",
    USER_API_PATH: "/api/user",
    AI_API_PATH: "/api/ai",
  },
  production: {
    API_BASE_URL:
      "https://fb0a-2405-201-4018-6162-1c04-5bae-f2aa-34b.ngrok-free.app",
    USER_API_PATH: "/api/user",
    AI_API_PATH: "/api/ai",
  },
};

// Determine current environment
const ENV =
  process.env.NODE_ENV === "production" ? "production" : "development";

// First try to use runtime config, then fall back to environment config
export const config = getRuntimeConfig() || ENVIRONMENTS[ENV];

// Convenience exports for the most commonly used URLs
export const API_BASE_URL = config.API_BASE_URL;
export const USER_API_URL = `${config.API_BASE_URL}${config.USER_API_PATH}`;
export const AI_API_URL = `${config.API_BASE_URL}${config.AI_API_PATH}`;
