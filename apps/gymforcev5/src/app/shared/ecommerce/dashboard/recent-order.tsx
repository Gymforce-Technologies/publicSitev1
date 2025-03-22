"use client";

// import { orderData } from "@/data/order-data";
import { ordersColumns } from "@/app/shared/ecommerce/order/order-list/columns";
import WidgetCard from "@core/components/cards/widget-card";
import Table from "@core/components/table";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import TablePagination from "@core/components/table/pagination";
import cn from "@core/utils/class-names";
import { Input } from "rizzui";
import { PiMagnifyingGlassBold } from "react-icons/pi";

// export type OrdersDataType = (typeof orderData)[number];

export default function RecentOrder({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Recent Orders"
      className={cn("p-0 lg:p-0", className)}
      headerClassName="px-5 pt-5 lg:px-7 lg:pt-7 mb-6"
    >
      <div>Build Fix</div>
    </WidgetCard>
  );
}
