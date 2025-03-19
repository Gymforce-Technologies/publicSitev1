"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Title, Collapse, Dropdown, Button, Avatar, Text, Badge } from "rizzui";
import cn from "@core/utils/class-names";
import { PiCaretRightFill } from "react-icons/pi";
// import SimpleBar from "@ui/simplebar";
import { menuItems } from "@/layouts/hydrogen/menu-items";
import Image from "next/image";
// import { useTranslation } from "@/app/i18n/client";
import LogoMain from "@/../public/svg/icon/gymforce-icon-black.svg";
import LogoMainText from "@/../public/svg/gymforce-text/gymforce-text-black.svg";
import LogoMainDark from "@/../public/svg/icon/gymforce-icon-white.svg";
import LogoMainTextDark from "@/../public/svg/gymforce-text/gymforce-text-white.svg";
import { LucideChevronsUpDown } from "lucide-react";
import { FaCheck } from "react-icons/fa6";
import toast from "react-hot-toast";
import { deleteDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { useTheme } from "next-themes";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId, setGymId } from "@/app/[locale]/auth/InfoCookies";
import { useLocale, useTranslations } from "next-intl";
import { getStaffType, isStaff } from "@/app/[locale]/auth/Staff";
import DanceForceText from "@/../public/svg/gymforce-text/DanceForce.svg";
import LibraryForceText from "@/../public/svg/gymforce-text/LibraryForce.svg";

export default function Sidebar({
  className,
  lang,
}: {
  className?: string;
  lang?: string;
}) {
  // const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const locale = useLocale();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  // const t = useTranslations("nav");
  const [centers, setCenters] = useState([]);
  const [currentGym, setCurrentGym] = useState<any | null>(null);
  const [isStaf, setIsStaf] = useState(false);
  const [staffType, setStaffType] = useState("");
  const [navItems, setNavItems] = useState(menuItems);
  const [centerType, setCenterType] = useState(1);
  const [permissions, setPermissions] = useState<any>({});
  const [userId, setUserId] = useState("");
  const fetchCenters = async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      setCenters(response.data?.associated_gyms);
      const curGym = response?.data?.associated_gyms.find(
        (gym: any) => gym.gym_id.toString() === gymId
      );
      setCenterType(parseInt(response.data?.center) + 1);
      setCurrentGym(curGym);
      setUserId(response.data?.user_id || "");
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  useEffect(() => {
    const checkStaff = async () => {
      const resp = await isStaff();
      setIsStaf(resp);
    };
    checkStaff();
  }, []);

  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      setPermissions(response.data.permissions || {});
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  useEffect(() => {
    if (isStaf && userId) {
      fetchPermissions();
    }
  }, [isStaf, userId]);

  useEffect(() => {
    const savedOpenDropdowns = sessionStorage.getItem("openDropdowns");
    if (savedOpenDropdowns) {
      setOpenDropdowns(JSON.parse(savedOpenDropdowns));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("openDropdowns", JSON.stringify(openDropdowns));
  }, [openDropdowns]);

  const handleToggleDropdown = (name: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  useEffect(() => {
    const checkStaff = async () => {
      const resp = sessionStorage.getItem("isStaff");
      // console.log("isSTaff", resp);
      if (resp) {
        setIsStaf(resp === "true");
        const type = sessionStorage.getItem("staffType");
        setStaffType(type?.replace(/"/g, "").toLowerCase() || "");
        // console.log("StaffType", type?.replace(/"/g, "").toLowerCase());
      }
    };
    checkStaff();
  }, []);

  const renderMenuItems = useCallback(
    (items: any, level = 0) => {
      return items.map((item: any, index: number) => {
        const url =
          item?.href === "/" ? `/${locale}` : `/${locale}${item?.href}`;
        const isActive = pathname === url;
        const isDropdownOpen = openDropdowns.includes(item.name);
        if (item.typeLevel && !item.typeLevel.includes(centerType)) {
          return null;
        }
        if (isStaf && item.permission) {
          const permissionName = item.permission.name;
          // const requiredAccess = item.permission.access;

          // If permission is "private", only show for specific staff
          if (permissionName === "private") {
            return null;
          }
          // Handle permissions for regular menu items
          else if (permissionName !== "public") {
            const userAccess = permissions[permissionName];

            // Skip rendering if user doesn't have required access
            if (userAccess === "no_access") {
              return null;
            }
            if (userAccess !== "all" && item.name?.includes("Add")) {
              console.log(item);
              return null;
            }
            console.log(item, userAccess);
          }
        }
        return (
          <Fragment key={item.name + "-" + level}>
            {item?.href ? (
              <>
                {item?.dropdownItems ? (
                  <Collapse
                    defaultOpen={isDropdownOpen}
                    header={({ open, toggle }) => (
                      <div
                        onClick={(e) => {
                          if ((!isDropdownOpen && level === 0) || level > 0) {
                            toggle();
                            handleToggleDropdown(item.name);
                          }
                        }}
                        className={cn(
                          `group relative mx-3 flex cursor-pointer items-center rounded-md px-3 py-2 font-medium lg:my-1 max-lg:ml-5 max-lg:scale-110 ${
                            item.drop && level ? "ml-7 2xl:ml-10" : "2xl:mx-5"
                          } 2xl:my-2`,
                          isActive || isDropdownOpen
                            ? "text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5 bg-primary-dark/10 "
                            : "text-gray-700  transition-colors duration-200 hover:bg-primary/10 hover:text-primary  "
                        )}
                      >
                        <span className="flex items-center relative">
                          <PiCaretRightFill
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle();
                              handleToggleDropdown(item.name);
                            }}
                            className={cn(
                              `mr-1 2xl:mr-2 h-4 w-4 rotate-0`,
                              open ? "text-primary" : "text-gray-700 ",
                              open && `rotate-90 rtl:rotate-0`
                            )}
                          />
                          <div
                            onClick={() => {
                              if (level === 0 && item.href) {
                                router.push(item.href);
                              }
                            }}
                            className="flex flex-row items-center"
                          >
                            {item?.icon && (
                              <span
                                className={cn(
                                  "me-2 ml-[-1] inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]",
                                  isActive || isDropdownOpen
                                    ? "text-primary "
                                    : "text-gray-700  group-hover:text-primary dark:group-hover:text-primary"
                                )}
                              >
                                {item?.icon}
                              </span>
                            )}
                            {/* {t(item.name)} */}
                            {item.name}
                          </div>
                          {/* {item?.new && item.new === true && (
                            <Badge
                              size="sm"
                              className="absolute left-[120%] animate-pulse scale-90"
                            >
                              New
                            </Badge>
                          )} */}
                        </span>
                      </div>
                    )}
                  >
                    {renderMenuItems(item?.dropdownItems, level + 1)}
                  </Collapse>
                ) : (
                  <Link
                    href={item?.href}
                    className={cn(
                      `group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 max-lg:ml-10 max-lg:scale-110 ${level > 1 ? "ml-14 2xl:ml-16" : " ml-8 2xl:mx-11"} 2xl:my-2`,
                      isActive
                        ? "text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5 bg-primary-dark/10 "
                        : "text-gray-700  transition-colors duration-200 hover:bg-primary/10 hover:text-primary  "
                    )}
                  >
                    <div className="flex items-center truncate">
                      {item?.icon ? (
                        <span
                          className={cn(
                            "me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]",
                            isActive
                              ? "text-primary "
                              : "text-gray-700  group-hover:text-primary"
                          )}
                        >
                          {item?.icon}
                        </span>
                      ) : (
                        <PiCaretRightFill
                          className={cn(
                            `${item.drop ? "" : "opacity-0"} me-2 inline-flex ml-1 h-3 w-3 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]`,
                            isActive
                              ? "text-primary"
                              : "text-gray-700  group-hover:text-primary "
                          )}
                        />
                      )}
                      <span className="truncate">
                        {/* {t(item.name)} */}
                        {item.name}
                      </span>
                    </div>
                    {/* {item?.new && item.new === true && (
                      <Badge
                        size="sm"
                        className="absolute top-1 left-[80%] animate-pulse scale-90"
                      >
                        New
                      </Badge>
                    )} */}
                  </Link>
                )}
              </>
            ) : (
              <Title
                as="h6"
                className={cn(
                  "mb-2 truncate px-6 text-xs font-normal text-primary  uppercase tracking-widest 2xl:px-8",
                  index !== 0 && "mt-6 3xl:mt-7"
                )}
              >
                {item.name}
              </Title>
            )}
          </Fragment>
        );
      });
    },
    [
      openDropdowns,
      pathname,
      router,
      navItems,
      isStaf,
      staffType,
      centerType,
      permissions,
    ]
  );

  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <aside
      className={cn(
        "fixed bottom-0 start-0 z-50 flex flex-col h-full overflow-y-scroll custom-scrollbar w-[270px] border-e-2  2xl:w-72",
        className
      )}
    >
      <div className="flex-shrink-0 sticky top-0 z-50 backdrop-blur-3xl">
        <div className=" px-6 pt-5 2xl:px-8 2xl:pt-6 pb-2 ">
          <Link href={"/dashboard"} aria-label="GymForce">
            <Title
              onClick={() => {
                console.log("Invalidating cache");
                invalidateAll();
              }}
            >
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
        <Dropdown className="min-w-[90%] w-[90%]" placement="bottom-end">
          <Dropdown.Trigger className="grid grid-cols-[20%,70%,10%] w-full gap-1 items-center mx-4 rounded-md p-2 hover:bg-gray-200  cursor-pointer">
            <Avatar
              src={currentGym?.logo || ""}
              name={currentGym?.name || ""}
              className=" ml-1 text-white/95"
            />
            <div className="flex flex-col font-semibold items-start justify-start">
              <Text className="truncate text-gray-900 hover:texpr ">
                {currentGym?.name}
              </Text>
              {currentGym?.is_primary && (
                <span className="text-xs">Primary</span>
              )}
            </div>
            <LucideChevronsUpDown size={20} className="" />
          </Dropdown.Trigger>
          <Dropdown.Menu className="z-[9999999999] min-w-[256px] text-sm p-2.5 ">
            {centers.map((item: any, index) => (
              <Dropdown.Item
                key={index}
                className={
                  (currentGym?.gym_id === item?.gym_id
                    ? ' bg-gray-300 hover:bg-gray-200 flex flex-row gap-2 items-center justify-between text-primary dark:text-primary-lighter" '
                    : " text-gray-900 ") + " py-2"
                }
                onClick={() => {
                  if (currentGym?.gym_id === item?.gym_id) {
                    return;
                  }
                  console.log(item);
                  invalidateAll();
                  setCurrentGym(item);
                  deleteDemographicInfo();
                  setGymId(item.gym_id.toString());
                  toast.success(`Gym Center ${item.name} has been Switched.`);
                  // router.refresh();
                  document.location.reload();
                  // window.location.reload();
                }}
              >
                <div className="grid grid-cols-[90%,10%] gap-1 items-center min-w-full group">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={item.name}
                      src={item?.logo || ""}
                      size="sm"
                      className="text-white/95"
                    />
                    <div className="flex flex-col items-start justify-start">
                      <Text
                        fontWeight="medium"
                        className="truncate group-hover:text-primary"
                      >
                        {item?.name}
                      </Text>
                      {item?.is_primary && (
                        <span className="text-xs">Primary</span>
                      )}
                    </div>
                  </div>
                  {currentGym?.gym_id === item?.gym_id && (
                    <FaCheck size={16} className="text-primary" />
                  )}
                </div>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {/* <SimpleBar className="flex-grow"> */}
      <div className="mt-2 pb-3 flex-grow">{renderMenuItems(menuItems)}</div>
      {/* </SimpleBar> */}
    </aside>
  );
}
