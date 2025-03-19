'use client'
import React, { useCallback, useEffect, useState } from "react";
import Table from "@/components/rizzui/table/table";
import HeaderCell from "@/components/rizzui/table/HeaderCell";
import { Input } from "rizzui";
import { DatePicker } from "@core/ui/datepicker";
import Pagination from "@core/ui/pagination";
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";

type SmsSchema = {
  slNo: number;
  id: string;
  phone_number: string;
  sms_type: string;
  message: string;
  date: string;
  status: string;
};

const getColumns = () => [
  {
    title: <HeaderCell title="Sl No" />,
    dataIndex: "slNo",
    key: "slNo",
    width: 70,
  },
  {
    title: <HeaderCell title="Phone Number" />,
    dataIndex: "phone_number",
    key: "phone_number",
    width: 150,
  },
  {
    title: <HeaderCell title="Message" />,
    dataIndex: "message",
    key: "message",
    width: 300,
  },
  {
    title: <HeaderCell title="Type" />,
    dataIndex: "sms_type",
    key: "sms_type",
    width: 300,
  },
  {
    title: <HeaderCell title="Status" />,
    dataIndex: "status",
    key: "status",
    width: 150,
  },
  {
    title: <HeaderCell title="Date" />,
    dataIndex: "date",
    key: "date",
    width: 200,
  },
];

const SmsTable = ({ setTotalSmsCount }: { setTotalSmsCount: any }) => {
  const [order, setOrder] = useState<string>("desc");
  const [column, setColumn] = useState<keyof SmsSchema>("id");
  const [smsData, setSmsData] = useState<SmsSchema[]>([]);
  const [startRangeDate, setStartRangeDate] = useState<Date | null>(null);
  const [endRangeDate, setEndRangeDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSms, setTotalSms] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Number of records per page
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartRangeDate(start);
    setEndRangeDate(end);
  };

  const fetchSmsData = useCallback(async () => {
    try {
      const response = await AxiosPrivate('/api/sms-history');
      const data = response.data.data.smsJobs.map((item: any, index: number) => ({
        slNo: index + 1,
        id: item.id,
        phone_number: item.phone_number,
        sms_type: item.sms_type,
        message: item.message,
        status: item.status,
        date: item.created_at.split('T')[0], // Format date as needed
      }));
      setSmsData(data);
      setTotalSmsCount(response.data.data.totalRecordCount);
      setTotalSms(response.data.data.totalRecordCount); // Update totalSms for pagination
    } catch (error) {
      console.error("Error fetching SMS data", error);
    }
  }, []);

  useEffect(() => {
    fetchSmsData();
  }, [fetchSmsData]);

  // Filter and paginate data
  const filteredData = React.useMemo(() => {
    const filtered = smsData.filter((item) => 
      item.phone_number.includes(searchQuery) ||
      item.message.includes(searchQuery) ||
      item.sms_type.includes(searchQuery)
    );

    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    // Update SL No based on the current page
    return paginated.map((item, index) => ({
      ...item,
      slNo: startIndex + index + 1,
    }));
  }, [smsData, searchQuery, currentPage, pageSize]);

  const columns = React.useMemo(() => getColumns(), [order, column]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-3">
        <div className="w-3/6">
          <DatePicker
            selected={startRangeDate}
            onChange={handleRangeChange}
            startDate={startRangeDate??undefined}
            endDate={endRangeDate??undefined}
            monthsShown={2}
            placeholderText="Select Date in a Range"
            selectsRange
            inputProps={{
              clearable: true,
              onClear: () => {
                setStartRangeDate(null);
                setEndRangeDate(null);
              },
            }}
          />
        </div>
        <div className="flex items-center gap-1 justify-between">
          <div className="flex items-center">
            <p>Show</p>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
            <p>entries</p>
          </div>
          <div className="flex gap-1 items-center">
            <p>Search:</p>
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search"/>
          </div>
        </div>
        <div className="mt-3 w-[100%] flex flex-col gap-2">
          <Table data={filteredData} columns={columns} className="text-sm" />
          <div className="flex justify-end mt-4">
            <Pagination
              total={Math.ceil(totalSms / pageSize)} // Total pages
              current={currentPage}
              onChange={handlePageChange}
              outline={false}
              rounded="md"
              variant="solid"
              color="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsTable;
