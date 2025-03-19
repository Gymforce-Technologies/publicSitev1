"use client";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

// Define a type for the status distribution data
type StatusDistributionItem = {
  custom_status: string;
  count: number;
};

// Define a type for the processed status statistics
type StatusStatisticsItem = {
  name: string;
  value: number;
  color: string;
};

// Custom color mapping for different statuses
const STATUS_COLORS = {
  active: "#4ECDC4", // Teal green
  expired: "#FF6B6B", // Coral red
  cancelled: "#6C5CE7", // Purple
  default: "#45B7D1", // Blue
};

export default function MembershipStatusDistribution({
  className,
  memberships_by_status,
}: {
  className?: string;
  memberships_by_status: StatusDistributionItem[];
}) {
  // State to store normalized status statistics
  const [statusStatisticsData, setStatusStatisticsData] = useState<
    StatusStatisticsItem[]
  >([]);

  // Calculate total count
  const total = memberships_by_status.reduce(
    (total, item) => total + item.count,
    0
  );

  // Function to normalize status data
  const normalizeStatusData = (
    rawData: StatusDistributionItem[]
  ): StatusStatisticsItem[] => {
    // Create a map to aggregate counts for each status (case-insensitive)
    const statusMap = new Map<string, number>();

    // Normalize and aggregate status counts
    rawData.forEach((item) => {
      const normalizedStatus = item.custom_status.toLowerCase();
      const currentCount = statusMap.get(normalizedStatus) || 0;
      statusMap.set(normalizedStatus, currentCount + item.count);
    });

    // Convert map to array of status statistics
    const processedData: StatusStatisticsItem[] = Object.keys(STATUS_COLORS)
      .filter((status) => status !== "default")
      .map((status) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusMap.get(status) || 0,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
      }));

    // Add a catch-all "Others" category for any unmatched statuses
    const othersCount = rawData
      .filter(
        (item) =>
          !Object.keys(STATUS_COLORS).includes(item.custom_status.toLowerCase())
      )
      .reduce((sum, item) => sum + item.count, 0);

    if (othersCount > 0) {
      processedData.push({
        name: "Others",
        value: othersCount,
        color: STATUS_COLORS.default,
      });
    }

    return processedData;
  };

  useEffect(() => {
    // Normalize the status data
    const normalizedData = normalizeStatusData(memberships_by_status);
    setStatusStatisticsData(normalizedData);
  }, [memberships_by_status]);

  return (
    <WidgetCard
      title="Membership Status Distribution"
      headerClassName="items-center"
      className={cn("@container/ss", className)}
    >
      <div className="h-full items-center @sm/ss:flex @sm:gap-8">
        <div className="relative mt-8 h-[200px] w-full @sm:my-4 @sm:h-[230px] @sm:w-3/5 @sm:py-3 4xl:my-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className="w-20 [&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none dark:[&_.recharts-text.recharts-label]:first-of-type:fill-white">
              <Pie
                data={statusStatisticsData}
                cornerRadius={8}
                innerRadius={55}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {statusStatisticsData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={statusStatisticsData[index].color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend statusStatisticsData={statusStatisticsData} />
      </div>
    </WidgetCard>
  );
}

function CustomLegend({
  className,
  statusStatisticsData,
}: {
  className?: string;
  statusStatisticsData: StatusStatisticsItem[];
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-5 pt-5 @sm:flex-col @sm:items-center @sm:gap-7 @sm:pt-0 @md:justify-start",
        className
      )}
    >
      {statusStatisticsData.map((item) => (
        <div
          key={item.name}
          className="flex w-2/5 flex-col items-center text-gray-500 @sm:items-start"
        >
          <div className="relative">
            <span
              className="absolute start-0 top-1/2 size-3 -translate-x-6 -translate-y-1/2 rounded rtl:translate-x-6"
              style={{ backgroundColor: item.color }}
            />
            <Text className="mb-0.5 block text-xs 3xl:text-sm">
              {item.name}
            </Text>
            <Text className="font-inter text-lg font-semibold leading-none text-gray-900">
              {item.value}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}
