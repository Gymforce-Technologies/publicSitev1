import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Text, Title } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import cn from "@core/utils/class-names";
import { FaChartLine, FaUsers, FaTrophy } from "react-icons/fa6";

// Types
type UtilizationData = {
  package_type: string;
  attendance_count: number;
  utilization_rate: number;
};

type UtilizationStatsProps = {
  data: UtilizationData[];
};

const UtilizationStats: React.FC<UtilizationStatsProps> = ({ data }) => {
  // Calculations
  const highestUtilizationRate =
    Math.max(...data.map((item) => item.utilization_rate)) || 0;
  const highestAttendancePackage = data.length
    ? data.reduce((max, pkg) =>
        pkg.attendance_count > max.attendance_count ? pkg : max
      )
    : null;

  const highestUtilizationPackage = data.find(
    (pkg) => pkg.utilization_rate === highestUtilizationRate
  );

  const chartData = data.map((item, index) => ({
    name: item.package_type,
    pck: `P-${index + 1}`,
    utilization: item.utilization_rate,
  }));

  return (
    <WidgetCard
      title="Package Utilization Analytics"
      description="Detailed Attendance and Utilization Insights"
      rounded="lg"
    >
      <div className="mt-5 grid w-full grid-cols-1 justify-around gap-6 @sm:py-2 @7xl:gap-8">
        <div className="grid grid-cols-2 gap-5">
          {[
            {
              title: "Highest Utilization Rate",
              metric: `${highestUtilizationRate.toFixed(2)}%`,
              package: highestUtilizationPackage?.package_type || "N/A",
              icon: <FaChartLine size={18} className="text-primary" />,
            },
            {
              title: "Highest Attendance",
              metric: `${highestAttendancePackage?.attendance_count || 0}`,
              package: highestAttendancePackage?.package_type || "N/A",
              icon: <FaUsers size={18} className="text-primary" />,
            },
            // {
            //   title: "Best Performing Package",
            //   metric: highestUtilizationPackage?.package_type || "N/A",
            //   package: "",
            //   icon: <FaTrophy size={18} className="text-primary" />,
            // },
          ].map((stat) => (
            <div key={stat.title} className="flex items-start">
              <div
                className={cn(
                  "me-2.5 flex h-10 w-10 items-center justify-center rounded-md bg-opacity-10 p-[1px] bg-primary"
                )}
              >
                {stat.icon}
              </div>
              <div>
                <Text className="mb-1 text-gray-600">{stat.title}</Text>
                <Title as="h6" className="font-semibold">
                  {stat.metric}
                </Title>
                {stat.package && (
                  <Text className="text-xs font-bold text-gray-500">{stat.package}</Text>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="h-72 w-full @sm:pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                left: -30,
              }}
              barSize={24}
            >
              <YAxis tickLine={false} axisLine={false} />
              <XAxis dataKey="pck" tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="utilization" fill="#4ADE80" fillOpacity={0.7}  />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
};

export default UtilizationStats;
