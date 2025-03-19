// this table component is from the rizzui RC table integration and needed along with the table header component to show tables

import React from "react";
import Table from "rc-table";
import { Empty, cn } from "rizzui";

export type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : T;

const tableStyles = {
  table:
    "[&_.rc-table-content]:overflow-x-auto [&_table]:w-full [&_.rc-table-row:hover]:bg-muted/60",
  thead:
    "[&_thead]:text-left [&_thead]:rtl:text-right [&_th.rc-table-cell]:uppercase [&_th.rc-table-cell]:text-xs [&_th.rc-table-cell]:font-medium [&_th.rc-table-cell]:tracking-wide",
  tCell:
    "[&_.rc-table-cell]:px-3 [&_th.rc-table-cell]:py-3 [&_td.rc-table-cell]:py-4",
  variants: {
    classic:
      "[&_thead]:bg-muted/50 [&_.rc-table-container]:border-x [&_.rc-table-container]:border-muted [&_td.rc-table-cell]:border-b [&_td.rc-table-cell]:border-muted [&_thead]:border-y [&_thead]:border-muted",
    modern:
      "[&_thead]:bg-muted/50 [&_td.rc-table-cell]:border-b [&_td.rc-table-cell]:border-muted",
    minimal: "[&_thead]:bg-muted/50",
    elegant:
      "[&_thead]:border-y [&_thead]:border-muted [&_td.rc-table-cell]:border-b [&_td.rc-table-cell]:border-muted",
  },
  striped: "[&_.rc-table-row:nth-child(2n)_.rc-table-cell]:bg-muted/40",
};

type RCTableProps = ExtractProps<typeof Table>;

export interface TableProps
  extends Omit<RCTableProps, "className" | "emptyText"> {
  emptyText?: React.ReactElement;
  variant?: keyof typeof tableStyles.variants;
  striped?: boolean;
  className?: string;
}

export default function RcTable({
  striped,
  variant = "classic",
  emptyText,
  className,
  ...props
}: TableProps) {
  return (
    <Table
      className={cn(
        tableStyles.table,
        tableStyles.thead,
        tableStyles.tCell,
        tableStyles.variants[variant],
        striped && tableStyles.striped,
        className
      )}
      emptyText={emptyText ?? <Empty />}
      {...props}
    />
  );
}

RcTable.displayName = "Table";