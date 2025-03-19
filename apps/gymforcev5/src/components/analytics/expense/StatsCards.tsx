"use client";
import cn from "@core/utils/class-names";
import MetricCard from "@core/components/cards/metric-card";
import {
  TrendingUpIcon,
  DollarSignIcon,
  UsersIcon,
  PieChartIcon,
  CalculatorIcon,
} from "lucide-react";

export default function StatCards({
  data,
  className,
  demographic,
}: {
  data: {
    expense_per_member_ratio: number;
    total_operational_expenses: number;
    marketing_vs_acquisition: {
      marketing_spend: number;
      new_members: number;
      cost_per_acquisition: number;
    };
  };
  className?: string;
  demographic: any;
}) {
  // Prepare stats array with icons and titles
  const statsArray = [
    // {
    //   id: 1,
    //   icon: <DollarSignIcon className="text-primary size-6" />,
    //   title: "Total Operational Expenses",
    //   metric: `$${data.total_operational_expenses??0}`,
    // },
    {
      id: 2,
      icon: <PieChartIcon className="text-primary size-6" />,
      title: "Expense per Member",
      metric: `${demographic?.currency_symbol || ""}${data.expense_per_member_ratio ?? 0}`,
    },
    {
      id: 3,
      icon: <DollarSignIcon className="text-primary size-6" />,
      title: "Marketing Spend",
      metric: `${demographic?.currency_symbol || ""}${data.marketing_vs_acquisition.marketing_spend ?? 0}`,
    },
    {
      id: 4,
      icon: <UsersIcon className="text-primary size-6" />,
      title: "New Members",
      metric: data.marketing_vs_acquisition.new_members ?? 0,
    },
    {
      id: 5,
      icon: <CalculatorIcon className="text-primary size-6" />,
      title: "Cost per Acquisition",
      metric: `${demographic?.currency_symbol || ""}${data.marketing_vs_acquisition.cost_per_acquisition ? data.marketing_vs_acquisition.cost_per_acquisition.toFixed(2) : 0}`,
    },
  ];

  return (
    <div className={cn("grid sm:grid-cols-2 lg:grid-cols-4 gap-6 ", className)}>
      {statsArray.map((stat) => (
        <MetricCard
          key={stat.title}
          title={stat.title}
          titleClassName="font-semibold"
          metric={stat.metric}
          icon={stat.icon}
          className="!p-3 shadow shadow-primary-lighter hover:scale-105 duration-150"
          iconClassName="bg-transparent size-8"
        />
      ))}
    </div>
  );
}
