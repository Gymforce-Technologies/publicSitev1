import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, Checkbox, Empty, Loader, Tab, Text } from "rizzui";

// Base interfaces
interface Notification {
  label: string;
  status: boolean;
  key: string;
}

interface NotificationResponse {
  [key: string]: boolean;
}

interface NotificationGroup {
  title: string;
  notifications: Array<{ key: string; label: string }>;
}

// WhatsApp notification groups
const whatsappNotificationGroups: NotificationGroup[] = [
  {
    title: "Membership Expiring",
    notifications: [
      { key: "m_membership_expiring_today_enabled", label: "Today" },
      { key: "m_membership_expiring_tomorrow_enabled", label: "Tomorrow" },
      { key: "m_membership_expiring_2days_enabled", label: "2 Days" },
      { key: "m_membership_expiring_7days_enabled", label: "7 Days" },
      { key: "m_membership_expiring_15days_enabled", label: "15 Days" },
    ],
  },
  {
    title: "Membership Expired",
    notifications: [
      { key: "m_membership_expired_yesterday_enabled", label: "Yesterday" },
      { key: "m_membership_expired_2days_enabled", label: "2 Days Ago" },
      { key: "m_membership_expired_5days_enabled", label: "5 Days Ago" },
      { key: "m_membership_expired_10days_enabled", label: "10 Days Ago" },
      { key: "m_membership_expired_15days_enabled", label: "15 Days Ago" },
      { key: "m_membership_expired_30days_enabled", label: "30 Days Ago" },
    ],
  },
  {
    title: "Payment Notifications",
    notifications: [
      { key: "m_payment_due_today_enabled", label: "Payment Due Today" },
      { key: "m_payment_due_tomorrow_enabled", label: "Payment Due Tomorrow" },
      {
        key: "m_payment_due_yesterday_enabled",
        label: "Payment Due Yesterday",
      },
      // { key: "m_payment_received_enabled", label: "Payment Received" },
    ],
  },
  {
    title: "Attendance",
    notifications: [
      { key: "m_member_absent_3days_enabled", label: "Absent 3 Days" },
      { key: "m_member_absent_5days_enabled", label: "Absent 5 Days" },
      { key: "m_member_absent_10days_enabled", label: "Absent 10 Days" },
      { key: "m_weekly_attendance_enabled", label: "Weekly Attendance" },
    ],
  },
  {
    title: "Other Notifications",
    notifications: [
      { key: "m_birthday_wish_enabled", label: "Birthday Wish" },
      { key: "m_lead_welcome_enabled", label: "Lead Welcome" },
      // { key: "m_member_welcome_enabled", label: "Member Welcome" },
      { key: "m_membership_assign_enabled", label: "Membership Assign" },
      { key: "m_booking_alert_enabled", label: "Booking Alert" },
    ],
  },
];

// Email notification groups
const emailNotificationGroups: NotificationGroup[] = [
  {
    title: "Membership Expiring",
    notifications: [
      { key: "m_expiring_today", label: "Today" },
      { key: "m_expiring_tomorrow", label: "Tomorrow" },
      { key: "m_expiring_2_days", label: "2 Days" },
      { key: "m_expiring_7_days", label: "7 Days" },
      { key: "m_expiring_15_days", label: "15 Days" },
    ],
  },
  {
    title: "Membership Expired ",
    notifications: [
      { key: "m_expired_yesterday", label: "Yesterday" },
      { key: "m_expired_2_days", label: "2 Days Ago" },
      { key: "m_expired_5_days", label: "5 Days Ago" },
      { key: "m_expired_10_days", label: "10 Days Ago" },
      { key: "m_expired_15_days", label: "15 Days Ago" },
      { key: "m_expired_30_days", label: "30 Days Ago" },
    ],
  },
  {
    title: "Payment ",
    notifications: [
      { key: "m_today_due_payment_reminder", label: "Payment Due Today" },
      { key: "m_tomorrow_due_payment_reminder", label: "Payment Due Tomorrow" },
      {
        key: "m_yesterday_due_payment_reminder",
        label: "Payment Due Yesterday",
      },
      // { key: "m_payment_received_confirmation", label: "Payment Received" },
    ],
  },
  {
    title: "Others",
    notifications: [{ key: "m_member_birthday_wish", label: "Birthday Wish" }],
  },
];

// Owner Email notification groups
const emailOwnerGroups: NotificationGroup[] = [
  {
    title: "Business ",
    notifications: [
      { key: "o_daily_business_summary", label: "Daily Business Summary" },
    ],
  },
  {
    title: "Member Status",
    notifications: [
      { key: "o_member_expiring_today", label: "Members Expiring Today" },
      { key: "o_member_expiring_tomarrow", label: "Members Expiring Tomorrow" },
      { key: "o_member_dues_today", label: "Member Dues Today" },
      { key: "o_member_dues_tomarrow", label: "Member Dues Tomorrow" },
      { key: "o_member_dues_yesterday", label: "Member Dues Yesterday" },
      {
        key: "o_payment_received_confirmation_owner",
        label: "Payment Received Confirmation",
      },
    ],
  },
];

const whatsappOwnerGroups: NotificationGroup[] = [
  {
    title: "Business",
    notifications: [
      { key: "o_daily_business_summary", label: "Daily Business Summary" },
      { key: "o_daily_task", label: "Daily Tasks" },
    ],
  },
  {
    title: "Member Status",
    notifications: [
      { key: "o_membership_expiry_reminder", label: "Member Expiry Reminders" },
      {
        key: "o_payment_received_reminder",
        label: "Payment Received Notifications",
      },
    ],
  },
  {
    title: "Others",
    notifications: [{ key: "o_booking_alert", label: "Booking Alert" }],
  },
];

const WAImages = [
  {
    image: "birthday_wish.png",
    labels: ["m_birthday_wish_enabled"],
  },
  {
    image: "due_payment_advanced.png",
    labels: [
      "m_payment_due_today_enabled",
      "m_payment_due_tomorrow_enabled",
      "m_payment_due_yesterday_enabled",
    ],
  },
  {
    image: "lead_welcome.png",
    labels: ["m_lead_welcome_enabled"],
  },
  {
    image: "member_absent.png",
    labels: [
      "m_member_absent_3days_enabled",
      "m_member_absent_5days_enabled",
      "m_member_absent_10days_enabled",
    ],
  },
  {
    image: "membership_assigned.png",
    labels: ["m_membership_assign_enabled"],
  },
  {
    image: "membership_expired.png",
    labels: [
      "m_membership_expired_yesterday_enabled",
      "m_membership_expired_2days_enabled",
      "m_membership_expired_5days_enabled",
      "m_membership_expired_10days_enabled",
      "m_membership_expired_15days_enabled",
      "m_membership_expired_30days_enabled",
    ],
  },
  {
    image: "membership_expiring.png",
    labels: [
      "m_membership_expiring_today_enabled",
      "m_membership_expiring_tomorrow_enabled",
      "m_membership_expiring_2days_enabled",
      "m_membership_expiring_7days_enabled",
      "m_membership_expiring_15days_enabled",
    ],
  },
  {
    image: "owner_business_summary.png",
    labels: ["o_daily_business_summary"],
  },
  {
    image: "owner_daily_task.png",
    labels: ["o_daily_task"],
  },
  {
    image: "owner_expiry_alert.png",
    labels: ["o_membership_expiry_reminder"],
  },
  {
    image: "owner_payment_received.png",
    labels: ["o_payment_received_reminder"],
  },
  {
    image: "weekly_attendance_record.png",
    labels: ["m_weekly_attendance_enabled"],
  },
];

export default function ReminderSelect({
  type,
  setInfo,
  refresh,
  setRefresh,
  auth,
  access,
}: {
  type: "email" | "whatsapp";
  setInfo: Dispatch<any>;
  refresh?: boolean;
  setRefresh?: Dispatch<SetStateAction<boolean>>;
  access: boolean;
  auth: boolean;
}) {
  const [memberNotifications, setMemberNotifications] = useState<
    Notification[]
  >([]);
  const [ownerNotifications, setOwnerNotifications] = useState<Notification[]>(
    []
  );
  const [modifiedData, setModifiedData] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"member" | "owner">("member");
  const [onHover, setOnHover] = useState(false);
  const [currentKey, setCurrentKey] = useState("");

  const transformApiResponse = (
    data: NotificationResponse,
    mappings: Array<{ key: string; label: string }>
  ): Notification[] => {
    return mappings.map((mapping) => ({
      label: mapping.label,
      status: data[mapping.key] || false,
      key: mapping.key,
    }));
  };

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();

      const endpoint =
        type === "whatsapp"
          ? `/api/whatsapp-message-preferences/?gym_id=${gymId}`
          : `/email-preference/?gym_id=${gymId}`;

      const response = await AxiosPrivate.get(endpoint, {
        id: newID(`${type}-preferences`),
      });

      // Get all notification keys from groups
      const getAllNotificationKeys = (groups: NotificationGroup[]) =>
        groups.flatMap((group) => group.notifications);

      const memberMappings =
        type === "whatsapp"
          ? getAllNotificationKeys(whatsappNotificationGroups)
          : getAllNotificationKeys(emailNotificationGroups);

      const ownerMappings =
        type === "whatsapp"
          ? getAllNotificationKeys(whatsappOwnerGroups)
          : getAllNotificationKeys(emailOwnerGroups);

      const memberData = transformApiResponse(response.data, memberMappings);
      const ownerData = transformApiResponse(response.data, ownerMappings);
      if (type === "whatsapp") {
        setInfo(response.data.credit);
        console.log(response.data.credit);
      }
      setMemberNotifications(memberData);
      setOwnerNotifications(ownerData);
      setModifiedData({});
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast.error(
        "Something went wrong while loading notification preferences"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [type]);

  useEffect(() => {
    if (refresh && refresh === true && setRefresh && type === "whatsapp") {
      fetchPreferences();
      setRefresh(false);
    }
  }, [refresh]);

  const handleToggle = (notificationType: "member" | "owner", key: string) => {
    const notifications =
      notificationType === "member" ? memberNotifications : ownerNotifications;
    const updateFunction =
      notificationType === "member"
        ? setMemberNotifications
        : setOwnerNotifications;

    const currentItem = notifications.find((item) => item.key === key);
    if (!currentItem) return;

    const newStatus = !currentItem.status;

    updateFunction((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, status: newStatus } : item
      )
    );

    setModifiedData((prev) => ({
      ...prev,
      [key]: newStatus,
    }));
  };

  const savePreferences = async () => {
    if (Object.keys(modifiedData).length === 0) return;

    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();

      const endpoint =
        type === "whatsapp"
          ? `/api/whatsapp-message-preferences/?gym_id=${gymId}`
          : `/email-preference/?gym_id=${gymId}`;

      await AxiosPrivate.patch(endpoint, modifiedData).then(() => {
        invalidateAll();
      });

      toast.success("Preferences updated successfully");
      setModifiedData({});
      await fetchPreferences();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Something went wrong while saving preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const renderNotificationGroups = (
    notifications: Notification[],
    groups: NotificationGroup[],
    notificationType: "member" | "owner"
  ) => {
    if (isLoading) {
      return (
        <div className="min-w-full p-4 mx-10 sm:mx-20 md:mx-32 lg:mx-40">
          <Loader variant="spinner" />
        </div>
      );
    }
    if (notifications.length === 0) {
      return (
        <div className="min-w-full p-4 mx-10 sm:mx-20 md:mx-32 lg:mx-40">
          <Empty text="No notification options available" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 w-full">
        <div className="space-y-6 md:min-w-96 min-h-[550px] ">
          {groups.map((group) => (
            <div key={group.title} className="bg-gray-50 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="max-sm:text-base md:text-lg font-semibold">{group.title}</h3>
              </div>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 sm:pl-8`}
              >
                {group.notifications.map((notification) => {
                  const notificationData = notifications.find(
                    (n) => n.key === notification.key
                  );
                  if (!notificationData) return null;

                  return (
                    <div
                      key={notification.key}
                      className={`flex items-center justify-between rounded-md transition-colors
                        ${notificationData.status ? "text-primary" : "hover:text-primary/80"}
                      `}
                    >
                      <div className="flex items-center space-x-3 sm:min-w-72 w-72 max-w-96 max-sm:max-w-60">
                        <Checkbox
                          checked={notificationData.status}
                          onChange={() => {
                            if (!auth && !access) {
                              toast.error("You aren't allowed to make changes");
                              return;
                            }
                            handleToggle(notificationType, notification.key);
                          }}
                        />
                        <Text
                          className="cursor-pointer select-none"
                          onClick={() => {
                            if (!auth && !access) {
                              toast.error("You aren't allowed to make changes");
                              return;
                            }
                            handleToggle(notificationType, notification.key);
                          }}
                          onMouseEnter={() => {
                            setOnHover(true);
                            setCurrentKey(notification.key);
                          }}
                          onMouseLeave={() => {
                            setOnHover(false);
                            setCurrentKey("");
                          }}
                        >
                          {notification.label}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {WAImages.map((image) => {
          if (image.labels.includes(currentKey)) {
            return (
              <Image
                key={image.image}
                src={`https://images.gymforce.in/templates/${image.image}`}
                width={300}
                height={500}
                alt={image.image}
                className={`${
                  onHover ? "sticky top-10 pt-10 max-md:hidden" : "hidden"
                } transition-opacity duration-200 ease-in-out`}
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto sm:p-4">
      <Tab vertical>
        <Tab.List className="space-y-2 sm:mx-2">
          <Tab.ListItem>
            <Text className="font-semibold">Members</Text>
          </Tab.ListItem>
          {/* {type === "email" &&
           ( */}
          <Tab.ListItem onClick={() => setActiveTab("owner")}>
            <Text className="font-semibold">Owner</Text>
          </Tab.ListItem>
          {/* )} */}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            {renderNotificationGroups(
              memberNotifications,
              type === "whatsapp"
                ? whatsappNotificationGroups
                : emailNotificationGroups,
              "member"
            )}
          </Tab.Panel>
          <Tab.Panel>
            {renderNotificationGroups(
              ownerNotifications,
              type === "whatsapp" ? whatsappOwnerGroups : emailOwnerGroups, // This line needs to change
              "owner"
            )}
          </Tab.Panel>
          {/* )} */}
        </Tab.Panels>
      </Tab>

      {Object.keys(modifiedData).length > 0 && (
        <div className={`w-full flex justify-center items-center mt-6}`}>
          <Button
            onClick={savePreferences}
            disabled={isLoading}
            className="px-6 py-2"
          >
            {isLoading ? <Loader variant="threeDot" /> : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
