"use client";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMedia } from "@core/hooks/use-media";
import dayjs from "dayjs";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { formatNumber } from "@core/utils/format-number";

export default function ProfitLossBarChart({
  className,
  data,
  demographic,
}: {
  className?: string;
  data: any[];
  demographic: any;
}) {
  const isMediumScreen = useMedia("(max-width: 1200px)", false);
  const profitLossData = data.map((item, index) => {
    return {
      ...item,
      month: dayjs(item.month).format("MMM"),
    };
  });
  return (
    <WidgetCard title={"Profit & Loss Chart"} className={className}>
      <div className="mt-5 aspect-[1060/660] w-full lg:mt-7">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={profitLossData}
            barSize={isMediumScreen ? 18 : 24}
            margin={{
              left: -10,
            }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis tickLine={false} dataKey="month" />
            <YAxis
              tickLine={false}
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
                  formattedNumber={true}
                  prefix={demographic?.currency_symbol || ""}
                />
              }
            />
            <Legend />
            <Bar dataKey="revenue" fill="#34D399" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            {/* <Bar dataKey="profit_or_loss" fill="#5a5fd7" radius={[4, 4, 0, 0]} /> */}
          </BarChart>
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
