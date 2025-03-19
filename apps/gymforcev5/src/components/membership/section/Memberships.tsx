"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import MembershipList from "@/components/membership/MembershipList";
// import useMembershipAPI from "@/hooks/useMembershipAPI"
import Pagination from "@core/ui/pagination";
import {
  AxiosPrivate,
  // invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { filterOptions } from "../../../app/[locale]/(home)/Filter";
import toast from "react-hot-toast";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import dayjs from "dayjs";
import {
  AdvancedRadio,
  Announcement,
  Button,
  Drawer,
  RadioGroup,
  Select,
  Text,
  Title,
} from "rizzui";
import { CircleCheck, XIcon } from "lucide-react";
// import { DatePicker } from "@ui/datepicker";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { filter } from "lodash";
import { retrieveGymId } from "../../../app/[locale]/auth/InfoCookies";
import MetricCard from "@core/components/cards/metric-card";
import {
  FaPersonRunning,
  FaUser,
  // FaUserMinus,
  // FaUserPlus,
  FaUsers,
} from "react-icons/fa6";
import { RiUserVoiceFill } from "react-icons/ri";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

export type Membership = {
  ind: number;
  cancellation_reason: string | null;
  cancelled: boolean | null;
  created_at: string;
  created_by: number;
  due: number;
  due_date: string | null;
  end_date: string;
  gym_id: string;
  gym_name: string;
  id: string;
  gender: string;
  member_image: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  member_email: string;
  membership_id: string;
  offer_price: number;
  package_id: string;
  package_name: string;
  paid_amount: number;
  payment_mode_id: string;
  payment_mode_name: string;
  price: number | null;
  reference: string | null;
  start_date: string;
  title: string | null;
  package_type: string;
  user: number;
  validity: number;
  days_to_renewal?: number;
  days_since_expiry?: number;
  renewal_count?: number;
  freezed?: boolean;
  sessions?: string;
  status: string;
  is_renewable?: boolean | null;
  is_transferred?: boolean | null;
  is_upgraded?: boolean | null;
  localid: number;
  trainer: number | null;
  trainer_details: any | null;
  seat: string;
  batch_timing: string;
};

interface Filters {
  dateRange: string;
  memberName: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface SortProps {
  sortBy: keyof Membership | null;
  sortOrder: "asc" | "desc" | null;
}

export default function Memberships({
  type,
  hideInfo = false,
  dfilter,
  fetchData,
  selectedMonth,
  selectedYear,
}: {
  type: string;
  hideInfo?: boolean;
  dfilter?: string;
  fetchData?: () => Promise<void>;
  selectedMonth?: string;
  selectedYear?: string;
}) {
  const [membershipData, setMembershipData] = useState<Membership[]>([]);
  const [metricData, setMetricData] = useState([
    { label: "All", value: "All" },
  ]);
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [packageType, setPackageType] = useState("All");
  const [totalMemberships, setTotalMemberships] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const params = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[0].value,
    memberName: "",
    startDate: "",
    endDate: "",
    type: params.get("status") || type || "all",
  });
  const pathname = usePathname();
  const [sort, setSort] = useState<SortProps>({
    sortBy: null,
    sortOrder: null,
  });
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const router = useRouter();
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [centerType, setCenterType] = useState(0);
  // const [packageCounts, setPackageCounts] = useState<any>(null);

  const fetchMemberships = useCallback(
    async (
      pageNumber: number = 1,
      currentFilters: Filters,
      packageType: string
    ) => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        console.log("dfilter", dfilter);
        if (currentFilters.memberName && !packageType) {
          queryParams.append("search", currentFilters.memberName);
        }
        if (dfilter) {
          if (dfilter === "daily" || dfilter === "weekly") {
            if (
              type === "upcoming_renewal" &&
              dfilter === "daily" &&
              !params.get("status")
            ) {
              queryParams.append("date_range", "all");
            } else {
              const { startDate, endDate } = getCurrentDateRange(
                dfilter,
                type === "upcoming_renewal" ? "upcoming" : "normal"
              );
              queryParams.append("start_date", startDate);
              queryParams.append("end_date", endDate);
            }
          } else if (dfilter === "monthly" && selectedMonth && selectedYear) {
            const startDate = dayjs(`${selectedYear}-${selectedMonth}-01`)
              .startOf("month")
              .format("YYYY-MM-DD");
            const endDate = dayjs(`${selectedYear}-${selectedMonth}-01`)
              .endOf("month")
              .format("YYYY-MM-DD");
            queryParams.append("start_date", startDate);
            queryParams.append("end_date", endDate);
          } else if (dfilter === "yearly" && selectedYear) {
            const startDate = dayjs(`${selectedYear}-01-01`)
              .startOf("year")
              .format("YYYY-MM-DD");
            const endDate = dayjs(`${selectedYear}-01-01`)
              .endOf("year")
              .format("YYYY-MM-DD");
            queryParams.append("start_date", startDate);
            queryParams.append("end_date", endDate);
          }
          queryParams.append("membership_type", type);
          setFilters((prev) => ({ ...prev, type: type }));
        }
        // Regular membership page mode with all filters
        else {
          // if (currentFilters.memberName && !packageType) {
          //   queryParams.append("search", currentFilters.memberName);
          // }

          if (currentFilters.type && packageType === "All") {
            queryParams.append("membership_type", currentFilters.type);
          }

          if (
            packageType &&
            packageType !== "deleted" &&
            packageType !== "All"
          ) {
            queryParams.append("package_type", packageType.toLowerCase());
          }

          // if (currentFilters.dateRange !== "all") {
          if (currentFilters.startDate) {
            queryParams.append("start_date", currentFilters.startDate);
          }
          if (currentFilters.endDate) {
            queryParams.append("end_date", currentFilters.endDate);
            // }
          }
        }
        if (dfilter) {
          setPageSizeVal(5);
          queryParams.append("page_size", "5");
        } else {
          if (!dfilter && pageSizeVal) {
            if (pageSizeVal !== 10) {
              queryParams.append("page_size", pageSizeVal.toString());
            }
          } else if (!dfilter) {
            const PageVal = getPageSize();
            if (PageVal !== "10") {
              queryParams.append("page_size", PageVal.toString());
            }
            setPageSizeVal(parseInt(PageVal));
          }
        }
        queryParams.append("page", pageNumber.toString());

        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `/api/list-memberships/v2/?gym_id=${gymId}&${queryParams}`,
          {
            id: newID(`membership-type-${queryParams}-${pageNumber}`),
          }
        );

        const processedData = resp.data.results.memberships.map(
          (item: any, index: number): Membership => {
            const mappedItem = {
              ind: index + 1 + (pageNumber - 1) * 10,
              cancellation_reason: item.cancellation_reason,
              cancelled: item.cancelled,
              created_at: item.created_at,
              created_by: item.created_by,
              due: item.due,
              due_date: item.due_date,
              end_date: item.end_date,
              gym_id: item.gym_details.id,
              gym_name: item.gym_details.name,
              id: item.id,
              is_renewable: item.is_renewable,
              member_image: item.member_details.member_image
                ? item.member_details.member_image
                : "",
              gender: item.gender,
              member_id: item.member_details.id,
              member_name: item.member_details.name,
              member_phone: item.member_details.phone,
              member_email: item.member_details.email,
              membership_id: item.id,
              offer_price: item.offer_price,
              package_id: item.package_details.id,
              package_name: item.package_details.name,
              paid_amount: item.paid_amount,
              payment_mode_id: item.payment_mode_details?.id.toString(),
              payment_mode_name: item.payment_mode_details?.name,
              price: item.price,
              reference: item.reference,
              start_date: item.start_date,
              title: item.title,
              package_type: item.package_details.package_type,
              user: item.user,
              validity: item.validity,
              renewal_count: item.renewal_count,
              freezed:
                (item?.freeze_info && item?.freeze_info.freeze_days_left
                  ? true
                  : false) || false,
              sessions: item?.sessions || "N/A",
              status: item.status,
              is_transferred: item.is_transferred,
              is_upgraded: item.is_upgraded,
              localid: item.member_details.localid,
              trainer: item.trainer,
              trainer_details: item.trainer_details,
              batch_timing: item?.batch_timing || 0,
              seat: item?.seat || "",
            };
            const endDate = new Date(mappedItem.end_date);
            const today = new Date();
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
              ...mappedItem,
              days_to_renewal: diffDays > 0 ? diffDays : undefined,
              days_since_expiry: diffDays <= 0 ? Math.abs(diffDays) : undefined,
            };
          }
        );
        // setPackageCounts(resp.data.results.package_type_counts);

        // setMetricData(newMetricData);
        setMembershipData(processedData);
        setTotalMemberships(resp.data.count);
        setCurrentPage(pageNumber);
      } catch (error) {
        console.error("Error fetching memberships:", error);
        toast.error(
          "Something went wrong while fetching memberships. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [type, packageType, dfilter, selectedMonth, selectedYear]
  );
  const fetchCenters = async () => {
    try {
      const response = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      setCenterType(parseInt(response.data?.center) + 1);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  const fetchPackageType = async () => {
    try {
      const center =
        centerType === 1 ? "gym" : centerType === 2 ? "library" : "dance";
      const resp = await AxiosPrivate.get(
        `/api/add-package-prerequisites/?center_type=${center}`,
        { id: newID(`add-package-prerequisites-${center}`) }
      );
      setMetricData((prev) => [
        ...prev,
        ...(resp.data.options.map((item: any) => ({
          label: item,
          value: item,
        })) as any[]),
      ]);
    } catch (error) {
      console.error("Error fetching package types:", error);
    }
  };
  // Effects
  useEffect(() => {
    if (centerType === 0) {
      fetchCenters();
    }
  }, []);

  useEffect(() => {
    if (centerType) {
      fetchPackageType();
    }
  }, [centerType]);

  useEffect(() => {
    fetchMemberships(1, filters, packageType);
  }, [pageSizeVal, type]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      fetchMemberships(1, { ...filters, memberName: value }, packageType);
    },
    [fetchMemberships, filters, packageType]
  );

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      fetchMemberships(pageNumber, filters, packageType);
    },
    [fetchMemberships, filters]
  );

  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string | Date) => {
      if (key === "startDate" || key === "endDate") {
        const formattedValue =
          value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
        setFilters((prev) => ({ ...prev, [key]: formattedValue }));
      } else {
        setFilters((prev) => ({ ...prev, [key]: value }));
      }
    },
    []
  );

  const applyFilters = useCallback(async () => {
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
    await fetchMemberships(1, filters, packageType);
    setIsDrawerOpen(false);
  }, [fetchMemberships, filters, packageType]);

  const handleHeaderSort = (headerKey: keyof Membership | null) => {
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
    data: Membership[],
    sortBy: keyof Membership | null,
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
    const sortedData = SortData(membershipData, sort.sortBy, sort.sortOrder);
    setMembershipData(sortedData);
  }, [sort]);

  useEffect(() => {
    if (filters.dateRange) {
      const dateLevel = type === "upcoming_renewal" ? "upcoming" : "normal";
      const { startDate, endDate, infoText } = getCurrentDateRange(
        filters.dateRange,
        dateLevel
      );
      setFilters((prev) => ({ ...prev, startDate, endDate }));
      setDateRangeInfo(infoText);
    } else {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      setDateRangeInfo("");
    }
  }, [filters.dateRange]);

  useEffect(() => {
    const statusParam = params.get("status");
    const filterParam = params.get("filter");

    if (statusParam || filterParam) {
      const updatedFilters = { ...filters };

      if (statusParam) {
        updatedFilters.type = statusParam;
      }

      if (filterParam) {
        const dateLevel = type === "upcoming_renewal" ? "upcoming" : "normal";
        const { startDate, endDate, infoText } = getCurrentDateRange(
          filterParam,
          dateLevel
        );

        updatedFilters.dateRange = filterParam;
        updatedFilters.startDate = startDate;
        updatedFilters.endDate = endDate;
        setDateRangeInfo(infoText);
      }

      setFilters(updatedFilters);
      fetchMemberships(1, updatedFilters, packageType);
    }
  }, [params, type, packageType]);

  useEffect(() => {
    if (dfilter) {
      // In dashboard mode, only update dateRange and fetch
      setFilters((prev) => ({ ...prev, dateRange: dfilter }));
      fetchMemberships(1, { ...filters, dateRange: dfilter }, packageType);

      if (fetchData) {
        fetchData();
      }
    } else {
      // Regular membership page initialization
      fetchMemberships(1, filters, packageType);
    }
  }, [dfilter, selectedMonth, selectedYear, pathname, params]);

  return (
    <section className="relative grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
      {!hideInfo && type !== "upcoming_renewal" && type !== "expired" && (
        <div className="relative flex w-full items-center overflow-hidden">
          <Button
            title="Prev"
            variant="text"
            ref={sliderPrevBtn}
            onClick={scrollToTheLeft}
            className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 "
          >
            <PiCaretLeftBold className="h-5 w-5" />
          </Button>

          <div
            className="w-full px-2 py-3 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
            ref={sliderEl}
          >
            <RadioGroup
              value={packageType}
              setValue={(value: any) => {
                // If clicking the same option, deselect it (set to empty)
                if (value === packageType) {
                  setPackageType("");
                  fetchMemberships(1, filters, "");
                } else {
                  setPackageType(value);
                  // handlePackageType(value);
                  fetchMemberships(1, filters, value);
                }
              }}
              className="flex items-center gap-3 md:gap-4"
            >
              {metricData.map((metric, index) => (
                <AdvancedRadio
                  key={index}
                  value={metric.value}
                  className={`relative flex items-center gap-2 rounded-lg pt-2  transition-all duration-200 ${
                    packageType === metric.value
                      ? "border-primary shadow-sm"
                      : "border-gray-200 hover:scale-105"
                  }`}
                >
                  {/* {packageType === metric.value && (
                    <XIcon
                      size={18}
                      className="absolute -top-4 right-2 z-[99999] text-primary cursor-pointer hover:scale-110 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("XICON");
                        setPackageType("");
                        fetchMemberships(1, filters, "");
                      }}
                    />
                  )} */}
                  <div className="flex flex-row items-center gap-2 p-1.5 transition-all duration-200 ">
                    <Text className="text-sm font-medium text-gray-900 truncate ">
                      {metric.label}
                    </Text>
                    <div
                      className={`flex items-center text-primary ${packageType === metric.value ? "" : "hidden"}`}
                    >
                      <CircleCheck size={18} className="" />
                    </div>
                  </div>
                </AdvancedRadio>
              ))}
            </RadioGroup>
          </div>

          <Button
            title="Next"
            variant="text"
            ref={sliderNextBtn}
            onClick={scrollToTheRight}
            className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 "
          >
            <PiCaretRightBold className="h-5 w-5" />
          </Button>
        </div>
      )}
      <MembershipList
        data={membershipData}
        type={type}
        hideInfo={hideInfo}
        fetchMemberships={async () => {
          if (dfilter && hideInfo) {
            // invalidateAll();
            if (fetchData) {
              fetchData();
              router.refresh();
            }
          }
          fetchMemberships(currentPage, filters, packageType);
        }}
        packageType={packageType}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        isLoading={isLoading}
        onFilterClick={() => setIsDrawerOpen(true)}
        onHeaderSort={handleHeaderSort}
        sort={sort}
      />
      <div
        className={`flex ${hideInfo ? "justify-end" : "justify-between"} mt-4`}
      >
        {" "}
        <Select
          value={pageSizeVal}
          // size="sm"
          options={pageSizeOptions}
          placeholder="Items per page"
          className={`w-auto dark:text-gray-400 ${hideInfo ? "hidden" : ""}`}
          onChange={(option: any) => {
            setPageSizeVal(option.value);
            setPageSize(option.value);
          }}
          // labelClassName=""
          // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
        ></Select>{" "}
        <Pagination
          total={totalMemberships}
          current={currentPage}
          onChange={handlePageChange}
          outline={false}
          rounded="md"
          variant="solid"
          color="primary"
          pageSize={dfilter ? 5 : (pageSizeVal ?? 0)}
        />
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        size="sm"
        // containerClassName="dark:bg-gray-800 "
      >
        <div className="flex flex-col h-full">
          <div className="p-5 flex-grow">
            <div className="flex items-center justify-between mb-5">
              <Title as="h3" className="">
                Filters
              </Title>
              <XIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
            <div className="space-y-4">
              {(type === "all" || type === "active") && (
                <Select
                  label="Type"
                  options={[
                    { label: "All", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Renewed", value: "renewed" },
                  ]}
                  onChange={(option: any) => {
                    setFilters((prev) => ({ ...prev, type: option.value }));
                  }}
                  value={filters.type[0].toUpperCase() + filters.type.slice(1)}
                  // labelClassName=""
                  // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                />
              )}
              <Select
                label="Range"
                options={
                  type === "upcoming_renewal"
                    ? filterOptions.filter((item) => item.value !== "yesterday")
                    : filterOptions.filter((item) => item.value !== "yesterday")
                }
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
                  filterOptions.find((item) => item.value === filters.dateRange)
                    ?.label
                }
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
              {dateRangeInfo && <Announcement badgeText={dateRangeInfo} />}
              {/* <div className="flex flex-col gap-2">
                <Text>Start Date:</Text>
                <DatePicker
                  placeholderText="Start Date"
                  disabled={
                    filters.dateRange === "" ||
                    filters.dateRange === "daily" ||
                    filters.dateRange === "yesterday"
                  }
                  selected={
                    filters.startDate ? dayjs(filters.startDate).toDate() : null
                  }
                  onChange={(date: any) =>
                    handleFilterChange("startDate", date)
                  }
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Text>End Date:</Text>
                <DatePicker
                  placeholderText="End Date"
                  disabled={
                    !filters.startDate ||
                    filters.dateRange === "" ||
                    filters.dateRange === "daily" ||
                    filters.dateRange === "yesterday"
                  }
                  selected={
                    filters.endDate ? dayjs(filters.endDate).toDate() : null
                  }
                  onChange={(date: any) => handleFilterChange("endDate", date)}
                  dateFormat="yyyy-MM-dd"
                  minDate={
                    filters.startDate
                      ? dayjs(filters.startDate).toDate()
                      : undefined
                  }
                />
              </div> */}
            </div>
          </div>
          <div className="p-5 mt-auto">
            <Button className="w-full" onClick={applyFilters}>
              Show Results
            </Button>
          </div>
        </div>
      </Drawer>
    </section>
  );
}
