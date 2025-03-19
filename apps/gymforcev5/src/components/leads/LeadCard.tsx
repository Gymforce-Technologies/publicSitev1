import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Popover,
  Text,
  Tooltip,
} from "rizzui";
import { Data, Package } from "./Leads";
import cn from "@core/utils/class-names";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { MdDelete, MdNotificationsActive } from "react-icons/md";
import { MoreVertical, Pencil } from "lucide-react";
import { PiPlus } from "react-icons/pi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import Image from "next/image";
// import LeadConvert from "./LeadConvert";
import dynamic from "next/dynamic";
const LeadConvert = dynamic(() => import("./LeadConvert"), {
  ssr: false, // uses UseRouter
});
const DeleteModal = dynamic(() =>
  import("@/components/member-list/Modals").then((comp) => comp.DeleteModal)
);
const RestoreModal = dynamic(() =>
  import("@/components/member-list/Modals").then((comp) => comp.RestoreModal)
);

const LeadCard = ({
  data,
  setFunc,
  setSelected,
  setOpen,
  packages,
  paymentModes,
  auth,
  refreshData,
  isValid,
  openPopoverId,
  setOpenPopoverId,
  showrestore,
  // isStaff,
  // staffType,
  access,
  findDataIndex,
}: {
  data: Data;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  setFunc: React.Dispatch<
    React.SetStateAction<"Edit" | "Delete" | "More" | null>
  >;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  packages: Package[];
  paymentModes: {
    label: string;
    value: number;
  }[];
  findDataIndex: (leadId: string) => number;
  refreshData: () => void;
  auth: boolean;
  isValid: boolean;
  openPopoverId: string | null;
  setOpenPopoverId: React.Dispatch<React.SetStateAction<string | null>>;
  showrestore: boolean;
  access: boolean;
  // staffType: string;
}) => {
  const router = useRouter();
  return (
    <div className="grid gap-2.5 lg:gap-3 border rounded-xl p-4 sm:p-6 max-w-sm">
      <div className="grid grid-cols-[1fr,auto]">
        <figure className={cn("flex items-center gap-3")}>
          <Image
            alt={data.name || "N/A"}
            src={
              data.visitor_image ||
              (data?.gender && data?.gender[0]?.toLowerCase() === "f"
                ? WomanIcon
                : ManIcon)
            }
            height={40}
            width={40}
            className="size-10 rounded-full"
            // className="dark:text-gray-200"
          />
          <figcaption className="grid gap-0.5">
            {/* <Link href={`/member_profile/yk62-${data.member_id}-71he`}> */}
            {/* yk$6372h$e */}
            <Text className="font-lexend capitalize text-sm font-medium text-nowrap text-clip text-gray-900 hover:text-primary">
              {data.name || "Not Available"}
            </Text>
            {/* </Link> */}
            <Text className="text-[13px] ">{data.phone || "N/A"}</Text>
          </figcaption>
        </figure>
        <Text className={`font-medium text-gray-700 self-center mx-4`}>
          {data.status && data.status !== "N/A" ? (
            <Badge size="sm">{data.status}</Badge>
          ) : (
            ""
          )}
        </Text>
      </div>
      <div className="mx-2 flex items-center gap-3">
        {/* <FaCalendarPlus size={18} className="text-primary" /> */}
        <Text className="font-semibold">Created :</Text>
        {data.date ? (
          <DateCell
            date={new Date(data.date)}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            // dateClassName="dark:text-gray-400"
          />
        ) : (
          "N/A"
        )}
      </div>
      <div className="mx-2 flex items-center gap-3 ">
        <Text className="font-semibold">Joining :</Text>
        {data.reminder ? (
          <DateCell
            date={new Date(data.reminder)}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            // dateClassName="dark:text-gray-400"
          />
        ) : (
          "N/A"
        )}
      </div>
      <div className="mx-2 flex items-center gap-3 ">
        <MdNotificationsActive size={20} className="text-primary " />
        {data.reminder ? (
          <div className="flex items-center gap-4">
            <DateCell
              date={new Date(data.reminder)}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
              // dateClassName="dark:text-gray-400"
            />
            {!data.converted &&
              (data.latest_followup_reminder ? null : new Date(
                  data.reminder
                ).getTime() <
                new Date().getTime() - 86400000 ? (
                <Badge
                  color="danger"
                  variant="flat"
                  className=" mx-auto animate-pulse truncate"
                  size="sm"
                >
                  Date Exceeded
                </Badge>
              ) : (
                new Date(data.reminder).getTime() < new Date().getTime() && (
                  <Badge
                    color="warning"
                    variant="flat"
                    className=" mx-auto animate-pulse truncate"
                    size="sm"
                  >
                    Last Day
                  </Badge>
                )
              ))}
          </div>
        ) : (
          "N/A"
        )}
      </div>
      <div className="mx-2 flex items-center gap-3 justify-end">
        {/* <div className={`${showrestore ? "hidden" : ""} `}> */}
        {data.converted ? (
          <div className="flex items-center">
            <Badge color="success" renderAsDot />
            <Text className="ms-1 font-medium text-green-dark text-sm">
              Converted
            </Text>
          </div>
        ) : (
          <Tooltip content={"Convert the Leads into User"}>
            {!auth && !access ? (
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
                lead={data}
                packages={packages}
                paymentModes={paymentModes}
                onConvert={refreshData}
                isValid={isValid}
                auth={auth}
                key={data.LeadId}
                // Add a key to force proper re-rendering of the component
              />
            )}
          </Tooltip>
        )}
        {/* </div> */}
        {!data.converted && (
          <Popover>
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
                    openPopoverId === data.LeadId ? null : data.LeadId
                  );
                }}
                className="action-icon-wrapper "
                variant="text"
              >
                <MoreVertical size="20" className="text-gray-700 " />
              </ActionIcon>
            </Popover.Trigger>
            <Popover.Content className="">
              {/* {openPopoverId === data.LeadId && ( */}
              <div className="flex flex-col justify-start items-start text-gray-900 ">
                <Button
                  variant="text"
                  disabled={data.converted}
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    setOpen(true);
                    setSelected(findDataIndex(data.LeadId));
                    setFunc("More");
                    setOpenPopoverId(null);
                  }}
                  className={showrestore ? "hidden" : ""}
                >
                  <PiPlus className="w-4 h-4 mr-2" /> Follow-up
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    setOpen(true);
                    setSelected(findDataIndex(data.LeadId));
                    setFunc("Edit");
                    setOpenPopoverId(null);
                  }}
                  className={showrestore ? "hidden" : ""}
                >
                  <Pencil className="w-4 h-4 mr-4" /> Edit
                </Button>
                {!auth && !access ? (
                  <Button
                    variant="text"
                    onClick={() => {
                      toast.error("You aren't allowed to make changes");
                    }}
                    className="flex hover:text-red-500 flex-row gap-2 items-center justify-start font-medium hover:scale-105 duration-300"
                  >
                    <MdDelete size={20} />
                    <Text>Delete</Text>
                  </Button>
                ) : (
                  <DeleteModal
                    id={data.LeadId}
                    onUpdate={() => {
                      refreshData();
                    }}
                    // restore={showrestore}
                    type="Visitors"
                  />
                )}
                {showrestore && (
                  <RestoreModal
                    id={data.LeadId}
                    onUpdate={() => {
                      refreshData();
                    }}
                    type="Visitors"
                  />
                )}
              </div>
              {/* )} */}
            </Popover.Content>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
