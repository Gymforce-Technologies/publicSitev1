"use client";

import Link from "next/link";
import HamburgerButton from "@/layouts/hamburger-button";
import logoImg from "@public/svg/icon/gymforce-icon-black.svg";
import Sidebar from "@/layouts/hydrogen/sidebar";
// import Logo from "@components/logo";
// import HeaderMenuRight from "@/layouts/header-menu-right";
import StickyHeader from "@/layouts/sticky-header";
// import { useTranslation } from "@/app/i18n/client";
import SearchWidget from "@/app/shared/search/search";
import Image from "next/image";
import ProfileSidebar from "./profile-sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import HeaderMenuRight from "../header-menu-right";
import StaffProfileSidebar from "./staff-sidebar";

export default function Header({
  lang,
  memberId,
}: {
  lang?: string;
  memberId?: string;
}) {
  // const { t } = useTranslation(lang!, "common");
  const pathname = usePathname();
  const t = useTranslations("common");
  const [previousPath, setPreviousPath] = useState("/dashboard");
  const isProfileSection = pathname.includes("member_profile");
  const isStaffSection = pathname.includes(`staff-profile`);
  useEffect(() => {
    if (!isProfileSection && !isStaffSection) {
      setPreviousPath(pathname);
    }
  }, [pathname, lang]);
  return (
    <StickyHeader className="z-[990] 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton
          //@ts-ignore
          view={
            isProfileSection && memberId ? (
              <ProfileSidebar
                memberId={memberId as string}
                lang={lang}
                link={previousPath}
                className="static w-full h-full overflow-y-auto bg-inherit"
              />
            ) : isStaffSection && memberId ? (
              <StaffProfileSidebar
                memberId={memberId as string}
                lang={lang}
                link={previousPath}
                className="static w-full h-full overflow-y-auto bg-inherit"
              />
            ) : (
              <Sidebar
                className="static w-full h-full overflow-y-auto bg-inherit"
                // lang={lang}
              />
            )
          }
        />
        <Link
          href={"/dashboard"}
          aria-label="Site Logo"
          className="me-4 w-9 shrink-0 lg:me-5 xl:hidden"
        >
          <Image src={logoImg} alt="Gymforce" className="size-6" />
        </Link>
        <SearchWidget />
      </div>
      <HeaderMenuRight />
    </StickyHeader>
  );
}
