import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { HeaderCell } from "@/components/table";
import Table from "@/components/rizzui/table/table";
// import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ActionIcon,
  Button,
  Empty,
  Input,
  Loader,
  Modal,
  Text,
  Title,
  Tooltip,
} from "rizzui";
// import TimePicker from "react-time-picker";
import Pagination from "@core/ui/pagination";
import { useAttendance } from "./AttandanceContext";
import { getPageSize } from "@/components/pageSize";
import {
  formateDateValue,
  formatTimeValue,
  getTimeZoneVal,
} from "@/app/[locale]/auth/DateFormat";
import dayjs from "dayjs";
import { LucideRefreshCw } from "lucide-react";
import { isStaff } from "@/app/[locale]/auth/Staff";
// import { set } from "lodash";

type AttendanceData = {
  staff_id: string;
  staff_name: string;
  staff_contact: string;
  gym_id: string;
  date: string;
  checkin_time: string;
  checkout_time: string;
  datetime_punch: string;
  attendance_state: string;
  location: string;
  duration: string;
  source: string;
  is_present: boolean;
};

const getColumns = ({
  handleCheckOut,
  auth,
  access,
}: {
  handleCheckOut: (data: any) => void;
  auth: boolean;
  access: boolean;
}) => [
  {
    title: <HeaderCell title="ID" className=" text-sm font-semibold" />,
    dataIndex: "serialNumber",
    key: "serialNumber",
    width: 70,
  },
  {
    title: <HeaderCell title="name" className=" text-sm font-semibold" />,
    dataIndex: "staff_name",
    key: "staff_id",
    width: 200,
    render: (name: string) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        {name}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="contact" className=" text-sm font-semibold" />,
    dataIndex: "staff_contact",
    key: "staff",
    width: 150,
    render: (phone: string) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        {phone}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="status" className=" text-sm font-semibold" />,
    dataIndex: "attendance_state",
    key: "id",
    width: 120,
    render: (status: string) => (
      <span
        className={`px-2 py-1 font-semibold rounded ${status === "Present" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
      >
        {status}
      </span>
    ),
  },
  {
    title: <HeaderCell title="check in" className=" text-sm font-semibold" />,
    dataIndex: "checkin_time",
    key: "checkin_time",
    width: 120,
    render: (time: string) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        {time ? formatTimeValue(time) : "---"}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="check out" className=" text-sm font-semibold" />,
    dataIndex: "checkout_time",
    key: "checkout_time",
    width: 200,
    render: (time: string) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        {time ? formatTimeValue(time) : "---"}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Actions" className="opacity-0" />,
    dataIndex: "action",
    key: "action",
    width: 120,
    render: (_: string, row: any) => (
      <Button
        onClick={() => {
          if (!auth && !access) {
            toast.error("You aren't allowed to make changes");
            return;
          }
          handleCheckOut(row);
        }}
        disabled={!!row.checkout_time}
        // className=" dark:border-gray-700"
      >
        CheckOut
      </Button>
    ),
  },
];

// interface StaffAttendenceTableProps {
//   selectedDate: string;
//   setAttendanceSummary: React.Dispatch<
//     React.SetStateAction<{
//       total: number;
//       absent: number;
//       present: number;
//     }>
//   >;
//   update: boolean;
// }

const StaffAttendenceTable = () => {
  const { selectedDate, setAttendanceSummary } = useAttendance();
  const [data, setData] = useState<AttendanceData[]>([]);
  const [order, setOrder] = useState<string>("desc");
  const [column, setColumn] = useState<keyof AttendanceData>("staff_id");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AttendanceData | null>(
    null
  );
  const [checkoutTime, setCheckoutTime] = useState<string | any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [totalStaff, setTotalStaff] = useState(0);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const formatDateTimeWithTimezone = async (
    dateVal: string,
    timeString: string
  ) => {
    // Get the custom timezone
    setIsLoading(false);
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
    // const cleanOffset = tzOffset
    //   .replace("GMT", "")
    //   .replace(
    //     /(\+|-)(\d{1,2})$/,
    //     (_, sign, num) => `${sign}${num.padStart(2, "0")}:00`
    //   );
    const cleanOffset = tzOffset
      .replace("GMT", "")
      .replace(
        /(\+|-)(\d{1,2})(?::?)(\d{2})?/,
        (_, sign, hours, minutes = "00") => {
          return `${sign}${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
        }
      );

    // Format the date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(hours).padStart(2, "0");
    const minute = String(minutes).padStart(2, "0");
    const second = "00";
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${cleanOffset}`;
  };

  const handleCheckoutConfirm = async (e: any) => {
    e.preventDefault();

    if (!selectedStaff || !checkoutTime) {
      toast.error("Please select a checkout time");
      return;
    }

    try {
      setIsLoading(true);
      const date = dayjs().format("YYYY-MM-DD");
      const formattedDate = await formatDateTimeWithTimezone(
        selectedDate,
        checkoutTime
      );

      const gymId = await retrieveGymId();
      const payload = {
        staff_id: selectedStaff.staff_id,
        checkout_time: formattedDate,
        date: formateDateValue(new Date(selectedDate), "YYYY-MM-DD"),
      };

      const url = `api/staff-attendance/update_checkout/?gym_id=${gymId}`;
      await AxiosPrivate.patch(url, payload);

      // Update local state
      setData((prevData) =>
        prevData.map((staff) =>
          staff.staff_id === selectedStaff.staff_id
            ? { ...staff, checkout_time: formattedDate }
            : staff
        )
      );
      invalidateAll();
      fetchAttendanceData(selectedDate);
      toast.success("Attendance updated successfully");
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating attendance");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchAttendanceData = async (date: string) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      const gymId = await retrieveGymId();
      if (pageSizeVal) {
        if (pageSizeVal !== 10) {
          queryParams.append("page_size", pageSizeVal.toString());
        }
      } else {
        const PageVal = getPageSize();
        if (PageVal !== "10") {
          queryParams.append("page_size", PageVal.toString());
        }
        setPageSizeVal(parseInt(PageVal));
      }
      if (date) {
        queryParams.append("date", date);
      }
      const response = await AxiosPrivate.get(
        `/api/staff-attendance/daily?gym_id=${gymId}&${queryParams}`,
        {
          id: newID(`attendance-staff-${gymId}-${queryParams}`),
        }
      );

      const staffData = response.data.records[0];
      setData(
        staffData.staff.map((member: any, index: number) => ({
          ...member,
          serialNumber: index * (pageSizeVal ?? 0) + 1,
        }))
      );
      setTotalStaff(staffData.present);
      setAttendanceSummary({
        total: staffData.total,
        present: staffData.present,
        absent: staffData.absent,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const resp = await isStaff();
        if (resp) {
          setAuth(!resp);
          await fetchPermissions();
        }
      } catch (error) {
        console.error("Error getting staff status:", error);
      }
    };
    getStatus();
  }, []);
  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["mainAttendanceManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, []);

  const refresh = async () => {
    invalidateAll();
    await fetchAttendanceData(selectedDate);
  };

  const handleCheckOut = (data: AttendanceData) => {
    setSelectedStaff(data);
    setIsLoading(false);
    setModalIsOpen(true);
  };

  useEffect(() => {
    const loadTimeZone = async () => {
      await getTimeZoneVal();
    };
    loadTimeZone();
  });

  const columns: any = React.useMemo(
    () => getColumns({ handleCheckOut, access, auth }),
    [order, column, formatTimeValue, auth, access]
  );

  const handleModalClose = () => {
    setModalIsOpen(false);
    setSelectedStaff(null);
    // setCheckoutTime(null);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex).map((member, index) => ({
      ...member,
      serialNumber: startIndex + index + 1,
    }));
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end min-w-full px-4">
        <Tooltip content="Refresh Staff Attendance " placement="bottom-end">
          <ActionIcon
            className="scale-90 p-0.5 "
            rounded="lg"
            onClick={() => refresh()}
          >
            <LucideRefreshCw />
          </ActionIcon>
        </Tooltip>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center my-4 w-full">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <Table
          data={paginatedData}
          columns={columns}
          scroll={{ y: 500 }}
          variant="minimal"
          className="text-sm mt-2 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 text-nowrap"
          // rowClassName="!dark:bg-inherit dark:text-gray-400 "
          emptyText={<Empty text="No Present Staff's" textClassName="mt-1" />}
        />
      )}
      <div className="flex justify-end mt-4">
        <Pagination
          total={totalStaff}
          current={currentPage}
          onChange={handlePageChange}
          outline={false}
          rounded="md"
          variant="solid"
          color="primary"
        />
      </div>
      <Modal isOpen={modalIsOpen} onClose={handleModalClose}>
        <div className="p-5 space-y-3">
          <Title as="h4" className="">
            Select Checkout Time
          </Title>
          <Input
            type="time"
            value={checkoutTime}
            onChange={(e) => setCheckoutTime(e.target.value)}
            className="border-none p-2 rounded"
          />
          <div className="flex gap-2 mt-4 justify-end">
            <Button onClick={handleModalClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCheckoutConfirm}>
              {isLoading ? <Loader variant="threeDot" /> : "confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffAttendenceTable;
