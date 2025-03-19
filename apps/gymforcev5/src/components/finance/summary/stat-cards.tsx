"use client";

import cn from "@core/utils/class-names";
import { TbCurrencyDollarOff } from "react-icons/tb";
import { IoMdCard } from "react-icons/io";
import MetricCard from "./metric-card";
// import { useMemo } from 'react';

export default function StatCards({
  className,
  payments,
  expenses,
  profitOrLoss,
  info,
  isLoading,
}: {
  className?: string;
  payments: number;
  expenses: number;
  profitOrLoss: number;
  info: any;
  isLoading: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-5 bg-inherit sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ",
        className
      )}
    >
      {isLoading ? (
        <>
          <div className="w-full">
            <div className="h-40 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
          </div>

          <div className="w-full">
            <div className="h-40 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
          </div>

          <div className="w-full">
            <div className="h-40 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </>
      ) : (
        <>
          <MetricCard
            title={"Payments"}
            metric={new Intl.NumberFormat().format(payments)}
            icon={
              <IoMdCard className="h-6 w-6 cursor-pointer text-gray-900 dark:text-gray-200" />
            }
            iconClassName="bg-transparent w-11 h-11"
            metricClassName={"text-green-500"}
            info={info?.currency_symbol || ""}
          />
          <MetricCard
            title={"Expences"}
            metric={new Intl.NumberFormat().format(expenses)}
            icon={
              <TbCurrencyDollarOff className="h-6 w-6 cursor-pointer text-gray-900 dark:text-gray-200" />
            }
            iconClassName="bg-transparent w-11 h-11"
            metricClassName={"text-red-500"}
            info={info?.currency_symbol || ""}
          />
          <MetricCard
            title={`${profitOrLoss < 0 ? "Loss" : "Profit"}`}
            metric={new Intl.NumberFormat().format(profitOrLoss)}
            icon={
              <TbCurrencyDollarOff className="h-6 w-6 cursor-pointer text-gray-900 dark:text-gray-200" />
            }
            iconClassName="bg-transparent w-11 h-11"
            metricClassName={`${profitOrLoss < 0 ? "text-red-600" : "text-green-500"}`}
            info={info?.currency_symbol || ""}
          />
        </>
      )}
    </div>
  );
}
