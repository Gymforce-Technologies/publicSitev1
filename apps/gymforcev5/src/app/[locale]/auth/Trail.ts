import { AxiosPrivate, newID } from "./AxiosPrivate";

const USER_INFO_KEY = "userSubscriptionInfo";

export interface UserSubscriptionInfo {
  with_subscription: boolean;
  subscription_end_date: string | null;
  subscription_valid_days: number;
  is_on_trial: boolean;
  trial_end_date: string | null;
  trial_valid_days: number;
}

const isBrowser = (): boolean => typeof window !== "undefined";

export async function retrieveUserSubscriptionInfo(): Promise<UserSubscriptionInfo | null> {
  console.log("Entering retrieveUserSubscriptionInfo");
  if (!isBrowser()) {
    console.log("Not in browser environment");
    return null;
  }
  try {
    const result = await getUserSubscriptionInfo();
    return result;
  } catch (error) {
    console.error("Error in retrieveUserSubscriptionInfo:", error);
    return null;
  }
}

export function setUserSubscriptionInfo(info: UserSubscriptionInfo): void {
  if (!isBrowser()) {
    console.error(
      "Error: Not in browser environment. User subscription info not set."
    );
    return;
  }
  if (
    info.with_subscription === undefined ||
    info.is_on_trial === undefined ||
    info.subscription_valid_days === undefined ||
    info.trial_valid_days === undefined
  ) {
    return;
  }
  try {
    sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
  } catch (error) {
    console.error("Error setting user subscription info:", error);
    throw new Error("Failed to set user subscription info");
  }
}

export function getUserSubscriptionInfo(): Promise<UserSubscriptionInfo | null> {
  if (!isBrowser()) {
    console.error(
      "Error: Not in browser environment. Cannot get user subscription info."
    );
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const storedInfo = sessionStorage.getItem(USER_INFO_KEY);
      if (!storedInfo) {
        AxiosPrivate.get("/api/profile", {
          id: newID("user-profile"),
          cache: {
            ttl: 60 * 60 * 1000,
          },
        })
          .then((response) => {
            const newUserInfo: UserSubscriptionInfo = {
              with_subscription: response.data.with_subscription ?? false,
              subscription_end_date:
                response.data.subscription_end_date ?? null,
              subscription_valid_days:
                response.data.subscription_valid_days ?? 0,
              is_on_trial: response.data.is_on_trial ?? false,
              trial_end_date: response.data.trial_end_date ?? null,
              trial_valid_days: response.data.trial_valid_days ?? 0,
            };
            setUserSubscriptionInfo(newUserInfo);
            resolve(newUserInfo);
          })
          .catch((error) => {
            console.error("Error fetching user profile:", error);
            resolve(null);
          });
      } else {
        resolve(JSON.parse(storedInfo));
      }
    } catch (error) {
      console.error("Error getting user subscription info:", error);
      resolve(null);
    }
  });
}

export function isUserOnTrial(info: UserSubscriptionInfo): boolean {
  return info.is_on_trial && new Date(info.trial_end_date!) > new Date();
}

export function isUserSubscribed(info: UserSubscriptionInfo): boolean {
  return (
    info.with_subscription && new Date(info.subscription_end_date!) > new Date()
  );
}

export function getUserStatus(info: UserSubscriptionInfo): string {
  if (isUserSubscribed(info)) {
    return "Subscription";
  } else if (isUserOnTrial(info)) {
    return "Trial";
  } else {
    return "Expired";
  }
}

function validateUser(info: UserSubscriptionInfo): string {
  if (isUserSubscribed(info)) {
    return "Subscribed";
  } else if (isUserOnTrial(info)) {
    return "Trial";
  } else {
    return "Restricted";
  }
}

export async function checkUserAccess(): Promise<string> {
  try {
    const userInfo = await getUserSubscriptionInfo();

    if (!userInfo) {
      console.error("Unable to retrieve user info");
      return "Restricted";
    }

    return validateUser(userInfo);
  } catch (error) {
    console.error("Error checking user access:", error);
    return "Restricted";
  }
}
