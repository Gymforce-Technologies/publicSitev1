import cn from "@core/utils/class-names";
import MetricCard from "@core/components/cards/metric-card";
import {
  TrendingUpIcon,
  BarChartIcon,
  ClockIcon,
  DollarSignIcon,
  CalendarIcon,
  XCircleIcon,
} from "lucide-react";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";

export default function StatCards({
  data,
  className,
  demographic,
  dateRange,
}: {
  data: {
    average_expense: number;
    average_profit: number;
    average_sale: number;
    highest_expense_date: string;
    highest_sales_date: string;
    net_profit: number;
    no_expense_days: number;
    no_sales_days: number;
  };
  demographic: any;
  className?: string;
  dateRange: string;
}) {
  const getRangeVal = () => {
    switch (dateRange) {
      case "daily":
        return "Today's";
      case "yesterday":
        return "Yesterday's";
      case "weekly":
        return "Daily";
      case "monthly":
        return "Daily";
      case "yearly":
        return "Monthly";
      default:
        return "Average";
    }
  };
  const statsArray = [
    {
      id: 1,
      icon: <DollarSignIcon className="text-primary size-6" />,
      title: `Avg Expense (${getRangeVal()}) `,
      metric: `${demographic?.currency_symbol || ""}${data.average_expense ? data.average_expense.toLocaleString() : 0}`,
    },
    {
      id: 2,
      icon: <TrendingUpIcon className="text-primary size-6" />,
      title: `Avg Profit (${getRangeVal()})`,
      metric: `${demographic?.currency_symbol || ""}${data.average_profit?.toLocaleString() || 0}`,
    },
    {
      id: 3,
      icon: <BarChartIcon className="text-primary size-6" />,
      title: `Avg Sale (${getRangeVal()})`,
      metric: `${demographic?.currency_symbol || ""}${data.average_sale?.toLocaleString() || 0}`,
    },
    {
      id: 4,
      icon: <CalendarIcon className="text-primary size-6" />,
      title: "Highest Expense Date",
      metric: data.highest_expense_date
        ? formateDateValue(new Date(data.highest_expense_date))
        : "No Expense Date",
    },
    {
      id: 5,
      icon: <CalendarIcon className="text-primary size-6" />,
      title: "Highest Sales Date",
      metric: data.highest_sales_date
        ? formateDateValue(new Date(data.highest_sales_date))
        : "No Sales Date",
    },
    {
      id: 6,
      icon: <DollarSignIcon className="text-primary size-6" />,
      title: "Average Profit",
      metric: `${demographic?.currency_symbol || ""}${data.net_profit?.toLocaleString() || 0}`,
    },
    {
      id: 7,
      icon: <XCircleIcon className="text-primary size-6" />,
      title: "No Expense Days",
      metric: data.no_expense_days?.toString() || 0,
    },
    {
      id: 8,
      icon: <ClockIcon className="text-primary size-6" />,
      title: "No Sales Days",
      metric: data.no_sales_days?.toString() || 0,
    },
  ];

  return (
    <div
      className={cn("grid sm:grid-cols-2 md:grid-cols-4  gap-8 ml-4", className)}
    >
      {statsArray.map((stat) => (
        <MetricCard
          key={stat.id}
          title={stat.title}
          metric={stat.metric}
          titleClassName="text-sm font-semibold"
          metricClassName="!text-lg font-semibold"
          icon={stat.icon}
          className="!p-3 shadow shadow-primary-lighter hover:scale-105 duration-150"
          iconClassName="bg-transparent size-6"
        />
      ))}
    </div>
  );
}
