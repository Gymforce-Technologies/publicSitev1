"use client";
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Box } from "rizzui";
import { useTheme } from "next-themes";
import dayjs from "dayjs";
import SimpleBar from "simplebar-react";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomToolTP } from "./CustomTP";

export default function MonthlyAnalysis({
  monthly_trends = [],
  className,
}: {
  monthly_trends?: Array<{
    month: number;
    year: number;
    sold: number;
    package__package_type?: string;
  }>;
  className?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const processedData = monthly_trends.map((item) => ({
    month: dayjs()
      .month(item.month - 1)
      .format("MMM"),
    purchases: item.sold,
    packageType: item.package__package_type,
  }));

  return (
    <WidgetCard
      rounded="lg"
      className={className}
      title="Membership Purchases Month Wise"
    >
      <SimpleBar className="w-full max-h-[50vh]">
        <Box className="mt-6 h-72 w-full @sm:mt-3 @lg:mt-8">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={400}
            className="overflow-hidden"
          >
            <BarChart
              data={processedData}
              margin={{
                left: -5,
                right: 5,
                bottom: 10,
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={20}
              />
              <YAxis axisLine={false} tickLine={false} tickMargin={20} />
              <Tooltip content={<CustomToolTP />} />
              <Bar
                dataKey="purchases"
                className="fill-[#29CCB1] dark:[fill-opacity:0.9]"
                name="Purchases"
                barSize={16}
                radius={20}
                background={{
                  fill: isDark ? "#333333" : "#F1F1F2",
                  radius: 20,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleBar>
    </WidgetCard>
  );
}
