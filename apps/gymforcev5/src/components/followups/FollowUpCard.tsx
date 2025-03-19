import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Popover,
  Text,
  Tooltip,
} from "rizzui";
import { FollowUpType, MemberFollowUp } from "./FollowUps";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { MdModeEdit } from "react-icons/md";
import { PiClockClockwiseBold, PiPlus } from "react-icons/pi";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import LeadConvert from "../leads/LeadConvert";

const FollowUpCard = ({
  data,
  type,
  onViewHistory,
  onEdit,
  onAdd,
  onConvert,
  isValid,
  auth,
  packages,
  paymentModes,
  refreshData,
  access,
}: {
  data: FollowUpType | MemberFollowUp;
  type: "Enq" | "Member";
  onViewHistory: (id: number) => void;
  onEdit: (id: number) => void;
  onAdd: (id: number, data?: FollowUpType | MemberFollowUp) => void;
  onConvert?: (lead: any) => void;
  isValid: boolean;
  auth: boolean;
  packages?: any[];
  paymentModes?: any[];
  refreshData: () => void;
  access: boolean;
}) => {
  const router = useRouter();

  const getMemberImage = () => {
    if (type === "Enq") {
      return (
        (data as FollowUpType).lead?.visitor_image ||
        ((data as FollowUpType).lead?.gender?.charAt(0)?.toLowerCase() === "f"
          ? "https://images.gymforce.in/woman-user-circle-icon.png"
          : "https://images.gymforce.in/man-user-circle-icon.png")
      );
    } else {
      return (
        (data as MemberFollowUp).member?.member_image ||
        ((data as MemberFollowUp).member?.gender?.charAt(0)?.toLowerCase() ===
        "f"
          ? "https://images.gymforce.in/woman-user-circle-icon.png"
          : "https://images.gymforce.in/man-user-circle-icon.png")
      );
    }
  };

  return (
    <div className="grid gap-2.5 lg:gap-3 border rounded-xl p-4 sm:p-6 max-w-sm">
      <div className="flex items-center justify-between">
        <figure className="flex items-center gap-3">
          <Avatar
            src={getMemberImage()}
            name={
              type === "Enq"
                ? (data as FollowUpType).lead?.name
                : (data as MemberFollowUp).member?.name || ""
            }
            className="size-10 rounded-full"          />
          <figcaption className="grid gap-0.5">
            <Text className="font-lexend text-sm font-medium text-gray-900">
              {type === "Member" && (
                <Link
                  href={`/member_profile/yk62-${(data as MemberFollowUp).member?.id}-71he`}
                >
                  {(data as MemberFollowUp).member?.name}
                </Link>
              )}
              {type === "Enq" && (data as FollowUpType).lead?.name}
            </Text>
            <Text className="text-xs text-gray-500">
              {type === "Enq"
                ? (data as FollowUpType).lead?.phone
                : (data as MemberFollowUp).member?.phone}
            </Text>
          </figcaption>
        </figure>
        <Badge variant="flat" className="scale-90">
          {data.status}
        </Badge>
      </div>

      <div className="grid gap-2 mt-3">
        <div className="flex items-center gap-4">
          <Text className="text-sm text-gray-500">Next Reminder:</Text>
          {data.next_followup_reminder ? (
            <DateCell
              date={new Date(data.next_followup_reminder)}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
            />
          ) : (
            <Text>N/A</Text>
          )}
        </div>

        {data.comment && (
          <div className="flex items-start gap-4">
            <Text className="text-sm text-gray-500">Comment:</Text>
            <Text className="text-xs max-w-[250px]">{data.comment}</Text>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Text className="text-sm text-gray-500">Managed By:</Text>
          {data.managed_by ? (
            <Text className="text-sm">
              {data.managed_by?.name}
              {data.managed_by && ` (${data.contact_type})`}
            </Text>
          ) : (
            <Text className="text-sm">N/A</Text>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {type === "Enq" &&
          !(data as FollowUpType).member &&
          (!auth && !access ? (
            <Button
              size="sm"
              onClick={() => {
                toast.error("You aren't allowed to make changes");
              }}
            >
              Convert
            </Button>
          ) : (
            <LeadConvert
              lead={(data as FollowUpType).lead}
              packages={packages}
              paymentModes={paymentModes || []}
              onConvert={refreshData}
              isValid={isValid}
              auth={auth}
            />
          ))}

        <Tooltip content="View History">
          <Button
            variant="text"
            onClick={() => onViewHistory(data.id)}
            className="h-auto p-1"
          >
            <PiClockClockwiseBold className="h-5 w-5" />
          </Button>
        </Tooltip>

        <Popover>
          <Popover.Trigger>
            <ActionIcon
              variant="text"
              className="h-auto"
              onClick={() => {
                if (!isValid) {
                  toast.error("Please Subscribe to Proceed Further");
                  if (auth) {
                    router.push("/subscription/plans");
                  }
                }
              }}
            >
              <MoreVertical className="h-5 w-5" />
            </ActionIcon>
          </Popover.Trigger>
          <Popover.Content>
            <div className="flex flex-col gap-1">
              <Button
                variant="text"
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                    // }
                  }
                  onAdd(data.id, data);
                }}
                className="h-auto"
              >
                <PiPlus className="h-4 w-4 mr-2" /> Add
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                    // }
                  }
                  onEdit(data.id);
                }}
                className="h-auto"
              >
                <MdModeEdit className="h-4 w-4 mr-2" /> Edit
              </Button>
            </div>
          </Popover.Content>
        </Popover>
      </div>
    </div>
  );
};

export default FollowUpCard;
