"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Table from "@/components/rizzui/table/table";
import HeaderCell from "@/components/rizzui/table/HeaderCell";
import {
  // Checkbox,
  Badge,
  Button,
  Input,
  Text,
  Loader,
} from "rizzui";
import Pagination from "@core/ui/pagination";
import {
  AxiosPrivate,
  // invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
// import { IoMdAdd } from "react-icons/io";
import cn from "@core/utils/class-names";
import Link from "next/link";
import WidgetCard from "@core/components/cards/widget-card";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";

export type Data = {
  id: string;
  heading: string;
  description: boolean;
  creatime_fields: string[] | any;
  status: string;
};

const getColumns = () => [
  {
    title: <HeaderCell title="S.No" className="text-sm font-semibold " />,
    // onHeaderCell: () => onHeaderClick("id"),
    dataIndex: "ind",
    key: "ind",
    width: 30,
  },
  {
    title: <HeaderCell title="Subject" className="text-sm font-semibold " />,
    dataIndex: "name",
    key: "name",
    width: 250,
    render: (_: string, row: Data) => (
      <figure className={cn("flex items-center gap-3 ")}>
        <figcaption className="grid gap-0.5">
          <Link href={`/support/view-ticket/${row.id}`}>
            <Text className=" text-sm font-medium text-gray-900  hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Text className="text-sm font-medium text-gray-900  hover:text-primary">
                  {" "}
                  {row.heading}
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
      <HeaderCell title="description" className="text-sm font-semibold " />
    ),
    dataIndex: "description",
    key: "description",
    width: 300,
    render: (description: string) => (
      <Text className=" text-sm font-medium text-gray-900  ">
        {description}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="status" className="text-sm font-semibold " />,
    dataIndex: "status",
    key: "status",
    width: 150,
    render: (status: string) => (
      <>
        {status == "ONGOING" ? (
          <Badge variant="flat" color="warning">
            {status}
          </Badge>
        ) : (
          <Badge variant="flat" color="success">
            {status}
          </Badge>
        )}
      </>
    ),
  },
  {
    title: <HeaderCell title="created at" className="text-sm font-semibold " />,
    dataIndex: "time_fields",
    key: "time_fields",
    width: 150,
    render: (time_fields: any) => (
      <Text className=" text-sm font-medium text-gray-900  ">
        {time_fields[0] ? (
          <DateCell
            date={time_fields[0].split("T")[0]}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            dateClassName=""
          />
        ) : (
          "NA"
        )}
      </Text>
    ),
  },
  {
    title: (
      <HeaderCell title="resolved at" className="text-sm font-semibold " />
    ),
    dataIndex: "time_fields",
    key: "time_fields",
    width: 150,
    render: (time_fields: any) => (
      <Text className=" text-sm font-medium text-gray-900  ">
        {time_fields[1] ? (
          <DateCell
            date={time_fields[1].split("T")[0]}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            dateClassName=""
          />
        ) : (
          "NA"
        )}
      </Text>
    ),
  },

  {
    title: <></>,
    dataIndex: "action",
    key: "action",
    width: 150,
    render: (_: string, row: any) => (
      <div>
        <Link href={`/support/view-ticket/${row.id}`}>
          <Button>View</Button>
        </Link>
      </div>
    ),
  },
];

const AllTickets: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const URL = `/api/issues/?gym_id=${gymId}`;
      const res = await AxiosPrivate.get(URL, { id: newID(`allissues`) });
      console.log(res.data);
      const ProcessedData = res.data.data.map((ticket: any, index: number) => {
        return { ...ticket, ind: index + 1 };
      });
      setData(ProcessedData);
      console.log(ProcessedData);
      setTotalCount(ProcessedData.length);
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setLoading(false);
    }
  }, [status, currentPage]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const columns: any = React.useMemo(() => getColumns(), []);

  const filteredData = useMemo(() => {
    return data.filter((ticket) =>
      ticket.heading.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [data, searchInput]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <WidgetCard
      headerClassName="mb-6 items-start flex-col @[57rem]:flex-row @[57rem]:items-center "
      actionClassName="w-full ps-0 items-center"
      title="All Tickets"
      className="dark:bg-inherit  border-gray-400 "
      titleClassName="text-gray-900 "
      action={
        <div className="flex justify-end items-end gap-4 max-sm:my-2">
          <Input
            type="text"
            value={searchInput}
            placeholder="Search ticket"
            onChange={(e) => setSearchInput(e.target.value)}
            onClear={() => setSearchInput("")}
            clearable
          />
          <Link href={`/support/create-ticket`}>
            <Button className="w-32">Add Ticket</Button>
          </Link>
        </div>
      }
    >
      <div className="mt-3">
        {loading ? (
          <div className="w-full flex items-center justify-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <Table
            //@ts-ignore
            variant="none"
            data={currentRecords}
            columns={columns}
            scroll={{ y: 500, x: "max-content" }}
            striped
            className="mt-4 rounded-sm text-nowrap [&_.rc-table-row:hover]:bg-gray-100/75 [&_.rc-table-head]:bg-gray-100"
          />
        )}
      </div>
      <div className="flex justify-end mt-4">
        <Pagination
          total={totalRecords}
          current={currentPage}
          onChange={handlePageChange}
          pageSize={recordsPerPage}
        />
      </div>
    </WidgetCard>
  );
};

export default AllTickets;
