"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import {
  Text,
  Loader,
  Button,
  Badge,
  Avatar,
  cn,
  ActionIcon,
  Popover,
  Tooltip,
} from "rizzui";
import Link from "next/link";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import ViewHistory from "@/components/followups/ViewHistory";
import EditFollowUp from "@/components/followups/EditFollowUp";
import EditFollowUpLead from "@/components/followups/EditFollowUpLead";
import AddFollowupHistory from "@/components/followups/AddHistory";
import { MdModeEdit } from "react-icons/md";
import { PiClockClockwiseBold, PiPlus } from "react-icons/pi";
import { MoreVertical } from "lucide-react";
import LeadConvert from "@/components/leads/LeadConvert";
import { useRouter } from "next/navigation";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";

export interface FollowUpType {
  id: number;
  history_count: number;
  comment: string;
  contact_type: string;
  datetime: string;
  gym: number;
  is_escalated: boolean;
  lead: Lead;
  managed_by: ManagedBy;
  member: null;
  next_followup_reminder: string | null;
  owner: number;
  priority: string;
  purpose: string;
  status: string;
}

interface Lead {
  id: number;
  LeadId: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  status: string | null;
  source: string | null;
  category: string | null;
  reminder: string;
  date: string;
  converted: boolean;
  converted_at: string;
  gender: string;
  address_street: string;
  address_city: string;
  address_zip_code: string;
  address_state: string;
  address_country: string;
  visiting_center: string;
  status_id: number | null;
  latest_followup_reminder?: {
    reminder: string;
    status: string;
  } | null;
  source_id: number | null;
  category_id: number | null;
  remarks: string;
  visitor_image?: string | null;
  enquiry_mode?: string;
  localid?: number;
}

interface ManagedBy {
  id: number;
  name: string;
  staff_image: null;
  staff_type_name: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  member_image: string | null;
}

export interface MemberFollowUp {
  comment: string;
  contact_type: string;
  datetime: string;
  gym: number;
  history_count: number;
  id: number;
  is_escalated: boolean;
  lead: any | null;
  managed_by: any | null;
  member: Member | null;
  email: string;
  gender: string;
  name: string;
  phone: string;
  next_followup_reminder: string | null;
  owner: number | null;
  priority: string;
  purpose: string;
  status: string;
}

interface Package {
  label: string;
  value: number;
  min_price: number;
  max_price: number;
  num_of_days: number;
}

export default function FollowUpSection({
  params,
}: {
  params: { id: string };
}) {
  const [followUps, setFollowUps] = useState<{
    lead_followups: FollowUpType[];
    member_followups: MemberFollowUp[];
  }>({
    lead_followups: [],
    member_followups: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<
    "lead_followups" | "member_followups"
  >("lead_followups");

  const newId = (params.id as string).split("-")[1];
  const [openMemberId, setOpenMemberId] = useState<number | null>(null);
  const [action, setAction] = useState<
    "view" | "edit" | "new" | "editLead" | null
  >(null);
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [paymentModes, setPaymentModes] = useState<
    { label: string; value: number }[]
  >([]);

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
    setAuth(!resp);
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
  }, []);
  const fetchFollowUps = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/staff/${newId}/followups/?gym_id=${gymId}`,
        {
          id: newID(`staff-followups-${newId}`),
        }
      );
      const members = resp.data.filter(
        (item: FollowUpType) => item.member !== null
      );
      const leads = resp.data.filter(
        (item: FollowUpType) => item.member === null
      );
      setFollowUps({
        lead_followups: leads,
        member_followups: members,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [newId]);

  const getLeadColumns = useCallback(
    () => [
      {
        title: <HeaderCell title="ID" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (id: number) => <Text>#{id}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (_: any, row: FollowUpType) => (
          <figure className="flex items-center gap-3">
            <Avatar
              name={row.lead?.name || "N/A"}
              src={
                row.lead?.visitor_image ||
                (row.lead?.gender && row.lead?.gender[0]?.toLowerCase() === "f"
                  ? "https://images.gymforce.in/woman-user-circle-icon.png"
                  : "https://images.gymforce.in/man-user-circle-icon.png")
              }
            />
            <figcaption className="grid gap-0.5">
              <Text className="font-lexend text-sm font-medium text-gray-900 hover:text-primary">
                {/* <Link href={`/lead_profile/yk62-${row.lead?.id}-71he`}> */}
                <Text className="text-nowrap text-clip">
                  {row.lead?.name || ""}
                </Text>
                {/* </Link> */}
              </Text>
              <Text className="text-[13px] dark:text-gray-400">
                {row.lead?.phone}
              </Text>
            </figcaption>
          </figure>
        ),
      },
      {
        title: (
          <HeaderCell title="Contact By" className="text-sm font-semibold" />
        ),
        dataIndex: "contact_type",
        key: "contact_type",
        width: 150,
        render: (_: any, row: FollowUpType) => (
          <div className="grid grid-cols-1 text-sm">
            {/* <Text>{row.managed_by.name}</Text> */}
            <Text>{row.contact_type}</Text>
          </div>
        ),
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
                <LeadConvert
                  lead={row.lead}
                  packages={packages}
                  paymentModes={paymentModes}
                  onConvert={() => fetchFollowUps()}
                  isValid={true}
                  auth={true}
                  key={row.lead.id}
                />
              </Tooltip>
            )}
            {row.member !== null ? null : (
              <Popover>
                <Popover.Trigger>
                  <ActionIcon
                    // onClick={() => {
                    //   if (!isValid) {
                    //     toast.error("Please Subscribe to Proceed Further");
                    //     if (auth) {
                    //       router.push("/subscription/plans");
                    //     }
                    //     return;
                    //   }
                    //   setOpenPopoverId(
                    //     openPopoverId === row.lead.id.toString()
                    //       ? null
                    //       : row.lead.id.toString()
                    //   );
                    // }}
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
                        setAction("new");
                        setOpenMemberId(row.id);
                      }}
                    >
                      <PiPlus className="w-4 h-4 mr-2" /> History
                    </Button>

                    <Button
                      variant="text"
                      onClick={() => {
                        setAction("editLead");
                        setOpenMemberId(row.id);
                      }}
                    >
                      <MdModeEdit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        setAction("view");
                        setOpenMemberId(row.id);
                      }}
                    >
                      <PiClockClockwiseBold className="w-4 h-4 mr-2" /> History
                    </Button>
                  </div>
                </Popover.Content>
              </Popover>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const getMemberColumns = useCallback(
    () => [
      {
        title: <HeaderCell title="ID" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (id: number) => <Text>#{id}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (_: any, row: MemberFollowUp) => (
          <figure className="flex items-center gap-3">
            <Avatar
              name={row.member?.name || "N/A"}
              src={
                row.member?.member_image ||
                (row.member?.gender &&
                row.member?.gender[0]?.toLowerCase() === "f"
                  ? "https://images.gymforce.in/woman-user-circle-icon.png"
                  : "https://images.gymforce.in/man-user-circle-icon.png")
              }
            />
            <figcaption className="grid gap-0.5">
              <Text className="font-lexend text-sm font-medium text-gray-900 hover:text-primary">
                <Link href={`/member_profile/yk62-${row.member?.id}-71he`}>
                  <Text className="text-nowrap text-clip">
                    {row.member?.name || ""}
                  </Text>
                </Link>
              </Text>
              <Text className="text-[13px] dark:text-gray-400">
                {row.member?.phone}
              </Text>
            </figcaption>
          </figure>
        ),
      },
      {
        title: (
          <HeaderCell title="Contact By" className="text-sm font-semibold" />
        ),
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
        title: <></>,
        dataIndex: "actions",
        key: "actions",
        width: 50,
        render: (_: any, row: FollowUpType) => (
          <div className="flex items-center gap-2">
            <Tooltip content="View History">
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
                  // onClick={() => {
                  //   if (!isValid) {
                  //     toast.error("Please Subscribe to Proceed Further");
                  //     if (auth) {
                  //       router.push("/subscription/plans");
                  //     }
                  //     return;
                  //   }
                  // }}
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
                      setAction("new");
                      setOpenMemberId(row.id);
                    }}
                  >
                    <PiPlus className="w-4 h-4 mr-2" /> History
                  </Button>

                  <Button
                    variant="text"
                    onClick={() => {
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
    []
  );

  return (
    <WidgetCard
      title="Follow Ups"
      titleClassName="leading-none"
      headerClassName="mb-3 lg:mb-4"
      className="max-w-full"
      action={
        <div className="hidden md:flex items-center space-x-2">
          {Object.keys(followUps).map((type) => (
            <Button
              key={type}
              onClick={() =>
                setSelectedType(type as "lead_followups" | "member_followups")
              }
              variant={selectedType === type ? "solid" : "flat"}
              className="scale-90 flex gap-1.5 items-center capitalize"
            >
              {type.replace("_", " ")}
              <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                {followUps[type as keyof typeof followUps].length}
              </Text>
            </Button>
          ))}
        </div>
      }
    >
      <div className="flex md:hidden items-center space-x-2 my-1">
        {Object.keys(followUps).map((type) => (
          <Button
            key={type}
            onClick={() =>
              setSelectedType(type as "lead_followups" | "member_followups")
            }
            variant={selectedType === type ? "solid" : "flat"}
            className="scale-90 flex gap-1.5 items-center capitalize"
          >
            {type.replace("_", " ")}
            <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
              {followUps[type as keyof typeof followUps].length}
            </Text>
          </Button>
        ))}
      </div>
      {loading ? (
        <div className="grid h-32 flex-grow place-content-center items-center">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <Table
          variant="minimal"
          data={followUps[selectedType]}
          //@ts-ignore
          columns={
            selectedType === "lead_followups"
              ? getLeadColumns()
              : getMemberColumns()
          }
          scroll={{ y: 500 }}
          className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap"
        />
      )}
      {openMemberId && action === "view" && (
        <ViewHistory
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={() => fetchFollowUps()}
        />
      )}
      {openMemberId && action === "edit" && (
        <EditFollowUp
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={() => fetchFollowUps()}
          data={
            followUps.member_followups.find(
              (item) => item.id === openMemberId
            ) || null
          }
        />
      )}
      {openMemberId && action === "editLead" && (
        <EditFollowUpLead
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={() => fetchFollowUps()}
          data={
            followUps.lead_followups?.find(
              (item) => item.id === openMemberId
            ) || null
          }
        />
      )}
      {openMemberId && action === "new" && (
        <AddFollowupHistory
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={() => fetchFollowUps()}
          prevContactType={
            followUps[selectedType].find((item) => item.id === openMemberId)
              ?.contact_type
          }
          prevStatus={
            followUps[selectedType].find((item) => item.id === openMemberId)
              ?.status
          }
        />
      )}
    </WidgetCard>
  );
}
