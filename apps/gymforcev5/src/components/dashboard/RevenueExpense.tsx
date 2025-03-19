import React from "react";
import WidgetCard from "@core/components/cards/widget-card";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  LabelList,
} from "recharts";
import { useMedia } from "@core/hooks/use-media";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import SimpleBar from "@core/ui/simplebar";
import { Title, Text, Loader } from "rizzui";
import cn from "@core/utils/class-names";
import TrendingUpIcon from "@core/components/icons/trending-up";
import { formatNumber } from "@core/utils/format-number";
import { useTheme } from "next-themes";

interface RevenueExpenseData {
  date: string;
  value: number;
}

interface GraphData {
  current: {
    expense: RevenueExpenseData[];
    revenue: RevenueExpenseData[];
  };
  previous: {
    expense: RevenueExpenseData[];
    revenue: RevenueExpenseData[];
  };
}

interface DashboardData {
  current: {
    Expense: number;
    revenue: number;
  };
  graph: GraphData;
  name: string;
  percentage_change: {
    expense: number;
    revenue: number;
  };
  previous: {
    expense: number;
    revenue: number;
  };
}

interface RevenueExpenseGraphProps {
  stats: DashboardData;
  className?: string;
  filter: string;
  info: any;
  isLoading: boolean;
  hideValues: boolean;
}

const RevenueExpenseGraph: React.FC<RevenueExpenseGraphProps> = ({
  stats,
  className,
  filter,
  info,
  isLoading,
  hideValues,
}) => {
  const isTablet = useMedia("(max-width: 820px)", false);
  if (!stats || isLoading)
    return (
      <WidgetCard
        title={"Revenue vs Expense"}
        titleClassName="text-gray-900"
        className="lg:col-span-6 py-8 col-span-full"
      >
        <div className="flex flex-1 items-center justify-center min-w-full my-10">
          <Loader size="xl" variant="threeDot" />
        </div>
      </WidgetCard>
    );

  const { current, graph, name, percentage_change } = stats;
  const getBarSize = (filter: string) => {
    switch (filter.toLowerCase()) {
      case "daily":
        return isTablet ? 40 : 50;
      case "weekly":
        return isTablet ? 25 : 32;
      case "monthly":
        return isTablet ? 30 : 40;
      case "yearly":
        return isTablet ? 15 : 18;
      default:
        return isTablet ? 20 : 24;
    }
  };

  const barSize = getBarSize(filter);

  const processData = () => {
    const filterLower = filter.toLowerCase();

    return graph.current.revenue.map((item, index) => {
      let key;
      if (filterLower === "weekly") {
        const match = item.date.match(/Day (\d+) - (\d{4}-\d{2}-\d{2})/);
        if (match) {
          const [, dayNumber, date] = match;
          key = `Day ${dayNumber} (${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
        } else {
          key = item.date;
        }
      } else if (filterLower === "monthly") {
        key = item.date;
      } else if (filterLower === "yearly") {
        const [year, month] = item.date.split("-");
        key = new Date(`${year}-${month}`).toLocaleDateString("en-US", {
          month: "short",
        });
      } else {
        // Default case (e.g., daily)
        key = new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      return {
        key,
        revenue: item.value,
        expense: graph.current?.expense[index]?.value || 0,
      };
    });
  };

  const data = processData();

  return (
    <WidgetCard
      title={name}
      titleClassName="text-gray-900 "
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className={`me-2 font-semibold text-gray-700  }`}>
            {hideValues
              ? `***`
              : info?.currency_symbol + " " + formatNumber(current.revenue)}
          </Title>
          <Text className="flex items-center leading-none">
            <Text
              as="span"
              className={cn(
                "me-2 inline-flex items-center font-medium",
                percentage_change.revenue >= 0
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              <TrendingUpIcon
                className={cn(
                  "me-1 h-4 w-4",
                  percentage_change.revenue >= 0 ? "" : "rotate-180"
                )}
              />
              {Math.abs(percentage_change.revenue).toFixed(2)}%
            </Text>
          </Text>
        </div>
      }
      descriptionClassName=" mt-1.5 "
      className={className + ` dark:bg-inherit w-full border-gray-400 `}
    >
      <Legend className="mt-2 flex @2xl:hidden @3xl:flex @5xl:hidden" />
      <SimpleBar>
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: "700px" })}
          >
            <ComposedChart
              data={data}
              barSize={barSize}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient
                  id="colorRevenue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#A5BDEC" />
                  <stop offset="0.8" stopColor="#477DFF" />
                  <stop offset="1" stopColor="#477DFF" />
                </linearGradient>
                <linearGradient
                  id="colorExpense"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#fef3c7" />
                  <stop offset="0.8" stopColor="#FCB03D" />
                  <stop offset="1" stopColor="#FCB03D" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="key"
                axisLine={false}
                tickLine={false}
                className="text-gray-700 "
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={({ payload, ...rest }) => {
                  const pl = {
                    ...payload,
                    value: formatNumber(Number(payload.value)),
                  };
                  return (
                    <CustomYAxisTick
                      prefix={info.currency_symbol}
                      payload={pl}
                      {...rest}
                    />
                  );
                }}
                className={`text-gray-700 ${hideValues ? "hidden" : ""}`}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    formattedNumber
                    prefix={info.currency_symbol}
                    className={hideValues ? "hidden" : ""}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="url(#colorRevenue)"
                stroke="#477DFF"
                strokeOpacity={0.3}
                radius={[4, 4, 0, 0]}
              >
                {/* <LabelList dataKey="revenue" content={<CustomizedLabel />} position="top" /> */}
              </Bar>
              <Bar
                dataKey="expense"
                fill="url(#colorExpense)"
                stroke="#FCB03D"
                strokeOpacity={0.3}
                radius={[4, 4, 0, 0]}
              >
                {/* <LabelList dataKey="expense" content={<CustomizedLabel />} position="top" /> */}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
};

interface LegendProps {
  className?: string;
}

const Legend: React.FC<LegendProps> = ({ className }) => {
  return (
    <div className={cn("flex-wrap items-start gap-3 lg:gap-4", className)}>
      <span className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: `linear-gradient(180deg, #A5BDEC 0%, #477DFF 53.65%)`,
          }}
        />
        <span className="">Revenue</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: `linear-gradient(180deg, #fef3c7 0%, #FCB03D 53.65%)`,
          }}
        />
        <span className="">Expense</span>
      </span>
    </div>
  );
};

export default RevenueExpenseGraph;
