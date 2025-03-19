"use client";
import { useState } from "react";
import cn from "@core/utils/class-names";
import { Box, Flex, Title } from "rizzui";
import { DatePicker } from "@core/ui/datepicker";
import WidgetCard from "@core/components/cards/widget-card";
import TrendingUpIcon from "@core/components/icons/trending-up";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export default function CategoryStats({
  data,
  total,
  className,
}: {
  data: Array<{ category__name: string | null; count: number }>;
  total: number;
  className?: string;
}) {
  // Transform category data for RadialBarChart
  const radialChartData = data.map((category, index) => ({
    name: category.category__name || "Others",
    count: category.count,
    fill: ["#3962F7", "#2750AF", "#E6B9DE"][index % 3], // Cycle through colors
  }));
  const totalCount = data.reduce((sum, category) => sum + category.count, 0);
//   const percentageChange = (((totalCount - total) / total) * 100).toFixed(2);

  return (
    <WidgetCard
      title="Category Analytics"
      className={cn("@container", className)}
      titleClassName="text-gray-500 font-normal text-sm sm:text-sm font-inter"
    >
      <Flex align="center" gap="2" className="mb-3 mt-1">
        <Title as="h2" className="font-inter text-2xl">
          {totalCount}
        </Title>
      </Flex>

      <Flex
        align="center"
        direction="col"
        justify="center"
        className="h-[calc(100%-80px)] @sm:flex-row"
      >
        <Box className="size-60 @lg:size-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={radialChartData}
              barSize={16}
              innerRadius="35%"
              outerRadius="110%"
              className="@sm:[&_>svg]:-ms-2"
            >
              <RadialBar
                background
                cornerRadius={20}
                dataKey="count"
                className="[&_.recharts-radial-bar-background-sector]:fill-gray-100"
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </Box>
        <CustomLegend data={radialChartData} className="@sm:w-36" />
      </Flex>
    </WidgetCard>
  );
}

function CustomLegend({
  data,
  className,
}: {
  data: Array<{ name: string; count: number; fill: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-6 gap-x-10 @sm:flex-col @sm:items-center @md:justify-start",
        className
      )}
    >
      {data.map((item) => (
        <div
          key={item.name}
          className="flex w-2/5 flex-col items-center text-gray-500 @sm:items-start"
        >
          <div className="relative">
            <span
              className="absolute start-0 top-1/2 h-3 w-3 -translate-x-6 -translate-y-1/2 rounded rtl:translate-x-6"
              style={{ backgroundColor: item.fill }}
            />
            <span className="block">{item.name}</span>
            <span className="font-inter text-base font-semibold leading-none text-gray-900 @sm:text-xl">
              {item.count}+
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
