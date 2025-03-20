"use client";

import { useCallback, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useTheme } from 'next-themes';
// import { useTranslation } from '@/app/i18n/client';
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";
import { Title, Text, Button } from "rizzui";
import { PiArrowLeftBold } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
// import { setAccessToken } from "@/app/[locale]/auth/Acces";
// import { setRefreshToken } from "@/app/[locale]/auth/Refresh";
// import { setGymId, deleteGymId } from "@/app/[locale]/auth/InfoCookies";
import OrSeparation from "./or-separation";

// Import your logo images
import logoImg from "@public/svg/icon/gymforce-icon-black.svg";
import logoImgText from "@public/svg/gymforce-text/gymforce-text-black.svg";
// import { setIsStaff } from "@/app/[locale]/auth/Staff";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_URL || "https://apiv2.gymforce.in";

interface User {
  name: string;
  email: string;
}

interface AuthWrapperOneProps {
  children: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  bannerTitle?: string;
  bannerDescription?: string;
  pageImage?: React.ReactNode;
  isSocialLoginActive?: boolean;
  isSignIn?: boolean;
  lang?: string;
}

export default function AuthWrapperOne({
  children,
  title,
  description,
  pageImage,
  isSocialLoginActive = false,
  lang,
}: AuthWrapperOneProps) {
  const t = useTranslations("auth");
  // const { theme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const googleLoginRef = useRef<HTMLDivElement>(null);

  // const handleGoogleSuccess = useCallback(
  //   async (credentialResponse: CredentialResponse) => {
  //     console.log("Login Success", credentialResponse);
  //     try {
  //       if (!credentialResponse.credential) {
  //         throw new Error("No credential received from Google");
  //       }
  //       const config = {
  //         method: "post",
  //         maxBodyLength: Infinity,
  //         url: `${API_URL}/auth-receiver`,
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //           // 'Cookie': 'sessionid=mwrrzr6p0h1ictyj2oa3m9e46ztajmyp'
  //         },
  //         data: {
  //           credential: credentialResponse.credential,
  //         },
  //         withCredentials: true,
  //       };

  //       const apiResponse = await axios(config);
  //       console.log(
  //         "Response from /auth-receiver:",
  //         JSON.stringify(apiResponse.data)
  //       );
  //       if (apiResponse.status === 200) {
  //         setAccessToken(apiResponse.data.token.access);
  //         await setRefreshToken(apiResponse.data.token.refresh);
  //         // console.log(apiResponse.data.user);
  //         setUser(apiResponse.data.user);
  //         const gymData = await AxiosPrivate.get("/api/profile", {
  //           id: newID(`user-profile`),
  //           cache: {
  //             ttl: 60 * 60 * 1000,
  //           },
  //         });
  //         setIsStaff(gymData.data.is_staff_role);
  //         console.log(gymData);
  //         toast.success("Google Signin successful");
  //         if (gymData?.data?.associated_gyms?.length) {
  //           const firstGym =
  //             gymData.data.associated_gyms.find(
  //               (gym: any) => gym.is_primary === true
  //             ) || gymData.data.associated_gyms[0];
  //           setGymId(firstGym.gym_id.toString());
  //           router.push("/dashboard");
  //         } else {
  //           deleteGymId();
  //           router.push("/gym-registration");
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error processing login:", error);
  //       toast.error(
  //         error instanceof Error ? error.message : "An unknown error occurred"
  //       );
  //       setError(
  //         error instanceof Error ? error.message : "An unknown error occurred"
  //       );
  //     }
  //   },
  //   [router]
  // );

  const handleCustomButtonClick = () => {
    if (googleLoginRef.current) {
      const googleLoginButton = googleLoginRef.current.querySelector(
        'div[role="button"]'
      ) as HTMLElement;
      if (googleLoginButton) {
        googleLoginButton.click();
      }
    }
  };

  return (
    <>
      <Link
        href={"/dashboard"}
        className="sticky start-0 top-0 bg-gray-200 z-20 flex items-center justify-center p-3.5 text-sm font-medium text-gray-900 md:p-4 lg:hidden"
      >
        <PiArrowLeftBold className="mr-4" />
        <Text className="ms-1 font-lexend">Back to Home</Text>
      </Link>

      <div className="min-h-screen justify-between gap-x-8 px-4 py-8 pt-10 md:pt-12 lg:flex lg:p-6 xl:gap-x-10 xl:p-7 2xl:p-10 2xl:pt-10 [&>div]:min-h-[calc(100vh-80px)]">
        <div className="relative flex w-full items-center justify-center lg:w-5/12 2xl:justify-end 2xl:pe-24">
          <div className="w-full max-w-sm md:max-w-md lg:py-7 lg:ps-3 lg:pt-16 2xl:w-[630px] 2xl:max-w-none 2xl:ps-20 2xl:pt-7">
            <Link
              href={"/dashboard"}
              className="absolute -top-4 start-0 hidden p-3 text-gray-700 hover:text-gray-900  lg:flex lg:items-center 2xl:-top-7 2xl:ps-20 "
            >
              <PiArrowLeftBold className="mr-4" />
              <b className="ms-1 font-medium">Back to Home</b>
            </Link>
            <div className="mb-7 px-6 pt-3 text-center md:pt-0 lg:px-0 lg:text-start xl:mb-8 2xl:mb-10">
              <Link
                href={"/dashboard"}
                className="mb-6 inline-flex max-w-[168px] xl:mb-8 items-center flex-nowrap"
              >
                <Image
                  src={logoImg}
                  alt="Gymforce"
                  className="size-10 dark:invert"
                />
                <Image
                  src={logoImgText}
                  alt="Gymforce"
                  className="ps-2.5 dark:invert"
                />
              </Link>
              <Title
                as="h2"
                className="mb-5 text-[26px] leading-snug md:text-3xl md:!leading-normal lg:mb-7 lg:pe-16 lg:text-[28px] xl:text-3xl 2xl:pe-8 2xl:text-4xl text-gray-900 "
              >
                {title}
              </Title>
              <Text className="leading-[1.85] text-gray-700  md:leading-loose lg:pe-8 2xl:pe-14">
                {description}
              </Text>
            </div>
            {isSocialLoginActive && (
              <>
                <div className="pb-5 md:pb-6 xl:pb-7">
                  <Button
                    variant="outline"
                    className="h-11 w-full relative text-gray-400"
                    onClick={handleCustomButtonClick}
                  >
                    <FcGoogle className="me-2 h-5 w-5 shrink-0" />
                    <span className="truncate text-gray-700">
                      {"Continue with Google"}
                    </span>
                  </Button>
                  <div ref={googleLoginRef} className="hidden">
                    <GoogleLogin
                      onSuccess={() => {}}
                      onError={() => {
                        console.log("Login Failed");
                        toast.error("Something went wrong. Please try again.");
                        setError(
                          "Something went wrong while . Please try again."
                        );
                      }}
                      useOneTap
                    />
                  </div>
                </div>
                <OrSeparation
                  title="OR"
                  className="mb-5 2xl:mb-7 text-gray-900 bg-inherit dark:bg-inherit"
                  isCenter
                />
              </>
            )}
            {children}
          </div>
        </div>
        <div className="hidden w-7/12 items-center justify-center rounded-[20px] bg-gray-50 px-6 dark:bg-inherit lg:flex xl:justify-start 2xl:px-16 ">
          <div className="pb-8 pt-10 text-center xl:pt-16 2xl:block 2xl:w-[1063px]">
            <div className="mx-auto mb-10 max-w-sm pt-2 2xl:max-w-lg">
              <Title
                as="h2"
                className="mb-5 font-semibold !leading-normal text-gray-900 lg:text-[26px] 2xl:px-10 2xl:text-[32px]"
              >
                {`Pump Up Your Gym's Potential with GymForce`}
              </Title>
              <Text className="leading-[1.85] text-gray-700 md:leading-loose 2xl:px-6 ">
                Flex your management muscles and watch your fitness empire grow.
                GymForce is the ultimate gym management software that helps you
                manage your gym with ease.
              </Text>
            </div>
            {pageImage}
          </div>
        </div>
      </div>
    </>
  );
}
