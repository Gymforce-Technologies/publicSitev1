"use client";

import Link from "next/link";
// import { type Membership } from './data'; // Invoice type already defined earlier
import {
  Text,
  Avatar,
  Badge,
  Button,
  Popover,
  Tooltip,
  ActionIcon,
} from "rizzui";
import { HeaderCell } from "@/components/table"; // Assuming these components exist
import {
  Membership,
  SortProps,
} from "@/components/membership/section/Memberships";
// import AvatarCard from "@ui/avatar-card";
// import { LucideCheckCircle } from "lucide-react";
import getDueBadge from "../dueBadge";
import cn from "@core/utils/class-names";
import DateCell from "@core/ui/date-cell";
import { FaEllipsisV } from "react-icons/fa";
import { RiExchange2Line, RiLoopLeftLine } from "react-icons/ri";
import {
  MdCancel,
  MdMotionPhotosPaused,
  MdOutlineChangeCircle,
  MdOutlineDateRange,
  MdPayments,
} from "react-icons/md";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import { PhoneIcon } from "lucide-react";
import toast from "react-hot-toast";
import { IoMdArrowDropupCircle, IoMdEye } from "react-icons/io";
import { FaArrowRightLong, FaPlay } from "react-icons/fa6";
import { BiLayerPlus } from "react-icons/bi";
import InvoiceMail from "../Invoice/InvoiceMail";
import WaModal from "../wa-template/WaModal";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { PiUserCirclePlusFill } from "react-icons/pi";
// import SelectMemberSeat from "../member-list/members/SelectMemberSeat";
import { TbChairDirector } from "react-icons/tb";
import Image from "next/image";
// import { FcCancel } from "react-icons/fc";
interface BadgeProps {
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | undefined;
  text: string;
  variant?: "flat" | "outline" | "solid" | undefined;
  isAnimated?: boolean;
  isExpiring?: boolean;
}

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: () => void;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  demographicInfo: any;
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
      | "addTrainer"
      | "Seat",
    membershipId: string
  ) => void;
  checkValidity: () => void;
  onHeaderSort: (headerKey: keyof Membership | null) => void;
  sort: SortProps;
  isStaff: boolean;
  access: any;
  //   centerType?: number;
};

export const getLibColumns = ({
  // data,
  sortConfig,
  // checkedItems,
  onHeaderCellClick,
  // handleSelectAll,
  handleAction,
  demographicInfo,
  checkValidity,
  onHeaderSort,
  sort,
  isStaff,
  access,
  //   centerType,
}: Columns) => {
  return [
    {
      title: <HeaderCell title="ID" className="text-sm font-semibold pl-1" />,
      dataIndex: "localid",
      key: "localid",
      width: 30,
      render: (localid: number) => <Text className="sm:pl-1">#{localid}</Text>,
    },
    {
      title: (
        <div
          onClick={() => {
            onHeaderSort("member_name");
          }}
        >
          <HeaderCell
            className={
              (sort.sortBy === "member_name" ? "text-primary" : "") +
              " text-sm font-semibold pl-2"
            }
            title="Name"
            sortable
            ascending={
              sort.sortBy !== null &&
              sort.sortOrder !== null &&
              sort.sortBy === "member_name" &&
              sort.sortOrder === "desc"
            }
            iconClassName={
              (sort.sortBy === "member_name" ? "text-primary" : "") + " size-4"
            }
          />
        </div>
      ),
      dataIndex: "member_name",
      key: "member_name",
      width: 180,
      render: (member_name: string, row: any) => (
        <figure className={cn("flex items-center gap-3 ")}>
          {/* <Avatar
            name={member_name}
            src={
              row.member_image ||
              (row?.gender && row?.gender[0]?.toLowerCase() === "f"
                ? "https://images.gymforce.in/woman-user-circle-icon.png"
                : "https://images.gymforce.in/man-user-circle-icon.png")
            }
          /> */}
          <Image
            alt={member_name}
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
            {/* yk$6372h$e */}
            <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Link href={`/member_profile/yk62-${row.member_id}-71he`}>
                  <Text className="text-nowrap text-clip">{member_name}</Text>
                </Link>

                {(() => {
                  // Helper function to create badge
                  const renderBadge = ({
                    color,
                    text,
                    variant = "flat",
                    isAnimated = false,
                    isExpiring = false,
                  }: BadgeProps) => (
                    <Badge
                      size="sm"
                      color={color}
                      variant={variant}
                      className={isAnimated ? "animate-pulse" : ""}
                    >
                      {text}
                      {isExpiring && (
                        <span className="hidden md:block md:ml-1">soon</span>
                      )}
                    </Badge>
                  );

                  if (row.status === "cancelled" && row.cancelled) {
                    return (
                      <Tooltip
                        animation="slideIn"
                        arrowClassName="text-white dark:text-gray-800"
                        className="text-gray-900 bg-white dark:bg-gray-800 dark:border-gray-700 "
                        content={
                          <div className="flex flex-col items-start justify-center gap-2 p-2 my-2">
                            <div className="flex flex-row w-full items-center flex-nowrap gap-2">
                              <Text className="font-semibold">
                                Membership Status :
                              </Text>
                              <div className="flex flex-row gap-1 items-center">
                                <Badge renderAsDot color="danger" />
                                <Text className="text-red-500 font-medium">
                                  Cancelled
                                </Text>
                              </div>
                            </div>
                            <div className="flex flex-col w-full items-start flex-nowrap gap-1">
                              <Text className="text-nowrap font-semibold">
                                Reason :
                              </Text>
                              <Text className="pl-4 max-w-40">{`"${row.cancellation_reason}"`}</Text>
                            </div>
                          </div>
                        }
                      >
                        <div>
                          {renderBadge({
                            color: "danger",
                            text: "Cancelled",
                            variant: "flat",
                            isAnimated: true,
                          })}
                        </div>
                      </Tooltip>
                    );
                  }

                  if (row.is_transferred) {
                    // return renderBadge("info", "Transferred", "flat", true);
                    return renderBadge({
                      color: "info",
                      text: "Transferred",
                      variant: "flat",
                      // isAnimated: true,
                    });
                  }

                  if (row.is_upgraded) {
                    // return renderBadge("success", "Upgraded", "flat", true);
                    return renderBadge({
                      color: "success",
                      text: "Upgraded",
                      variant: "flat",
                      // isAnimated: true,
                    });
                  }

                  const currentDate = new Date();
                  const endDate = new Date(row.end_date);
                  const startDate = new Date(row.start_date);
                  const oneWeekInMs = 604800000;

                  if (endDate < currentDate) {
                    if (
                      row.reference === "New Membership" &&
                      !row.is_renewable &&
                      row.renewal_count
                    ) {
                      // return renderBadge("info", "Renewed", "outline");
                      return renderBadge({
                        color: "info",
                        text: "Renewed",
                        variant: "outline",
                        // isAnimated: true,
                      });
                    }
                    // return renderBadge("danger", "Expired", "outline");
                    return renderBadge({
                      color: "danger",
                      text: "Expired",
                      variant: "outline",
                      // isAnimated: true,
                    });
                  }

                  if (
                    endDate.getTime() - currentDate.getTime() <=
                    oneWeekInMs
                  ) {
                    // return renderBadge("warning", "Expiring", "outline", true);
                    return renderBadge({
                      color: "warning",
                      text: "Expiring",
                      variant: "outline",
                      // isAnimated: true,
                    });
                  }

                  if (startDate.getTime() > currentDate.getTime()) {
                    // return renderBadge("secondary", "Upcomming", "outline");
                    return renderBadge({
                      color: "secondary",
                      text: "Upcomming",
                      variant: "outline",
                      // isAnimated: true,
                    });
                  }

                  // return renderBadge("success", "Active", "outline");
                  return renderBadge({
                    color: "success",
                    text: "Active",
                    variant: "outline",
                    // isAnimated: true,
                  });
                })()}
              </span>
            </Text>
            <Text className="text-[13px] dark:text-gray-400">
              {row.member_phone}
            </Text>
          </figcaption>
        </figure>
      ),
    },
    {
      title: (
        <HeaderCell className="text-sm font-semibold" title="Membership" />
      ),
      dataIndex: "package_name",
      key: "package_name",
      width: 120,
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
    //   title: <HeaderCell className="text-sm font-semibold" title="Sessions" />,
    //   dataIndex: "sessions",
    //   key: "sessions",
    //   width: 80,
    //   render: (sessions: string) => <Text className="pl-1">{sessions}</Text>,
    // },
    {
      title: <HeaderCell className="text-sm font-semibold" title="Seat" />,
      dataIndex: "sessions",
      key: "sessions",
      width: 80,
      render: (sessions: string, row: Membership) => (
        <Text className="pl-1 font-medium">{row.seat}</Text>
      ),
    },
    {
      title: (
        <div
          onClick={() => {
            onHeaderSort("start_date");
          }}
        >
          <HeaderCell
            sortable
            ascending={
              sort.sortBy !== null &&
              sort.sortOrder !== null &&
              sort.sortBy === "start_date" &&
              sort.sortOrder === "desc"
            }
            className={
              (sort.sortBy === "start_date" ? "text-primary" : "") +
              " text-sm font-semibold "
            }
            title="Validity"
            iconClassName={
              (sort.sortBy === "start_date" ? "text-primary" : "") + " size-4"
            }
          />
        </div>
      ),
      dataIndex: "start_date",
      key: "start_date",
      width: 150,
      render: (date: string, row: Membership) => (
        <div className="flex items-center flex-nowrap">
          <DateCell
            date={new Date(date)}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            dateClassName="text-nowrap"
          />
          <FaArrowRightLong className="size-3 mx-2" />{" "}
          <DateCell
            date={new Date(row.end_date)}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            dateClassName="text-nowrap"
          />
        </div>
      ),
    },
    {
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
              " text-sm font-semibold pl-2 "
            }
            // title="Started"
            iconClassName={
              (sort.sortBy === "due" ? "text-primary" : "") + " size-4"
            }
          />
        </div>
      ),
      onHeaderCell: () => onHeaderCellClick("due"),
      dataIndex: "due",
      key: "due",
      width: 100,
      render: (due: number) => (
        <Text className="pl-4">
          {getDueBadge({
            dueAmount: due,
            symbol: demographicInfo?.currency_symbol || "",
          })}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Actions" className="opacity-0" />,
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (_: any, row: Membership) => (
        <div className="flex items-center justify-center gap-1">
          {row.member_name && row.member_phone ? (
            <div className="flex items-center justify-end gap-1">
              <Link href={`tel:${row.member_phone}`}>
                <PhoneIcon
                  size={20}
                  className="text-gray-700  hover:text-primary hover:scale-110 duration-150"
                />
              </Link>
              <WaModal id={row.member_id} number={row.member_phone} />
            </div>
          ) : null}
          <InvoiceMail membershipId={row.membership_id} isInvoiceList={true} />
          <Tooltip
            size="sm"
            content={"View Invoice"}
            placement="top"
            color="invert"
            // className="dark:bg-gray-800 "
            // arrowClassName="dark:text-gray-800"
          >
            <Link
              href={`/invoice/hy$39-${row.membership_id}-091$u/?member=?member=i9$rw-${row?.member_id}-7y$72&page=membership/list`}
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
          <Popover placement="bottom">
            <Popover.Trigger>
              <Button variant="text" className="h-auto" onClick={checkValidity}>
                <FaEllipsisV className="text-gray-500" />
              </Button>
            </Popover.Trigger>
            <Popover.Content className=" ">
              <div className="flex flex-col justify-start m-[2]">
                {row.trainer === null && (
                  <Button
                    variant="text"
                    onClick={() => {
                      if (isStaff && !access) {
                        toast.error("You aren't allowed to make changes");
                        return;
                      }
                      handleAction("addTrainer", row.membership_id);
                    }}
                    className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                  >
                    <PiUserCirclePlusFill size={20} />
                    <Text>Assign Trainer</Text>
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
                    onClick={() => handleAction("Extend", row.membership_id)}
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
                    } else if (!row.is_renewable) {
                      toast.error("Renewal can't proceed for this membership");
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
                <Button
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
                </Button>
                {row.freezed ? (
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
                    {/* FaPlay */}
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
                    {/* FaPlay */}
                    <Text>Freeze</Text>
                  </Button>
                )}
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
                  onClick={() => {
                    if (isStaff && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("Transfer", row.membership_id);
                  }}
                  variant="text"
                  className={`flex flex-row gap-2 hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdOutlineChangeCircle size={20} />
                  <Text>Transfer</Text>
                </Button>
                {row.batch_timing && row.seat ? (
                  <>
                    <Button
                      onClick={() => {
                        // if (isStaff && !access) {
                        //   toast.error("You aren't allowed to make changes");
                        //   return;
                        // }
                        handleAction("Seat", row.membership_id);
                      }}
                      variant="text"
                      className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <RiExchange2Line size={20} />
                      <Text>Change Seat</Text>
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      // if (isStaff && !access) {
                      //   toast.error("You aren't allowed to make changes");
                      //   return;
                      // }
                      handleAction("Seat", row.membership_id);
                    }}
                    variant="text"
                    className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                  >
                    <TbChairDirector size={20} />
                    <Text> Allot Seat</Text>
                  </Button>
                )}
                {!row.cancelled && (
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
                )}
              </div>
            </Popover.Content>
          </Popover>
        </div>
      ),
    },
  ];
};
