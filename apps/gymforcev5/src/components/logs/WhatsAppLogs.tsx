"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AxiosPrivate, newID } from "../../app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
// import WidgetCard from "@/components/cards/widget-card";
import { Loader, Text, Select, Badge } from "rizzui";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import Pagination from "@core/ui/pagination";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "../../app/[locale]/auth/DateFormat";

interface MessageLog {
  index?: number;
  recipient: string;
  template_name: string;
  status: string;
  created_at: string;
}

const WhatsAppLogs: React.FC = () => {
  const [logs, setLogs] = useState<MessageLog[]>([]);
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
        `/api/whatsapp-message-logs/?gym_id=${gymId}&page=${pageNumber}&page_size=${pageSize}`,
        {
          id: newID(`get-wa-logs-${pageNumber}-${pageSize}`),
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
      console.error("Error fetching logs:", error);
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
        render: (index: number) => (
          <Text className="font-medium">{index + 1}</Text>
        ),
      },
      {
        title: (
          <HeaderCell
            title="Recipient Ph.No"
            className="text-sm font-semibold"
          />
        ),
        dataIndex: "recipient",
        key: "recipient",
        width: 200,
        render: (recipient: string | string[]) => (
          <Text className="font-medium">{recipient}</Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Template" className="text-sm font-semibold" />
        ),
        dataIndex: "template_name",
        key: "template_name",
        width: 200,
        render: (template: string) => (
          <Text className="capitalize">{template.replace(/_/g, " ")}</Text>
        ),
      },
      {
        title: <HeaderCell title="Status" className="text-sm font-semibold" />,
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (status: string) => (
          <Badge
            className="capitalize"
            variant="flat"
            color={status.toLowerCase() === "pending" ? "warning" : "success"}
          >
            {status}
          </Badge>
        ),
      },
      {
        title: (
          <HeaderCell title="Date & Time" className="text-sm font-semibold" />
        ),
        dataIndex: "created_at",
        key: "created_at",
        width: 200,
        render: (date: string) => (
          <DateCell date={new Date(date)} dateFormat={getDateFormat()} />
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
            striped
            scroll={{ y: 500 }}
            className="text-sm mt-4 md:mt-6 text-nowrap rounded-sm [&_.rc-table-row:hover]:bg-gray-100"
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

export default WhatsAppLogs;
