"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Avatar, Text, Title } from "rizzui";
import {
  // PiUserCircle,
  PiFileText,
  PiCalendarCheck,
  PiCreditCard,
  PiBowlFoodFill,
  // PiReceiptBold,
  // PiUsersDuotone,
  // PiBowlFoodFill,
} from "react-icons/pi";
import { FaUserCircle } from "react-icons/fa";
import { IoArrowBackOutline, IoBody } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
// import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  AxiosPublic,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { useTranslations } from "next-intl";
import cn from "@core/utils/class-names";
// import AvatarCard from "@core/ui/avatar-card";
// import { FaCoins, FaFingerprint, FaUserPlus } from "react-icons/fa6";
import { TbGymnastics } from "react-icons/tb";
// import { MdClass } from "react-icons/md";
import toast from "react-hot-toast";
import { MdFeedback } from "react-icons/md";
// import { getMemberToken } from "@/app/[locale]/gym/[code]/Member";

export default function MemberSidebar({
  className,
  lang,
  //   memberId,
  //   link,
}: {
  className?: string;
  lang?: string;
  //   memberId: string;
  //   link: string;
}) {
  const pathname = usePathname();
  // const { theme } = useTheme();
  // const { t } = useTranslation(lang!, "nav");
  const t = useTranslations("nav");
  // const [member, setMember] = useState<any>(null);
  const { code } = useParams();
  const [initialData, setInitialData] = useState<any>(null);

  const getmember = async () => {
    try {
      const getToken = localStorage.getItem("member_token");
      const resp = await AxiosPublic.get(
        `https://apiv2.gymforce.in/center/basic-details/?auth=${getToken}`,
        {
          id: `Member-Details-${getToken}`,
        }
      );
      console.log(resp.data);
      // setMember(resp.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const resp = await AxiosPublic.get(
          `https://apiv2.gymforce.in/center/initial/${code}/`,
          {
            id: `Gym-${code}`,
          }
        );
        setInitialData(resp.data);
        // setGymId(resp.data.id);
        // setLoading(false);
      } catch (error) {
        console.error("Error fetching gym data:", error);
        // setLoading(false);
        toast.error("Failed to load gym data");
      }
    };
    getInitialData();
  }, []);

  const profileMenuItems = [
    {
      name: "Profile",
      href: `/gym/${code}/member`,
      icon: <FaUserCircle />,
      //   level: ["admin", "manager", "trainer", "receptionist"],
    },
    {
      name: "Attendance",
      href: `/gym/${code}/member/attendance`,
      icon: <PiCalendarCheck />,
      //   level: ["admin", "manager", "trainer"],
    },
    {
      name: "Memberships",
      href: `/gym/${code}/member/memberships`,
      icon: <PiCreditCard />,
      //   level: ["admin", "manager", "receptionist"],
    },

    {
      name: "Diet Plan",
      href: `/gym/${code}/member/diet`,
      icon: <PiBowlFoodFill />,
      //   level: ["admin", "manager", "trainer"],
    },
    {
      name: "Workout Plan",
      href: `/gym/${code}/member/workout`,
      icon: <TbGymnastics />,
      level: ["admin", "manager", "trainer"],
    },
    {
      name: "Feedback",
      href: `/gym/${code}/member/feedback`,
      icon: <MdFeedback />,
      //   level: ["admin", "manager", "trainer"],
    },
  ];

  const renderMenuItems = useCallback(
    (items: any) => {
      return items.map((item: any) => {
        // console.log(item.href + "+" + pathname);
        const isActive: boolean = pathname.endsWith(item.href);
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
    [pathname]
  );

  // useEffect(() => {
  //   getMemberToken();
  //   getmember();
  // }, []);

  return (
    <aside
      className={cn(
        "fixed bottom-0 start-0 z-50 flex flex-col h-full overflow-y-scroll custom-scrollbar w-[270px] border-e-2  2xl:w-72",
        className
      )}
    >
      <div className="flex-shrink-0 sticky top-0 z-50 backdrop-blur-3xl">
        <div className="hidden lg:block px-6 pt-5 2xl:px-8 2xl:pt-6 pb-2">
          <Link href={`/gym/${code}`} aria-label="GymForce">
            <div className="flex items-center gap-4">
              <Avatar
                src={initialData?.gym_image || ""}
                name="Gym Logo"
                size="xl"
                className="max-sm:text-lg"
              />
              <Title as="h6">{initialData?.name || "GymForce Gym"}</Title>
            </div>
          </Link>
        </div>
        <Link
          href={`/gym/${code}`}
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
        {/* <div className=" ml-10">
          <AvatarCard
            src={member?.member_image || ""}
            name={member?.name || ""}
            className=" ![&_figcaption_p]:truncate"
            description={member?.phone}
          />
        </div> */}
      </div>
      <div className="mt-4 pb-3 flex-grow">
        {renderMenuItems(profileMenuItems)}
      </div>
    </aside>
  );
}
