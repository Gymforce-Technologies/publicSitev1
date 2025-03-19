import React, {
  useState,
  useEffect,
  ReactElement,
  cloneElement,
  useRef,
  useCallback,
} from "react";
import {
  Loader,
  Popover,
  Text,
  Empty,
  Button,
  Title,
  Announcement,
  Accordion,
  ActionIcon,
  Checkbox,
  Badge,
  Tab,
  Switch,
} from "rizzui";
import { formatDate } from "@core/utils/format-date";
import { BsCheck2All } from "react-icons/bs";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { AiOutlineInfoCircle } from "react-icons/ai";
import {
  PiUserPlus,
  PiCreditCard,
  PiCurrencyDollar,
  PiTag,
  PiCheck,
} from "react-icons/pi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getnewTokens } from "@/app/[locale]/auth/Refresh";
// import { useSound } from "@/hooks/useSound";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { CheckCheckIcon } from "lucide-react";
import { fetchFirebaseToken } from "@/components/firebaseToken";
import toast from "react-hot-toast";
import { deleteToken, getMessaging, onMessage } from "firebase/messaging";

dayjs.extend(relativeTime);

interface Notification {
  notification_id: string;
  title: string;
  message: string;
  timestamp: string;
  unRead?: boolean;
  data?: string;
}

const getIcon = (activityType: string) => {
  if (!activityType)
    return <AiOutlineInfoCircle className="h-5 w-5 text-primary" />;
  switch (activityType.toLowerCase()) {
    case "membership":
      return <PiTag className="h-5 w-5 text-purple-500" />;
    case "member":
      return <PiUserPlus className="h-5 w-5 text-green-500" />;
    case "transaction":
      return <PiCreditCard className="h-5 w-5 text-blue-500" />;
    case "expense":
      return <PiCurrencyDollar className="h-5 w-5 text-yellow-500" />;
    default:
      return <AiOutlineInfoCircle className="h-5 w-5 text-primary" />;
  }
};

// Component to render individual notification
const NotificationCard: React.FC<{
  notification: Notification;
  onDelete: (id: string) => void;
}> = ({ notification, onDelete }) => {
  const { title, message, timestamp, notification_id } = notification;

  // Extract action and staff name from message
  const parts = message.split(" ");
  const description = message;
  // const staffName = parts[parts.length - 1];

  return (
    <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-1.5 py-1.5 pe-3 transition-colors hover:bg-gray-100">
      <div className="flex h-9 w-9 items-center justify-center rounded bg-inherit p-1 dark:bg-inherit [&>svg]:h-auto [&>svg]:w-5">
        {getIcon(parts[1])}
      </div>
      <div className="grid items-center">
        <Text className="mb-0.5 truncate text-sm font-medium text-gray-900">
          {title}
        </Text>
        <div className="w-full">
          <Text className="mb-0.5 truncate text-sm text-gray-700">
            {description}
          </Text>
          <div className="text-xs w-full text-gray-500 flex gap-2 justify-end items-end ">
            <Text>{dayjs(timestamp).fromNow()}</Text>
            <ActionIcon size="sm" onClick={() => onDelete(notification_id)}>
              <CheckCheckIcon size={12} />
            </ActionIcon>
          </div>
        </div>
        {/* <div className="ms-auto flex-shrink-0">
          <span
            className="inline-block rounded-full bg-gray-100 p-0.5 dark:bg-gray-50 cursor-pointer"
            onClick={() => onDelete(notification_id)}
          >
            <PiCheck className="h-auto w-[9px]" />
          </span>
        </div> */}
      </div>
    </div>
  );
};

// Component to render the list of notifications
const NotificationsList: React.FC<{
  notifications: Notification[];
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleToggleChange: (checked: boolean) => Promise<void>;
  notificationsEnabled: boolean;
}> = ({
  notifications,
  markAllAsRead,
  deleteNotification,
  handleToggleChange,
  notificationsEnabled,
}) => {
  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] p-3">
      <div className="flex justify-between items-center mb-2 p-2">
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
            // disabled={isLoading}
          />
        </div>
      </div>
      <Tab>
        <Tab.List className="">
          <Tab.ListItem className="">Alerts</Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <SimpleBar className="max-h-[420px]">
              <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
                {notificationsEnabled && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <NotificationCard
                      key={notification.notification_id}
                      notification={notification}
                      onDelete={deleteNotification}
                    />
                  ))
                ) : (
                  <Empty
                    text={
                      !notificationsEnabled
                        ? "Notifications are disabled"
                        : notifications.length
                          ? ""
                          : "No new notifications"
                    }
                    textClassName="mt-2"
                    className="w-full h-full flex justify-center items-center"
                  />
                )}
              </div>
            </SimpleBar>
            {/* <div className="mt-3 flex items-center justify-end pe-6">
              <Button
                size="sm"
                onChange={() => markAllAsRead()}
                className={notifications.length === 0 ? "hidden" : ""}
              >
                Mark All as Read
              </Button>
            </div> */}
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
    </div>
  );
};

// Main component
interface NotificationDropdownProps {
  children: ReactElement;
}
const NOTIFICATION_ENABLED_KEY = "notifications_enabled";

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

export default function NotificationDropdown({
  children,
}: NotificationDropdownProps) {
  // const playNotificationSound = useSound("./notification-sound.mp3");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);
  const [animateIcon, setAnimateIcon] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    getNotificationEnabled()
  );
  const getUserId = useCallback(async () => {
    try {
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      setUserId(userId);
      return userId;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  }, []);

  const handleToggleChange = async (checked: boolean) => {
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
      markAllAsRead(); // Clear notifications
      toast.success("Notifications disabled");
    }
  };

  const connectWebSocket = useCallback(async () => {
    setLoading(true);
    const currentUserId = userId || (await getUserId());

    if (!currentUserId) {
      console.error("Failed to get user ID");
      setLoading(false);
      return;
    }

    const URL = process.env.NEXT_PUBLIC_URL || "https://apiv2.gymforce.in";
    const socket = new WebSocket(
      `${URL.replace("https", "wss")}/ws/notifications/${currentUserId}/`
    );

    socket.onopen = () => {
      console.log("WebSocket connection established");
      setLoading(false);
    };

    socket.onmessage = (event) => {
      console.log("Received message:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("Parsed data:", data);
        if (Array.isArray(data.notifications)) {
          // Initial load of notifications
          // const sortedNotifications = data.sort(
          //   (a, b) =>
          //     new Date(b.timestamp).getTime() -
          //     new Date(a.timestamp).getTime()
          // );
          setNotifications(data.notifications);
        } else if (data && data.type !== "notification_deleted") {
          // Single new notification
          const newNotification: Notification = {
            notification_id: data.notification_id,
            message: data.message,
            timestamp: data.timestamp,
            title: data.title,
            unRead: true,
          };
          // playNotificationSound(); // Play sound when new notification is received
          setAnimateIcon(true);
          setTimeout(() => setAnimateIcon(false), 500); // Reset shake after 500ms
          setNotifications((prev) => {
            const existingIds = new Set(
              prev.map((notif) => notif.notification_id)
            );
            if (!existingIds.has(newNotification.notification_id)) {
              const updatedNotifications = [newNotification, ...prev];
              return updatedNotifications.sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              );
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      } finally {
        setLoading(false);
      }
    };

    socket.onerror = async (event) => {
      console.error("WebSocket error:", event);
      setLoading(false);
      await getnewTokens();
      setTimeout(connectWebSocket, 5000);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
      setLoading(false);
      setTimeout(connectWebSocket, 5000);
    };

    socketRef.current = socket;
  }, [userId, getUserId]);

  useEffect(() => {
    getUserId().then(() => connectWebSocket());
    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket connection");
        socketRef.current.close();
      }
    };
  }, [connectWebSocket, getUserId]);

  const deleteNotification = (id: string) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        action: "delete_notification",
        notification_id: id,
      });

      socket.send(message);
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.notification_id !== id
        )
      );
    } else {
      console.error("WebSocket is not connected.");
      connectWebSocket();
    }
  };

  const markAllAsRead = () => {
    notifications.forEach((notification) => {
      deleteNotification(notification.notification_id);
    });
  };
  // Listen for Firebase foreground messages
  useEffect(() => {
    if (!notificationsEnabled) return () => {};

    try {
      const messaging = getMessaging();

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up foreground message listener:", error);
      return () => {};
    }
  }, [notificationsEnabled]);

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
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
      arrowClassName="text-gray-400"
    >
      <Popover.Trigger>
        <div className={`${animateIcon ? "animate-blink" : ""}`}>
          {cloneElement(children, {
            onClick: () => setIsOpen(!isOpen),
          })}
        </div>
      </Popover.Trigger>
      <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-4 [&>svg]:hidden sm:[&>svg]:inline-fle">
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[200px] w-[320px] text-left sm:w-[360px] 2xl:w-[420px] p-4">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <NotificationsList
            notifications={notifications}
            markAllAsRead={markAllAsRead}
            deleteNotification={deleteNotification}
            setIsOpen={setIsOpen}
            notificationsEnabled={notificationsEnabled}
            handleToggleChange={handleToggleChange}
          />
        )}
      </Popover.Content>
    </Popover>
  );
}
