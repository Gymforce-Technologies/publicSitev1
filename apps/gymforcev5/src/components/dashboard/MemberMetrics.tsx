import React from "react";
import WidgetCard from "@core/components/cards/widget-card";
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ComposedChart,
  ResponsiveContainer,
} from "recharts";
import { Badge, Loader } from "rizzui";
// import cn from '@utils/class-names';
import { useMedia } from "@core/hooks/use-media";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import SimpleBar from "@core/ui/simplebar";

interface MemberMetricsDataPoint {
  date: string;
  members: number;
  new_members: number;
}

interface MemberMetricsProps {
  data: MemberMetricsDataPoint[] | null;
  className?: string;
  isLoading: boolean;
  hideValues: boolean;
}
// const

const MemberMetrics: React.FC<MemberMetricsProps> = ({
  data,
  className,
  isLoading,
  hideValues,
}) => {
  const isMediumScreen = useMedia("(max-width: 1200px)", false);
  const isTablet = useMedia("(max-width: 800px)", false);
  if (!data || isLoading) {
    return (
      <WidgetCard
        title={"Member Metrics"}
        titleClassName="text-gray-900 "
        className="lg:col-span-6 py-8 col-span-full"
      >
        <div className=" flex flex-1 items-center justify-center min-w-full my-10">
          <Loader size="xl" variant="threeDot" />
        </div>
      </WidgetCard>
    );
  }
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleString("default", { month: "short" }),
    members: item.members,
    newMembers: item.new_members,
  }));

  return (
    <WidgetCard
      title="Member Metrics"
      titleClassName="text-gray-900 "
      description={
        <>
          <Badge
            renderAsDot
            className="me-0.5 bg-[#d4dcfa] dark:bg-[#7c88b2]"
          />{" "}
          Members
          <Badge renderAsDot className="me-0.5 ms-4 bg-[#5a5fd7]" /> New Members
        </>
      }
      descriptionClassName="text-gray-700  mt-1.5 mb-3 @lg:mb-0"
      headerClassName="flex-col @lg:flex-row"
      rounded="lg"
      className={`${className} min-w-full border-gray-400  dark:bg-inherit`}
    >
      <SimpleBar>
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            {...(isTablet && { minWidth: "700px" })}
            height="100%"
          >
            <ComposedChart
              data={chartData.slice(0, new Date().getMonth() + 1)}
              barSize={isMediumScreen ? 20 : 28}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500  [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
                className={hideValues ? "hidden" : ""}
              />
              <Tooltip
                content={
                  <CustomTooltip className={hideValues ? "hidden" : ""} />
                }
              />
              <Bar
                dataKey="newMembers"
                fill="#5a5fd7"
                {...(isTablet
                  ? { stackId: "MemberMetrics" }
                  : { radius: [4, 4, 0, 0] })}
              />
              <Bar
                dataKey="members"
                fill="#d4dcfa"
                radius={[4, 4, 0, 0]}
                className="dark:fill-[#7c88b2]"
                {...(isTablet && { stackId: "MemberMetrics" })}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
};

export default MemberMetrics;
