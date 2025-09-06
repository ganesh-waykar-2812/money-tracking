export const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_API_URL || "http://localhost:5000";
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_APP_VAPID_PUBLIC_KEY;

export const REQUIRED_TOKEN_VERSION = "13"; // Increment this after deployment
