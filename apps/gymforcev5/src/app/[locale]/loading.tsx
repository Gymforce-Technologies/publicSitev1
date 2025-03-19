'use client'
import Image from "next/image";
import { Loader } from "rizzui";
import LogoMain from "@/../public/svg/icon/gymforce-icon-black.svg";
import LogoMainText from "@/../public/svg/gymforce-text/gymforce-text-black.svg";
import LogoMainDark from "@/../public/svg/icon/gymforce-icon-white.svg";
import LogoMainTextDark from "@/../public/svg/gymforce-text/gymforce-text-white.svg";
import { useTheme } from "next-themes";

export default function Loading() {
  const { theme } = useTheme();
  return (
    <section className="min-w-full min-h-[100vh] flex flex-col gap-5 items-center justify-center animate-pluse">
      {theme !== "dark" ? (
        <div className="flex flex-nowrap items-center">
          <Image src={LogoMain} alt="Gymforce" className="size-8" />
          <Image
            src={LogoMainText}
            alt="Gymforce"
            className=" dark:invert"
            width={200}
            height={40}
          />
        </div>
      ) : (
        <div className="flex flex-nowrap items-center">
          <Image src={LogoMainDark} alt="Gymforce" className="size-8" />
          <Image
            src={LogoMainTextDark}
            alt="Gymforce"
            className=" dark:invert"
            width={200}
            height={40}
          />
        </div>
      )}
      <Loader variant="pulse" color="current" />
    </section>
  );
}
