"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@core/utils/format-date";
import {
  Title,
  Text,
  Badge,
  Tooltip,
  Button,
  Loader,
  Empty,
  EmptyProductBoxIcon,
} from "rizzui";
import cn from "@core/utils/class-names";

import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { FaLocationDot, FaMobile } from "react-icons/fa6";
import { IoMdDesktop, IoMdLogOut } from "react-icons/io";
import { InfoIcon } from "lucide-react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

export default function LoggedSessionsSections() {
  const [sessionData, setSessionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await AxiosPrivate("/api/user-sessions", {
        id: newID("user-sessions"),
      });
      setSessionData(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSessions();
  }, []);

  const LogoutSession = async (id: any) => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.post(
        `/api/logout-session/?gym_id=${gymId}`,
        {
          id: id,
        }
      ).then((res) => {
        console.log(res.data);
        invalidateAll();
        fetchSessions();
      });
    } catch (error) {
      console.log(error);
    }
  };
  const getDeviceIcon = (deviceInfo: any) => {
    const platform = deviceInfo.platform.toLowerCase();
    const appName = deviceInfo.appName.toLowerCase();

    // Check for common mobile indicators
    if (
      platform.includes("android") ||
      platform.includes("ios") ||
      platform.includes("iphone") ||
      appName.includes("mobile")
    ) {
      return <FaMobile className="size-6 " />;
    }

    // Default to desktop for all other cases
    return <IoMdDesktop className="size-6 " />;
  };
  return (
    <div className={cn("mx-auto w-full max-w-screen-2xl")}>
      <div className="border-b border-dashed border-muted flex flex-row gap-4 items-center">
        <Title as="h2" className="my-4 text-xl font-bold ">
          Active Sessions
        </Title>
        <Tooltip content="Only Last 5 active sessions" animation="fadeIn">
          <InfoIcon size={20} className="" />
        </Tooltip>
      </div>
      {loading ? (
        <div className=" w-full my-4 flex items-center justify-center">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        sessionData.map((device: any) => (
          <div key={device.id} className="grid grid-cols-1 items-center">
            <div className="flex items-start gap-6 border-b border-dashed border-muted py-6 max-w-xl">
              {getDeviceIcon(device.device_info)}
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <Title
                    as="h3"
                    className="text-base font-medium text-gray-900 "
                  >
                    {device.device_info.platform}
                  </Title>
                  <Badge className="text-primary" size="sm" renderAsDot />
                  <Text className="text-sm ">{device.device_info.appName}</Text>
                </div>
                <div className="flex items-center gap-3">
                  <Text className="font-medium ">Log-in : </Text>
                  <Text className="text-sm ">
                    {formatDate(
                      device.last_activity.split("T")[0],
                      "MMM DD, YYYY"
                    )}
                  </Text>
                  <Badge className="text-primary" size="sm" renderAsDot />
                  <Text className="text-sm ">
                    {formatDate(device.last_activity, "h:mm A")}
                  </Text>
                </div>
                {/* <div className="flex items-center gap-2 mt-2">
                  <FaLocationDot size={16} className="" />
                  <Text className="text-sm ">
                    {device.ip_location.city}, {device.ip_location.region},{" "}
                    {device.ip_location.country}
                  </Text>
                </div> */}
              </div>
            </div>
            <div className="w-full ms-4 hidden">
              <Button
                className="justify-center flex gap-2 items-center group"
                size="sm"
                onClick={() => {
                  LogoutSession(device.id);
                }}
              >
                <span>Logout</span>
                <IoMdLogOut
                  size={16}
                  className="group-hover:scale-110 duration-300"
                />
              </Button>
            </div>
          </div>
        ))
      )}
      {sessionData.length === 0 ? (
        <Empty image={<EmptyProductBoxIcon />} text="No Recent Sessions" />
      ) : null}
    </div>
  );
}
