"use client";

import { Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
// import { PiDownloadSimple, PiUploadSimple } from "react-icons/pi";
import SimpleBar from "@core/ui/simplebar";
import MetricCard from "@core/components/cards/metric-card";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";
import TrendingUpIcon from "@core/components/icons/trending-up";
import cn from "@core/utils/class-names";

// Define types for the new data structure
type MonthlyDataPoint = {
  month: number;
  year: number;
  expirations?: number;
  new_memberships?: number;
  renewals?: number;
};

type ActivityReportProps = {
  className?: string;
  monthly_trends_details?: {
    expirations?: MonthlyDataPoint[];
    new_memberships?: MonthlyDataPoint[];
    renewals?: MonthlyDataPoint[];
  };
  renewal_rate?: number;
};

export default function MembershipActivityReport({
  className,
  monthly_trends_details,
  renewal_rate,
}: ActivityReportProps) {
  // Prepare data for the chart, combining all available data points
  const prepareChartData = () => {
    const allMonths = new Set<string>();
    [
      monthly_trends_details?.expirations || [],
      monthly_trends_details?.new_memberships || [],
      monthly_trends_details?.renewals || [],
    ]
    .forEach((dataArray) => {
      dataArray.forEach((item) => {
        if (item.month !== null && item.year !== null) {
          allMonths.add(
            `${item.year}-${item.month.toString().padStart(2, "0")}`
          );
        }
      });
    });

    const sortedMonths = Array.from(allMonths).sort();

    return sortedMonths.map((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);

      const expirationItem = monthly_trends_details?.expirations?.find(
        (e) => e.month === month && e.year === year
      );
      const newMembershipItem = monthly_trends_details?.new_memberships?.find(
        (n) => n.month === month && n.year === year
      );
      const renewalItem = monthly_trends_details?.renewals?.find(
        (r) => r.month === month && r.year === year
      );

      return {
        month: new Date(year, month - 1).toLocaleString("default", {
          month: "short",
        }),
        expirations: expirationItem?.expirations || 0,
        'New Memberships': newMembershipItem?.new_memberships || 0,
        renewals: renewalItem?.renewals || 0,
      };
    });
  };

  // Calculate totals
  const totalExpirations =
    monthly_trends_details?.expirations?.reduce(
      (sum, item) => sum + (item.expirations || 0),
      0
    ) || 0;
  const totalNewMemberships =
    monthly_trends_details?.new_memberships?.reduce(
      (sum, item) => sum + (item.new_memberships || 0),
      0
    ) || 0;
  const totalRenewals =
    monthly_trends_details?.renewals?.reduce(
      (sum, item) => sum + (item.renewals || 0),
      0
    ) || 0;

  const chartData = prepareChartData();
  const statsArray = [
    {
      id: 1,
      icon: <TrendingUpIcon className=" text-primary h-8 w-8" />,
      title: "New Memberships",
      metric: totalNewMemberships,
    },
    {
      id: 2,
      icon: <CheckCircleIcon className=" text-primary" />,
      title: "Renewals",
      metric: totalRenewals,
    },
    // {
    //   id: 3,
    //   icon: <ClockIcon className=" text-primary" />,
    //   title: "Avg. Conversion Time",
    // },
    {
      id: 3,
      icon: <XCircleIcon className=" text-primary" />,
      title: "Expired Memberships",
      metric: totalExpirations,
    },
    {
      id: 4,
      icon: <CheckCircleIcon className=" text-primary" />,
      title: "Renewal Rate",
      metric: renewal_rate ? `${renewal_rate} %` : "0",
    },
  ];
  return (
    <WidgetCard
      title={"Activity"}
      titleClassName="text-lg xl:text-xl font-semibold text-nowrap"
      className={className}
    >
      <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-8 my-4", className)}>
        {statsArray
          // .filter((stat) => stat.metric !== "N/A")
          .map((stat) => (
            <MetricCard
              key={stat.title}
              title={stat.title}
              metric={stat.metric}
              icon={stat.icon}
              className="!p-3 hover:scale-105 duration-150 border-none"
              iconClassName="bg-transparent size-10"
            />
          ))}
      </div>
      <SimpleBar>
        <div className="h-96 w-full pt-9 col-span-1">
          <ResponsiveContainer width="100%" height="100%" minWidth={700}>
            <AreaChart
              data={chartData}
              margin={{
                left: -16,
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient id="newMemberships" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B46FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6B46FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="renewals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#00D1FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expiry" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="month"
                // axisLine={false}
                tickLine={false}
                className=" "
              />
              <YAxis tickLine={false} className=" " />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="New Memberships"
                stroke="#6B46FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#newMemberships)"
              />
              <Area
                type="monotone"
                dataKey="renewals"
                stroke="#00D1FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#renewals)"
              />
              <Area
                type="monotone"
                dataKey="expirations"
                stroke="#F43F5E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expiry)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}
