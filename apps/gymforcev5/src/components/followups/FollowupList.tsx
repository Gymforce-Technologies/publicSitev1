"use client";

import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import WidgetCard from "@/components/cards/widget-card";
import ControlledTable from "@/app/shared/controlled-table";
import { HeaderCell } from "@/app/shared/table";
import {
  Text,
  Checkbox,
  ActionIcon,
  Popover,
  Button,
  Input,
  Tooltip,
  Badge,
  Loader,
  Select,
  Avatar,
  cn,
} from "rizzui";
import DateCell from "@core/ui/date-cell";
import { ArrowRight, FilterIcon, MoreVertical } from "lucide-react";
import { PiClockClockwiseBold, PiPlus } from "react-icons/pi";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { FollowUpType, MemberFollowUp } from "./FollowUps";
import Pagination from "@core/ui/pagination";
// import { Data } from '../Leads';
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

import dynamic from "next/dynamic";
import { pageSizeOptions, setPageSize } from "@/components/pageSize";
import Link from "next/link";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { MdModeEdit, MdOutlineGridView } from "react-icons/md";
import { IoSettings } from "react-icons/io5";
import { FaList } from "react-icons/fa6";
import FollowUpCardList from "./FollowUpCardList";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import Image from "next/image";
import ImageCard from "../ImageCard";

const LeadConvert = dynamic(() => import("../leads/LeadConvert"), {
  ssr: false,
});
const EditFollowUp = dynamic(() => import("./EditFollowUp"), {
  ssr: false,
});
const AddFollowupHistory = dynamic(() => import("./AddHistory"), {
  ssr: false,
});
const ViewHistory = dynamic(() => import("./ViewHistory"));
const EditFollowUpLead = dynamic(() => import("./EditFollowUpLead"), {
  ssr: false,
});
const Configs = dynamic(() => import("./Configs"));

interface Package {
  label: string;
  value: number;
  min_price: number;
  max_price: number;
  num_of_days: number;
}

export default function FollowupList({
  followUp,
  className,
  hideInfo,
  title,
  onPageChange,
  onFilterClick,
  refreshData,
  handleSearch,
  LoadingState,
  pageSizeVal,
  setPageSizeVal,
  followUpType,
  setFollowUpType,
  memberFollowUp,
}: {
  followUp: FollowUpType[];
  className?: string;
  hideInfo?: boolean;
  title?: string;
  onPageChange: (page: number) => void;
  onFilterClick: () => void;
  refreshData: () => void;
  handleSearch: (value: string) => void;
  LoadingState: boolean;
  pageSizeVal: number | null;
  setPageSizeVal: Dispatch<SetStateAction<number | null>>;
  followUpType: "Enq" | "Member";
  setFollowUpType: Dispatch<SetStateAction<"Enq" | "Member">>;
  memberFollowUp: MemberFollowUp[] | null;
}) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [paymentModes, setPaymentModes] = useState<
    { label: string; value: number }[]
  >([]);

  const [search, setSearch] = useState<string>("");
  const [totalFollowUps, setTotalFollowUps] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // const recordsPerPage = 10;
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(true);
  const [openMemberId, setOpenMemberId] = useState<number | null>(null);
  const [action, setAction] = useState<
    "view" | "edit" | "new" | "editLead" | null
  >(null);

  const [selectedEnq, setSelectedEnq] = useState<FollowUpType | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const fetchPackagesAndPaymentModes = useCallback(async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/master-packages/?gym_id=${gymId}`,
        {
          id: newID(`master-packages`),
        }
      );
      // console.log(resp.data)
      const packageData = resp.data.results
        .filter((item: any) => !item.deleted)
        .map((item: any) => ({
          label: `${item.name}`,
          value: item.id,
          min_price: item.min_price,
          max_price: item.max_price,
          num_of_days: item.num_of_days,
        }));
      setPackages(packageData);
      const paymentModesResp = await AxiosPrivate.get(
        `/api/payment-modes/list_favorite/?gym_id=${gymId}`,
        {
          id: newID(`payment-modes`),
        }
      );
      setPaymentModes(
        paymentModesResp.data.map((mode: any) => ({
          label: mode.name,
          value: mode.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching packages and payment modes:", error);
    }
  }, []);
  const getStatus = async () => {
    const resp = await isStaff();
    if (resp) {
      setAuth(!resp);
      await fetchPermissions();
    }
    checkUserAccess().then((status) => {
      console.log(status);
      if (status !== "Restricted") {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    });
  };
  useEffect(() => {
    fetchPackagesAndPaymentModes();
    getStatus();
  }, [fetchPackagesAndPaymentModes]);

  const handleSelectAll = () => {
    const dataToCheck =
      followUpType === "Enq" ? followUp : memberFollowUp || [];
    console.log("dataToCheck", dataToCheck);
    // If all items are currently checked, uncheck all
    if (checkedItems.length === dataToCheck.length) {
      setCheckedItems([]);
    } else {
      // Otherwise, check all items
      const idVals = dataToCheck.map((item) => {
        // For Enquiry type, use lead.id
        // For Member type, use id directly
        return followUpType === "Enq" ? item.lead.leadId : item.id.toString();
      });
      console.log("idVals", idVals);
      setCheckedItems(idVals);
    }
  };
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
      // setPermissions(response.data.permissions || {});
      const isEnquiry =
        response.data.permissions["mainEnquiryManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };
  const [view, setView] = useState<"grid" | "table">("table");

  const onChecked = (id: string) => {
    setCheckedItems((prevCheckedItems) =>
      prevCheckedItems.includes(id)
        ? prevCheckedItems.filter((checkedId) => checkedId !== id)
        : [...prevCheckedItems, id]
    );
  };

  const getColumns = useCallback(
    ({ data }: { data: any[] }) => [
      {
        title: (
          <div className="inline-flex ">
            <Checkbox
              title={"Select All"}
              onChange={handleSelectAll}
              checked={checkedItems.length === followUp.length}
              className="cursor-pointer"
            />
          </div>
        ),
        dataIndex: "id",
        key: "id",
        width: 30,
        render: (id: any, row: FollowUpType) => (
          <div className="inline-flex ">
            <Checkbox
              className="cursor-pointer"
              checked={checkedItems.includes(row.lead.LeadId)}
              onChange={() => onChecked(row.lead.LeadId)}
            />
          </div>
        ),
      },
      {
        title: <HeaderCell title="ID" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 30,
        render: (id: any) => <Text>#{id}</Text>,
      },
      {
        title: <HeaderCell title="Name" className=" text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (_: any, row: FollowUpType) => (
          <ImageCard
            src={
              row.lead?.visitor_image || row?.lead?.gender !== null
                ? row.lead?.gender &&
                  row?.lead?.gender?.charAt(0)?.toLowerCase() === "f"
                  ? WomanIcon
                  : ManIcon
                : "/placeholder.jpg"
            }
            name={row.lead.name || "N/A"}
            description={row.lead.phone}
            // className="dark:*:text-gray-200"
          />
        ),
      },
      {
        title: (
          <HeaderCell title="Reminder" className=" text-sm font-semibold" />
        ),
        dataIndex: "next_followup_reminder",
        key: "next_followup_reminder",
        width: 120,
        render: (date: string | null) =>
          date ? (
            <DateCell
              date={new Date(date)}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
              dateClassName="text-gray-900"
            />
          ) : (
            <Text>N/A</Text>
          ),
      },
      {
        title: <HeaderCell title="Status" className=" text-sm font-semibold" />,
        dataIndex: "status",
        key: "status",
        width: 100,
      },
      {
        title: (
          <HeaderCell title="Response..." className=" text-sm font-semibold" />
        ),
        dataIndex: "comment",
        key: "comment",
        width: 180,
      },
      {
        title: (
          <HeaderCell title="Contact By" className=" text-sm font-semibold" />
        ),
        dataIndex: "contacted_by",
        key: "contacted_by",
        width: 150,
        render: (_: any, row: FollowUpType) => (
          <div className="grid grid-cols-1 text-sm">
            {row.managed_by ? (
              <>
                <Text>{row.managed_by.name}</Text>
                <Text>
                  {row.managed_by.staff_type_name +
                    " (" +
                    row.contact_type +
                    ")"}
                </Text>
              </>
            ) : (
              <Text>N/A</Text>
            )}
          </div>
        ),
      },
      {
        title: "",
        dataIndex: "actions",
        key: "actions",
        width: 50,
        render: (_: any, row: FollowUpType) => (
          <div className="flex items-center gap-3 justify-start">
            {row.member !== null ? (
              <div className="flex items-center">
                <Badge color="success" renderAsDot />
                <Text className="ms-1 font-medium text-green-dark text-sm">
                  Converted
                </Text>
              </div>
            ) : (
              // </div> //   </Text> //     Converted //   <Text className="ms-1 font-medium text-green-dark text-sm"> //   <Badge color="success" renderAsDot /> // <div className="flex items-center">
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
                    lead={row.lead}
                    packages={packages}
                    paymentModes={paymentModes}
                    onConvert={refreshData}
                    isValid={isValid}
                    auth={auth}
                    key={row.lead.id}
                  />
                )}
              </Tooltip>
            )}
            <Tooltip content="View History" placement="bottom">
              <div
                onClick={() => {
                  setAction("view");
                  setOpenMemberId(row.id);
                }}
              >
                <PiClockClockwiseBold className="size-[22px] text-primary hover:scale-105 duration-150" />
              </div>
            </Tooltip>
            {row.member !== null ? null : (
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
                        openPopoverId === row.lead.id.toString()
                          ? null
                          : row.lead.id.toString()
                      );
                    }}
                    className="action-icon-wrapper"
                    variant="text"
                  >
                    <MoreVertical size="20" />
                  </ActionIcon>
                </Popover.Trigger>
                <Popover.Content className="">
                  <div className="flex flex-col text-gray-900 items-start ">
                    <Button
                      variant="text"
                      onClick={() => {
                        // if (!auth) {
                        if (!auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                          // }
                        }
                        setSelectedEnq(row);
                        setAction("new");
                        setOpenMemberId(row.id);
                      }}
                    >
                      <PiPlus className="w-4 h-4 mr-2" /> Add
                    </Button>

                    <Button
                      variant="text"
                      onClick={() => {
                        if (!auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                          // }
                        }
                        setAction("editLead");
                        setOpenMemberId(row.id);
                      }}
                    >
                      <MdModeEdit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  </div>
                </Popover.Content>
              </Popover>
            )}
          </div>
        ),
      },
    ],
    [
      handleSelectAll,
      openPopoverId,
      packages,
      paymentModes,
      followUpType,
      memberFollowUp,
      followUp,
      access,
      auth,
    ]
  );

  const getMemberColumns = useCallback(
    ({ data }: { data: any[] }) => [
      {
        title: (
          <div className="inline-flex ">
            <Checkbox
              title={"Select All"}
              onChange={handleSelectAll}
              checked={checkedItems.length === followUp.length}
              className="cursor-pointer"
            />
          </div>
        ),
        dataIndex: "id",
        key: "id",
        width: 30,
        render: (id: number) => (
          <div className="inline-flex ">
            <Checkbox
              className="cursor-pointer"
              checked={checkedItems.includes(id.toString())}
              onChange={() => onChecked && onChecked(id.toString())}
            />
          </div>
        ),
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (_: any, row: MemberFollowUp) => (
          <figure className={cn("flex items-center gap-3 ")}>
            <Image
              alt={row.member?.name || "N/A"}
              src={
                row.member?.member_image ||
                (row?.member?.gender &&
                row?.member?.gender?.charAt(0)?.toLowerCase() === "f"
                  ? WomanIcon
                  : ManIcon)
              }
              height={40}
              width={40}
              className="size-10 rounded-full"            />
            <figcaption className="grid gap-0.5">
              {/* yk$6372h$e */}
              <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
                <span className="flex flex-row gap-2 flex-nowrap items-center">
                  <Link href={`/member_profile/yk62-${row.member?.id}-71he`}>
                    <Text className="text-nowrap text-clip">
                      {row.member?.name || ""}
                    </Text>
                  </Link>
                </span>
              </Text>
              <Text className="text-[13px] dark:text-gray-400">
                {row.member?.phone}
              </Text>
            </figcaption>
          </figure>
          // <AvatarCard
          //   src={
          //     row.member?.member_image ||
          //     (row.member?.gender === "male"
          //       ? ManIcon
          //       : WomanIcon)
          //   }
          //   name={row?.member?.name || "N/A"}
          //   description={row.member?.phone}
          // />
        ),
      },
      {
        title: <HeaderCell title="Contact" className="text-sm font-semibold" />,
        dataIndex: "contact_type",
        key: "contact_type",
        width: 100,
        render: (contact_type: string) =>
          contact_type !== "N/A" ? <Text>{contact_type}</Text> : null,
      },
      {
        title: <HeaderCell title="Status" className="text-sm font-semibold" />,
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => <Badge variant="flat">{status}</Badge>,
      },
      {
        title: <HeaderCell title="Purpose" className="text-sm font-semibold" />,
        dataIndex: "purpose",
        key: "purpose",
        width: 150,
      },
      {
        title: (
          <HeaderCell title="Reminder" className="text-sm font-semibold" />
        ),
        dataIndex: "next_followup_reminder",
        key: "next_followup_reminder",
        width: 100,
        render: (date: string) =>
          date ? (
            <DateCell
              date={new Date(date)}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
              dateClassName="text-gray-900"
            />
          ) : (
            <Text>N/A</Text>
          ),
      },
      {
        title: (
          <HeaderCell title="Priority" className="text-sm font-semibold" />
        ),
        dataIndex: "priority",
        key: "priority",
        width: 100,
      },
      {
        title: <></>,
        dataIndex: "actions",
        key: "actions",
        width: 50,
        render: (_: any, row: MemberFollowUp) => (
          <div className="flex items-center gap-2">
            <Tooltip content="View History" placement="bottom">
              <div>
                <PiClockClockwiseBold
                  className="size-6 text-primary hover:scale-105 duration-150"
                  onClick={() => {
                    setAction("view");
                    setOpenMemberId(row.id);
                  }}
                />
              </div>
            </Tooltip>
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
                  }}
                  className="action-icon-wrapper"
                  variant="text"
                >
                  <MoreVertical size="20" />
                </ActionIcon>
              </Popover.Trigger>
              <Popover.Content className="">
                <div className="flex flex-col text-gray-900 items-start ">
                  <Button
                    variant="text"
                    onClick={() => {
                      if (!auth && !access) {
                        toast.error("You aren't allowed to make changes");
                        return;
                        // }
                      }
                      setAction("new");
                      setOpenMemberId(row.id);
                    }}
                  >
                    <PiPlus className="w-4 h-4 mr-2" /> Add
                  </Button>

                  <Button
                    variant="text"
                    onClick={() => {
                      if (!auth && !access) {
                        toast.error("You aren't allowed to make changes");
                        return;
                        // }
                      }
                      setAction("edit");
                      setOpenMemberId(row.id);
                    }}
                  >
                    <MdModeEdit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </div>
              </Popover.Content>
            </Popover>
          </div>
        ),
      },
    ],
    [
      handleSelectAll,
      openPopoverId,
      packages,
      paymentModes,
      followUpType,
      memberFollowUp,
      followUp,
      access,
      auth,
    ]
  );

  useEffect(() => {
    if (followUp.length) {
      setTotalFollowUps(followUp.length);
    }
  }, [followUp]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  return (
    <section className="grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
      <WidgetCard
        className="relative pt-4 dark:bg-inherit border-gray-400"
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title={title || `Follow-up's`}
        titleClassName="whitespace-nowrap mb-4 text-gray-900 "
        action={
          !hideInfo ? (
            <div className="grid grid-cols-2 max-md:hidden items-start">
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => {
                    setFollowUpType("Enq");
                    refreshData();
                  }}
                  size="sm"
                  className={
                    (followUpType !== "Enq"
                      ? "bg-primary-lighter text-primary hover:text-gray-0"
                      : "") + " scale-110"
                  }
                >
                  Enquiry
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setFollowUpType("Member");
                    refreshData();
                  }}
                  className={
                    (followUpType === "Enq"
                      ? "bg-primary-lighter text-primary hover:text-gray-0"
                      : "") + " scale-110"
                  }
                >
                  Member
                </Button>
              </div>
              <div className="w-full hidden md:flex gap-4 flex-row-reverse items-center">
                <div className="flex items-center border rounded-lg bg-gray-50 gap-1.5 p-1.5">
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
                <Button onClick={onFilterClick}>
                  Filters <FilterIcon className="ml-2" />
                </Button>
                <Input
                  placeholder="Search"
                  className=" max-w-[320px] !border-gray-400 text-gray-900 "
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  clearable
                  onClear={() => {
                    setSearch("");
                    handleSearch("");
                  }}
                />
                <Button
                  className={`${followUpType === "Member" ? "flex" : "hidden"} items-center' gap-1.5 justify-end`}
                  size="sm"
                  onClick={() => {
                    if (!auth && !access) {
                      toast.error("You aren't allowed to make changes");
                      return;
                      // }
                    }
                    setShowConfig(!showConfig);
                  }}
                >
                  <IoSettings />
                  <Text>Config</Text>
                </Button>
              </div>
            </div>
          ) : (
            <Link
              href={"/followups"}
              className=" w-full hidden justify-end gap-1 items-center md:flex hover:text-primary"
            >
              View All <ArrowRight className="animate-pulse size-4" />
            </Link>
          )
        }
      >
        {!hideInfo ? (
          <div className="grid grid-cols-1 gap-4 md:hidden">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => {
                  setFollowUpType("Enq");
                  refreshData();
                }}
                size="sm"
                className={
                  (followUpType !== "Enq"
                    ? "bg-primary-lighter text-primary hover:text-gray-0"
                    : "") + " scale-105"
                }
              >
                Enquiry
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setFollowUpType("Member");
                  refreshData();
                }}
                className={
                  (followUpType === "Enq"
                    ? "bg-primary-lighter text-primary hover:text-gray-0"
                    : "") + " scale-105"
                }
              >
                Member
              </Button>
              <Button
                size="sm"
                className={`${followUpType === "Member" ? "flex" : "hidden"} items-center' gap-1.5 justify-end`}
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                    // }
                  }
                  setShowConfig(!showConfig);
                }}
              >
                <IoSettings />
                <Text>Config</Text>
              </Button>
            </div>

            <div className="w-full flex justify-between gap-2">
              <Input
                placeholder="Search"
                className=" mb-2 !border-gray-400 text-gray-900 "
                value={search}
                size="sm"
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleSearch(e.target.value);
                }}
                clearable
                onClear={() => {
                  setSearch("");
                  handleSearch("");
                }}
              />
              <Button size="sm" onClick={onFilterClick}>
                Filters <FilterIcon className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <Link
            href={"/followups"}
            className=" w-full flex justify-end gap-1 items-center md:hidden hover:text-primary"
          >
            View All <ArrowRight className="animate-pulse size-4" />
          </Link>
        )}
        {LoadingState ? (
          <div className="w-full flex items-center justify-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <>
            <div className="max-md:hidden">
              {view === "grid" ? (
                <FollowUpCardList
                  auth={auth}
                  isValid={isValid}
                  followUp={followUp}
                  followUpType={followUpType}
                  memberFollowUp={memberFollowUp}
                  onAdd={(id: number) => {
                    setOpenMemberId(id);
                    setAction("new");
                  }}
                  onConvert={(lead: any) => {
                    setSelectedEnq(lead);
                    setAction("editLead");
                  }}
                  onEdit={(id: number) => {
                    setOpenMemberId(id);
                    setAction("edit");
                  }}
                  onViewHistory={(id: number) => {
                    setOpenMemberId(id);
                    setAction("view");
                  }}
                  packages={packages}
                  paymentModes={paymentModes}
                  refreshData={refreshData}
                  access={access}
                />
              ) : (
                <ControlledTable
                  variant="modern"
                  data={
                    followUpType === "Enq" ? followUp : memberFollowUp || []
                  }
                  sticky={true}
                  // isLoading={isLoading}
                  showLoadingText={true}
                  scroll={{
                    x: "max-content",
                    y: 500,
                  }}
                  className="text-sm mt-4 !border-none md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100"
                  //@ts-ignore
                  columns={
                    followUpType === "Enq"
                      ? getColumns({ data: followUp })
                      : getMemberColumns({ data: memberFollowUp || [] })
                  }
                />
              )}
            </div>
            <div className="md:hidden">
              <FollowUpCardList
                auth={auth}
                isValid={isValid}
                followUp={followUp}
                followUpType={followUpType}
                memberFollowUp={memberFollowUp}
                onAdd={(id: number) => {
                  setOpenMemberId(id);
                  setAction("new");
                }}
                onConvert={(lead: any) => {
                  setSelectedEnq(lead);
                  setAction("editLead");
                }}
                onEdit={(id: number) => {
                  setOpenMemberId(id);
                  setAction("edit");
                }}
                onViewHistory={(id: number) => {
                  setOpenMemberId(id);
                  setAction("view");
                }}
                packages={packages}
                paymentModes={paymentModes}
                refreshData={refreshData}
                access={access}
              />
            </div>
          </>
        )}
      </WidgetCard>
      <div
        className={`flex ${hideInfo ? "justify-end" : "justify-between"} mt-4`}
      >
        <Select
          value={pageSizeVal}
          // size="sm"
          options={pageSizeOptions}
          placeholder="Items per page"
          className={`w-auto ${hideInfo ? "hidden" : ""}`}
          onChange={(option: any) => {
            setPageSizeVal(option.value);
            setPageSize(option.value);
          }}
          // labelClassName=""
          // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
        ></Select>
        <Pagination
          total={totalFollowUps}
          current={currentPage}
          onChange={handlePageChange}
          outline={false}
          rounded="md"
          variant="solid"
          color="primary"
          pageSize={pageSizeVal ?? 0}
        />
      </div>
      {openMemberId && action === "view" && (
        <ViewHistory
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={refreshData}
        />
      )}
      {openMemberId && action === "edit" && (
        <EditFollowUp
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={refreshData}
          data={
            memberFollowUp?.find((item) => item.id === openMemberId) || null
          }
        />
      )}
      {openMemberId && action === "editLead" && (
        <EditFollowUpLead
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={refreshData}
          data={followUp?.find((item) => item.id === openMemberId) || null}
        />
      )}
      {openMemberId && action === "new" && (
        <AddFollowupHistory
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={refreshData}
          prevStatus={
            followUpType === "Enq"
              ? selectedEnq?.status
              : memberFollowUp?.find((item) => item.id === openMemberId)?.status
          }
          prevContactType={
            followUpType === "Enq"
              ? selectedEnq?.contact_type
              : memberFollowUp?.find((item) => item.id === openMemberId)
                  ?.contact_type
          }
        />
      )}
      {showConfig && (
        <Configs showConfig={showConfig} setShowConfig={setShowConfig} />
      )}
    </section>
  );
}
