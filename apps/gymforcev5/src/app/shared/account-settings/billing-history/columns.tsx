"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { PiCloudArrowDown } from "react-icons/pi";
import { HeaderCell } from "@/app/shared/table";
import { Checkbox, Title, Text, Button, Badge } from "rizzui";
import { exportToCSV } from "@core/utils/export-to-csv";

// Define the props for the getColumns function
interface GetColumnsProps {
  sortConfig: any;
  onHeaderCellClick: (key: string) => void;
  demographics: any;
}

// Define the structure of a column
interface Column {
  title: React.ReactNode;
  dataIndex: keyof any;
  key: string;
  width: number;
  render?: (value: any, record: any) => React.ReactNode;
  onHeaderCell?: () => { onClick: () => void };
}

const statusColors: { [key: string]: string } = {
  Active: "success",
  Cancelled: "danger",
  Pending: "warning",
  Expired: "danger",
  Upcoming: "secondary",
};

export const getColumns = ({
  sortConfig,
  onHeaderCellClick,
  demographics,
}: GetColumnsProps): Column[] => [
  {
    title: (
      <HeaderCell
        title="Status"
        sortable
        ascending={
          sortConfig?.direction === "asc" && sortConfig?.key === "status"
        }
      />
    ),
    dataIndex: "status",
    key: "status",
    width: 120,
    onHeaderCell: () => ({
      onClick: () => onHeaderCellClick("status"),
    }),
    render: (status: string) => (
      <Badge
        variant="flat"
        className="w-[90px] font-medium"
        //@ts-ignore
        color={statusColors[status] || "gray"}
      >
        {status}
      </Badge>
    ),
  },
  {
    title: <HeaderCell title="Plan Name" />,
    dataIndex: "plan_details",
    key: "plan_details",
    width: 250,
    render: (plan_details: any) => (
      <Title
        as="h6"
        className="mb-0.5 !text-sm font-medium text-gray-700 "
      >
        {plan_details?.name}
      </Title>
    ),
  },
  {
    title: <HeaderCell title="Duration" />,
    dataIndex: "plan_details",
    key: "plan_details",
    width: 120,
    render: (plan_details: any) => (
      <Text className="text-gray-700 ">
        {plan_details?.duration_months} months
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Price" />,
    dataIndex: "plan_details",
    key: "plan_details",
    width: 120,
    render: (plan_details: any) => (
      <Text className="text-gray-700 ">
        {(demographics?.currency_symbol || "") +
          " " +
          parseFloat(plan_details?.price).toFixed(2)}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Start Date" />,
    dataIndex: "start_date",
    key: "start_date",
    width: 150,
    render: (value: string) => (
      <Text className="text-gray-900 ">
        {dayjs(value).format("MMM DD, YYYY")}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="End Date" />,
    dataIndex: "end_date",
    key: "end_date",
    width: 150,
    render: (value: string) => (
      <Text className="text-gray-900 ">
        {dayjs(value).format("MMM DD, YYYY")}
      </Text>
    ),
  },
];
