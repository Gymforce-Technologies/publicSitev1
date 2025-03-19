import { CustomTooltipProps } from "@core/components/charts/custom-tooltip";
import { addSpacesToCamelCase } from "@core/utils/add-spaces-to-camel-case";
import cn from "@core/utils/class-names";
import { formatNumber } from "@core/utils/format-number";
import { Text } from "rizzui";
// import { addSpacesToCamelCase } from '../../../';

function isValidHexColor(colorCode: string) {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(colorCode);
}
export function CustomToolTP({
  label,
  prefix,
  active,
  postfix,
  payload,
  className,
  formattedNumber,
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
      <div className="px-2 py-1 text-xs">
        {payload?.map((item: any, index: number) => (
          <div
            key={item.dataKey + index}
            className="chart-tooltip-item flex items-center py-1"
          >
            <span
              className=" h-2 w-2 rounded-full"
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
                {addSpacesToCamelCase(item.dataKey)}:
              </Text>{" "}
              <Text
                as="span"
                className="font-medium text-gray-900 dark:text-gray-700"
              >
                {prefix && prefix}
                {formattedNumber ? formatNumber(item.value) : item.value}
                {postfix && postfix}
              </Text>
              {/* Add Package Type */}
              {item.payload.packageType && (
                <Text className="text-xs text-gray-500 mt-1 capitalize">
                  Package Type: {item.payload.packageType}
                </Text>
              )}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
