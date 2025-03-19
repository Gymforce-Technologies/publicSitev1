import { HeaderCell } from "@/app/shared/table";
import { Text, Avatar, Button, Popover, Tooltip } from "rizzui";
// import AvatarCard from "@ui/avatar-card";
// import { formatDate } from "@utils/format-date";
import Link from "next/link";
import { PhoneIcon } from "lucide-react";
// import { PiWhatsappLogoBold } from "react-icons/pi";
import getDueBadge from "@/components/dueBadge";
import cn from "@core/utils/class-names";
import DateCell from "@core/ui/date-cell";
import { FaEllipsisV } from "react-icons/fa";
import { RiLoopLeftLine } from "react-icons/ri";
import {
  MdCancel,
  MdMotionPhotosPaused,
  // MdOutlineArrowDropDown,
  MdOutlineChangeCircle,
  MdOutlineDateRange,
  MdPayments,
} from "react-icons/md";
import WaModal from "../wa-template/WaModal";
import toast from "react-hot-toast";
import { BiLayerPlus } from "react-icons/bi";
import { FaArrowRightLong, FaPlay } from "react-icons/fa6";
import { IoMdArrowDropupCircle } from "react-icons/io";
import {
  Membership,
  SortProps,
} from "@/components/membership/section/Memberships";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import Image from "next/image";
export type RenewalData = {
  cancellation_reason: string | null;
  cancelled: boolean | null;
  created_at: string;
  created_by: number;
  due: number;
  due_date: string | null;
  end_date: string;
  gym_id: string;
  gym_name: string;
  id: string;
  gender?: string;
  is_renewable: boolean | null;
  member_image: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  member_email: string;
  membership_id: string;
  offer_price: number;
  package_id: string;
  package_name: string;
  paid_amount: number;
  payment_mode_id: string;
  payment_mode_name: string;
  price: number | null;
  reference: string | null;
  start_date: string;
  title: string | null;
  training_type: string;
  user: number;
  validity: number;
  days_to_renewal?: number;
  freezed?: boolean;
};

type Columns = {
  data: RenewalData[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  demographicInfo: any;
  onDeleteItem: (member_id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (member_id: string) => void;
  handleAction: (
    action:
      | "Pay"
      | "Renew"
      | "Extend"
      | "Upgrade"
      | "Freeze"
      | "UnFreeze"
      | "Cancel"
      | "Addon"
      | "Transfer"
      | "addTrainer",
    membershipId: string
  ) => void;
  checkValidity: () => void;
  onHeaderSort: (headerKey: keyof Membership | null) => void;
  sort: SortProps;
  isStaff: boolean;
  access: any;
};
export const getExpColumns = ({
  handleSelectAll,
  data,
  checkedItems,
  onChecked,
  demographicInfo,
  handleAction,
  checkValidity,
  onHeaderSort,
  sort,
  isStaff,
  access,
}: Columns) => [
  {
    title: <HeaderCell title="ID" className="text-sm font-semibold pl-1" />,
    dataIndex: "localid",
    key: "localid",
    width: 30,
    render: (localid: number) => <Text className="sm:pl-1">#{localid}</Text>,
  },
  {
    title: <HeaderCell title=" Name" className=" text-sm font-semibold" />,
    dataIndex: "member_name",
    key: "member_name",
    width: 200,
    render: (_: any, row: any) => (
      <figure className={cn("flex items-center gap-3 ")}>
        <Image
          alt={row.member_name}
          src={
            row.member_image ||
            (row?.gender && row?.gender[0]?.toLowerCase() === "f"
              ? WomanIcon
              : ManIcon)
          }
          height={40}
          width={40}
          className="size-10 rounded-full"
        />
        <figcaption className="grid gap-0.5">
          <Link href={`/member_profile/yk62-${row.member_id}-71he`}>
            {/* yk$6372h$e */}
            <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Text className="text-nowrap text-clip">
                  {" "}
                  {row.member_name}
                </Text>
              </span>
            </Text>
          </Link>
          <Text className="text-[13px] ">{row.member_phone}</Text>
        </figcaption>
      </figure>
    ),
  },
  {
    title: <HeaderCell title="Membership" className="text-sm font-semibold" />,
    dataIndex: "package_name",
    key: "package_name",
    width: 150,
    render: (package_name: string) => (
      <Tooltip
        content={package_name ? package_name : "N/A"}
        placement="bottom"
        animation="slideIn"
      >
        <div>
          <Text className={`font-medium text-gray-700  max-w-40 truncate`}>
            {package_name ? package_name : "N/A"}
          </Text>
        </div>
      </Tooltip>
    ),
  },
  // {
  //   title: <HeaderCell title="Started on " className="text-sm font-semibold" />,
  //   dataIndex: "start_date",
  //   key: "start_date",
  //   width: 120,
  //   render: (date: string) =>
  //     date ? (
  //       <DateCell
  //         date={new Date(date)}
  //         dateFormat={getDateFormat()}
  //         timeClassName="hidden"
  //         dateClassName=""
  //       />
  //     ) : (
  //       <Text>N/A</Text>
  //     ),
  // },
  {
    // title: <HeaderCell title="Expiry" className="text-sm font-semibold" />,
    title: (
      <div
        onClick={() => {
          onHeaderSort("end_date");
        }}
      >
        <HeaderCell
          sortable
          ascending={
            sort.sortBy !== null &&
            sort.sortOrder !== null &&
            sort.sortBy === "end_date" &&
            sort.sortOrder === "desc"
          }
          className={
            (sort.sortBy === "end_date" ? "text-primary" : "") +
            " text-sm font-semibold "
          }
          title="Validity"
          iconClassName={
            (sort.sortBy === "end_date" ? "text-primary" : "") + " size-4"
          }
        />
      </div>
    ),
    dataIndex: "end_date",
    key: "end_date",
    width: 200,
    render: (date: string, row: RenewalData) => (
      <div className="flex items-center flex-nowrap">
        <DateCell
          date={new Date(row.start_date)}
          dateFormat={getDateFormat()}
          timeClassName="hidden"
          dateClassName="text-nowrap"
        />
        <FaArrowRightLong className="size-3 mx-2" />
        {date ? (
          <DateCell
            date={new Date(date)}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            dateClassName="text-nowrap"
          />
        ) : (
          <Text>N/A</Text>
        )}
      </div>
    ),
  },
  {
    // title: <HeaderCell title="Due" className="text-sm font-semibold" />,
    title: (
      <div
        onClick={() => {
          onHeaderSort("due");
        }}
      >
        <HeaderCell
          title="Due"
          sortable
          // className="text-sm font-semibold "
          ascending={
            sort.sortBy !== null &&
            sort.sortOrder !== null &&
            sort.sortBy === "due" &&
            sort.sortOrder === "desc"
          }
          className={
            (sort.sortBy === "due" ? "text-primary" : "") +
            " text-sm font-semibold "
          }
          // title="Started"
          iconClassName={
            (sort.sortBy === "due" ? "text-primary" : "") + " size-4"
          }
        />
      </div>
    ),
    dataIndex: "due",
    key: "due",
    width: 150,
    render: (due: number) => (
      <Text>
        {getDueBadge({
          dueAmount: due,
          symbol: demographicInfo?.currency_symbol || "",
        })}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Actions" className="opacity-0 " />,
    dataIndex: "action",
    key: "action",
    width: 100,
    render: (_: any, row: RenewalData) => (
      <div className="flex items-center justify-center gap-3">
        {row.member_name && row.member_phone ? (
          <div className="flex items-center justify-end gap-3 ">
            <Link href={`tel:${row.member_phone}`}>
              <PhoneIcon
                size={20}
                className="text-gray-700  hover:text-primary hover:scale-110 duration-150"
              />
            </Link>
            {/* <Link
              href={`https://wa.me/${row.member_phone}?text=Hi ${row.member_name}`}
              target="_blank"
            >
              <PiWhatsappLogoBold
                size={24}
                className="text-gray-700 dark:text-gray-400 hover:text-primary hover:scale-110 duration-150"
              />
            </Link> */}
            <WaModal id={row.member_id} number={row.member_phone} />
          </div>
        ) : null}
        <Popover placement="bottom">
          <Popover.Trigger>
            <Button variant="text" className="h-auto" onClick={checkValidity}>
              <FaEllipsisV className="text-gray-500" />
            </Button>
          </Popover.Trigger>
          <Popover.Content className="">
            <div className="flex flex-col justify-start m-[2]">
              {row.due > 0 && (
                <Button
                  variant="text"
                  onClick={() => {
                    if (isStaff && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("Pay", row.membership_id);
                  }}
                  className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdPayments size={20} />
                  <Text>Pay Dues</Text>
                </Button>
              )}
              {row.due > 0 && (
                <Button
                  variant="text"
                  onClick={() => {
                    if (isStaff && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("Extend", row.membership_id);
                  }}
                  className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdOutlineDateRange size={20} />
                  <Text>Extend Due Date</Text>
                </Button>
              )}
              <Button
                onClick={() => {
                  if (row.due) {
                    toast.error(
                      "Renewal can't proceed until the due payment is made"
                    );
                    return;
                  }
                  if (isStaff && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Renew", row.membership_id);
                }}
                variant="text"
                className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <RiLoopLeftLine size={20} />
                <Text>Renew</Text>
              </Button>
              {/* <Button
                onClick={() => {
                  if (row.due) {
                    toast.error(
                      "Upgrade can't proceed until the due payment is made"
                    );
                    return;
                  }
                  if (isStaff && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Upgrade", row.membership_id);
                }}
                variant="text"
                className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <IoMdArrowDropupCircle size={20} />
                <Text>Upgrade</Text>
              </Button> */}
              {/* {row.freezed ? (
                <Button
                  onClick={() => {
                    if (isStaff && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("UnFreeze", row.membership_id);
                  }}
                  variant="text"
                  className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <FaPlay size={18} />
                  <Text>Un Freeze</Text>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (isStaff && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("Freeze", row.membership_id);
                  }}
                  variant="text"
                  className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdMotionPhotosPaused size={20} />
                  <Text>Freeze</Text>
                </Button>
              )} */}
              <Button
                onClick={() => {
                  if (row.due) {
                    toast.error(
                      "Extend can't proceed until the due payment is made"
                    );
                    return;
                  } else if (row.freezed) {
                    toast.error("Extend can't proceed while It's Freezed.");
                    return;
                  }
                  if (isStaff && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Addon", row.membership_id);
                }}
                variant="text"
                className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <BiLayerPlus size={20} />
                <Text>Addon Days</Text>
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  if (isStaff && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Transfer", row.membership_id);
                }}
                className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <MdOutlineChangeCircle size={20} />
                <Text>Transfer</Text>
              </Button>
              <Button
                onClick={() => {
                  if (isStaff && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Cancel", row.membership_id);
                }}
                variant="text"
                className={`flex flex-row gap-2 hover:text-red-500 items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <MdCancel size={20} />
                <Text>Cancel</Text>
              </Button>
            </div>
          </Popover.Content>
        </Popover>
      </div>
    ),
  },
];
