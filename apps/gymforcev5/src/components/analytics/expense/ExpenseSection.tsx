"use client";
import { useCallback, useEffect, useState } from "react";
// import { filterOptions } from "../../Filter";
import dayjs from "dayjs";
import { getCurrentDateRange } from "@/components/ValidDate";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import ExpenseBreakdown from "@/components/analytics/expense/ExpenseStats";
import REStats from "@/components/analytics/expense/Stats";
import MonthlyExpenseTrendsChart from "@/components/analytics/expense/MonthlyAnalysis";
import TopPayments from "@/components/analytics/expense/PaymentModes";
import TopCategories from "@/components/analytics/expense/Topcategories";
import StatCards from "@/components/analytics/expense/StatsCards";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import AnalyticsFilter from "../AnalyticsFilter";
import { Loader } from "rizzui";

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

export default function ExpenseSection() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[4].value,
    startDate: `${dayjs().year()}-01-01`,
    endDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
  });
  const [metrics, setMetrics] = useState<any>(null);
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    const formattedValue =
      value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
    setFilters((prev) => ({ ...prev, [key]: formattedValue }));
  };
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);

  const getData = async () => {
    setLoading(true);
    const gymId = await retrieveGymId();
    const metrics = await AxiosPrivate.get(
      `/api/expense-analysis/metrics/?gym_id=${gymId}${filters.startDate ? `&start_date=${filters.startDate}` : ""}${filters.endDate ? `&end_date=${filters.endDate}` : ""}`,
      {
        id: newID(
          `expense-analysis-metrics-${filters.startDate}-${filters.endDate}`
        ),
      }
    );
    console.log(metrics);
    setMetrics(metrics.data);
    setLoading(false);
  };
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
      <div className="grid lg:grid-cols-2 gap-10 lg:mr-8">
        <div className="col-span-full ">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <StatCards
              data={{
                expense_per_member_ratio: metrics.expense_per_member_ratio,
                total_operational_expenses: metrics.total_operational_expenses,
                marketing_vs_acquisition: metrics.marketing_vs_acquisition,
              }}
              demographic={demographic}
            />
          )}
        </div>
        {loading || metrics === null ? (
          <div className="min-w-full flex items-center justify-center my-8">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <TopCategories
            top_expense_categories={metrics.top_expense_categories}
            demographic={demographic}
          />
        )}
        {loading || metrics === null ? (
          <div className="min-w-full flex items-center justify-center my-8">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <REStats
            data={metrics.revenue_to_expense_ratio}
            demographic={demographic}
          />
        )}
        <div className="col-span-full grid lg:grid-cols-[60%,40%] gap-8">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <MonthlyExpenseTrendsChart
              data={metrics.monthly_expense_trends}
              demographic={demographic}
            />
          )}
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <TopPayments
              data={metrics.payment_mode_details}
              demographic={demographic}
            />
          )}
        </div>
        {loading || metrics === null ? (
          <div className="min-w-full flex items-center justify-center my-8">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <ExpenseBreakdown
            expenseBreakdown={metrics.expense_breakdown}
            demographic={demographic}
          />
        )}
      </div>
    </>
  );
}
