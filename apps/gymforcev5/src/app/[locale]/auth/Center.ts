import { AxiosPrivate, newID } from "./AxiosPrivate";

// Constants for center types
const CENTER_TYPES = {
  "0": "Gym",
  "1": "Library",
  "2": "Dance",
} as const;

// Function to set center type in session storage
export function setCenterType(value: string): void {
  sessionStorage.setItem("centerType", JSON.stringify(value));
}

// Function to get center type
export async function getCenterType() {
  try {
    // First check if center type exists in session storage
    const storedCenterType = sessionStorage.getItem("centerType");
    if (storedCenterType) {
      return (
        CENTER_TYPES[
          JSON.parse(storedCenterType) as keyof typeof CENTER_TYPES
        ] || ""
      );
    }

    // If not in session storage, fetch from API
    const response = await AxiosPrivate.get("/api/profile", {
      id: newID("user-profile"),
      cache: {
        ttl: 60 * 60 * 1000,
      },
    });

    const centerValue = response.data.center;
    if (centerValue) {
      // Store the center value in session storage
      sessionStorage.setItem("centerType", JSON.stringify(centerValue));

      // Return the mapped center type
      return CENTER_TYPES[centerValue as keyof typeof CENTER_TYPES] || "";
    }

    return "";
  } catch (error) {
    console.error("Error fetching center type:", error);
    return "";
  }
}
