"use client";
import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Loader,
  // Popover,
  Select,
  // Text,
  Title,
  Tooltip,
} from "rizzui";
import QuickInfo from "@/components/dashboard/QuickInfo";
import RevenueExpense from "@/components/dashboard/RevenueExpense";
import dynamic from "next/dynamic";
import MemberMetrics from "@/components/dashboard/MemberMetrics";
import Membership from "@/components/dashboard/Membership";
import Payment from "@/components/dashboard/Payment";
// import ButtonGroupAction from "@components/charts/button-group-action";
import {
  AxiosPrivate,
  // invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import {
  deleteGymId,
  retrieveGymId,
  // setGymId,
} from "@/app/[locale]/auth/InfoCookies";
import { useRouter } from "next/navigation";
import { retrieveDemographicInfo } from "../../app/[locale]/auth/DemographicInfo";
// import DropdownAction from "@core/components/charts/dropdown-action";
import { getFilterInfo } from "../../app/[locale]/Filter";
import { FaEye, FaEyeSlash, } from "react-icons/fa6";
import dayjs from "dayjs";
import cn from "@core/utils/class-names";
import { PiCalendarBlank, PiCaretDownBold } from "react-icons/pi";
// First, add these imports at the top
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { MdOutlineCelebration } from "react-icons/md";
import { IoIosArrowDropupCircle } from "react-icons/io";

// // import Memberships from "../membership/Memberships";
const Memberships = dynamic(() => import("../membership/section/Memberships"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="threeDot" />
    </div>
  ),
  // ssr: false,
});
// import FollowUp from "@/components/followups/FollowUps";
const FollowUp = dynamic(() => import("@/components/followups/FollowUps"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="threeDot" />
    </div>
  ),
  // ssr: false,
});
// import UpcommingBirthday from "@/components/dashboard/UpcommingBirthday";
const UpcommingBirthday = dynamic(
  () => import("@/components/dashboard/UpcommingBirthday"),
  {
    loading: () => (
      <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
        <Loader size="xl" variant="threeDot" />
      </div>
    ),
  }
);
// import MembershipDue from "../membership/due-list/DueList";
const MembershipDue = dynamic(() => import("../membership/section/DueList"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="threeDot" />
    </div>
  ),
  // ssr: false,
});
// import ReviewQuick from "@/components/dashboard/ReviewQuick";
const ReviewQuick = dynamic(
  () => import("@/components/dashboard/ReviewQuick"),
  {
    loading: () => (
      <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
        <Loader size="xl" variant="threeDot" />
      </div>
    ),
    // ssr: false,
  }
);

export interface GymStatsType {
  plan_expiries: MetricData;
  active_memberships: MetricData;
  member_present: MetricData;
  renewals: MetricData;
  pending_balance: MetricData;
  total_collection: MetricData;
  total_expenses: MetricData;
  new_enquiries: MetricData;
  converted_enquiries: MetricData;
  // irregular_members: MetricData;
  profit_or_loss: MetricData;
  active_members: MetricData;
  inactive_members: MetricData;
  payment_modes_with_details: PaymentMode[];
  packages_with_details: Package[];
  upcoming_birthdays: Birthday[];
  start_date: string;
  end_date: string;
  filter_type: string;
}

interface MetricData {
  value: number | null;
  percentage_change: number | null;
}

interface PaymentMode {
  id: number;
  name: string;
  is_default: boolean;
  total_count: number;
  total_amount: number;
}

interface Package {
  id: number;
  name: string;
  price: number;
  num_of_days: number;
  training_type: string;
  package_count: number;
  member_count: number;
}

interface Birthday {
  id: number;
  name: string;
  date_of_birth: string;
  phone: string;
  member_image: string | null;
  person_type: string;
}

interface YearOption {
  label: string;
  value: string;
}

interface MonthOption {
  label: string;
  value: string;
}

const filterOptions = [
  { label: "Today", value: "daily" },
  { label: "Week", value: "weekly" },
  { label: "Month", value: "monthly" },
  { label: "Year", value: "yearly" },
];

const DashboardSection: React.FC = () => {
  const [hideValues, setHideValues] = useState(() => {
    // Read from localStorage during initialization
    const localValue = localStorage.getItem("hideStats");
    return localValue ? JSON.parse(localValue) : false;
  });
  const [gymstats, setGymstats] = useState<GymStatsType>({
    plan_expiries: {
      value: null,
      percentage_change: null,
    },
    active_memberships: {
      value: null,
      percentage_change: null,
    },
    member_present: {
      value: null,
      percentage_change: null,
    },
    renewals: {
      value: null,
      percentage_change: null,
    },
    pending_balance: {
      value: null,
      percentage_change: null,
    },
    total_collection: {
      value: null,
      percentage_change: null,
    },
    total_expenses: {
      value: null,
      percentage_change: null,
    },
    new_enquiries: {
      value: null,
      percentage_change: null,
    },
    converted_enquiries: {
      value: null,
      percentage_change: null,
    },
    active_members: {
      value: 0,
      percentage_change: null,
    },
    inactive_members: {
      value: 0,
      percentage_change: null,
    },
    profit_or_loss: {
      value: null,
      percentage_change: null,
    },
    payment_modes_with_details: [],
    packages_with_details: [],
    upcoming_birthdays: [],
    start_date: "",
    end_date: "",
    filter_type: "",
  });
  const [durationText, setDurationText] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(
    localStorage.getItem("dbfilter") !== null
      ? JSON.parse(localStorage.getItem("dbfilter")!)?.filter
      : "daily"
  );
  const inPortal = true;
  const [statsGraph, setStatsGraph] = useState<any | null>(null);
  // const [statsTable, setStatsTable] = useState<StatsTableData | null>(null);
  const [topPayments, setTopPayments] = useState<any[]>([]);
  const [topMemberships, setTopMemberships] = useState<any[]>([]);
  // const [upcommingBirthday, setUpcommingBirthday] = useState<any[] | null>(
  //   null
  // );
  const router = useRouter();
  const [isFilterSet, setIsFilterSet] = useState(false);
  const [demographiInfo, setDemographicInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [staffType, setStaffType] = useState<string>("");
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [staffUId, setStaffUId] = useState<string | null>(null);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear2, setSelectedYear2] = useState<string>("");
  const [selectedMonth2, setSelectedMonth2] = useState<string>("");
  const [showMonths, setShowMonths] = useState(false);
  const currentYear = new Date().getFullYear();
  const yearOptions: YearOption[] = Array.from({ length: 5 }, (_, index) => ({
    label: (currentYear - index).toString(),
    value: (currentYear - index).toString(),
  }));
  const [permissions, setPermissions] = useState<any>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { scrollY } = useScroll();
  // Month options
  const monthOptions: MonthOption[] = [
    { label: "Jan", value: "1" },
    { label: "Feb", value: "2" },
    { label: "Mar", value: "3" },
    { label: "Apr", value: "4" },
    { label: "May", value: "5" },
    { label: "Jun", value: "6" },
    { label: "Jul", value: "7" },
    { label: "Aug", value: "8" },
    { label: "Sep", value: "9" },
    { label: "Oct", value: "10" },
    { label: "Nov", value: "11" },
    { label: "Dec", value: "12" },
  ];

  const saveFilter = (filter: string) => {
    const filterData: any = { filter };

    if (filter === "monthly") {
      filterData.selectedMonth = selectedMonth;
      filterData.selectedYear = selectedYear;
    } else if (filter === "yearly") {
      filterData.selectedYear = selectedYear;
    }

    localStorage.setItem("dbfilter", JSON.stringify(filterData));
  };

  const getData = async () => {
    try {
      setIsLoading(true);
      const getId = await retrieveGymId();
      console.log(durationText);
      const statsResp = await AxiosPrivate.get(
        `api/dashboard/stats/v3/${getId}/?${filter ? `filter=${filter.toLowerCase()}` : ""}${durationText ? durationText : ""}`,
        {
          id: newID(
            `dashboard-stats-${filter}-${durationText ? durationText : ""}`
          ),
        }
      );

      setGymstats(statsResp.data);
      setTopPayments(
        statsResp.data.payment_modes_with_details.sort(
          (a: any, b: any) => b.total_amount - a.total_amount
        )
      );
      setTopMemberships(
        statsResp.data.packages_with_details.sort(
          (a: any, b: any) => b.member_count - a.member_count
        )
      );
      // setStatsTable(tableResp.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // setStatsTable(null);
    } finally {
      setIsLoading(false);
      await getGraphData();
    }
  };

  const getGraphData = async () => {
    try {
      const getId = await retrieveGymId();
      console.log(durationText);
      const graphResp = await AxiosPrivate.get(
        `api/dashboard/stats-graph/${getId}/?${filter ? `revenue_expense_filter=${filter.toLowerCase()}` : ""}${durationText ? durationText : ""}`,
        {
          id: newID(
            `dashboard-statsGraph-${filter}-${durationText ? durationText : ""}`
          ),
        }
      );
      setStatsGraph(graphResp.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const savedFilter = localStorage.getItem("dbfilter");
    if (savedFilter) {
      const parsedFilter = JSON.parse(savedFilter);
      setFilter(parsedFilter.filter);

      if (
        parsedFilter.filter === "monthly" ||
        parsedFilter.filter === "yearly"
      ) {
        setShowDateSelector(true);
        setSelectedYear(parsedFilter.selectedYear);
        setSelectedYear2(parsedFilter.selectedYear);

        if (parsedFilter.filter === "monthly") {
          setShowMonths(true);
          setSelectedMonth(parsedFilter.selectedMonth);
          setSelectedMonth2(parsedFilter.selectedMonth);
          setDurationText(
            `&year=${parsedFilter.selectedYear}&month=${parsedFilter.selectedMonth}`
          );
        } else {
          setShowMonths(false);
          setDurationText(`&year=${parsedFilter.selectedYear}`);
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [filterVal, infoData, gymData] = await Promise.all([
          getFilterInfo(),
          retrieveDemographicInfo(),
          AxiosPrivate.get("/api/profile", {
            id: newID(`user-profile`),
            cache: {
              ttl: 60 * 60 * 1000,
            },
          }),
        ]);
        setDemographicInfo(infoData);
        setIsStaff(gymData.data.is_staff_role);
        if (gymData?.data?.associated_gyms?.length) {
          const savedFilter = localStorage.getItem("dbfilter");
          console.log("Seting... Filter Values.....");
          if (savedFilter) {
            // Parse and apply saved filter
            const parsedFilter = JSON.parse(savedFilter);
            setFilter(parsedFilter.filter);
            if (parsedFilter.filter === "monthly") {
              setSelectedMonth(parsedFilter.selectedMonth);
              setSelectedYear(parsedFilter.selectedYear);
              setDurationText(
                `&year=${parsedFilter.selectedYear}&month=${parsedFilter.selectedMonth}`
              );
              setSelectedMonth2(parsedFilter.selectedMonth);
              setSelectedYear2(parsedFilter.selectedYear);
            } else if (parsedFilter.filter === "yearly") {
              setSelectedYear(parsedFilter.selectedYear);
              setDurationText(`&year=${parsedFilter.selectedYear}`);
              setSelectedYear2(parsedFilter.selectedYear);
            } else {
              setDurationText(null);
            }
          } else {
            // Set default filter if no saved filter
            if (
              filterVal === "" ||
              filterVal === "yesterday" ||
              filterVal === "all"
            ) {
              setFilter("daily");
            } else {
              setFilter(filterVal);
            }
            setDurationText(null);
          }
          setStaffUId(gymData.data?.user_id);
          setIsFilterSet(true); // Mark filter as initialized
          await getData();
        } else {
          const gym_id = await retrieveGymId();
          if (!gym_id) {
            deleteGymId();
            router.push("/gym-registration");
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Sync selectedYear2 and selectedMonth2 with their primary counterparts
    if (selectedYear) {
      setSelectedYear2(selectedYear);
    }
    if (selectedMonth) {
      setSelectedMonth2(selectedMonth);
    }
  }, [selectedYear, selectedMonth]);

  // Fetch data only after filter is initialized
  useEffect(() => {
    if (isFilterSet) {
      getData();
    }
  }, [filter, selectedYear, selectedMonth, durationText, isFilterSet]);

  useEffect(() => {
    localStorage.setItem("hideStats", JSON.stringify(hideValues));
  }, [hideValues]);

  const getStaffId = async () => {
    try {
      const response = await AxiosPrivate.get(`/api/profile/`, {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });

      if (response.data.associated_staff.length) {
        setStaffId(response.data.associated_staff[0].staff_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // const type = sessionStorage.getItem("staffType");
    // setStaffType(type?.replace(/"/g, "").toLowerCase() || "");
    const isStaffVal = sessionStorage.getItem("isStaff");
    console.log(isStaffVal);
    setIsStaff(isStaffVal === "true");
    if (isStaffVal === "true") {
      getStaffId();
    }
  }, []);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `api/staff-permission/${staffUId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${staffUId}`),
        }
      );
      setPermissions(response.data.permissions || {});
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff && staffUId) {
      fetchPermissions();
    }
  }, [isStaff, staffUId]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Show button when scrolled down at least 300px
    setShowScrollToTop(latest > 300);
  });

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`relative `}>
      {isLoading && (
        <div className="sticky top-1/2 left-1/2 flex items-center justify-center z-[999999999]">
          <Loader
            size="xl"
            variant="threeDot"
            textRendering="Loading"
            className=""
          />
        </div>
      )}
      {/* {isStaff && staffId && (
        <div className="">
          <div className="grid grid-cols-5 gap-4 py-2">
            <div className=" bg-gray-0 p-2 dark:bg-gray-50 shadow hover:scale-105 transform duration-200">
              <div className="flex items-center gap-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 lg:h-12 lg:w-12">
                  <PiUser className="h-4 w-4" />
                </div>
                <div>
                  <Text className="text-base font-semibold">Clients</Text>
                  <Link
                    href={`/staff-section/staff-profile/st63-${staffId}-72fk/clients`}
                    className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none"
                  >
                    <Text className="flex items-center gap-1 ">
                      View <FaArrowRight className="text-primary" />
                    </Text>
                  </Link>
                </div>
              </div>
            </div>
            <div className=" bg-gray-0 p-2 dark:bg-gray-50 shadow hover:scale-105 transform duration-200">
              <div className="flex items-center gap-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 lg:h-12 lg:w-12">
                  <PiUser className="h-6 w-6" />
                </div>
                <div>
                  <Text className="text-base font-semibold">Earnings</Text>
                  <Link
                    href={`/staff-section/staff-profile/st63-${staffId}-72fk/earnings`}
                    className="group my-0.5 flex items-center rounded-md px-2.5 py-2 focus:outline-none"
                  >
                    <Text className="flex items-center gap-1 ">
                      View <FaArrowRight className="text-primary" />
                    </Text>
                  </Link>
                </div>
              </div>
            </div>
            <div className=" bg-gray-0 p-2 dark:bg-gray-50 shadow hover:scale-105 transform duration-200">
              <div className="flex items-center gap-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 lg:h-12 lg:w-12">
                  <PiUser className="h-6 w-6" />
                </div>
                <div>
                  <Text className="text-base font-semibold">Sessions</Text>
                  <Link
                    href={`/staff-section/staff-profile/st63-${staffId}-72fk/sessions`}
                    className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none"
                  >
                    <Text className="flex items-center gap-1 ">
                      View <FaArrowRight className="text-primary" />
                    </Text>
                  </Link>
                </div>
              </div>
            </div>
            <div className=" bg-gray-0 p-2 dark:bg-gray-50 shadow hover:scale-105 transform duration-200">
              <div className="flex items-center gap-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 lg:h-12 lg:w-12">
                  <PiUser className="h-6 w-6" />
                </div>
                <div>
                  <Text className="text-base font-semibold">FollowUps</Text>
                  <Link
                    href={`/staff-section/staff-profile/st63-${staffId}-72fk/followups`}
                    className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none"
                  >
                    <Text className="flex items-center gap-1 ">
                      View <FaArrowRight className="text-primary" />
                    </Text>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}
      <div className={`relative ${isLoading ? "blur-[1px]" : ""}`}>
        <section
          className={`grid grid-cols-12 gap-6 @container @[59rem]:gap-7 z-[99999] `}
        >
          <div className="col-span-full grid grid-cols-2 items-center">
            <Title className="text-gray-900 " >Dashboard</Title>
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-1 w-full gap-4 justify-end">
                {hideValues ? (
                  <Tooltip content="Show Values" placement="bottom">
                    <ActionIcon
                      variant="text"
                      className="!p-0.5"
                      onClick={() => setHideValues(false)}
                    >
                      <FaEyeSlash size={20} />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Tooltip content="Hide Values" placement="bottom">
                    <ActionIcon
                      variant="text"
                      className="!p-0.5"
                      onClick={() => setHideValues(true)}
                    >
                      <FaEye size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {filter && (
                  <div className="relative flex flex-col gap-2">
                    <Select
                      // inPortal={inPortal}
                      // variant={variant}
                      // value={viewType}
                      // options={options}
                      // onChange={handleOnChange}
                      options={filterOptions}
                      displayValue={(value: any) =>
                        filterOptions.find((item) => item.value === value)
                          ?.label
                      }
                      onChange={(value: any) => {
                        if (
                          value.value === "monthly" ||
                          value.value === "yearly"
                        ) {
                          setShowDateSelector(true);
                          const currentYear = dayjs().format("YYYY");
                          setSelectedYear(currentYear);

                          if (value.value === "monthly") {
                            setShowMonths(true);
                            // Set current month as default
                            const currentMonth = dayjs().format("M");
                            setSelectedMonth(currentMonth);
                          } else {
                            setShowMonths(false);
                            setSelectedMonth("");
                          }
                        } else {
                          // Reset all date-related states when switching to daily/weekly
                          setShowDateSelector(false);
                          setSelectedYear("");
                          setSelectedMonth("");
                          setSelectedYear2("");
                          setSelectedMonth2("");
                          setFilter(value.value);
                          setDurationText(null);
                          saveFilter(value.value);
                        }
                      }}
                      value={filter}
                      selectClassName={cn(
                        "py-1 px-2 leading-[32px] h-8 me-2  border border-gray-700 ",
                        "selectClassName"
                      )}
                      optionClassName="py-1 px-2 leading-[32px] h-8"
                      dropdownClassName={cn(
                        "p-2 gap-1 grid !z-0",
                        !inPortal && "w-full !z-10 h-auto",
                        "!z-0"
                      )}
                      placement="bottom-end"
                      prefix={
                        <PiCalendarBlank
                          className={cn(
                            "h-5 w-5 text-gray-700 ",
                            "prefixIconClassName"
                          )}
                        />
                      }
                      suffix={
                        <PiCaretDownBold
                          className={cn(
                            "h-3 w-3 text-gray-700 ",
                            "suffixIconClassName"
                          )}
                        />
                      }
                      className={cn(
                        "w-auto  ",
                        "rounded-md py-1 text-gray-700"
                      )}
                    />
                  </div>
                )}
              </div>
              {showDateSelector && (
                <div className="flex items-center gap-4">
                  <Select
                    size="sm"
                    options={yearOptions}
                    value={selectedYear}
                    onChange={({ value }) => setSelectedYear(value)}
                    placeholder="Select Year"
                    className="min-w-[100px]"
                  />

                  {showMonths ? (
                    <Select
                      options={monthOptions}
                      size="sm"
                      value={
                        selectedMonth
                          ? monthOptions.find(
                              (item) => item.value === selectedMonth
                            )?.label
                          : ""
                      }
                      onChange={({ value }) => setSelectedMonth(value)}
                      placeholder="Select Month"
                      className="min-w-[80px]"
                    />
                  ) : null}

                  <div className="flex justify-end gap-2">
                    <Button
                      className=" rounded-md"
                      size="sm"
                      onClick={() => {
                        if (selectedYear) {
                          if (showMonths && selectedMonth) {
                            setDurationText(
                              `&year=${selectedYear}&month=${selectedMonth}`
                            );
                            setFilter("monthly");
                            setSelectedMonth2(selectedMonth);
                            setSelectedYear2(selectedYear);
                            saveFilter("monthly");
                          } else {
                            setDurationText(`&year=${selectedYear}`);
                            setFilter("yearly");
                            setSelectedYear2(selectedYear);
                            setSelectedMonth2("");
                            saveFilter("yearly");
                          }
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <QuickInfo
            className="col-span-full"
            gymStats={gymstats}
            isLoading={isLoading}
            hideValues={hideValues}
            currentFilter={filter}
            permissions={permissions}
            isStaff={isStaff}
          />
          {(isStaff &&
            permissions !== null &&
            permissions["dashGraphAccess"] !== "no_access") ||
          !isStaff ? (
            <>
              <RevenueExpense
                stats={statsGraph?.dashboard_data[0] || null}
                filter={filter}
                info={demographiInfo}
                className="lg:col-span-6 col-span-full"
                isLoading={isLoading}
                hideValues={hideValues}
              />
              <MemberMetrics
                data={statsGraph?.dashboard_data[1].graph.yearly || null}
                className="lg:col-span-6 col-span-full"
                isLoading={isLoading}
                hideValues={hideValues}
              />
              <Membership
                stats={topMemberships || null}
                className="lg:col-span-6 col-span-full"
                isLoading={isLoading}
                info={demographiInfo}
                hideValues={hideValues}
              />
              <Payment
                payments={topPayments || null}
                className="lg:col-span-6 col-span-full"
                info={demographiInfo}
                isLoading={isLoading}
                hideValues={hideValues}
              />
            </>
          ) : null}
          {/* )} */}
          <div className="col-span-full min-w-full grid gap-6 @container @[59rem]:gap-7 relative overscroll-x-auto">
            {/* {filter && ( */}
            {(isStaff &&
              permissions !== null &&
              permissions["mainEnquiryManagement"] !== "no_access") ||
            !isStaff ? (
              <FollowUp
                hideInfo={true}
                title={"Enquiry's Follow Up"}
                dfilter={filter}
                fetchData={getData}
                selectedMonth={selectedMonth2}
                selectedYear={selectedYear2}
              />
            ) : null}
            {/* {filter && ( */}
            {(isStaff &&
              permissions !== null &&
              permissions["mainMembershipManagement"] !== "no_access") ||
            !isStaff ? (
              <>
                <Memberships
                  hideInfo={true}
                  type="upcoming_renewal"
                  dfilter={filter}
                  fetchData={getData}
                  selectedMonth={selectedMonth2}
                  selectedYear={selectedYear2}
                />
                {/* {filter && ( */}
                <MembershipDue
                  hideInfo={true}
                  title={"Pending Dues"}
                  dfilter={filter}
                  fetchData={getData}
                  selectedMonth={selectedMonth2}
                  selectedYear={selectedYear2}
                />
                <div id="expiredMembers">
                  <Memberships
                    hideInfo={true}
                    type="expired"
                    dfilter={filter}
                    fetchData={getData}
                    selectedMonth={selectedMonth2}
                    selectedYear={selectedYear2}
                  />
                </div>
              </>
            ) : null}
            {/* )} */}
            <div
              className="w-full grid grid-cols-1 lg:grid-cols-[700px,auto] gap-6"
              id="birthDays"
            >
              <UpcommingBirthday />
              <ReviewQuick />
            </div>
          </div>
        </section>
        <div className="fixed bottom-4 md:bottom-8 lg:bottom-10 right-1 md:right-2">
          <div className="grid gap-2">
            <a href="#birthDays">
              <Tooltip content="Move to Member's Birthday" placement="right">
                <ActionIcon className="hover:scale-105" rounded="lg">
                  <MdOutlineCelebration className="size-5" />
                </ActionIcon>
              </Tooltip>
            </a>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: showScrollToTop ? 1 : 0,
                scale: showScrollToTop ? 1 : 0.8,
                y: showScrollToTop ? 0 : 10,
              }}
              transition={{ duration: 0.2 }}
            >
              <ActionIcon
                className="hover:scale-105"
                rounded="lg"
                onClick={scrollToTop}
              >
                <IoIosArrowDropupCircle className="size-5" />
              </ActionIcon>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
