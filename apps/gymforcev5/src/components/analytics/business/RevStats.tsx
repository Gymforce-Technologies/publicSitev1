"use client";
import WidgetCard from "@core/components/cards/widget-card";
import dayjs from "dayjs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { formatNumber } from "@core/utils/format-number";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";

export default function ExpenseStats({
  className,
  data,
  demographic,
}: {
  className?: string;
  data: any[];
  demographic: any;
}) {
  const transformedData = data.map((item, index) => {
    return {
      ...item,
      month: dayjs(item.month).format("MMM"),
      color: `hsl(${(index * 50) % 360}, 70%, 60%)`, // Generate unique colors
    };
  });
  return (
    <WidgetCard title={"Expense Stats"} className={className}>
      <div className="mt-5 aspect-[1060/660] w-full lg:mt-7">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={transformedData}
            margin={{
              left: -20,
            }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <defs>
              <linearGradient id="Expenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#3872FA"
                  className="[stop-opacity:0.4] dark:[stop-opacity:0.3]"
                />
                <stop offset="95%" stopColor={"#3872FA"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              dataKey="total_expenses"
              tickFormatter={formatYAxisTick}
              tick={({ payload, ...rest }) => {
                const pl = {
                  ...payload,
                  value: formatNumber(Number(payload.value)),
                };
                return (
                  <CustomYAxisTick
                    prefix={demographic?.currency_symbol || ""}
                    payload={pl}
                    {...rest}
                  />
                );
              }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  payload={transformedData}
                  prefix={demographic?.currency_symbol || ""}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="total_expenses"
              stackId="1"
              strokeWidth={2}
              stroke="#3872FA"
              // fill="#3872FA"
              fill="url(#Expenses)"
              // fillOpacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

const formatYAxisTick = (value: number): string => {
  if (value >= 1000) {
    return `$${value / 1000}k`;
  }
  return value.toString();
};
