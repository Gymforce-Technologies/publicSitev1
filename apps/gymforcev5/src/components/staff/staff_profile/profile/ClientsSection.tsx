"use client";
import React, { useState, useEffect } from "react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { Text, Loader, Button, Badge, Tooltip, Avatar } from "rizzui";
import Link from "next/link";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { FaArrowRightLong } from "react-icons/fa6";

// Updated and more precise TypeScript Interfaces
interface MemberDetails {
  id: number;
  localid: number;
  name: string;
  email: string;
  phone: string;
  member_image: string | null;
  status: string;
  gender?: string;
}

interface ClientMembership {
  id: number;
  member_details: MemberDetails;
  package_name: string;
  package_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Memberships {
  general_clients: ClientMembership[];
  group_clients: ClientMembership[];
  pt_clients: ClientMembership[];
}

interface BadgeProps {
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  text: string;
  variant?: "flat" | "outline" | "solid";
  isAnimated?: boolean;
}

export default function ClientsSection({ params }: { params: { id: string } }) {
  const [memberships, setMemberships] = useState<Memberships>({
    general_clients: [],
    group_clients: [],
    pt_clients: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] =
    useState<keyof Memberships>("general_clients");

  const newId = params.id.split("-")[1];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get<{ memberships: Memberships }>(
          `/api/staff/${newId}/clients/?gym_id=${gymId}`,
          {
            id: newID(`staff-clients-${newId}`),
          }
        );

        setMemberships(resp.data.memberships);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setLoading(false);
      }
    };

    fetchClients();
  }, [newId]);

  const renderBadge = ({
    color,
    text,
    variant = "flat",
    isAnimated = false,
  }: BadgeProps) => (
    <Badge
      color={color}
      variant={"flat"}
      className={isAnimated ? "animate-pulse" : ""}
    >
      {text}
    </Badge>
  );

  const renderClientStatus = (row: ClientMembership) => {
    const currentDate = new Date();
    const endDate = new Date(row.end_date);
    const startDate = new Date(row.start_date);

    // Upcoming status
    if (startDate > currentDate) {
      return renderBadge({
        color: "secondary",
        text: "Upcoming",
        variant: "outline",
      });
    }

    // Expired status
    if (endDate < currentDate) {
      return renderBadge({
        color: "danger",
        text: "Expired",
        variant: "outline",
      });
    }

    // Active status (default)
    return renderBadge({
      color: "success",
      text: "Active",
      variant: "outline",
    });
  };
  const columns = [
    {
      title: <HeaderCell title="ID" className="text-sm font-semibold" />,
      dataIndex: "localid",
      key: "localid",
      width: 80,
      render: (_: any, record: ClientMembership) => (
        <Text>#{record.member_details.localid}</Text>
      ),
    },
    // ... (rest of the columns remain similar, with minor adjustments)
    {
      title: <HeaderCell title="Name" className="text-sm font-semibold" />,
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (_: any, record: ClientMembership) => (
        <figure className="flex items-center gap-3">
          <Avatar
            name={record.member_details.name}
            src={record.member_details.member_image || ""}
          />
          <figcaption className="grid gap-0.5">
            <Text className="font-lexend text-sm font-medium text-gray-900 hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Link
                  href={`/member_profile/yk62-${record.member_details.id}-71he`}
                >
                  <Text className="text-nowrap text-clip">
                    {record.member_details.name}
                  </Text>
                </Link>
              </span>
            </Text>
            <Text className="text-[13px] dark:text-gray-400">
              {record.member_details.phone}
            </Text>
          </figcaption>
        </figure>
      ),
    },
    {
      title: <HeaderCell title="Package" className="text-sm font-semibold" />,
      dataIndex: "package_name",
      key: "package_name",
      width: 150,
      render: (package_name: string) => <Text>{package_name}</Text>,
    },
    {
      title: <HeaderCell title="Status" className="text-sm font-semibold" />,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text: any, record: ClientMembership) =>
        renderClientStatus(record),
    },

    // {
    //   title: <HeaderCell title="Type" className="text-sm font-semibold" />,
    //   dataIndex: "package_type",
    //   key: "package_type",
    //   width: 100,
    //   render: (package_type: string) => (
    //     <Badge variant="flat">{package_type}</Badge>
    //   ),
    // },
    {
      title: <HeaderCell title="Validity" className="text-sm font-semibold" />,
      dataIndex: "start_date",
      key: "start_date",
      width: 150,
      render: (text: any, record: ClientMembership) => (
        <div className="flex items-center flex-nowrap">
          <DateCell
            date={new Date(record.start_date)}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            dateClassName="text-nowrap"
          />
          <FaArrowRightLong className="size-3 mx-2" />{" "}
          <DateCell
            date={new Date(record.end_date)}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            dateClassName="text-nowrap"
          />
        </div>
      ),
    },
  ];

  return (
    <WidgetCard
      title="Clients List"
      titleClassName="leading-none"
      headerClassName="mb-3 lg:mb-4"
      className="max-w-full"
      action={
        <div className="hidden md:flex items-center space-x-2">
          {(Object.keys(memberships) as Array<keyof Memberships>).map(
            (type) => (
              <Button
                key={type}
                onClick={() => setSelectedType(type)}
                variant={selectedType === type ? "solid" : "flat"}
                className="scale-90 flex gap-1.5 items-center capitalize"
              >
                {type.replace("_", " ")}
                <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                  {memberships[type].length}
                </Text>
              </Button>
            )
          )}
        </div>
      }
    >
      <div className="flex md:hidden items-center space-x-2 my-2">
        {(Object.keys(memberships) as Array<keyof Memberships>).map((type) => (
          <Button
            key={type}
            onClick={() => setSelectedType(type)}
            variant={selectedType === type ? "solid" : "flat"}
            className="scale-90 flex gap-1.5 items-center capitalize"
          >
            {type.replace("_", " ").split(" ")[0]}
            <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
              {memberships[type].length}
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
          data={memberships[selectedType]}
          //@ts-ignore
          columns={columns}
          scroll={{ y: 500 }}
          className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap"
        />
      )}
    </WidgetCard>
  );
}
