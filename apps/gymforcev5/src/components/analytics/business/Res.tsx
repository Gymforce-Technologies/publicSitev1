"use client";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
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

export default function Res({
  className,
  data,
}: {
  className?: string;
  data: any;
}) {
  const transformedData = data.map((item: any, index: number) => ({
    ...item,
    month: dayjs(item.month).format("MMM"),
  }));

  return (
    <WidgetCard title={"Revenue Chart"} className={className}>
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
              <linearGradient
                id="stackedAreaChart1"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#3872FA"
                  className="[stop-opacity:0.4] dark:[stop-opacity:0.3]"
                />
                <stop offset="95%" stopColor={"#3872FA"} stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="stackedAreaChart2"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#10b981"
                  className="[stop-opacity:0.4] dark:[stop-opacity:0.3]"
                />
                <stop offset="95%" stopColor={"#10b981"} stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="stackedAreaChart3"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#eab308"
                  className="[stop-opacity:0.4] dark:[stop-opacity:0.3]"
                />
                <stop offset="95%" stopColor={"#eab308"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatYAxisTick} />
            <Tooltip content={<CustomTooltip formattedNumber />} />
            <Area
              type="monotone"
              dataKey="fresh_sales"
              stackId="1"
              strokeWidth={2}
              stroke="#3872FA"
              fill="url(#stackedAreaChart1)"
            />
            <Area
              type="monotone"
              dataKey="renewals"
              stackId="1"
              strokeWidth={2}
              stroke="#10b981"
              fill="url(#stackedAreaChart2)"
            />
            <Area
              type="monotone"
              dataKey="dues_paid"
              stackId="1"
              stroke="#eab308"
              strokeWidth={2}
              fill="url(#stackedAreaChart3)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

const formatYAxisTick = (value: number): string => {
  if (value >= 1000) {
    return `${value / 1000}k`;
  }
  return value.toString();
};
