// PendingCard.tsx
import { Avatar, Badge, Button, Text, Tooltip } from "rizzui";
import { Membership } from "@/components/membership/section/DueList";
import cn from "@core/utils/class-names";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { PhoneIcon } from "lucide-react";
import Link from "next/link";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import getDueBadge from "../../dueBadge";
import { FaClockRotateLeft } from "react-icons/fa6";
import {
  MdNotificationsActive,
  MdOutlineBookmark,
  MdOutlineDateRange,
} from "react-icons/md";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import Image from "next/image";
const Payment = dynamic(() => import("../due-payment"));
const WaModal = dynamic(() => import("../../wa-template/WaModal"));
const ExtendModal = dynamic(
  () => import("../../member-list/Modals").then((com) => com.ExtendModal),
  {
    ssr: false,
  }
);
interface PendingCardProps {
  data: Membership;
  getdueData: () => void;
  demographiInfo?: any;
  checkValidity: () => void;
  extendRefresh: () => void;
  auth: boolean;
  access: boolean;
}

const PendingCard = ({
  data,
  getdueData,
  demographiInfo,
  checkValidity,
  extendRefresh,
  access,
  auth,
}: PendingCardProps) => (
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
                {data.end_date && new Date(data.end_date) < new Date() ? (
                  <Badge size="sm" color="danger" variant="outline">
                    Expired
                  </Badge>
                ) : new Date(data.end_date).getTime() - new Date().getTime() <=
                  604800000 ? (
                  <Badge size="sm" color="warning" variant="outline">
                    Expiring{" "}
                    <span className="hidden md:block md:ml-1">soon</span>
                  </Badge>
                ) : (
                  <Badge size="sm" color="success" variant="outline">
                    Active
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
      <MdOutlineBookmark size={20} className="text-primary" />{" "}
      <Text>{data.package_name}</Text>
    </div>

    <div className="mx-2 flex items-center gap-3">
      <FaClockRotateLeft size={18} className="text-primary" />
      <Text>
        {Math.floor(
          (new Date(data.end_date).getTime() - new Date().getTime()) / 86400000
        )}{" "}
        days
      </Text>
    </div>

    <div className="mx-2 flex items-center gap-3">
      <MdNotificationsActive size={20} className="text-primary " />
      <DateCell
        date={new Date(data.due_date ?? "")}
        dateFormat={getDateFormat()}
        timeClassName="hidden"
      />
      <Badge color="danger" variant="flat" className="ml-2 md:ml-4">
        {getDueBadge({
          dueAmount: data.due,
          symbol: demographiInfo?.currency_symbol || "",
        })}
      </Badge>
    </div>

    <div className="flex items-center justify-end gap-3">
      {data.member_name && data.member_phone && (
        <div className="flex items-center gap-3">
          <Link href={`tel:${data.member_phone}`}>
            <PhoneIcon
              size={20}
              className="text-gray-700 hover:text-primary hover:scale-110 duration-150"
            />
          </Link>
          <WaModal id={data.member_id} number={data.member_phone} />
        </div>
      )}
      <div className="scale-90">
        {!auth && !access ? (
          <Tooltip content="Payment Update">
            <Button
              onClick={() => {
                toast.error("You aren't allowed to make changes");
              }}
              size="sm"
            >
              Pay
            </Button>
          </Tooltip>
        ) : (
          <Payment
            member={data}
            getdueData={getdueData}
            checkValidity={checkValidity}
          />
        )}
      </div>
      {data.due_date && (
        <div className="scale-90">
          {!auth && !access ? (
            <Tooltip content="Extend Due Date" placement="bottom">
              <Button
                size="sm"
                onClick={() => {
                  toast.error("You aren't allowed to make changes");
                }}
                className="flex flex-row gap-2 items-center justify-start font-medium "
              >
                <MdOutlineDateRange size={20} />
                <Text>Extend</Text>
              </Button>
            </Tooltip>
          ) : (
            <ExtendModal
              membershipId={data.membership_id}
              due_date={data.due_date}
              onUpdate={extendRefresh}
              isDue={false}
            />
          )}
        </div>
      )}
    </div>
  </div>
);

export default PendingCard;
