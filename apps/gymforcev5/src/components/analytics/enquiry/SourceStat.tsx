"use client";
import { useEffect, useState } from "react";
import { Box, Flex, Text } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const calculatePercentage = (part: number, total: number) =>
  ((part / total) * 100).toFixed(2);

const COLORS = [
  "#36c294", // Green for first category
  "#eb6069", // Red for second category
  "#3B82F6", // Blue for additional categories if needed
  "#8B5CF6", // Purple for additional categories
];

export default function SourceStat({
  className,
  data,
  total,
}: {
  className?: string;
  data: Array<{
    source__leadSourceName: string | null;
    count: number;
  }>;
  total: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dataVal, setDataVal] = useState<
    Array<{ name: string; value: number }>
  >([]);

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (data && data.length > 0) {
      // Sort data by count in descending order
      const sortedData = [...data].sort((a, b) => b.count - a.count);

      // Transform data, using "Others" for null or additional categories
      const transformedData = sortedData.map((item) => ({
        name: item.source__leadSourceName || "Others",
        value: item.count,
      }));

      setDataVal(transformedData);
    }
  }, [data]);

  return (
    <WidgetCard
      title="Source Contribution"
      className={cn("@container", className)}
      headerClassName="mb-6 lg:mb-0"
    >
      <Box className="relative mx-auto size-[290px] @sm:size-[340px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="relative z-10"
        >
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              dataKey="value"
              innerRadius="42%"
              outerRadius="70%"
              fill="#8884d8"
              paddingAngle={4}
              data={dataVal}
              onMouseEnter={onPieEnter}
              activeIndex={activeIndex}
              cornerRadius={6}
              label
            >
              {dataVal.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <Box className="absolute inset-24 flex flex-col items-center justify-center rounded-full bg-white shadow-[0px_4px_20px_0px_#00000029] @sm:inset-28 dark:bg-gray-200">
          <Text className="text-xl font-semibold dark:text-white">{total}</Text>
        </Box>
      </Box>

      <Flex justify="center" className="flex-wrap gap-4 @lg:gap-8 mt-4">
        {dataVal.map((item, index) => (
          <Box key={item.name}>
            <Flex align="center" gap="1">
              <span
                className="me-2 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <Text as="span" className="whitespace-nowrap">
                {item.name}
              </Text>
            </Flex>
            <Text as="p" className="ms-[26px] font-medium">
              {calculatePercentage(item.value, total)}%
            </Text>
          </Box>
        ))}
      </Flex>
    </WidgetCard>
  );
}
