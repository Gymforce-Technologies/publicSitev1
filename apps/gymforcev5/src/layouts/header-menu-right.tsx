"use client";
import { Badge, ActionIcon, Announcement, Button, Tooltip } from "rizzui";
import MessagesDropdown from "@/layouts/messages-dropdown";
import ProfileMenu from "@/layouts/profile-menu";
import SettingsButton from "@/layouts/settings-button";
import RingBellSolidIcon from "@core/components/icons/ring-bell-solid";
import { useCallback, useEffect, useState } from "react";
// import {
//   UserSubscriptionInfo,
//   getUserStatus,
//   // isUserOnTrial,
//   isUserSubscribed,
//   retrieveUserSubscriptionInfo,
// } from "@/app/[locale]/auth/Trail";
import dayjs from "dayjs";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import FullscreenToggle from "@/components/FullScreenToggle";
// import NotificationDropdown from "./notification-dropdown";

import { TbInfoTriangleFilled } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { GymMonitorIcon } from "@/components/public-page/GymMonitorIcon";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
// import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import QuickDropdown from "./quick-action";
import { MdOfflineBolt } from "react-icons/md";
import NotificationDropdown from "./notification-dropdown";
export default function HeaderMenuRight({ locale }: { locale?: string }) {
  const router = useRouter();
  const t = useTranslations("common");
  const [userInfo, setUserInfo] = useState<null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // useEffect(() => {
  //   const getUserInfoData = async () => {
  //     const resp = await retrieveUserSubscriptionInfo();
  //     if (resp) {
  //       setUserInfo(resp);
  //     }
  //   };
  //   getUserInfoData();
  // }, []);
  useEffect(() => {
    const getProfile = async () => {
      const gymId = "1";
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });

      const iaAvailable =
        resp.data.associated_gyms.filter(
          (item: any) => item.gym_id === parseInt(gymId ?? "0")
        )[0]?.biometric_integration === "Available" || false;
      setIsAvailable(iaAvailable);
    };
    getProfile();
  }, []);
  const formatExpirationInfo = useCallback((info: any) => {
    const status: any = "jhebded";
    const today = dayjs();

    if (status === "Subscription") {
      const expirationDate = dayjs(info.subscription_end_date);
      const daysLeft = expirationDate.diff(today, "day");
      if (daysLeft <= 7) {
        return {
          badgeText: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
          highlightedText: `in your Subscription`,
          isAlmostExpired: true,
        };
      } else {
        return {
          badgeText: "Subscribed",
          highlightedText: `until ${expirationDate.format("MMM D, YYYY")}`,
          isAlmostExpired: false,
        };
      }
    } else if (status === "Trial") {
      const trialEndDate = dayjs(info.trial_end_date);
      const daysLeft = trialEndDate.diff(today, "day");

      return {
        badgeText: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
        highlightedText: `in your Trial ( ${trialEndDate.format("MMM D")})`,
        isAlmostExpired: daysLeft <= 2,
      };
    } else {
      return {
        badgeText: "Expired",
        highlightedText: "Your access has ended",
        isAlmostExpired: false,
      };
    }
  }, []);
  return (
    <div className="ms-auto flex shrink-0 items-center max-sm:justify-end gap-2 sm:gap-3 xl:gap-4 ">
      {userInfo && (
        <Announcement
          className={`max-md:hidden flex-wrap sm:text-lg bg-inherit ps-2 ${formatExpirationInfo(userInfo).badgeText === "Subscribed" ? "hidden" : ""}`}
          badgeText={formatExpirationInfo(userInfo).badgeText}
          highlightedTextClassName="text-sm max-sm:hidden"
          highlightedText={formatExpirationInfo(userInfo).highlightedText}
        ></Announcement>
      )}
      <div
        className={`grid  items-center gap-1.5 ${isAvailable ? "grid-cols-6 md:grid-cols-7" : "grid-cols-5 md:grid-cols-6"}`}
      >
        <NotificationDropdown>
          <ActionIcon
            aria-label="Notification"
            variant="text"
            className="relative h-[34px] w-[34px] shadow  backdrop-blur-md md:h-9 md:w-9"
          >
            <RingBellSolidIcon className="h-[18px] w-auto dark:text-primary dark:hover:text-primary-dark " />
            <Badge
              renderAsDot
              color="warning"
              enableOutlineRing
              className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
            />
          </ActionIcon>
        </NotificationDropdown>
        {isAvailable ? <GymMonitorIcon /> : null}
        <QuickDropdown>
          <ActionIcon
            aria-label="Messages"
            variant="text"
            className="relative h-[34px] w-[34px] shadow  backdrop-blur-md md:h-9 md:w-9"
          >
            <MdOfflineBolt className="h-[22px] w-auto  " />
            {/* <Badge
              renderAsDot
              color="success"
              enableOutlineRing
              className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
            /> */}
          </ActionIcon>
        </QuickDropdown>
        <MessagesDropdown>
          <ActionIcon
            aria-label="Messages"
            variant="text"
            className="relative h-[34px] w-[34px] shadow  backdrop-blur-md md:h-9 md:w-9"
          >
            <TbInfoTriangleFilled className="h-[20px] w-auto  " />
            <Badge
              renderAsDot
              color="success"
              enableOutlineRing
              className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
            />
          </ActionIcon>
        </MessagesDropdown>
        <FullscreenToggle />
        <SettingsButton t={t} />
        <ProfileMenu />
      </div>
    </div>
  );
}
