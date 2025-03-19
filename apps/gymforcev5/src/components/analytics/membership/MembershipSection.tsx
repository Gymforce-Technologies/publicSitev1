"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
// import { filterOptions } from "../../Filter";
import dayjs from "dayjs";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
// import { DatePicker } from "@core/ui/datepicker";
import { Badge, Loader, Text } from "rizzui";
// import toast from "react-hot-toast";
import { getCurrentDateRange } from "@/components/ValidDate";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import AmountStats from "./AmountStat";
import MembershipStats from "./MembershipStats";
import MembershipStatusDistribution from "./Status";
import MonthlyAnalysis from "./MonthlyAnalysis";
// import PackageDiscountChart from "./Discount";

import WidgetCard from "@core/components/cards/widget-card";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import AnalyticsFilter from "../AnalyticsFilter";
import dynamic from "next/dynamic";
const PackageDiscountDistribution = dynamic(() => import("./Discount"), {
  loading: () => (
    <div className=" my-8 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="threeDot" />
    </div>
  ),
});
const UtilizationStats = dynamic(() => import("./Utilization"), {
  loading: () => (
    <div className=" my-8 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="threeDot" />
    </div>
  ),
});
const MembershipActivityReport = dynamic(
  () => import("./MembershipActivities"),
  {
    loading: () => (
      <div className=" my-8 col-span-full flex flex-1 items-center justify-center min-w-full">
        <Loader size="xl" variant="threeDot" />
      </div>
    ),
  }
);
const Table = dynamic(() => import(`@/components/table`));

interface Filters {
  // status: string;
  dateRange: string;
  startDate: string;
  endDate: string;
}
const filterOptions = [
  { label: "Today", value: "daily" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Week", value: "weekly" },
  { label: "Month", value: "monthly" },
  { label: "Year", value: "yearly" },
];
type PackageData = {
  id: number;
  package_name: string;
  package_type: "general" | "premium" | "special"; // Extend as needed
  package_max_price: number;
  membership_count: number;
  active_memberships: number;
  expired_memberships: number;
  upcoming_memberships: number;
  amount_paid: number;
  paid_balance_due: number;
  pending_balance_due: number;
  total_discount_given: number;
  total_offer_price: number;
  last_sold_date: string; // ISO string format for dates
};

export default function MembershipSection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[4].value,
    startDate: `${dayjs().year()}-01-01`,
    endDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
  });
  const [column, setColumn] = useState<keyof PackageData>("id");
  const [metrics, setMetrics] = useState<any>(null);
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    const formattedValue =
      value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
    setFilters((prev) => ({ ...prev, [key]: formattedValue }));
  };
  const getData = async () => {
    setLoading(true);
    const gymId = await retrieveGymId();
    const [metrics, lists] = await Promise.all([
      AxiosPrivate.get(
        `/api/membership-analysis/metrics/?gym_id=${gymId}${filters.startDate ? `&start_date=${filters.startDate}` : ""}${filters.endDate ? `&end_date=${filters.endDate}` : ""}`,
        {
          id: newID(
            `membership-analysis-metrics-${filters.startDate}-${filters.endDate}`
          ),
        }
      ),
      AxiosPrivate.get(
        `/api/membership-analysis/lists/?gym_id=${gymId}${filters.startDate ? `&start_date=${filters.startDate}` : ""}${filters.endDate ? `&end_date=${filters.endDate}` : ""}`,
        {
          id: newID(
            `membership-analysis-lists-${filters.startDate}-${filters.endDate}`
          ),
        }
      ),
    ]);
    console.log(metrics);
    setMetrics(metrics.data);
    console.log(lists);
    setData(
      lists.data.map((item: any, index: number) => ({ ...item, id: index }))
    );
    setLoading(false);
  };
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const getPreq = async () => {
      const demoInfo = await getDemographicInfo();
      setDemographic(demoInfo);
    };
    getData();
    getPreq();
  }, []);

  const applyFilters = async () => {
    // if (filters.dateRange && filters.startDate && filters.endDate) {
    //   if (
    //     !validateDateRange(
    //       filters.dateRange,
    //       filters.startDate,
    //       filters.endDate
    //     )
    //   ) {
    //     toast.error(
    //       `Invalid date range for ${filters.dateRange} filter. Please adjust your dates.`
    //     );
    //     return;
    //   } else {
    //     // setFilterInfo(filters.dateRange);
    //   }
    // }
    await getData();
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

  const getPackageColumns = useCallback(
    (column: keyof PackageData) => [
      {
        title: "Package Name",
        dataIndex: "package_name",
        key: "package_name",
        width: 200,
        render: (package_name: string) => (
          <Text className="font-medium text-gray-900">{package_name}</Text>
        ),
      },
      {
        title: "Package Type",
        dataIndex: "package_type",
        key: "package_type",
        width: 120,
        render: (package_type: string) => (
          <Badge
            color={
              package_type === "general"
                ? "primary"
                : package_type === "pt"
                  ? "success"
                  : "secondary"
            }
            variant="flat"
          >
            {package_type.toUpperCase()}
          </Badge>
        ),
      },
      {
        title: "Max Price",
        dataIndex: "package_max_price",
        key: "package_max_price",
        width: 120,
        render: (price: number) => (
          <Text className="text-nowrap">
            {demographic?.currency_symbol + " " + price}
          </Text>
        ),
      },
      {
        title: "Memberships",
        dataIndex: "membership_count",
        key: "membership_count",
        width: 120,
        render: (count: number) => <Text>{count}</Text>,
      },
      {
        title: "Amount Paid",
        dataIndex: "amount_paid",
        key: "amount_paid",
        width: 150,
        render: (amount: number) => (
          <Text className="text-nowrap">
            {demographic?.currency_symbol + " " + amount.toFixed(2)}
          </Text>
        ),
      },
      // {
      //   title: "Balance Due",
      //   dataIndex: "paid_balance_due",
      //   key: "paid_balance_due",
      //   width: 150,
      //   render: (balance: number) => (
      //     <Text className="text-warning font-medium">
      //       {demographic?.currency_symbol + " " + balance.toFixed(2)}
      //     </Text>
      //   ),
      // },
      {
        title: "Balance",
        dataIndex: "pending_balance_due",
        key: "pending_balance_due",
        width: 120,
        render: (pending_balance: number) => (
          <Text className="text-danger font-medium">
            {demographic?.currency_symbol + " " + pending_balance.toFixed(2)}
          </Text>
        ),
      },
      {
        title: "Last Purchase",
        dataIndex: "last_sold_date",
        key: "last_sold_date",
        width: 150,
        render: (last_sold_date: string) => (
          <Text>{formateDateValue(new Date(last_sold_date))}</Text>
        ),
      },
    ],
    [column, demographic]
  );
  const columns = useMemo(
    () => getPackageColumns(column),
    [column, getPackageColumns]
  );
  const handleFilterRange = (value: any) => {
    setFilters((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
    handleFilterChange("dateRange", value);
  };
  return (
    <>
      <AnalyticsFilter
        applyFilters={applyFilters}
        dateRangeInfo={dateRangeInfo}
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleFilterRange={handleFilterRange}
        // key={filter}
      />
      <div className="grid grid-cols-2 gap-10 lg:mr-8">
        <div className="col-span-full grid lg:grid-cols-[60%,40%] gap-8 ">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <AmountStats
              avg_and_highest_amount={metrics.avg_and_highest_amount}
              demographic={demographic}
            />
          )}
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <MembershipStats
              data={metrics.memberships_by_package}
              demographic={demographic}
            />
          )}
        </div>

        <div className="col-span-full grid lg:grid-cols-[35%,65%] gap-8 ">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <MembershipStatusDistribution
              memberships_by_status={metrics.memberships_by_status}
            />
          )}
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <MonthlyAnalysis monthly_trends={metrics.monthly_trends} />
          )}
        </div>
        <div className="col-span-full grid lg:grid-cols-[55%,45%] gap-8">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <PackageDiscountDistribution
              data={metrics.total_discount}
              demographic={demographic}
            />
          )}
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <UtilizationStats data={metrics.utilization_rate} />
          )}
        </div>
        <div className="col-span-full">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <MembershipActivityReport
              monthly_trends_details={metrics.monthly_trends_details}
              renewal_rate={metrics.renewal_rate}
            />
          )}
        </div>
      </div>
      <WidgetCard title="Top Memberships" className="">
        {loading || data === null ? (
          <div className="min-w-full flex items-center justify-center my-8">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={data}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500 }}
            className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap"
          />
        )}
      </WidgetCard>
    </>
  );
}
