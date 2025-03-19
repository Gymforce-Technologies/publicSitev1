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
  Badge,
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
import {
  DemographicInfo,
  // getDemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";

import AddAttendance from "./AddAttendence";
import { useAttendance } from "./AttandanceContext";

import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import {
  formateDateValue,
  getTimeZoneVal,
} from "@/app/[locale]/auth/DateFormat";
import dayjs from "dayjs";
import { DatePicker } from "@core/ui/datepicker";
import { LucideRefreshCw } from "lucide-react";
import { isStaff } from "@/app/[locale]/auth/Staff";

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
          checked={selectedIds.includes(row.id)}
          onChange={() => {
            console.log(row.id);
            handleCheckboxChange(row.id);
          }}
        />
      </div>
    ),
  },
  {
    title: <HeaderCell title="ID" className=" text-sm font-semibold" />,
    dataIndex: "id",
    key: "id",
    width: 70,
    render: (id: any) => <Text>#{id}</Text>,
  },
  {
    title: <HeaderCell title="Name" className=" text-sm font-semibold" />,
    dataIndex: "name",
    key: "name",
    width: 200,
    render: (_: string, row: StaffInterface) => (
      <figure className={cn("flex items-center gap-3 ")}>
        <Avatar
          name={row.name || ""}
          src={
            row.staff_image !== null &&
            row.staff_image &&
            row.staff_image?.length > 0
              ? row.staff_image
              : "https://images.gymforce.in/man-user-circle-icon.png"
          }
        />
        <figcaption className="grid gap-0.5">
          <Link href={`/staff-section/staff-profile/st63-${row.id}-72fk`}>
            <Text className="font-lexend text-sm font-medium text-gray-900 hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Text className="font-lexend text-nowrap text-clip text-sm font-medium text-gray-900 hover:text-primary">
                  {row.name}
                </Text>
              </span>
            </Text>
          </Link>
          <Text className="text-[13px] text-gray-500">+{row.contact}</Text>
        </figcaption>
      </figure>
    ),
  },
  {
    title: <HeaderCell title="Staff Type" className=" text-sm font-semibold" />,
    dataIndex: "staff_type",
    key: "staff_type",
    width: 150,
    render: (staffType: string) => (
      <Text className="font-lexend text-sm font-medium text-gray-900">
        {staffType}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Status" className=" text-sm font-semibold" />,
    dataIndex: "status",
    key: "status",
    width: 150,
    render: (status: string) =>
      status?.toLowerCase() === "active" ? (
        <Badge variant="flat" color="success">
          Active
        </Badge>
      ) : (
        <Badge variant="flat" color="danger">
          InActive
        </Badge>
      ),
  },
  {
    title: <HeaderCell title="Actions" className="opacity-0" />,
    dataIndex: "action",
    key: "action",
    width: 150,
    render: (_: any, row: any) => (
      <div className="flex items-center justify-center gap-3  pr-3">
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
      </div>
    ),
  },
];

interface StaffInterface {
  id: string;
  contact: string; // Changed from phone
  staff_image?: string | null;
  name: string;
  staffType: string; // Changed from staff_type
  status?: string | null;
}

const AbsentStaffs = () => {
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
  const [membersList, setMemberList] = useState<StaffInterface[]>([]);
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
  const [filterby, setFilterBy] = useState<string>("date_specific");
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchAbsentStaffList = async (pageNumber: number = 1) => {
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
      if (filterby) {
        queryParams.append("filter_by", filterby);
        if (filterby === "date_specific") {
          queryParams.append("date", selectedDate);
        }
      }
      if (pageNumber) {
        queryParams.append("page", pageNumber.toString());
      }

      const response = await AxiosPrivate(
        `/api/list-staff-absentees/v2/?gym_id=${gymId}&${queryParams}`,
        {
          id: newID(`list-staff-absentees-${queryParams}`),
        }
      );
      const data = response.data;
      setTotalMembers(data.count);
      // console.log(data.results);
      const transformedData = data.results.map((staff: any, index: number) => ({
        id: staff.id.toString(),
        contact: staff.contact, // Changed from phone
        staff_image: staff.staff_image,
        name: staff.name || "N/A",
        staff_type: staff.staffType, // Changed from staff_type
        status: staff.status || null,
        isSelected: selectedIds.includes(staff.id.toString()),
        serialNumber: (pageNumber - 1) * rowsPerPage + index + 1,
      }));
      console.log(transformedData);
      setMemberList(transformedData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    invalidateAll();
    await fetchAbsentStaffList();
  };

  useEffect(() => {
    fetchAbsentStaffList();
  }, [selectedDate, update, pageSizeVal, filterby]);

  useEffect(() => {
    setMemberList((prevMembers) =>
      prevMembers.map((member) => ({
        ...member,
        isSelected: selectedIds.includes(member.id),
      }))
    );
    console.log(selectedIds);
  }, [selectedIds]);
  useEffect(() => {
    console.log(membersList);
    const currentPageMemberIds = membersList.map((member) => member.id);
    const allAreSelected = currentPageMemberIds.every((id) =>
      selectedIds.includes(id)
    );
    setAllSelected(allAreSelected);
  }, [selectedIds, membersList]);

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

  const fetchAttendanceData = async (date: string) => {
    try {
      const gymId = await retrieveGymId();

      const url = `/api/staff-attendance/daily/?gym_id=${gymId}&date=${date}`;

      // const token = getAccessToken();
      const response = await AxiosPrivate.get(url, {
        id: newID(`metricStaffAttendance-${gymId}-${date}`),
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
    fetchAbsentStaffList(pageNumber);
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    if (filterby && filterby !== "date_specific") {
      setSelectedDate(dayjs().format("YYYY-MM-DD"));
    }
  }, [filterby]);

  const handleCheckboxChange = (id: any) => {
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
    const currentPageMemberIds = membersList.map((member) => member.id);

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

  // const handleRowClick = (id: string) => {
  //   handleCheckboxChange(id);
  // };

  const formatDateTimeWithTimezone = async (timeString: string) => {
    // Get the custom timezone
    const timeZoneVal = await getTimeZoneVal();
    console.log("User TimeZone", timeZoneVal);

    // Parse the input time
    const [hours, minutes] = timeString.split(":").map(Number);

    // Create date object for today
    const date = new Date(selectedDate);
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

  const handlePostAttendance = async () => {
    try {
      const gym_id = await retrieveGymId();
      const currentTime = dayjs().format("HH:mm");
      const formatTime = await formatDateTimeWithTimezone(currentTime);
      const response = await AxiosPrivate.post(
        `/api/attendance/mark_bulk_attendance/?gym_id=${gym_id}`,
        {
          staff_ids: selectedIds,
          checkin_datetime: formatTime,
          date: dayjs(selectedDate).format("YYYY-MM-DD"),
        }
      ).then(() => invalidateAll());
      fetchAbsentStaffList();
      setCurrentPage(1);
      setUpdate(!update);
      toast.success("Staff Attendance Posted Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while posting Staff Attendance");
    }
  };
  useEffect(() => {
    console.log(selectedRow);
  }, [selectedRow]);
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
      auth,
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
              content="Staff's Absent for 3 days"
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
              content="Staff's Absent for 5 days"
              // size="sm"
              placement="bottom"
            >
              <Button
                variant={filterby !== "5" ? "flat" : "solid"}
                onClick={() => {
                  setFilterBy("5");
                }}
                className="text-nowrap"
              >
                5 days
              </Button>
            </Tooltip>
            {/* <Button>5 days</Button> */}
            <Tooltip
              content="Staff's Absent for a Week"
              // size="sm"
              placement="bottom"
            >
              <Button
                variant={filterby !== "7" ? "flat" : "solid"}
                onClick={() => {
                  setFilterBy("7");
                }}
                className="text-nowrap"
              >
                7 day
              </Button>
            </Tooltip>
            {/* <Button>1 week</Button> */}
            <Tooltip
              content="Staff's Absent for More than a Week"
              // size="sm"
              placement="bottom"
            >
              <Button
                variant={filterby !== "beyond" ? "flat" : "solid"}
                onClick={() => {
                  setFilterBy("beyond");
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
                setFilterBy("date_specific");
              }}
              maxDate={new Date()}
              className="max-w-44"
            />
            <Tooltip
              content="Refresh Staff's Attendance "
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
              setFilterBy("date_specific");
            }}
            maxDate={new Date()}
            className="max-w-44"
          />
          <Tooltip content="Refresh Staff's Attendance " placement="bottom-end">
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
      {/* {func === "Pay" && selectedRow && (
        <PaymentModal
          isOpen={selectedRow !== null}
          onUpdate={() => {
            fetchAbsentStaffList(currentPage);
            closeModal();
          }}
          membershipid={selectedRow?.membership_details[0]?.id}
        />
      )}
      {func === "Renew" && selectedRow && (
        <RenewModal
          onUpdate={() => {
            fetchAbsentStaffList(currentPage);
            closeModal();
          }}
          membershipId={selectedRow?.membership_details[0]?.id}
          package_name={selectedRow?.membership_details[0]?.package_name}
          func={func}
          end_date={selectedRow?.membership_details[0]?.end_date}
          member_id={selectedRow?.id}
        />
      )}
      {func === "Extend" && selectedRow && (
        <ExtendModal
          onUpdate={() => {
            fetchAbsentStaffList(currentPage);
            closeModal();
          }}
          membershipId={selectedRow?.membership_details[0]?.id}
          due_date={selectedRow?.membership_details[0]?.due_date}
        />
      )} */}
      <Modal
        isOpen={func === "Att" && selectedRow != null}
        onClose={() => setFunc(null)}
      >
        <AddAttendance
          id={selectedRow?.id}
          name={selectedRow?.name}
          image={selectedRow?.member_image}
          update={update}
          setUpdate={setUpdate}
          onClose={() => setFunc(null)}
          type={"staff"}
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

export default AbsentStaffs;
