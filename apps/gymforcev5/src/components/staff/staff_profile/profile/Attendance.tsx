"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Title,
  Loader,
  Badge,
  Button,
  Input,
  Modal,
  Text,
  Tooltip,
  ActionIcon,
} from "rizzui";
// import cn from '@utils/class-names';
import Calendar from "react-calendar";
import { PiArrowRight, PiArrowLeft } from "react-icons/pi";
import dayjs from "dayjs";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@core/components/cards/widget-card";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaBan } from "react-icons/fa6";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { MdDriveFileRenameOutline, MdOutlineArrowRight } from "react-icons/md";
import toast from "react-hot-toast";
import {
  formateDateValue,
  getDateFormat,
  getTimeZoneVal,
} from "@/app/[locale]/auth/DateFormat";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { LucideRefreshCw } from "lucide-react";

interface AttendanceData {
  attendance_state: string;
  checkin_time: string;
  checkout_time: string;
  date: string;
  is_present: boolean;
  member: string;
}

export default function Attendance({ id }: { id: string }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedInfo, setSelectedInfo] = useState<AttendanceData | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendLoading, setAttendLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [attendOption, setAttendOption] = useState<string>("");
  const [manualattendLoading, setManualAttendLoading] = useState(false);
  const getCurrentTime = () => {
    return dayjs().format("HH:mm");
  };
  const [checkinTime, setCheckinTime] = useState<string>(getCurrentTime());
  const [checkoutTime, setCheckoutTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MM"));
  const [monthValue, setMonthValue] = useState(0);
  const [monthLoad, setMonthLoad] = useState(false);

  const getdata = async () => {
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/staff/${id}/attendance/?gym_id=${gymId}&month=${currentMonth}`,
        {
          id: newID(`staff-attendance-${id}-${currentMonth}`),
        }
      );
      console.log(resp.data);
      setAttendanceData(resp.data.results);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getdata();
  }, [id]);

  const monthRefresh = async (date: string) => {
    try {
      // setIsLoading(true);
      setMonthLoad(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/staff/${id}/attendance/?gym_id=${gymId}&month=${date}`,
        {
          id: newID(`staff-attendance-${id}-${date}`),
        }
      );
      // console.log(resp.data);
      setAttendanceData(resp.data.results);
      const todayInfo = resp.data.results.find(
        (item: AttendanceData) =>
          dayjs(item.date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
      );
      setSelectedInfo(todayInfo || null);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      // setIsLoading(false);
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
    [selectedDate, attendanceData, selectedInfo, setMonthValue]
  );

  const formatDateTimeWithTimezone = async (
    dateVal: string,
    timeString: string
  ) => {
    // const formatDateTimeWithTimezone = async (timeString: string) => {
    // Get the custom timezone
    const timeZoneVal = await getTimeZoneVal();

    // Parse the input time
    const [hours, minutes] = timeString.split(":").map(Number);

    // Create date object for today
    const date = new Date(dateVal);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    // Get the timezone offset
    const offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneVal,
      timeZoneName: "shortOffset",
    });

    // Get and clean the timezone offset
    const tzOffset = offsetFormatter.format(date).split(" ").pop() || "+00:00";
    const cleanOffset = tzOffset
      .replace("GMT", "")
      .replace(
        /(\+|-)(\d{1,2})(?::?)(\d{2})?/,
        (_, sign, hours, minutes = "00") => {
          return `${sign}${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
        }
      );

    // Format the date components (using the input time directly)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(hours).padStart(2, "0"); // Use input hours directly
    const minute = String(minutes).padStart(2, "0"); // Use input minutes directly
    const second = "00";

    // Return the formatted string
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${cleanOffset}`;
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
      const date = dayjs().format("YYYY-MM-DD");

      const payload =
        attendOption == "manual"
          ? {
              staff_id: id,
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
              staff_id: id,
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
      const gym_id = await retrieveGymId();
      const url = `api/staff-attendance/?gym_id=${gym_id}`;
      const response = await AxiosPrivate.post(url, payload).then(() =>
        invalidateAll()
      );
      toast.success("Attendance Posted successfully");
      getdata();
      setSelectedDate(new Date());
      setModalIsOpen(false);
    } catch (error: any) {
      if (
        error.response?.data?.error === "Staff has already checked in today."
      ) {
        toast.error("Staff has already checked in today");
      } else {
        toast.error("Something went wrong while Posting Attendance");
      }
      console.error(error);
    } finally {
      setAttendLoading(false);
      setManualAttendLoading(false);
    }
  };

  const calculateCheckoutTime = (checkin: string) => {
    // Make sure we have a valid time format by padding with :00 if needed
    const timeWithSeconds = checkin.length === 5 ? `${checkin}:00` : checkin;
    const today = dayjs().format("YYYY-MM-DD");
    const fullDateTime = `${today} ${timeWithSeconds}`;
    return dayjs(fullDateTime, "YYYY-MM-DD HH:mm:ss")
      .add(1, "hour")
      .format("HH:mm:ss");
  };

  const refresh = async () => {
    invalidateAll();
    getdata();
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
    setCheckinTime("");
  };

  // const getPreviousMonthLabel = () => {
  //   const newMonthValue = monthValue - 1;
  //   setMonthValue(newMonthValue);

  //   // Calculate the new month, handling year boundary
  //   const newMonth = dayjs().add(newMonthValue, "month").format("MM");
  //   setCurrentMonth(newMonth);
  //   monthRefresh(newMonth);
  // };

  // const getNextMonthLabel = () => {
  //   const newMonthValue = monthValue + 1;
  //   setMonthValue(newMonthValue);

  //   // Calculate the new month, handling year boundary
  //   const newMonth = dayjs().add(newMonthValue, "month").format("MM");
  //   setCurrentMonth(newMonth);
  //   monthRefresh(newMonth);
  // };

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

  const formatTime = (time: string | null) => {
    return time ? dayjs(time).format("hh:mm A") : "N/A";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" variant="spinner" />
      </div>
    );
  }

  return (
    <WidgetCard
      title="Attendance"
      titleClassName="leading-none"
      headerClassName="mb-3 lg:mb-4"
      className="max-w-2xl"
      action={
        <div className="flex items-center justify-end">
          <Tooltip content="Refresh Attendance " placement="bottom-end">
            <ActionIcon
              className="scale-90 p-0.5 "
              rounded="lg"
              onClick={() => refresh()}
            >
              <LucideRefreshCw />
            </ActionIcon>
          </Tooltip>
        </div>
      }
    >
      {monthLoad && (
        <div className="flex absolute min-w-[40%] min-h-[90%] items-center justify-center z-[99999]">
          <Loader size="xl" variant="threeDot" className="my-auto" />
        </div>
      )}
      <div className=" pt-5 border rounded-lg px-1">
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
          onChange={(value) => handleDateClick(value as Date)}
          className="job-schedule-calendar attendance-calender "
          minDate={dayjs().subtract(1, "year").toDate()}
          maxDate={dayjs().toDate()}
          view="month"
          // nextLabel={
          //   <div
          //     className="min-w-full min-h-full flex items-center justify-center"
          //     onClick={() => getNextMonthLabel()}
          //   >
          //     <PiArrowRight className="size-4" />
          //   </div>
          // }
          // prevLabel={
          //   <div
          //     className="min-w-full min-h-full flex items-center justify-center"
          //     onClick={() => getPreviousMonthLabel()}
          //   >
          //     <PiArrowLeft className="size-4 " />
          //   </div>
          // }
        />
      </div>
      {selectedInfo && (
        <div className="p-5 mt-4 bg-gray-100 rounded-lg grid gap-3">
          <Title as="h5" className="font-semibold">
            {dayjs(selectedInfo.date).format("MMMM D, YYYY")}
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
          <div className="grid grid-cols-2">
            <p className="text-sm font-medium text-gray-700  flex flex-nowrap gap-2 items-center">
              Check-in Time: {formatTime(selectedInfo.checkin_time)}
            </p>
            <p className="text-sm font-medium text-gray-700  flex flex-nowrap gap-2 items-center">
              Check-out Time: {formatTime(selectedInfo.checkout_time)}
            </p>
          </div>
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
    </WidgetCard>
  );
}
