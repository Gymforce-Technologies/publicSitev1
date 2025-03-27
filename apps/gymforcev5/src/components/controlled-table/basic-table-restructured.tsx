"use client";

import React from "react";
import { Input, Title } from "rizzui";
import cn from "@core/utils/class-names";

import { useTable } from "@core/hooks/use-table";
import { useColumn } from "@core/hooks/use-column";
import ControlledTable from "@/components/controlled-table";

type ColumnTypes = {
  data?: any[];
  sortConfig?: any;
  checkedItems?: string[];
  handleSelectAll?: any;
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

type BasicTableWidgetProps = {
  title?: any;
  className?: string;
  pageSize?: number;
  setPageSize?: React.Dispatch<React.SetStateAction<number>>;
  getColumns: ({
    data,
    sortConfig,
    checkedItems,
    handleSelectAll,
    onDeleteItem,
    onHeaderCellClick,
    onChecked,
  }: ColumnTypes) => any;
  data: any[];
  isLoading: boolean;
  enablePagination?: boolean;
  variant?: "modern" | "minimal" | "classic" | "elegant" | "retro";
  enableSearch?: boolean;
  paginatorClassName?: string;
  searchPlaceholder?: string;
  noGutter?: boolean;
  scroll?: {
    x?: number;
    y?: number;
  };
  sticky?: boolean;
};

export default function BasicTableWidget({
  isLoading,
  title,
  data,
  getColumns,
  pageSize = 7,
  setPageSize,
  enablePagination,
  variant = "modern",
  enableSearch = true,
  paginatorClassName,
  noGutter,
  sticky,
  scroll = { x: 1000 },
  className,
  searchPlaceholder = "Search...",
}: BasicTableWidgetProps) {
  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const onDeleteItem = (id: string) => {
    handleDelete(id);
  };

  const {
    sortConfig,
    totalItems,
    tableData,
    currentPage,
    searchTerm,
    handleSort,
    handleDelete,
    handleSearch,
    handlePaginate,
    selectedRowKeys,
    handleRowSelect,
    handleSelectAll,
  } = useTable(data, pageSize);

  const columns = React.useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        onHeaderCellClick,
        onDeleteItem,
        checkedItems: selectedRowKeys,
        onChecked: handleRowSelect,
        handleSelectAll,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
    ]
  );

  const { visibleColumns } = useColumn(columns);
  return (
    <div className="flex flex-col">
      <Title as="h3">{title}</Title>
      <div
        className={cn("table-wrapper flex-grow", noGutter && "-mx-5 lg:-mx-7")}
      >
        <ControlledTable
          isLoading={isLoading}
          data={data}
          columns={visibleColumns}
          scroll={scroll}
          sticky={sticky}
          variant={variant}
          className={"mt-4 " + className}
          {...(enablePagination && {
            paginatorOptions: {
              pageSize,
              ...(setPageSize && { setPageSize }),
              total: totalItems,
              current: currentPage,
              onChange: (page: number) => handlePaginate(page),
            },
            paginatorClassName: cn(
              "mt-4 lg:mt-5",
              noGutter && "px-5 ",
              paginatorClassName
            ),
          })}
        />
      </div>
    </div>
  );
}
