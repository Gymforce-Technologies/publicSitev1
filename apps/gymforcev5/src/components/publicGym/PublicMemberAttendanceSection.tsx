"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@core/components/cards/widget-card";
import {
  Title,
  Loader,
  Badge,
  Button,
  Modal,
  Input,
  Text,
  Empty,
  Tooltip,
  ActionIcon,
} from "rizzui";
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {
  IoMdCheckmarkCircleOutline,
  IoMdLogIn,
  IoMdLogOut,
  IoMdTrendingUp,
} from "react-icons/io";
import {
  FaArrowRightLong,
  FaBan,
  FaCalendar,
  FaClock,
  FaDoorOpen,
  FaUserCheck,
} from "react-icons/fa6";
import { FaFireAlt } from "react-icons/fa";
import {
  MdDriveFileRenameOutline,
  MdOutlineArrowRight,
  MdOutlineTimelapse,
} from "react-icons/md";
import { AiOutlineThunderbolt } from "react-icons/ai";
import {
  formateDateValue,
  formatTimeValue,
  getDateFormat,
  getTimeZoneVal,
} from "@/app/[locale]/auth/DateFormat";
import toast from "react-hot-toast";
import { IoRefreshCircle } from "react-icons/io5";

interface AttendanceData {
  attendance_state: string;
  checkin_time: string;
  checkout_time: string;
  date: string;
  is_present: boolean;
  member: string;
}

export default function PublicMemberAttendanceSection() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedInfo, setSelectedInfo] = useState<AttendanceData | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendLoading, setAttendLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [attendOption, setAttendOption] = useState<string>("");
  const [manualattendLoading, setManualAttendLoading] = useState(false);
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
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MM"));
  const [monthValue, setMonthValue] = useState(0);
  const [monthLoad, setMonthLoad] = useState(false);

  const getCurrentTime = () => {
    return dayjs().format("HH:mm");
  };
  const [checkinTime, setCheckinTime] = useState<string>(getCurrentTime());
  const [checkoutTime, setCheckoutTime] = useState<string>("");

  const getdata = async () => {
    try {
      setIsLoading(true);
      const getToken = localStorage.getItem("member_token");
      const resp = await AxiosPublic.get(
        `/center/attendance-details/?auth=${getToken}&month=${currentMonth}`,
        {
          id: `Member-Attendance-${getToken}-${currentMonth}`,
        }
      );
      setAttendanceData(resp.data.results || []);
      setAnalytics(resp.data.analytics);

      const todayInfo = resp.data.results?.find(
        (item: AttendanceData) =>
          dayjs(item.date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
      );
      setSelectedInfo(todayInfo || null);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getdata();
  }, []);

  const monthRefresh = async (date: string) => {
    try {
      setMonthLoad(true);
      const getToken = localStorage.getItem("member_token");
      const resp = await AxiosPublic.get(
        `/center/attendance-details/?auth=${getToken}&month=${date}`,
        {
          id: `Member-Attendance-${getToken}-${date}`,
        }
      );
      setAttendanceData(resp.data.results || []);
      setAnalytics(resp.data.analytics);

      const todayInfo = resp.data.results?.find(
        (item: AttendanceData) =>
          dayjs(item.date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
      );
      setSelectedInfo(todayInfo || null);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setMonthLoad(false);
    }
  };

  const tileContent = useCallback(
    ({ date, view }: { date: Date; view: string }) => {
      if (view === "month" && attendanceData !== null) {
        const infoItem = attendanceData.find(
          (item) =>
            dayjs(item.date).format("YYYY-MM-DD") ===
            dayjs(date).format("YYYY-MM-DD")
        );
        return (
          <div className="">
            {dayjs(date).isSame(dayjs(), "day") ? (
              <Badge
                color="info"
                renderAsDot
                className="absolute top-2 left-2 animate-blink"
              />
            ) : (
              dayjs(date).isSame(dayjs(selectedDate), "day") && (
                <MdOutlineArrowRight
                  className="text-primary-dark flex flex-1 absolute top-[20%] left-0 size-7"
                  size={28}
                />
              )
            )}

            {infoItem ? (
              infoItem.is_present ? (
                <IoMdCheckmarkCircleOutline className="text-green-500 flex flex-1 size-5 absolute bottom-1.5 right-1.5" />
              ) : (
                <FaBan className="text-red-600 flex flex-1 size-5 absolute bottom-1.5 right-1.5" />
              )
            ) : null}
          </div>
        );
      }
    },
    [selectedDate, attendanceData, selectedInfo]
  );

  const handleDateClick = (value: Date) => {
    setSelectedDate(value);
    if (attendanceData) {
      const infoItem = attendanceData.find(
        (item) =>
          dayjs(item.date).format("YYYY-MM-DD") ===
          dayjs(value).format("YYYY-MM-DD")
      );
      setSelectedInfo(infoItem || null);
    }
  };

  const formatDateTimeWithTimezone = async (
    dateVal: string,
    timeString: string
  ) => {
    const timeZoneVal = await getTimeZoneVal();

    const [hours, minutes] = timeString.split(":").map(Number);

    const date = new Date(dateVal);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    const offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneVal,
      timeZoneName: "shortOffset",
    });

    const tzOffset = offsetFormatter.format(date).split(" ").pop() || "+00:00";
    const cleanOffset = tzOffset
      .replace("GMT", "")
      .replace(
        /(\+|-)(\d{1,2})(?::?)(\d{2})?/,
        (_, sign, hours, minutes = "00") => {
          return `${sign}${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
        }
      );

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(hours).padStart(2, "0");
    const minute = String(minutes).padStart(2, "0");
    const second = "00";

    return `${year}-${month}-${day}T${hour}:${minute}:${second}${cleanOffset}`;
  };

  const calculateCheckoutTime = (checkin: string) => {
    const timeWithSeconds = checkin.length === 5 ? `${checkin}:00` : checkin;
    const today = dayjs().format("YYYY-MM-DD");
    const fullDateTime = `${today} ${timeWithSeconds}`;
    return dayjs(fullDateTime, "YYYY-MM-DD HH:mm:ss")
      .add(1, "hour")
      .format("HH:mm:ss");
  };

  const markAttendance = async () => {
    try {
      if (attendOption == "manual") {
        setManualAttendLoading(true);
      } else {
        setAttendLoading(true);
      }

      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
      const calculatedCheckoutTime = calculateCheckoutTime(checkinTime);
      const getToken = localStorage.getItem("member_token");

      const payload =
        attendOption == "manual"
          ? {
              auth: getToken,
              checkin_time: await formatDateTimeWithTimezone(
                formattedDate,
                checkinTime
              ),
              checkout_time: await formatDateTimeWithTimezone(
                formattedDate,
                checkoutTime
              ),
              datetime_punch: await formatDateTimeWithTimezone(
                formattedDate,
                checkinTime
              ),
              date: formateDateValue(selectedDate, "YYYY-MM-DD"),
            }
          : {
              auth: getToken,
              checkin_time: await formatDateTimeWithTimezone(
                formattedDate,
                checkinTime
              ),
              checkout_time: await formatDateTimeWithTimezone(
                formattedDate,
                calculatedCheckoutTime
              ),
              datetime_punch: await formatDateTimeWithTimezone(
                formattedDate,
                checkinTime
              ),
              date: formateDateValue(selectedDate, "YYYY-MM-DD"),
            };

      const response = await AxiosPublic.post(
        "/center/mark-attendance/",
        payload
      );
      toast.success("Attendance Posted successfully");
      getdata();
      setSelectedDate(new Date());
      setModalIsOpen(false);
    } catch (error: any) {
      if (
        error.response?.data?.error === "Member has already checked in today."
      ) {
        toast.error("Member has already checked in today");
      } else {
        toast.error("Something went wrong while Posting Attendance");
      }
      console.error(error);
    } finally {
      setAttendLoading(false);
      setManualAttendLoading(false);
    }
  };

  const refresh = async () => {
    getdata();
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
    setCheckinTime("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" variant="spinner" />
      </div>
    );
  }

  return (
    <section className="grid lg:grid-cols-[60%,40%] max-w-6xl mx-auto">
      <WidgetCard
        title="Attendance"
        titleClassName="leading-none"
        headerClassName="mb-3 lg:mb-4"
        className="max-w-2xl relative dark:bg-gray-800 dark:border-gray-700"
        action={
          <div className="flex items-center justify-end">
            <Tooltip content="Refresh Attendance" placement="bottom-end">
              <ActionIcon
                className="scale-90 p-0.5"
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
        <div className="pt-5 border rounded-lg px-0.5 relative dark:border-gray-700">
          <Calendar
            tileContent={tileContent}
            value={selectedDate}
            onActiveStartDateChange={(value) => {
              const { activeStartDate } = value;
              const monthValue = dayjs(activeStartDate).month();
              setSelectedDate(dayjs(activeStartDate).toDate());
              const monthFormatted = dayjs(activeStartDate).format("MM");
              setCurrentMonth(monthFormatted);
              setMonthValue(monthValue);
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
            className="job-schedule-calendar attendance-calender dark:text-white"
            minDate={dayjs().subtract(1, "year").toDate()}
            maxDate={dayjs().toDate()}
            view="month"
            tileClassName={({ date, view }) => {
              if (view === "month") {
                let classes =
                  dayjs(date).month() === dayjs(selectedDate).month()
                    ? "text-black dark:text-white font-semibold"
                    : "text-gray-400";
                if (dayjs(date).isSame(dayjs(selectedDate), "day")) {
                  classes += " font-bold bg-red-100 dark:bg-gray-700";
                }
                return classes;
              }
              return null;
            }}
          />
        </div>

        {selectedInfo && (
          <div className="p-5 mt-4 bg-gray-50 dark:bg-gray-700 border border-muted dark:border-gray-600 rounded-lg grid gap-3">
            <Title as="h6" className="font-semibold dark:text-white">
              {dayjs(selectedInfo.date).format(getDateFormat())}
            </Title>
            <p className="font-semibold text-gray-700 dark:text-gray-200">
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
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex flex-nowrap gap-2 items-center">
                  <IoMdLogIn size={24} />
                  {formatTimeValue(selectedInfo.checkin_time)}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex flex-nowrap gap-2 items-center">
                  <IoMdLogOut size={24} />
                  {formatTimeValue(selectedInfo.checkout_time)}
                </p>
              </div>
            )}
          </div>
        )}

        {selectedDate && !selectedInfo && (
          <div className="p-5 mt-4 bg-gray-50 dark:bg-gray-700 border border-muted dark:border-gray-600 rounded-lg grid gap-4 md:gap-6 items-center">
            <Text className="font-medium text-center text-[15px] dark:text-white">
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
                className="flex items-center gap-1.5"
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
                className="flex items-center gap-1.5"
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
        titleClassName="leading-none"
        headerClassName="mb-3 lg:mb-4"
        className="dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="grid grid-cols-2 gap-2 gap-y-4 sm:gap-6">
          <div className="col-span-full">
            <div className="p-4 py-6 bg-primary-lighter/70 dark:bg-gray-700 rounded-lg flex items-center">
              <div className="flex items-center gap-2">
                <FaFireAlt className="text-blue-500 size-5" />
                <Title className="text-base font-semibold dark:text-white">
                  Current Streak
                </Title>
                <FaArrowRightLong className="text-primary size-5 mx-2" />
              </div>
              <Text className="font-semibold pl-6 text-base dark:text-white">
                {analytics?.current_streak !== null
                  ? analytics?.current_streak + " day(s)"
                  : "N/A"}
              </Text>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-2 sm:p-4 bg-primary-lighter/70 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaFireAlt className="text-blue-500 size-[18px]" />
                <Title className="text-sm font-semibold dark:text-white">
                  Longest Streak
                </Title>
              </div>
              <Text className="font-bold pl-6 dark:text-white">
                {analytics?.longest_streak
                  ? analytics?.longest_streak + " day(s)"
                  : "N/A"}
              </Text>
            </div>

            <div className="p-2 sm:p-4 bg-primary-lighter/70 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaDoorOpen className="text-green-500 size-4" />
                <h6 className="text-sm font-semibold dark:text-white">
                  Last Visit
                </h6>
              </div>
              <Text className="font-bold pl-6 dark:text-white">
                {analytics?.days_since_last_visit
                  ? analytics?.days_since_last_visit
                  : "N/A"}
              </Text>
            </div>

            <div className="p-2 sm:p-4 bg-primary-lighter/70 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaUserCheck className="text-purple-500 size-5" />
                <h6 className="text-sm font-semibold dark:text-white">
                  Total Visits
                </h6>
              </div>
              <Text className="font-bold pl-6 dark:text-white">
                {analytics?.total_visits}
              </Text>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-2 sm:p-4 bg-primary-lighter/70 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-orange-500 size-[18px]" />
                <h6 className="text-sm font-semibold dark:text-white">
                  Avg. Duration
                </h6>
              </div>
              <Text className="font-bold pl-6 dark:text-white">
                {analytics?.avg_duration} hr
              </Text>
            </div>

            <div className="p-2 sm:p-4 bg-primary-lighter/70 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IoMdTrendingUp className="text-red-500 size-5" />
                <h6 className="text-sm font-semibold dark:text-white">
                  Monthly Rate
                </h6>
              </div>
              <Text className="font-bold pl-6 dark:text-white">
                {analytics?.monthly_attendance_rate}%
              </Text>
            </div>

            <div className="p-2 sm:p-4 bg-primary-lighter/70 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MdOutlineTimelapse className="text-teal-500 size-5" />
                <h6 className="text-sm font-semibold dark:text-white">
                  Common Time
                </h6>
              </div>
              <Text className="font-bold pl-6 dark:text-white">
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

          <div className="col-span-2 p-6 bg-primary-lighter/70 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FaCalendar className="text-primary size-4" />
              <h6 className="text-sm font-semibold dark:text-white">
                Preferred Days
              </h6>
            </div>
            <div className="flex gap-2 flex-wrap pl-4">
              {analytics?.preferred_days.map((day: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="dark:border-gray-500 dark:text-gray-200"
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
