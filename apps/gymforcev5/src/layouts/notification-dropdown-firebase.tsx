import React, { useState, useEffect, ReactElement, cloneElement } from "react";
import {
  Popover,
  Text,
  Empty,
  Title,
  Tab,
  Button,
  Alert,
  Switch,
} from "rizzui";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { deleteToken, getMessaging, onMessage } from "firebase/messaging";
import toast from "react-hot-toast";
import { fetchFirebaseToken } from "@/components/firebaseToken";

dayjs.extend(relativeTime);

// Notification type
interface Notification {
  id: string;
  message: string;
  created_at: string;
  unRead: boolean;
}

const LOCAL_STORAGE_KEY = "notifications";
const NOTIFICATION_ENABLED_KEY = "notifications_enabled";

// Helper functions for notification storage
const getStoredNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading notifications from localStorage:", error);
    return [];
  }
};

const storeNotifications = (notifications: Notification[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("Error storing notifications in localStorage:", error);
  }
};

// Function to get/set notification preferences
const getNotificationEnabled = (): boolean => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_ENABLED_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    console.error("Error reading notification preferences:", error);
    return false;
  }
};

const setNotificationEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(enabled));
  } catch (error) {
    console.error("Error storing notification preferences:", error);
  }
};

// Notification components
const NotificationCard: React.FC<{
  notification: Notification;
  markRead: (id: string) => void;
}> = ({ notification, markRead }) => {
  return (
    <div
      className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => markRead(notification.id)}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
        <div className="w-full">
          <Text className="mb-0.5 truncate text-sm font-medium text-gray-900">
            {notification.message}
          </Text>
          <Text className="text-xs text-gray-500">
            {dayjs(notification.created_at).fromNow()}
          </Text>
        </div>
      </div>
    </div>
  );
};

// Main notification component
export default function NotificationDropdown({
  children,
}: {
  children: ReactElement;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(
    getStoredNotifications()
  );
  const [isOpen, setIsOpen] = useState(false);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    getNotificationEnabled()
  );
  const [isLoading, setIsLoading] = useState(false);

  // Handle toggle change
  const handleToggleChange = async (checked: boolean) => {
    setIsLoading(true);

    if (checked) {
      // Enabling notifications (existing behavior)
      try {
        const token = await fetchFirebaseToken();
        if (token) {
          setNotificationsEnabled(true);
          setNotificationEnabled(true);
          toast.success("Notifications enabled successfully");
        } else {
          toast.error("Failed to enable notifications");
        }
      } catch (error) {
        console.error("Error enabling notifications:", error);
        toast.error("Error enabling notifications");
      }
    } else {
      // Disabling notifications
      try {
        const messaging = getMessaging();
        const firebaseToken = localStorage.getItem("firebaseToken");
        if (firebaseToken) {
          // Delete the token from Firebase
          const deleted = await deleteToken(messaging);
          if (deleted) {
            console.log("Firebase token deleted successfully");
            // Optionally, unregister token from backend:
            // await AxiosPrivate.delete("/notif/unregister-fcm-token/", { data: { token: firebaseToken } });
          } else {
            console.error("Failed to delete Firebase token");
          }
          localStorage.removeItem("firebaseToken");
        }
      } catch (error) {
        console.error("Error disabling notifications:", error);
        toast.error("Error disabling notifications");
      }

      // Update local state and storage, and clear stored notifications if needed
      setNotificationsEnabled(false);
      setNotificationEnabled(false);
      markAsRead(); // Clear notifications
      toast.success("Notifications disabled");
    }

    setIsLoading(false);
  };

  // Process incoming notifications
  const processNotification = (notification: Notification) => {
    // Only process notifications if they're enabled
    if (!notificationsEnabled) return;

    console.log("Processing notification:", notification);

    // Add notification if it doesn't already exist
    setNotifications((prev) => {
      // Check if notification with same ID already exists
      if (prev.some((n) => n.id === notification.id)) {
        return prev;
      }

      // Add the new notification
      const updated = [notification, ...prev];
      storeNotifications(updated);
      return updated;
    });

    // Show toast
    setLatestMessage(notification.message);
    setTimeout(() => setLatestMessage(null), 3000);
  };

  // Listen for Firebase foreground messages
  useEffect(() => {
    if (!notificationsEnabled) return () => {};

    try {
      const messaging = getMessaging();

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);

        const notification = {
          id: payload.messageId || Date.now().toString(),
          message: payload.notification?.body || "New Notification",
          created_at: new Date().toISOString(),
          unRead: true,
        };

        processNotification(notification);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up foreground message listener:", error);
      return () => {};
    }
  }, [notificationsEnabled]);

  // Listen for service worker messages
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      console.log("Service worker message received:", event.data);

      // Filter out non-notification messages
      if (!event.data.type) return;

      if (
        event.data.type === "NEW_NOTIFICATION" &&
        event.data.source === "service-worker"
      ) {
        processNotification(event.data.notification);
      } else if (event.data.type === "NOTIFICATION_CLICK") {
        processNotification(event.data.notification);
        setIsOpen(true);
      }
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );
    }

    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }
    };
  }, []);

  // Mark notifications as read
  const markAsRead = (id?: string) => {
    if (id) {
      // Mark single notification as read
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        storeNotifications(updated);
        return updated;
      });
    } else {
      // Mark all as read
      setNotifications([]);
      storeNotifications([]);
    }
  };

  // Check notification permission status when component mounts
  useEffect(() => {
    const checkInitialPermissionStatus = async () => {
      if (Notification.permission === "granted") {
        const token = localStorage.getItem("firebaseToken");
        if (token) {
          setNotificationsEnabled(true);
          setNotificationEnabled(true);
        }
      }
    };

    checkInitialPermissionStatus();
  }, []);

  return (
    <>
      {/*
        {latestMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert color="info" onClose={() => setLatestMessage(null)}>
            {latestMessage}
          </Alert>
        </div>
      )}
  */}
      <Popover
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        shadow="sm"
        placement="bottom-end"
      >
        <Popover.Trigger>
          {/* {cloneElement(children, { onClick: () => setIsOpen(!isOpen) })} */}
          <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
        </Popover.Trigger>
        <Popover.Content className="z-[9999] px-1 py-4">
          <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] p-4">
            <div className="flex justify-between items-center mb-4">
              <Title as="h5" className="font-semibold text-gray-900">
                Notifications
              </Title>
              <div className="flex items-center gap-2">
                <Text className="text-xs text-gray-500">
                  {notificationsEnabled ? "Enabled" : "Disabled"}
                </Text>
                <Switch
                  checked={notificationsEnabled}
                  onChange={() => {
                    handleToggleChange(!notificationsEnabled);
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Tab>
              <Tab.List>
                <Tab.ListItem>Alerts</Tab.ListItem>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  {notifications.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.success(`All Alerts are cleared`);
                        markAsRead();
                      }}
                      className="mb-3"
                    >
                      Mark all as read
                    </Button>
                  )}
                  <SimpleBar className="max-h-[420px]">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <NotificationCard
                          key={n.id}
                          notification={n}
                          markRead={markAsRead}
                        />
                      ))
                    ) : (
                      <Empty
                        text={
                          notificationsEnabled
                            ? "No Alert Notifications"
                            : "Notifications are disabled"
                        }
                        className="w-full h-full flex justify-center items-center py-8"
                      />
                    )}
                  </SimpleBar>
                </Tab.Panel>
              </Tab.Panels>
            </Tab>
          </div>
        </Popover.Content>
      </Popover>
    </>
  );
}
