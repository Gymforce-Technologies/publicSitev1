"use client";

// import { productsData } from '@/data/products-data';
import { productsListColumns } from "@/app/shared/ecommerce/product/product-list/columns";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import Table from "@core/components/table";
import WidgetCard from "@core/components/cards/widget-card";
import cn from "@core/utils/class-names";
import TablePagination from "@core/components/table/pagination";
import { Input } from "rizzui";
import { PiMagnifyingGlassBold } from "react-icons/pi";

// export type ProductsDataType = (typeof productsData)[number];

export default function StockReport({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Stock Report"
      className={cn("p-0 lg:p-0", className)}
      headerClassName="mb-6 px-5 pt-5 lg:px-7 lg:pt-7"
    >
      <div>Builf Fix</div>
    </WidgetCard>
  );
}
