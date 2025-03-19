import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { HeaderCell } from "@/components/table";
import Table from "@/components/rizzui/table/table";
import Pagination from "@core/ui/pagination";
import cn from "@core/utils/class-names";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ActionIcon,
  Button,
  Input,
  Loader,
  Modal,
  Select,
  Text,
  Title,
  Tooltip,
} from "rizzui";
import { useAttendance } from "./AttandanceContext";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import {
  formateDateValue,
  formatTimeValue,
  getTimeZoneVal,
} from "@/app/[locale]/auth/DateFormat";
import dayjs from "dayjs";
import { LucideRefreshCw } from "lucide-react";
import { isStaff } from "@/app/[locale]/auth/Staff";

const addOneHour = (timeString: string) => {
  if (!timeString) return ""; // Handle case when checkin time is not available
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours + 1, minutes); // Add one hour to check-in time
  const newHours = date.getHours().toString().padStart(2, "0");
  const newMinutes = date.getMinutes().toString().padStart(2, "0");
  return `${newHours}:${newMinutes}`;
};

type AttendanceData = {
  member_id: string;
  member_name: string;
  member_phone: string;
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
    dataIndex: "member_id",
    key: "member_id",
    width: 70,
    render: (member_id: any) => <Text>#{member_id}</Text>,
  },
  {
    title: <HeaderCell title="name" className=" text-sm font-semibold" />,
    dataIndex: "member_name",
    key: "staff",
    width: 200,
    render: (_: string, row: any) => (
      <figure className={cn("flex items-center gap-3 ")}>
        <figcaption className="grid gap-0.5">
          <Link href={`/member_profile/yk62-${row.member_id}-71he`}>
            <Text className="font-lexend text-sm text-nowrap text-clip font-medium text-gray-900  hover:text-primary">
              <Text> {row.member_name}</Text>
            </Text>
          </Link>
        </figcaption>
      </figure>
    ),
  },
  {
    title: <HeaderCell title="contact" className=" text-sm font-semibold" />,
    dataIndex: "member_phone",
    key: "member_id",
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
    width: 120,
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
    width: 100,
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

interface MemberAttendenceTableProps {
  selectedDate: string;
  setAttendanceSummary: React.Dispatch<
    React.SetStateAction<{
      total: number;
      absent: number;
      present: number;
    }>
  >;
  update: boolean;
}

const MemberAttendenceTable = () => {
  const { selectedDate, setAttendanceSummary, update } = useAttendance();
  const [data, setData] = useState<AttendanceData[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AttendanceData | null>(
    null
  );
  const rowsPerPage = 10;
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);
  const [checkoutTime, setCheckoutTime] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<string>("desc");
  const [column, setColumn] = useState<keyof AttendanceData>("member_id");

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

      const url = `/api/attendance/daily/?gym_id=${gymId}&${queryParams}`;
      const response = await AxiosPrivate.get(url, {
        id: newID(`memberAttendance-${gymId}-${queryParams}`),
      });
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const memberData = response.data.records[0];
      setData(
        memberData.members.map((member: any, index: number) => ({
          ...member,
          serialNumber: startIndex + index + 1,
        }))
      );
      setTotalMembers(memberData.present);
      setAttendanceSummary({
        total: memberData.total,
        present: memberData.present,
        absent: memberData.absent,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    invalidateAll();
    await fetchAttendanceData(selectedDate);
  };

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate, update, pageSizeVal]);

  const handleCheckOut = (data: AttendanceData) => {
    setSelectedMember(data);
    const defaultCheckoutTime = addOneHour(data.checkin_time);
    setCheckoutTime(defaultCheckoutTime);
    setModalIsOpen(true);
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
  const handleCheckoutConfirm = async () => {
    if (!selectedMember || !checkoutTime) {
      toast.error("Please enter a checkout time");
      return;
    }

    try {
      setLoading(true);
      const formattedDate = await formatDateTimeWithTimezone(
        selectedDate,
        checkoutTime
      );
      const date = dayjs().format("YYYY-MM-DD");

      const payload = {
        member_id: selectedMember.member_id,
        checkout_time: formattedDate,
        date: formateDateValue(new Date(selectedDate), "YYYY-MM-DD"),
      };
      const gymId = await retrieveGymId();
      const url = `/api/attendance/update_checkout/?gym_id=${gymId}`;

      await AxiosPrivate.patch(url, payload);
      invalidateAll();
      await fetchAttendanceData(selectedDate); // Fetch data only after successful checkout
      toast.success("Attendance updated successfully");
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating checkout time");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
    setSelectedMember(null);
    setCheckoutTime("");
  };

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
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end min-w-full px-4">
        <Tooltip content="Refresh Member's Attendance " placement="bottom-end">
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
          <Loader variant="threeDot" />
        </div>
      ) : (
        <Table
          data={data}
          columns={columns}
          scroll={{ y: 500 }}
          variant="minimal"
          className="text-sm mt-2 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 text-nowrap"
          // rowClassName="!dark:bg-inherit dark:text-gray-400 "
        />
      )}

      <div className="flex justify-between mt-4">
        <Select
          value={pageSizeVal}
          // size="sm"
          options={pageSizeOptions}
          placeholder="Items per page"
          className={"w-auto "}
          onChange={(option: any) => {
            setPageSizeVal(option.value);
            setPageSize(option.value);
          }}
          // labelClassName=""
          // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
        ></Select>
        <Pagination
          total={totalMembers}
          current={currentPage}
          onChange={handlePageChange}
          outline={false}
          rounded="md"
          variant="solid"
          color="primary"
          pageSize={pageSizeVal ?? 0}
        />
      </div>
      <Modal isOpen={modalIsOpen} onClose={handleModalClose}>
        <div className="p-5 space-y-3 ">
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
              {loading ? <Loader variant="threeDot" /> : "confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MemberAttendenceTable;
