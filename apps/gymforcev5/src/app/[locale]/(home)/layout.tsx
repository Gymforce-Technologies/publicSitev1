"use client";
import { useParams, usePathname } from "next/navigation";
import Header from "@/layouts/hydrogen/header";
import Sidebar from "@/layouts/hydrogen/sidebar";


import { useEffect, useState } from "react";
import { useIsMounted } from "@core/hooks/use-is-mounted";
// import { useDevToolsProtection } from "@/hooks/useDevToolsProtection";
import ProfileSidebar from "@/layouts/hydrogen/profile-sidebar";
import { isStaff } from "../auth/Staff";
import { getDateFormat, getTimeZoneVal } from "../auth/DateFormat";
import PWAPrompt from "@/components/PWAPrompt";
import toast from "react-hot-toast";
import StaffProfileSidebar from "@/layouts/hydrogen/staff-sidebar";
// import { initializeApp, getApp } from "firebase/app";
// import { fetchFirebaseToken } from "@/components/firebaseToken";

// import { getMessaging } from "firebase/messaging";
import { LockProvider } from "@/components/lock/LockProvider";
import { getApp, initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { fetchFirebaseToken } from "@/components/firebaseToken";
// import { useDevToolsProtection } from "@/hooks/useDevToolsProtection";
// import { LockProvider } from "@/components/lock/LockProvider";

export default function DefaultLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  const isMounted = useIsMounted();
  // useDevToolsProtection();
  const params = useParams();
  const pathname = usePathname();
  const memberId = params.id;
  const [previousPath, setPreviousPath] = useState("/dashboard");
  const isProfileSection = pathname.startsWith(`/${locale}/member_profile`);
  const isStaffSection = pathname.startsWith(
    `/${locale}/staff-section/staff-profile`
  );

  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState<any>(null);
  // In your DefaultLayout component, update this useEffect:

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const firebaseConfig = {
          apiKey: "AIzaSyCzaoCUBy2i-isTz-KCXZRtYvba6DzJddQ",
          authDomain: "gymforce-e2476.firebaseapp.com",
          projectId: "gymforce-e2476",
          storageBucket: "gymforce-e2476.firebasestorage.app",
          messagingSenderId: "299717931162",
          appId: "1:299717931162:web:13d86f5c6a7e43a45e6f23",
          measurementId: "G-SJP816SN0X",
        };

        let app;
        try {
          app = getApp();
        } catch {
          app = initializeApp(firebaseConfig);
        }

        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          const messaging = getMessaging(app);
          // Only fetch a token if it isn't already stored
          const storedToken = localStorage.getItem("firebaseToken");
          if (!storedToken) {
            await fetchFirebaseToken();
          }
        }
      } catch (error) {
        console.error("Firebase initialization error:", error);
      }
    };

    initFirebase();
  }, []);

  useEffect(() => {
    const loadTimeZone = async () => {
      await getTimeZoneVal().then(() => {
        console.log("TimeZone set");
      });
    };
    loadTimeZone();
  });
  useEffect(() => {
    getDateFormat();
  }, []);

  const shouldShowPrompt = (): boolean => {
    try {
      // Safely get the last prompt date
      const lastPromptDate = localStorage.getItem("lastPWAPromptDate");
      const today = new Date().toISOString().split("T")[0];

      // If no last prompt date, or last date is different from today
      return !lastPromptDate || lastPromptDate !== today;
    } catch (error) {
      // Fallback if localStorage is not available or encounters an error
      console.error("Error checking PWA prompt:", error);
      return true; // Show prompt if there's any issue
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      if (
        !window.matchMedia("(display-mode:standalone)").matches &&
        shouldShowPrompt()
      ) {
        setShowPrompt(true);
        const today = new Date().toISOString().split("T")[0];
        localStorage.setItem("lastPWAPromptDate", today);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = () => {
    if (prompt) {
      prompt.prompt();

      prompt.userChoice.then((choiceResult: any) => {
        console.log("User choice", choiceResult);
        if (choiceResult.outcome === "accepted") {
          toast.success("App Will be Installed on the Device Soon.");
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setShowPrompt(false);
      });
    } else {
      console.log("No prompt available");
    }
  };

  useEffect(() => {
    if (!isProfileSection && !isStaffSection) {
      setPreviousPath(pathname);
    }
  }, [pathname, locale]);

  useEffect(() => {
    const checkStaff = async () => {
      const resp = await isStaff();
      return resp;
    };
    checkStaff();
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <main className="flex flex-grow">
      {isProfileSection ? (
        <ProfileSidebar
          className="fixed hidden xl:block bg-inherit"
          memberId={memberId as string}
          link={previousPath}
        />
      ) : isStaffSection ? (
        <StaffProfileSidebar
          className="fixed hidden xl:block bg-inherit"
          memberId={memberId as string}
          link={previousPath}
        />
      ) : (
        <Sidebar className="fixed hidden xl:block bg-inherit" />
      )}
      <div className="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
        {isProfileSection || isStaffSection ? (
          <Header memberId={memberId as string} />
        ) : (
          <Header />
        )}
        <div className="flex flex-grow flex-col  px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 3xl:px-8 3xl:pt-4 4xl:px-10 4xl:pb-9">
          <LockProvider>{children}</LockProvider>
        </div>
      </div>
      <PWAPrompt
        show={showPrompt}
        handleInstall={handleInstall}
        onClose={() => setShowPrompt(false)}
      />
    </main>
  );
}
