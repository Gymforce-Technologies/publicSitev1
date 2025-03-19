"use client";

import React, { useMemo, useState } from "react";
import Table from "@/components/rizzui/table/table";
import HeaderCell from "@/components/rizzui/table/HeaderCell";
import { Loader, Text, Title } from "rizzui";
import Pagination from "@core/ui/pagination";
import Link from "next/link";
import cn from "@core/utils/class-names";
// import { Checkbox, Badge, Button, Input } from "rizzui";
// import { CircleMinus, Contact, LockKeyhole, Pencil, RotateCw, Trash2 } from "lucide-react";
// import { CircleCheck } from 'lucide-react';
// import { getAccessToken } from "@/app/(auth)/auth/Acces";
// import axios from "axios";
// import { useRouter } from "next/navigation";

type Payment = {
  id: string;
  memberId: string;
  memberLocalId: string;
  memberName: string;
  payment_date: string;
  amount: number;
};

const getColumns = (order: string, column: keyof Payment, info: any) => [
  {
    title: (
      <HeaderCell
        title="Member"
        className="text-sm font-semibold dark:text-gray-200"
      />
    ),
    dataIndex: "member__name",
    key: "id",
    width: 200,
    render: (_: string, row: any) => (
      <figure className={cn("flex items-center gap-3 dark:text-gray-200")}>
        <figcaption className="grid gap-0.5">
          <Link href={`/member_profile/yk62-${row.id}-71he`}>
            {/* */}
            <Text className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700 hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Text className="font-lexend text-sm text-nowrap text-clip font-medium text-gray-900 dark:text-gray-200 hover:text-primary">
                  <Text>{row.member__name}</Text>
                </Text>
              </span>
            </Text>
          </Link>
        </figcaption>
      </figure>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Tnx"
        className="text-sm font-semibold dark:text-gray-200"
        // sortable
        // ascending={order === "asc" && column === "id"}
      />
    ),
    dataIndex: "payment_date",
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
    key: "amount",
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

const PaymentSummaryTable = ({
  PaymentData,
  info,
  isLoading,
}: {
  PaymentData: Payment[] | null;
  info: any;
  isLoading: boolean;
}) => {
  const [order, setOrder] = useState<string>("desc");
  const [column, setColumn] = useState<keyof Payment>("id");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalRecords = PaymentData?.length || 0;
  const columns: any = React.useMemo(
    () => getColumns(order, column, info),
    [order, column, info]
  );
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return PaymentData?.slice(startIndex, endIndex) || [];
  }, [currentPage, PaymentData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <div>
      <div className="flex items-center">
        <div className="mt-3 w-[100%] flex flex-col gap-2">
          <Title as="h5" className="text-gray-900 dark:text-gray-200">
            Payment Table
          </Title>
          {
            paginatedData ?(
              <Table
              data={paginatedData}
              // @ts-ignore
              columns={columns}
              scroll={{ y: 500 }}
              variant="minimal"
              className="text-sm mt-4 md:mt-6 rounded-sm dark:[&_.rc-table-row:hover]:bg-gray-800 dark:[&_thead]:bg-gray-700 dark:[&_thead_tr]:rounded-lg dark:[&_thead]:text-gray-200 dark:[&_td]:text-gray-400"
              rowClassName="!dark:bg-inherit dark:text-gray-400 "
            />):(
              <div className="w-full flex items-center justify-center my-4">
                <Loader variant="spinner" size="xl" />
              </div>
            )
          }

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

export default PaymentSummaryTable;
