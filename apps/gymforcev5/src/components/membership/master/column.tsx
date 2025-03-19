import { Text, Checkbox, ActionIcon } from "rizzui";
import { HeaderCell } from "@/components/table";
// import { useRouter } from "next/navigation";
import {
  DemographicInfo,
  // getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { SortProps } from "./MasterMembership";
import EditModal from "./EditPack";
import DeletePop from "./DeletePack";
import toast from "react-hot-toast";
import PencilIcon from "@core/components/icons/pencil";
import TrashIcon from "@core/components/icons/trash";

type Membership = {
  id: string;
  gym_id: string;
  name: string;
  max_price: number;
  min_price: number;
  num_of_days: number;
  package_type: string;
  training_type: string;
  is_default?: boolean;
};

// Define types
type ColumnsProps = {
  data: any[];
  sortConfig?: { key: string; direction: string };
  handleSelectAll: () => void;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  demographiInfo: DemographicInfo;
  onUpdate: () => Promise<void>;
  handleHeaderSort: (headerKey: keyof any | null) => void;
  sort: SortProps;
  auth: boolean;
  access: boolean;
};

// getMembershipColumns function
export const getMembershipColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  onUpdate,
  demographiInfo,
  sort,
  handleHeaderSort,
  access,
  auth,
}: ColumnsProps) => [
  {
    title: (
      <div className="ps-2">
        <Checkbox
          title="Select All"
          onChange={handleSelectAll}
          checked={checkedItems.length === data.length}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: "checked",
    key: "checked",
    width: 30,
    render: (_: any, row: Membership) => (
      <div className="inline-flex ps-2">
        <Checkbox
          className="cursor-pointer"
          checked={checkedItems.includes(row.id)}
          {...(onChecked && { onChange: () => onChecked(row.id) })}
        />
      </div>
    ),
  },
  {
    title: <HeaderCell title="Name" className="text-sm font-semibold " />,
    onHeaderCell: () => onHeaderCellClick("name"),
    dataIndex: "name",
    key: "name",
    width: 200,
    render: (name: string) => (
      <Text className="text-[15px] font-medium text-gray-900 ">{name}</Text>
    ),
  },
  {
    // title: <HeaderCell title="MAX COST" className="text-sm font-semibold "/>,
    title: (
      <div
        onClick={() => {
          handleHeaderSort("max_price");
        }}
      >
        <HeaderCell
          title="MAX COST"
          sortable
          // className="text-sm font-semibold "
          ascending={
            sort.sortBy !== null &&
            sort.sortOrder !== null &&
            sort.sortBy === "max_price" &&
            sort.sortOrder === "desc"
          }
          className={
            (sort.sortBy === "max_price" ? "text-primary" : "") +
            " text-sm font-semibold "
          }
          // title="Started"
          iconClassName={
            (sort.sortBy === "max_price" ? "text-primary" : "") + " size-4"
          }
        />
      </div>
    ),
    dataIndex: "max_price",
    key: "max_price",
    width: 150,
    render: (max_price: number) => (
      <Text>{`${demographiInfo?.currency_symbol || "₹"}  ${new Intl.NumberFormat().format(max_price)}`}</Text>
    ),
    // `₹${max_price ? max_price.toFixed(2) : "0.00"}`,
  },
  // {
  //   title: <HeaderCell title="MIN COST" className="text-sm font-semibold " />,
  //   dataIndex: "min_price",
  //   key: "min_price",
  //   width: 100,
  //   render: (min_price: number) => (
  //     <Text>{`${demographiInfo?.currency_symbol || "₹"}  ${new Intl.NumberFormat().format(min_price)}`}</Text>
  //   ),
  //   // `₹${min_price ? min_price.toFixed(2) : "0.00"}`,
  // },
  {
    // title: (
    //   <HeaderCell
    //     title="Duration"
    //     sortable
    //     ascending={
    //       sortConfig?.direction === "asc" && sortConfig?.key === "num_of_days"
    //     }
    //   />
    // ),
    title: (
      <div
        onClick={() => {
          handleHeaderSort("num_of_days");
        }}
      >
        <HeaderCell
          title="Duration"
          sortable
          // className="text-sm font-semibold "
          ascending={
            sort.sortBy !== null &&
            sort.sortOrder !== null &&
            sort.sortBy === "num_of_days" &&
            sort.sortOrder === "desc"
          }
          className={
            (sort.sortBy === "num_of_days" ? "text-primary" : "") +
            " text-sm font-semibold "
          }
          // title="Started"
          iconClassName={
            (sort.sortBy === "num_of_days" ? "text-primary" : "") + " size-4"
          }
        />
      </div>
    ),
    onHeaderCell: () => onHeaderCellClick("num_of_days"),
    dataIndex: "num_of_days",
    key: "num_of_days",
    width: 120,
    render: (duration: number) => (
      <Text className="font-medium text-gray-900 ">{duration} days</Text>
    ),
  },
  // {
  //   title: <HeaderCell title="Plan" />,
  //   dataIndex: 'package_type',
  //   key: 'package_type',
  //   width: 150,
  //   render: (packageType: string) => packageType,
  // },
  {
    title: <HeaderCell title="Package" className="text-sm font-semibold " />,
    dataIndex: "package_type",
    key: "package_type",
    width: 200,
    render: (package_type: string) =>
      package_type ? package_type[0].toUpperCase() + package_type.slice(1) : "",
  },
  {
    // title: <HeaderCell title="Sessions" className="text-sm font-semibold " />,
    title: (
      <div
        onClick={() => {
          handleHeaderSort("sessions_allocated");
        }}
      >
        <HeaderCell
          title="Sessions"
          sortable
          // className="text-sm font-semibold "
          ascending={
            sort.sortBy !== null &&
            sort.sortOrder !== null &&
            sort.sortBy === "sessions_allocated" &&
            sort.sortOrder === "desc"
          }
          className={
            (sort.sortBy === "sessions_allocated" ? "text-primary" : "") +
            " text-sm font-semibold "
          }
          // title="Started"
          iconClassName={
            (sort.sortBy === "sessions_allocated" ? "text-primary" : "") +
            " size-4"
          }
        />
      </div>
    ),
    dataIndex: "sessions_allocated",
    key: "sessions_allocated",
    width: 100,
    render: (sessions_allocated: string) => sessions_allocated,
  },
  {
    title: <></>,
    dataIndex: "action",
    key: "action",
    width: 150,
    render: (_: any, row: Membership) => {
      return (
        <div
          className={`flex items-center justify-end gap-3 pe-4 ${row.is_default ? "opacity-0" : ""}`}
        >
          {!auth && !access ? (
            <ActionIcon
              size="sm"
              variant="text"
              onClick={() => {
                toast.error("You aren't allowed to make changes");
              }}
            >
              <PencilIcon className="h-4 w-4 hover:text-primary" />
            </ActionIcon>
          ) : (
            <EditModal pack={row} onUpdate={onUpdate} />
          )}
          {!auth && !access ? (
            <ActionIcon
              size="sm"
              variant="text"
              onClick={() => {
                toast.error("You aren't allowed to make changes");
              }}
            >
              <TrashIcon className="size-4" />
            </ActionIcon>
          ) : (
            <DeletePop id={row.id} onUpdate={onUpdate} />
          )}
        </div>
      );
    },
  },
];
