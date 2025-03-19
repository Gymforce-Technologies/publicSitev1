import cn from "@core/utils/class-names";
import MetricCard from "@core/components/cards/metric-card";
import { DollarSignIcon, TrendingUpIcon } from "lucide-react";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";

export default function PageStatCards({
  data,
  className,
  demographic,
}: {
  data: {
    total_summary: {
      total_revenue: number;
      total_expenses: number;
      total_profit: number;
    };
  };
  className?: string;
  demographic: any;
}) {
  const statsArray = [
    {
      id: 1,
      icon: <RiMoneyRupeeCircleFill className="text-primary size-8" />,
      title: "Total Revenue",
      metric: `${demographic?.currency_symbol || ""}${data.total_summary?.total_revenue?.toLocaleString() || 0}`,
    },
    {
      id: 2,
      icon: <RiMoneyRupeeCircleFill className="text-primary size-8" />,
      title: "Total Expenses",
      metric: `${demographic?.currency_symbol || ""}${data.total_summary?.total_expenses?.toLocaleString() || 0}`,
    },
    {
      id: 3,
      icon: <TrendingUpIcon className="text-primary lg:size-8" />,
      title: "Total Profit",
      metric: `${demographic?.currency_symbol || ""}${data.total_summary?.total_profit?.toLocaleString() || 0}`,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-6 lg:ml-4",
        className
      )}
    >
      {statsArray.map((stat, index) => (
        <MetricCard
          key={stat.id}
          title={stat.title}
          metric={stat.metric}
          icon={stat.icon}
          className={`!p-3 border-none hover:scale-105 duration-150 ${index === 0 ? " ml-[30%] max-md:col-span-full " : ""}`}
          iconClassName="bg-transparent size-8"
        />
      ))}
    </div>
  );
}
