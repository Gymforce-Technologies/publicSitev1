import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Avatar, Button, Input, Loader, Text, Title } from "rizzui";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import dayjs from "dayjs";
import {
  formateDateValue,
  getTimeZoneVal,
} from "@/app/[locale]/auth/DateFormat";
import ManIcon from "@public/webp/man-user-icon.webp";
import Image from "next/image";

interface PersonalData {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  image: string | null;
  type?: String;
}

interface Data {
  type: string;
  data: PersonalData;
}

interface AttendanceData extends Data {
  staff_id: string;
  datetime_punch: string;
  attendance_state: string;

  // source?: string;
  // location?: string;
}
interface AddAttendanceProps extends PersonalData {
  onClose: () => void;
  setUpdate?: any;
  update?: boolean;
  dateVal: string;
}
const getCurrentTime = () => {
  return dayjs().format("HH:mm");
};
const AddAttendance = ({
  id,
  name,
  image,
  phone,
  type,
  onClose,
  setUpdate,
  update,
  dateVal,
}: AddAttendanceProps) => {
  const {
    register,
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<AttendanceData>({
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);
  const [profileimage, setprofileImage] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string>(getCurrentTime());
  console.log("upate", update);

  const formatDateTimeWithTimezone = async (timeString: string) => {
    // Get the custom timezone
    const timeZoneVal = await getTimeZoneVal();
    console.log("User TimeZone", timeZoneVal);

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
    // const tzOffset = offsetFormatter.format(date).split(" ").pop() || "+00:00";
    // const cleanOffset = tzOffset
    //   .replace("GMT", "")
    //   .replace(
    //     /(\+|-)(\d{1,2})$/,
    //     (_, sign, num) => `${sign}${num.padStart(2, "0")}:00`
    //   );
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

  const onSubmit = async (data: AttendanceData) => {
    try {
      setLoading(true);
      const formattedDate = await formatDateTimeWithTimezone(checkInTime);
      const date = dayjs().format("YYYY-MM-DD");
      const payload =
        type === "staff"
          ? {
              staff_id: parseInt(data.data.id as string),
              datetime_punch: formattedDate,
              checkin_time: formattedDate,
              attendance_state: "checkin",
              date: formateDateValue(new Date(dateVal), "YYYY-MM-DD"),
            }
          : {
              member_id: parseInt(data.data.id as string),
              datetime_punch: formattedDate,
              checkin_time: formattedDate,
              attendance_state: "checkin",
              date: formateDateValue(new Date(dateVal), "YYYY-MM-DD"),
              // source: data.source,
              // location: data.location,
            };
      const gym_id = await retrieveGymId();
      const url =
        type === "staff"
          ? `api/staff-attendance/?gym_id=${gym_id}`
          : `api/attendance/?gym_id=${gym_id}`;
      const response = await AxiosPrivate.post(url, payload).then(() =>
        invalidateAll()
      );
      console.log(payload);
      toast.success("Attendance Posted successfully");
      console.log(update);
      setUpdate(!update);
      onClose();
    } catch (error: any) {
      if (
        error.response?.data?.error === "Staff has already checked in today."
      ) {
        toast.error("Staff has already checked in today");
      } else {
        toast.error("Something went Wrong while Posting Attendance ");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setSelectedData = () => {
    setValue("data.name", name);
    setValue("data.id", id);
    setValue("data.contact", phone);
    if (image) {
      setprofileImage(image);
    }
  };
  useEffect(() => {
    setSelectedData();
  }, []);
  return (
    <div className="flex flex-col gap-2 mt-5 p-7 rounded-md">
      <Title as="h4" className="">
        Add Attendence
      </Title>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div
          className="mt-6
        "
        >
          <div className="grid grid-cols-2 gap-y-6 gap-x-5 [&_label>span]:font-medium bg-primary-lighter/50 dark:bg-gray-100 p-6 rounded-xl shadow-md shadow-primary-lighter dark:shadow-none">
            <div className="flex flex-col gap-2 relative">
              <Image
                src={profileimage || ManIcon}
                className="w-[300px] h-[300px]"
                alt="profile"
                height={300}
                width={300}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Text className="font-semibold">Name :</Text>
              <Text>{name}</Text>
            </div>
            <div className="flex flex-col gap-2">
              <Text className="font-semibold">Phone :</Text>
              <Text>{phone}</Text>
            </div>
            <div className="flex flex-col gap-2">
              <Text className="font-semibold">State:</Text>
              <Text>CheckIn</Text>
            </div>
          </div>
          <Input
            label="CheckIn Time"
            type="time"
            className="p-3"
            value={checkInTime}
            onChange={(e: any) => setCheckInTime(e.target.value + ":00")}
          />
        </div>
        <div className="flex gap-5 justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button type="submit">
            {loading ? <Loader variant="threeDot" /> : "Post Attendance"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddAttendance;
