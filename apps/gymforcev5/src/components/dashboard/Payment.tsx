"use client";

import React from "react";
import { Title, Text, Empty, Loader } from "rizzui";
import cn from "@core/utils/class-names";
import WidgetCard from "@core/components/cards/widget-card";
import SimpleBar from "@core/ui/simplebar";
import CircleProgressBar from "@core/components/charts/circle-progressbar";
import TrophyIcon from "@core/components/icons/trophy";

export type PaymentMode = {
  id: string;
  name: string;
  total_amount: number;
  total_count: number;
};

const paymentModeColors = [
  { color: "text-yellow-500", fill: "bg-yellow-500/10" }, // Gold
  { color: "text-gray-400", fill: "bg-gray-400/10" }, // Silver
  { color: "text-orange-600", fill: "bg-orange-600/10" }, // Bronze
];

export default function Payment({
  payments,
  className,
  info,
  isLoading,
  hideValues,
}: {
  payments: PaymentMode[];
  className?: string;
  info: any;
  isLoading: boolean;
  hideValues: boolean;
}) {
  const totalamount =
    payments?.reduce((acc, item) => acc + item.total_amount, 0) || 0;

  return (
    <div className={cn(className, "")}>
      <Title
        as="h3"
        className="mb-3 text-lg font-semibold text-gray-900 xl:text-xl 2xl:mb-5"
      >
        Top Payment Modes
      </Title>
      <WidgetCard
        title=""
        headerClassName="hidden"
        className="p-0 lg:p-0 dark:bg-inherit border-gray-400 "
      >
        {isLoading || !payments ? (
          <div className="lg:col-span-6 my-8 col-span-full flex flex-1 items-center justify-center min-w-full">
            <Loader size="xl" variant="threeDot" />
          </div>
        ) : payments && payments.length > 0 ? (
          <SimpleBar style={{ maxHeight: 450 }}>
            <div className="p-3 sm:p-5 lg:p-7">
              <div className="-me-2 grid gap-4 @sm:gap-8">
                {payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between pe-2"
                  >
                    <div className="flex gap-2 sm:gap-4">
                      <TrophyIcon
                        className={cn(
                          "size-6 sm:size-8 mt-1",
                          paymentModeColors[index].color
                        )}
                      />
                      <div className="flex flex-col w-fit gap-1 items-stretch justify-center">
                        <Text className="text-sm sm:font-semibold text-gray-900 2xl:text-base">
                          {payment.name}
                        </Text>
                        <div className="flex w-full items-center justify-between gap-4">
                          <Text className="text-xs sm:text-sm text-nowrap  font-medium text-gray-700 ">
                            {hideValues
                              ? `***`
                              : info.currency_symbol +
                                " " +
                                new Intl.NumberFormat().format(
                                  payment.total_amount
                                )}
                          </Text>
                          <Text className="text-xs sm:text-sm text-nowrap font-medium text-gray-700 ">
                            Total Payments:{" "}
                            <span className="font-semibold sm:text-base ">
                              {hideValues ? `***` : payment.total_count}
                            </span>
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div className="size-12 md:size-[60px] flex">
                      <CircleProgressBar
                        percentage={
                          totalamount
                            ? Number(
                                (
                                  (payment.total_amount / totalamount) *
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
                              (payment.total_amount / totalamount) *
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
            <Empty text="No Payments Available" />
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
