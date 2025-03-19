import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Text, Title, ActionIcon } from "rizzui";
// import { PiSlidersHorizontalDuotone } from "react-icons/pi";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import WidgetCard from "@core/components/cards/widget-card";
import { AiFillDollarCircle } from "react-icons/ai";
import { FaRegChartBar, FaUsersLine } from "react-icons/fa6";
import TrendingUpIcon from "@core/components/icons/trending-up";
import cn from "@core/utils/class-names";
import { formatNumber } from "@core/utils/format-number";
// import { CustomTooltip2 } from "./CustomPT2";

// Define types for the data
type Membership = {
  package__name: string;
  package__package_type: string;
  sold: number;
  amount: number;
};

type WidgetCardComponentProps = {
  data: Membership[];
  demographic: any;
};

const MembershipStats: React.FC<WidgetCardComponentProps> = ({
  data,
  demographic,
}) => {
  // Calculations
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const highestSold = Math.max(...data.map((item) => item.sold));
  const highestSoldPackage =
    data.find((item) => item.sold === highestSold)?.package__name || "N/A";

  // Determine the most frequent package type
  const packageTypeCount = data.reduce((acc: Record<string, number>, item) => {
    acc[item.package__package_type] =
      (acc[item.package__package_type] || 0) + 1;
    return acc;
  }, {});
  const mostMembershipPackageType =
    Object.entries(packageTypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "N/A";

  const chartData = data.map((item, index) => ({
    name: item.package__name,
    pck: `P-${index + 1}`,
    purchased: item.sold,
  }));

  return (
    <WidgetCard
      key="Membership Analytics"
      title="Membership Analytics"
      description="Detailed Package Insights"
      rounded="lg"
    >
      <div className="mt-5 grid w-full grid-cols-1 justify-around gap-6 @sm:py-2 @7xl:gap-8">
        <div className="grid grid-cols-2 gap-5">
          {[
            {
              title: "Total Amount",
              metric: `${demographic?.currency_symbol || ""}${formatNumber(totalAmount)}`,
              icon: <AiFillDollarCircle size={18} className="text-primary" />,
            },
            {
              title: "Highest Sold",
              metric: `${highestSold}`,
              icon: <TrendingUpIcon className="h-6 text-primary" />,
            },
            {
              title: "Top Package",
              metric: `${highestSoldPackage}`,
              icon: <FaUsersLine size={18} className="text-primary" />,
            },
            {
              title: "Top Package Type",
              metric: `${mostMembershipPackageType[0].toUpperCase() + mostMembershipPackageType.slice(1)}`,
              icon: <FaRegChartBar size={18} className="text-primary" />,
            },
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
                {stat.title === "Top Package" ? (
                  <Title
                    as="h6"
                    className="font-semibold text-sm truncate max-w-28 text-wrap"
                  >
                    {stat.metric}
                  </Title>
                ) : (
                  <Title as="h6" className="font-semibold">
                    {stat.metric}
                  </Title>
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
              <Bar
                dataKey="purchased"
                fill="#5EC3FF" // Bar color
                fillOpacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
};

export default MembershipStats;
