"use client";
import React from "react";
import MetricCard from "./metric-card";
import { TbSpeakerphone } from "react-icons/tb";
import { Title } from "rizzui";
import { useAttendance } from "./AttandanceContext";

const formatDateLong = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};
// interface SidePartProps {
//   attendenceSummary: any;
// }
const AttendanceHeader = () => {
  const { attendanceSummary, selected } = useAttendance();
  const currentDate = new Date();
  const formattedDate = formatDateLong(currentDate);
  return (
    <div className="w-[100%] h-auto  rounded border shadow-md flex flex-col ">
      <div className="flex flex-col md:flex-row gap-2 p-3 md:items-center justify-between">
        <div className="flex gap-2 items-center ">
          <div className="p-4 rounded-full bg-primary ">
            <TbSpeakerphone
              size={24}
              className="text-gray-200 dark:text-gray-900"
            />
          </div>
          <Title as="h4" className=" ">
            {formattedDate}
          </Title>
        </div>
        <div className="flex items-center gap-1 md:grid grid-cols-3 md:gap-3">
          {attendanceSummary ? (
            <>
              <MetricCard
                title={`Total ${selected}`}
                metric={attendanceSummary.total}
                // metricClassName="text-black  "
                // className=" min-w-full"
                titleClassName="capitalize"
                className="md:w-48"
              />
              <MetricCard
                title={`Present ${selected}`}
                metric={attendanceSummary.present}
                // metricClassName="text-black"
                className="justify-between md:w-48 "
                titleClassName="capitalize"
              />
              <MetricCard
                title={`Absent ${selected}`}
                metric={attendanceSummary.absent}
                // metricClassName="text-black"
                className="md:w-48 "
                titleClassName="capitalize"
              />
            </>
          ) : (
            <>
              <div className="w-full">
                <div className="h-40 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
              </div>

              <div className="w-full">
                <div className="h-40 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
              </div>

              <div className="w-full">
                <div className="h-40 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </>
          )}
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default AttendanceHeader;
