"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
// import { filterOptions } from "../../Filter";
import dayjs from "dayjs";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { Loader, Select, Text } from "rizzui";
import { getCurrentDateRange } from "@/components/ValidDate";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import ExpenseChart from "@/components/analytics/business/ExpenseStats";

import StatCards from "@/components/analytics/business/StatCards";
import PageStatCards from "@/components/analytics/business/PageStats";
import WidgetCard from "@core/components/cards/widget-card";

import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import AnalyticsFilter from "../AnalyticsFilter";
import dynamic from "next/dynamic";
// import Table from "@/components/table";
// import ProfitLossBarChart from "@/components/analytics/business/RevExp";
// import Res from "@/components/analytics/business/Res";
const Table = dynamic(() => import(`@/components/table`));
const ProfitLossBarChart = dynamic(
  () => import(`@/components/analytics/business/RevExp`),
  {
    loading: () => (
      <div className=" my-8 col-span-full flex flex-1 items-center justify-center min-w-full">
        <Loader size="xl" variant="threeDot" />
      </div>
    ),
  }
);
const Res = dynamic(() => import(`@/components/analytics/business/Res`), {
  loading: () => (
    <div className=" my-8 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="threeDot" />
    </div>
  ),
});

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

interface RevenueData {
  date?: string;
  dues_paid_revenue?: number;
  expenses?: number;
  followups_created?: number;
  fresh_sales_revenue?: number;
  inquiries_created?: number;
  memberships_expired?: number;
  memberships_renewed?: number;
  memberships_sold?: number;
  profit_or_loss?: number;
  renewal_revenue?: number;
  revenue?: number;
}

export default function BusinessSection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[4].value,
    startDate: `${dayjs().year()}-01-01`,
    endDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
  });
  const [column, setColumn] = useState<keyof RevenueData>("date");
  const [metrics, setMetrics] = useState<any>(null);
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    const formattedValue =
      value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
    setFilters((prev) => ({ ...prev, [key]: formattedValue }));
  };
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(dayjs().month() + 1); // Default to current month
  const [paginatedData, setPaginatedData] = useState<RevenueData[]>([]);

  const getData = async () => {
    setLoading(true);
    const gymId = await retrieveGymId();
    const metrics = await AxiosPrivate.get(
      `/api/business-analysis/metrics/?gym_id=${gymId}${filters.startDate ? `&start_date=${filters.startDate}` : ""}${filters.endDate ? `&end_date=${filters.endDate}` : ""}`,
      {
        id: newID(
          `business-analysis-metrics-${filters.startDate}-${filters.endDate}`
        ),
      }
    );

    const lists = await AxiosPrivate.get(
      `/api/business-analysis/lists/?gym_id=${gymId}${`&start_date=${dayjs().subtract(10, "days").format("YYYY-MM-DD")}`}${`&end_date=${dayjs().format("YYYY-MM-DD")}`}`,
      {
        id: newID(
          `business-analysis-lists-${filters.startDate}-${filters.endDate}`
        ),
      }
    );
    setMetrics(metrics.data);
    setData(lists.data);
    setLoading(false);
  };
  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (filters.dateRange === "yearly" && data?.daily_summary) {
      // Filter data for the selected month
      const filteredData = data.daily_summary.filter((item: RevenueData) => {
        const itemMonth = dayjs(item.date).month() + 1;
        return itemMonth === currentPage;
      });
      setPaginatedData(filteredData);
    } else {
      setPaginatedData(data?.daily_summary || []);
    }
  }, [data, filters.dateRange, currentPage]);

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  const applyFilters = async () => {
    await getData();
  };

  const getPackageColumns = useCallback(
    (column: keyof RevenueData) => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 150,
        render: (date: string) => (
          <Text>{formateDateValue(new Date(date))}</Text>
        ),
      },
      {
        title: "Dues Paid",
        dataIndex: "dues_paid_revenue",
        key: "dues_paid_revenue",
        width: 150,
        render: (revenue: number) => (
          <Text className="text-nowrap">
            {revenue ? demographic?.currency_symbol + " " + revenue : 0}
          </Text>
        ),
      },
      {
        title: "Expenses",
        dataIndex: "expenses",
        key: "expenses",
        width: 120,
        render: (expenses: number) => (
          <Text className="text-nowrap">
            {expenses
              ? demographic?.currency_symbol + " " + expenses.toFixed(2)
              : 0}
          </Text>
        ),
      },
      // {
      //   title: "Followups Created",
      //   dataIndex: "followups_created",
      //   key: "followups_created",
      //   width: 120,
      //   render: (count: number) => <Text>{count ? count : 0}</Text>,
      // },
      {
        title: "New Purchases",
        dataIndex: "fresh_sales_revenue",
        key: "fresh_sales_revenue",
        width: 150,
        render: (revenue: number) => (
          <Text className="text-nowrap">
            {revenue
              ? demographic?.currency_symbol + " " + revenue.toFixed(2)
              : 0}
          </Text>
        ),
      },
      {
        title: "Enquiries",
        dataIndex: "inquiries_created",
        key: "inquiries_created",
        width: 120,
        render: (count: number) => <Text>{count ?? 0}</Text>,
      },
    
      {
        title: "Memberships Sales",
        dataIndex: "memberships_sold",
        key: "memberships_sold",
        width: 150,
        render: (count: number) => <Text>{count ?? 0}</Text>,
      },
      {
        title: "Total Revenue",
        dataIndex: "revenue",
        key: "revenue",
        width: 120,
        render: (revenue: number) => (
          <Text className="text-nowrap font-semibold">
            {revenue
              ? demographic?.currency_symbol + " " + revenue.toFixed(2)
              : 0}
          </Text>
        ),
      },
    ],
    [column, demographic]
  );

  const columns = useMemo(
    () => getPackageColumns(column),
    [column, getPackageColumns]
  );

  useEffect(() => {
    const getPreq = async () => {
      const demoInfo = await getDemographicInfo();
      setDemographic(demoInfo);
    };
    getData();
    getPreq();
  }, []);

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
      {loading || metrics === null ? (
        <div className="min-w-full flex items-center justify-center my-8">
          <Loader variant="threeDot" size="lg" />
        </div>
      ) : (
        <PageStatCards data={metrics?.key_metrics} demographic={demographic} />
      )}
      {loading || metrics === null ? (
        <div className="min-w-full flex items-center justify-center my-8 mx-8">
          <Loader variant="threeDot" size="lg" />
        </div>
      ) : (
        <StatCards
          data={metrics.key_metrics}
          demographic={demographic}
          dateRange={filters.dateRange}
        />
      )}
      <div className="grid grid-cols-1 gap-8 lg:ml-8">
        <div className="space-y-6 ">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <ExpenseChart
              data={metrics.expense_graph}
              demographic={demographic}
            />
          )}
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <ProfitLossBarChart
              demographic={demographic}
              data={metrics.profit_loss_graph}
            />
          )}
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8 ">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <Res
              // className="col-span-full"
              data={metrics.revenue_graph}
            />
          )}
        </div>
      </div>
      <WidgetCard title="Last 10 Days Business Summary" className="lg:ml-8">
        {loading || data === null ? (
          <div className="min-w-full flex items-center justify-center my-8">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={paginatedData || []}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500 }}
            className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap"
            striped
          />
        )}
        {/* <div className="flex min-w-full items-center justify-end">
          {filters.dateRange === "yearly" && (
            <Pagination
              total={12} // 12 months
              current={currentPage}
              onChange={handlePageChange}
              outline={false}
              rounded="md"
              variant="solid"
              color="primary"
              pageSize={1}
              showTitle={true}
            />
          )}
        </div> */}
      </WidgetCard>
    </>
  );
}
