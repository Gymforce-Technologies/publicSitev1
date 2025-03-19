// BudgetStats.tsx
import { useEffect, useState } from "react";
import cn from "@core/utils/class-names";
import { Badge, Progressbar, Text, Tooltip } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { MdEdit } from "react-icons/md";
import { formatNumber } from "@core/utils/format-number";
import toast from "react-hot-toast";

type BudgetItem = {
  label: string;
  budget: number;
  expenses: number;
  percentageUsed?: number;
  status?: string;
};

export default function BudgetDistribution({
  data,
  onEdit,
  className,
  auth,
  access,
}: {
  data: Array<{
    label: string;
    budget: number;
    expenses: number;
  }>;
  onEdit?: (type: string) => void;
  className?: string;
  auth: boolean;
  access: boolean;
}) {
  const [dataVal, setDataVal] = useState<BudgetItem[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const processedData = data.map((item) => {
        // Calculate percentage and cap at 100%
        const calculatedPercentage = Math.round(
          (item.expenses / item.budget) * 100
        );
        const percentageUsed = Math.min(calculatedPercentage, 100);

        // Determine status
        const status = item.expenses > item.budget ? "exceeded" : "normal";

        return {
          ...item,
          percentageUsed,
          status,
        };
      });

      setDataVal(processedData);
    }
  }, [data]);

  // Return null if no budget data
  if (dataVal.length === 0) {
    return null;
  }

  return (
    <WidgetCard className="border-none !p-1">
      <div className="pt-0">
        {dataVal.map((item) => (
          <div
            className="grid grid-cols-[90%,10%] md:grid-cols-[80%,20%]"
            key={item.label}
          >
            <div className="my-2 space-y-1 relative">
              <div className="grid grid-cols-[35%,25%,40%] items-center">
                <Text className="capitalize">{item.label + " Budget"}</Text>
                <Text className="capitalize">
                  Budget: {formatNumber(item.budget)}
                </Text>
                <Text className="capitalize flex items-center gap-2">
                  Expenses:
                  <Badge className="">{formatNumber(item.expenses)}</Badge>
                </Text>
              </div>
              <Progressbar
                size="xl"
                value={item.percentageUsed || 0}
                label={`${Math.round((item.expenses / item.budget) * 100)}%`}
                barClassName={cn(
                  "relative after:content-['']  after:size-2 after:rounded-full after:bg-white after:absolute after:top-1/2 after:-translate-y-1/2 after:end-1 p-1"
                )}
                labelClassName="text-gray-0 text-right"
                labelPosition="insideBar"
                variant="solid"
                className="rounded-full bg-muted p-1 pe-2"
              />
            </div>
            <div className="flex items-center justify-center cursor-pointer pt-2">
              <Tooltip content={`Modify ${item.label} Budget`}>
                <div
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    onEdit?.(item.label);
                  }}
                >
                  <MdEdit size={18} />
                </div>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
