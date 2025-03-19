import {
  getMessaging,
  getToken as getMessagingToken,
} from "firebase/messaging";
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";

// This will prevent duplicate token registrations
export const fetchFirebaseToken = async () => {
  try {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Only request permission if not already granted
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const messaging = getMessaging();
    const token = await getMessagingToken(messaging, {
      vapidKey:
        "BHXsrVAK0eIEvDm9ZNXTvznqKl5LcjNoc3OwwYFQUF68HoDi8q3oxFflpL2w-Bsc1_JxS7oP6yIIE5kfqAtdOes",
    });

    if (!token) {
      console.log("No FCM token received");
      return null;
    }

    // Check against stored token to prevent duplicates
    const storedToken = localStorage.getItem("firebaseToken");

    // If token changed or doesn't exist, register it
    if (storedToken !== token) {
      try {
        await AxiosPrivate.post("/notif/register-fcm-token/", { token });
        localStorage.setItem("firebaseToken", token);
        console.log("New token registered:", token);
      } catch (error) {
        console.error("Backend registration error:", error);
      }
    } else {
      console.log("Token already registered, skipping backend request");
    }

    return token;
  } catch (error) {
    console.error("Firebase messaging setup error:", error);
    return null;
  }
};
