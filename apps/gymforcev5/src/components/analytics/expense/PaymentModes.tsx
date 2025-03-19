"use client";

import WidgetCard from "@core/components/cards/widget-card";

import { Text, Title } from "rizzui";
import TrendingUpIcon from "@core/components/icons/trending-up";
import cn from "@core/utils/class-names";
import { formatNumber } from "@core/utils/format-number";

export default function TopPayments({
  className,
  data,
  demographic,
}: {
  className?: string;
  data: any[];
  demographic: any;
}) {
  const totalPayment = data.reduce((acc, item) => acc + item.total_expenses, 0);
  return (
    <WidgetCard
      title="Top Payment Methods"
      titleClassName="text-gray-700 font-normal text-sm sm:text-sm font-inter"
      className={cn("@container", className)}
    >
      <div className="flex items-center justify-start">
        <Title as="h2" className="me-2 mt-1 text-2xl font-semibold">
          {demographic?.currency_symbol || ""}
          {formatNumber(totalPayment || 0)}
        </Title>
        {/* <Text className="flex items-center leading-none text-gray-500">
          <Text
            as="span"
            className={cn(
              "me-2 inline-flex items-center font-medium text-green"
            )}
          >
            <TrendingUpIcon className="me-1 h-4 w-4" />
            32.40%
          </Text>
        </Text> */}
      </div>
      <div className="mt-8 flex grow flex-col gap-4 md:gap-6">
        {data.map((item) => (
          <SingleBar
            key={item.payment_mode}
            item={item}
            demographic={demographic}
          />
        ))}
      </div>
    </WidgetCard>
  );
}

function SingleBar({
  item,
  demographic,
}: {
  item?: {
    payment_mode?: string;
    total_expenses?: number;
  };
  demographic: any;
}) {
  let percentage =
    item?.total_expenses && (item?.total_expenses / 1000).toFixed();

  return (
    <div className="relative">
      <Text className="mb-1 font-medium text-gray-900 dark:text-gray-600">
        {item?.payment_mode || "Others"}
      </Text>
      <div className="flex items-center gap-2">
        <div
          className="h-5 rounded bg-primary shadow"
          style={{
            width: `${percentage}%`,
          }}
        />
        <Text className="shrink-0 font-medium text-gray-900">
          {demographic?.currency_symbol || ""}
          {formatNumber(item?.total_expenses || 0)}
        </Text>
      </div>
    </div>
  );
}
