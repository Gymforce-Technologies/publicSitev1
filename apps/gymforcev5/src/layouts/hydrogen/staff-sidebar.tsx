"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Text, Title } from "rizzui";
// import cn from "@utils/class-names";
import Image from "next/image";
// import { useTranslation } from "@/app/i18n/client";
import LogoMain from "@/../public/svg/icon/gymforce-icon-black.svg";
import LogoMainText from "@/../public/svg/gymforce-text/gymforce-text-black.svg";
import LogoMainDark from "@/../public/svg/icon/gymforce-icon-white.svg";
import LogoMainTextDark from "@/../public/svg/gymforce-text/gymforce-text-white.svg";
import { useTheme } from "next-themes";
import {
  // PiUserCircle,
  PiFileText,
  PiCalendarCheck,
} from "react-icons/pi";
import {
  FaChalkboardTeacher,
  FaMoneyBillAlt,
  FaUserCircle,
} from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { useTranslations } from "next-intl";
import cn from "@core/utils/class-names";
import AvatarCard from "@core/ui/avatar-card";
import { FaUserClock, FaUsers, FaUsersViewfinder } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import DanceForceText from "@/../public/svg/gymforce-text/DanceForce.svg";
import LibraryForceText from "@/../public/svg/gymforce-text/LibraryForce.svg";

export default function StaffProfileSidebar({
  className,
  lang,
  memberId,
  link,
}: {
  className?: string;
  lang?: string;
  memberId: string;
  link: string;
}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  // const { t } = useTranslation(lang!, "nav");
  const t = useTranslations("nav");
  const [staff, setStaff] = useState<any>(null);
  const newId = memberId.split("-")[1];
  const [isStaf, setIsStaff] = useState(false);
  const [staffType, setStaffType] = useState("");
  const [centerType, setCenterType] = useState(1);

  const getmember = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/staff/${newId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-${newId}`),
        }
      );
      console.log(resp.data);
      setStaff(resp.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkStaff = async () => {
      const resp = sessionStorage.getItem("isStaff");
      // console.log("isSTaff", resp);
      if (resp) {
        setIsStaff(resp === "true");
        const type = sessionStorage.getItem("staffType");
        setStaffType(type?.replace(/"/g, "").toLowerCase() || "");
        // console.log("StaffType", type?.replace(/"/g, "").toLowerCase());
      }
    };
    checkStaff();
  }, []);

  const profileMenuItems = [
    {
      name: "Profile",
      href: `/staff-section/staff-profile/${memberId}`,
      icon: <FaUserCircle />,
      level: ["admin", "manager"],
    },
    {
      name: "Attachments",
      href: `/staff-section/staff-profile/${memberId}/attachments`,
      icon: <PiFileText />,
      level: ["admin", "manager"],
    },
    {
      name: "Attendance",
      href: `/staff-section/staff-profile/${memberId}/attendance`,
      icon: <PiCalendarCheck />,
      level: ["admin", "manager"],
    },
    {
      name: "Activity",
      href: `/staff-section/staff-profile/${memberId}/activity`,
      icon: <FaUserClock size={20} />,
      level: ["admin", "manager"],
    },
    {
      name: "Clients",
      href: `/staff-section/staff-profile/${memberId}/clients`,
      icon: <FaUsers size={20} />,
      level: ["admin", "manager", "trainer", "receptionist"],
    },
    {
      name: "Earnings",
      href: `/staff-section/staff-profile/${memberId}/earnings`,
      icon: <FaMoneyBillAlt size={20} />,
      level: ["admin", "manager", "trainer", "receptionist"],
    },
    {
      name: "Sessions",
      href: `/staff-section/staff-profile/${memberId}/sessions`,
      icon: <FaChalkboardTeacher size={20} />,
      level: ["admin", "manager", "trainer", "receptionist"],
    },
    {
      name: "FollowUps",
      href: `/staff-section/staff-profile/${memberId}/followups`,
      icon: <FaUsersViewfinder size={20} />,
      level: ["admin", "manager", "trainer", "receptionist"],
    },
    {
      name: "Password",
      href: `/staff-section/staff-profile/${memberId}/password`,
      icon: <RiLockPasswordFill />,
      level: ["admin", "manager", "trainer", "receptionist"],
    },
  ];

  const renderMenuItems = useCallback(
    (items: any) => {
      return items.map((item: any) => {
        // console.log(item.href + "+" + pathname);
        const isActive: boolean = pathname.endsWith(item.href);
        if (
          isStaf &&
          staffType &&
          !item.level.includes(staffType) &&
          !item.typeLevel.includes(centerType)
        ) {
          // console.log(staffType, "Not found in", item.name);
          return null;
        }
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              `group relative mx-5 my-0.5 flex items-center rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-8 2xl:my-2`,
              isActive
                ? "text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5 bg-primary-dark/10 "
                : "text-gray-700  transition-colors duration-200 hover:bg-primary/10 hover:text-primary  dark:hover:text-primary-lighter"
            )}
          >
            <span
              className={cn(
                "me-2 inline-flex h-6 w-6 items-center justify-center rounded-md [&>svg]:h-[24px] [&>svg]:w-[24px]",
                isActive
                  ? "text-primary"
                  : "text-gray-700  group-hover:text-primary"
              )}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.name}</span>
          </Link>
        );
      });
    },
    [isStaf, staffType, pathname, centerType]
  );

  useEffect(() => {
    getmember();
  }, []);

  return (
    <aside
      className={cn(
        "fixed bottom-0 start-0 z-50 flex flex-col h-full overflow-y-scroll custom-scrollbar w-[270px] border-e-2  2xl:w-72",
        className
      )}
    >
      <div className="flex-shrink-0 sticky top-0 z-50 backdrop-blur-3xl">
        <div className="px-6 pt-5 2xl:px-8 2xl:pt-6 pb-2">
          <Link href={"/dashboard"} aria-label="GymForce">
            <Title>
              {theme !== "dark" ? (
                <div className="flex flex-nowrap items-center">
                  <Image src={LogoMain} alt="Gymforce" className="size-8" />
                  <Image
                    src={
                      centerType === 1
                        ? LogoMainText
                        : centerType === 2
                          ? LibraryForceText
                          : DanceForceText
                    }
                    alt="Gymforce"
                    className="dark:invert"
                    width={200}
                    height={40}
                  />
                </div>
              ) : (
                <div className="flex flex-nowrap items-center">
                  <Image src={LogoMainDark} alt="Gymforce" className="size-8" />
                  <Image
                    src={
                      centerType === 1
                        ? LogoMainText
                        : centerType === 2
                          ? LibraryForceText
                          : DanceForceText
                    }
                    alt="Gymforce"
                    className="dark:text-white dark:invert"
                    width={200}
                    height={40}
                  />
                </div>
              )}
            </Title>
          </Link>
        </div>
        <Link
          href={link}
          className={cn(
            `group relative mx-5 my-0.5 flex items-center rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-8 2xl:my-2`,
            "text-gray-700  transition-colors duration-200 hover:bg-primary/10 hover:text-primary "
          )}
        >
          <span
            className={cn(
              "me-2 inline-flex h-6 w-6 items-center justify-center rounded-md [&>svg]:h-[24px] [&>svg]:w-[24px]",
              "text-gray-700  group-hover:text-primary"
            )}
          >
            <IoArrowBackOutline />
          </span>
          <span className="truncate">{"Back"}</span>
        </Link>
        <div className=" ml-10">
          <AvatarCard
            src={staff?.staff_image || ""}
            name={staff?.name || ""}
            className=" ![&_figcaption_p]:truncate"
            description={staff?.phone}
          />
        </div>
      </div>
      <div className="mt-4 pb-3 flex-grow">
        {renderMenuItems(profileMenuItems)}
      </div>
    </aside>
  );
}
