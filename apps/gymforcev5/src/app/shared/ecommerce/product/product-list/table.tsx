"use client";

// import { productsData } from "@/data/products-data";
import Table from "@core/components/table";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import TablePagination from "@core/components/table/pagination";
// import { ProductsDataType } from "@/app/shared/ecommerce/dashboard/stock-report";
import { productsListColumns } from "./columns";
import Filters from "./filters";
import TableFooter from "@core/components/table/footer";
import { TableClassNameProps } from "@core/components/table/table-types";
import cn from "@core/utils/class-names";
import { exportToCSV } from "@core/utils/export-to-csv";

export default function ProductsTable({
  pageSize = 5,
  hideFilters = false,
  hidePagination = false,
  hideFooter = false,
  classNames = {
    container: "border border-muted rounded-md",
    rowClassName: "last:border-0",
  },
  paginationClassName,
}: {
  pageSize?: number;
  hideFilters?: boolean;
  hidePagination?: boolean;
  hideFooter?: boolean;
  classNames?: TableClassNameProps;
  paginationClassName?: string;
}) {
  return (
    <>
      <div>Build Fix</div>
    </>
  );
}
