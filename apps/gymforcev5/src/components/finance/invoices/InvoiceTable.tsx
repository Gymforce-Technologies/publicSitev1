"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import WidgetCard from "@/components/cards/widget-card";
import { useTable } from "@core/hooks/use-table";;
import {
  Announcement,
  Button,
  Drawer,
  Input,
  Loader,
  Modal,
  Popover,
  Select,
  Text,
  Title,
} from "rizzui";
import UpdateModel from "./UpdateModel";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiMagnifyingGlassBold,
} from "react-icons/pi";
// import { getAccessToken } from "@/app/[locale]/auth/Acces";
// import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { getDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import Table from "@/components/rizzui/table/table";
import Pagination from "@core/ui/pagination";
import toast from "react-hot-toast";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { FilterIcon, XIcon } from "lucide-react";
import { filterOptions } from "../../../app/[locale]/Filter";
// import { DatePicker } from "@ui/datepicker";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import dayjs from "dayjs";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import MetricCard from "@core/components/cards/metric-card";
import { FaUserCheck, FaUserClock, FaUserPlus, FaUsers } from "react-icons/fa6";
import { DatePicker } from "@core/ui/datepicker";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import { getColumns } from "@/components/finance/transactions/columns";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { RiFileExcel2Fill } from "react-icons/ri";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { usePathname, useSearchParams } from "next/navigation";

const filterState = {
  date: [null, null],
  status: "",
};
// type AllInvoiceTableProps = {
//   className?: string;
// };
interface Filters {
  dateRange: string;
  memberName: string;
  startDate: string;
  endDate: string;
}

interface ExpoFilters {
  dateRange: string;
  paymentMode: string;
  startDate: string;
  endDate: string;
}

export default function AllInvoiceTable() {
  const [auth, setAuth] = useState<boolean>(true);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [updateData, SetUpdateData] = useState<any | null>(null);
  const [transactions, setTransactions] = useState([]);
  // const [page, setpage] = useState(1);
  const [loading, setLoading] = useState(true);
  // const [totalData, setTotalData] = useState(0);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [demographiInfo, setDemographicInfo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModel, setDeleteModel] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [totalItemsInv, setTotalItemsInv] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[0].value,
    memberName: "",
    startDate: "",
    endDate: "",
  });
  const params = useSearchParams();
  const pathname = usePathname();
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const [transactionInfo, setTransactionInfo] = useState([
    {
      title: "Fresh Payments",
      value: 0,
      icon: <FaUserClock size={18} />,
      req: "fresh_amount",
      reference_type: "fresh",
    },
    {
      title: "Renewals Payment",
      value: 0,
      icon: <FaUserCheck size={18} />,
      req: "renew_amount",
      reference_type: "renew",
    },
    {
      title: "Dues Payment",
      value: 0,
      icon: <FaUserPlus size={18} />,
      req: "dues_amount",
      reference_type: "dues",
    },
    {
      title: "Total Amount",
      value: 0,
      icon: <FaUsers size={18} />,
      req: "total_amount",
      reference_type: "all",
    },
  ]);
  const [selectedReferenceType, setSelectedReferenceType] = useState(
    transactionInfo[0].reference_type
  );

  const [dateRangeInfo2, setDateRangeInfo2] = useState("");

  const exportFilter = [
    { label: "Month", value: "monthly" },
    { label: "Year", value: "yearly" },
  ];
  const [exportLoading, setExportLoading] = useState(false);
  const [exportfilters, setExportFilters] = useState<ExpoFilters>({
    paymentMode: "",
    startDate: "",
    endDate: "",
    dateRange: exportFilter[0].value,
  });

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  useEffect(() => {
    const FetchDemograpicInfo = async () => {
      try {
        const geoinfo = await getDemographicInfo();
        setDemographicInfo(geoinfo);
        console.log("info", geoinfo);
      } catch (error) {
        console.log(error);
      }
    };
    FetchDemograpicInfo();
  }, []);

  const onDeleteItem = useCallback((id: string) => {
    handleDelete(id);
  }, []);

  const {
    isLoading,
    isFiltered,
    tableData,
    totalItems,
    updateFilter,
    sortConfig,
    handleSort,
    selectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleDelete,
  } = useTable(transactions, pageSizeVal ?? 0, filterState);

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(
        `/api/delete-transaction/${id}/?gym_id=${gymId}`
      ).then(() => invalidateAll());
      toast.success("Delete Successfullly");
      fetchTransactions(filters, selectedReferenceType);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Something went wrong while deleting the transaction"
      );
      console.error("Error deleting the transaction:", error);
    } finally {
      setDeleteModel(false);
      setSelectedInvoice(null);
    }
  }, []);

  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        const gymid: string | null = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/expense-prerequisites?gym_id=${gymid}`,
          {
            id: newID("expense-prerequisites"),
          }
        );
        setPaymentModes(response.data.payment_modes);
      } catch (error) {
        console.log(error);
      }
    };
    const getStatus = async () => {
      const resp = await isStaff();
      setAuth(!resp);
    };
    getStatus();
    fetchPaymentModes();
  }, []);
  const fetchTransactions = useCallback(
    async (filter: Filters, packageType: string, page: number = 1) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();

        // if (filter.dateRange){
        //     queryParams.append("date_range", filter.dateRange);
        //   }
        // }
        // if (filter.memberName)
        //   queryParams.append("member_name", filter.memberName);
        // queryParams.append("invoice_id", filter.memberName);
        if (filter.memberName) {
          // const containsNumbers = /\d/.test(filter.memberName);
          // const paramName = containsNumbers ? "invoice_id" : "member_name";
          queryParams.append("search", filter.memberName);
        }
        if (filter.startDate)
          queryParams.append("start_date", filter.startDate);
        if (filter.endDate) queryParams.append("end_date", filter.endDate);
        // if (filter.endDate) queryParams.append("end_date", new Date(new Date(filter.endDate).getTime()+ 86400000).toISOString().split("T")[0]);
        if (packageType && packageType !== "all")
          queryParams.append("reference_type", packageType);
        if (pageSizeVal) {
          if (pageSizeVal !== 10) {
            queryParams.append("page_size", pageSizeVal.toString());
          }
        } else {
          const PageVal = getPageSize();
          if (PageVal !== "10") {
            queryParams.append("page_size", PageVal.toString());
          }
          setPageSizeVal(parseInt(PageVal));
        }
        queryParams.append("page", page.toString());

        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/list-transactions/v2/?gym_id=${gymId}&${queryParams}`,
          {
            id: newID(`transaction-${queryParams}-${page}`),
          }
        );
        // console.log(response.data);
        const ProcessedData = response.data.results.transactions.map(
          (invoice: any, index: number) => {
            return { ...invoice, ind: index + 1 + (page - 1) * 10 };
          }
        );
        setTransactions(ProcessedData);
        setFilteredTransactions(ProcessedData);
        // if (packageType === "all") {
        setTransactionInfo((prevState) =>
          prevState.map((item) => {
            let newValue = 0;
            switch (item.req) {
              case "total_amount":
                newValue = response.data?.results.total_amount || 0;
                break;
              case "dues_amount":
                newValue =
                  response.data?.results?.amounts_by_reference_type
                    ?.dues_amount || 0;
                break;
              case "fresh_amount":
                newValue =
                  response.data?.results?.amounts_by_reference_type
                    ?.fresh_amount || 0;
                break;
              case "renew_amount":
                newValue =
                  response.data?.results?.amounts_by_reference_type
                    ?.renew_amount || 0;
                break;
            }
            return { ...item, value: newValue };
          })
        );
        // }
        setTotalItemsInv(response.data?.count);
      } catch (error) {
        console.error("Error fetching the transactions:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const initializeAndFetch = async () => {
      if (params.get("filter")) {
        const filter = params.get("filter");
        const { startDate, endDate, infoText } = getCurrentDateRange(filter!);

        const newFilters = {
          dateRange: filter!,
          memberName: "",
          startDate: startDate,
          endDate: endDate,
        };

        setFilters((prev) => ({
          ...newFilters,
        }));

        setDateRangeInfo(infoText);
        await fetchTransactions(newFilters, selectedReferenceType);
      } else {
        fetchTransactions(filters, selectedReferenceType);
      }
    };
    initializeAndFetch();
  }, [pathname, params]);
  const handlePackageType = (value: string) => {
    //   setSelectedReferenceType(metric.reference_type);
    //   fetchTransactions(filters, 1);
    if (value === "all") {
      return;
    }
    setSelectedReferenceType((prevPackageType) => {
      const newPackageType =
        prevPackageType.toLowerCase() === value.toLowerCase()
          ? ""
          : value.toLowerCase();
      fetchTransactions(filters, newPackageType, 1);
      return newPackageType;
    });
  };

  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value,
    }));
  };

  const handleExportFilterChange = (
    key: keyof ExpoFilters,
    value: string | Date
  ) => {
    setExportFilters((prev) => ({
      ...prev,
      [key]: value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value,
    }));
  };

  const applyFilters = () => {
    if (filters.dateRange && filters.startDate && filters.endDate) {
      if (
        !validateDateRange(
          filters.dateRange,
          filters.startDate,
          filters.endDate
        )
      ) {
        toast.error(
          `Invalid date range for ${filters.dateRange} filter. Please adjust your dates.`
        );
        return;
      }
    }
    setCurrentPage(1);
    fetchTransactions(filters, selectedReferenceType, 1);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if (filters.dateRange) {
      const { startDate, endDate, infoText } = getCurrentDateRange(
        filters.dateRange
      );
      setFilters((prev) => ({ ...prev, startDate, endDate }));
      setDateRangeInfo(infoText);
      // setFilterInfo(filters.dateRange);
    } else {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      setDateRangeInfo("");
    }
  }, [filters.dateRange]);

  useEffect(() => {
    if (exportfilters.dateRange) {
      const now = dayjs();
      if (exportfilters.dateRange === "yearly") {
        const startDate = now.startOf("year").format("YYYY-MM-DD");
        const endDate = now.endOf("year").format("YYYY-MM-DD");
        const Infotext =
          dayjs(startDate).format("MMM DD") +
          " -" +
          dayjs(endDate).format("MMM DD");
        setExportFilters((prev) => ({ ...prev, startDate, endDate }));
        setDateRangeInfo2(Infotext);
      } else {
        const startDate = now.startOf("month").format("YYYY-MM-DD");
        const endDate = now.endOf("month").format("YYYY-MM-DD");
        const Infotext =
          dayjs(startDate).format("MMM DD") +
          " -" +
          dayjs(endDate).format("MMM DD");
        setExportFilters((prev) => ({ ...prev, startDate, endDate }));
        setDateRangeInfo2(Infotext);
      }
    } else {
      setExportFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      setDateRangeInfo2("");
    }
  }, [exportfilters.dateRange]);

  const handleTransactionupdate = () => {
    fetchTransactions(filters, selectedReferenceType, currentPage);
  };
  const columns = useMemo(
    () =>
      getColumns({
        data: transactions,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem: (id: string) => {
          setSelectedInvoice(id);
          setDeleteModel(true);
        },
        onChecked: handleRowSelect,
        handleSelectAll,
        handleUpdate: (data: any) => {
          SetUpdateData(data);
        },
        info: demographiInfo,
        auth: auth,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      tableData,
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
    ]
  );
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    fetchTransactions(filters, selectedReferenceType, page);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchTransactions(filters, selectedReferenceType, 1);
  }, [pageSizeVal]);

  const handleSearch = useCallback(
    (searchValue: string) => {
      setSearchTerm(searchValue);
      if (searchValue) {
        const newFilter = { ...filters, memberName: searchValue };
        setFilters(newFilter);
        fetchTransactions(newFilter, selectedReferenceType, 1);
        setCurrentPage(1);
      }
    },
    [searchTerm, filters]
  );

  const getExportData = async () => {
    try {
      setExportLoading(true);
      const id = await retrieveGymId();
      const queryParams = new URLSearchParams();
      if (exportfilters.startDate)
        queryParams.append("start_date", exportfilters.startDate);
      if (exportfilters.endDate)
        queryParams.append("end_date", exportfilters.endDate);
      if (exportfilters.paymentMode)
        queryParams.append("payment_mode", exportfilters.paymentMode);

      const resp = await AxiosPrivate.get(
        `/api/exports-transactions/?gym_id=${id}&${queryParams}`,
        {
          responseType: "blob", // Important for file downloads
        }
      );

      // Create a link element to trigger the download
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;

      // Generate a filename based on current date and filters
      const filename = `Invoices_${exportfilters.startDate}-${exportfilters.endDate}.xlsx`;
      link.setAttribute("download", filename);

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
      toast.error("Failed to export transactions");
    } finally {
      setExportLoading(false);
    }
  };

  // const { visibleColumns } = useColumn(columns);
  return (
    <section className="grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
      <div className="relative flex w-full items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>
        <div
          className="max-xl:flex items-center p-2 gap-4 xl:grid grid-cols-5 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
          ref={sliderEl}
        >
          {transactionInfo.map((metric, index) => (
            <div
              key={index}
              // onClick={() => {
              //   setSelectedReferenceType(metric.reference_type);
              //   fetchTransactions(filters, 1);
              // }}
              // onClick={() => handlePackageType(metric.value) : undefined}}
              onClick={() => handlePackageType(metric.reference_type)}
              className="group"
            >
              <MetricCard
                title={metric.title}
                metric={
                  (demographiInfo?.currency_symbol || "") +
                  " " +
                  new Intl.NumberFormat().format(metric.value)
                }
                className={`shadow min-w-48 border-none dark:border-solid transform transition-transform duration-200  ease-in-out delay-50 !p-2 md:!p-4 ${
                  selectedReferenceType === metric.reference_type
                    ? "bg-primary-lighter"
                    : ""
                } ${metric.reference_type !== "all" ? "hover:scale-105 hover:bg-primary-lighter" : ""}`}
                iconClassName={`text-primary bg-primary-lighter duration-200  max-lg:size-[36px] transition-all ${
                  selectedReferenceType === metric.reference_type &&
                  metric.reference_type !== "all"
                    ? "text-white bg-primary"
                    : "group-hover:text-white group-hover:bg-primary"
                }`}
                titleClassName={`text-nowrap font-medium  max-lg:text-xs  max-lg:max-w-[110px] truncate ${
                  selectedReferenceType === metric.reference_type &&
                  metric.reference_type !== "all"
                    ? "text-primary"
                    : "group-hover:text-primary"
                }`}
                icon={metric.icon}
                metricClassName="text-primary text-center max-lg:text-base text-nowrap"
              />
            </div>
          ))}
        </div>
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>
      <WidgetCard
        title="All Invoices"
        titleClassName="whitespace-nowrap "
        headerClassName="mb-6 items-start flex-col @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="w-full ps-0 items-center"
        className="dark:bg-inherit"
        action={
          <div className=" flex max-sm:flex-col w-full sm:items-center justify-end  gap-3 ">
            <Input
              className="col-span-full"
              type="search"
              inputClassName="h-9 max-sm:mt-4"
              placeholder="Search For Invoice Details..."
              value={searchTerm}
              onClear={() => handleSearch("")}
              onChange={(event) => handleSearch(event.target.value)}
              clearable
              prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            />
            <div className="flex flex-row gap-3 items-center">
              <Button
                onClick={() => setIsDrawerOpen(true)}
                className="flex-1 sm:flex-none"
              >
                Filters <FilterIcon className="ml-2" />
              </Button>
              <Popover>
                <Popover.Trigger>
                  <Button className="flex items-center gap-2">
                    Export
                    <RiFileExcel2Fill className="h-4 w-4" />
                  </Button>
                </Popover.Trigger>
                <Popover.Content>
                  <div className="p-4 min-w-[300px] space-y-3 grid">
                    <Select
                      label="Range"
                      options={exportFilter}
                      onChange={(option: any) => {
                        handleExportFilterChange("dateRange", option.value);
                        // if (option.value === "all") {
                        //   setFilterInfo("all");
                        // }
                      }}
                      value={
                        exportFilter.find(
                          (item) => item.value === exportfilters.dateRange
                        )?.label
                      }
                      // labelClassName=""
                      // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                      // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                    />
                    {dateRangeInfo2 && (
                      <Announcement
                        badgeText={dateRangeInfo2}
                        className="dark:bg-inherit "
                      />
                    )}
                    <div className="grid grid-cols-1 gap-0.5">
                      <Select
                        label="Payment Mode "
                        name="payment_mode_id"
                        options={paymentModes.map((mode) => ({
                          label: mode?.name,
                          value: mode?.name,
                        }))}
                        value={exportfilters.paymentMode}
                        // @ts-ignore
                        onChange={(option: Option | null) =>
                          setExportFilters((prev) => ({
                            ...prev,
                            paymentMode: option?.label || "",
                          }))
                        }
                        labelClassName=""
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Text>Start Date:</Text>
                      <DatePicker
                        placeholderText="Start Date"
                        disabled={["", "daily", "yesterday"].includes(
                          exportfilters.dateRange
                        )}
                        selected={
                          exportfilters.startDate
                            ? new Date(exportfilters.startDate)
                            : null
                        }
                        onChange={(date: any) =>
                          handleExportFilterChange(
                            "startDate",
                            formateDateValue(
                              new Date(date.getTime()),
                              "YYYY-MM-DD"
                            )
                          )
                        }
                        value={
                          exportfilters.startDate
                            ? formateDateValue(
                                new Date(exportfilters.startDate)
                              )
                            : ""
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Text>End Date:</Text>
                      <DatePicker
                        placeholderText="End Date"
                        disabled={
                          !exportfilters.startDate ||
                          ["", "daily", "yesterday"].includes(
                            exportfilters.dateRange
                          )
                        }
                        selected={
                          exportfilters.endDate
                            ? dayjs(exportfilters.endDate).toDate()
                            : null
                        }
                        // onChange={(date: any) => handleFilterChange("endDate", date)}
                        // dateFormat="yyyy-MM-dd"
                        // selected={filters.endDate || null}
                        onChange={(date: any) =>
                          handleExportFilterChange(
                            "endDate",
                            formateDateValue(
                              new Date(date.getTime()),
                              "YYYY-MM-DD"
                            )
                          )
                        }
                        value={
                          exportfilters.endDate
                            ? formateDateValue(new Date(exportfilters.endDate))
                            : ""
                        }
                        minDate={
                          exportfilters.startDate
                            ? dayjs(exportfilters.startDate).toDate()
                            : undefined
                        }
                      />
                    </div>
                    <Button onClick={getExportData}>
                      {exportLoading ? (
                        <Loader variant="spinner" size="sm" />
                      ) : (
                        "Export"
                      )}
                    </Button>
                  </div>
                </Popover.Content>
              </Popover>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="w-full flex justify-center my-6">
            <Loader variant="spinner" size="xl" />
          </div>
        ) : (
          <>
            <Table
              //@ts-ignore
              variant="none"
              data={filteredTransactions}
              //@ts-ignore
              columns={columns}
              scroll={{ y: 500 }}
              className=" mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100/75  [&_.rc-table-thead_tr]:bg-gray-100 text-nowrap "
            />
          </>
        )}
        <div className="flex justify-between mt-4">
          <Select
            value={pageSizeVal}
            // size="sm"
            options={pageSizeOptions}
            placeholder="Items per page"
            className={"w-auto "}
            onChange={(option: any) => {
              setPageSizeVal(option.value);
              setPageSize(option.value);
            }}
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          ></Select>{" "}
          <Pagination
            total={totalItemsInv}
            current={currentPage}
            onChange={handlePageChange}
            outline={false}
            rounded="md"
            variant="solid"
            color="primary"
            pageSize={pageSizeVal ?? 0}
          />
        </div>
        {updateData !== null && (
          <UpdateModel
            setUpdateData={SetUpdateData}
            updateData={updateData}
            handleUpdate={handleTransactionupdate}
            AllPaymentModes={paymentModes}
          />
        )}
      </WidgetCard>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        size="sm"
      >
        <div className="flex flex-col h-full">
          <div className="p-5 flex-grow">
            <div className="flex items-center justify-between mb-5">
              <Title as="h3" className="text-gray-900 ">
                Filters
              </Title>
              <XIcon
                className="h-6 w-6 cursor-pointer text-gray-900 "
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
            <div className="space-y-4">
              <Select
                label="Range"
                options={filterOptions}
                onChange={(option: any) => {
                  handleFilterChange("dateRange", option.value);
                  // if (option.value === "all") {
                  //   setFilterInfo("all");
                  // }
                }}
                value={
                  filterOptions.find((item) => item.value === filters.dateRange)
                    ?.label
                }
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
              {dateRangeInfo && (
                <Announcement
                  badgeText={dateRangeInfo}
                  className="dark:bg-inherit"
                />
              )}
              <div className="flex flex-col gap-2">
                <Text>Start Date:</Text>
                <DatePicker
                  placeholderText="Start Date"
                  disabled={["", "daily", "yesterday"].includes(
                    filters.dateRange
                  )}
                  selected={
                    filters.startDate ? new Date(filters.startDate) : null
                  }
                  onChange={(date: any) =>
                    handleFilterChange(
                      "startDate",
                      formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                    )
                  }
                  value={
                    filters.startDate
                      ? formateDateValue(new Date(filters.startDate))
                      : ""
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Text>End Date:</Text>
                <DatePicker
                  placeholderText="End Date"
                  disabled={
                    !filters.startDate ||
                    ["", "daily", "yesterday"].includes(filters.dateRange)
                  }
                  selected={
                    filters.endDate ? dayjs(filters.endDate).toDate() : null
                  }
                  // onChange={(date: any) => handleFilterChange("endDate", date)}
                  // dateFormat="yyyy-MM-dd"
                  // selected={filters.endDate || null}
                  onChange={(date: any) =>
                    handleFilterChange(
                      "endDate",
                      formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                    )
                  }
                  value={
                    filters.endDate
                      ? formateDateValue(new Date(filters.endDate))
                      : ""
                  }
                  minDate={
                    filters.startDate
                      ? dayjs(filters.startDate).toDate()
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
          <div className="p-5 mt-auto">
            <Button className="w-full" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
      <Modal
        isOpen={deleteModel}
        onClose={() => {
          setDeleteModel(false);
          setSelectedInvoice(null);
        }}
      >
        <div className=" p-6 rounded-lg shadow-lg  w-full">
          <h2 className="text-2xl mb-4">Delete Confirmation</h2>
          <p className="mb-4">Are you sure you want to delete this Invoice?</p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setDeleteModel(false);
                setSelectedInvoice(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleDeleteItem(selectedInvoice);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
