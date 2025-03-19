"use client";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

// Define a type for the gender distribution data
type GenderDistributionItem = {
  gender: string;
  count: number;
};

// Define a type for the processed gender statistics
type GenderStatisticsItem = {
  name: string;
  value: number;
  color: string;
};

export default function GenderStatistics({
  className,
  data,
  total,
}: {
  className?: string;
  data: GenderDistributionItem[];
  total: number;
}) {
  // Predefined colors for gender categories
  const GENDER_COLORS = ["#3872FA", "#f1416c", "#FB896B"];

  // State to store normalized gender statistics
  const [genderStatisticsData, setGenderStatisticsData] = useState<GenderStatisticsItem[]>([]);

  useEffect(() => {
    // Normalize the gender data
    const normalizedData = normalizeGenderData(data);
    setGenderStatisticsData(normalizedData);
  }, [data]);

  // Function to normalize gender data
  const normalizeGenderData = (rawData: GenderDistributionItem[]): GenderStatisticsItem[] => {
    // Create a map to aggregate counts for each gender (case-insensitive)
    const genderMap = new Map<string, number>();

    // Normalize and aggregate gender counts
    rawData.forEach(item => {
      const normalizedGender = item.gender.toLowerCase();
      const currentCount = genderMap.get(normalizedGender) || 0;
      genderMap.set(normalizedGender, currentCount + item.count);
    });

    // Convert map to array of gender statistics
    const processedData: GenderStatisticsItem[] = [
      { 
        name: "Male", 
        value: genderMap.get('male') || 0, 
        color: "#3872FA" 
      },
      { 
        name: "Female", 
        value: genderMap.get('female') || 0, 
        color: "#f1416c" 
      },
      { 
        name: "Others", 
        value: genderMap.get('others') || 0, 
        color: "#FB896B" 
      }
    ];

    return processedData;
  };

  return (
    <WidgetCard
      title="Statistic By Gender"
      headerClassName="items-center"
      className={cn("@container/gs", className)}
    >
      <div className="h-full items-center @sm/gs:flex @sm:gap-8">
        <div className="relative mt-8 h-[200px] w-full @sm:my-4 @sm:h-[230px] @sm:w-3/5 @sm:py-3 4xl:my-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className="w-20 [&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none dark:[&_.recharts-text.recharts-label]:first-of-type:fill-white">
              <Pie
                data={genderStatisticsData}
                cornerRadius={8}
                innerRadius={55}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {genderStatisticsData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={genderStatisticsData[index].color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend genderStatisticsData={genderStatisticsData} />
      </div>
    </WidgetCard>
  );
}

function CustomLegend({
  className,
  genderStatisticsData,
}: {
  className?: string;
  genderStatisticsData: GenderStatisticsItem[];
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-5 pt-5 @sm:flex-col @sm:items-center @sm:gap-7 @sm:pt-0 @md:justify-start",
        className
      )}
    >
      {genderStatisticsData.map((item) => (
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