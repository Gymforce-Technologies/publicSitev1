"use client";
import { useEffect, useState } from "react";
import { Box, Flex, Text } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
// import DropdownAction from "@core/components/charts/dropdown-action";

// const viewOptions = [
//   { value: "Total", label: "Total" },
//   { value: "Detailed", label: "Detailed" },
// ];

// const valueSum = data.reduce((total, item) => total + item.value, 0);
const calculatePercentage = (part: number, total: number) =>
  ((part / total) * 100).toFixed(2);

const COLORS = ["#36c294", "#eb6069"]; // Green for Active, Red for Expired

export default function ActiveVsExpired({
  className,
  data,
  total,
}: {
  className?: string;
  data: any;
  total: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dataVal, setDataVal] = useState([
    { name: "Active", value: 0 },
    { name: "Expired", value: 0 },
  ]);

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };
  useEffect(() => {
    if (data) {
      setDataVal([
        { name: "Active", value: data.active ?? 0 },
        { name: "Expired", value: data.expired ?? 0 },
      ]);
    }
  }, [data]);

  return (
    <WidgetCard
      title="Active vs Expired"
      className={cn("@container", className)}
      headerClassName="mb-6 lg:mb-0"
      // action={<DropdownAction options={viewOptions} onChange={handleChange} />}
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

      <Flex justify="center" className="flex-wrap @lg:gap-8">
        {dataVal.map((item, index) => (
          <Box key={item.name}>
            <Flex align="center" gap="1">
              <span
                className="me-2 h-2.5 w-3.5 flex-shrink-0"
                style={{ backgroundColor: COLORS[index] }}
              />
              <Text as="span" className="whitespace-nowrap">
                {item.name}
              </Text>
            </Flex>
            <Text as="p" className="ms-[26px] font-medium">
              {calculatePercentage(item.value, total) ?? 0}%
            </Text>
          </Box>
        ))}
      </Flex>
    </WidgetCard>
  );
}
