'use client';

import { Text } from 'rizzui';
import cn from '@core/utils/class-names';
import { FaRupeeSign } from "react-icons/fa";
const metricCardClasses = {
  base: 'border border-muted bg-gray-0 p-5 dark:bg-gray-50 lg:p-6',
  rounded: {
    sm: 'rounded-sm',
    DEFAULT: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
  },
};

type MetricCardTypes = {
  title: string;
  metric: number;
  icon?: React.ReactNode;
  iconClassName?: string;
  contentClassName?: string;
  chart?: React.ReactNode;
  info?: React.ReactNode;
  rounded?: keyof typeof metricCardClasses.rounded;
  titleClassName?: string;
  metricClassName?: string;
  chartClassName?: string;
  className?: string;
};

export default function MetricCard({
  title,
  metric,
  icon,
  chart,
  info,
  rounded = 'DEFAULT',
  className,
  iconClassName,
  contentClassName,
  titleClassName,
  metricClassName,
  chartClassName,
  children,
}: React.PropsWithChildren<MetricCardTypes>) {
  return (
    <div
      className={cn(
        metricCardClasses.base,
        metricCardClasses.rounded[rounded],
        className,"shadow-md"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon ? (
            <div
              className={cn(
                'flex h-15 w-15 items-center justify-center rounded-lg bg-gray-100 lg:h-12 lg:w-12',
                iconClassName
              )}
            >
              {icon}
            </div>
          ) : null}

          <div className={cn(icon && 'ps-3 flex flex-col items-start', contentClassName)}>
          <Text
              className={cn(
                `font-lexend text-lg font-semibold 2xl:xl:text-xl flex justify-center items-center `,
                metricClassName
              )}
            >
              <FaRupeeSign />{metric}
            </Text>
            <Text className={cn('mb-0.5 text-gray-500', titleClassName)}>
              {title}
            </Text>
           

            {info ? info : null}
          </div>
        </div>

        {chart ? (
          <div className={cn('h-12 w-20', chartClassName)}>{chart}</div>
        ) : null}
      </div>

      {children}
    </div>
  );
}
