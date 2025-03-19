"use client";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { formatNumber } from "@core/utils/format-number";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyExpenseTrendsChart({
  data,
  className,
  demographic,
}: {
  data: Array<{ month: string; total_expenses: number }>;
  className?: string;
  demographic: any;
}) {
  // Transform the data to match chart requirements
  const chartData = data.map((item) => ({
    name: new Date(item.month).toLocaleString("default", { month: "short" }),
    expenses: item.total_expenses,
  }));

  return (
    <WidgetCard
      title={"Monthly Expense Trends"}
      description={"Expense variations across months"}
      className={className}
    >
      <div className="mt-5 aspect-[1060/660] w-full lg:mt-7">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              left: -20,
            }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <defs>
              <linearGradient
                id="expenseTrendsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#f1416c"
                  className="[stop-opacity:0.3] dark:[stop-opacity:0.2]"
                />
                <stop offset="95%" stopColor={"#f1416c"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatYAxisTick} />
            <Tooltip
              content={
                <CustomTooltip
                  formattedNumber
                  prefix={demographic?.currency_symbol || ""}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#f1416c"
              fill="url(#expenseTrendsGradient)"
              strokeWidth={2}
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
