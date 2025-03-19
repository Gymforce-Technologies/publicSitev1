"use client";
import React, { useState, useEffect } from "react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { Text, Loader, Button, Badge, Avatar, Tooltip } from "rizzui";
import Link from "next/link";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { FaArrowRightLong } from "react-icons/fa6";

// TypeScript Interfaces
interface MemberDetails {
  id: number;
  localid: number;
  name: string;
  email: string;
  phone: string;
  member_image: string | null;
  status: string;
}

interface MembershipDetails {
  id: number;
  status: string;
  offer_price: number;
  start_date: string;
  end_date: string;
}

interface PTSession {
  id: number;
  session_number: number;
  start_time: string;
  end_time: string;
  duration: string;
  status: string;
  is_approved: boolean;
  before_remarks: string;
  after_remarks: string;
  member_details: MemberDetails;
  membership: number;
  membership_details: MembershipDetails;
  files: string | null;
  otp: string | null;
}

interface PTSessionData {
  approved_sessions: PTSession[];
  pending_approval_sessions: PTSession[];
  approved_sessions_counts: number;
  pending_approval_sessions_counts: number;
}

export default function SessionSection({
  params,
}: {
  params: { id: string };
}) {
  const [ptSessions, setPTSessions] = useState<PTSessionData>({
    approved_sessions: [],
    pending_approval_sessions: [],
    approved_sessions_counts: 0,
    pending_approval_sessions_counts: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<
    "approved_sessions" | "pending_approval_sessions"
  >("approved_sessions");

  const newId = params.id.split("-")[1];

  useEffect(() => {
    const fetchPTSessions = async () => {
      try {
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get<PTSessionData>(
          `/api/staff/${newId}/pt-session/?gym_id=${gymId}`,
          {
            id: newID(`staff-pt-session-${newId}`),
          }
        );

        setPTSessions(resp.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching PT Sessions:", error);
        setLoading(false);
      }
    };

    fetchPTSessions();
  }, [newId]);

  const renderSessionStatus = (session: PTSession) => {
    if (session.is_approved) {
      return (
        <Badge color="success" variant="outline">
          Approved
        </Badge>
      );
    }
    return (
      <Badge color="warning" variant="outline">
        Pending
      </Badge>
    );
  };

  function formatDuration(durationString: string): string {
    // Check if duration contains a space (indicating potential days)
    const parts = durationString.split(" ");

    let days = 0;
    let timeString = durationString;

    // If first part is a number, it represents days
    if (parts.length > 1) {
      days = parseInt(parts[0], 10);
      timeString = parts[1];
    }

    // Split time into hours, minutes, seconds
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    // Calculate total minutes
    const totalMinutes = days * 24 * 60 + hours * 60 + minutes;

    // Create human-readable duration
    const durationParts: string[] = [];

    if (days > 0) {
      durationParts.push(`${days} day${days > 1 ? "s" : ""}`);
    }

    if (hours > 0) {
      durationParts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
    }

    if (minutes > 0 || durationParts.length === 0) {
      durationParts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
    }

    return durationParts.slice(0, 2).join(" ") || "0 mins";
  }

  const columns = [
    {
      title: <HeaderCell title="S.No" className="text-sm font-semibold" />,
      dataIndex: "session_number",
      key: "session_number",
      width: 80,
      render: (session_number: number) => <Text>#{session_number}</Text>,
    },
    {
      title: <HeaderCell title="Client" className="text-sm font-semibold" />,
      dataIndex: "member_details",
      key: "member_details",
      width: 200,
      render: (_: any, record: PTSession) => (
        <figure className="flex items-center gap-3">
          <Avatar
            name={record.member_details.name}
            src={record.member_details.member_image || ""}
          />
          <figcaption className="grid gap-0.5">
            <Text className="font-lexend text-sm font-medium text-gray-900 hover:text-primary">
              <Link
                href={`/member_profile/yk62-${record.member_details.id}-71he`}
              >
                {record.member_details.name}
              </Link>
            </Text>
            <Text className="text-[13px] dark:text-gray-400">
              {record.member_details.phone}
            </Text>
          </figcaption>
        </figure>
      ),
    },
    {
      title: <HeaderCell title="Status" className="text-sm font-semibold" />,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_: any, record: PTSession) => renderSessionStatus(record),
    },
    {
      title: <HeaderCell title="Duration" className="text-sm font-semibold" />,
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (duration: string) => <Text>{formatDuration(duration)}</Text>,
    },
    {
      title: (
        <HeaderCell title="Session Time" className="text-sm font-semibold" />
      ),
      dataIndex: "start_time",
      key: "start_time",
      width: 200,
      render: (_: any, record: PTSession) => (
        <div className="flex items-center flex-nowrap gap-1">
          <DateCell
            date={new Date(record.start_time)}
            dateFormat={getDateFormat()}
            timeClassName="text-xs text-gray-500"
            dateClassName="text-nowrap"
          />
          <FaArrowRightLong className="size-3 mx-2" />
          <DateCell
            date={new Date(record.end_time)}
            dateFormat={getDateFormat()}
            timeClassName="text-xs text-gray-500"
            dateClassName="text-nowrap"
          />
        </div>
      ),
    },
    {
      title: <HeaderCell title="Remarks" className="text-sm font-semibold" />,
      dataIndex: "remarks",
      key: "remarks",
      width: 150,
      render: (_: any, record: PTSession) => (
        <div>
          <Text className="text-sm">
            {record.before_remarks || record.after_remarks || "No remarks"}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <WidgetCard
      title="PT Sessions"
      titleClassName="leading-none"
      headerClassName="mb-3 lg:mb-4"
      className="max-w-full"
      action={
        <div className="flex space-x-2">
          {[
            { key: "approved_sessions", label: "Approved" },
            { key: "pending_approval_sessions", label: "Pending" },
          ].map((type) => (
            <Button
              key={type.key}
              onClick={() => setSelectedType(type.key as any)}
              variant={selectedType === type.key ? "solid" : "flat"}
              className="scale-90 flex gap-1.5 items-center"
            >
              {type.label}
              <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                {type.key === "approved_sessions"
                  ? ptSessions.approved_sessions_counts
                  : ptSessions.pending_approval_sessions_counts}
              </Text>
            </Button>
          ))}
        </div>
      }
    >
      {loading ? (
        <div className="grid h-32 flex-grow place-content-center items-center">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <Table
          variant="minimal"
          data={ptSessions[selectedType]}
          //@ts-ignore
          columns={columns}
          scroll={{ y: 500 }}
          className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap"
        />
      )}
    </WidgetCard>
  );
}
