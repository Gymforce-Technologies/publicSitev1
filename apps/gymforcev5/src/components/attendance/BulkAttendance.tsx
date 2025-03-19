import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import Pagination from "@/components/pagination";
import { HeaderCell } from "@/components/table";
import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  Input,
  Loader,
  Modal,
  Popover,
  Select,
  Text,
  Title,
  Tooltip,
} from "rizzui";
import React, {
  useCallback,
  useEffect,
  useState,
  // SetStateAction,
  // Dispatch,
} from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Table from "@/components/rizzui/table/table";
import cn from "@core/utils/class-names";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import getDueBadge from "@/components/dueBadge";
import { MdOutlineDateRange, MdPayments } from "react-icons/md";
import { LucideRefreshCw, MoreVertical, PhoneIcon } from "lucide-react";
import {
  DemographicInfo,
  // getDemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { PiWhatsappLogoBold } from "react-icons/pi";
import { RiLoopLeftLine } from "react-icons/ri";
// import { PaymentModal } from "./PaymentModal";
// import { IoCheckmarkCircle } from "react-icons/io5";
// import AddAttendance from "./AddAttendence";
import { useAttendance } from "./AttandanceContext";
// import { ExtendModal, RenewModal } from "@/components/member-list/Modals";
const AddAttendance = dynamic(() => import("./AddAttendence"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="spinner" />
    </div>
  ),
});

const PaymentModal = dynamic(
  () => import("./PaymentModal").then((mod) => mod.PaymentModal),
  {
    loading: () => (
      <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
        <Loader size="xl" variant="spinner" />
      </div>
    ),
  }
);

const ExtendModal = dynamic(
  () =>
    import("@/components/member-list/Modals").then((mod) => mod.ExtendModal),
  {
    loading: () => (
      <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
        <Loader size="xl" variant="spinner" />
      </div>
    ),
  }
);
const RenewModal = dynamic(
  () => import("@/components/member-list/Modals").then((mod) => mod.RenewModal),
  {
    loading: () => (
      <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
        <Loader size="xl" variant="spinner" />
      </div>
    ),
  }
);

import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import DateCell from "@core/ui/date-cell";
import {
  formateDateValue,
  getDateFormat,
  getTimeZoneVal,
} from "@/app/[locale]/auth/DateFormat";
import dayjs from "dayjs";
import { DatePicker } from "@core/ui/datepicker";
import dynamic from "next/dynamic";
import { isStaff } from "@/app/[locale]/auth/Staff";
import Image from "next/image";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";

const getColumns = (
  order: string,
  column: string,
  setOpenPopoverId: (id: string | null) => void,
  setSelectedRow: any,
  handleCheckboxChange: (id: string) => any,
  onSelectAllChange: () => void, // New handler for the header checkbox
  allSelected: boolean, // To track if all rows are selected
  selectedIds: string[],
  setFunc: any,
  demograficInfo: any,
  openPopoverId: any,
  auth: boolean,
  access: boolean
) => [
  {
    title: (
      <Checkbox
        variant="flat"
        checked={allSelected}
        onChange={onSelectAllChange}
        className="ps-1.5"
      />
    ),
    dataIndex: "checked",
    key: "checked",
    width: 50,
    render: (_: any, row: any) => (
      <div className="inline-flex cursor-pointer ps-1.5">
        <Checkbox
          variant="flat"
          checked={selectedIds.includes(row.member_id)}
          onChange={() => {
            console.log(row.member_id);
            handleCheckboxChange(row.member_id);
          }}
        />
      </div>
    ),
  },
  {
    title: <HeaderCell title="ID" className=" text-sm font-semibold" />,
    dataIndex: "member_id",
    key: "member_id",
    width: 70,
    render: (member_id: any) => <Text>#{member_id}</Text>,
  },
  {
    title: <HeaderCell title="Name" className=" text-sm font-semibold" />,
    dataIndex: "name",
    key: "name",
    width: 200,
    render: (_: string, row: any) => (
      <figure className={cn("flex items-center gap-3 ")}>
        {/* <Avatar
          name={row.name}
          src={
            row.member_image !== null
              ? row.member_image
              : row?.gender && row?.gender[0]?.toLowerCase() === "f"
                ? "https://images.gymforce.in/woman-user-circle-icon.png"
                : "https://images.gymforce.in/man-user-circle-icon.png"
          }
        /> */}
        <Image
          alt={row.name}
          src={
            row.member_image !== null
              ? row.member_image
              : row?.gender && row?.gender[0]?.toLowerCase() === "f"
                ? WomanIcon
                : ManIcon
          }
          height={40}
          width={40}
          className="size-10 rounded-full"
        />
        <figcaption className="grid gap-0.5">
          <Link href={`/member_profile/yk62-${row.member_id}-71he`}>
            <Text className="font-lexend text-sm font-medium text-gray-900 hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Text className="font-lexend text-nowrap text-clip text-sm font-medium text-gray-900  hover:text-primary">
                  {" "}
                  {row.name}
                </Text>
              </span>
            </Text>
          </Link>
          <Text className="text-[13px] text-gray-500">{row.phone}</Text>
        </figcaption>
      </figure>
    ),
  },
  // {
  //   title: <HeaderCell title="Contact" className=" text-sm font-semibold" />,
  //   dataIndex: "phone",
  //   key: "phone",
  //   width: 200,
  //   render: (contact: any) => (
  //     <Text className="font-lexend text-sm font-medium text-gray-900  ">
  //       {contact}
  //     </Text>
  //   ),
  // },
  {
    title: <HeaderCell title="package" className=" text-sm font-semibold" />,
    dataIndex: "membership_details",
    key: "membership_details",
    width: 150,
    render: (_: string, row: any) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        {row.membership_details?.package_name || "Invalid Package"}
      </Text>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Expiry Date"
        className=" text-sm font-semibold text-nowrap"
      />
    ),
    dataIndex: "membership_details",
    key: "membership_details",
    width: 150,
    render: (_: string, row: any) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        {row?.membership_details?.end_date ? (
          <DateCell
            date={new Date(row?.membership_details?.end_date)}
            timeClassName="hidden"
            dateFormat={getDateFormat()}
          />
        ) : (
          "N/A"
        )}
      </Text>
    ),
  },
  // {
  //   title: <HeaderCell title="validity" className=" text-sm font-semibold" />,
  //   dataIndex: "membership_details",
  //   key: "phone",
  //   width: 150,
  //   render: (_: string, row: any) => (
  //     <Text className="font-lexend text-sm font-medium text-gray-900  ">{`${row?.membership_details?.validity || "0"} Days`}</Text>
  //   ),
  // },
  {
    title: <HeaderCell title="due" className=" text-sm font-semibold" />,
    dataIndex: "membership_details",
    key: "phone",
    width: 100,
    render: (_: string, row: any) => (
      <Text>
        {getDueBadge({
          dueAmount: row?.membership_details?.due,
          symbol: demograficInfo?.currency_symbol,
        })}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Actions" className="opacity-0" />,
    dataIndex: "action",
    key: "action",
    width: 150,
    render: (_: any, row: any) => (
      <div className="flex items-center justify-end gap-3  pr-3">
        <Button
          onClick={() => {
            if (!auth && !access) {
              toast.error("You aren't allowed to make changes");
              return;
            }
            setFunc("Att");
            setSelectedRow(row);
          }}
          size="sm"
        >
          Mark
        </Button>
        <Popover
          isOpen={openPopoverId === row.member_id}
          setIsOpen={(isOpen) =>
            setOpenPopoverId(isOpen ? row.member_id : null)
          }
        >
          <Popover.Trigger>
            <ActionIcon
              onClick={() => {
                // if(!isValid){
                //   toast.error("Please Subscribe to Proceed Further");
                //   router.push('/centersettings/billing');
                //   return;
                //   }
                setOpenPopoverId(
                  openPopoverId === row.member_id ? null : row.member_id
                );
              }}
              className="action-icon-wrapper"
              variant="text"
            >
              <MoreVertical size="20" />
            </ActionIcon>
          </Popover.Trigger>
          <Popover.Content>
            <div className="flex flex-col justify-start m-[2]">
              {row?.membership_details?.due > 0 && (
                <Button
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    setFunc("Pay");
                    setOpenPopoverId(row.member_id);
                    setSelectedRow(row);
                  }}
                  variant="text"
                  className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdPayments size={20} />
                  <Text>Pay Dues</Text>
                </Button>
              )}
              {row?.membership_details?.due > 0 && (
                <Button
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    setFunc("Extend");
                    setOpenPopoverId(row.member_id);
                    setSelectedRow(row);
                  }}
                  variant="text"
                  className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdOutlineDateRange size={20} />
                  <Text>Extend Due Date</Text>
                </Button>
              )}
              <Button
                variant="text"
                onClick={() => {
                  if (row?.membership_details?.due) {
                    toast.error(
                      "Renewal can't proceed until the due payment is made"
                    );
                    return;
                  }
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  setFunc("Renew");
                  setOpenPopoverId(row.member_id);
                  setSelectedRow(row);
                }}
                className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
              >
                <RiLoopLeftLine size={20} />
                <Text>Renew</Text>
              </Button>
              <Link href={`tel:${row.phone}`}>
                <Button
                  variant="text"
                  className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                >
                  <PhoneIcon size={20} />
                  <Text>Call</Text>
                </Button>
              </Link>
              <Link
                href={`https://wa.me/${row.phone}?text=Hi ${row.name}`}
                target="_blank"
              >
                <Button
                  variant="text"
                  className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                >
                  <PiWhatsappLogoBold size={20} />
                  <Text>WhatsApp</Text>
                </Button>
              </Link>
            </div>
          </Popover.Content>
        </Popover>
      </div>
    ),
  },
];

interface MemberInterface {
  id: number;
  localid: string;
  member_id: string;
  phone: string;
  member_image?: string | null;
  name: string;
  membership_details: {
    id: number;
    due: number;
    end_date: string;
    package_name: string;
    package_type: string;
  }[];
}

const BulkAttendance = () => {
  const {
    selectedDate,
    setAttendanceSummary,
    update,
    setUpdate,
    setSelectedDate,
  } = useAttendance();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [membersList, setMemberList] = useState<MemberInterface[]>([]);
  const [order, setOrder] = React.useState<string>("desc");
  const [column, setColumn] = React.useState<string>("");
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [func, setFunc] = useState<string | null>(null);
  const rowsPerPage = 10;
  const [allSelected, setAllSelected] = useState(false);
  const [demograficInfo, setDemograficInfo] = useState<DemographicInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [filterby, setFilterBy] = useState<string>("date_specific");
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchAbsentMembersList = async (
    pageNumber: number = 1,
    filterby = "date_specific"
  ) => {
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const queryParams = new URLSearchParams();

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

      if (pageNumber) {
        queryParams.append("page", pageNumber.toString());
      }
      if (filterby) {
        queryParams.append("filter_by", filterby);
        if (filterby === "date_specific") {
          queryParams.append("date", selectedDate);
        }
      }
      const response = await AxiosPrivate(
        `/api/list-member-absentees/v2/?gym_id=${gymId}&${queryParams}`,
        {
          id: newID(`list-member-absentees-${queryParams}`),
        }
      );
      const data = response.data;
      setTotalMembers(data.count);
      console.log(data);
      setMemberList(
        data.results.map((member: MemberInterface, index: number) => ({
          ...member,
          member_id: member.id.toString(), // Convert id to string for consistency
          isSelected: selectedIds.includes(member.id.toString()),
          serialNumber: (pageNumber - 1) * rowsPerPage + index + 1,
        }))
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    invalidateAll();
    await fetchAbsentMembersList(1, filterby);
  };

  useEffect(() => {
    fetchAbsentMembersList(1, filterby);
  }, [selectedDate, update, pageSizeVal, filterby]);

  useEffect(() => {
    setMemberList((prevMembers) =>
      prevMembers.map((member) => ({
        ...member,
        isSelected: selectedIds.includes(member.member_id),
      }))
    );
    console.log(selectedIds);
  }, [selectedIds]);
  useEffect(() => {
    console.log(membersList);
    const currentPageMemberIds = membersList.map((member) => member.member_id);
    const allAreSelected = currentPageMemberIds.every((id) =>
      selectedIds.includes(id)
    );
    setAllSelected(allAreSelected);
  }, [selectedIds, membersList]);

  const fetchAttendanceData = async (date: string) => {
    try {
      const gymId = await retrieveGymId();
      const attendanceDate =
        filterby === "date_specific" ? date : dayjs().format("YYYY-MM-DD");
      const url = `/api/attendance/daily/?gym_id=${gymId}&date=${attendanceDate}`;

      // const token = getAccessToken();
      const response = await AxiosPrivate.get(url, {
        id: newID(`metricAttendance-${gymId}-${date}`),
      });

      const memberData = response.data.records[0];
      setAttendanceSummary({
        total: memberData.total,
        present: memberData.present,
        absent: memberData.absent,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate, update]);

  const handlePageChange = async (pageNumber: number) => {
    // try {
    //   const response = await AxiosPrivate.get(`/api/list-member-absentees/?date=${selectedDate}`,{
    //     id:newID(`list-member-absentees-${pageNumber}`)
    //   });
    //   const data = response.data;
    //   setTotalMembers(data.count);
    //   setMemberList(data.results.map((member: MemberInterface,index:number) => ({
    //     ...member,
    //     serialNumber: (pageNumber - 1) * rowsPerPage + index + 1,
    //     isSelected: selectedIds.includes(member.id),
    //   })));
    //   setAllSelected(false);
    //   setCurrentPage(pageNumber);
    // } catch (error) {
    //   console.log(error);
    // }
    fetchAbsentMembersList(pageNumber);
    setCurrentPage(pageNumber);
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prevSelectedIds) => {
      const isSelected = prevSelectedIds.includes(id);
      const newSelectedIds = isSelected
        ? prevSelectedIds.filter((item) => item !== id)
        : [...prevSelectedIds, id];
      return newSelectedIds;
    });
  };
  const handleSelectAllChange = () => {
    console.log("current members", membersList);
    const currentPageMemberIds = membersList.map((member) => member.member_id);

    if (allSelected) {
      // Unselect all currently visible members on this page
      setSelectedIds((prevSelectedIds) =>
        prevSelectedIds.filter((id) => !currentPageMemberIds.includes(id))
      );
    } else {
      // Select all currently visible members on this page
      setSelectedIds((prevSelectedIds) => {
        const newSelectedIds = [...prevSelectedIds];
        currentPageMemberIds.forEach((id) => {
          if (!newSelectedIds.includes(id)) {
            newSelectedIds.push(id);
          }
        });
        return newSelectedIds;
      });
    }

    // Toggle the allSelected state for the current page
    setAllSelected(!allSelected);
  };

  const formatDateTimeWithTimezone = async (timeString: string) => {
    // Get the custom timezone
    const timeZoneVal = await getTimeZoneVal();
    console.log("User TimeZone", timeZoneVal);

    // Parse the input time
    const [hours, minutes] = timeString.split(":").map(Number);

    // Create date object for today
    const date =
      filterby === "date_specific" ? new Date(selectedDate) : new Date();
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

  // const handleRowClick = (id: string) => {
  //   handleCheckboxChange(id);
  // };

  const handlePostAttendance = async () => {
    try {
      const gym_id = await retrieveGymId();
      const currentTime = dayjs().format("HH:mm");
      const formatTime = await formatDateTimeWithTimezone(currentTime);
      const attendanceDate =
        filterby === "date_specific"
          ? dayjs(selectedDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD");
      const response = await AxiosPrivate.post(
        `/api/attendance/mark_bulk_attendance/?gym_id=${gym_id}`,
        {
          member_ids: selectedIds,
          checkin_datetime: formatTime,
          date: attendanceDate,
        }
      ).then(() => invalidateAll());
      fetchAbsentMembersList();
      setCurrentPage(1);
      setUpdate(!update);
      toast.success("Attendance Posted Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while posting Attendance");
    }
  };
  const handleFilter = async (filter: string) => {
    setFilterBy(filter);
    fetchAbsentMembersList(1, filter);
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
    if (filterby && filterby !== "date_specific") {
      setSelectedDate(dayjs().format("YYYY-MM-DD"));
    }
  }, [filterby]);

  const columns: any = React.useMemo(
    () =>
      getColumns(
        order,
        column,
        setOpenPopoverId,
        setSelectedRow,
        handleCheckboxChange,
        handleSelectAllChange,
        allSelected,
        selectedIds,
        setFunc,
        demograficInfo,
        openPopoverId,
        auth,
        access
      ),
    [
      order,
      column,
      selectedIds,
      currentPage,
      allSelected,
      handleSelectAllChange,
      handleCheckboxChange,
      access,
    ]
  );
  const fetchDemographicInfo = useCallback(async () => {
    try {
      const geoinfo = await retrieveDemographicInfo();
      setDemograficInfo(geoinfo);
      console.log("loc", geoinfo);
    } catch (error) {
      console.error("Error fetching demographic info:", error);
    }
  }, []);
  useEffect(() => {
    fetchDemographicInfo();
  }, []);
  const closeModal = () => {
    setOpenPopoverId(null);
    setSelectedRow(null);
  };
  return (
    <div className="space-y-4">
      <div className="mt-1 mb-3 min-w-full flex items-center justify-between">
        <div className="flex lg:items-center gap-3 flex-col lg:flex-row *:scale-95 ">
          <Text className="lg:hidden text-base font-bold text-gray-900">
            Filter Absentees:{" "}
          </Text>
          <div className="flex items-center gap-4 ">
            <Text className="max-lg:hidden text-base font-bold text-gray-900">
              Filter Absentees:{" "}
            </Text>
            <Tooltip
              content="Members Absent for 3 days"
              // size="sm"
              placement="bottom"
            >
              <Button
                variant={filterby !== "3" ? "flat" : "solid"}
                onClick={() => {
                  setFilterBy("3");
                }}
                className="text-nowrap"
              >
                3 days
              </Button>
            </Tooltip>
            {/* 3, 5,7, beyond, date_specific */}
            <Tooltip
              content="Members Absent for 5 days"
              // size="sm"
              placement="bottom"
            >
              <Button
                variant={filterby !== "5" ? "flat" : "solid"}
                onClick={() => {
                  handleFilter("5");
                }}
                className="text-nowrap"
              >
                5 days
              </Button>
            </Tooltip>
            {/* <Button>5 days</Button> */}
            <Tooltip
              content="Members Absent for a Week"
              // size="sm"
              placement="bottom"
            >
              <Button
                variant={filterby !== "7" ? "flat" : "solid"}
                onClick={() => {
                  handleFilter("7");
                }}
                className="text-nowrap"
              >
                7 day
              </Button>
            </Tooltip>
            {/* <Button>1 week</Button> */}
            <Tooltip
              content="Members Absent for More than a Week"
              // size="sm"
              placement="bottom"
            >
              <Button
                variant={filterby !== "beyond" ? "flat" : "solid"}
                onClick={() => {
                  handleFilter("beyond");
                }}
                className="text-nowrap"
              >
                Beyond
              </Button>
            </Tooltip>
          </div>
          <div className="flex lg:hidden items-center gap-4 justify-end ">
            <Text className=" font-semibold text-gray-900">By Date</Text>
            <DatePicker
              // type="date"
              // placeholder="select date"

              placeholderText="Select Date"
              value={formateDateValue(new Date(selectedDate))}
              onChange={(date: any) => {
                setSelectedDate(
                  formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                );
                handleFilter("date_specific");
              }}
              maxDate={new Date()}
              className="max-w-44"
            />
            <Tooltip
              content="Refresh Member's Attendance "
              placement="bottom-end"
            >
              <ActionIcon
                className="scale-90 p-0.5 "
                rounded="lg"
                onClick={() => refresh()}
              >
                <LucideRefreshCw />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 ">
          <Text className=" font-semibold text-gray-900">By Specific Date</Text>
          <DatePicker
            // type="date"
            // placeholder="select date"

            placeholderText="Select Date"
            value={formateDateValue(new Date(selectedDate))}
            onChange={(date: any) => {
              setSelectedDate(
                formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
              );
              handleFilter("date_specific");
            }}
            maxDate={new Date()}
            className="max-w-44"
          />
          <Tooltip
            content="Refresh Member's Attendance "
            placement="bottom-end"
          >
            <ActionIcon
              className="scale-90 p-0.5 "
              rounded="lg"
              onClick={() => refresh()}
            >
              <LucideRefreshCw />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center my-4 w-full">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <Table
          data={membersList}
          columns={columns}
          scroll={{ y: 500 }}
          variant="minimal"
          className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 text-nowrap"
          // rowClassName="!dark:bg-inherit dark:text-gray-400 "
        />
      )}

      <div className="flex justify-between mt-4">
        <Select
          value={pageSizeVal}
          // size="sm"
          options={pageSizeOptions}
          placeholder="Items per page"
          className={"w-auto"}
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
      <div className="flex justify-end mt-4">
        <Button onClick={handlePostAttendance}>Mark Attendance</Button>
      </div>
      {func === "Pay" && selectedRow && (
        <PaymentModal
          isOpen={selectedRow !== null}
          onUpdate={() => {
            fetchAbsentMembersList(currentPage);
            closeModal();
          }}
          membershipid={selectedRow?.membership_details?.id}
        />
      )}
      {func === "Renew" && selectedRow && (
        <RenewModal
          onUpdate={() => {
            fetchAbsentMembersList(currentPage);
            closeModal();
          }}
          membershipId={selectedRow?.membership_details?.id}
          package_name={selectedRow?.membership_details?.package_name}
          func={func}
          end_date={selectedRow?.membership_details?.end_date}
          member_id={selectedRow?.id}
        />
      )}
      {func === "Extend" && selectedRow && (
        <ExtendModal
          onUpdate={() => {
            fetchAbsentMembersList(currentPage);
            closeModal();
          }}
          membershipId={selectedRow?.membership_details?.id}
          due_date={selectedRow?.membership_details?.due_date}
        />
      )}
      <Modal
        isOpen={func === "Att" && selectedRow != null}
        onClose={() => setFunc(null)}
      >
        <AddAttendance
          id={selectedRow?.member_id}
          name={selectedRow?.name}
          image={selectedRow?.member_image}
          update={update}
          setUpdate={setUpdate}
          onClose={() => setFunc(null)}
          type={"member"}
          phone={selectedRow?.phone}
          dateVal={
            filterby === "date_specific"
              ? selectedDate
              : dayjs().format("YYYY-MM-DD")
          }
        />
      </Modal>
    </div>
  );
};

export default BulkAttendance;
