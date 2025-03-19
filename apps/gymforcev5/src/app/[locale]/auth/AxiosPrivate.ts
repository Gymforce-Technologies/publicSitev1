import axios, { AxiosInstance } from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./Acces";
import {
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
  getnewTokens,
} from "./Refresh";
import {
  setupCache,
  AxiosCacheInstance,
  buildWebStorage,
} from "axios-cache-interceptor";

const URL = process.env.NEXT_PUBLIC_URL;
// const CacheIDS:string[]=[];

export const createAxiosPrivate = (): AxiosCacheInstance => {
  const axiosPrivate = axios.create({
    baseURL: URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  // Add request interceptor
  axiosPrivate.interceptors.request.use(
    async (config) => {
      let accessToken = await getAccessToken();
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Setup cache
  const cacheAxiosPrivate = setupCache(axiosPrivate, {
    ttl: 15 * 60 * 1000,
    storage:
      typeof window !== "undefined"
        ? buildWebStorage(sessionStorage, "axios-cache:")
        : undefined,
    methods: ["get"],
    debug:
      process.env.NODE_ENV === "development"
        ? (msg) => console.log("[axios-cache-interceptor]", msg)
        : undefined,
  });

  // Add response interceptor
  cacheAxiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const URL = process.env.NEXT_PUBLIC_URL;
          const refreshToken = await getRefreshToken();
          const Req = `${URL}/api/refresh-token/`;
          const response = await axios.post(
            Req,
            {
              refresh_token: refreshToken,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          console.log();
          const newAccessToken = response.data.access;
          const newRefreshToken = response.data.refresh;
          setAccessToken(newAccessToken);
          setRefreshToken(newRefreshToken);
          cacheAxiosPrivate.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return cacheAxiosPrivate(originalRequest);
        } catch (refreshError) {
          console.log("Error refreshing token:", refreshError);
          clearAccessToken();
          clearRefreshToken();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/sign-in";
          }
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return cacheAxiosPrivate;
};

export const AxiosPrivate = createAxiosPrivate();

const getAxiosCacheKeys = (): string[] => {
  return Object.keys(sessionStorage).filter((key) =>
    key.startsWith("axios-cache:")
  );
};

export const invalidateAll = () => {
  const cacheKeys = getAxiosCacheKeys();
  console.log("Invalidating all cache keys:", cacheKeys);
  cacheKeys.forEach((key) => {
    // Remove from sessionStorage
    sessionStorage.removeItem(key);

    const cacheKey = key.replace("axios-cache:", "");
    AxiosPrivate.storage.remove(cacheKey);
  });

  console.log("After invalidation, remaining cache keys:", getAxiosCacheKeys());
};

export const newID = (id: string) => {
  return id;
};

export const logCurrentCacheKeys = () => {
  const cacheKeys = getAxiosCacheKeys();
  console.log("Current axios cache keys:", cacheKeys);
};

// Public Caching

export const createAxiosPublic = (): AxiosCacheInstance => {
  // Create basic axios instance
  const axiosPublic = axios.create({
    baseURL: URL,
    headers: { "Content-Type": "application/json" },
  });

  // Setup cache
  const cacheAxiosPublic = setupCache(axiosPublic, {
    // Cache for 15 minutes
    ttl: 15 * 60 * 1000,
    // Use session storage if in browser
    storage:
      typeof window !== "undefined"
        ? buildWebStorage(sessionStorage, "axios-public-cache:")
        : undefined,
    // Only cache GET requests
    methods: ["get"],
    // Debug logging in development
    debug:
      process.env.NODE_ENV === "development"
        ? (msg) => console.log("[axios-public-cache]", msg)
        : undefined,
  });

  // Add response interceptor for error handling
  cacheAxiosPublic.interceptors.response.use(
    (response) => response,
    async (error) => {
      return Promise.reject(error);
    }
  );

  return cacheAxiosPublic;
};

export const AxiosPublic = createAxiosPublic();

// Helper functions for cache management
export const getPublicAxiosCacheKeys = (): string[] => {
  return Object.keys(sessionStorage).filter((key) =>
    key.startsWith("axios-public-cache:")
  );
};

export const invalidatePublicCache = () => {
  const cacheKeys = getPublicAxiosCacheKeys();
  console.log("Invalidating public cache keys:", cacheKeys);

  cacheKeys.forEach((key) => {
    // Remove from sessionStorage
    sessionStorage.removeItem(key);

    // Remove from axios cache
    const cacheKey = key.replace("axios-public-cache:", "");
    AxiosPublic.storage.remove(cacheKey);
  });

  console.log(
    "After invalidation, remaining public cache keys:",
    getPublicAxiosCacheKeys()
  );
};

export const logPublicCacheKeys = () => {
  const cacheKeys = getPublicAxiosCacheKeys();
  console.log("Current public axios cache keys:", cacheKeys);
};
