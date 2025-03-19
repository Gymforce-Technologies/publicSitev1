// PTCard.tsx
import { Avatar, Badge, Text, Button, ActionIcon, Tooltip } from "rizzui";
import Link from "next/link";
import { PiClockClockwiseDuotone } from "react-icons/pi";
import { MdOutlineAddChart, MdOutlineBookmark } from "react-icons/md";
import cn from "@core/utils/class-names";
import { Dispatch, SetStateAction } from "react";
import { MangeData } from "../MembershipList";
import toast from "react-hot-toast";
import { LucideListTodo } from "lucide-react";
import { FaChalkboardTeacher } from "react-icons/fa";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import Image from "next/image";

interface PTCardProps {
  data: MangeData;
  demographicInfo?: any;
  showManage: boolean;
  showApprove: boolean;
  isStaf: boolean;
  onAction: Dispatch<
    SetStateAction<"close" | "add" | "view" | "approve" | "history" | null>
  >;
  setAddSession: Dispatch<any>;
  setEndSession: Dispatch<any>;
  setSelected: Dispatch<SetStateAction<MangeData | null>>;
  auth: boolean;
  access: boolean;
}

const PTCard = ({
  data,
  demographicInfo,
  showManage,
  showApprove,
  isStaf,
  onAction,
  setAddSession,
  setEndSession,
  setSelected,
  access,
  auth,
}: PTCardProps) => (
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
              <span className="flex flex-data gap-2 flex-nowrap items-center">
                <Text className="text-nowrap text-clip capitalize">
                  {data.member_name}
                </Text>
                <Badge
                  size="sm"
                  color={
                    data.latest_session_details?.status === "Started"
                      ? "primary"
                      : data.latest_session_details?.status === "Completed"
                        ? "secondary"
                        : "success"
                  }
                  variant="outline"
                >
                  {data.latest_session_details?.status || "N/A"}
                </Badge>
              </span>
            </Text>
          </Link>
          <Text className="text-[13px]">{data.member_phone}</Text>
        </figcaption>
      </figure>
    </div>

    <div className="space-y-3 mt-2">
      <div className="mx-2 flex items-center gap-3">
        <MdOutlineBookmark size={20} className="text-primary" />{" "}
        <Text className="text-sm">{data.package_name}</Text>
      </div>

      <div className="mx-2 flex items-center gap-3">
        <LucideListTodo size={20} className="text-primary" />{" "}
        <Text className="text-sm">{data.sessions} Sessions</Text>
      </div>

      <div className="mx-2 flex items-center gap-3">
        <FaChalkboardTeacher size={20} className="text-primary" />{" "}
        <Text className="text-sm">
          {data.trainer_details ? data.trainer_details.name : "N/A"}
        </Text>
      </div>
      <div className="mx-2 flex items-center gap-3">
        <Text className="text-sm font-medium">Price:</Text>
        <Badge variant="flat">
          {demographicInfo?.currency_symbol} {data.offer_price_amount}
        </Badge>
      </div>
    </div>

    <div className="flex items-center justify-end gap-2 mt-4">
      {showManage &&
        (data.latest_session_details &&
        data.latest_session_details?.status === "Started" ? (
          <Tooltip content="End Session">
            <Button
              size="sm"
              onClick={() => {
                if (data.trainer === null) {
                  toast.error("Please Assign the Trainer from Profile Page");
                  return;
                }
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                onAction("close");
                setSelected(data);
                console.log(parseInt(data.sessions.split("|")[0]) + 1);
                setEndSession({
                  membership_id: data.membership_id,
                  session_id: data.latest_session_details.id ?? 0,
                  end_time: "",
                });
              }}
            >
              End
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content="New Session">
            <Button
              size="sm"
              onClick={() => {
                if (data.trainer === null) {
                  toast.error("Please Assign the Trainer from Profile Page");
                  return;
                }
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                onAction("add");
                setSelected(data);
                console.log(parseInt(data.sessions.split("|")[0]) + 1);
                setAddSession({
                  membership_id: data.membership_id,
                  session_number: parseInt(data.sessions.split("|")[0]) + 1,
                  start_time: "",
                });
              }}
              className="text-nowrap"
            >
              New
            </Button>
          </Tooltip>
        ))}
      {showApprove &&
        !isStaf &&
        (data.latest_session_details &&
        data.latest_session_details?.status !== "Completed" ? null : (
          // <div className="flex items-center gap-2">
          //   <Badge renderAsDot color="success" />
          //   <Text className="text-[13px] text-green-400">Approved</Text>
          // </div>
          <Button
            size="sm"
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              onAction("approve");
              setSelected(data);
            }}
          >
            Approve
          </Button>
        ))}

      <Tooltip content="View Session">
        <ActionIcon size="sm" rounded="lg">
          <PiClockClockwiseDuotone
            size="sm"
            onClick={() => {
              onAction("view");
              setSelected(data);
            }}
            className="cursor-pointer size-5 text-primary-foreground scale-105 "
          />
        </ActionIcon>
      </Tooltip>
      <Tooltip content="Add History">
        <ActionIcon rounded="lg" variant="text">
          <MdOutlineAddChart
            size="sm"
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              onAction("history");
              setSelected(data);
            }}
            className="cursor-pointer size-8 text-primary scale-105 "
          />
        </ActionIcon>
      </Tooltip>
    </div>
  </div>
);

export default PTCard;
