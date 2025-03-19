"use client";

import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@core/components/cards/widget-card";
import { useEffect, useState } from "react";
import { FaFireAlt } from "react-icons/fa";
import {
  FaArrowRightLong,
  FaCalendar,
  FaClock,
  FaDoorOpen,
  FaUserCheck,
} from "react-icons/fa6";
import { IoMdTrendingUp } from "react-icons/io";
import { MdOutlineTimelapse } from "react-icons/md";
import { Badge, Text, Title } from "rizzui";

export default function PublicMemberAttendanceSection() {
  const [analytics, setAnalytics] = useState<any>({
    total_visits: 0,
    avg_duration: 0,
    most_common_time: "",
    longest_streak: 0,
    current_streak: 0,
    monthly_attendance_rate: 0,
    days_since_last_visit: "",
    preferred_days: [],
  });

  useEffect(() => {
    const getBasic = async () => {
      try {
        const getToken = localStorage.getItem("member_token");
        const resp = await AxiosPublic.get(
          `https://apiv2.gymforce.in/center/attendance-details/?auth=${getToken}`,
          {
            id: `Member-Attendance-${getToken}`,
          }
        );
        setAnalytics(resp.data.analytics);
      } catch (error) {
        console.log(error);
      }
    };
    getBasic();
  }, []);

  return (
    <WidgetCard
      title="Monthly Analysis"
      titleClassName="leading-none "
      headerClassName="mb-3 lg:mb-4"
      className="dark:bg-gray-800 dark:border-gray-700 pt-4 max-w-4xl"
    >
      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto pt-6">
        <div className="col-span-full">
          <div className="p-4 py-6 bg-primary-lighter/70 rounded-lg flex items-center">
            <div className="flex items-center gap-2">
              <FaFireAlt className="text-blue-500 size-5" />
              <Title className="text-base font-semibold ">Current Streak</Title>
              <FaArrowRightLong className="text-primary size-5 mx-2" />
            </div>
            <Text className=" font-semibold  pl-6 text-base">
              {analytics?.current_streak !== null
                ? analytics?.current_streak + " day(s)"
                : "N/A"}
            </Text>
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-4 bg-primary-lighter/70 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaFireAlt className="text-blue-500 size-[18px]" />
              <Title className="text-sm font-semibold ">Longest Streak</Title>
            </div>
            <Text className=" font-bold  pl-6">
              {analytics?.longest_streak
                ? analytics?.longest_streak + " day(s)"
                : "N/A"}
            </Text>
          </div>
          <div className="p-4 bg-primary-lighter/70 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaDoorOpen className="text-green-500 size-4" />
              <h6 className="text-sm font-semibold ">Last Visit</h6>
            </div>
            <Text className=" font-bold  pl-6">
              {analytics?.days_since_last_visit
                ? analytics?.days_since_last_visit
                : "N/A"}
            </Text>
          </div>

          <div className="p-4 bg-primary-lighter/70 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaUserCheck className="text-purple-500 size-5" />
              <h6 className="text-sm font-semibold ">Total Visits</h6>
            </div>
            <Text className=" font-bold  pl-6">{analytics?.total_visits}</Text>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-primary-lighter/70 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaClock className="text-orange-500 size-[18px]" />
              <h6 className="text-sm font-semibold ">Avg. Duration</h6>
            </div>
            <Text className=" font-bold  pl-6">
              {analytics?.avg_duration} hr
            </Text>
          </div>

          <div className="p-4 bg-primary-lighter/70 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <IoMdTrendingUp className="text-red-500 size-5" />
              <h6 className="text-sm font-semibold ">Monthly Rate</h6>
            </div>
            <Text className=" font-bold  pl-6">
              {analytics?.monthly_attendance_rate}%
            </Text>
          </div>

          <div className="p-4 bg-primary-lighter/70 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MdOutlineTimelapse className="text-teal-500 size-5" />
              <h6 className="text-sm font-semibold ">Common Time</h6>
            </div>
            <Text className=" font-bold  pl-6">
              {analytics?.most_common_time
                ? (() => {
                    const [hours, minutes] =
                      analytics?.most_common_time.split(":");
                    const date = new Date();
                    date.setHours(parseInt(hours, 10));
                    date.setMinutes(parseInt(minutes, 10));
                    date.setHours(date.getHours() + 5);
                    date.setMinutes(date.getMinutes() + 30);
                    return date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                  })()
                : "N/A"}
            </Text>
          </div>
        </div>

        <div className="col-span-2 p-6 bg-primary-lighter/70 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <FaCalendar className="text-primary size-4" />
            <h6 className="text-sm font-semibold ">Preferred Days</h6>
          </div>
          <div className="flex gap-2 flex-wrap pl-4">
            {analytics?.preferred_days.map((day: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                // className="
              >
                {day}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
