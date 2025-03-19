// ExpCard.tsx
import { Badge, Text } from "rizzui";
import cn from "@core/utils/class-names";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { PhoneIcon } from "lucide-react";
import Link from "next/link";
import { FaArrowRightLong, FaClockRotateLeft, FaPlay } from "react-icons/fa6";
import {
  MdCancel,
  MdMotionPhotosPaused,
  MdOutlineBookmark,
  MdOutlineChangeCircle,
  MdOutlineDateRange,
  MdPayments,
} from "react-icons/md";
import getDueBadge from "@/components/dueBadge";
import { Button, Popover } from "rizzui";
import { FaEllipsisV } from "react-icons/fa";
import { RenewalData } from "../exp-columns";
import WaModal from "@/components/wa-template/WaModal";
import { BiLayerPlus } from "react-icons/bi";
import toast from "react-hot-toast";
import { IoMdArrowDropupCircle } from "react-icons/io";
import { RiLoopLeftLine } from "react-icons/ri";
import Image from "next/image";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";

interface ExpCardProps {
  data: RenewalData;
  demographicInfo?: any;
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
  type: "upcoming_renewal" | "expired";
  auth: boolean;
  access: boolean;
}

const ExpCard = ({
  data,
  demographicInfo,
  handleAction,
  checkValidity,
  type,
  auth,
  access,
}: ExpCardProps) => (
  <div className="grid gap-2.5 lg:gap-3 border rounded-xl p-4 sm:p-6 max-w-sm">
    <div className="grid grid-cols-[1fr,auto]">
      <figure className={cn("flex items-center gap-3")}>
        {/* <Avatar
          name={data.member_name}
          src={
            data.member_image ||
            (data?.gender && data?.gender[0]?.toLowerCase() === "f"
              ? "https://images.gymforce.in/woman-user-circle-icon.png"
              : "https://images.gymforce.in/man-user-circle-icon.png")
          }
        /> */}
        <Image
          alt={data.member_name}
          src={
            data.member_image ||
            (data?.gender && data?.gender[0]?.toLowerCase() === "f"
              ? WomanIcon
              : ManIcon)
          }
          height={40}
          width={40}
          className="size-10 rounded-full"
        />
        <figcaption className="grid gap-0.5">
          <Link href={`/member_profile/yk62-${data.member_id}-71he`}>
            <Text className="font-lexend text-sm font-medium text-gray-900 hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Text className="text-nowrap text-clip capitalize">
                  {data.member_name}
                </Text>
                {type === "expired" ? (
                  <Badge size="sm" color="danger" variant="outline">
                    Expired
                  </Badge>
                ) : (
                  <Badge size="sm" color="warning" variant="outline">
                    Expiring Soon
                  </Badge>
                )}
              </span>
            </Text>
          </Link>
          <Text className="text-[13px]">{data.member_phone}</Text>
        </figcaption>
      </figure>
    </div>

    <div className="mx-2 flex items-center gap-3">
      <MdOutlineBookmark size={20} className="text-primary" />
      <Text className={`font-medium text-gray-700  capitalize`}>
        {data.package_name}
      </Text>
    </div>

    <div className="mx-2 flex items-center gap-3">
      <FaClockRotateLeft size={18} className="text-primary" />

      <Text className="flex items-center gap-2">
        <DateCell
          date={new Date(data.start_date)}
          dateFormat={getDateFormat()}
          timeClassName="hidden"
          dateClassName="text-sm"
        />
        <FaArrowRightLong className="size-3 mx-1" />
        <DateCell
          date={new Date(data.end_date)}
          dateFormat={getDateFormat()}
          timeClassName="hidden"
          dateClassName="text-sm"
        />
      </Text>
    </div>

    {data.due > 0 && (
      <div className="mx-2 flex items-center gap-3">
        <MdPayments size={20} className="text-primary" />
        <Badge color="danger" variant="flat">
          {getDueBadge({
            dueAmount: data.due,
            symbol: demographicInfo?.currency_symbol || "",
          })}
        </Badge>
      </div>
    )}

    <div className="flex items-center justify-end gap-3">
      <div className="flex items-center gap-3">
        <Link href={`tel:${data.member_phone}`}>
          <PhoneIcon
            size={20}
            className="text-gray-700 hover:text-primary hover:scale-110 duration-150"
          />
        </Link>
        <WaModal id={data.member_id} number={data.member_phone} />
      </div>
      <Popover placement="bottom">
        <Popover.Trigger>
          <Button variant="text" className="h-auto" onClick={checkValidity}>
            <FaEllipsisV className="text-gray-500" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="">
          <div className="flex flex-col justify-start m-[2]">
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
              variant="text"
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                handleAction("Transfer", data.membership_id);
              }}
              className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
            >
              <MdOutlineChangeCircle size={20} />
              <Text>Transfer</Text>
            </Button>
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
          </div>
        </Popover.Content>
      </Popover>
    </div>
  </div>
);

export default ExpCard;
