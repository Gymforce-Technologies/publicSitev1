"use client";
import { HeaderCell } from "@/components/table";
import { Text, Checkbox, Button } from "rizzui";
import toast from "react-hot-toast";
// import { redirect } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { EditIcon } from "lucide-react";
import { MdDelete } from "react-icons/md";
// import Categories from '../../members/config/categories/page';
import { categoryOptions } from "./model";
import { SortProps } from "./ExpenseTable";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";

type ExpenseData = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  description: string;
};

type Columns = {
  data: ExpenseData[]; // Array of expense data
  sortConfig: any; // Sorting configuration (adjust type as needed)
  handleSelectAll: () => void; // Function to select all items
  checkedItems: number[]; // List of checked items (by id)
  onDeleteItem: (id: string) => void; // Function to delete an item by id
  onHeaderCellClick: (value: string) => { onClick: () => void }; // Function to handle header cell click
  onChecked: (id: string) => void; // Function to handle item check
  handleUpdate: (data: any) => void; // Function to handle updates
  info: any; // Additional info, like currency symbols
  auth: boolean;
  isValid: boolean;
  router: AppRouterInstance;
  sort: SortProps;
  handleHeaderSort: (headerKey: keyof any | null) => void;
  access: boolean;
};

export const getColumns = ({
  handleSelectAll,
  sortConfig,
  onDeleteItem,
  onHeaderCellClick,
  data,
  checkedItems,
  onChecked,
  handleUpdate,
  info,
  auth,
  isValid,
  router,
  sort,
  handleHeaderSort,
  access,
}: Columns) => [
  {
    title: (
      <div className="ps-3.5">
        <Checkbox
          title={"Select All"}
          onChange={handleSelectAll}
          checked={checkedItems.length === data.length}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: "checked",
    key: "checked",
    width: 30,
    render: (_: any, row: any) => (
      <div className="inline-flex ps-3.5">
        <Checkbox
          aria-label={"ID"}
          className="cursor-pointer"
          checked={checkedItems.includes(row.id)}
          {...(onChecked && { onChange: () => onChecked(row.id as string) })}
        />
      </div>
    ),
  },
  {
    title: <HeaderCell title="S.No" className="text-sm font-semibold " />,
    dataIndex: "idVal",
    key: "idVal",
    width: 50,
    render: (idVal: number) => <Text className="pl-1">{idVal}</Text>,
  },
  {
    // title: <HeaderCell title="Date" className="text-sm font-semibold "/>,
    title: (
      <div
        onClick={() => {
          handleHeaderSort("expense_date");
        }}
      >
        <HeaderCell
          sortable
          ascending={
            sort.sortBy !== null &&
            sort.sortOrder !== null &&
            sort.sortBy === "expense_date" &&
            sort.sortOrder === "desc"
          }
          className={
            (sort.sortBy === "expense_date" ? "text-primary" : "") +
            " text-sm font-semibold "
          }
          title="Date"
          iconClassName={
            (sort.sortBy === "expense_date" ? "text-primary" : "") + " size-4"
          }
        />
      </div>
    ),
    // onHeaderCell: () => onHeaderCellClick('date'),
    dataIndex: "expense_date",
    key: "expense_date",
    width: 120,
    render: (date: string) => (
      <DateCell
        date={new Date(date)}
        dateFormat={getDateFormat()}
        timeClassName="hidden"
      />
    ),
  },
  {
    title: <HeaderCell title="Type" className="text-sm font-semibold " />,
    dataIndex: "category",
    key: "category",
    width: 100,
    render: (type: string) => (
      <div className="flex items-center gap-2">
        {categoryOptions.find((option: any) => option.value === type)?.icon}
        <Text className=" text-sm font-medium text-gray-700  ">
          {categoryOptions.find((option: any) => option.value === type)?.label}
        </Text>
      </div>
    ),
  },
  {
    title: (
      <div
        onClick={() => {
          handleHeaderSort("amount");
        }}
      >
        <HeaderCell
          title="Amount"
          sortable
          // className="text-sm font-semibold "
          ascending={
            sort.sortBy !== null &&
            sort.sortOrder !== null &&
            sort.sortBy === "amount" &&
            sort.sortOrder === "desc"
          }
          className={
            (sort.sortBy === "amount" ? "text-primary" : "") +
            " text-sm font-semibold "
          }
          // title="Started"
          iconClassName={
            (sort.sortBy === "amount" ? "text-primary" : "") + " size-4"
          }
        />
      </div>
    ),
    dataIndex: "amount",
    key: "amount",
    width: 120,
    render: (amount: number) => {
      return (
        <Text className=" text-sm font-medium text-gray-900  ">
          {info?.currency_symbol} {new Intl.NumberFormat().format(amount)}
        </Text>
      );
    },
  },
  {
    title: <HeaderCell title="Remarks" className="text-sm font-semibold " />,
    dataIndex: "description",
    key: "description",
    width: 150,
    render: (remark: string) => (
      <Text className=" text-sm font-medium text-gray-700  ">
        {remark ? remark : "---"}
      </Text>
    ),
  },
  {
    // Need to avoid this issue -> <td> elements in a large <table> do not have table headers.
    title: <HeaderCell title="Action" className="text-sm font-semibold " />,
    dataIndex: "action",
    key: "action",
    width: 100,
    render: (_: string, row: any) => (
      <div className="flex items-center  gap-4 pe-3">
        <Button
          variant="text"
          onClick={() => {
            if (!isValid) {
              toast.error("Please Subscribe to Proceed Further");
              if (auth) {
                router.push("/subscription/plans");
              }
              return;
            }
            if (!auth && !access) {
              toast.error("You aren't allowed to make changes");
              return;
            }
            handleUpdate(row);
          }}
          className={"hover:text-primary"}
        >
          <EditIcon className="size-5  hover:text-primary" />
        </Button>
        {/* <PencilIcon className="h-4 w-4" /> */}
        <Button
          variant="text"
          onClick={async () => {
            // if (!auth) {
            //   toast.error("You are not Authorized");
            //   return;
            // }
            if (!isValid) {
              toast.error("Please Subscribe to Proceed Further");
              router.push("/subscription/plans");
              return;
            }
            if (!auth && !access) {
              toast.error("You aren't allowed to make changes");
              return;
            }
            onDeleteItem(row.id);
          }}
        >
          <MdDelete className="size-5 " />
        </Button>
      </div>
    ),
  },
];
