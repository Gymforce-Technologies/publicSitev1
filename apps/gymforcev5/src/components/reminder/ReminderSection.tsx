"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowRight,
  FaCalendar,
  FaCalendarCheck,
} from "react-icons/fa6";
import { IoMailOutline } from "react-icons/io5";
import { RiCopperCoinFill, RiWhatsappLine } from "react-icons/ri";
import { Button, Tab, Text, Tooltip } from "rizzui";
import MetricCard from "@core/components/cards/metric-card";
import ReminderSelect from "@/components/reminder/ReminderSelect";
import WidgetCard from "@core/components/cards/widget-card";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "../../app/[locale]/auth/AxiosPrivate";

import { BiSolidBellOff } from "react-icons/bi";
import toast from "react-hot-toast";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { isStaff } from "@/app/[locale]/auth/Staff";

interface UserInfo {
  remaining_credits: number;
  last_updated: string;
}

interface MetricItem {
  title: string;
  metric: number | string;
  icon: React.ReactNode;
  value: string;
}

export default function ReminderSection() {
  const [info, setInfo] = useState<UserInfo | null>(null);
  const router = useRouter();
  const [endDate, setEndDate] = useState("");
  const [refresh, setRefresh] = useState(false);
  const metricData: MetricItem[] = [
    {
      title: "Available Credits",
      metric: info?.remaining_credits || 0,
      icon: <RiCopperCoinFill size={24} />,
      value: "credits",
    },
    {
      title: "Validity",
      metric: endDate
        ? new Date(endDate?.split("T")[0]).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "-",
      icon: <FaCalendarCheck size={20} />,
      value: "totalCredits",
    },
    {
      title: "Last Purchase",
      metric: info
        ? new Date(info.last_updated.split("T")[0]).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )
        : "-",
      icon: <FaCalendar size={20} />,
      value: "lastPurchase",
    },
  ];
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const getEndDate = async () => {
    const resp = await AxiosPrivate.get("/api/profile/", {
      id: newID("user-profile"),
      cache: {
        ttl: 60 * 60 * 1000,
      },
    });
    console.log(resp.data);
    setEndDate(resp.data.subscription_end_date?.split("T")[0]);
  };

  useEffect(() => {
    getEndDate();
  }, []);

  const disableAll = async () => {
    const gymId = await retrieveGymId();
    try {
      const data = {
        // gym_id: parseInt(gymId ?? "0"),
        m_birthday_wish_enabled: false,
        m_lead_welcome_enabled: false,
        m_member_absent_3days_enabled: false,
        m_member_absent_5days_enabled: false,
        m_member_absent_10days_enabled: false,
        m_member_welcome_enabled: false,
        m_membership_assign_enabled: false,
        m_membership_expired_2days_enabled: false,
        m_membership_expired_5days_enabled: false,
        m_membership_expired_10days_enabled: false,
        m_membership_expired_15days_enabled: false,
        m_membership_expired_30days_enabled: false,
        m_membership_expired_yesterday_enabled: false,
        m_membership_expiring_2days_enabled: false,
        m_membership_expiring_7days_enabled: false,
        m_membership_expiring_15days_enabled: false,
        m_membership_expiring_today_enabled: false,
        m_membership_expiring_tomorrow_enabled: false,
        m_payment_due_today_enabled: false,
        m_payment_due_tomorrow_enabled: false,
        m_payment_due_yesterday_enabled: false,
        m_payment_received_enabled: false,
        m_weekly_attendance_enabled: false,
        o_daily_business_summary: false,
        o_daily_task: false,
        o_membership_expiry_reminder: false,
        o_payment_received_reminder: false,
      };

      const response = await AxiosPrivate.put(
        `/api/whatsapp-message-preferences/?gym_id=${gymId}`,
        data
      );

      if (response.status === 200) {
        toast.success("All WhatsApp Notifications disabled successfully");
        invalidateAll();
        setRefresh(true);
      }
    } catch {
      toast.error("Something went wrong while disabling notifications");
      // console.error('Error disabling notifications:');
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const resp = await isStaff();
        if (resp) {
          setAuth(!resp);
          await fetchPermissions();
        }
      } catch (error) {
        console.error("Error getting staff status:", error);
      }
    };
    getStatus();
  }, []);
  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["mainConfigManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };
  const getInfo = async () => {
    const gymId = await retrieveGymId();
    try {
      const response = await AxiosPrivate.get(`/api/profile/`, {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      // console.log(response.data);
      const Info = response.data.associated_gyms.find(
        (gym: any) => gym.gym_id === parseInt(gymId ?? "0")
      );
      setUserInfo({
        email: Info.email || "N/A",
        whatsapp_number: Info.whatsapp_number || "N/A",
      });
    } catch {
      // console.error('Error fetching info:');
    }
  };

  useEffect(() => {
    getInfo();
  }, []);
  return (
    <section className="space-y-4">
      <div className="relative flex w-full items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>
        <div
          className="max-xl:flex items-center p-2 gap-4 xl:grid grid-cols-5 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
          ref={sliderEl}
        >
          {metricData.map((metric, index) => (
            <div key={index} className={"relative group pointer-events-none"}>
              <MetricCard
                title={metric.title}
                metric={metric.metric}
                className={`min-w-40 relative shadow  border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 hover:bg-primary-lighter peer-hover:bg-primary-lighter hover:scale-105 peer-hover:scale-105 cursor-pointer !p-2 md:!p-4`}
                iconClassName={`text-primary bg-primary-lighter duration-200 transition-all text-white bg-primary group-hover:text-white group-hover:bg-primary peer-hover:text-white peer-hover:bg-primary`}
                titleClassName={`text-nowrap max-lg:text-xs font-medium max-lg:max-w-[110px] truncate`}
                icon={metric.icon}
                metricClassName="text-primary !text-base  max-sm:!text-xs text-start pl-2 "
              />
            </div>
          ))}
        </div>
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>
      <WidgetCard
        title="Reminder Settings"
        titleClassName="leading-none "
        headerClassName="mb-3 lg:mb-4"
        className=" pl-4"
        description="Customize the way you need to send and receive Notifications."
        descriptionClassName=" my-1"
        action={
          <div className="hidden md:flex items-start gap-4">
            {userInfo !== null && (
              <Tooltip
                content="Mobile Number and Email Used for Notifications."
                animation="slideIn"
                placement="bottom"
                className="max-w-60"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    Phone: <Text>{userInfo.whatsapp_number}</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    Email: <Text>{userInfo.email}</Text>
                  </div>
                </div>
              </Tooltip>
            )}

            <Tooltip
              content="Disable All WhatsApp Reminders"
              animation="slideIn"
              placement="bottom"
            >
              <Button
                size="sm"
                className="flex gap-2 items-center"
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  disableAll();
                }}
              >
                <BiSolidBellOff size={18} />
                Mute
              </Button>
            </Tooltip>
            {info !== null && (
              <Button
                className="place-self-start"
                size="sm"
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't Authorized");
                    return;
                  }
                  router.push("/subscription/addons");
                }}
              >
                <Text>Buy Credits</Text>
                <FaArrowRight className="ml-2 size-3" />
              </Button>
            )}
          </div>
        }
      >
        <div className="flex md:hidden items-center gap-6 mb-2">
          {userInfo !== null && (
            <Tooltip
              content="Mobile Number and Email Used for Notifications."
              animation="slideIn"
              placement="bottom"
              className="max-w-60"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  Phone: <Text>{userInfo.whatsapp_number}</Text>
                </div>
                <div className="flex items-center gap-2">
                  Email: <Text>{userInfo.email}</Text>
                </div>
              </div>
            </Tooltip>
          )}

          <div className="flex flex-col gap-4">
            <Tooltip
              content="Disable All WhatsApp Reminders"
              animation="slideIn"
              placement="bottom"
            >
              <Button
                size="sm"
                className="flex gap-2 items-center"
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  disableAll();
                }}
              >
                <BiSolidBellOff size={18} />
                Mute
              </Button>
            </Tooltip>
            {info !== null && (
              <Button
                className="place-self-start"
                size="sm"
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't Authorized");
                    return;
                  }
                  router.push("/subscription/addons");
                }}
              >
                <Text>Buy Credits</Text>
                <FaArrowRight className="ml-2 size-3" />
              </Button>
            )}
          </div>
        </div>
        <Tab>
          <Tab.List>
            <Tab.ListItem>
              <RiWhatsappLine className="size-5" /> WhatsApp
            </Tab.ListItem>
            <Tab.ListItem>
              <IoMailOutline className="size-5" /> Email
            </Tab.ListItem>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <ReminderSelect
                type="whatsapp"
                setInfo={setInfo}
                refresh={refresh}
                setRefresh={setRefresh}
                auth={auth}
                access={access}
              />
            </Tab.Panel>
            <Tab.Panel>
              <ReminderSelect
                type="email"
                setInfo={setInfo}
                auth={auth}
                access={access}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab>
      </WidgetCard>
    </section>
  );
}
