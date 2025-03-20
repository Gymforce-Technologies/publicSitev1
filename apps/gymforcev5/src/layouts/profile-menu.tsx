"use client";

import { Title, Text, Avatar, Button, Popover, Dropdown, Badge } from "rizzui";
import cn from "@core/utils/class-names";
import { routes } from "@/config/routes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { clearAccessToken } from "@/app/[locale]/auth/Acces";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
// import {
//   clearRefreshToken,
//   getRefreshToken,
// } from "@/app/[locale]/auth/Refresh";
// import { deleteGymId } from "@/app/[locale]/auth/InfoCookies";
import { useTranslations } from "next-intl";
import { PiDownloadSimpleFill } from "react-icons/pi";
import { usePWAInstall } from "@/hooks/usePWA";
// import { LockButton } from "@/components/lock/LockButton";
import { useLock } from "@/hooks/useLock";

interface Profile {
  profile_image: String | null;
  last_name: String;
  email: string;
  first_name: string;
  is_staff_role: Boolean;
  associated_staff: any;
}
export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
  username = false,
  locale,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
  locale?: string;
}) {
  const [UserData, setUserData] = useState<Profile | null>();
  // const [is_staff_role, setIs_staff_role] = useState<boolean>(false);
  const FetchData = async () => {
    try {
      const response = await AxiosPrivate.get(`/api/profile/`, {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    FetchData();
  }, [invalidateAll]);
  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            "w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10",
            buttonClassName
          )}
        >
          <Avatar
            src={`${UserData?.profile_image ? UserData.profile_image : "https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp"}`}
            name={UserData?.first_name + " " + UserData?.last_name}
            className={cn("!h-9 w-9 sm:!h-10 sm:!w-10", avatarClassName)}
          />
          {!!username && (
            <span className="username hidden text-gray-200 md:inline-flex">
              Hi
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0">
        <DropdownMenu locale={locale ?? "en"} />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

const menuItems = [
  {
    name: "Profile Settings",
    href: routes.forms.profileSettings,
  },
  {
    name: "Support",
    href: "support/all-tickets",
  },
  {
    name: "What's New",
    href: "new-features",
  },
  {
    name: "My Website",
    href: "webanalysis",
  },
];

const staffMenuItems = [
  {
    name: "Profile Settings",
    href: "staff-section/staff-profile",
  },
];

function DropdownMenu({ locale }: { locale: string }) {
  const t = useTranslations("common");
  const [UserData, setUserData] = useState<Profile | null>();
  const router = useRouter();
  const { handleInstall } = usePWAInstall();
  const { lockApp } = useLock();
  async function logOut() {
    const refreshToken = "hwdwbws";

    try {
      const resp = await AxiosPrivate.post(
        `/api/logout/`,
        {},
        {
          headers: {
            "Refresh-Token": refreshToken,
          },
        }
      );
    } catch (error) {
      console.error("Logout Error");
    }
    localStorage.removeItem("appLock");
    // deleteGymId();
    // invalidateAll();
    // clearAccessToken();
    // await clearRefreshToken();
    sessionStorage.clear();
    localStorage.clear();
    router.push(routes.auth.signIn);
  }

  // Fetch User Data
  const FetchData = async () => {
    try {
      const response = await AxiosPrivate.get(`/api/profile/`, {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    FetchData();
  }, []);

  return (
    <div className="w-72 text-left rtl:text-right overflow-auto">
      {/* User Profile Header */}
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar
          src={`${UserData?.profile_image ? UserData.profile_image : "https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp"}`}
          name={UserData?.first_name + " " + UserData?.last_name}
          className={cn("!h-9 w-9 sm:!h-10 sm:!w-10")}
        />

        <div className="ms-3">
          <div className="flex gap-1 max-w-[200px] truncate">
            <Title as="h6" className="font-semibold">
              {UserData?.first_name}
            </Title>
            <Title as="h6" className="font-semibold">
              {UserData?.last_name}
            </Title>
          </div>
          <Text className="text-gray-700 max-w-[200px] truncate">
            {UserData?.email}
          </Text>
        </div>
      </div>
      {/* Menu Items */}
      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        {UserData?.is_staff_role
          ? staffMenuItems.map((item, index) => (
              <Link
                key={item.name}
                href={`/${locale}/${item.href}/st63-${UserData.associated_staff.find((staff: any) => UserData.email === staff.email).staff_id}-72fk`}
                className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none"
              >
                {item.name}
              </Link>
            ))
          : menuItems.map((item) => (
              <Link
                key={item.name}
                href={`/${locale}/${item.href}`}
                className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none relative"
              >
                {item.name}
                {item.href === "new-features" ||
                item.href === "webanalysis" ||
                item.href === "feedback" ? (
                  <Badge
                    size="sm"
                    className="absolute top-1 right-1/2 animate-pulse"
                  >
                    New
                  </Badge>
                ) : null}
              </Link>
            ))}

        <Button
          onClick={handleInstall}
          className="scale-95 flex items-center justify-center mt-1"
        >
          <PiDownloadSimpleFill size={20} stroke="1" className="mr-4" />
          Install App
        </Button>
      </div>
      {/* Logout Section */}
      {/* <div className="border-t border-gray-300 px-6 py-3"> */}
      {/* <LockButton onLock={lockApp} /> */}
      {/* </div> */}
      <div className="border-t border-gray-300 px-6 py-3 group cursor-pointer">
        <Button
          className="h-auto bg-none group-hover:text-red-400 w-full justify-start p-0 font-medium text-gray-700 outline-none focus-visible:ring-0"
          variant="text"
          onClick={() => logOut()}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
