"use client";

import { getColumns } from "./columns";
import WidgetCard from "@/components/cards/widget-card";
import { useCallback, useState, useMemo, useEffect } from "react";
import { useColumn } from "@core/hooks/use-column";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import MetricCard from "@core/components/cards/metric-card";

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

import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
// import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { getDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import Table from "@/components/rizzui/table/table";
import Pagination from "@core/ui/pagination";
import { isStaff } from "../../app/[locale]/auth/Staff";
import { FilterIcon, LucideCircleFadingPlus, XIcon } from "lucide-react";
import { filterOptions } from "../../app/[locale]/Filter";
// import { DatePicker } from "@ui/datepicker";
import dayjs from "dayjs";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import { useTable } from "@core/hooks/use-table";
import { checkUserAccess } from "../../app/[locale]/auth/Trail";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
// import { DeleteAllModal } from "@/components/DeleteAll";
import {
  FaBolt,
  FaBullhorn,
  FaMoneyBill,
  FaUserTie,
  FaWrench,
} from "react-icons/fa6";
import { FaBoxes, FaEllipsisH, FaHome, FaShieldAlt } from "react-icons/fa";
import Budget from "./Budget";
import { RiFileExcel2Fill } from "react-icons/ri";
import {
  formateDateValue,
  getDateFormat,
} from "../../app/[locale]/auth/DateFormat";
import { DatePicker } from "@core/ui/datepicker";

// import PopupForm from "./components/model";
const PopupForm = dynamic(() => import("./model"));
// import EditExpenseForm from "./components/EditModel";
const EditExpenseForm = dynamic(() => import("./EditModel"));
const DeleteAllModal = dynamic(() =>
  import("@/components/DeleteAll").then((mod) => mod.DeleteAllModal)
);
interface Filters {
  dateRange: string;
  memberName: string;
  startDate: string;
  endDate: string;
}

export interface SortProps {
  sortBy: keyof any | null;
  sortOrder: "asc" | "desc" | null;
}

interface CategoryOption {
  value: string;
  label: string;
  icon: JSX.Element;
}

interface ExpoFilters {
  dateRange: string;
  paymentMode: string;
  startDate: string;
  endDate: string;
  category: string;
}

export default function ExpenseTable() {
  // const { theme } = useTheme();
  const [auth, setAuth] = useState<boolean>(true);
  const [pageSize] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [editConform, setEditConform] = useState<any | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [gymId, setGymId] = useState<string | null>(null);
  const [expenseCount, setExpenseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [demographicInfo, setDemographicInfo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[0].value,
    memberName: "",
    startDate: "",
    endDate: "",
  });
  const params = useSearchParams();
  const pathname = usePathname();
  const [budgetData, setBudgetData] = useState<any | null>(null);
  const [sort, setSort] = useState<SortProps>({
    sortBy: null,
    sortOrder: null,
  });
  const categoryOptions: CategoryOption[] = [
    {
      value: "equipment",
      label: "Equipment",
      icon: (
        <svg
          fill="currentColor" // Default fill color
          height="512"
          viewBox="0 0 512 512"
          width="512"
          xmlns="http://www.w3.org/2000/svg"
          className="text-inherit size-5" // Apply your CSS classes here
        >
          <g>
            <path
              d="M86.0149 330.308L38.5989 282.892L94.5171 226.974L279.276 411.733L223.358 467.651L178.558 422.851M86.0149 330.308L35.0018 381.321L80.7828 427.102M86.0149 330.308L178.558 422.851M178.558 422.851L127.545 473.864L80.7828 427.102M46.4471 461.438L80.7828 427.102"
              fill="currentColor" // Use current color for filling
              stroke="currentColor" // Use current color for stroke
              strokeWidth="40"
            />
            <path
              d="M329.308 87.015L281.892 39.599L225.974 95.5171L318.353 187.897M329.308 87.015L380.321 36.0019L426.102 81.7829M329.308 87.015L421.851 179.558M421.851 179.558L466.651 224.358L410.733 280.276L318.353 187.897M421.851 179.558L472.864 128.545L426.102 81.7829M460.438 47.4471L426.102 81.7829M318.353 187.897L186.896 319.353"
              fill="currentColor" // Use current color for filling
              stroke="currentColor" // Use current color for stroke
              strokeWidth="40"
            />
          </g>
        </svg>
      ),
    },
    {
      value: "maintenance",
      label: "Maintenance",
      icon: <FaWrench className="text-inherit size-5" />,
    },
    {
      value: "utilities",
      label: "Utilities",
      icon: <FaBolt className="text-inherit size-5" />,
    },
    {
      value: "staff_salaries",
      label: "Staff Salaries",
      icon: <FaUserTie className="text-inherit size-5" />,
    },
    {
      value: "rent",
      label: "Rent",
      icon: <FaHome className="text-inherit size-5" />,
    },
    {
      value: "supplies",
      label: "Supplies",
      icon: <FaBoxes className="text-inherit size-5" />,
    },
    {
      value: "marketing",
      label: "Marketing",
      icon: <FaBullhorn className="text-inherit size-5" />,
    },
    {
      value: "insurance",
      label: "Insurance",
      icon: <FaShieldAlt className="text-inherit size-5" />,
    },
    {
      value: "other",
      label: "Other",
      icon: <FaEllipsisH className="text-inherit size-5" />,
    },
  ];
  const [categoryValue, setCategoryValue] = useState<CategoryOption | null>(
    null
  );
  const [access, setAccess] = useState<boolean>(true);
  const [topMetrics, setTopMetrics] = useState<any[]>([
    {
      title: "Total Expenses",
      value: 0,
      icon: <FaMoneyBill size={18} />, // You'll need to import this icon
      category: "total",
    },
  ]);
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const router = useRouter();
  const [deleteloading, setDeleteLoading] = useState(false);
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
    category: "",
  });

  const fetchDemographicInfo = useCallback(async () => {
    try {
      const geoinfo = await getDemographicInfo();
      setDemographicInfo(geoinfo);
    } catch (error) {
      console.error("Error fetching demographic info:", error);
    }
  }, []);

  const getStatus = useCallback(async () => {
    try {
      const resp = await isStaff();
      if (resp) {
        setAuth(!resp);
        await fetchPermissions();
      }
      checkUserAccess().then((status) => {
        console.log(status);
        if (status !== "Restricted") {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      });
    } catch (error) {
      console.error("Error getting staff status:", error);
    }
  }, []);
  const renderDisplayValue = (value: CategoryOption) => {
    if (!value) return null;
    return (
      <span className="flex items-center gap-2">
        {value.icon}
        <Text>{value.label}</Text>
      </span>
    );
  };

  const handleExportFilterChange = (
    key: keyof ExpoFilters,
    value: string | Date
  ) => {
    setExportFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const action = params.get("action");
    if (action && action.toLowerCase() === "create") {
      setIsOpen(true);
    }
  }, [params]);

  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["mainPaymentManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

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

  const renderOptionDisplayValue = (option: CategoryOption) => {
    return (
      <div className="flex items-center gap-3">
        {option.icon}
        <Text fontWeight="medium">{option.label}</Text>
      </div>
    );
  };
  const fetchExpenses = useCallback(
    async (filter: Filters, page: number = 1) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();

        if (filter.dateRange) {
          if (filter.dateRange !== "all") {
            queryParams.append("date_range", filter.dateRange);
          }
        }
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
        if (categoryValue) {
          queryParams.append("filter_by", categoryValue.value);
        }
        queryParams.append("page", page.toString());
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/list-expenses/v2/?gym_id=${gymId}&${queryParams}`,
          {
            id: newID(`expenses-${queryParams}-${currentPage}`),
          }
        );
        console.log(response);
        const transformedData = response.data.results.expenses.map(
          (exp: any, index: number) => {
            return { ...exp, idVal: index + 1 + (currentPage - 1) * 10 };
          }
        );
        const totalExpenses = response.data.results.total_expenses;

        // Transform categories into metrics format
        const categoryMetrics =
          response.data.results.top_expense_categories.map((item: any) => {
            // Find matching category option to get the icon
            const categoryOption = categoryOptions.find(
              (opt) => opt.value === item.category
            );

            return {
              title: categoryOption?.label || item.category,
              value: item.total_amount,
              icon: categoryOption?.icon || <FaEllipsisH size={18} />,
              category: item.category,
            };
          });
        setBudgetData({
          monthly_budget: response.data.results.monthly_budget,
          yearly_budget: response.data.results.yearly_budget,
          monthly_expenses: response.data.results.monthly_expenses,
          yearly_expenses: response.data.results.yearly_expenses,
        });
        // Combine total expenses with category metrics
        setTopMetrics([
          {
            title: "Total Expenses",
            value: totalExpenses,
            icon: <FaMoneyBill size={18} />,
            category: "total",
          },
          ...categoryMetrics,
        ]);
        console.log(transformedData);
        setExpenses(transformedData);
        setFilteredExpenses(transformedData);
        setExpenseCount(response.data.count);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        toast.error("Something went wrong while fetching expenses");
      } finally {
        setLoading(false);
      }
    },
    [categoryValue, filters]
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
        await fetchExpenses(newFilters);
      }
      await fetchExpenses(filters);
    };
    initializeAndFetch();
  }, [params, pathname]);
  useEffect(() => {
    const initializeAndFetch = async () => {
      fetchExpenses(filters);
    };
    initializeAndFetch();
  }, [pageSizeVal]);

  useEffect(() => {
    fetchExpenses(filters, currentPage);
  }, [categoryValue]);

  const handleHeaderSort = (headerKey: keyof any | null) => {
    setSort((prev) => ({
      sortBy: headerKey,
      sortOrder:
        prev.sortBy !== headerKey || prev.sortBy === null
          ? "asc"
          : prev.sortOrder === "asc"
            ? "desc"
            : "asc",
    }));
  };

  const SortData = (
    data: any[],
    sortBy: keyof any | null,
    sortOrder: "asc" | "desc" | null
  ) => {
    if (!sortBy || !sortOrder || !data?.length) return data;

    return [...data].sort((a, b) => {
      const valueA = sortBy ? (a[sortBy] ?? "") : "";
      const valueB = sortBy ? (b[sortBy] ?? "") : "";

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  useEffect(() => {
    // Sort data whenever sort state changes
    const sortedData = SortData(expenses, sort.sortBy, sort.sortOrder);
    setExpenses(sortedData);
    setFilteredExpenses(sortedData);
  }, [sort]);

  const handleSelectAll = () => {
    if (checkedItems.length === expenses.length) {
      setCheckedItems([]);
    } else {
      const idVals = expenses.map((exp: any) => {
        return exp.id;
      });
      setCheckedItems(idVals);
    }
  };
  useEffect(() => {
    fetchDemographicInfo();
    getStatus();
  }, [fetchDemographicInfo, getStatus]);

  const fetchGymId = useCallback(async () => {
    try {
      const gymid: string | null = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/expense-prerequisites?gym_id=${gymid}`,
        {
          id: newID("expense-prerequisites"),
        }
      );
      setPaymentModes(response.data.payment_modes);
      setGymId(gymid);
    } catch (error) {
      console.error("Error fetching gym ID:", error);
    }
  }, []);

  useEffect(() => {
    fetchGymId();
  }, [fetchGymId]);

  const handleDeleteItem = async (id: string | null) => {
    if (!id) return;
    try {
      setDeleteLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(
        `/api/delete-expense/${id}/?gym_id=${gymId}`
      ).then(() => {
        invalidateAll();
        toast.success("Expense Deleted Successfully");
        fetchExpenses(filters, currentPage);
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Something went wrong while deleting expense");
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  const onChecked = (id: string) => {
    if (!checkedItems.includes(parseInt(id))) {
      const val = [...checkedItems, parseInt(id)];
      setCheckedItems(val);
    } else {
      const val = checkedItems.filter((item) => item !== parseInt(id));
      setCheckedItems(val);
    }
  };

  const handleSearch = useCallback(
    (searchValue: string) => {
      setSearchTerm(searchValue);
      const filtered = expenses.filter(
        (expense: any) =>
          expense.description &&
          expense.description.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredExpenses(filtered);
    },
    [expenses]
  );

  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    setFilters((prev) => ({
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
      } else {
        // setFilterInfo(filters.dateRange);
      }
    }
    setCurrentPage(1);
    fetchExpenses(filters, 1);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if (filters.dateRange) {
      const { startDate, endDate, infoText } = getCurrentDateRange(
        filters.dateRange
      );
      setFilters((prev) => ({ ...prev, startDate, endDate }));
      setDateRangeInfo(infoText);
    } else {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      setDateRangeInfo("");
    }
  }, [filters.dateRange]);

  const {
    isLoading,
    isFiltered,
    tableData,
    totalItems,
    handlePaginate,
    updateFilter,
    sortConfig,
    handleSort,
    handleDelete,
    handleReset,
  } = useTable(expenses, pageSize);

  const onHeaderCellClick = (value: string) => {
    return {
      onClick: () => {
        handleSort(value);
      },
    };
  };

  const columns = useMemo(
    () =>
      getColumns({
        data: expenses, // Pass your expenses data
        sortConfig,
        handleSelectAll: handleSelectAll,
        checkedItems: checkedItems,
        onDeleteItem: (id: string) => setDeleteConfirm(id),
        onHeaderCellClick,
        onChecked: onChecked,
        handleUpdate: (data: any) => setEditConform(data),
        info: demographicInfo,
        auth: auth,
        isValid: isValid,
        router: router,
        sort: sort,
        handleHeaderSort: handleHeaderSort,
        access: access,
      }),
    [
      expenses, // These are the dependencies that will trigger recalculation of columns
      sortConfig,
      onHeaderCellClick,
      handleSelectAll,
      demographicInfo,
      checkedItems,
      onChecked,
      sort,
      access,
      auth,
    ]
  );

  const { visibleColumns } = useColumn(columns);

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
      if (exportfilters.category)
        queryParams.append("category", exportfilters.category);

      const resp = await AxiosPrivate.get(
        `/api/exports-expenses/?gym_id=${id}&${queryParams}`,
        {
          responseType: "blob", // Important for file downloads
        }
      );

      // Create a link element to trigger the download
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;

      // Generate a filename based on current date and filters
      const filename = `Expenses_${exportfilters.startDate}-${exportfilters.endDate}.xlsx`;
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

  return (
    <section className="grid grid-cols-1 gap-5">
      <div className="grid md:grid-cols-[40%,60%] gap-4 md:gap-8">
        <div
          className={`grid gap-4 sm:gap-y-0 grid-cols-2 ${topMetrics.length > 2 ? "items-center" : "items-start"}`}
        >
          {topMetrics.map((metric, index) => (
            <div
              key={index}
              onClick={() => {
                if (metric.category !== "total") {
                  setCategoryValue(
                    categoryOptions.find(
                      (opt) => opt.value === metric.category
                    ) || null
                  );
                }
              }}
              className="group relative"
            >
              {metric.category !== "total" &&
                categoryValue?.value === metric.category && (
                  <XIcon
                    size={18}
                    className="absolute peer top-2 right-2 z-[999] text-primary cursor-pointer hover:scale-110 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation(); // Add this to prevent the parent click from firing
                      setCategoryValue(null);
                    }}
                  />
                )}
              <MetricCard
                title={metric.title}
                // metric={new Intl.NumberFormat().format(metric.value)}
                metric={metric.value}
                className={`!p-4 shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50  ${
                  metric.category !== "total"
                    ? "hover:bg-gray-100 hover:scale-105 peer-hover:bg-gray-100 peer-hover:scale-105"
                    : ""
                } ${metric.category !== "total" ? "cursor-pointer" : ""}`}
                iconClassName={`text-primary bg-gray-100 max-lg:size-[32px] duration-200 transition-all ${
                  metric.category === categoryValue?.value &&
                  metric.category !== "total"
                    ? "text-white bg-primary"
                    : metric.category !== "total"
                      ? "group-hover:text-white group-hover:bg-primary peer-hover:text-white peer-hover:bg-primary"
                      : ""
                }`}
                titleClassName={`text-nowrap max-lg:text-xs font-medium max-lg:max-w-[110px] truncate ${
                  metric.category === categoryValue?.value &&
                  metric.category !== "total"
                    ? "text-primary"
                    : metric.category !== "total"
                      ? "group-hover:text-primary"
                      : ""
                }`}
                icon={metric.icon}
                metricClassName="text-primary max-lg:text-base text-center "
              />
            </div>
          ))}
        </div>
        <Budget
          data={budgetData}
          refresh={() => {
            setCurrentPage(1);
            fetchExpenses(filters, 1);
          }}
          auth={auth}
          access={access}
        />
      </div>
      <WidgetCard
        headerClassName="mb-6 items-start flex-col @[57rem]:flex-row @[57rem]:items-center "
        actionClassName="w-full ps-0 items-center"
        title="Expenses"
        className=" border-gray-400 "
        titleClassName="text-gray-900"
        action={
          <div className="flex mt-2 flex-col sm:flex-row items-center gap-4 justify-end w-full  md:mt-2 lg:mt-0">
            <div className="w-full flex gap-2 sm:w-auto order-1 sm:order-none">
              <Input
                type="search"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                clearable
                onClear={() => handleSearch("")}
                prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
              />
              <Select
                options={categoryOptions}
                value={categoryValue}
                onChange={(value: any) => {
                  setCategoryValue(value as CategoryOption);
                }}
                displayValue={(value) =>
                  renderDisplayValue(value as CategoryOption)
                }
                getOptionDisplayValue={(option) =>
                  renderOptionDisplayValue(option as CategoryOption)
                }
                clearable
                onClear={() => setCategoryValue(null)}
                placeholder="Select Category"
                // labelClassName="dark:text-gray-200"
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                className="max-w-48"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
            </div>
            <div className="flex w-full sm:w-auto gap-2 order-2 sm:order-none">
              <Button
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  setIsOpen(true);
                }}
                className="flex items-center gap-2"
              >
                Add
                <LucideCircleFadingPlus className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2"
              >
                Filters <FilterIcon className="h-4 w-4" />
              </Button>
              <Popover placement="bottom-start">
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
                        label="Payment "
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
                    <div className="grid grid-cols-1 gap-0.5">
                      <Select
                        label="Catgeory "
                        name="category"
                        options={categoryOptions.map((mode) => ({
                          label: mode?.label,
                          value: mode?.label,
                        }))}
                        value={exportfilters.category}
                        // @ts-ignore
                        onChange={(option: Option | null) =>
                          setExportFilters((prev) => ({
                            ...prev,
                            category: option?.label || "",
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
                            ? dayjs(exportfilters.startDate).toDate()
                            : null
                        }
                        onChange={(date: any) =>
                          handleExportFilterChange(
                            "startDate",
                            formateDateValue(date, "YYYY-MM-DD")
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
                        value={
                          exportfilters.endDate
                            ? formateDateValue(new Date(exportfilters.endDate))
                            : ""
                        }
                        onChange={(date: any) =>
                          handleExportFilterChange(
                            "endDate",
                            formateDateValue(date, "YYYY-MM-DD")
                          )
                        }
                        minDate={
                          exportfilters.startDate
                            ? dayjs(exportfilters.startDate).toDate()
                            : undefined
                        }
                        dateFormat={getDateFormat()}
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
          <div className="w-full flex justify-center">
            <Loader variant="spinner" size="xl" />
          </div>
        ) : (
          <>
            <Table
              data={filteredExpenses}
              columns={visibleColumns}
              // loading={loading}
              //@ts-ignore
              variant="none"
              scroll={{ y: 500 }}
              className=" mt-4 md:mt-6 text-nowrap rounded-sm [&_.rc-table-row:hover]:bg-gray-100 [&_.rc-table-thead_tr]:bg-gray-100"
            />
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
                // labelClassName="dark:text-gray-200"
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              ></Select>
              <Pagination
                total={expenseCount}
                current={currentPage}
                pageSize={pageSizeVal ?? 0}
                onChange={(page) => {
                  setCurrentPage(page);
                  fetchExpenses(filters, page);
                }}
              />
            </div>
          </>
        )}
        <div className="!fixed !z-[999] bottom-5 right-5 sm:bottom-10 sm:right-10 ">
          {checkedItems.length > 0 && (
            <DeleteAllModal
              ids={checkedItems}
              type="Expense"
              onUpdate={() => {
                fetchExpenses(filters, currentPage);
              }}
            />
          )}
        </div>

        <Modal
          isOpen={deleteConfirm !== null}
          onClose={() => setDeleteConfirm(null)}
        >
          <div className="p-6 ">
            <Title as="h3" className="">
              Are you sure you want to delete this expense?
            </Title>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={() => setDeleteConfirm(null)} variant="outline">
                No
              </Button>
              <Button onClick={() => handleDeleteItem(deleteConfirm)}>
                {deleteloading ? <Loader variant="threeDot" /> : "Yes"}
              </Button>
            </div>
          </div>
        </Modal>

        <EditExpenseForm
          isOpen={editConform !== null}
          onClose={() => setEditConform(null)}
          expense={editConform}
          gymId={gymId}
          paymentModes={paymentModes}
          handleUpdate={() => {
            fetchExpenses(filters, currentPage);
          }}
        />

        <PopupForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          gymId={gymId}
          paymentModes={paymentModes}
          handleUpdate={() => {
            setCurrentPage(1);
            fetchExpenses(filters, 1);
          }}
        />

        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          size="sm"
        >
          <div className="flex flex-col h-full bg-inherit ">
            <div className="p-5 flex-grow">
              <div className="flex items-center justify-between mb-5 ">
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
                  }}
                  value={
                    filterOptions.find(
                      (item) => item.value === filters.dateRange
                    )?.label
                  }
                  className=""
                  // labelClassName="dark:text-gray-200"
                  // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                />
                {dateRangeInfo && (
                  <Announcement
                    badgeText={dateRangeInfo}
                    className="dark:bg-inherit"
                  />
                )}
                {/* <div className="flex flex-col gap-2">
                <Text>Start Date:</Text>
                <DatePicker
                  placeholderText="Start Date"
                  disabled={["", "daily", "yesterday"].includes(filters.dateRange)}
                  selected={filters.startDate ? dayjs(filters.startDate).toDate() : null}
                  onChange={(date: any) => handleFilterChange("startDate", date)}
                  dateFormat="yyyy-MM-dd"
                />
              </div> */}
                {/* <div className="flex flex-col gap-2">
                <Text>End Date:</Text>
                <DatePicker
                  placeholderText="End Date"
                  disabled={!filters.startDate || ["", "daily", "yesterday"].includes(filters.dateRange)}
                  selected={filters.endDate ? dayjs(filters.endDate).toDate() : null}
                  onChange={(date: any) => handleFilterChange("endDate", date)}
                  dateFormat="yyyy-MM-dd"
                  minDate={filters.startDate ? dayjs(filters.startDate).toDate() : undefined}
                />
            </div> */}
              </div>
            </div>
            <div className="p-5 mt-auto">
              <Button className="w-full" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Drawer>
      </WidgetCard>
    </section>
  );
}
