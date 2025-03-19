import React, { Dispatch, SetStateAction } from "react";
import { HeaderCell } from "../table";
import {
  Badge,
  Text,
  Tooltip,
  ActionIcon,
  Button,
  Avatar,
  Popover,
  Checkbox,
} from "rizzui";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
// import { PiWhatsappLogoBold, PiWhatsappLogoDuotone } from "react-icons/pi";
import cn from "@core/utils/class-names";
// import { formatDate } from "@core/utils/format-date";
import { FaPhoneAlt } from "react-icons/fa";
import {
  MdCancel,
  MdEdit,
  MdOutlineChangeCircle,
  MdOutlineDateRange,
  MdPayments,
} from "react-icons/md";
import { RiFileAddFill, RiLoopLeftLine } from "react-icons/ri";
import getDueBadge from "../dueBadge";
import DateCell from "@core/ui/date-cell";
import toast from "react-hot-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Member, SortProps } from "@/components/member-list/MemberListSection";
import { IoMdArrowDropupCircle } from "react-icons/io";
import { BiLayerPlus } from "react-icons/bi";

import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import dynamic from "next/dynamic";
import { FaUserPlus } from "react-icons/fa6";
import Image from "next/image";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
const WaModal = dynamic(() => import("../wa-template/WaModal"));
const DeleteModal = dynamic(() =>
  import("./Modals").then((com) => com.DeleteModal)
);
const RestoreModal = dynamic(() =>
  import("./Modals").then((com) => com.RestoreModal)
);
const AddMemberFollowup = dynamic(
  () => import("./MemberFollowUp").then((com) => com.AddMemberFollowup),
  {
    ssr: false,
  }
);

type Columns = {
  sortConfig?: any;
  onHeaderCellClick: (value: string) => void;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
  demographiInfo: any;
  func:
    | "Edit"
    | "Pay"
    | "Renew"
    | "Restore"
    | "Extend"
    | "Upgrade"
    | "Freeze"
    | "UnFreeze"
    | "Cancel"
    | "Addon"
    | "Transfer"
    | null;
  setFunc: Dispatch<
    SetStateAction<
      | "Edit"
      | "Pay"
      | "Renew"
      | "Restore"
      | "Extend"
      | "Upgrade"
      | "Freeze"
      | "UnFreeze"
      | "Cancel"
      | "Addon"
      | "Transfer"
      | null
    >
  >;
  pageNumber: number;
  fetchMemberData: (pageNumber: number) => Promise<void>;
  setSelectedRow: Dispatch<SetStateAction<any>>;
  restore: boolean;
  isValid: boolean;
  router: AppRouterInstance;
  checkedItems: number[];
  handleSelectAll: () => void;
  onChecked: (id: string) => void;
  totalItems: number;
  auth: boolean;
  onHeaderSort: (headerKey: keyof Member | null) => void;
  sort: SortProps;
  access: boolean;
  isStaf: boolean;
  setAddMembership: React.Dispatch<React.SetStateAction<boolean>>;
};

export const getColumns = ({
  sortConfig,
  onHeaderCellClick,
  openPopoverId,
  setOpenPopoverId,
  demographiInfo,
  setFunc,
  fetchMemberData,
  pageNumber,
  setSelectedRow,
  restore,
  isValid,
  router,
  checkedItems,
  handleSelectAll,
  onChecked,
  totalItems,
  auth,
  sort,
  access,
  onHeaderSort,
  isStaf,
  setAddMembership,
}: Columns) => {
  return [
    {
      title: (
        <Checkbox
          title={"Select All"}
          onChange={handleSelectAll}
          checked={checkedItems.length === totalItems}
          className="cursor-pointer"
        />
      ),
      dataIndex: "member_id",
      key: "member_id",
      width: 30,
      render: (member_id: string) => (
        <div className="inline-flex cursor-pointer">
          <Checkbox
            aria-label={"ID"}
            className="cursor-pointer"
            checked={checkedItems.includes(parseInt(member_id))}
            {...(onChecked && { onChange: () => onChecked(member_id) })}
          />
        </div>
      ),
    },
    {
      title: <HeaderCell title="ID" className=" text-sm font-semibold ml-2" />,
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (value: number) => (
        // <Tooltip content="Expand View">
        <Text className="font-semibold ml-2"># {value}</Text>
        // </Tooltip>
      ),
    },
    {
      // title: <HeaderCell title="Name" className=" text-sm font-semibold" />,
      title: (
        <div
          onClick={() => {
            onHeaderSort("name");
          }}
        >
          <HeaderCell
            className={
              (sort.sortBy === "name" ? "text-primary" : "") +
              " text-sm font-semibold pl-2"
            }
            title="Name"
            sortable
            ascending={
              sort.sortBy !== null &&
              sort.sortOrder !== null &&
              sort.sortBy === "name" &&
              sort.sortOrder === "desc"
            }
            iconClassName={
              (sort.sortBy === "name" ? "text-primary" : "") + " size-4"
            }
          />
        </div>
      ),
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (value: string, row: Member) => (
        <figure className={cn("flex items-center gap-3")}>
          {/* <Avatar
            name={value}
            src={
              row.member_image ||
              (row?.gender && row?.gender[0]?.toLowerCase() === "f"
                ? "https://images.gymforce.in/woman-user-circle-icon.png"
                : "https://images.gymforce.in/man-user-circle-icon.png")
            }
            // className="dark:text-gray-200"
          /> */}
          <Image
            alt={value}
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
              <Text className="font-lexend text-sm font-medium text-nowrap text-clip text-gray-900 hover:text-primary">
                {value}
                {/* <span className="flex flex-row gap-2 flex-nowrap items-center">
                  {row.exp_date && new Date(row.exp_date) < new Date() ? (
                    <Badge color="danger" variant="outline">
                      Expired
                    </Badge>
                  ) : new Date(row.exp_date).getTime() - new Date().getTime() <=
                    604800000 ? (
                      <Badge size='sm' color="warning" variant='outline'>Expiring{" "}<span className="hidden md:block md:ml-1">soon</span></Badge>
                      ) : (
                    <Badge color="success" variant="outline">
                      Active
                    </Badge>
                  )}
                </span> */}
              </Text>
            </Link>
            <Text className="text-[13px] ">{row.phone}</Text>
          </figcaption>
        </figure>
      ),
    },
    {
      title: (
        <HeaderCell title="Membership" className=" text-sm font-semibold" />
      ),
      dataIndex: "package_name",
      key: "package_name",
      width: 180,
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
    {
      title: <HeaderCell title="Gender" className=" text-sm font-semibold" />,
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: (value: string) => (
        <Text className={`font-medium text-gray-700 `}>
          {value ? value : "N/A"}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Status" className=" text-sm font-semibold" />,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value: string, row: Member) => (
        <Text className={`font-medium text-gray-700 `}>
          {value === "active" ? (
            <Badge color="success" variant="flat">
              Active
            </Badge>
          ) : value === "expired" ? (
            <Badge color="danger" variant="flat">
              Expired
            </Badge>
          ) : value === "upcoming" ? (
            <Badge color="secondary" variant="flat">
              Upcoming
            </Badge>
          ) : null}
        </Text>
      ),
    },
    {
      // title: (
      //   <HeaderCell title="Valid Until" className=" text-sm font-semibold" />
      // ),
      title: (
        <div
          onClick={() => {
            onHeaderSort("exp_date");
          }}
        >
          <HeaderCell
            className={
              (sort.sortBy === "exp_date" ? "text-primary" : "") +
              " text-sm font-semibold pl-2"
            }
            title="Valid"
            sortable
            ascending={
              sort.sortBy !== null &&
              sort.sortOrder !== null &&
              sort.sortBy === "exp_date" &&
              sort.sortOrder === "desc"
            }
            iconClassName={
              (sort.sortBy === "exp_date" ? "text-primary" : "") + " size-4"
            }
          />
        </div>
      ),
      dataIndex: "membership",
      key: "membership",
      width: 150,
      render: (_: any, row: Member) => (
        <DateCell
          date={new Date(row.exp_date)}
          dateFormat={getDateFormat()}
          timeClassName="hidden"
          // dateClassName="dark:text-gray-400"
        />
      ),
    },
    {
      // title: <HeaderCell title="Due" className=" text-sm font-semibold" />,
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
      width: 100,
      render: (due: number) => (
        <Text>
          {getDueBadge({
            dueAmount: due,
            symbol: demographiInfo?.currency_symbol || "₹",
          })}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Actions" className="opacity-0" />,
      dataIndex: "action",
      key: "action",
      width: 130,
      render: (_: string, row: Member) => (
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`tel:${row.phone}`}
            className="hover:text-primary hover:scale-110 duration-150"
          >
            <FaPhoneAlt size={18} />
          </Link>
          <WaModal id={row.member_id} number={row.phone} />
          <Popover
            isOpen={openPopoverId === row.member_id}
            setIsOpen={(isOpen) =>
              setOpenPopoverId(isOpen ? row.member_id : null)
            }
          >
            <Popover.Trigger>
              <ActionIcon
                onClick={() => {
                  if (!isValid) {
                    toast.error("Please Subscribe to Proceed Further");
                    if (auth) {
                      router.push("/subscription/plans");
                    }
                    return;
                  }
                  setOpenPopoverId(
                    openPopoverId === row.member_id ? null : row.member_id
                  );
                }}
                className="action-icon-wrapper"
                variant="text"
              >
                <MoreVertical size="20" />
              </ActionIcon>
            </Popover.Trigger>
            <Popover.Content className="">
              <div className="flex flex-col justify-start m-[2]">
                <Button
                  variant="text"
                  onClick={() => {
                    if (isStaf && !auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    setFunc("Edit");
                    setFunc("Edit");
                    setOpenPopoverId(row.member_id);
                    setSelectedRow(row);
                  }}
                  className={` ${restore ? "hidden" : ""} flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdEdit size={18} />
                  <Text>Edit</Text>
                </Button>
                {!isStaf || (isStaf && !auth && access) ? (
                  <AddMemberFollowup
                    memberId={row.member_id}
                    refresh={async () => {
                      await fetchMemberData(1);
                    }}
                  />
                ) : (
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => {
                      toast.error("You aren't allowed to make changes");
                    }}
                    className="flex flex-row gap-2 items-center justify-start font-medium hover:scale-105 transition-transform duration-300 py-2 px-4"
                  >
                    <FaUserPlus size={20} />
                    <Text className="text-sm">Followup</Text>
                  </Button>
                )}

                {row.membership_id ? (
                  <>
                    {row.due > 0 && (
                      <Button
                        variant="text"
                        onClick={() => {
                          if (isStaf && !auth && !access) {
                            toast.error("You aren't allowed to make changes");
                            return;
                          }
                          setFunc("Pay");
                          setOpenPopoverId(row.member_id);
                          setSelectedRow(row);
                        }}
                        className={` ${restore ? "hidden" : ""} flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                      >
                        <MdPayments size={20} />
                        <Text>Pay Dues</Text>
                      </Button>
                    )}
                    {row.due > 0 && (
                      <Button
                        variant="text"
                        onClick={() => {
                          if (isStaf && !auth && !access) {
                            toast.error("You aren't allowed to make changes");
                            return;
                          }
                          setFunc("Extend");
                          setOpenPopoverId(row.member_id);
                          setSelectedRow(row);
                        }}
                        className={` ${restore ? "hidden" : ""} flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                      >
                        <MdOutlineDateRange size={20} />
                        <Text>Extend Due Date</Text>
                      </Button>
                    )}
                    <Button
                      variant="text"
                      onClick={() => {
                        if (row.due) {
                          toast.error(
                            "Renewal can't proceed until the due payment is made"
                          );
                          return;
                        }
                        if (isStaf && !auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                        }
                        setFunc("Renew");
                        setOpenPopoverId(row.member_id);
                        setSelectedRow(row);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <RiLoopLeftLine size={20} />
                      <Text>Renew</Text>
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        if (row.due) {
                          toast.error(
                            "Upgrade can't proceed until the due payment is made"
                          );
                          return;
                        }
                        if (isStaf && !auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                        }
                        setFunc("Upgrade");
                        setOpenPopoverId(row.member_id);
                        setSelectedRow(row);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <IoMdArrowDropupCircle size={20} />
                      <Text>Upgrade</Text>
                    </Button>

                    <Button
                      variant="text"
                      onClick={() => {
                        if (row.due) {
                          toast.error(
                            "Extend can't proceed until the due payment is made"
                          );
                          return;
                        }
                        if (isStaf && !auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                        }
                        setFunc("Addon");
                        setOpenPopoverId(row.member_id);
                        setSelectedRow(row);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <BiLayerPlus size={20} />
                      <Text>Addon Days</Text>
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        if (row.due) {
                          toast.error(
                            "Transfer can't proceed until the due payment is made"
                          );
                          return;
                        }
                        if (isStaf && !auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                        }
                        setFunc("Transfer");
                        setOpenPopoverId(row.member_id);
                        setSelectedRow(row);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <MdOutlineChangeCircle size={20} />
                      <Text>Transfer</Text>
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        if (isStaf && !auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                        }
                        setFunc("Cancel");
                        setOpenPopoverId(row.member_id);
                        setSelectedRow(row);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-row gap-2 items-center hover:text-red-500 justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <MdCancel size={20} />
                      <Text>Cancel</Text>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="text"
                    onClick={() => {
                      if (isStaf && !auth && !access) {
                        toast.error("You aren't allowed to make changes");
                        return;
                      }
                      setAddMembership(true);
                      setSelectedRow(row);
                    }}
                    className={`flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                  >
                    <RiFileAddFill size={18} />
                    <Text>Add Membership</Text>
                  </Button>
                )}

                {restore ? (
                  <RestoreModal
                    id={row.member_id}
                    onUpdate={() => {
                      fetchMemberData(1);
                    }}
                    type="Member"
                  />
                ) : !isStaf || (isStaf && !auth && access) ? (
                  <DeleteModal
                    id={row.member_id}
                    onUpdate={() => {
                      fetchMemberData(1);
                    }}
                    // restore={restore}
                    type="Member"
                  />
                ) : null}
              </div>
            </Popover.Content>
          </Popover>
        </div>
      ),
    },
  ];
};
