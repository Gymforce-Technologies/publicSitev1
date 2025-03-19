"use client";
// import { IoMdCloudDownload } from "react-icons/io";
import { IoMdEye } from "react-icons/io";
import { HeaderCell } from "@/components/table";
import { Text, Checkbox, ActionIcon, Tooltip, Avatar, Badge } from "rizzui";
import Link from "next/link";
import cn from "@core/utils/class-names";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import InvoiceMail from "@/components/Invoice/InvoiceMail";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import Image from "next/image";

type Columns = {
  info: any;
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => { onClick: () => void };
  onChecked?: (id: string) => void;
  handleUpdate: (data: any) => void;
  auth: boolean;
};

export const getColumns = ({
  info,
  handleSelectAll,
  sortConfig,
  onDeleteItem,
  onHeaderCellClick,
  data,
  checkedItems,
  onChecked,
  handleUpdate,
  auth,
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
          {...(onChecked && { onChange: () => onChecked(row.id) })}
        />
      </div>
    ),
  },
  {
    title: <HeaderCell title="ID" className="text-sm font-semibold " />,
    dataIndex: "ind",
    key: "ind",
    width: 30,
    render: (ind: number) => <Text className="pl-1 md:pl-2">{ind}</Text>,
  },
  {
    title: <HeaderCell title="Name" className="text-sm font-semibold " />,
    dataIndex: "name",
    key: "name",
    width: 200,
    render: (_: string, row: any) => (
      <figure className={cn("flex items-center gap-3 ")}>
        {/* <Avatar
          name={row.member_details.name}
          src={
            row?.member_details?.member_image ||
            (row?.gender && row?.gender[0]?.toLowerCase() === "f"
              ? "https://images.gymforce.in/woman-user-circle-icon.png"
              : "https://images.gymforce.in/man-user-circle-icon.png")
          }
        /> */}
        <Image
          alt={row.member_details.name}
          src={
            row?.member_details?.member_image||
            (row?.gender && row?.gender[0]?.toLowerCase() === "f"
              ? WomanIcon
              : ManIcon)
          }
          height={40}
          width={40}
          className="size-10 rounded-full"
        />
        <figcaption className="grid gap-0.5">
          <Link href={`/member_profile/yk62-${row.member_details.id}-71he`}>
            {/*  */}
            <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Text className="font-lexend text-sm font-medium text-nowrap text-clip text-gray-900  hover:text-primary">
                  {" "}
                  {row.member_details.name}
                </Text>
              </span>
            </Text>
          </Link>
          <Text className="text-[13px]   text-gray-500">
            {row.member_details.phone}
          </Text>
        </figcaption>
      </figure>
    ),
  },
  {
    title: <HeaderCell title="Invoice ID" className=" text-sm font-semibold" />,
    dataIndex: "invoice_id",
    key: "invoice_id",
    width: 120,
    render: (invoice_id: string) => (
      <Text className="font-lexend text-sm font-medium text-gray-900 ">
        {invoice_id || "N/A"}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="TNX" className=" text-sm font-semibold" />,
    dataIndex: "payment_date",
    key: "payment_date",
    width: 150,
    render: (payment_date: string) => (
      <DateCell
        date={new Date(payment_date)}
        dateFormat={getDateFormat()}
        timeClassName="hidden"
      />
    ),
  },
  {
    title: (
      <HeaderCell
        title="MEMBERSHIP"
        className="text-sm font-semibold "
        ascending={
          sortConfig?.direction === "asc" && sortConfig?.key === "type"
        }
      />
    ),
    dataIndex: "package_name",
    key: "package_name",
    width: 180,
    render: (ticketsCount: number) => (
      <Text className="font-lexend text-sm font-medium text-gray-900 ">
        {ticketsCount}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="AMOUNT" className="text-sm font-semibold " />,
    dataIndex: "amount",
    key: "amount",
    // onHeaderCell: () => onHeaderCellClick('amount'),
    width: 120,
    render: (amount: number) => {
      return (
        <Text className="font-lexend text-sm font-medium text-gray-900  ">
          {info?.currency_symbol || ""} {new Intl.NumberFormat().format(amount)}
        </Text>
      );
    },
  },

  {
    title: <HeaderCell title="Actions" className="opacity-0" />,
    dataIndex: "action",
    key: "action",
    width: 180,
    render: (_: string, row: any) => (
      <div className="flex items-center justify-end gap-3 pe-3">
        <Tooltip content="Send Invoice" placement="top">
          <InvoiceMail membershipId={row.membership_id} isInvoiceList />
        </Tooltip>
        <Tooltip
          size="sm"
          content={"View Invoice"}
          placement="top"
          color="invert"
          // className="dark:bg-gray-800 "
          // arrowClassName="dark:text-gray-800"
        >
          <Link
            href={`/invoice/hy$39-${row.membership_id}-091$u/?member=?member=i9$rw-${row?.member_details.id}-7y$72&page=finance_list&is_due=${row.reference.includes("Dues")}`}
          >
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label={"View Invoice"}
              className=" hover:text-primary hover:cursor-pointer"
            >
              <IoMdEye className="h-4 w-4 " />
            </ActionIcon>
          </Link>
        </Tooltip>
      </div>
    ),
  },
];
