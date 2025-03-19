"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
// import WidgetCard from "@/components/cards/widget-card";
import { Loader, Text, Select, Badge, Button, ActionIcon, Tooltip } from "rizzui";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import Pagination from "@core/ui/pagination";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { FaEye } from "react-icons/fa6";
import Link from "next/link";

interface BulkEmailLog {
  index?: number;
  email: string;
  subject: string;
  timestamp: string;
  status: string;
  member_id: number;
  member_localid: number;
}

const BulkEmailLogs: React.FC = () => {
  const [logs, setLogs] = useState<BulkEmailLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [logsCount, setLogsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async (pageNumber: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      let pageSize = pageSizeVal ?? parseInt(getPageSize());
      setPageSizeVal(pageSize);

      const response = await AxiosPrivate.get(
        `/api/bulk-email/logs/?gym_id=${gymId}&page=${pageNumber}&page_size=${pageSize}`,
        {
          id: newID(`get-bulk-mail-logs-${pageNumber}-${pageSize}`),
        }
      );

      setLogs(
        response.data.results.map((item: any, index: number) => ({
          ...item,
          index,
        }))
      );
      setLogsCount(response.data.count);
      setCurrentPage(pageNumber);
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [pageSizeVal, currentPage]);

  const getColumns = useCallback(
    () => [
      {
        title: <HeaderCell title="S.No" className="text-sm font-semibold" />,
        dataIndex: "index",
        key: "index",
        width: 50,
        render: (index: number) => <Text>{index + 1 || "-"}</Text>,
      },
      {
        title: <HeaderCell title="Email" className="text-sm font-semibold" />,
        dataIndex: "email",
        key: "email",
        width: 150,
        render: (email: string) => (
          <Text className="font-medium text-clip">{email}</Text>
        ),
      },
      {
        title: <HeaderCell title="Subject" className="text-sm font-semibold" />,
        dataIndex: "subject",
        key: "subject",
        width: 200,
        render: (subject: string) => (
          <Text className="truncate max-w-xs">{subject}</Text>
        ),
      },
      {
        title: <HeaderCell title="Status" className="text-sm font-semibold" />,
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: string) => (
          //   <Text
          //     className={`capitalize ${
          //       status.toLowerCase() === "failed"
          //         ? "text-red-500"
          //         : status.toLowerCase() === "sent"
          //           ? "text-green-500"
          //           : ""
          //     }`}
          //   >
          //     {status}
          //   </Text>
          <Badge
            className="capitalize"
            variant="flat"
            color={status.toLowerCase() !== "sent" ? "warning" : "success"}
          >
            {status}
          </Badge>
        ),
      },

      {
        title: (
          <HeaderCell title="Date & Time" className="text-sm font-semibold" />
        ),
        dataIndex: "timestamp",
        key: "timestamp",
        width: 150,
        render: (date: string) => (
          <DateCell date={new Date(date)} dateFormat={getDateFormat()} />
        ),
      },
      {
        dataIndex: "member_id",
        key: "member_id",
        width: 100,
        render: (member_id: string) => (
          <Link href={`/member_profile/yk62-${member_id}-71he`}>
            <Tooltip content="View Member Profile" placement="bottom">
              <ActionIcon
                className="hover:scale-105 duration-150 "
                variant="flat"
              >
                <FaEye />
              </ActionIcon>
            </Tooltip>
          </Link>
        ),
      },
    ],
    []
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  return (
    <div>
      {loading ? (
        <div className="grid h-32 flex-grow place-content-center items-center">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <>
          <Table
            variant="minimal"
            data={logs}
            columns={columns}
            scroll={{ y: 500 }}
            striped
            className="text-sm mt-4 text-nowrap md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100"
          />
          <div className="flex justify-between mt-4">
            <Select
              value={pageSizeVal}
              options={pageSizeOptions}
              placeholder="Items per page"
              className="w-auto"
              onChange={(option: any) => {
                setPageSizeVal(option.value);
                setPageSize(option.value);
              }}
            />
            <Pagination
              total={logsCount}
              current={currentPage}
              pageSize={pageSizeVal ?? 0}
              onChange={(page) => {
                setCurrentPage(page);
                fetchLogs(page);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BulkEmailLogs;
