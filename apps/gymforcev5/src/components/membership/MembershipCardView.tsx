// MembershipCardView.tsx
import {
  Avatar,
  Badge,
  Button,
  Popover,
  Text,
  Tooltip,
  ActionIcon,
} from "rizzui";
import Link from "next/link";
import { LucideListTodo, PhoneIcon } from "lucide-react";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { FaArrowRightLong, FaClockRotateLeft, FaPlay } from "react-icons/fa6";
import WaModal from "../wa-template/WaModal";
import { IoMdArrowDropupCircle, IoMdEye } from "react-icons/io";
import {
  MdCancel,
  MdMotionPhotosPaused,
  MdOutlineBookmark,
  MdOutlineChangeCircle,
  MdOutlineDateRange,
  MdPayments,
} from "react-icons/md";
import { RiLoopLeftLine } from "react-icons/ri";
import { BiLayerPlus } from "react-icons/bi";
import { PiUserCirclePlusFill } from "react-icons/pi";
import getDueBadge from "@/components/dueBadge";
import toast from "react-hot-toast";
import InvoiceMail from "../Invoice/InvoiceMail";
import { Membership } from "@/components/membership/section/Memberships";
import { FaEllipsisV } from "react-icons/fa";
import Image from "next/image";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";

interface MembershipCardViewProps {
  data: Membership;
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
      | "addTrainer",
    membershipId: string
  ) => void;
  checkValidity: () => void;
  auth: boolean;
  access: boolean;
}

const MembershipCardView = ({
  data,
  demographicInfo,
  handleAction,
  checkValidity,
  auth,
  access,
}: MembershipCardViewProps) => {
  const renderBadge = ({
    color,
    text,
    variant = "flat",
    isAnimated = false,
  }: {
    color?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
    text: string;
    variant?: "flat" | "outline" | "solid";
    isAnimated?: boolean;
  }) => (
    <Badge
      size="sm"
      color={color}
      variant={variant}
      className={isAnimated ? "animate-pulse" : ""}
    >
      {text}
    </Badge>
  );

  const getMembershipStatus = () => {
    if (data.status === "cancelled" && data.cancelled) {
      return renderBadge({
        color: "danger",
        text: "Cancelled",
        variant: "flat",
        isAnimated: true,
      });
    }

    if (data.is_transferred) {
      return renderBadge({
        color: "info",
        text: "Transferred",
        variant: "flat",
      });
    }

    if (data.is_upgraded) {
      return renderBadge({
        color: "success",
        text: "Upgraded",
        variant: "flat",
      });
    }

    const currentDate = new Date();
    const endDate = new Date(data.end_date);
    const startDate = new Date(data.start_date);
    const oneWeekInMs = 604800000;

    if (endDate < currentDate) {
      if (
        data.reference === "New Membership" &&
        !data.is_renewable &&
        data.renewal_count
      ) {
        return renderBadge({
          color: "info",
          text: "Renewed",
          variant: "outline",
        });
      }
      return renderBadge({
        color: "danger",
        text: "Expired",
        variant: "outline",
      });
    }

    if (endDate.getTime() - currentDate.getTime() <= oneWeekInMs) {
      return renderBadge({
        color: "warning",
        text: "Expiring",
        variant: "outline",
      });
    }

    if (startDate.getTime() > currentDate.getTime()) {
      return renderBadge({
        color: "secondary",
        text: "Upcoming",
        variant: "outline",
      });
    }

    return renderBadge({
      color: "success",
      text: "Active",
      variant: "outline",
    });
  };

  return (
    <div className="grid gap-2.5 lg:gap-3 border rounded-xl  p-4 sm:p-6 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* <Avatar
            name={data.member_name}
            src={
              data.member_image ||
              (data?.gender?.[0]?.toLowerCase() === "f"
                ? "https://images.gymforce.in/woman-user-circle-icon.png"
                : "https://images.gymforce.in/man-user-circle-icon.png")
            }
          /> */}
          <Image
            alt={data.member_name}
            src={
              data.member_image ||
              (data?.gender?.[0]?.toLowerCase() === "f" ? WomanIcon : ManIcon)
            }
            height={40}
            width={40}
            className="size-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/member_profile/yk62-${data.member_id}-71he`}>
                <Text className="font-lexend text-sm font-medium text-gray-900 hover:text-primary">
                  {data.member_name}
                </Text>
              </Link>
              {getMembershipStatus()}
            </div>
            <Text className="text-[13px]">{data.member_phone}</Text>
          </div>
        </div>
        <Text>#{data.localid}</Text>
      </div>

      <div className="grid gap-2">
        <div className="mx-2 flex items-center gap-3">
          <MdOutlineBookmark size={20} className="text-primary" />
          <Tooltip content={data.package_name || "N/A"}>
            <Text className="max-w-[200px] truncate">
              {data.package_name || "N/A"}
            </Text>
          </Tooltip>
        </div>
        {data.sessions && (
          <div className="mx-2 flex items-center gap-3">
            <LucideListTodo size={20} className="text-primary" />{" "}
            <Text>{data.sessions} Sessions</Text>
          </div>
        )}

        <div className="mx-2 flex items-center gap-3">
          <FaClockRotateLeft size={18} className="text-primary" />
          <div className="flex items-center gap-2">
            <DateCell
              date={new Date(data.start_date)}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
            />
            <FaArrowRightLong className="size-3" />
            <DateCell
              date={new Date(data.end_date)}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
            />
          </div>
        </div>

        {data.due > 0 && (
          <div className="mx-2 flex items-center gap-3">
            <Text className="font-medium">Due Amount:</Text>
            <Text>
              {getDueBadge({
                dueAmount: data.due,
                symbol: demographicInfo?.currency_symbol || "",
              })}
            </Text>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-2">
        {data.member_name && data.member_phone ? (
          <div className="flex items-center justify-end gap-1">
            <Link href={`tel:${data.member_phone}`}>
              <PhoneIcon
                size={20}
                className="text-gray-700  hover:text-primary hover:scale-110 duration-150"
              />
            </Link>
            {/* <Link
                href={`https://wa.me/${data.member_phone}?text=Hi ${data.member_name}`}
                target="_blank"
              >
                <PiWhatsappLogoBold
                  size={24}
                  className="text-gray-700 dark:text-gray-400  hover:text-primary hover:scale-110 duration-150"
                />
              </Link> */}
            <WaModal id={data.member_id} number={data.member_phone} />
          </div>
        ) : null}
        <InvoiceMail membershipId={data.membership_id} isInvoiceList={true} />
        <Tooltip
          size="sm"
          content={"View Invoice"}
          placement="top"
          color="invert"
          // className="dark:bg-gray-800 "
          // arrowClassName="dark:text-gray-800"
        >
          <Link
            href={`/invoice/hy$39-${data.membership_id}-091$u/?member=?member=i9$rw-${data?.member_id}-7y$72&page=membership/list`}
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
              {data.trainer === null && (
                <Button
                  variant="text"
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("addTrainer", data.membership_id);
                  }}
                  className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <PiUserCirclePlusFill size={20} />
                  <Text>Assign Trainer</Text>
                </Button>
              )}
              {data.due > 0 && (
                <Button
                  variant="text"
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("Pay", data.membership_id);
                  }}
                  className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdPayments size={20} />
                  <Text>Pay Dues</Text>
                </Button>
              )}
              {data.due > 0 && (
                <Button
                  variant="text"
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("Extend", data.membership_id);
                  }}
                  className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdOutlineDateRange size={20} />
                  <Text>Extend Due Date</Text>
                </Button>
              )}

              <Button
                onClick={() => {
                  if (data.due) {
                    toast.error(
                      "Renewal can't proceed until the due payment is made"
                    );
                    return;
                  } else if (!data.is_renewable) {
                    toast.error("Renewal can't proceed for this membership");
                    return;
                  }
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Renew", data.membership_id);
                }}
                variant="text"
                className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <RiLoopLeftLine size={20} />
                <Text>Renew</Text>
              </Button>
              <Button
                onClick={() => {
                  if (data.due) {
                    toast.error(
                      "Upgrade can't proceed until the due payment is made"
                    );
                    return;
                  }
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Upgrade", data.membership_id);
                }}
                variant="text"
                className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <IoMdArrowDropupCircle size={20} />
                <Text>Upgrade</Text>
              </Button>
              {data.freezed ? (
                <Button
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("UnFreeze", data.membership_id);
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
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("Freeze", data.membership_id);
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
                  if (data.due) {
                    toast.error(
                      "Extend can't proceed until the due payment is made"
                    );
                    return;
                  } else if (data.freezed) {
                    toast.error("Extend can't proceed while It's Freezed.");
                    return;
                  }
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Addon", data.membership_id);
                }}
                variant="text"
                className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <BiLayerPlus size={20} />
                <Text>Addon Days</Text>
              </Button>
              <Button
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleAction("Transfer", data.membership_id);
                }}
                variant="text"
                className={`flex flex-row gap-2 hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
              >
                <MdOutlineChangeCircle size={20} />
                <Text>Transfer</Text>
              </Button>
              {!data.cancelled && (
                <Button
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    handleAction("Cancel", data.membership_id);
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
    </div>
  );
};

export default MembershipCardView;
