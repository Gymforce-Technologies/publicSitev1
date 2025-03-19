"use client";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function GrowthTrend({
  className,
  data,
  total,
}: {
  className?: string;
  data: any;
  total: number;
}) {
  const [dataVal, setDataVal] = useState([]);
  const transformedData = dataVal.map((item: any) => ({
    ...item,
    monthName: dayjs()
      .month(item.month - 1)
      .format("MMMM"),
  }));
  useEffect(() => {
    if (data) {
      setDataVal(data);
    }
  }, [data]);
  const totalGrowth = dataVal.reduce((sum, item: any) => sum + item.count, 0);
  const maxGrowthMonth = transformedData.length
    ? transformedData.reduce((prev, current) =>
        prev.count > current.count ? prev : current
      )
    : 0;

  const growthDescription = `The total growth over these months is ${totalGrowth}, with the highest growth of ${maxGrowthMonth.count} occurring in ${maxGrowthMonth.monthName}.`;

  return (
    <WidgetCard title={"Growth Trend Analysis"} className={className}>
      <p className="p-4 text-sm text-gray-600">{growthDescription}</p>

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
              <linearGradient id="growthTrendChart" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#3872FA"
                  className="[stop-opacity:0.3] dark:[stop-opacity:0.2]"
                />
                <stop offset="95%" stopColor={"#3872FA"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3872FA"
              fill="url(#growthTrendChart)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
