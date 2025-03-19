"use client";

import { Text, Title } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import DropdownAction from "@core/components/charts/dropdown-action";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RealTimeStatisticsProps {
  className?: string;
  data: {
    visits: number;
    enquiries: number;
    feedbacks: number;
  };
}

const STATUS_COLORS = ["#3B82F6", "#10B981", "#F43F5E"];

export default function RealTimeStatistics({
  className,
  data,
}: RealTimeStatisticsProps) {
  const statisticsData = [
    {
      name: "Visits",
      value: data.visits ?? 0,
      color: STATUS_COLORS[0],
    },
    {
      name: "Enquiries",
      value: data.enquiries ?? 0,
      color: STATUS_COLORS[1],
    },
    {
      name: "Feedbacks",
      value: data.feedbacks ?? 0,
      color: STATUS_COLORS[2],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 items-start @xl:grid-cols-2 ">
      <div className="mb-6 w-full @3xl:w-40 @4xl:mb-0">
        <div className="mx-auto h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className="[&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none dark:[&_.recharts-text.recharts-label]:first-of-type:fill-white">
              <Pie
                data={statisticsData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                strokeWidth={2}
                paddingAngle={8}
                innerRadius={40}
                cornerRadius={6}
                dataKey="value"
              >
                {statisticsData.map((item, index) => (
                  <Cell key={index} fill={item.color} stroke={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className=" self-center">
        {statisticsData.map((item, index) => (
          <div
            key={index}
            className="mb-3 flex items-center justify-between border-b border-muted pb-3 last:mb-0 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-start">
              <span
                className="me-2 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Title as="h5" className=" text-[13px] font-medium">
                {item.name}
              </Title>
            </div>
            <Text as="span" className="font-semibold">
              {item.value}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
