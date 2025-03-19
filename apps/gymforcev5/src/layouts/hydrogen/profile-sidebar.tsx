"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Button, Text, Title, Tooltip } from "rizzui";
// import cn from "@utils/class-names";
import Image from "next/image";
// import { useTranslation } from "@/app/i18n/client";
import LogoMain from "@/../public/svg/icon/gymforce-icon-black.svg";
import LogoMainText from "@/../public/svg/gymforce-text/gymforce-text-black.svg";
import LogoMainDark from "@/../public/svg/icon/gymforce-icon-white.svg";
import LogoMainTextDark from "@/../public/svg/gymforce-text/gymforce-text-white.svg";
import DanceForceText from "@/../public/svg/gymforce-text/DanceForce.svg";
import LibraryForceText from "@/../public/svg/gymforce-text/LibraryForce.svg";

import { useTheme } from "next-themes";
import {
  // PiUserCircle,
  PiFileText,
  PiCalendarCheck,
  PiCreditCard,
  PiReceiptBold,
  PiUsersDuotone,
  PiBowlFoodFill,
} from "react-icons/pi";
import { FaUserCircle } from "react-icons/fa";
import { IoArrowBackOutline, IoBody } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { useTranslations } from "next-intl";
import cn from "@core/utils/class-names";
import AvatarCard from "@core/ui/avatar-card";
import { FaCoins, FaFingerprint, FaUserPlus } from "react-icons/fa6";
import { TbGymnastics } from "react-icons/tb";
import { MdClass, MdShoppingCart } from "react-icons/md";

export default function ProfileSidebar({
  className,
  lang,
  memberId,
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
  const [member, setMember] = useState<any>(null);
  const newId = memberId.split("-")[1];
  const [isStaf, setIsStaff] = useState(false);
  const [staffType, setStaffType] = useState("");
  const [centerType, setCenterType] = useState(1);

  const getmember = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/member/${newId}/basic/?gym_id=${gymId}`,
        {
          id: newID(`member-profile-${newId}`),
        }
      );
      // console.log(resp.data);
      setMember(resp.data.data);
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
      href: `/member_profile/${memberId}`,
      icon: <FaUserCircle />,
      level: ["admin", "manager", "trainer", "receptionist"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Attachments",
      href: `/member_profile/${memberId}/attachments`,
      icon: <PiFileText />,
      level: ["admin", "manager", "receptionist"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Attendance",
      href: `/member_profile/${memberId}/attendance`,
      icon: <PiCalendarCheck />,
      level: ["admin", "manager", "trainer"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Memberships",
      href: `/member_profile/${memberId}/memberships`,
      icon: <PiCreditCard />,
      level: ["admin", "manager", "receptionist"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Transactions",
      href: `/member_profile/${memberId}/transactions`,
      icon: <PiReceiptBold />,
      level: ["admin", "manager", "receptionist"],
      typeLevel: [1, 2, 3],
    },

    {
      name: "Workout Plan",
      href: `/member_profile/${memberId}/workout`,
      icon: <TbGymnastics />,
      level: ["admin", "manager", "trainer"],
      typeLevel: [1],
    },
    {
      name: "Diet Plan",
      href: `/member_profile/${memberId}/diet`,
      icon: <PiBowlFoodFill />,
      level: ["admin", "manager", "trainer"],
      typeLevel: [1],
    },
    {
      name: "Biometric",
      href: `/member_profile/${memberId}/biometric`,
      icon: <FaFingerprint />,
      level: ["admin", "manager", "receptionist"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Follow Up",
      href: `/member_profile/${memberId}/followup`,
      icon: <FaUserPlus />,
      level: ["admin", "manager", "receptionist"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Orders",
      href: `/member_profile/${memberId}/orders`,
      icon: <MdShoppingCart />,
      level: ["admin", "manager", "receptionist"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Points",
      href: `/member_profile/${memberId}/points`,
      icon: <FaCoins />,
      level: ["admin", "manager", "receptionist"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Classes",
      href: `/member_profile/${memberId}/classes`,
      icon: <MdClass />,
      level: ["admin", "manager", "trainer"],
      typeLevel: [1, 2, 3],
    },
    {
      name: "Mesurements",
      href: `/member_profile/${memberId}/measurements`,
      icon: <IoBody />,
      level: ["admin", "manager", "trainer", "receptionist"],
      typeLevel: [1],
    },
  ];

  const renderMenuItems = useCallback(
    (items: any) => {
      return items.map((item: any) => {
        // console.log(item.href + "+" + pathname);
        const isActive: boolean = pathname.endsWith(item.href);
        if (item.typeLevel && !item.typeLevel.includes(centerType)) {
          return null;
        }
        if (isStaf && staffType && !item.level.includes(staffType)) {
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
  const fetchProfile = async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      setCenterType(parseInt(response.data?.center) + 1);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };
  useEffect(() => {
    fetchProfile();
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
          href={"/members"}
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
            src={member?.member_image || ""}
            name={member?.name || ""}
            className=" ![&_figcaption_p]:truncate"
            description={member?.phone}
          />
        </div>
      </div>
      <div className="w-full flex items-center justify-center">
        <Tooltip
          content={` Create a New Purchase Details for ${member?.name || ""}`}
          className="max-w-40"
          placement="bottom"
        >
          <Link href={`/inventory/orders/create?member=${memberId}`}>
            <Button size="sm" className="my-1.5">
              New Purchase
            </Button>
          </Link>
        </Tooltip>
      </div>
      <div className="mt-4 pb-3 flex-grow">
        {renderMenuItems(profileMenuItems)}
      </div>
    </aside>
  );
}
