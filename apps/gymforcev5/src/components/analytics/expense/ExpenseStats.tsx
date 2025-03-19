"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Title, Text } from "rizzui";
import cn from "@core/utils/class-names";

interface ExpenseBreakdownProps {
  className?: string;
  expenseBreakdown: Record<string, number>; // Key-value pairs for expenses
  demographic: any;
}

export default function ExpenseBreakdown({
  className,
  expenseBreakdown,
  demographic,
}: ExpenseBreakdownProps) {
  const chartData = Object.entries(expenseBreakdown).map(
    ([key, value], index) => ({
      name: key,
      value,
      color: `hsl(${(index * 50) % 360}, 70%, 60%)`, // Generate unique colors
    })
  );

  // Calculate total expenses
  const totalExpenses = Object.values(expenseBreakdown).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <div className={cn("flex flex-col gap-5 border-0 p-0 lg:p-0", className)}>
      <div className="grid items-start rounded-lg border border-muted p-5 md:grid-cols-2 lg:p-7">
        <Title
          as="h3"
          className="col-span-full mb-8 text-base font-semibold sm:text-lg"
        >
          Expense Breakdown
        </Title>
        <div className="mb-6 w-full @3xl:w-40 @4xl:mb-0 place-self-end">
          <div className="mx-auto h-60 w-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart className="[&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none dark:[&_.recharts-text.recharts-label]:first-of-type:fill-white">
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  strokeWidth={2}
                  paddingAngle={8}
                  innerRadius={40}
                  cornerRadius={6}
                  dataKey="value"
                >
                  {chartData.map((item, index) => (
                    <Cell key={index} fill={item.color} stroke={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <Title as="h6" className="text-center">
            Total Expenses: {demographic?.currency_symbol || ""}
            {totalExpenses.toLocaleString()}
          </Title>
        </div>
        <div>
          {chartData.map((item, index) => (
            <div
              key={index}
              className="mb-2 flex items-center justify-between border-b border-muted pb-4 last:mb-0 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-start">
                <span
                  className="me-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Title as="h5" className="text-sm font-medium capitalize">
                  {item.name.split("_").join(" ")}
                </Title>
              </div>
              <Text as="span" className="font-medium">
                {demographic?.currency_symbol || ""}
                {item.value.toLocaleString()}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const formatYAxisTick = (value: number): string => {
  if (value >= 1000) {
    return `${value / 1000}k`;
  }
  return value.toString();
};
