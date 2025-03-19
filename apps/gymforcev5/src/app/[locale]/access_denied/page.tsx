"use client";

import Image from "next/image";
import { Button, Title } from "rizzui";
import ForbiddenImg from "@/../public/403img.svg";
import ForbiddenTwoImg from "@/../public/forbidden-two.png";
import { PiHouseLineBold } from "react-icons/pi";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  addListener,
  launch,
  isLaunch,
  setDetectDelay,
} from "devtools-detector";

export default function AccessDeniedPage() {
  const searchParams = useSearchParams();
  const errorVal = searchParams.get("error");
  const router = useRouter();
  const [isDevToolsClosed, setIsDevToolsClosed] = useState(false);

  useEffect(() => {
    const protect = (isOpen: boolean): void => {
      if (!isOpen) {
        setIsDevToolsClosed(true);
        toast.success("Redirecting ...", { duration: 1500 });
        router.push("/dashboard");
        // router.back();
      } else {
        setIsDevToolsClosed(false);
      }
    };

    // Add listener from devtools-detector
    addListener(protect);

    setDetectDelay(1000);
    // Launch detection
    launch();

    // Continuous checking
    const interval = setInterval(() => {
      if (isLaunch()) {
        launch();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [router]);

  const handleBackToHome = () => {
    if (isDevToolsClosed) {
      router.push("/dashboard");
    } else {
      toast.error("Please close the developer tools.");
    }
  };

  return (
    <div className="flex grow items-center px-6 xl:px-10">
      <div className="mx-auto text-center">
        <div className="relative mx-auto max-w-[370px]">
          <Image
            src={ForbiddenImg}
            alt="forbidden"
            className="mx-auto mb-8 aspect-[360/326] max-w-[256px] xs:max-w-[370px] lg:mb-12 2xl:mb-16"
          />
          <Image
            src={ForbiddenTwoImg}
            alt="forbidden"
            className="absolute right-10 top-10 aspect-auto max-w-[100px] dark:right-0 dark:top-5 dark:invert "
          />
        </div>
        <Title
          as="h1"
          className="text-2xl font-bold leading-normal text-gray-900  lg:text-3xl"
        >
          Access Denied
        </Title>
        {errorVal === "dev-tools" ? (
          <Title as="h4" className=" mt-4 mx-auto text-center">
            {`Nice try, Our pixels are for eyes, not Spies. Why not build something original instead?`}{" "}
            <br />
            (Please Close the Dev Tools to continue.)
          </Title>
        ) : (
          <p className="mt-3 text-sm leading-loose text-gray-500 lg:mt-6 lg:text-base lg:leading-loose">
            You do not have permission to access this page.
            <br className="hidden xs:inline-block" />
            Please contact your Owner for more Information.
          </p>
        )}
        <Button
          size="xl"
          as="span"
          onClick={handleBackToHome}
          className="h-12 px-4 xl:h-14 xl:px-4 mt-6 md:mt-8"
        >
          <PiHouseLineBold className="mr-1.5 text-lg" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
