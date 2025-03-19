"use client";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { useEffect, useState, useCallback } from "react";
import { Announcement, Button, Drawer, Select, Text, Title } from "rizzui";
import { XIcon } from "lucide-react";
import { DatePicker } from "@core/ui/datepicker";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import { useRouter } from "next/navigation";
// import { filterOptions } from "../../Filter";
import FollowupList from "./FollowupList";
// import { Data } from "../leads/_components/Leads";
import { getPageSize } from "@/components/pageSize";
import {
  formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
import { filterOptions } from "@/app/[locale]/Filter";

export interface FollowUpType {
  id: number;
  history_count: number;
  comment: string;
  contact_type: string;
  datetime: string;
  gym: number;
  is_escalated: boolean;
  lead: Lead;
  managed_by: ManagedBy | null;
  member: null;
  next_followup_reminder: string | null;
  owner: number;
  priority: string;
  purpose: string;
  status: string;
}

interface Lead {
  id: number;
  LeadId: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  status: string | null;
  source: string | null;
  category: string | null;
  reminder: string;
  date: string;
  converted: boolean;
  converted_at: string;
  gender: string;
  address_street: string;
  address_city: string;
  address_zip_code: string;
  address_state: string;
  address_country: string;
  visiting_center: string;
  status_id: number | null;
  latest_followup_reminder?: {
    reminder: string;
    status: string;
  } | null;
  source_id: number | null;
  category_id: number | null;
  remarks: string;
  visitor_image?: string | null;
  enquiry_mode?: string;
  localid?: number;
  offer?: number | null;
  offer_details?: any | null;
  offer_id?: number | null;
  offer_price?: number | null;
  package?: number | null;
  package_details?: any | null;
  package_id?: number | null;
}

interface ManagedBy {
  id: number;
  name: string;
  staff_image: null;
  staff_type_name: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  member_image: string | null;
}

export interface MemberFollowUp {
  comment: string;
  contact_type: string;
  datetime: string;
  gym: number;
  history_count: number;
  id: number;
  is_escalated: boolean;
  lead: any | null;
  managed_by: any | null;
  member: Member | null;
  email: string;
  gender: string;
  name: string;
  phone: string;
  next_followup_reminder: string | null;
  owner: number | null;
  priority: string;
  purpose: string;
  status: string;
}

type Filters = {
  dateRange: string;
  leadName: string;
  startDate: string;
  endDate: string;
  visitingDate: string | null;
};

export default function FollowUp({
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
  const [followUp, setFollowUp] = useState<FollowUpType[]>([]);
  const [memberFollowUp, setMemberFollowUp] = useState<MemberFollowUp[] | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[0].value,
    leadName: "",
    startDate: "",
    endDate: "",
    visitingDate: null,
  });
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [followUpType, setFollowUpType] = useState<"Enq" | "Member">("Enq");

  const fetchFollowUpData = useCallback(
    async (page: number, currentFilters: Filters) => {
      const gymId = await retrieveGymId();
      const queryParams = new URLSearchParams();
      if (dfilter) {
        if (dfilter === "daily" || dfilter === "weekly") {
          // queryParams.append("dateRange", dfilter);
          const { startDate, endDate, infoText } = getCurrentDateRange(
            dfilter,
            "normal"
          );
          queryParams.append("start_date", startDate);
          const currentEndDate = new Date(endDate);
          const nextDate = new Date(currentEndDate);
          nextDate.setDate(nextDate.getDate() + 1);
          const formattedNextDate = nextDate.toISOString().split("T")[0];
          queryParams.append("end_date", formattedNextDate);
        } else if (dfilter === "monthly" && selectedMonth && selectedYear) {
          const startDate = dayjs(`${selectedYear}-${selectedMonth}-01`)
            .startOf("month")
            .format("YYYY-MM-DD");
          const endDate = dayjs(`${selectedYear}-${selectedMonth}-01`)
            .endOf("month")
            .format("YYYY-MM-DD");
          queryParams.append("start_date", startDate);
          const nextDate = new Date(endDate);
          nextDate.setDate(nextDate.getDate() + 1);
          queryParams.append("end_date", nextDate.toISOString().split("T")[0]);
        } else if (dfilter === "yearly" && selectedYear) {
          const startDate = dayjs(`${selectedYear}-01-01`)
            .startOf("year")
            .format("YYYY-MM-DD");
          const endDate = dayjs(`${selectedYear}-01-01`)
            .endOf("year")
            .format("YYYY-MM-DD");
          queryParams.append("start_date", startDate);
          const nextDate = new Date(endDate);
          nextDate.setDate(nextDate.getDate() + 1);
          queryParams.append("end_date", nextDate.toISOString().split("T")[0]);
        }
      } else {
        if (currentFilters.dateRange) {
          if (currentFilters.startDate) {
            queryParams.append("start_date", currentFilters.startDate);
          }
          if (currentFilters.endDate) {
            queryParams.append("end_date", currentFilters.endDate);
          }
          // }
        }
      }
      if (currentFilters.leadName) {
        queryParams.append("lead_name", currentFilters.leadName);
      }
      if (currentFilters.visitingDate) {
        queryParams.append("reminder", currentFilters.visitingDate);
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
      queryParams.append("page", page.toString());
      if (followUpType === "Member") {
        queryParams.append("filter_by", "member");
      } else {
        queryParams.append("filter_by", "lead");
      }
      try {
        setLoading(true);
        const resp = await AxiosPrivate.get(
          `/api/followups/?gym_id=${gymId}&${queryParams.toString()}`,
          {
            id: newID(`followup-leads-${queryParams.toString()}`),
          }
        );
        if (followUpType === "Member") {
          setMemberFollowUp(resp.data.results);
        } else {
          const preprocessedData = resp.data.results.map(
            (item: FollowUpType) => {
              // Ensure lead is fully populated with default values if any fields are missing
              const processedLead = {
                ...item.lead,
                leadId: item.lead.id.toString(),
                name: item.lead?.name || "Unknown",
                phone: item.lead?.phone || "",
                email: item.lead?.email || "",
                category: item.lead?.category || null,
                converted: item.lead?.converted || false,
                gender: item.lead?.gender || "",
                address_street: item.lead?.address_street || "",
                address_city: item.lead?.address_city || "",
                address_zip_code: item.lead?.address_zip_code || "",
                address_state: item.lead?.address_state || "",
                address_country: item.lead?.address_country || "",
                remarks: item.lead?.remarks,
                latest_followup_reminder:
                  item.lead?.latest_followup_reminder ?? null,
                visitor_image: item.lead?.visitor_image ?? null,
                enquiry_mode: item.lead?.enquiry_mode || "",
                // localid: item.lead?localid,
                offer: item.lead?.offer || null,
                offer_details:
                  item.lead?.offer_details || item.lead?.offer || null,
                offer_id: item.lead?.offer || null,
                offer_price: item.lead?.offer_price || null,
                package: item.lead?.package || null,
                package_details: item.lead?.package_details || null,
                package_id: item.lead?.package_id || item.lead?.package || null,
              };
              return {
                ...item,
                lead: processedLead,
              };
            }
          );
          console.log(preprocessedData);
          const sortedData = preprocessedData.sort((a: any, b: any) => {
            return (
              new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
            );
          });

          if (dfilter && hideInfo) {
            setFollowUp(sortedData.filter((item: any) => item.member === null));
          } else {
            setFollowUp(sortedData);
          }
          // console.log(sortedData);
        }
      } catch (error) {
        console.error("Error fetching follow-up data:", error);
        toast.error("Something went wrong while fetching follow-up data");
      } finally {
        setLoading(false);
      }
    },
    [dfilter, followUpType, pageSizeVal, selectedMonth, selectedYear]
  );

  useEffect(() => {
    const initializeAndFetch = async () => {
      // const filterVal = await getFilterInfo();
      // let initialFilters = { ...filters, dateRange: filterVal };
      // if (filterVal === "yesterday") {
      //  const initialFilters = { ...filters, dateRange: "all" };
      // }
      // setFilters(initialFilters);
      fetchFollowUpData(currentPage, filters);
    };
    initializeAndFetch();
  }, [followUpType]);

  const handleSearch = (value: string) => {
    const initialFilters = { ...filters, leadName: value };
    setFilters(initialFilters);
    fetchFollowUpData(1, initialFilters);
  };

  const handleFilterChange = (
    key: keyof Filters,
    value: string | Date | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    if (
      filters.dateRange &&
      filters.dateRange !== "daily" &&
      filters.startDate &&
      filters.endDate
    ) {
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
        setFilters((prev) => ({
          ...prev,
          visitingDate: null,
          startDate: formateDateValue(
            new Date(filters.startDate),
            "YYYY-MM-DD"
          ),
          endDate: formateDateValue(new Date(filters.endDate), "YYYY-MM-DD"),
        }));
      }
    }
    refreshData();
    setIsDrawerOpen(false);
  };
  const refreshData = () => {
    setCurrentPage(1);
    // invalidateAll();
    if (fetchData) {
      fetchData();
      router.refresh();
    }
    fetchFollowUpData(1, filters);
  };

  useEffect(() => {
    if (pageSizeVal) {
      fetchFollowUpData(1, filters);
    }
  }, [pageSizeVal]);

  useEffect(() => {
    if (filters.dateRange && filters.dateRange !== "all") {
      const { startDate, endDate, infoText } = getCurrentDateRange(
        filters.dateRange,
        "normal"
      );
      setFilters((prev) => ({
        ...prev,
        startDate: startDate,
        endDate: endDate,
      }));
      setDateRangeInfo(infoText);
    } else if (filters.dateRange === "all") {
      setDateRangeInfo("");
    }
  }, [filters.dateRange, filters.startDate, filters.endDate]);

  useEffect(() => {
    if (dfilter) {
      setFilters((prev) => ({ ...prev, dateRange: dfilter }));
      fetchFollowUpData(1, { ...filters, dateRange: dfilter });
    }
  }, [dfilter, selectedMonth, selectedYear]);

  return (
    <>
      <FollowupList
        followUp={followUp}
        hideInfo={hideInfo}
        title={title}
        onPageChange={(page) => {
          setCurrentPage(page);
          fetchFollowUpData(page, filters);
        }}
        memberFollowUp={memberFollowUp}
        onFilterClick={() => setIsDrawerOpen(true)}
        refreshData={refreshData}
        handleSearch={handleSearch}
        LoadingState={loading}
        pageSizeVal={pageSizeVal}
        setPageSizeVal={setPageSizeVal}
        followUpType={followUpType}
        setFollowUpType={setFollowUpType}
      />
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        size="sm"
      >
        <div className="flex flex-col h-full ">
          <div className="p-5 flex-grow">
            <div className="flex items-center justify-between mb-5 ">
              <Title as="h3" className="text-gray-900 ">
                Filters
              </Title>
              <XIcon
                className="h-6 w-6 cursor-pointer text-gray-900 "
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
            <div className="space-y-4">
              <Select
                label="Range (By FollowUp Date)"
                options={filterOptions.filter(
                  (item) => item.value !== "yesterday"
                )}
                onChange={(option: any) => {
                  handleFilterChange("dateRange", option.value);
                  // if (option.value === "all") {
                  //   setFilterInfo("all");
                  // }
                }}
                value={
                  filterOptions.find((item) => item.value === filters.dateRange)
                    ?.label
                }
                className="text-gray-700"
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
                <Text className="">Start Date:</Text>
                <DatePicker
                  placeholderText="Start Date"
                  disabled={filters.dateRange === "daily"}
                  // selected={
                  //   filters.startDate ? dayjs(filters.startDate).toDate() : null
                  // }
                  // onChange={(date: any) =>
                  //   handleFilterChange("startDate", date)
                  // }
                  // selected={
                  //   filters.startDate
                  //     ? new Date(formateDateValue(new Date(filters.startDate)))
                  //     : null
                  // }
                  onChange={(date: any) =>
                    handleFilterChange(
                      "startDate",
                      formateDateValue(new Date(date), "YYYY-MM-DD")
                    )
                  }
                  value={
                    filters.startDate
                      ? formateDateValue(new Date(filters.startDate))
                      : ""
                  }
                  // className="dark:texṭ-gray-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Text>End Date:</Text>
                <DatePicker
                  placeholderText="End Date"
                  disabled={!filters.startDate || filters.dateRange === "daily"}
                  // selected={
                  //   filters.endDate ? dayjs(filters.endDate).toDate() : null
                  // }
                  // onChange={(date) => handleFilterChange("endDate", date)}
                  // selected={
                  //   filters.endDate
                  //     ? new Date(
                  //         formateDateValue(
                  //           new Date(filters.endDate),

                  //         )
                  //       )
                  //     : null
                  // }
                  onChange={(date: any) =>
                    handleFilterChange(
                      "endDate",
                      formateDateValue(new Date(date), "YYYY-MM-DD")
                    )
                  }
                  value={
                    filters.endDate
                      ? formateDateValue(new Date(filters.endDate))
                      : ""
                  }
                  dateFormat={getDateFormat()}
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
    </>
  );
}
