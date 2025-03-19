import React from "react";
import Image from "next/image";
import { Title, Text, Empty, Avatar, Loader } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import SimpleBar from "@core/ui/simplebar";
import TrophyIcon from "@core/components/icons/trophy";
import CircleProgressBar from "@core/components/charts/circle-progressbar";

type Membership = {
  id: string;
  name: string;
  training_type: string;
  total_amount: number;
  transaction_count: number;
};

const membershipColors = [
  { color: "text-yellow-500", fill: "bg-yellow-500/10" },
  { color: "text-gray-400", fill: "bg-gray-400/10" },
  { color: "text-orange-600", fill: "bg-orange-600/10" },
];

export default function Membership({
  stats,
  className,
  info,
  isLoading,
  hideValues,
}: {
  stats?: Membership[];
  className?: string;
  info: any;
  isLoading: boolean;
  hideValues: boolean;
}) {
  const totalamount =
    stats?.reduce((acc, item) => acc + item.total_amount, 0) || 0;

  return (
    <div className={className}>
      <Title
        as="h3"
        className="mb-3 text-lg font-semibold text-gray-900 xl:text-xl 2xl:mb-5 "
      >
        Top Membership Plans
      </Title>
      <WidgetCard
        title=""
        headerClassName="hidden"
        className="p-0 lg:p-0 dark:bg-inherit border-gray-400 "
      >
        {isLoading || !stats ? (
          <div className="lg:col-span-6 my-8 col-span-full flex flex-1 items-center justify-center min-w-full">
            <Loader size="xl" variant="threeDot" />
          </div>
        ) : stats && stats.length > 0 ? (
          <SimpleBar style={{ maxHeight: 450 }}>
            <div className="p-3 sm:p-5 lg:p-7">
              <div className="-me-2 grid gap-4 @sm:gap-8">
                {stats.slice(0, 3).map((membership, index) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between pe-2"
                  >
                    <div className="flex gap-2 sm:gap-4">
                      <TrophyIcon
                        className={cn(
                          "size-6 sm:size-8 mt-1",
                          membershipColors[index].color
                        )}
                      />
                      <div className="flex flex-col gap-1 items-stretch justify-center">
                        <div className="flex w-full items-center justify-between gap-2">
                          <Text className="text-sm font-medium sm:font-semibold text-gray-900 2xl:text-base ">
                            {membership.name}
                          </Text>
                          <Text className="text-gray-700 ">
                            {membership.training_type}
                          </Text>
                        </div>
                        <div className="flex w-full items-center flex-nowrap justify-between gap-4">
                          <Text className="text-xs sm:text-sm text-nowrap font-medium text-gray-700 ">
                            {hideValues
                              ? `***`
                              : info.currency_symbol +
                                " " +
                                new Intl.NumberFormat().format(
                                  membership.total_amount
                                )}
                          </Text>
                          <Text className=" text-xs sm:text-sm text-nowrap font-medium text-gray-700">
                            Membership Purchase :{" "}
                            <span className="font-semibold sm:text-base ">
                              {hideValues
                                ? `***`
                                : membership.transaction_count}
                            </span>
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div className="size-12 md:size-[60px] self-end">
                      <CircleProgressBar
                        percentage={
                          totalamount
                            ? Number(
                                (
                                  (membership.total_amount / totalamount) *
                                  100
                                ).toFixed(0)
                              )
                            : 0
                        }
                        size={80}
                        strokeWidth={10}
                        stroke="#D7E3FE"
                        progressColor="#3b82f6"
                        useParentResponsive={true}
                        label={
                          <Text
                            as="span"
                            className="text-base font-medium text-gray-900 "
                          >
                            {(
                              (membership.total_amount / totalamount) *
                              100
                            ).toFixed(0)}
                            %
                          </Text>
                        }
                        strokeClassName="dark:stroke-gray-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SimpleBar>
        ) : (
          <div className="py-2">
            <Empty text="No Membership Available" />
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
