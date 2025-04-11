"use client";

import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@core/components/cards/widget-card";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Calendar } from "react-big-calendar";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { FaFireAlt } from "react-icons/fa";
import {
  FaArrowRightLong,
  FaCalendar,
  FaClock,
  FaDoorOpen,
  FaUserCheck,
} from "react-icons/fa6";
import { IoMdTrendingUp } from "react-icons/io";
import { IoRefreshCircle } from "react-icons/io5";
import { MdOutlineTimelapse } from "react-icons/md";
import { ActionIcon, Badge, Button, Loader, Text, Title, Tooltip } from "rizzui";

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

  const [checkinTime, setCheckinTime] = useState<string>(getCurrentTime());
  const [checkoutTime, setCheckoutTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MM"));
  const [monthValue, setMonthValue] = useState(0);
  const [monthLoad, setMonthLoad] = useState(false);

  useEffect(() => {
    const getBasic = async () => {
      try {
        const getToken = localStorage.getItem("member_token");
        const resp = await AxiosPublic.get(
          `/center/attendance-details/?auth=${getToken}`,
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
    <section className="grid lg:grid-cols-[60%,40%]">
      <WidgetCard
        title="Attendance"
        titleClassName="leading-none "
        headerClassName="mb-3 lg:mb-4"
        className="max-w-2xl relative "
        action={
          <div className="flex items-center justify-end">
            <Tooltip content="Refresh Attendance " placement="bottom-end">
              <ActionIcon
                className="scale-90 p-0.5 "
                rounded="lg"
                onClick={() => refresh()}
              >
                <IoRefreshCircle />
              </ActionIcon>
            </Tooltip>
          </div>
        }
      >
        {monthLoad && (
          <div className="flex absolute min-w-[90%] min-h-[90%] items-center justify-center z-[99999]">
            <Loader size="xl" variant="threeDot" className="my-auto" />
          </div>
        )}
        <div className=" pt-5 border rounded-lg px-0.5 relative">
          <Calendar
            tileContent={tileContent}
            value={selectedDate}
            onActiveStartDateChange={(value) => {
              // Destructure the value object
              const { action, activeStartDate, view } = value;

              // Extract month using dayjs
              // Note: dayjs months are 0-indexed (0 for January, 11 for December)
              const monthValue = dayjs(activeStartDate).month();
              setSelectedDate(dayjs(activeStartDate).toDate());
              // If you want the two-digit month format
              const monthFormatted = dayjs(activeStartDate).format("MM");

              // Update your state
              setCurrentMonth(monthFormatted);
              setMonthValue(monthValue);

              // Optionally refresh data
              monthRefresh(monthFormatted);
            }}
            tileDisabled={({ date }) => {
              if (
                dayjs(date).format("YYYY-MM-DD") !==
                dayjs(selectedDate).format("YYYY-MM-DD")
              ) {
                return false;
              }
              return true;
            }}
            onChange={(value) => handleDateClick(value as Date)}
            className="job-schedule-calendar attendance-calender "
            minDate={dayjs().subtract(1, "year").toDate()}
            maxDate={dayjs().toDate()}
            // nextLabel={
            //   <div
            //     className="min-w-full min-h-full flex items-center justify-center"
            //     onClick={() => getNextMonthLabel()}
            //   >
            //     <PiArrowRight className="size-4" />
            //   </div>
            // }
            view="month"
            // prevLabel={
            //   <div
            //     className="min-w-full min-h-full flex items-center justify-center"
            //     onClick={() => getPreviousMonthLabel()}
            //   >
            //     <PiArrowLeft className="size-4 " />
            //   </div>
            // }
            tileClassName={({ date, view }) => {
              if (view === "month") {
                // For current month dates
                let classes =
                  dayjs(date).month() === dayjs(selectedDate).month()
                    ? "text-black font-semibold "
                    : "text-gray-400 "; // For other month dates
                if (dayjs(date) === dayjs(selectedDate)) {
                  console.log(
                    "selected Status",
                    dayjs(date) === dayjs(selectedDate)
                  );

                  classes.concat(" tex-red-dark! font-bold! bg-red-100! ");
                }
                return classes;
              }
              return null;
            }}
          />
        </div>
        {selectedInfo && (
          <div className="p-5 mt-4 bg-gray-50 border border-muted rounded-lg grid gap-3">
            <Title as="h6" className="font-semibold ">
              {dayjs(selectedInfo.date).format(getDateFormat())}
            </Title>
            <p className="font-semibold text-gray-700 ">
              Status:{" "}
              <span
                className={
                  selectedInfo.is_present ? "text-green-600" : "text-red-600"
                }
              >
                {selectedInfo.attendance_state}
              </span>
            </p>
            {selectedInfo.is_present && (
              <div className="grid grid-cols-3">
                <p className="text-sm font-medium text-gray-700  flex flex-nowrap gap-2 items-center">
                  <IoMdLogIn size={24} />
                  {formatTimeValue(selectedInfo.checkin_time)}
                </p>
                <p className="text-sm font-medium text-gray-700  flex flex-nowrap gap-2 items-center">
                  <IoMdLogOut size={24} />
                  {formatTimeValue(selectedInfo.checkout_time)}
                </p>
              </div>
            )}
          </div>
        )}
        {selectedDate && !selectedInfo && (
          <div className="p-5 mt-4 bg-gray-50 border border-muted rounded-lg grid gap-4 md:gap-6 items-center">
            {/* <Empty
              text={`No attendance on 
                ${dayjs(selectedDate).format("MMM D, YYYY")}`}
              textClassName="text-center"
              // imageClassName="size-20 ob"
            /> */}
            <Text className="font-medium text-center text-[15px]">
              No attendance on {dayjs(selectedDate).format(getDateFormat())}
            </Text>
            <div className="flex gap-3 min-w-full justify-evenly items-center">
              <Button
                onClick={() => {
                  setAttendOption("auto");
                  setCheckinTime(getCurrentTime());
                  markAttendance();
                }}
                size="sm"
                className=" flex items-center gap-1.5"
              >
                {attendLoading ? (
                  <Loader variant="threeDot" />
                ) : (
                  <>
                    <AiOutlineThunderbolt size={18} /> Quick Punch
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setAttendOption("manual");
                  setCheckinTime(getCurrentTime());
                  setCheckoutTime(calculateCheckoutTime(getCurrentTime()));
                  setModalIsOpen(true);
                }}
                size="sm"
                className=" flex items-center gap-1.5"
              >
                <MdDriveFileRenameOutline size={18} />
                <span>Manual Punch</span>
              </Button>
            </div>
          </div>
        )}
      </WidgetCard>
      <Modal isOpen={modalIsOpen} onClose={handleModalClose} size="sm">
        <div className="p-4 md:p-6 dark:text-gray-200 dark:bg-gray-800 rounded-md dark:border-gray-700">
          <Title as="h4" className="dark:text-gray-200">
            Manual Attendance
          </Title>
          <div className="grid">
            <Input
              type="time"
              label="CheckIn"
              value={checkinTime}
              onChange={(e) => {
                setCheckinTime(e.target.value);
                setCheckoutTime(calculateCheckoutTime(e.target.value));
              }}
              className="border-none p-2 rounded"
            />
            <Input
              type="time"
              label="CheckOut"
              value={checkoutTime}
              onChange={(e) => setCheckoutTime(e.target.value + ":00")}
              className="border-none p-2 rounded"
            />
          </div>
          <div className="flex gap-4 mt-4 justify-between w-full">
            <Button
              onClick={handleModalClose}
              className="w-52"
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={markAttendance} className="w-52">
              {manualattendLoading ? <Loader variant="threeDot" /> : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      <WidgetCard
        title="Monthly Analysis"
        titleClassName="leading-none "
        headerClassName="mb-3 lg:mb-4"
        className=""
      >
        <div className="grid grid-cols-2 gap-2 gap-y-4 sm:gap-6">
          <div className="col-span-full">
            <div className="p-4 py-6 bg-primary-lighter   dark:bg-gray-100 rounded-lg flex items-center">
              <div className="flex items-center gap-2">
                <FaFireAlt className="text-blue-500 size-5" />
                <Title className="text-base font-semibold ">
                  Current Streak
                </Title>
                <FaArrowRightLong className="text-primary size-5 mx-2" />
              </div>
              <Text className=" font-semibold  pl-6 text-base">
                {analytics.current_streak !== null
                  ? analytics.current_streak + " day(s)"
                  : "N/A"}
              </Text>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-2 sm:p-4 bg-primary-lighter dark:bg-gray-100  rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaFireAlt className="text-blue-500 size-[18px]" />
                <Title className="text-sm font-semibold ">Longest Streak</Title>
              </div>
              <Text className=" font-bold  pl-6">
                {analytics.longest_streak
                  ? analytics.longest_streak + " day(s)"
                  : "N/A"}
              </Text>
            </div>
            <div className="p-2 sm:p-4 bg-primary-lighter dark:bg-gray-100  rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaDoorOpen className="text-green-500 size-4" />
                <h6 className="text-sm font-semibold ">Last Visit</h6>
              </div>
              <Text className=" font-bold  pl-6">
                {analytics?.days_since_last_visit
                  ? analytics.days_since_last_visit
                  : "N/A"}
              </Text>
            </div>

            <div className="p-2 sm:p-4 bg-primary-lighter dark:bg-gray-100  rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaUserCheck className="text-purple-500 size-5" />
                <h6 className="text-sm font-semibold ">Total Visits</h6>
              </div>
              <Text className=" font-bold  pl-6">{analytics.total_visits}</Text>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-2 sm:p-4 bg-primary-lighter dark:bg-gray-100  rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-orange-500 size-[18px]" />
                <h6 className="text-sm font-semibold ">Avg. Duration</h6>
              </div>
              <Text className=" font-bold  pl-6">
                {analytics.avg_duration} hr
              </Text>
            </div>

            <div className="p-2 sm:p-4 bg-primary-lighter dark:bg-gray-100  rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IoMdTrendingUp className="text-red-500 size-5" />
                <h6 className="text-sm font-semibold ">Monthly Rate</h6>
              </div>
              <Text className=" font-bold  pl-6">
                {analytics.monthly_attendance_rate}%
              </Text>
            </div>

            <div className="p-2 sm:p-4 bg-primary-lighter dark:bg-gray-100  rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MdOutlineTimelapse className="text-teal-500 size-5" />
                <h6 className="text-sm font-semibold ">Common Time</h6>
              </div>
              <Text className=" font-bold  pl-6">
                {analytics?.most_common_time
                  ? (() => {
                      const [hours, minutes] =
                        analytics.most_common_time.split(":");
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

          <div className="col-span-2 p-6 bg-primary-lighter dark:bg-gray-100  rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FaCalendar className="text-primary size-4" />
              <h6 className="text-sm font-semibold ">Preferred Days</h6>
            </div>
            <div className="flex gap-2 flex-wrap pl-4">
              {analytics.preferred_days.map((day: string, index: number) => (
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
    </section>
  );
}
