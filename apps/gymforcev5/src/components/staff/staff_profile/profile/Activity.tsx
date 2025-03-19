import React, { useEffect, useState } from "react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@core/components/cards/widget-card";
import { Text, Loader, Empty } from "rizzui";
import {
  PiUserPlus,
  PiCreditCard,
  PiCurrencyDollar,
  PiTag,
} from "react-icons/pi";
import { formatDate } from "@core/utils/format-date";
import DropdownAction from "@core/components/charts/dropdown-action";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface Activity {
  action: string;
  activity_type: string;
  description: string;
  timestamp: string;
}

const getIcon = (activityType: string) => {
  switch (activityType) {
    case "member":
      return <PiUserPlus className="h-5 w-5 text-green-500" />;
    case "transaction":
      return <PiCreditCard className="h-5 w-5 text-blue-500" />;
    case "expense":
      return <PiCurrencyDollar className="h-5 w-5 text-yellow-500" />;
    case "membership":
      return <PiTag className="h-5 w-5 text-purple-500" />;
    default:
      return null;
  }
};

const ActivityThreadCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const { activity_type, description, timestamp } = activity;

  return (
    <div className="relative flex items-start gap-x-2.5 pb-8 before:absolute before:start-[17px] before:top-0 before:z-0 before:h-full before:w-[1px] before:bg-gray-200  last:pb-0 last:before:hidden">
      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
        {getIcon(activity_type)}
      </div>
      <div className="flex-1">
        <Text className="text-sm font-semibold text-gray-900  flex flex-row items-center gap-1.5">
          Created{" "}
          <span className="text-primary">
            {activity_type.substring(0, 1).toUpperCase() +
              activity_type.substring(1)}
          </span>
        </Text>
        <Text as="span" className="text-xs font-medium text-gray-700 ">
          {formatDate(new Date(timestamp), "MMM DD, YYYY, HH:mm a")}
        </Text>
        <div className="mt-2 text-sm text-gray-900 ">{description}</div>
      </div>
    </div>
  );
};

const ActivityThreads: React.FC<{ activities: Activity[] }> = ({
  activities,
}) => {
  return (
    <div className="space-y-0.5 max-h-[70vh] overflow-y-scroll custom-scrollbar my-5 px-5">
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <ActivityThreadCard key={`activity-${index}`} activity={activity} />
        ))
      ) : (
        <Empty text="No Activity Found ..." />
      )}
    </div>
  );
};

interface RecentActivitiesProps {
  className?: string;
  id: string;
}

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Member", value: "member" },
  { label: "Membership", value: "membership" },
  { label: "Expense", value: "expense" },
  { label: "Transaction", value: "transaction" },
];

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  className,
  id,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const gymId = await retrieveGymId();
      try {
        const endpoint =
          filter === "all"
            ? `/api/staff/${id}/activity/?gym_id=${gymId}`
            : `/api/staff/${id}/activity/?gym_id=${gymId}&type=${filter}&action=create`;

        const resp = await AxiosPrivate.get(endpoint, {
          id: newID(`staff-activity-${filter}-${id}`),
        });
        setActivities(resp.data.results);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [id, filter]);

  return (
    <WidgetCard
      title={`${filter.substring(0, 1).toUpperCase() + filter.substring(1)} Activities`}
      titleClassName="leading-none "
      headerClassName="mb-3 lg:mb-4"
      className={
        " grid gap-4 " + className
      }
      action={
        <div className="grid min-w-40">
          <DropdownAction
            className="rounded-md border mb-1 hover:border-transparent scale-105 w-full "
            options={filterOptions}
            onChange={(value) => setFilter(value)}
            dropdownClassName="!z-0"
            defaultActive={filter}
          />
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <ActivityThreads activities={activities} />
      )}
    </WidgetCard>
  );
};

export default RecentActivities;
