"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";
import PageHeader from "@/app/shared/page-header";
import CenterSettingsNav from "../../../../components/centersettings/navigation";
import { isStaff } from "../../auth/Staff";
import { Loader } from "rizzui";

const pageHeader = {
  title: "Center Settings",
  breadcrumb: [
    {
      href: "/",
      name: "Home",
    },
    {
      name: "Center Settings",
    },
  ],
};

export default function ProfileSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    const checkStaff = async () => {
      try {
        const staffStatus = await isStaff();
        if (staffStatus) {
          router.push("/access_denied");
          return null;
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Error checking staff status:", error);
        // toast.error('An error occurred');
      } finally {
        setLoading(false);
      }
    };
    checkStaff();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader size="xl" variant="spinner" />
      </div>
    );
  }
  if (isAuthorized) {
    return (
      <>
        <PageHeader
          title={pageHeader.title}
          breadcrumb={pageHeader.breadcrumb}
          // className="dark:text-gray-400"
        />
        <CenterSettingsNav />
        {children}
      </>
    );
  }
}
