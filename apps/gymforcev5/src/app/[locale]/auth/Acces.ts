import CryptoJS from "crypto-js";
import { getnewTokens, setRefreshToken } from "./Refresh";

const SECRET_KEY = "SAMPLE_KEY";

export const encryptToken = (token: string): string => {
  try {
    return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
  } catch (error) {
    console.error("Error encrypting token:", error);
    throw new Error("Failed to encrypt token");
  }
};

export const decryptToken = (encryptedToken: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
    const resp = bytes.toString(CryptoJS.enc.Utf8);
    console.log("decrypted token:", resp);
    return resp;
  } catch (error) {
    console.error("Error decrypting token:", error);
    throw new Error("Failed to decrypt token");
  }
};

// Type guard to check if we're in a browser environment
const isBrowser = (): boolean => typeof window !== "undefined";

// Client-side function to set access token
export const setAccessToken = (token: string): void => {
  if (isBrowser()) {
    try {
      const encryptedToken = encryptToken(token);
      localStorage.setItem("accessToken", encryptedToken);
      console.log("Access token set:", encryptedToken); // Debug log
    } catch (error) {
      console.error("Error setting access token:", error);
      throw new Error("Failed to set access token");
    }
  }
};

// Client-side function to get access token
export const getAccessToken = async (): Promise<string | null> => {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Cannot get access token.");
    return null;
  }

  try {
    const encryptedToken = localStorage.getItem("accessToken");
    if (encryptedToken) {
      return decryptToken(encryptedToken);
    } else {
      // Attempt to refresh tokens if no access token is present
      await getnewTokens();
      const token = localStorage.getItem("accessToken");
      return token ? decryptToken(token) : null;
    }
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};


// Client-side function to clear access token
export const clearAccessToken = (): void => {
  if (isBrowser()) {
    try {
      localStorage.removeItem("accessToken");
    } catch (error) {
      console.error("Error clearing access token:", error);
      throw new Error("Failed to clear access token");
    }
  } else {
    console.error(
      "Error: Not in browser environment. Cannot clear access token."
    );
  }
};
