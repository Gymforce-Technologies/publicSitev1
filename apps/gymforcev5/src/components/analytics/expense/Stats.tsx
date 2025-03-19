import { Title, Text } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import CircleProgressBar from "@core/components/charts/circle-progressbar";
import { formatNumber } from "@core/utils/format-number";

interface FinancialData {
  revenue: number;
  expenses: number;
  "p/l": number;
}

export default function REStats({
  className,
  data,
  demographic,
}: {
  className?: string;
  data: FinancialData;
  demographic: any;
}) {
  // Calculate percentages
  const revenuePercentage = Math.min(
    100,
    (data.revenue / (data.revenue + data.expenses)) * 100
  );
  const expensesPercentage = Math.min(
    100,
    (data.expenses / (data.revenue + data.expenses)) * 100
  );
  const plPercentage = Math.min(
    100,
    Math.abs((data["p/l"] / (data.revenue + data.expenses)) * 100)
  );

  // Determine color for P/L
  const plColor = data["p/l"] >= 0 ? "#22c55e" : "#ef4444";

  const financialData = [
    {
      name: "Revenue",
      value: `${demographic?.currency_symbol || ""}${formatNumber(data.revenue || 0)}`,
      percentage: revenuePercentage,
      color: "#3872FA",
    },
    {
      name: "Expenses",
      value: `${demographic?.currency_symbol || ""}${formatNumber(data.expenses || 0)}`,
      percentage: expensesPercentage,
      color: "#f1416c",
    },
    {
      name: "Profit/Loss",
      value: `${demographic?.currency_symbol || ""}${formatNumber(data["p/l"] || 0)}`,
      percentage: plPercentage,
      color: plColor,
    },
  ];

  return (
    <WidgetCard
      title={"Revenue to Expense Ratio"}
      description={`Financial Performance Overview`}
      rounded="lg"
      descriptionClassName="text-gray-500 mt-1.5"
      className={cn("grid", className)}
    >
      <div className="mt-5 grid w-full grid-cols-3 justify-around gap-4">
        {financialData.map((item) => (
          <div key={item.name} className="grid grid-cols-1 gap-6 text-center">
            <CircleProgressBar
              percentage={item.percentage}
              size={120}
              stroke="#f0f0f0"
              strokeWidth={12}
              progressColor={item.color}
              useParentResponsive={true}
              label={
                <Text className="!text-sm lg:text-xs font-bold text-gray-900">
                  {item.value}
                </Text>
              }
              strokeClassName="dark:stroke-gray-200"
            />
            <Title as="h6" className="max-sm:text-base">{item.name}</Title>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
