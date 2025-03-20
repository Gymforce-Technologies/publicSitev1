"use client";

import Link from "next/link";
import HamburgerButton from "@/layouts/hamburger-button";
import logoImg from "@public/svg/icon/gymforce-icon-black.svg";
// import Sidebar from "@/layouts/hydrogen/sidebar";
// import Logo from "@components/logo";
// import HeaderMenuRight from "@/layouts/header-menu-right";
import StickyHeader from "@/layouts/sticky-header";
// import { useTranslation } from "@/app/i18n/client";
// import SearchWidget from "@/app/shared/search/search";
import Image from "next/image";
// import ProfileSidebar from "./profile-sidebar";
import { useParams, usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
// import HeaderMenuRight from "../header-menu-right";
// import StaffProfileSidebar from "./staff-sidebar";
import MemberSidebar from "./public-member-sidebar";
import { useEffect, useState } from "react";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import { Avatar, Title } from "rizzui";

export default function PublicHeader({
  lang,
  memberId,
}: {
  lang?: string;
  memberId?: string;
}) {
  // const { t } = useTranslation(lang!, "common");
  const pathname = usePathname();
  const t = useTranslations("common");
  const { code } = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  useEffect(() => {
    const getInitialData = async () => {
      try {
        const resp = await AxiosPublic.get(
          `/center/initial/${code}/`,
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
        // toast.error("Failed to load gym data");
      }
    };

    getInitialData();
  }, []);
  return (
    <StickyHeader className="lg:hidden z-[990] 2xl:py-5 3xl:px-8 4xl:px-10 bg-primary">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton
          //@ts-ignore
          view={
            <MemberSidebar
              className="static w-full h-full overflow-y-auto bg-inherit"
              // memberId={memberId as string}
              // link={previousPath}
              // lang={lang}
            />
          }
          className="text-gray-50 hover:text-gray-100"
        />
        <div className="flex items-center gap-4 ">
          <Avatar
            src={initialData?.gym_image || ""}
            name="Gym Logo"
            size="xl"
            className="max-sm:text-lg"
          />
          <Title className="text-gray-100 text-xl sm:text-2xl md:text-3xl text-clip">
            {initialData?.name || "GymForce Gym"}
          </Title>
        </div>
      </div>
    </StickyHeader>
  );
}
