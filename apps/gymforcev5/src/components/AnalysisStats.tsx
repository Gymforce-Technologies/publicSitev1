import cn from "@core/utils/class-names";
import MetricCard from "@core/components/cards/metric-card";
import { FaBuildingUser, FaUsersViewfinder } from "react-icons/fa6";
import { MdOutlineFeedback } from "react-icons/md";

export default function AnalysisStats({
  data,
  className,
}: {
  data: {
    realtime_total_enquiries: number;
    realtime_total_feedbacks: number;
    realtime_total_visits: number;
  };
  className?: string;
}) {
  const statsArray = [
    {
      id: 1,
      icon: <FaUsersViewfinder className="text-primary size-8" />,
      title: "Visits (Today)",
      metric: `${data.realtime_total_visits.toLocaleString() || 0}`,
    },
    {
      id: 2,
      icon: <FaBuildingUser className="text-primary size-8" />,
      title: "Enquiry (Today)",
      metric: `${data.realtime_total_enquiries.toLocaleString() || 0}`,
    },
    {
      id: 3,
      icon: <MdOutlineFeedback className="text-primary size-8" />,
      title: "Feedback (Today)",
      metric: `${data.realtime_total_feedbacks.toLocaleString() || 0}`,
    },
  ];

  return (
    <div className={cn("flex max-lg:flex-wrap gap-3 sm:gap-4 ", className)}>
      {statsArray.map((stat) => (
        <MetricCard
          key={stat.id}
          title={stat.title}
          metric={stat.metric}
          icon={stat.icon}
          titleClassName="font-medium"
          iconClassName="bg-transparent w-8 h-8 text-primary"
          className="min-w-[200px] !p-3 sm:!p-4"
        />
      ))}
    </div>
  );
}
