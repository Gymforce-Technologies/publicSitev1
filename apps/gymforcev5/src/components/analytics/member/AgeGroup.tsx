"use client";
import { Box, Text } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FDCB6E", "#6C5CE7"];

export default function AgeGroupDistribution({
  className,
  data,
  total,
}: {
  className?: string;
  data: any;
  total: number;
}) {
  const [dataVal, setDataVal] = useState([
    { name: "Kids", value: 16, ageRange: "5-14" },
    { name: "Teens", value: 3, ageRange: "15-24" },
    { name: "Adults", value: 10, ageRange: "25-40" },
    { name: "Middle-Aged", value: 5, ageRange: "41-65" },
    { name: "Seniors", value: 8, ageRange: "65+" },
  ]);

  // const valueSum = data.reduce((total, item) => total + item.value, 0);
  const calculatePercentage = (part: number, total: number) =>
    ((part / total) * 100).toFixed(0);

  useEffect(() => {
    if (data) {
      setDataVal([
        { name: "Kids", value: data["5-14"] ?? 0, ageRange: "5-14" },
        { name: "Teens", value: data["15-24"] ?? 0, ageRange: "15-24" },
        { name: "Adults", value: data["25-40"] ?? 0, ageRange: "25-40" },
        { name: "Middle-Aged", value: data["41-65"] ?? 0, ageRange: "41-65" },
        { name: "Seniors", value: data["65+"] ?? 0, ageRange: "65+" },
      ]);
    }
  }, [data]);
  return (
    <WidgetCard
      title="Age Group Distribution"
      className={cn("@container", className)}
    >
      <Box className="relative mx-auto size-[300px] @sm:size-[340px] scale-90">
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="relative z-10 "
        >
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              dataKey="value"
              innerRadius="50%"
              outerRadius="70%"
              fill="#8884d8"
              paddingAngle={2}
              data={dataVal}
              label={({ value }) => `${calculatePercentage(value, total)}%`}
            >
              {dataVal.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <Box className="absolute inset-10 rounded-full border-[48px] border-white bg-gray-100/70 shadow-[0px_4px_20px_0px_#00000029] @sm:border-[54px] dark:border-gray-0" />
        <Box className="absolute inset-28 rounded-full bg-white dark:bg-gray-0" />
      </Box>
      <Box className="flex flex-wrap justify-center gap-4 @lg:gap-8">
        {dataVal.map((item, index) => (
          <Box key={item.name} className="grid gap-2 min-w-[1/3]">
            <Box className="flex items-center">
              <span
                className="me-2 h-2.5 w-2.5 flex-shrink-0 rounded-full "
                style={{ backgroundColor: COLORS[index] }}
              />
              <Text as="span" className="whitespace-nowrap">
                {item.name} <small>({item.ageRange})</small>
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </WidgetCard>
  );
}
