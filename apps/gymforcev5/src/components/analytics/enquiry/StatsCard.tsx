"use client";
import cn from "@core/utils/class-names";
import MetricCard from "@core/components/cards/metric-card";
import TrendingUpIcon from "@core/components/icons/trending-up";
import {
  BarChartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";

export default function StatCards({
  data,
  className,
}: {
  data: {
    avg_conversion_time?: number;
    conversion_rate?: number;
    converted_enquiries?: number;
    follow_up_success_rate?: number;
    lost_enquiries?: number;
    total_enquiries?: number;
  };
  className?: string;
}) {
  // Prepare stats array with icons and titles
  const statsArray = [
    {
      id: 1,
      icon: <TrendingUpIcon className=" text-primary h-10 w-10" />,
      title: "Conversion Rate",
      metric: data.conversion_rate
        ? `${data.conversion_rate.toFixed(2)}%`
        : "0",
    },
    {
      id: 2,
      icon: <CheckCircleIcon className=" text-primary" />,
      title: "Converted Enquiries",
      metric: data.converted_enquiries?.toString() || "0",
    },
    {
      id: 3,
      icon: <ClockIcon className=" text-primary" />,
      title: "Avg. Conversion Time",
      metric: data.avg_conversion_time
        ? `${data.avg_conversion_time} mins`
        : "0",
    },
    {
      id: 4,
      icon: <BarChartIcon className=" text-primary" />,
      title: "Total Enquiries",
      metric: data.total_enquiries?.toString() || "0",
    },
    {
      id: 5,
      icon: <XCircleIcon className=" text-primary" />,
      title: "Lost Enquiries",
      metric: data.lost_enquiries?.toString() || "0",
    },
    {
      id: 6,
      icon: <CheckCircleIcon className=" text-primary" />,
      title: "Follow-up Success Rate",
      metric: data.follow_up_success_rate
        ? `${data.follow_up_success_rate.toFixed(2)}%`
        : "0",
    },
  ];

  return (
    <div
      className={cn("grid grid-cols-1 lg:grid-cols-2 gap-10 ml-4", className)}
    >
      {statsArray
        // .filter((stat) => stat.metric !== "N/A")
        .map((stat) => (
          <MetricCard
            key={stat.title}
            title={stat.title}
            metric={stat.metric}
            icon={stat.icon}
            className="!p-3 shadow shadow-primary-lighter hover:scale-105 duration-150"
            iconClassName="bg-transparent size-10"
          />
        ))}
    </div>
  );
}
