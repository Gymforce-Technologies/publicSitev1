"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import OrderTable from "@/components/member-list/table";
import {
  Title,
  Select,
  Input,
  Button,
  Drawer,
  Text,
  Announcement,
} from "rizzui";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiMagnifyingGlassBold,
} from "react-icons/pi";
import WidgetCard from "@core/components/cards/widget-card";
import Pagination from "@core/ui/pagination";
import { FilterIcon, ListPlusIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { filterOptions } from "../../app/[locale]/(home)/Filter";
import { DatePicker } from "@core/ui/datepicker";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import MetricCard from "@core/components/cards/metric-card";
import {
  FaList,
  FaUserCheck,
  FaUserClock,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa6";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import { DeleteAllModal } from "@/components/DeleteAll";
import { formateDateValue } from "../../app/[locale]/auth/DateFormat";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { MdOutlineGridView } from "react-icons/md";
import MembersCardList from "./members/MembersCardList";
import { isStaff } from "@/app/[locale]/auth/Staff";

export type Member = {
  id: number;
  name: string;
  phone: string;
  // age: number;
  // email: string;
  // date_of_birth: string;
  gender: string;
  gym_id: string;
  member_id: string;
  // joining_date: string;
  status: string;
  membership: string | null;
  exp_date: string;
  // start_date: string;
  due_date: string;
  due: number;
  membership_id: string | null;
  package_id: string;
  package_name?: string;
  // membership_price?: number;
  // membership_discount?: number;
  member_image?: string;
  paid_amount: number;
};

interface Filters {
  status: string;
  dateRange: string;
  memberName: string;
  startDate: string;
  endDate: string;
}

export interface SortProps {
  sortBy: keyof Member | null;
  sortOrder: "asc" | "desc" | null;
}

export default function MemberListSection() {
  const [allMembersData, setAllMembersData] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: "Active",
    dateRange: filterOptions[0].value,
    memberName: "",
    startDate: "",
    endDate: "",
  });
  const params = useSearchParams();
  const pathname = usePathname();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const router = useRouter();
  const [showrestore, setShowRestore] = useState(false);
  const [sort, setSort] = useState<SortProps>({
    sortBy: null,
    sortOrder: null,
  });
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [memberListInfo, setmemberListInfo] = useState([
    {
      title: "Total Members",
      value: 0,
      icon: <FaUsers size={18} />,
      req: "all",
    },
    {
      title: "Active Members",
      value: 0,
      icon: <FaUserCheck size={18} />,
      req: "active",
    },
    {
      title: "Upcoming Members",
      value: 0,
      icon: <FaUserPlus size={18} />,
      req: "upcoming",
    },
    {
      title: "Expired Members",
      value: 0,
      icon: <FaUserClock size={18} />,
      req: "expired",
    },
    {
      title: "Present Members",
      value: 0,
      icon: <FaUserClock size={18} />,
      req: "present",
    },
  ]);
  const [view, setView] = useState<"grid" | "table">("table");
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [access, setAccess] = useState<boolean>(true);
  const [auth, setAuth] = useState<boolean>(true);

  const [packageType, setPackageType] = useState("");
  const handlePackageType = (value: string) => {
    setPackageType((prevPackageType) => {
      const newPackageType =
        prevPackageType.toLowerCase() === value.toLowerCase()
          ? ""
          : value.toLowerCase();
      fetchMemberData(1, filters, newPackageType);
      return newPackageType;
    });
  };

  const fetchMemberData = useCallback(
    async (
      pageNumber: number,
      currentFilters: Filters,
      packageType: string
    ) => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        // if (currentFilters.status === "Active") {
        //   queryParams.append("deleted", "false");
        //   setShowRestore(false);
        // } else {
        //   queryParams.append("deleted", "true");
        //   setShowRestore(true);
        // }
        // if (currentFilters.dateRange){
        //   if(currentFilters.dateRange!=='all'){
        //     queryParams.append("date_range", currentFilters.dateRange);
        //   }
        // }
        if (packageType && packageType !== "all") {
          queryParams.append("filter_type", packageType);
        }
        if (
          (!packageType || packageType === "all") &&
          currentFilters.memberName
        ) {
          queryParams.append("search", currentFilters.memberName);
        }
        if (
          (!packageType || packageType === "all") &&
          // currentFilters.dateRange !== "all" &&
          currentFilters.startDate
        ) {
          queryParams.append("start_date", currentFilters.startDate);
        }
        if (
          (!packageType || packageType === "all") &&
          // currentFilters.dateRange !== "all" &&
          currentFilters.endDate
        ) {
          const currentEndDate = new Date(currentFilters.endDate);
          const nextDate = new Date(currentEndDate);
          nextDate.setDate(nextDate.getDate() + 1);
          const formattedNextDate = nextDate.toISOString().split("T")[0];
          queryParams.append("end_date", formattedNextDate);
        }
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
        queryParams.append("page", pageNumber.toString());

        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `api/list-members/v3/?gym_id=${gymId}&${queryParams}`,
          {
            id: newID(`member-request-${queryParams}-${pageNumber}`),
          }
        );
        console.log(resp.data);
        const transformedData: Member[] = resp.data.results.members.map(
          (item: any) => ({
            id: item.localid,
            name: item.name,
            phone: item.phone,
            gym_id: gymId,
            member_id: item.id,
            joining_date: item.joining_date,
            member_image: item.member_image,
            gender:
              item.gender &&
              item.gender[0].toUpperCase() + item.gender.slice(1),
            status: item.status,
            membership: item.membership?.id,
            exp_date: item.membership?.end_date,
            package_id: item.membership?.package_id,
            due: item.membership?.due,
            package_name: item.membership?.package_name,
            membership_id: item.membership?.id,
            paid_amount: item.membership?.paid_amount,
          })
        );
        if (packageType === "all" || packageType === "") {
          setmemberListInfo((prevState) =>
            prevState.map((item) => {
              let newValue = 0;
              switch (item.title) {
                case "Total Members":
                  newValue = resp.data.results?.total_members || 0;
                  break;
                case "Active Members":
                  newValue = resp.data.results?.total_active_members || 0;
                  break;
                case "Upcoming Members":
                  newValue = resp.data.results?.total_upcoming_members || 0;
                  break;
                case "Expired Members":
                  newValue = resp.data.results?.total_expired_members || 0;
                  break;
                case "Present Members":
                  newValue = resp.data.results?.today_present_count || 0;
                  break;
              }
              return { ...item, value: newValue };
            })
          );
        }
        setTotalMembers(resp.data.count);
        setAllMembersData(transformedData);
        setCurrentPage(pageNumber);
      } catch (error) {
        console.error("Error fetching member data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSizeVal, packageType, filters]
  );

  const handleHeaderSort = (headerKey: keyof Member | null) => {
    setSort((prev) => ({
      sortBy: headerKey,
      sortOrder:
        prev.sortBy !== headerKey || prev.sortBy === null
          ? "asc"
          : prev.sortOrder === "asc"
            ? "desc"
            : "asc",
    }));
  };

  const SortData = (
    data: Member[],
    sortBy: keyof Member | null,
    sortOrder: "asc" | "desc" | null
  ) => {
    if (!sortBy || !sortOrder || !data?.length) return data;

    return [...data].sort((a, b) => {
      const valueA = sortBy ? (a[sortBy] ?? "") : "";
      const valueB = sortBy ? (b[sortBy] ?? "") : "";

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  useEffect(() => {
    // Sort data whenever sort state changes
    const sortedData = SortData(allMembersData, sort.sortBy, sort.sortOrder);
    setAllMembersData(sortedData);
  }, [sort]);

  useEffect(() => {
    const getInfo = async () => {
      const resp = await isStaff();
      if (resp) {
        setAuth(!resp);
        await fetchPermissions();
      }
    };
    getInfo();
  }, []);

  useEffect(() => {
    const initializeAndFetch = async () => {
      if (params.get("filter") && params.get("status")) {
        const filter = params.get("filter");
        const status = params.get("status");
        const { startDate, endDate, infoText } = getCurrentDateRange(filter!);

        const newFilters = {
          dateRange: filter!,
          memberName: "",
          startDate: startDate,
          endDate: endDate,
          status: filters.status,
        };

        setFilters((prev) => ({
          ...newFilters,
        }));

        setDateRangeInfo(infoText);
        setPackageType(status!);
        await fetchMemberData(currentPage, newFilters, status!);
      } else {
        fetchMemberData(currentPage, filters, packageType);
      }
    };
    initializeAndFetch();
  }, [pathname, params]);

  useEffect(() => {
    setCurrentPage(1);
    const Fetch = async () => {
      fetchMemberData(1, filters, packageType);
    };
    Fetch();
  }, [pageSizeVal]);

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
      // setPermissions(response.data.permissions || {});
      const isEnquiry =
        response.data.permissions["mainMemberManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    fetchMemberData(pageNumber, filters, packageType);
  };

  const handleSearch = useCallback((value: string) => {
    const initialFilters = { ...filters, memberName: value };
    setFilters(initialFilters);
    fetchMemberData(1, initialFilters, packageType);
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => handleSearch(value), 300),
    [handleSearch]
  );

  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    if (key === "startDate" || key === "endDate") {
      // If it's a Date object, format it to a string
      const formattedValue =
        value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
      setFilters((prev) => ({ ...prev, [key]: formattedValue }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const applyFilters = async () => {
    if (filters.dateRange && filters.startDate && filters.endDate) {
      if (
        !validateDateRange(
          filters.dateRange,
          filters.startDate,
          filters.endDate
        )
      ) {
        toast.error(
          `Invalid date range for ${filters.dateRange} filter. Please adjust your dates.`
        );
        return;
      } else {
        // setFilterInfo(filters.dateRange);
      }
    }
    fetchMemberData(1, filters, packageType);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if (filters.dateRange) {
      const { startDate, endDate, infoText } = getCurrentDateRange(
        filters.dateRange
      );
      setFilters((prev) => ({ ...prev, startDate, endDate }));
      setDateRangeInfo(infoText);
    } else {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      setDateRangeInfo("");
    }
  }, [filters.dateRange]);

  return (
    <section className="grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
      <div className="relative flex w-full items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>
        <div
          className="max-xl:flex items-center p-2 gap-4 xl:grid grid-cols-5 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
          ref={sliderEl}
        >
          {memberListInfo.map((metric, index) => (
            <div
              key={index}
              onClick={() => {
                if (packageType === metric.req || metric.req === "present") {
                  return;
                }
                handlePackageType(metric.req);
              }}
              className="group relative"
            >
              <XIcon
                size={18}
                className={`${packageType === metric.req ? "absolute" : "hidden"} peer bottom-2 lg:top-2 right-2 z-[99] text-primary cursor-pointer hover:scale-110 hover:text-red-400`}
                onClick={() => handlePackageType(metric.req)}
              />
              <MetricCard
                title={metric.title}
                metric={new Intl.NumberFormat().format(metric.value)}
                className={`shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 ${metric.req !== "present" && "hover:bg-primary-lighter hover:scale-105 peer-hover:bg-primary-lighter peer-hover:scale-105"} cursor-pointer !p-2`}
                iconClassName={`text-primary bg-primary-lighter max-lg:size-[32px] duration-200 transition-all ${
                  metric.req === packageType && metric.req !== "present"
                    ? "text-white bg-primary"
                    : metric.req !== "present"
                      ? "group-hover:text-white group-hover:bg-primary peer-hover:text-white peer-hover:bg-primary"
                      : ""
                }`}
                titleClassName={`text-nowrap max-lg:text-xs font-medium max-lg:max-w-[110px] truncate ${
                  metric.req === packageType && metric.req !== "present"
                    ? "text-primary"
                    : metric.req !== "present"
                      ? "group-hover:text-primary"
                      : ""
                }`}
                icon={metric.icon}
                metricClassName="text-primary max-lg:text-base text-center "
              />
            </div>
          ))}
        </div>
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>
      <WidgetCard
        className="relative dark:bg-inherit "
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="Member's List"
        titleClassName="whitespace-nowrap"
        action={
          <div className="hidden lg:flex items-end justify-end gap-5">
            <Input
              type="search"
              placeholder="Search by name..."
              value={filters.memberName}
              onChange={(e) => debouncedSearch(e.target.value)}
              clearable
              onClear={() => debouncedSearch("")}
              prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
              className="max-w-xs"
            />
            <Button onClick={() => setIsDrawerOpen(true)}>
              Filters <FilterIcon className="ml-2" />
            </Button>
            <Button
              className="max-w-[40] flex flex-row flex-nowrap gap-2 items-center"
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                router.push("/members/new_member");
              }}
            >
              <span>Add</span>
              <ListPlusIcon />
            </Button>
            <div className="flex items-center border rounded-lg bg-gray-50 gap-1.5 p-1.5">
              <Button
                onClick={() => setView("grid")}
                size="sm"
                className={
                  view !== "grid"
                    ? `bg-primary-lighter text-primary hover:text-primary-lighter`
                    : ""
                }
              >
                <MdOutlineGridView size={16} />
              </Button>
              <Button
                onClick={() => setView("table")}
                size="sm"
                className={
                  view !== "table"
                    ? `bg-primary-lighter text-primary hover:text-primary-lighter`
                    : ""
                }
              >
                <FaList size={16} />
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-2 lg:hidden gap-4 mt-4">
          <Input
            type="search"
            placeholder="Search by name..."
            value={filters.memberName}
            onChange={(e) => debouncedSearch(e.target.value)}
            clearable
            onClear={() => debouncedSearch("")}
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            className=" col-span-full"
          />
          <Button onClick={() => setIsDrawerOpen(true)}>
            Filters <FilterIcon className="ml-2" />
          </Button>
          <Button
            className="flex flex-row flex-nowrap gap-2 items-center"
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              router.push("/members/new_member");
            }}
          >
            <span>Add</span>
            <ListPlusIcon />
          </Button>
        </div>
        <div className="md:hidden">
          <MembersCardList
            data={allMembersData}
            fetchMemberData={(pageNumber) =>
              fetchMemberData(pageNumber, filters, packageType)
            }
            access={access}
            pageNumber={currentPage}
            isLoading={isLoading}
            restore={showrestore}
            // onHeaderSort={handleHeaderSort}
            // sort={sort}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
          />
        </div>
        <div className="max-md:hidden">
          {view === "grid" ? (
            <MembersCardList
              data={allMembersData}
              fetchMemberData={(pageNumber) =>
                fetchMemberData(pageNumber, filters, packageType)
              }
              pageNumber={currentPage}
              isLoading={isLoading}
              restore={showrestore}
              // onHeaderSort={handleHeaderSort}
              // sort={sort}
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              access={access}
            />
          ) : (
            <OrderTable
              data={allMembersData}
              //@ts-ignore
              variant="none" // no variant for dm changes
              className="[&_.table-filter]:hidden [&_.table-pagination]:hidden mt-4"
              fetchMemberData={(pageNumber) =>
                fetchMemberData(pageNumber, filters, packageType)
              }
              pageNumber={currentPage}
              isLoading={isLoading}
              restore={showrestore}
              onHeaderSort={handleHeaderSort}
              sort={sort}
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
            />
          )}
        </div>
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
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          size="sm"
          // containerClassName="dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex flex-col h-full">
            <div className="p-5 flex-grow">
              <div className="flex items-center justify-between mb-5">
                <Title as="h3" className="">
                  Filters
                </Title>
                <XIcon
                  className="h-6 w-6 cursor-pointer "
                  onClick={() => setIsDrawerOpen(false)}
                />
              </div>
              <div className="space-y-4">
                {/* <Select
                name="status"
                label="Status"
                className="dark:text-gray-400"
                value={filters.status}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Deleted", value: "Deleted" },
                ]}
                onChange={(option: any) => {
                  console.log(option);
                  handleFilterChange("status", option.value);
                }}
                labelClassName=""
                dropdownClassName="dark:bg-gray-800 dark:border-gray-500"
                optionClassName="dark:[&_div]:text-gray-400 dark:[&_div]:hover:text-gray-700"
              /> */}
                <Select
                  label={`Range ${packageType !== "all" && packageType !== "" ? "( Disabled for Category Filter )" : ""}`}
                  // className="dark:text-gray-400"
                  options={filterOptions}
                  onChange={(option: any) => {
                    // if (option.value === "all") {
                    //   setFilterInfo("all");
                    // }
                    setFilters((prev) => ({
                      ...prev,
                      startDate: "",
                      endDate: "",
                    }));
                    handleFilterChange("dateRange", option.value);
                  }}
                  value={
                    filterOptions.find(
                      (item) => item.value === filters.dateRange
                    )?.label
                  }
                  // labelClassName=""
                  // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  disabled={packageType !== "all" && packageType !== ""}
                />
                {dateRangeInfo && (
                  <Announcement
                    badgeText={dateRangeInfo}
                    className="dark:bg-inherit"
                  />
                )}
                <div className="flex flex-col gap-2">
                  <Text className="">Start Date:</Text>
                  <DatePicker
                    placeholderText="Start Date"
                    disabled={
                      filters.dateRange === "" ||
                      filters.dateRange === "daily" ||
                      filters.dateRange === "yesterday"
                    }
                    // selected={
                    //   filters.startDate
                    //     ? new Date(
                    //         formateDateValue(new Date(filters.startDate))
                    //       )
                    //     : null
                    // }
                    onChange={(date: any) =>
                      handleFilterChange(
                        "startDate",
                        formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                      )
                    }
                    value={
                      filters.startDate
                        ? formateDateValue(new Date(filters.startDate))
                        : ""
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Text className="">End Date:</Text>
                  <DatePicker
                    placeholderText="End Date"
                    disabled={
                      !filters.startDate ||
                      filters.dateRange === "" ||
                      filters.dateRange === "daily" ||
                      filters.dateRange === "yesterday"
                    }
                    // selected={
                    //   filters.endDate
                    //     ? new Date(formateDateValue(new Date(filters.endDate)))
                    //     : null
                    // }
                    onChange={(date: any) =>
                      handleFilterChange(
                        "endDate",
                        formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                      )
                    }
                    value={
                      filters.endDate
                        ? formateDateValue(new Date(filters.endDate))
                        : ""
                    }
                    minDate={
                      filters.startDate
                        ? dayjs(filters.startDate).toDate()
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
            <div className="p-5 mt-auto">
              <Button className="w-full" onClick={applyFilters}>
                Show Results
              </Button>
            </div>
          </div>
        </Drawer>
        <div className="!fixed !z-[999] bottom-5 right-5 sm:bottom-10 sm:right-10 ">
          {checkedItems.length > 0 && (
            <DeleteAllModal
              ids={checkedItems}
              type="Member"
              onUpdate={() => {
                fetchMemberData(1, filters, packageType);
                setCheckedItems([]);
              }}
            />
          )}
        </div>
      </WidgetCard>
    </section>
  );
}

// Utility function for debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
