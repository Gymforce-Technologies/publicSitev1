import axios from "axios";
import {
  setupCache,
  AxiosCacheInstance,
  buildWebStorage,
} from "axios-cache-interceptor";

const URL = process.env.NEXT_PUBLIC_URL;
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
