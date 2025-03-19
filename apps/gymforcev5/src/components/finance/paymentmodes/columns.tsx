"use client";
// import { IoMdCloudDownload } from "react-icons/io";

import { HeaderCell } from "@/components/table";
import {
  Text,
  Checkbox,
  // ActionIcon,
  Tooltip,
  Button,
  Switch,
  Badge,
} from "rizzui";
// import cn from "@/utils/class-names";
// import AvatarCard from '@/components/ui/avatar-card';
// import DeletePopover from "@/app/shared/delete-popover";
// import DateCell from '@/components/ui/date-cell';
import PencilIcon from "@core/components/icons/pencil";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
// import MasterCardIcon from '@/components/icons/mastercard';
// import VisaIcon from '@/components/icons/visa';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  handleDelete: (row: any) => void;
  handleUpdate: (row: any) => void;
  // staffType: string;
  handleFavoriteUpdate: (
    templateId: number,
    status: boolean,
    name: string
  ) => Promise<void>;
  auth: boolean;
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
  handleDelete,
  handleUpdate,
  handleFavoriteUpdate,
  auth,
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
    width: 50,
    render: (_: any, row: any) => (
      <div className="inline-flex ps-3.5">
        <Checkbox
          aria-label={"ID"}
          className="cursor-pointer"
          checked={checkedItems.includes(row.id)}
          {...(onChecked && { onChange: () => onChecked(row.id) })}
        />
      </div>
    ),
  },
  // {
  //   title: <HeaderCell title="icon" />,
  //   onHeaderCell: () => onHeaderCellClick('id'),
  //   dataIndex: 'id',
  //   key: 'id',
  //   width: 100,
  //   render: (id: string) => <Text>#{id}</Text>,
  // },s
  {
    title: <HeaderCell title="Mode" className="text-sm font-semibold" />,
    dataIndex: "name",
    key: "name",
    width: 200,
    render: (payment: string, row: any) => (
      <div className="flex items-start gap-2">
        <Text className="text-sm font-medium text-clip  ">{payment}</Text>
        <Badge
          size="sm"
          variant="outline"
          className={"scale-90 " + (row.is_default ? "" : "hidden")}
        >
          Default
        </Badge>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Enabled" className="text-sm font-semibold" />,
    dataIndex: "id",
    key: "id",
    width: 150,
    render: (id: number, row: any) => (
      <Tooltip content=" Status" placement="right-start">
        <div>
          <Switch
            checked={row?.is_favorite}
            onChange={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              handleFavoriteUpdate(id, row?.is_favorite, row.name);
            }}
            // onChange={()=>{console.log(row.is_favorite)}}
            size="sm"
            className={row.is_default ? "hidden" : "ps-2"}
          />
        </div>
      </Tooltip>
    ),
  },
  {
    // Need to avoid this issue -> <td> elements in a large <table> do not have table headers.
    title: <HeaderCell title="Actions" className="opacity-0" />,
    dataIndex: "action",
    key: "action",
    width: 150,
    render: (_: string, row: any) => (
      <div
        className={`flex items-center justify-end gap-3 pe-3 ${row.is_default ? "hidden" : ""}`}
      >
        <Button
          variant="text"
          onClick={() => {
            if (!auth && !access) {
              toast.error("You aren't allowed to make changes");
              return;
            }
            handleUpdate(row);
          }}
          disabled={row.is_default}
        >
          <PencilIcon className="size-4 " />
        </Button>
        <Button
          variant="text"
          onClick={() => {
            if (!auth && !access) {
              toast.error("You aren't allowed to make changes");
              return;
            }
            onDeleteItem(row);
          }}
          disabled={row.is_default}
        >
          <Trash2 className="size-4 " />
        </Button>
      </div>
    ),
  },
];

// function PaymentMethodCell({
//   cardType,
//   lastCardNo,
// }: {
//   cardType: string;
//   lastCardNo: string;
// }) {
//   return (
//     <span className="flex gap-3">
//       {/* {cardType === 'Mastercard' ? (
//         <MasterCardIcon className="h-auto w-6" />
//       ) : (
//         <VisaIcon className="h-auto w-6" />
//       )} */}
//       <Text className="font-semibold text-gray-900">***{lastCardNo}</Text>
//     </span>
//   );
// }
