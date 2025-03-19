"use client";

import { useEffect, useState, useCallback } from "react";
import MembershipList from "@/components/membership/MembershipList";
// import useMembershipAPI from "@/hooks/useMembershipAPI"
import Pagination from "@core/ui/pagination";
import {
  AxiosPrivate,
  // invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
// import { filterOptions } from "/Filter";
import toast from "react-hot-toast";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import dayjs from "dayjs";
import { Announcement, Button, Drawer, Select, Text, Title } from "rizzui";
import { XIcon } from "lucide-react";
// import { DatePicker } from "@ui/datepicker";
import { useRouter } from "next/navigation";
// import { filter } from "lodash";
// import { retrieveGymId } from "../../auth/InfoCookies";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import { filterOptions } from "../../../app/[locale]/(home)/Filter";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

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
  seat?: string;
  batch_timing?: string;
};

interface Filters {
  dateRange: string;
  memberName: string;
  startDate: string;
  endDate: string;
  type: string;
}
interface MetricItem {
  title: string;
  metric: number;
  icon?: React.ReactNode;
  value: string;
}
export interface SortProps {
  sortBy: keyof Membership | null;
  sortOrder: "asc" | "desc" | null;
}

export default function PTMemberships({
  type,
  hideInfo = false,
  dfilter,
  fetchData,
}: {
  type: string;
  hideInfo?: boolean;
  dfilter?: string;
  fetchData?: () => Promise<void>;
}) {
  const [membershipData, setMembershipData] = useState<Membership[]>([]);
  const [totalMemberships, setTotalMemberships] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[0].value,
    memberName: "",
    startDate: "",
    endDate: "",
    type: "all",
  });
  const [sort, setSort] = useState<SortProps>({
    sortBy: null,
    sortOrder: null,
  });
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const router = useRouter();
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);

  const fetchMemberships = useCallback(
    async (pageNumber: number = 1, currentFilters: Filters) => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        console.log("dfilter", dfilter);
        if (currentFilters.memberName) {
          queryParams.append("search", currentFilters.memberName);
        }

        queryParams.append("package_type", "pt");

        // if (currentFilters.dateRange !== "all") {
        if (currentFilters.startDate) {
          queryParams.append("start_date", currentFilters.startDate);
        }
        if (currentFilters.endDate) {
          queryParams.append("end_date", currentFilters.endDate);
          // }
        }
        const PageVal = getPageSize();
        if (PageVal !== "10") {
          queryParams.append("page_size", PageVal.toString());
        }
        setPageSizeVal(parseInt(PageVal));

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
        const packageCounts = resp.data.results.package_type_counts;
        const deletedCount = resp.data.results.deleted_membership_count;

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
    [type, dfilter]
  );

  useEffect(() => {
    fetchMemberships(1, filters);
  }, [pageSizeVal]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      fetchMemberships(1, { ...filters, memberName: value });
    },
    [fetchMemberships, filters]
  );

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      fetchMemberships(pageNumber, filters);
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
    await fetchMemberships(1, filters);
    setIsDrawerOpen(false);
  }, [fetchMemberships, filters]);

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
    if (dfilter) {
      // In dashboard mode, only update dateRange and fetch
      setFilters((prev) => ({ ...prev, dateRange: dfilter }));
      fetchMemberships(1, { ...filters, dateRange: dfilter });

      if (fetchData) {
        fetchData();
      }
    } else {
      // Regular membership page initialization
      fetchMemberships(1, filters);
    }
  }, [dfilter]);

  return (
    <section className="grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
      <MembershipList
        data={membershipData}
        type={"all"}
        hideInfo={hideInfo}
        fetchMemberships={async () => {
          if (dfilter && hideInfo) {
            // invalidateAll();
            if (fetchData) {
              fetchData();
              router.refresh();
            }
          }
          fetchMemberships(currentPage, filters);
        }}
        packageType={"pt"}
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
                    ? filterOptions.filter(
                        (item) =>
                          item.value !== "daily" && item.value !== "yesterday"
                      )
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
