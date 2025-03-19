import { redirect } from "next/navigation";
import { decryptToken, encryptToken } from "./Acces";
import { AxiosPrivate, newID } from "./AxiosPrivate";

const GYM_ID_KEY = "gymId";

const isBrowser = (): boolean => typeof window !== "undefined";

export function setGymId(id: string): void {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Gym ID not set.");
    return;
  }

  try {
    localStorage.setItem(GYM_ID_KEY, id);
    console.log("Gym ID set successfully:", id);
  } catch (error) {
    console.error("Error setting gym ID:", error);
    throw new Error("Failed to set gym ID");
  }
}

export async function getGymId(): Promise<string | null> {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Cannot get gym ID.");
    return null;
  }

  try {
    const encryptedId = localStorage.getItem(GYM_ID_KEY);
    if (!encryptedId) {
      const { data } = await AxiosPrivate.get("/api/profile", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const newGymId =
        data.associated_gyms.find((gym: any) => gym.is_primary === true) ||
        data.associated_gyms[0];
      // const newGymId = data.associated_gyms[0]?.gym_id.toString();
      if (data.associated_gyms.length && newGymId) {
        setGymId(newGymId?.gym_id.toString());
        return newGymId?.gym_id.toString();
      }
      redirect("/gym-registration");
    }
    return encryptedId;
  } catch (error) {
    console.error("Error getting gym ID:", error);
    return null;
  }
}

export async function retrieveGymId(): Promise<string | null> {
  if (!isBrowser()) {
    return null;
  }
  try {
    return await getGymId();
  } catch (error) {
    console.error("Error in retrieveGymId:", error);
    return null;
  }
}

export function deleteGymId(): void {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Cannot delete gym ID.");
    return;
  }

  try {
    localStorage.removeItem(GYM_ID_KEY);
    console.log("Gym ID deleted successfully");
  } catch (error) {
    console.error("Error deleting gym ID:", error);
    throw new Error("Failed to delete gym ID");
  }
}
