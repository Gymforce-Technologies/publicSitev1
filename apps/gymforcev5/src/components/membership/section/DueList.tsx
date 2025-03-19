// MembershipDue.tsx
"use client";

import PendingList from "@/components/membership/dues/PendingList";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AxiosPrivate,
  // invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import Pagination from "@core/ui/pagination";
// import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { debounce } from "lodash";
import toast from "react-hot-toast";
import { filterOptions } from "../../../app/[locale]/(home)/Filter";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import { Announcement, Button, Drawer, Title, Text, Select } from "rizzui";
// import { DatePicker } from "@ui/datepicker";
import { XIcon } from "lucide-react";
import dayjs from "dayjs";
// import { useRouter } from "next/navigation";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { DatePicker } from "@core/ui/datepicker";
import { FaUserCheck, FaUserPlus, FaUsers } from "react-icons/fa6";
import MetricCard from "@core/components/cards/metric-card";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { usePathname, useSearchParams } from "next/navigation";
// import { useRouter } from "next/navigation";

export type Membership = {
  ind: number;
  created_at: string;
  due: number;
  due_date: string | null;
  end_date: string;
  gym_id: string;
  gym_name: string;
  id: string;
  member_image: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  membership_id: string;
  offer_price: number;
  package_id: string;
  package_name: string;
  paid_amount: number;
  member_email: string;
  start_date: string;
  gender?: string;
  localid: number;
};

interface Filters {
  dateRange: string;
  memberName: string;
  startDate: string;
  endDate: string;
}

type FilterState = {
  currentFilters: Filters;
  isInitialized: boolean;
};

export interface SortProps {
  sortBy: keyof Membership | null;
  sortOrder: "asc" | "desc" | null;
}

export default function MembershipDue({
  hideInfo = false,
  title = "",
  dfilter,
  fetchData,
  selectedMonth,
  selectedYear,
}: {
  hideInfo?: boolean;
  title?: string;
  dfilter?: string;
  fetchData?: () => Promise<void>;
  selectedMonth?: string;
  selectedYear?: string;
}) {
  const [membershipData, setMembershipData] = useState<Membership[]>([]);
  const [totalDueCount, setTotalDueCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    currentFilters: {
      dateRange: filterOptions[0].value,
      memberName: "",
      startDate: "",
      endDate: "",
    },
    isInitialized: false,
  });
  const params = useSearchParams();
  const pathname = usePathname();
  const [dueFilter, setDueFilter] = useState<string | null>("upcoming");
  const [sort, setSort] = useState<SortProps>({
    sortBy: null,
    sortOrder: null,
  });
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);

  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [transactionInfo, setTransactionInfo] = useState([
    {
      title: "Dues Collected",
      value: 0,
      icon: <FaUsers size={18} />,
      req: "dues_collected",
    },
    {
      title: "Missed Dues Count ",
      value: 0,
      icon: <FaUserCheck size={18} />,
      req: "missed_dues_counts",
    },
    {
      title: "To be Collected",
      value: 0,
      icon: <FaUserPlus size={18} />,
      req: "to_be_collected",
    },
    {
      title: "Upcoming Dues Count",
      value: 0,
      icon: <FaUserPlus size={18} />,
      req: "upcoming_due_counts",
    },
  ]);
  const getDueData = useCallback(
    async (pageNumber: number, currentFilters: Filters) => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();

        // Priority handling for dfilter
        if (dfilter) {
          if (dfilter === "daily" || dfilter === "weekly") {
            const { startDate, endDate } = getCurrentDateRange(
              dfilter,
              "upcoming"
            );
            queryParams.append("start_date", startDate);
            queryParams.append("end_date", endDate);
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
        } else if (currentFilters.dateRange !== "all") {
          if (currentFilters.startDate)
            queryParams.append("start_date", currentFilters.startDate);
          if (currentFilters.endDate)
            queryParams.append("end_date", currentFilters.endDate);
        }

        if (currentFilters.memberName && !hideInfo) {
          queryParams.append("search", currentFilters.memberName);
        }
        if (dfilter) {
          setPageSizeVal(5);
          queryParams.append("page_size", "5");
        } else {
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
        }
        queryParams.append("page", pageNumber.toString());
        queryParams.append("due_filter", dueFilter || "upcoming");

        const gymId = await retrieveGymId();
        const url = `/api/list-dues/v2/?gym_id=${gymId}&${queryParams.toString()}`;

        const resp = await AxiosPrivate.get(url, {
          id: newID(`dues-${queryParams.toString()}`),
        });

        setMembershipData(
          resp.data.results.dues.map((item: any, index: number) => ({
            ind: index + 1 + (pageNumber - 1) * 10,
            created_at: item.created_at,
            due: item.due,
            due_date: item.due_date,
            end_date: item.end_date,
            gym_id: item.gym.id,
            gym_name: item.gym.name,
            id: item.id,
            member_image: item.member_details.member_image
              ? item.member_details.member_image
              : "",
            member_id: item.member_details.id,
            member_name: item.member_details.name,
            member_phone: item.member_details.phone,
            member_email: item.member_details.email,
            membership_id: item.id,
            offer_price: item.offer_price,
            package_id: item.package.id,
            package_name: item.package.name,
            paid_amount: item.paid_amount,
            start_date: item.start_date,
            gender: item.gender,
            localid: item.member_details.localid,
          }))
        );
        setTotalDueCount(resp.data.count);
        setTransactionInfo((prevState) =>
          prevState.map((item) => {
            let newValue = 0;
            switch (item.req) {
              case "dues_collected":
                newValue = resp.data?.results.dues_collected || 0;
                break;
              case "missed_dues_counts":
                newValue = resp.data?.results?.missed_dues_counts || 0;
                break;
              case "to_be_collected":
                newValue = resp.data?.results?.to_be_collected || 0;
                break;
              case "upcoming_due_counts":
                newValue = resp.data?.results?.upcoming_due_counts || 0;
                break;
            }
            return { ...item, value: newValue };
          })
        );
      } catch (error) {
        console.error("Error fetching memberships:", error);
        toast.error("Something went wrong while fetching Dues");
      } finally {
        setIsLoading(false);
      }
    },
    [dfilter, dueFilter, hideInfo, pageSizeVal, selectedMonth, selectedYear]
  );
  useEffect(() => {
    const initializeFilters = async () => {
      const filterParam = params.get("filter");

      // Priority to URL parameter
      if (filterParam) {
        const { startDate, endDate, infoText } = getCurrentDateRange(
          filterParam,
          "upcoming"
        );

        const newFilters = {
          dateRange: filterParam,
          memberName: "",
          startDate: startDate,
          endDate: endDate,
        };

        setFilterState((prev) => ({
          currentFilters: newFilters,
          isInitialized: true,
        }));

        setDateRangeInfo(infoText);
        await getDueData(1, newFilters);

        if (hideInfo && fetchData) {
          await fetchData();
        }
      }
      // Fallback to dfilter if no URL parameter
      else if (dfilter) {
        const { startDate, endDate, infoText } = getCurrentDateRange(
          dfilter,
          "upcoming"
        );

        const newFilters = {
          dateRange: dfilter,
          memberName: "",
          startDate: startDate,
          endDate: endDate,
        };

        setFilterState((prev) => ({
          currentFilters: newFilters,
          isInitialized: true,
        }));

        setDateRangeInfo(infoText);
        await getDueData(1, newFilters);

        if (hideInfo && fetchData) {
          await fetchData();
        }
      }
      // Default initialization if no filter
      else {
        setFilterState((prev) => ({ ...prev, isInitialized: true }));
        await getDueData(1, filterState.currentFilters);
      }
    };

    initializeFilters();
  }, [params, dfilter, pathname]);

  useEffect(() => {
    const FetchDemograpicInfo = async () => {
      try {
        const geoinfo = await getDemographicInfo();
        setDemographicInfo(geoinfo);
        console.log("info", geoinfo);
      } catch (error) {
        console.log(error);
      }
    };
    FetchDemograpicInfo();
  }, []);

  const debouncedGetDueData = useMemo(
    () =>
      debounce(
        (page: number, filters: Filters) => getDueData(page, filters),
        300
      ),
    [getDueData]
  );

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
    if (filterState.isInitialized) {
      debouncedGetDueData(currentPage, {
        ...filterState.currentFilters,
        memberName: searchTerm,
      });
    }
    return () => debouncedGetDueData.cancel();
  }, [searchTerm, currentPage, debouncedGetDueData, filterState.isInitialized]);

  // useEffect(() => {
  //   if (dfilter && hideInfo) {
  //     // invalidateAll();
  //     getDueData(1, { ...filters, dateRange: dfilter });
  //   }
  // }, [dfilter]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // if (dfilter && hideInfo) {
    //   // invalidateAll();
    //   if (fetchData) {
    //     fetchData();
    //     router.refresh();
    //   }
    //   getDueData(pageNumber, {
    //     ...filterState.currentFilters,
    //     dateRange: dfilter,
    //   });
    // } else {
    getDueData(pageNumber, filterState.currentFilters);
    // }
  };

  useEffect(() => {
    setCurrentPage(1);
    const Fetch = async () => {
      getDueData(1, filterState.currentFilters);
    };
    Fetch();
  }, [pageSizeVal]);

  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    if (key === "dateRange") {
      const { startDate, endDate, infoText } = getCurrentDateRange(
        value as string,
        "upcoming"
      );

      setFilterState((prev) => ({
        ...prev,
        currentFilters: {
          ...prev.currentFilters,
          dateRange: value as string,
          startDate: value === "all" ? "" : startDate,
          endDate: value === "all" ? "" : endDate,
        },
      }));

      setDateRangeInfo(infoText);
    } else {
      const formattedValue =
        value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;

      setFilterState((prev) => ({
        ...prev,
        currentFilters: {
          ...prev.currentFilters,
          [key]: formattedValue,
        },
      }));
    }
  };

  const refreshData = async () => {
    setCurrentPage(1);
    if (dfilter && hideInfo) {
      // invalidateAll();
      if (fetchData) {
        fetchData();
        // router.refresh()
      }
    }
    await getDueData(1, filterState.currentFilters);
    // }
  };

  const ExtendRefresh = () => {
    setCurrentPage(1);
    // if (dfilter && hideInfo) {
    //   // invalidateAll();
    //   if (fetchData) {
    //     fetchData();
    //     // router.refresh()
    //   }
    //   console.log("Refresh Page");
    //   getDueData(1, { ...filterState.currentFilters, dateRange: dfilter });
    // } else {
    getDueData(1, filterState.currentFilters);
    // }
  };

  const applyFilters = () => {
    if (
      filterState.currentFilters.dateRange &&
      filterState.currentFilters.startDate &&
      filterState.currentFilters.endDate
    ) {
      if (
        !validateDateRange(
          filterState.currentFilters.dateRange,
          filterState.currentFilters.startDate,
          filterState.currentFilters.endDate
        )
      ) {
        toast.error(
          `Invalid date range for ${filterState.currentFilters.dateRange} filter. Please adjust your dates.`
        );
        return;
      } else {
        // setFilterInfo(filterState.currentFilters.dateRange);
      }
    }
    getDueData(1, filterState.currentFilters);
    setIsDrawerOpen(false);
  };
  useEffect(() => {
    if (filterState.currentFilters.dateRange) {
      const { startDate, endDate, infoText } = getCurrentDateRange(
        filterState.currentFilters.dateRange,
        "upcoming"
      );
      setFilterState((prev) => ({
        ...prev,
        currentFilters: {
          ...prev.currentFilters,
          startDate,
          endDate,
        },
      }));
      // setFilters((prev) => ({ ...prev, startDate, endDate }));
      setDateRangeInfo(infoText);
    } else {
      setFilterState((prev) => ({
        ...prev,
        currentFilters: {
          ...prev.currentFilters,
          startDate: "",
          endDate: "",
        },
      }));
      setDateRangeInfo("");
    }
  }, [filterState.currentFilters.dateRange]);

  return (
    <section className="grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
      <div
        className={`relative flex w-full items-center overflow-hidden ${hideInfo ? " hidden " : ""}`}
      >
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
          {transactionInfo.map((metric, index) => (
            <div
              key={index}
              // onClick={() => handlePackageType(metric.req)}
              className="group"
            >
              <MetricCard
                title={metric.title}
                metric={
                  (metric.req !== "missed_dues_counts" &&
                  metric.req !== "upcoming_due_counts"
                    ? demographiInfo?.currency_symbol || ""
                    : "") +
                  " " +
                  new Intl.NumberFormat().format(metric.value)
                }
                className={`shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50  !p-2 md:!p-4 min-w-48`}
                iconClassName={`text-primary max-lg:size-[36px] bg-primary-lighter duration-200 transition-all group-hover:text-white group-hover:bg-primary`}
                titleClassName={`text-nowrap  max-lg:text-xs  font-medium group-hover:text-primary truncate `}
                icon={metric.icon}
                metricClassName="text-primary text-center  max-lg:text-base"
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
      <PendingList
        hideInfo={hideInfo}
        dueFilter={dueFilter}
        setDueFilter={setDueFilter}
        transactionInfo={transactionInfo}
        data={membershipData}
        title={title}
        getdueData={refreshData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
        filters={filterState.currentFilters}
        setIsDrawerOpen={setIsDrawerOpen}
        extendRefresh={ExtendRefresh}
        sort={sort}
        onHeaderSort={handleHeaderSort}
      />
      <div
        className={`flex ${hideInfo ? "justify-end" : "justify-between"} mt-4`}
      >
        <Select
          value={pageSizeVal}
          // size="sm"
          options={pageSizeOptions}
          placeholder="Items per page"
          className={`w-auto ${hideInfo ? "hidden" : ""}`}
          onChange={(option: any) => {
            setPageSizeVal(option.value);
            setPageSize(option.value);
          }}
          // labelClassName=""
          // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
        ></Select>{" "}
        <Pagination
          total={totalDueCount}
          current={currentPage}
          onChange={handlePageChange}
          pageSize={dfilter ? 5 : (pageSizeVal ?? 0)}
          showLessItems
        />
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        size="sm"
        // containerClassName="dark:bg-gray-800 dark:bg-gray-700"
      >
        <div className="flex flex-col h-full">
          <div className="p-5 flex-grow">
            <div className="flex items-center justify-between mb-5">
              <Title as="h3" className="text-gray-900 ">
                Filters
              </Title>
              <XIcon
                className="h-6 w-6 cursor-pointer "
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
            <div className="space-y-4">
              <Select
                label="Range"
                options={filterOptions}
                onChange={(option: any) => {
                  handleFilterChange("dateRange", option.value);
                }}
                value={
                  filterOptions.find(
                    (item) =>
                      item.value === filterState.currentFilters.dateRange
                  )?.label
                }
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
              {dateRangeInfo && (
                <Announcement
                  badgeText={dateRangeInfo}
                  className="dark:bg-inherit"
                />
              )}
              <div className="flex flex-col gap-2">
                <Text>Start Date:</Text>
                <DatePicker
                  placeholderText="Start Date"
                  disabled={["", "daily", "yesterday"].includes(
                    filterState.currentFilters.dateRange
                  )}
                  // selected={
                  //   filterState.currentFilters.startDate
                  //     ? dayjs(filterState.currentFilters.startDate).toDate()
                  //     : null
                  // }
                  // onChange={(date: any) =>
                  //   handleFilterChange("startDate", date)
                  // }
                  // selected={
                  //   filterState.currentFilters.startDate
                  //     ? new Date(
                  //         formateDateValue(
                  //           new Date(filterState.currentFilters.startDate)
                  //         )
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
                    filterState.currentFilters.startDate
                      ? formateDateValue(
                          new Date(filterState.currentFilters.startDate)
                        )
                      : ""
                  }
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Text>End Date:</Text>
                <DatePicker
                  placeholderText="End Date"
                  disabled={
                    !filterState.currentFilters.startDate ||
                    ["", "daily", "yesterday"].includes(
                      filterState.currentFilters.dateRange
                    )
                  }
                  // selected={
                  //   filterState.currentFilters.endDate
                  //     ? dayjs(filterState.currentFilters.endDate).toDate()
                  //     : null
                  // }
                  // onChange={(date: any) => handleFilterChange("endDate", date)}
                  // selected={
                  //   filterState.currentFilters.endDate
                  //     ? new Date(
                  //         formateDateValue(
                  //           new Date(filterState.currentFilters.endDate)
                  //         )
                  //       )
                  //     : null
                  // }
                  onChange={(date: any) =>
                    handleFilterChange(
                      "endDate",
                      formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                    )
                  }
                  value={
                    filterState.currentFilters.endDate
                      ? formateDateValue(
                          new Date(filterState.currentFilters.endDate)
                        )
                      : ""
                  }
                  dateFormat="yyyy-MM-dd"
                  minDate={
                    filterState.currentFilters.startDate
                      ? dayjs(filterState.currentFilters.startDate).toDate()
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
    </section>
  );
}
