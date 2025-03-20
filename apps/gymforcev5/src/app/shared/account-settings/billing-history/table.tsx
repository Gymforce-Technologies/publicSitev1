"use client";

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColumn } from "@core/hooks/use-column";
import { getColumns } from "@/app/shared/account-settings/billing-history/columns";
import { useTable } from "@core/hooks/use-table";
// import { Button } from "rizzui";
import TableFooter from "@/app/shared/table-footer";
import ControlledTable from "@/app/shared/controlled-table";
import { exportToCSV } from "@core/utils/export-to-csv";
// import { useTranslation } from "@/app/i18n/client";
// import { getDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { setPageSize } from "@/components/pageSize";
import { getColumnsAddon } from "./column2";
// import { useTranslations } from "next-intl";
// import { pageSizeOptions } from "@/components/pageSize";

interface BillingHistoryTableProps {
  className?: string;
  lang?: string;
  data: any[];
  pageSizeVal: number | null;
  setPageSizeVal: Dispatch<SetStateAction<number | null>>;
  totalItems: number;
  currentPage: number;
  handlePageChange: (pageNumber: number) => Promise<void>;
  isLoading: boolean;
}

export default function BillingHistoryTable({
  className,
  data,
  lang,
  pageSizeVal,
  currentPage,
  handlePageChange,
  setPageSizeVal,
  totalItems,
  isLoading,
}: BillingHistoryTableProps) {
  const [pageSizeV, setPageSizeV] = useState(pageSizeVal ?? 10);
  const [demographics, setDemographics] = useState<any>({});
  const [type, setType] = useState("");
  // useEffect(() => {
  //   const getPreReq = async () => {
  //     const demographics = await getDemographicInfo();
  //     setDemographics(demographics);
  //   };
  //   getPreReq();
  // }, []);
  useEffect(() => {
    setPageSizeVal(pageSizeV);
    setPageSize(pageSizeV);
    data.map((item: any) => {
      if (item?.plan_details?.plan_type === "addon") {
        setType("addon");
      }
    });
    console.log("data", data);
  }, [pageSizeV]);
  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const {
    // isLoading,
    tableData,
    handlePaginate,
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleDelete,
  } = useTable<any>(data, pageSizeVal ?? 0);

  const columns = useMemo(
    () =>
      getColumns({
        sortConfig,
        onHeaderCellClick,
        demographics,
      }),
    [sortConfig, onHeaderCellClick]
  );

  const columnsAddon = useMemo(
    () =>
      getColumnsAddon({
        sortConfig,
        onHeaderCellClick,
        demographics,
      }),
    [sortConfig, onHeaderCellClick]
  );
  const currentColums = type === "addon" ? columnsAddon : columns;
  const { visibleColumns } = useColumn(currentColums);

  const selectedData = data.filter((item) => selectedRowKeys.includes(item.id));

  function handleExportData() {
    exportToCSV(
      selectedData,
      "Plan Name,Duration,Price,Start Date,End Date,Status",
      `billing_history_${selectedData.length}`
    );
  }

  return (
    <div className={className + " dark:bg-inherit "}>
      <ControlledTable
        isLoading={isLoading}
        data={data}
        //@ts-ignore
        columns={visibleColumns}
        scroll={{ x: "max-content", y: 500 }}
        //@ts-ignore
        variant="nope"
        rowKey={(record) => record.id}
        className=" mt-4 md:mt-6 rounded-sm  [&_.rc-table-thead_tr]:bg-gray-100"
        paginatorOptions={{
          pageSize: pageSizeV,
          setPageSize: setPageSizeV,
          total: totalItems,
          current: currentPage,
          onChange: (page: number) => {
            handlePageChange(page);
          },
          pageSizeOptions: ["5", "10", "15", "20", "25"],
        }}
        tableFooter={
          <TableFooter
            checkedItems={selectedRowKeys}
            handleDelete={(ids: string[]) => {
              setSelectedRowKeys([]);
              handleDelete(ids);
            }}
          >
            {/* <Button
              size="sm"
              onClick={() => handleExportData()}
              className="dark:bg-gray-300 dark:text-gray-800"
            >
              {("text-download")} {selectedRowKeys.length}{" "}
              {selectedRowKeys.length > 1
                ? t("table-text-files")
                : t("table-text-file")}
            </Button> */}
          </TableFooter>
        }
      />
    </div>
  );
}
