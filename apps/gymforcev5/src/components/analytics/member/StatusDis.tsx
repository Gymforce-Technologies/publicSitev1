import cn from "@core/utils/class-names";
import { Progressbar, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { useEffect, useState } from "react";

export default function StatusDistribution({
  className,
  data,
  total,
}: {
  className?: string;
  data: any;
  total: number;
}) {
  const [dataVal, setDataVal] = useState([]);
  const statusData = dataVal.map((item: any, index) => ({
    ...item,
    percentage: Math.round((item.count / total) * 100),
  }));

  const barColorClassName = ["bg-[#10B981]", "bg-[#3872FA]", "bg-[#EF4444]"];
  useEffect(() => {
    if (data) {
      setDataVal(data);
    }
  }, [data]);
  return (
    <WidgetCard
      title="Membership Status Distribution"
      className={className}
      description={
        "This chart shows the distribution of members based on their membership status."
      }
      descriptionClassName="my-2"
    >
      <div className="pt-4">
        {statusData.map((item, idx) => (
          <div className="my-6  space-y-4" key={item.status}>
            <div className="flex justify-between">
              <Text className="font-medium capitalize">{item.status}</Text>
              <Text className="text-gray-500">
                {item.count} ({item.percentage}%)
              </Text>
            </div>
            <Progressbar
              size="xl"
              value={item.percentage}
              label={`${item.count}`}
              labelClassName="text-xs"
              barClassName={cn(
                "relative after:content-[''] after:size-2 after:rounded-full after:bg-white after:absolute after:top-1/2 after:-translate-y-1/2 after:end-1",
                barColorClassName[idx]
              )}
              className="rounded-full bg-muted p-1 pe-2"
            />
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
