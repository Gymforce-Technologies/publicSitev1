import { AxiosPrivate, newID } from "./AxiosPrivate";
import { retrieveGymId } from "./InfoCookies";

const DEMOGRAPHIC_KEY = "demographicInfo";

export interface DemographicInfo {
  country: string;
  country_code: string;
  currency: string;
  currency_symbol: string;
}

const isBrowser = (): boolean => typeof window !== "undefined";

export function setDemographicInfo(info: DemographicInfo): void {
  if (!isBrowser()) {
    console.error(
      "Error: Not in browser environment. Demographic info not set."
    );
    return;
  }

  if (!info.country || !info.country_code || !info.currency) {
    console.error("Invalid demographic info. Not setting.", info);
    return;
  }

  try {
    localStorage.setItem(DEMOGRAPHIC_KEY, JSON.stringify(info));
  } catch (error) {
    console.error("Error setting demographic info:", error);
    throw new Error("Failed to set demographic info");
  }
}

export async function getDemographicInfo(): Promise<DemographicInfo | null> {
  if (!isBrowser()) {
    console.error(
      "Error: Not in browser environment. Cannot get demographic info."
    );
    return null;
  }

  try {
    const storedInfo = localStorage.getItem(DEMOGRAPHIC_KEY);

    if (!storedInfo) {
      const response = await AxiosPrivate.get("/api/profile", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const gymId = await retrieveGymId();
      const gym = response.data.associated_gyms.find(
        (gym: any) => gym.gym_id.toString() === gymId
      );
      if (!gym) {
        throw new Error("No gym found in associated_gyms");
      }

      const newDemographicInfo: DemographicInfo = {
        country: gym.country,
        country_code: gym.country_code,
        currency: gym.currency,
        currency_symbol: gym.currency_symbol || "",
      };
      setDemographicInfo(newDemographicInfo);
      return newDemographicInfo;
    }

    const parsedInfo = JSON.parse(storedInfo);
    return parsedInfo;
  } catch (error) {
    console.error("Error getting demographic info:", error);
    return null;
  }
}

export async function retrieveDemographicInfo(): Promise<DemographicInfo | null> {
  if (!isBrowser()) {
    return null;
  }
  try {
    return await getDemographicInfo();
  } catch (error) {
    console.error("Error in retrieveDemographicInfo:", error);
    return null;
  }
}

export function deleteDemographicInfo(): void {
  if (!isBrowser()) {
    console.error(
      "Error: Not in browser environment. Cannot delete demographic info."
    );
    return;
  }

  try {
    localStorage.removeItem(DEMOGRAPHIC_KEY);
  } catch (error) {
    console.error("Error deleting demographic info:", error);
    throw new Error("Failed to delete demographic info");
  }
}
