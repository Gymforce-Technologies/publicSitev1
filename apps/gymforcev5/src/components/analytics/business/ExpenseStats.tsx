"use client";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { TooltipProps } from "recharts";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import { addSpacesToCamelCase } from "@core/utils/add-spaces-to-camel-case";
import { formatNumber } from "@core/utils/format-number";

import WidgetCard from "@core/components/cards/widget-card";
import dayjs from "dayjs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";

export default function ExpenseStats({
  className,
  data,
  demographic,
}: {
  className?: string;
  data: any[];
  demographic: any;
}) {
  const transformedData = data.map((item, index) => {
    return {
      ...item,
      month: dayjs(item.month).format("MMM"),
      color: `hsl(${(index * 50) % 360}, 70%, 60%)`, // Generate unique colors
    };
  });
  return (
    <WidgetCard title={"Expense Stats"} className={className}>
      <div className="mt-5 aspect-[1060/660] w-full lg:mt-7">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={transformedData}
            margin={{
              left: -20,
            }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <defs>
              <linearGradient id="Expenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#3872FA"
                  className="[stop-opacity:0.4] dark:[stop-opacity:0.3]"
                />
                <stop offset="95%" stopColor={"#3872FA"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              dataKey="total_expenses"
              tick={({ payload, ...rest }) => {
                const pl = {
                  ...payload,
                  value: formatNumber(Number(payload.value)),
                };
                return (
                  <CustomYAxisTick
                    prefix={demographic?.currency_symbol || ""}
                    payload={pl}
                    {...rest}
                  />
                );
              }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  payload={transformedData}
                  prefix={demographic?.currency_symbol || ""}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="total_expenses"
              stackId="1"
              strokeWidth={2}
              stroke="#3872FA"
              // fill="#3872FA"
              fill="url(#Expenses)"
              // fillOpacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

const formatYAxisTick = (value: number): string => {
  if (value >= 1000) {
    return `$${value / 1000}k`;
  }
  return value.toString();
};

function isValidHexColor(colorCode: string) {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(colorCode);
}

export interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  prefix?: string;
  postfix?: string;
  className?: string;
  formattedNumber?: boolean;
}

export function CustomTooltip({
  label,
  prefix,
  active,
  postfix,
  payload,
  className,
}: CustomTooltipProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100",
        className
      )}
    >
      <Text className="label mb-0.5 block bg-gray-100 p-2 px-2.5 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700">
        {label}
      </Text>
      <div className="px-3 py-1.5 text-xs">
        {payload?.map((item: any, index: number) => (
          <div key={item.dataKey + index}>
            <div className="chart-tooltip-item flex items-center py-1.5">
              <span
                className="me-1.5 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isValidHexColor(item.fill)
                    ? item.fill === "#fff"
                      ? item.stroke
                      : item.fill
                    : item.stroke,
                }}
              />
              <Text>
                <Text as="span" className="capitalize">
                  {addSpacesToCamelCase(item.dataKey.split("_").join(" "))}:
                </Text>{" "}
                <Text
                  as="span"
                  className="font-medium text-gray-900 dark:text-gray-700"
                >
                  {prefix && prefix}
                  {formatNumber(item.value)}
                  {postfix && postfix}
                </Text>
              </Text>
            </div>
            {/* <div className="chart-tooltip-item flex items-center py-1.5">
              <span
                className="me-1.5 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isValidHexColor(item.fill)
                    ? item.fill === "#fff"
                      ? item.stroke
                      : item.fill
                    : item.stroke,
                }}
              />
              <Text>
                <Text as="span" className="capitalize">
                  High Expense :
                </Text>{" "}
                <Text
                  as="span"
                  className="font-medium text-gray-900 dark:text-gray-700"
                >
                  {item?.top_categories
                    ? Object.keys(item.top_categories)[0] || "N/A"
                    : "N/A"}
                </Text>
              </Text>
            </div>
            <div className="chart-tooltip-item flex items-center py-1.5">
              <span
                className="me-1.5 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isValidHexColor(item.fill)
                    ? item.fill === "#fff"
                      ? item.stroke
                      : item.fill
                    : item.stroke,
                }}
              />
              <Text>
                <Text as="span" className="capitalize">
                  Others :
                </Text>{" "}
                <Text
                  as="span"
                  className="font-medium text-gray-900 dark:text-gray-700"
                >
                  {item.other_expenses}
                </Text>
              </Text>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}
