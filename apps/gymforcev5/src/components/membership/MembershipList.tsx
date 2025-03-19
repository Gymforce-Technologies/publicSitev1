"use client";
import BasicTableWidget from "@/components/controlled-table/basic-table-restructured";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Drawer,
  Empty,
  Input,
  Loader,
  Tab,
  Text,
  Textarea,
  Title,
  Tooltip,
} from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { getColumns } from "./columns";
import { getExpColumns } from "./exp-columns";
import { ArrowRight, FilterIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import toast from "react-hot-toast";
import { isStaff } from "@/app/[locale]/auth/Staff";
import dynamic from "next/dynamic";
import {
  Membership,
  SortProps,
} from "@/components/membership/section/Memberships";
import Link from "next/link";
import {
  MdManageAccounts,
  MdOutlineAddChart,
  MdOutlineGridView,
} from "react-icons/md";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "../table";
import cn from "@core/utils/class-names";
// import { DatePicker } from "@core/ui/datepicker";
import {
  formateDateValue,
  formatTimeValue,
  getTimeZoneVal,
} from "@/app/[locale]/auth/DateFormat";
import { PiClockClockwiseDuotone } from "react-icons/pi";
import PTCardList from "./pt/PTCardList";
import { FaList } from "react-icons/fa6";
import ExpCardList from "./exp/ExpCardList";
// import MembersCardList from "@/app/[locale]/(home)/members/_components/MembersCardList";
import MembershipCardList from "./MembershipCardList";
import SelectMemberSeat from "../member-list/members/SelectMemberSeat";
import { getLibColumns } from "./columns-lib";
import Image from "next/image";
// import  from "./AddTrainer";
// import { ExtendModal, PaymentModal, RenewModal } from "../member-list/Modals";
const ExtendModal = dynamic(
  () => import("../member-list/Modals").then((comp) => comp.ExtendModal),
  {
    ssr: false,
  }
);
const PaymentModal = dynamic(
  () => import("../member-list/Modals").then((comp) => comp.PaymentModal),
  {
    ssr: false,
  }
);
const RenewModal = dynamic(
  () => import("../member-list/Modals").then((comp) => comp.RenewModal),
  {
    ssr: false,
  }
);

const TransferMembership = dynamic(() => import("./Transfermembership"));
const UpgradeMembership = dynamic(() => import("./UpgradeMembership"));
const FreezeMembership = dynamic(() => import("./FreezeMembership"));
const AddonMembership = dynamic(() => import("./AddonMembership"));
const CancelMembership = dynamic(() => import("./CancelMembership"));
const UnfreezeMembership = dynamic(() => import("./UnfreezeMembership"));
const AddTrainer = dynamic(() => import("./AddTrainer"));

interface MembershipListProps {
  data: any[];
  type: string;
  hideInfo: boolean;
  fetchMemberships: () => Promise<void>;
  searchTerm: string;
  handleSearch: (value: string) => void;
  isLoading: boolean;
  onFilterClick: () => void;
  packageType: string;
  onHeaderSort: (headerKey: keyof Membership | null) => void;
  sort: SortProps;
}

export interface MangeData extends Membership {
  index: number;
  id: string;
  start_date: string;
  end_date: string;
  member_id: string;
  offer_price_amount: number;
  sessions: string;
  latest_session_details: {
    status: string;
    id: number;
    session_number: number;
    before_remarks?: string | null;
    after_remarks?: string | null;
  };
  // start_date:string;
  status: string;
  trainer: number | null;
  trainer_details: any | null;
}

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

export default function MembershipList({
  data,
  type,
  hideInfo,
  fetchMemberships,
  searchTerm,
  handleSearch,
  isLoading,
  onFilterClick,
  packageType,
  onHeaderSort,
  sort,
}: MembershipListProps) {
  const [demographicInfo, setDemographicInfo] = useState<any>(null);
  const [modalAction, setModalAction] = useState<
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
    | "Seat"
    | null
  >(null);
  const [activeMembershipId, setActiveMembershipId] = useState<string | null>(
    null
  );
  const [view, setView] = useState<"grid" | "table">("table");
  const [column, setColumn] = useState<keyof MangeData>("id");
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const [auth, setAuth] = useState<boolean>(true);
  const [staffType, setStaffType] = useState<string>("");
  const [isStaf, setIsStaf] = useState<boolean>(false);
  const [access, setAccess] = useState<boolean>(true);
  const [showManage, setShowManage] = useState<boolean>(false);
  const [showApprove, setShowApprove] = useState<boolean>(false);
  const [manageData, setManageData] = useState<MangeData[]>([]);
  const [action, setAction] = useState<
    "add" | "close" | "view" | "approve" | "history" | null
  >(null);
  const [selected, setSelected] = useState<MangeData | null>(null);
  const [desc, setDesc] = useState("");
  const [addSession, setAddSession] = useState<any>({
    membership_id: null,
    session_number: null,
    start_time: null,
    before_remarks: "",
  });
  const [endSession, setEndSession] = useState<any>({
    // membership_id: null,
    session_id: null,
    start_time: null,
    after_remarks: "",
  });
  const [isLoad, setIsLoad] = useState(false);
  const [SessionView, setSessionView] = useState<any>(null);
  const [approveView, setApproveView] = useState<any>(null);
  const [centerType, setCenterType] = useState(1);

  const approveSessionDetails = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/pt-session-approve/?gym_id=${gymId}`,
        {
          id: newID(`pt-membership-approvals-${new Date().getTime()}`),
        }
      );
      const TransformedData = resp.data.filter(
        (approval: any) => approval.membership === selected?.membership_id
      );
      setApproveView(TransformedData);
    } catch (error) {
      toast.error("Error Fetching Approvals");
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      console.log(parseInt(response.data?.center) + 1);
      setCenterType(parseInt(response.data?.center) + 1);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    const sessionDetails = async () => {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/get-pt-memberships/${selected?.membership_id}/?gym_id=${gymId}`,
        {
          id: newID(`pt-membership-${selected?.membership_id}`),
        }
      );
      setAction("view");
      setSessionView(resp.data);
      console.log(resp.data);
    };

    if (action === "view" && selected) {
      sessionDetails();
    } else if (action === "approve" && selected) {
      approveSessionDetails();
    }
  }, [action, selected]);

  const handleAction = useCallback(
    (
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
    ) => {
      setModalAction(action);
      setActiveMembershipId(membershipId);
    },
    []
  );

  const getOrdinalSuffix = (n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  useEffect(() => {
    const type = sessionStorage.getItem("staffType");
    setStaffType(type?.replace(/"/g, "").toLowerCase() || "");
    const isStaffVal = sessionStorage.getItem("isStaff");
    console.log(isStaffVal);
    setIsStaf(isStaffVal === "true");
  }, []);

  const formatDateTimeWithTimezone = async (timeString: string) => {
    // Get the custom timezone
    const timeZoneVal = await getTimeZoneVal();
    console.log("User TimeZone", timeZoneVal);

    // Parse the input time
    const [hours, minutes] = timeString.split(":").map(Number);

    // Create date object for today
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    // Get the timezone offset
    const offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneVal,
      timeZoneName: "shortOffset",
    });

    // Get and clean the timezone offset
    // const tzOffset = offsetFormatter.format(date).split(" ").pop() || "+00:00";
    // const cleanOffset = tzOffset
    //   .replace("GMT", "")
    //   .replace(
    //     /(\+|-)(\d{1,2})$/,
    //     (_, sign, num) => `${sign}${num.padStart(2, "0")}:00`
    //   );
    const tzOffset = offsetFormatter.format(date).split(" ").pop() || "+00:00";
    const cleanOffset = tzOffset
      .replace("GMT", "")
      .replace(
        /(\+|-)(\d{1,2})(?::?)(\d{2})?/,
        (_, sign, hours, minutes = "00") => {
          return `${sign}${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
        }
      );

    // Format the date components (using the input time directly)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(hours).padStart(2, "0"); // Use input hours directly
    const minute = String(minutes).padStart(2, "0"); // Use input minutes directly
    const second = "00";

    // Return the formatted string
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${cleanOffset}`;
  };

  const AddSession = async () => {
    try {
      setIsLoad(true);
      const data = {
        ...addSession,
        start_time: await formatDateTimeWithTimezone(addSession.start_time),
      };
      const gymId = await retrieveGymId();
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, (data as { [key: string]: any })[key].toString());
      });
      console.log(formData);
      const resp = await AxiosPrivate.post(
        `/api/pt-session-start/?gym_id=${gymId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then(() => {
        toast.success("Added Session Successfully");
        invalidateAll();
        getManageData();
        setSelected(null);
        setAction(null);
        setAddSession((prev: any) => {
          return {
            ...prev,
            session_number: null,
            start_time: null,
            before_remarks: "",
          };
        });
      });
    } catch (error) {
      toast.error("Error Adding Session");
    } finally {
      setIsLoad(false);
    }
  };

  const EndSession = async () => {
    try {
      setIsLoad(true);
      const data = {
        ...endSession,
        end_time: await formatDateTimeWithTimezone(endSession.end_time),
      };
      const gymId = await retrieveGymId();
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, (data as { [key: string]: any })[key].toString());
      });
      console.log(formData);
      const resp = await AxiosPrivate.post(
        `/api/pt-session-close/?gym_id=${gymId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then(() => {
        toast.success("Closed Session Successfully");
        invalidateAll();
        getManageData();
        setSelected(null);
        setAction(null);
        setEndSession((prev: any) => {
          return {
            ...prev,
            session_id: null,
            end_time: null,
            after_remarks: "",
          };
        });
      });
    } catch (error) {
      toast.error("Error Closing Session");
    } finally {
      setIsLoad(false);
    }
  };

  const getTitle = useMemo(() => {
    switch (type) {
      case "upcoming_renewal":
        return "Upcoming Membership Expiry";
      case "expired":
        return "Member's Expired";
      default:
        return "Membership List";
    }
  }, [type]);

  const addHistory = async () => {
    try {
      setIsLoad(true);
      const gymId = await retrieveGymId();
      const data = {
        membership_id: selected?.membership_id || "",
        description: desc,
      };
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, (data as { [key: string]: any })[key].toString());
      });
      const resp = await AxiosPrivate.post(
        `/api/pt-session-history/?gym_id=${gymId}`,
        formData
      ).then(() => {
        toast.success("History Added Successfully");
        invalidateAll();
        getManageData();
        setAction(null);
        setSelected(null);
        setDesc("");
      });
    } catch (error) {
      toast.error("Issues in Adding History");
    } finally {
      setIsLoad(false);
    }
  };

  const closeModal = useCallback(() => {
    setModalAction(null);
    setActiveMembershipId(null);
  }, []);

  const onUpdate = useCallback(() => {
    closeModal();
    fetchMemberships();
  }, [closeModal, fetchMemberships]);

  useEffect(() => {
    const getStatus = async () => {
      const resp = await isStaff();
      if (resp) {
        setAuth(!resp);
        await fetchPermissions();
      }
    };
    getStatus();
  }, []);

  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["mainMembershipManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  const getManageData = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/list-pt-memberships/?gym_id=${gymId}&filter_by=active`,
        {
          id: newID(`list-pt-memberships-${gymId}`),
        }
      );
      const transformedData = resp.data;

      const NewData = transformedData.map((item: any) => {
        const { sessions, ...found } = data.find(
          (element: any) => element.id === item.id
        );
        if (found) {
          return { ...item, ...found };
        }
        return item;
      });

      console.log(NewData);
      setManageData(NewData);
    } catch (error) {
      toast.error("Error Fetching Manage Data");
    }
  };

  useEffect(() => {
    if (showManage === true || showApprove === true) {
      getManageData();
    }
  }, [showManage, showApprove]);

  const currentColumns = useMemo(() => {
    return type === "upcoming_renewal" || type === "expired"
      ? getExpColumns
      : centerType === 2
        ? getLibColumns
        : getColumns;
  }, [type, centerType, auth, access]);

  const checkValidity = () => {
    if (!isValid) {
      toast.error("Please Subscribe to Proceed Further");
      if (auth) {
        router.push("/subscription/plans");
      }
      return;
    }
  };

  const memoizedGetColumns = useMemo(() => currentColumns, [currentColumns]);

  useEffect(() => {
    async function getInfo() {
      try {
        const infoData = await retrieveDemographicInfo();
        setDemographicInfo(infoData);
        console.log(infoData);
        checkUserAccess().then((status) => {
          console.log(status);
          if (status !== "Restricted") {
            setIsValid(true);
          } else {
            setIsValid(false);
          }
        });
      } catch (error) {
        console.error("Error fetching demographic info:", error);
      }
    }
    getInfo();
  }, []);

  const renderSearchAndFilter = () => (
    <div className="w-full flex max-sm:flex-col sm:justify-end sm:items-center gap-4">
      {type === "all" && packageType === "pt" && (
        <div className="flex items-center gap-4">
          <Button
            className="flex items-center gap-2 relative"
            variant={showManage ? "solid" : "flat"}
            onClick={() => {
              setShowManage(!showManage);
              if (!showManage) {
                setShowApprove(false);
              }
            }}
          >
            Manage <MdManageAccounts size={22} />
            <XIcon
              size={18}
              className={`${showManage ? "absolute" : "hidden"} peer top-[-24px] right-2 z-[999] text-primary cursor-pointer hover:scale-110 hover:text-red-400`}
              onClick={() => setShowManage(!showManage)}
            />
          </Button>

          <Button
            className={isStaf ? `hidden` : "flex items-center gap-2 relative"}
            variant={showApprove ? "solid" : "flat"}
            onClick={() => {
              setShowApprove(!showApprove);
              if (!showApprove) {
                setShowManage(false);
              }
            }}
          >
            Approve <IoCheckmarkDoneCircle size={20} />
            <XIcon
              size={18}
              className={`${showApprove ? "absolute" : "hidden"} peer top-[-24px] right-2  z-[999] text-primary cursor-pointer hover:scale-110 hover:text-red-400`}
              onClick={() => setShowManage(!showApprove)}
            />
          </Button>
        </div>
      )}
      <Input
        type="search"
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        clearable
        onClear={() => handleSearch("")}
        // className="max-w-[320px]"
      />
      <Button onClick={onFilterClick}>
        Filters <FilterIcon className="ml-2 max-sm:size-5" />
      </Button>
      <div className="hidden md:flex items-center border rounded-lg bg-gray-50 gap-1.5 p-1.5">
        <Button
          onClick={() => setView("grid")}
          size="sm"
          className={
            view !== "grid"
              ? `bg-primary-lighter text-primary hover:text-primary-lighter`
              : ""
          }
        >
          <MdOutlineGridView size={16} />
        </Button>
        <Button
          onClick={() => setView("table")}
          size="sm"
          className={
            view !== "table"
              ? `bg-primary-lighter text-primary hover:text-primary-lighter`
              : ""
          }
        >
          <FaList size={16} />
        </Button>
      </div>
    </div>
  );

  // Approve

  const Approve = async (session_id: number) => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/pt-session-approve/?gym_id=${gymId}`,
        {
          session_id,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then(() => {
        toast.success("Approved Succesfully");
        invalidateAll();
        getManageData();
        toast.success("Approved the Session for " + selected?.member_name);
        setIsLoad(false);
        approveSessionDetails();
        // setSelected(null);
      });
    } catch (error) {
      toast.error("Error Approving Session");
    }
  };

  // Manage Columns

  const getPTColumns = useCallback(
    (column: keyof MangeData) => [
      {
        title: <HeaderCell title="ID" className="text-sm font-semibold pl-1" />,
        dataIndex: "localid",
        key: "localid",
        width: 30,
        render: (localid: number) => (
          <Text className="sm:pl-1">#{localid}</Text>
        ),
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
                (sort.sortBy === "member_name" ? "text-primary" : "") +
                " size-4"
              }
            />
          </div>
        ),
        dataIndex: "member_name",
        key: "member_name",
        width: 200,
        render: (id: number, row: any) => (
          <figure className={cn("flex items-center gap-3 ")}>
            {/* <Avatar
              name={row.member_name}
              src={
                row.member_image ||
                (row?.gender && row?.gender[0]?.toLowerCase() === "f"
                  ? "https://images.gymforce.in/woman-user-circle-icon.png"
                  : "https://images.gymforce.in/man-user-circle-icon.png")
              }
            /> */}
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
              {/* yk$6372h$e */}
              <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
                <span className="flex flex-row gap-2 flex-nowrap items-center">
                  <Link href={`/member_profile/yk62-${row.member_id}-71he`}>
                    <Text className="text-nowrap text-clip">
                      {row.member_name}
                    </Text>
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
                          className="text-gray-900 bg-white  "
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
              <Text className="text-[13px] ">{row.member_phone}</Text>
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
      {
        title: (
          <HeaderCell className="text-sm font-semibold" title="Sessions" />
        ),
        dataIndex: "sessions",
        key: "sessions",
        width: 100,
        render: (sessions: string) => <Text className="pl-2">{sessions}</Text>,
      },
      {
        title: <HeaderCell className="text-sm font-semibold " title="Price" />,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: MangeData) => (
          <Text className="font-semibold">
            {demographicInfo.currency_symbol + " " + row.offer_price_amount}
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell className="text-sm font-semibold " title="Last Session" />
        ),
        dataIndex: "id",
        key: "id",
        width: 120,
        render: (id: number, row: MangeData) => (
          <Badge
            variant="flat"
            color={
              row.latest_session_details
                ? row.latest_session_details?.status === "Started"
                  ? "primary"
                  : row.latest_session_details?.status === "Completed"
                    ? "secondary"
                    : "success"
                : "warning"
            }
          >
            {row.latest_session_details?.status || "N/A"}
            {/*
                {row.latest_session_details?.status ? (
                  showManage && row.latest_session_details.status === "Approved" ? (
                    <IoMdCheckmarkCircle size={16}/>
                  ) : (
                    row.latest_session_details.status
                  )
                ) : (
                  "N/A"
                )} 
             */}
          </Badge>
        ),
      },
      {
        title: (
          <HeaderCell className="text-sm font-semibold " title="Trainer" />
        ),
        dataIndex: "trainer_details",
        key: "trainer_details",
        width: 100,
        render: (trainer_details: any) => (
          <Text>{trainer_details ? trainer_details.name : "N/A"}</Text>
        ),
      },
      {
        title: <HeaderCell title="Actions" className="opacity-0" />,
        dataIndex: "action",
        key: "action",
        width: 100,
        render: (_: any, row: MangeData) => (
          <div className="flex items-center justify-end gap-2">
            {showManage &&
              (row.latest_session_details &&
              row.latest_session_details?.status === "Started" ? (
                <Tooltip content="End Session">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (row.trainer === null) {
                        toast.error(
                          "Please Assign the Trainer from Profile Page"
                        );
                        return;
                      }
                      if (isStaf && !access) {
                        toast.error("You aren't allowed to make changes");
                        return;
                      }
                      setAction("close");
                      setSelected(row);
                      console.log(parseInt(row.sessions.split("|")[0]) + 1);
                      setEndSession({
                        membership_id: row.membership_id,
                        session_id: row.latest_session_details.id ?? 0,
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
                      if (row.trainer === null) {
                        toast.error(
                          "Please Assign the Trainer from Profile Page"
                        );
                        return;
                      }
                      if (isStaf && !access) {
                        toast.error("You aren't allowed to make changes");
                        return;
                      }
                      setAction("add");
                      setSelected(row);
                      console.log(parseInt(row.sessions.split("|")[0]) + 1);
                      setAddSession({
                        membership_id: row.membership_id,
                        session_number:
                          parseInt(row.sessions.split("|")[0]) + 1,
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
              (row.latest_session_details &&
              row.latest_session_details?.status !== "Completed" ? null : (
                // <div className="flex items-center gap-2">
                //   <Badge renderAsDot color="success" />
                //   <Text className="text-[13px] text-green-400">Approved</Text>
                // </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (isStaf && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    setAction("approve");
                    setSelected(row);
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
                    setAction("view");
                    setSelected(row);
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
                    if (isStaf && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                    }
                    setAction("history");
                    setSelected(row);
                  }}
                  className="cursor-pointer size-8 text-primary scale-105 "
                />
              </ActionIcon>
            </Tooltip>
          </div>
        ),
      },
    ],
    [showApprove, showManage, isStaf, manageData, access]
  );

  const columns = useMemo(() => getPTColumns(column), [column, getPTColumns]);
  const membershipColumns = useCallback(
    (props: any) =>
      memoizedGetColumns({
        ...props,
        demographicInfo,
        handleAction,
        data,
        checkValidity,
        onHeaderSort,
        sort,
        isStaff: isStaf,
        access: access,
      }),
    [
      memoizedGetColumns,
      demographicInfo,
      handleAction,
      data,
      checkValidity,
      onHeaderSort,
      sort,
      isStaf,
      access,
      centerType,
    ]
  );
  return (
    <WidgetCard
      className="relative dark:bg-inherit "
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
      title={getTitle}
      titleClassName="whitespace-nowrap "
      action={
        hideInfo ? (
          <Link
            href={
              type === "upcoming_renewal"
                ? "/membership/upcomming-expiry"
                : type === "expired"
                  ? "/membership/expired"
                  : "/membership/list"
            }
            className=" w-full  justify-end gap-1 items-center  hidden md:flex hover:text-primary"
          >
            View All <ArrowRight className="animate-pulse size-4 mx-1" />
          </Link>
        ) : (
          <div className="hidden md:block">{renderSearchAndFilter()}</div>
        )
      }
    >
      {hideInfo ? (
        <Link
          href={
            type === "upcoming_renewal"
              ? "/membership/upcomming-expiry"
              : type === "expired"
                ? "/membership/expired"
                : "/membership/list"
          }
          className=" w-full flex justify-end gap-1 items-center md:hidden hover:text-primary"
        >
          View All <ArrowRight className="animate-pulse size-4" />
        </Link>
      ) : (
        <div className="md:hidden mt-4 mb-2">{renderSearchAndFilter()}</div>
      )}
      <div
        className={
          (showApprove || showManage) && packageType === "pt" ? `hidden` : ""
        }
      >
        <div className="max-md:hidden">
          {view === "grid" ? (
            type === "upcoming_renewal" || type === "expired" ? (
              <ExpCardList
                data={data}
                checkValidity={checkValidity}
                handleAction={handleAction}
                demographicInfo={demographicInfo}
                type={type}
                auth={auth}
                access={access}
              />
            ) : (
              <MembershipCardList
                checkValidity={checkValidity}
                handleAction={handleAction}
                data={data}
                auth={auth}
                access={access}
                demographicInfo={demographicInfo}
              />
            )
          ) : (
            <BasicTableWidget
              title=""
              //@ts-ignore
              variant="nope"
              data={data}
              scroll={{ y: 500 }}
              getColumns={membershipColumns}
              enableSearch={false}
              isLoading={isLoading}
              className=" mt-4 md:mt-6 rounded-sm max-w-max [&_.rc-table-row:hover]:bg-gray-100 [&_.rc-table-thead_tr]:bg-gray-100"
            />
          )}
        </div>
        <div className="md:hidden">
          {type === "upcoming_renewal" || type === "expired" ? (
            <ExpCardList
              data={data}
              checkValidity={checkValidity}
              handleAction={handleAction}
              demographicInfo={demographicInfo}
              type={type}
              auth={auth}
              access={access}
            />
          ) : (
            <MembershipCardList
              checkValidity={checkValidity}
              handleAction={handleAction}
              data={data}
              demographicInfo={demographicInfo}
              auth={auth}
              access={access}
            />
          )}
        </div>
      </div>
      <div
        className={
          packageType === "pt" && (showApprove || showManage) ? "" : "hidden"
        }
      >
        <div className="max-md:hidden">
          {view === "grid" ? (
            <PTCardList
              data={manageData}
              isStaf={isStaf}
              onAction={setAction}
              showApprove={showApprove}
              showManage={showManage}
              demographicInfo={demographicInfo}
              setAddSession={setAddSession}
              setEndSession={setEndSession}
              setSelected={setSelected}
              auth={auth}
              access={access}
            />
          ) : (
            <Table
              variant="minimal"
              data={manageData}
              // @ts-ignore
              columns={columns}
              scroll={{ y: 500 }}
              className="text-sm mt-4 rounded-sm [&_.rc-table-row:hover]:bg-gray-50"
              // rowClassName="!dark:bg-inherit "
            />
          )}
        </div>
        <div className="md:hidden">
          <PTCardList
            data={manageData}
            isStaf={isStaf}
            onAction={setAction}
            showApprove={showApprove}
            showManage={showManage}
            demographicInfo={demographicInfo}
            setAddSession={setAddSession}
            setEndSession={setEndSession}
            setSelected={setSelected}
            auth={auth}
            access={access}
          />
        </div>
      </div>

      {modalAction === "Pay" && activeMembershipId && (
        <PaymentModal
          membershipid={activeMembershipId}
          func="Pay"
          onUpdate={onUpdate}
        />
      )}
      {modalAction === "Extend" && activeMembershipId && (
        <ExtendModal
          membershipId={activeMembershipId}
          onUpdate={onUpdate}
          due_date={
            data.find((item) => item.id === activeMembershipId)?.due_date
          }
        />
      )}
      {modalAction === "Renew" && activeMembershipId && (
        <RenewModal
          membershipId={activeMembershipId}
          func="Renew"
          onUpdate={onUpdate}
          package_type_val={packageType?.toLowerCase() || "all"}
          package_name=""
          end_date={
            data.find((item) => item.id === activeMembershipId)?.end_date || ""
          }
          member_id={
            data.find((item) => item.id === activeMembershipId)?.member_id
          }
        />
      )}
      {/* {modalAction === "Upgrade" && activeMembershipId && (
        <UpgradeMembership
          membershipId={activeMembershipId}
          onUpdate={onUpdate}
          closeModal={closeModal}
          package_type={
            data.find((item) => item.id === activeMembershipId)?.package_type
          }
          paid_amount={
            data.find((item) => item.id === activeMembershipId)?.paid_amount ||
            0
          }
          end_date={
            data.find((item) => item.id === activeMembershipId)?.end_date
          }
          member_image={
            data.find((item) => item.id === activeMembershipId)?.member_image
          }
          member_name={
            data.find((item) => item.id === activeMembershipId)?.member_name
          }
          member_id={
            data.find((item) => item.id === activeMembershipId)?.member_id
          }
        />
      )}
      {modalAction === "Freeze" && activeMembershipId && (
        <FreezeMembership
          membershipId={activeMembershipId}
          onUpdate={onUpdate}
          closeModal={closeModal}
        />
      )}
      {modalAction === "UnFreeze" && activeMembershipId && (
        <UnfreezeMembership
          membershipId={activeMembershipId}
          onUpdate={onUpdate}
          closeModal={closeModal}
        />
      )} */}
      {modalAction === "Cancel" && activeMembershipId && (
        <CancelMembership
          membershipId={activeMembershipId}
          onUpdate={onUpdate}
          closeModal={closeModal}
        />
      )}
      {modalAction === "Addon" && activeMembershipId && (
        <AddonMembership
          membershipId={activeMembershipId}
          onUpdate={onUpdate}
          closeModal={closeModal}
        />
      )}
      {modalAction === "addTrainer" && activeMembershipId && (
        <AddTrainer
          membershipId={activeMembershipId}
          onUpdate={onUpdate}
          closeModal={closeModal}
        />
      )}
      {modalAction === "Transfer" && activeMembershipId && (
        <TransferMembership
          membershipId={activeMembershipId}
          onUpdate={onUpdate}
          closeModal={closeModal}
          // paid_amount={data.find((item) => item.id === activeMembershipId)?.paid_amount || 0}
          end_date={
            data.find((item) => item.id === activeMembershipId)?.end_date
          }
          member_image={
            data.find((item) => item.id === activeMembershipId)?.member_image
          }
          member_name={
            data.find((item) => item.id === activeMembershipId)?.member_name
          }
        />
      )}
      {packageType === "pt" ? (
        <>
          {/* Add Session */}
          <Drawer
            isOpen={action === "add" && selected !== null}
            onClose={() => {
              setAction(null);
              setSelected(null);
            }}
            containerClassName="p-5 md:p-8 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <Title as="h4">
                Add {parseInt(selected?.sessions.split("|")[0] || "0") + 1}
                {getOrdinalSuffix(
                  parseInt(selected?.sessions.split("|")[0] || "0") + 1
                )}{" "}
                Session
              </Title>
              <XIcon
                onClick={() => {
                  setAction(null);
                  setSelected(null);
                }}
              />
            </div>
            <Text className="text-base font-bold">Add Start Time</Text>
            <Input
              type="time"
              value={addSession.start_time}
              onChange={(e) => {
                setAddSession((prev: any) => ({
                  ...prev,
                  start_time: e.target.value,
                }));
              }}
            />
            <Textarea
              label="Remarks"
              value={addSession.before_remarks}
              onChange={(e) => {
                setAddSession((prev: any) => ({
                  ...prev,
                  before_remarks: e.target.value,
                }));
              }}
            />
            <Button onClick={AddSession} className="mt-6">
              {isLoad ? <Loader variant="threeDot" /> : "Add"}
            </Button>
          </Drawer>

          {/* Sessions View */}
          <Drawer
            isOpen={action !== "approve" && action === "view" && SessionView}
            onClose={() => {
              setAction(null);
              setSelected(null);
              setSessionView(null);
            }}
            size="lg"
            containerClassName="p-5 md:p-8 flex flex-col gap-4 "
          >
            <div className="flex items-center justify-between">
              <Title as="h4">Session Details for {selected?.member_name}</Title>
              <XIcon
                onClick={() => {
                  setAction(null);
                  setSelected(null);
                  setSessionView(null);
                }}
              />
            </div>
            {SessionView !== null ? (
              <Tab>
                <Tab.List>
                  <Tab.ListItem>Session</Tab.ListItem>
                  <Tab.ListItem>History</Tab.ListItem>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel className="overflow-y-auto custom-scrollbar max-h-[80vh]">
                    <div className="flex flex-col ">
                      {SessionView.sessions.length ? (
                        SessionView.sessions.map((session: any) => (
                          <div
                            className="relative bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm 
                  hover:shadow-md transition-all duration-300 ease-in-out 
                  transform hover:-translate-y-1 
                  "
                            key={session.id}
                          >
                            <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                              <div className="flex gap-4 items-center">
                                <span className="text-gray-500  mr-2">
                                  S.No:
                                </span>
                                <span className="font-medium text-gray-800 ">
                                  {session.session_number}
                                </span>
                              </div>
                              <div className="flex gap-4 items-center text-right">
                                <span className="text-gray-500  mr-2">
                                  Date:
                                </span>
                                <span className="font-medium text-gray-800 ">
                                  {formateDateValue(
                                    new Date(session.start_time)
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2 text-sm border-gray-100 ">
                              <div className="flex gap-4 items-center">
                                <span className="text-gray-500  mr-2">
                                  Started:
                                </span>
                                <span className="font-medium text-gray-800 ">
                                  {formatTimeValue(session.start_time)}
                                </span>
                              </div>
                              <div className="flex gap-4 items-center text-right">
                                <span className="text-gray-500  mr-2">
                                  Ended:
                                </span>
                                <span className="font-medium text-gray-800 ">
                                  {session.status === "Started"
                                    ? "Still Ongoing"
                                    : formatTimeValue(session.end_time)}
                                </span>
                              </div>
                            </div>
                            <div
                              className="grid grid-cols-2 gap-2 text-sm border-t pt-2 
                      border-gray-100 "
                            >
                              <div className="flex gap-4 items-center">
                                <span className="text-gray-500  mr-2">
                                  Duration:
                                </span>
                                <span className="font-semibold text-gray-700 ">
                                  {session.status === "Started"
                                    ? "N/A"
                                    : session.duration}
                                </span>
                              </div>
                              <div className="flex gap-4 items-center text-right">
                                <span className="text-gray-500  mr-2">
                                  Status:
                                </span>
                                <span
                                  className={`font-semibold ${
                                    session.status === "Approved"
                                      ? "text-green-600 "
                                      : session.status === "Completed"
                                        ? "text-yellow-600 "
                                        : "text-red-600 "
                                  }`}
                                >
                                  {session.status}
                                </span>
                              </div>
                              <div className="flex mx-2">
                                <Badge
                                  variant="outline"
                                  className="flex gap-4 items-center"
                                >
                                  <span className="col-start-2  mr-2">
                                    Trainer:
                                  </span>
                                  <span className=" ">
                                    {session?.trainer_details
                                      ? session.trainer_details?.name
                                      : "N/A"}
                                  </span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex min-w-full items-center mt-4 justify-center">
                          <Empty text="No Sessions for this Member" />
                        </div>
                      )}
                    </div>
                  </Tab.Panel>
                  <Tab.Panel className="overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col overflow-y-auto custom-scrollbar min-h-[80vh]">
                      {SessionView.history.length ? (
                        SessionView.history.map((session: any) => (
                          <div
                            className="relative bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm 
                  hover:shadow-md transition-all duration-300 ease-in-out 
                  transform hover:-translate-y-1 
                  "
                            key={session.id}
                          >
                            <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                              <div className="flex gap-4 items-center">
                                <span className="text-gray-500  mr-2">
                                  Date:
                                </span>
                                <span className="font-medium text-gray-800 ">
                                  {formateDateValue(
                                    new Date(session.created_at)
                                  )}
                                </span>
                              </div>
                            </div>
                            <div
                              className="grid grid-cols-2 gap-2 text-sm border-t pt-2 
                      border-gray-100 "
                            >
                              <div className="flex gap-4 items-center">
                                <span className="text-gray-500  mr-2">
                                  Info:
                                </span>
                                <span className="font-semibold text-gray-700 ">
                                  {session.description}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex min-w-full items-center mt-4 justify-center">
                          <Empty text="No History for this Member" />
                        </div>
                      )}
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab>
            ) : (
              <div className="flex min-w-full items-center mt-4 justify-center">
                <Loader variant="threeDot" size="xl" />
              </div>
            )}
          </Drawer>

          {/* Close Session */}
          <Drawer
            isOpen={action === "close" && selected !== null}
            onClose={() => {
              setAction(null);
              setSelected(null);
            }}
            containerClassName="p-5 md:p-8 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <Title as="h4">
                End {parseInt(selected?.sessions.split("|")[0] || "0") + 1}
                {getOrdinalSuffix(
                  parseInt(selected?.sessions.split("|")[0] || "0") + 1
                )}{" "}
                Session
              </Title>
              <XIcon
                onClick={() => {
                  setAction(null);
                  setSelected(null);
                }}
              />
            </div>
            <Text className="text-base font-bold">Session End Time</Text>
            <Input
              type="time"
              value={endSession.end_time}
              onChange={(e) => {
                setEndSession((prev: any) => ({
                  ...prev,
                  end_time: e.target.value,
                }));
              }}
            />
            <Textarea
              label="Remarks"
              value={endSession.after_remarks}
              onChange={(e) => {
                setEndSession((prev: any) => ({
                  ...prev,
                  after_remarks: e.target.value,
                }));
              }}
            />
            <Button onClick={EndSession} className="mt-6">
              {isLoad ? <Loader variant="threeDot" /> : "Close"}
            </Button>
          </Drawer>
          {/* Sessions View */}
          <Drawer
            isOpen={action === "approve"}
            onClose={() => {
              setAction(null);
              setSelected(null);
              setSessionView(null);
            }}
            size="lg"
            containerClassName="p-5 md:p-8 flex flex-col gap-4 "
          >
            <div className="flex items-center justify-between">
              <Title as="h4">
                Approve Sessions for {selected?.member_name}
              </Title>
              <XIcon
                onClick={() => {
                  setAction(null);
                  setSelected(null);
                  setSessionView(null);
                }}
              />
            </div>
            {approveView !== null ? (
              <div className="flex flex-col overflow-y-auto custom-scrollbar">
                {approveView.length ? (
                  approveView.map((session: any) => (
                    <div
                      className="relative bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm 
                  hover:shadow-md transition-all duration-300 ease-in-out 
                  transform hover:-translate-y-1 
                  "
                      key={session.id}
                    >
                      <div
                        className="grid grid-cols-2 gap-3 text-sm pt-2 
                      "
                      >
                        <div className="flex gap-4 items-center">
                          <span className="text-gray-500  mr-2">S.No:</span>
                          <span className="font-medium text-gray-800 ">
                            {session.session_number}
                          </span>
                        </div>
                        <div className="flex gap-4 items-center text-right">
                          <span className="text-gray-500  mr-2">Date:</span>
                          <span className="font-medium text-gray-800 ">
                            {formateDateValue(new Date(session.start_time))}
                          </span>
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-2 gap-2 text-sm border-t pt-2 
                      border-gray-100 "
                      >
                        <div className="flex gap-4 items-center">
                          <span className="text-gray-500  mr-2">Duration:</span>
                          <span className="font-semibold text-gray-700 ">
                            {session.status === "Started"
                              ? "N/A"
                              : session.duration}
                          </span>
                        </div>
                        <div className="flex gap-4 items-center text-right">
                          <span className="text-gray-500  mr-2">Status:</span>

                          <Badge
                            variant="flat"
                            color={
                              session.status === "Started"
                                ? "primary"
                                : session.status === "Completed"
                                  ? "secondary"
                                  : "success"
                            }
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className="flex items-center w-1/2  max-sm:gap-4 sm:justify-between mx-2 text-sm border-t pt-2 
                      border-gray-100 "
                      >
                        <Badge
                          variant="outline"
                          className="flex gap-4 items-center place-self-start"
                        >
                          <span className="col-start-2  mr-2">Trainer:</span>
                          <span className=" ">
                            {session?.trainer_details
                              ? session.trainer_details?.name
                              : "N/A"}
                          </span>
                        </Badge>
                        <Button
                          onClick={async () => {
                            await Approve(session.id ?? 0);
                          }}
                          size="sm"
                          className="place-self-center"
                        >
                          {isLoad ? <Loader variant="threeDot" /> : "Approve"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex min-w-full items-center mt-4 justify-center">
                    <Empty text="All Sessions are Approved" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-w-full items-center mt-4 justify-center">
                <Loader variant="threeDot" size="xl" />
              </div>
            )}
          </Drawer>
          {/* Add History */}
          <Drawer
            isOpen={action === "history" && selected !== null}
            onClose={() => {
              setAction(null);
              setSelected(null);
            }}
            containerClassName="p-5 md:p-8 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <Title as="h4">Add History for {selected?.member_name}</Title>
              <XIcon
                onClick={() => {
                  setAction(null);
                  setSelected(null);
                }}
              />
            </div>
            <Textarea
              label="Info"
              placeholder="Add Info About the Training Sessions"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
              }}
            />
            <Button onClick={addHistory} className="mt-6">
              {isLoad ? <Loader variant="threeDot" /> : "Add"}
            </Button>
          </Drawer>
        </>
      ) : null}
      {modalAction === "Seat" && activeMembershipId ? (
        <SelectMemberSeat
          show={modalAction === "Seat"}
          onClose={closeModal}
          batch={
            data.find((item) => item.id === activeMembershipId)?.batch_timing
          }
          seat={data.find((item) => item.id === activeMembershipId)?.seat}
          membership_id={
            data.find((item) => item.id === activeMembershipId)?.membership_id
          }
          onUpdate={onUpdate}
        />
      ) : null}
    </WidgetCard>
  );
}
