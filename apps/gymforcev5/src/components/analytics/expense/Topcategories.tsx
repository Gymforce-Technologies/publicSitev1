"use client";
import { useState } from "react";
import { Box, Text } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatNumber } from "@core/utils/format-number";

// Define the type for expense category
interface ExpenseCategory {
  category: string;
  amount: number;
}

// Define props interface
interface OverallProgressProps {
  top_expense_categories: ExpenseCategory[];
  className?: string;
  demographic: any;
}

export default function TopCategories({
  top_expense_categories,
  className,
  demographic,
}: OverallProgressProps) {
  // Calculate total expenses
  const totalExpenses =
    top_expense_categories.reduce(
      (sum, category) => sum + category.amount,
      0
    ) || 0;

  const colorGenerator = (index: number) => {
    return `hsl(${(index * 50) % 360}, 70%, 60%)`;
  };
  // Transform expense categories into pie chart data
  const progressData = top_expense_categories.map((category, index) => ({
    name: category.category,
    percentage: parseFloat(
      ((category.amount / totalExpenses) * 100).toFixed(2)
    ),
    count: `${demographic?.currency_symbol || ""}${category.amount.toLocaleString()}`,
    color: colorGenerator(index),
  }));

  // Calculate total expenses
  const completionPercentage = top_expense_categories.reduce(
    (sum, category) => sum + category.amount,
    0
  );
  return (
    <WidgetCard
      title="Expense Categories"
      headerClassName="items-center"
      className={cn("@container dark:bg-gray-100/50", className)}
    >
      <Box className="relative h-60 w-full translate-y-6 @sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart
            margin={{
              top: 40,
              right: 10,
            }}
            className="relative focus:[&_.recharts-sector]:outline-none"
          >
            <Pie
              label
              data={progressData}
              endAngle={-10}
              stroke="none"
              startAngle={190}
              paddingAngle={1}
              cornerRadius={8}
              dataKey="percentage"
              innerRadius={"85%"}
              outerRadius={"100%"}
            >
              {progressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <Box className="absolute bottom-20 start-1/2 -translate-x-1/2 text-center @sm:bottom-28">
          <Text className="text-2xl font-bold text-gray-800 ">
            {demographic?.currency_symbol || ""}
            {formatNumber(completionPercentage || 0)}
          </Text>
          <Text className="font-medium">Total Expenses</Text>
        </Box>
      </Box>

      <Box className="grid grid-cols-2 gap-4 text-center @sm:flex @sm:flex-wrap @sm:justify-center @sm:text-start">
        {progressData.map((item) => (
          <Box key={item.name} className="flex flex-col gap-1">
            <Text
              className="block text-base font-bold @xl:text-2xl"
              style={{ color: item.color }}
            >
              {item.count}
            </Text>
            <Text className="whitespace-nowrap capitalize">
              {item.name.split("_").join(" ")}
            </Text>
          </Box>
        ))}
      </Box>
    </WidgetCard>
  );
}
