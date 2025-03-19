"use client";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { formatNumber } from "@core/utils/format-number";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import SimpleBar from "simplebar-react";

export default function AmountStats({
  className,
  avg_and_highest_amount,
  demographic,
}: {
  className?: string;
  avg_and_highest_amount: Array<{
    month: number;
    avg_amount: number;
    highest_amount: number;
  }>;
  demographic: any;
}) {
  const [data, setData] = useState<any[]>([]);
  const formatYAxisTick = (value: number): string => {
    if (value >= 1000) {
      return `$${value / 1000}k`;
    }
    return value ? value.toString() : "0";
  };
  useEffect(() => {
    const transformedData = avg_and_highest_amount
      .map((item) => ({
        "Average Amount": item.avg_amount || 0,
        "Highest Amount": item.highest_amount || 0,
        monthName: dayjs()
          .month(item.month - 1)
          .format("MMMM"),
      }))
      .filter(
        (item) => item["Average Amount"] !== 0 || item["Highest Amount"] !== 0
      );

    // Only set data if there are non-zero entries
    if (transformedData.length > 0) {
      setData(transformedData);
    }
  }, [avg_and_highest_amount]);
  return (
    <WidgetCard
      className={className+ " pb-4"}
      title="Membership Purchase"
      titleClassName="whitespace-nowrap"
      headerClassName="flex-col @md:flex-row @md:items-center gap-2 mb-6"
      actionClassName="w-full flex justify-end items-center ps-0  "
      
    >
      {data !== null && (
        <SimpleBar className="max-h-fit md:max-h-[60vh]">
          <div className="h-[400px] w-full ">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  left: -10,
                  right: 15,
                  bottom: 25,
                }}
              >
                <defs>
                  <linearGradient
                    id="averageGradient"
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
                    id="highestGradient"
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
                </defs>
                <CartesianGrid strokeDasharray="0 0" strokeOpacity={0.435} />
                <XAxis
                  dataKey="monthName"
                  tickMargin={10}
                  tickLine={false}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, "auto"]} // Explicitly set domain
                  tickLine={false}
                  tickFormatter={formatYAxisTick}
                  tick={({ payload, ...rest }) => {
                    const pl = {
                      ...payload,
                      value: formatNumber(Number(payload.value) || 0),
                    };
                    console.log(pl);
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
                      prefix={demographic?.currency_symbol || ""}
                      formattedNumber
                    />
                  }
                  cursor={false}
                  defaultIndex={4}
                />
                <Area
                  strokeWidth={2}
                  type="monotone"
                  dataKey="Average Amount"
                  stroke="#3872FA"
                  fill="url(#averageGradient)"
                  activeDot={{ r: 6 }}
                />
                <Area
                  strokeWidth={2}
                  type="monotone"
                  dataKey="Highest Amount"
                  stroke="#10b981"
                  fill="url(#highestGradient)"
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SimpleBar>
      )}
    </WidgetCard>
  );
}
