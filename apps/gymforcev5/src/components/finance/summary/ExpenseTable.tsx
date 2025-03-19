"use client";

import React, { useMemo, useState } from "react";
import Table from "@/components/rizzui/table/table";
import HeaderCell from "@/components/rizzui/table/HeaderCell";
import { Loader, Text, Title } from "rizzui";
import Pagination from "@core/ui/pagination";

type Expense = {
  category: string;
  id: string;
  amount: number;
  expense_date: string;
};

const getColumns = (order: string, column: keyof Expense, info: any) => [
  {
    title: (
      <HeaderCell
        title="Description"
        className="text-sm font-semibold dark:text-gray-200"
      />
    ),
    dataIndex: "category",
    key: "id",
    width: 200,
    render: (discription: string) => (
      <Text className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-200">
        {discription}
      </Text>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Date"
        className="text-sm font-semibold dark:text-gray-200"
        // sortable
        // ascending={order === "asc" && column === "id"}
      />
    ),
    dataIndex: "expense_date",
    key: "id",
    width: 200,
    render: (date: any) => {
      return (
        <Text className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-200">
          {date}
        </Text>
      );
    },
  },
  {
    title: (
      <HeaderCell
        title="Amount"
        className="text-sm font-semibold dark:text-gray-200"
      />
    ),
    dataIndex: "amount",
    key: "id",
    width: 200,
    render: (amount: number) => {
      return (
        <Text className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-200 ">
          {info?.currency_symbol} {new Intl.NumberFormat().format(amount)}
        </Text>
      );
    },
  },
];

const ExpenseSummaryTable = ({
  ExpenseData,
  info,
  isLoading,
}: {
  ExpenseData: Expense[] | null;
  info: any;
  isLoading: boolean;
}) => {
  const [order, setOrder] = useState<string>("desc");
  const [column, setColumn] = useState<keyof Expense>("id");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalRecords = ExpenseData?.length || 0;
  const columns: any = React.useMemo(
    () => getColumns(order, column, info),
    [order, column, info]
  );
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return ExpenseData?.slice(startIndex, endIndex) || [];
  }, [currentPage, ExpenseData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mt-3 w-[100%] flex flex-col gap-2">
          <Title as="h5" className="text-gray-900 dark:text-gray-200">
            Expense Table
          </Title>
          {paginatedData ? (
            <Table
              data={paginatedData}
              // @ts-ignore
              columns={columns}
              scroll={{ y: 500 }}
              variant="minimal"
              className="text-sm mt-4 md:mt-6 rounded-sm dark:[&_.rc-table-row:hover]:bg-gray-800 dark:[&_thead]:bg-gray-700 dark:[&_thead_tr]:rounded-lg dark:[&_thead]:text-gray-200 dark:[&_td]:text-gray-400"
              rowClassName="!dark:bg-inherit dark:text-gray-400 "
            />
          ) : (
            <div className="w-full flex items-center justify-center my-4">
              <Loader variant="spinner" size="xl" />
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Pagination
              total={totalRecords}
              current={currentPage}
              onChange={handlePageChange}
              pageSize={recordsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummaryTable;
