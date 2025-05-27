import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "https://api.stage.seo-ai.kz/b",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  if (sessionId && userId) {
    config.headers["Session-id"] = sessionId;
    config.headers["User-Id"] = userId;
  }
  config.headers["Platform-Type"] = "WEB";
  config.headers["Version"] = "1";
  config.headers["Debug-Mode"] = "true";
  return config;
});
