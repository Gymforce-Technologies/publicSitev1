import cn from "@core/utils/class-names";
import { Badge, Progressbar, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { useEffect, useState } from "react";

export default function PackageDiscountDistribution({
  className,
  data,
  demographic,
}: {
  className?: string;
  data: Array<{
    package__name: string;
    package__package_type: string;
    total_price: number;
    total_discounted_amount: number;
  }>;
  demographic: any;
}) {
  const [dataVal, setDataVal] = useState<
    Array<{
      package__name: string;
      package__package_type: string;
      total_price: number;
      total_discounted_amount: number;
      percentage?: number;
    }>
  >([]);

  // Calculate total price for percentage
  // const totalPrice = data.reduce((sum, item) => sum + item.total_price, 0);

  const statusData = dataVal
    .map((item) => ({
      ...item,
      discountPercentage: Math.round(
        (item.total_discounted_amount / item.total_price) * 100
      ),
    }))
    .sort((a, b) => b.discountPercentage - a.discountPercentage);

  const barColorClassName = [
    "bg-[#10B981]",
    "bg-[#3872FA]",
    "bg-[#EF4444]",
    "bg-[#F97316]",
    "bg-[#8B5CF6]",
  ];

  useEffect(() => {
    if (data) {
      setDataVal(data);
    }
  }, [data]);

  // const percentageCalc = (percentage: number) => `right-[${percentage}%]`;

  return (
    <WidgetCard
      title="Membership Discounts"
      className={className}
      description="This chart shows the distribution of package pricing and discounts"
      descriptionClassName="my-2"
    >
      <div className="pt-4">
        {statusData.map((item, idx) => (
          <div className="my-3 space-y-1 relative" key={item.package__name}>
            <div className="grid grid-cols-[35%,25%,40%] items-center">
              <Text className=" capitalize text-xs">{item.package__name}</Text>
              <Text className=" capitalize text-xs">
                Amount : {demographic?.currency_symbol || ""}
                {item.total_price}
              </Text>
              <Text className=" capitalize flex items-center gap-2 text-xs">
                Discounted Amount :
                <Badge className="scale-90" variant="flat">
                  {item.total_discounted_amount
                    ? (demographic?.currency_symbol ||
                      "" )+ item.total_discounted_amount
                    : "NA"}
                </Badge>
              </Text>
            </div>
            <Progressbar
              size="xl"
              value={item.discountPercentage}
              label={`${item.discountPercentage}%`}
              labelClassName="text-xs"
              barClassName={cn(
                "relative after:content-[''] after:size-2 after:rounded-full after:bg-white after:absolute after:top-1/2 after:-translate-y-1/2 after:end-1",
                barColorClassName[idx % barColorClassName.length]
              )}
              variant="solid"
              className="rounded-full bg-muted p-1 pe-2 "
            />
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
