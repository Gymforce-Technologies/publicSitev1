"use client";
import { redirect } from "next/navigation";
import { AxiosPublic } from "./AxiosPrivate";

const CENTER_TYPE_KEY = "centerType";
const CENTER_CODE_KEY = "centerCode";

const isBrowser = (): boolean => typeof window !== "undefined";

// Get subdomain from URL
export function getSubdomain(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting subdomain:", error);
    return null;
  }
}

// Set center type
export function setCenterType(type: string): void {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Center type not set.");
    return;
  }

  try {
    sessionStorage.setItem(CENTER_TYPE_KEY, type);
    console.log("Center type set successfully:", type);
  } catch (error) {
    console.error("Error setting center type:", error);
    throw new Error("Failed to set center type");
  }
}

// Set center code
export function setCenterCode(code: string): void {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Center code not set.");
    return;
  }

  try {
    sessionStorage.setItem(CENTER_CODE_KEY, code);
    console.log("Center code set successfully:", code);
  } catch (error) {
    console.error("Error setting center code:", error);
    throw new Error("Failed to set center code");
  }
}

// Get center type and code
export async function getCenterInfo(): Promise<{
  centerType: string | null;
  centerCode: string | null;
}> {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Cannot get center info.");
    return { centerType: null, centerCode: null };
  }

  try {
    let centerType = sessionStorage.getItem(CENTER_TYPE_KEY);
    let centerCode = sessionStorage.getItem(CENTER_CODE_KEY);

    if (!centerType || !centerCode) {
      //   const subdomain = getSubdomain();

      //   if (!subdomain) {
      //     console.error("Error: Could not determine subdomain");
      //     return { centerType: null, centerCode: null };
      //   }
      //   console.log(subdomain);
      const { data } = await AxiosPublic.post(`/center/tenant/higym/`);

      if (data && data.center !== undefined && data.code) {
        setCenterType(data.center);
        setCenterCode(data.code);
        return { centerType: data.center, centerCode: data.code };
      } else {
        console.error("Error: Center info not found in API response");
        redirect("/registration");
      }
    }

    return { centerType, centerCode };
  } catch (error) {
    console.error("Error getting center info:", error);
    return { centerType: null, centerCode: null };
  }
}

// Get center type
export async function getCenterType(): Promise<string | null> {
  const { centerType } = await getCenterInfo();
  return centerType;
}

// Get center code
export async function getCenterCode(): Promise<string | null> {
  const { centerCode } = await getCenterInfo();
  return centerCode;
}

// Delete center type
export function deleteCenterType(): void {
  if (!isBrowser()) {
    console.error(
      "Error: Not in browser environment. Cannot delete center type."
    );
    return;
  }

  try {
    sessionStorage.removeItem(CENTER_TYPE_KEY);
    console.log("Center type deleted successfully");
  } catch (error) {
    console.error("Error deleting center type:", error);
    throw new Error("Failed to delete center type");
  }
}

// Delete center code
export function deleteCenterCode(): void {
  if (!isBrowser()) {
    console.error(
      "Error: Not in browser environment. Cannot delete center code."
    );
    return;
  }

  try {
    sessionStorage.removeItem(CENTER_CODE_KEY);
    console.log("Center code deleted successfully");
  } catch (error) {
    console.error("Error deleting center code:", error);
    throw new Error("Failed to delete center code");
  }
}

// Delete all center info
export function deleteCenterInfo(): void {
  deleteCenterType();
  deleteCenterCode();
}
