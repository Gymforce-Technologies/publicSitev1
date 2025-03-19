import { ActionIcon, Avatar, Badge, Button, cn, Popover, Text } from "rizzui";
import { Member } from "../MemberListSection";
import Link from "next/link";
import {
  MdCancel,
  MdEdit,
  MdOutlineBookmark,
  MdOutlineChangeCircle,
  MdOutlineDateRange,
  MdPayments,
} from "react-icons/md";
import { FaClockRotateLeft, FaUserPlus } from "react-icons/fa6";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import getDueBadge from "@/components/dueBadge";
import { Dispatch, SetStateAction } from "react";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import { FaPhoneAlt } from "react-icons/fa";
import { MoreVertical } from "lucide-react";
import { RiFileAddFill, RiLoopLeftLine } from "react-icons/ri";
import { BiLayerPlus } from "react-icons/bi";
import toast from "react-hot-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { IoMdArrowDropupCircle } from "react-icons/io";
import Image from "next/image";
import dynamic from "next/dynamic";
const WaModal = dynamic(() => import("../../wa-template/WaModal"));
const DeleteModal = dynamic(() =>
  import("../Modals").then((com) => com.DeleteModal)
);
const RestoreModal = dynamic(() =>
  import("../Modals").then((com) => com.RestoreModal)
);
const AddMemberFollowup = dynamic(
  () => import("../MemberFollowUp").then((com) => com.AddMemberFollowup),
  {
    ssr: false,
  }
);

export default function MemberCard({
  data,
  openPopoverId,
  setOpenPopoverId,
  demographiInfo,
  setFunc,
  fetchMemberData,
  pageNumber,
  setSelectedRow,
  restore,
  isValid,
  staffType,
  isStaf,
  setAddMembership,
  auth,
  router,
  access,
}: {
  data: Member;
  staffType: string;
  isStaf: boolean;
  setAddMembership: React.Dispatch<React.SetStateAction<boolean>>;
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
  auth: boolean;
  router: AppRouterInstance;
  access: boolean;
}) {
  return (
    <div className="grid gap-3 lg:gap-4 border rounded-xl p-4 sm:p-6 max-w-sm">
      <div className="grid grid-cols-[1fr,auto]">
        <figure className={cn("flex items-center gap-3")}>
          <Image
            alt={data.name}
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
              {/* yk$6372h$e */}
              <Text className="font-lexend text-sm font-medium text-nowrap text-clip text-gray-900 hover:text-primary">
                {data.name}
              </Text>
            </Link>
            <Text className="text-[13px] ">{data.phone}</Text>
          </figcaption>
        </figure>
        <Text className={`font-medium text-gray-700 self-center mx-4`}>
          {data.status === "active" ? (
            <Badge color="success" variant="flat">
              Active
            </Badge>
          ) : data.status === "expired" ? (
            <Badge color="danger" variant="flat">
              Expired
            </Badge>
          ) : data.status === "upcoming" ? (
            <Badge color="secondary" variant="flat">
              Upcoming
            </Badge>
          ) : null}
        </Text>
      </div>
      <div className="mx-2 flex items-center gap-2">
        <MdOutlineBookmark size={20} className="text-primary" />
        <Text
          className={`font-medium text-gray-700  capitalize max-w-40 truncate`}
        >
          {data.package_name ? data.package_name : "N/A"}
        </Text>
      </div>
      <div className="mx-2 flex items-center gap-3">
        <FaClockRotateLeft size={18} className="text-primary" />
        <DateCell
          date={new Date(data.exp_date)}
          dateFormat={getDateFormat()}
          timeClassName="hidden"
          // dateClassName="dark:text-gray-400"
        />
      </div>
      <div className="flex items-center gap-3 lg:gap-6 mx-4 ">
        <Text>
          {getDueBadge({
            dueAmount: data.due,
            symbol: demographiInfo?.currency_symbol || "₹",
          })}
        </Text>
        <Link
          href={`tel:${data.phone}`}
          className="hover:text-primary hover:scale-110 duration-150"
        >
          <FaPhoneAlt size={18} />
        </Link>
        {/* <Link
            href={`https://wa.me/${data.phone}?text=Hi ${data.name}`}
            target="_blank"
            className="hover:text-primary hover:scale-110 duration-150"
          >
            <PiWhatsappLogoBold size={20} />
          </Link> */}
        <WaModal id={data.member_id} number={data.phone} />
        <div className="w-full flex items-center justify-end">
          <Popover
            isOpen={openPopoverId === data.member_id}
            setIsOpen={(isOpen) =>
              setOpenPopoverId(isOpen ? data.member_id : null)
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
                    openPopoverId === data.member_id ? null : data.member_id
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
                    setOpenPopoverId(data.member_id);
                    setSelectedRow(data);
                  }}
                  className={` ${restore ? "hidden" : ""} flex flex-data gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdEdit size={18} />
                  <Text>Edit</Text>
                </Button>
                {!isStaf || (isStaf && !auth && access) ? (
                  <AddMemberFollowup
                    memberId={data.member_id}
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

                {data.membership_id ? (
                  <>
                    {data.due > 0 && (
                      <Button
                        variant="text"
                        onClick={() => {
                          if (isStaf && !auth && !access) {
                            toast.error("You aren't allowed to make changes");
                            return;
                          }
                          setFunc("Pay");
                          setOpenPopoverId(data.member_id);
                          setSelectedRow(data);
                        }}
                        className={` ${restore ? "hidden" : ""} flex flex-data gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                      >
                        <MdPayments size={20} />
                        <Text>Pay Dues</Text>
                      </Button>
                    )}
                    {data.due > 0 && (
                      <Button
                        variant="text"
                        onClick={() => {
                          if (isStaf && !auth && !access) {
                            toast.error("You aren't allowed to make changes");
                            return;
                          }
                          setFunc("Extend");
                          setOpenPopoverId(data.member_id);
                          setSelectedRow(data);
                        }}
                        className={` ${restore ? "hidden" : ""} flex flex-data gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                      >
                        <MdOutlineDateRange size={20} />
                        <Text>Extend Due Date</Text>
                      </Button>
                    )}
                    <Button
                      variant="text"
                      onClick={() => {
                        if (data.due) {
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
                        setOpenPopoverId(data.member_id);
                        setSelectedRow(data);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-data gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <RiLoopLeftLine size={20} />
                      <Text>Renew</Text>
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        if (data.due) {
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
                        setOpenPopoverId(data.member_id);
                        setSelectedRow(data);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-data gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <IoMdArrowDropupCircle size={20} />
                      <Text>Upgrade</Text>
                    </Button>

                    <Button
                      variant="text"
                      onClick={() => {
                        if (data.due) {
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
                        setOpenPopoverId(data.member_id);
                        setSelectedRow(data);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-data gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                    >
                      <BiLayerPlus size={20} />
                      <Text>Addon Days</Text>
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        if (data.due) {
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
                        setOpenPopoverId(data.member_id);
                        setSelectedRow(data);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-data gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
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
                        setOpenPopoverId(data.member_id);
                        setSelectedRow(data);
                      }}
                      className={` ${restore ? "hidden" : ""} flex flex-data gap-2 items-center hover:text-red-500 justify-start font-medium hover:scale-105 duration-300`}
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
                      setSelectedRow(data);
                    }}
                    className={`flex flex-data gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                  >
                    <RiFileAddFill size={18} />
                    <Text>Add Membership</Text>
                  </Button>
                )}

                {restore ? (
                  <RestoreModal
                    id={data.member_id}
                    onUpdate={() => {
                      fetchMemberData(1);
                    }}
                    type="Member"
                  />
                ) : !isStaf || (isStaf && !auth && access) ? (
                  <DeleteModal
                    id={data.member_id}
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
      </div>
    </div>
  );
}
