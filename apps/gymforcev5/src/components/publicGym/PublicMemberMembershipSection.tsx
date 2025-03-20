"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Badge,
  Text,
  Button,
  // Dropdown,
  Loader,
  Popover,
  Tooltip,
  ActionIcon,
} from "rizzui";
import WidgetCard from "@/components/cards/widget-card";
// import { PiStackSimple } from "react-icons/pi";

// import { formatDate } from "@utils/format-date";
import { useRouter } from "next/navigation";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import Pagination from "@core/ui/pagination";

import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";

import getDueBadge from "@/components/dueBadge";
import MetricCard from "@core/components/cards/metric-card";
import { IoMdEye, IoMdRefreshCircle } from "react-icons/io";

import Link from "next/link";

import { formatDate } from "@core/utils/format-date";

interface MembershipData {
  id: string;
  package_details: {
    name: string;
    num_of_days: number;
    package_type: string;
  };
  start_date: string;
  end_date: string;
  cancelled: boolean | null;
  cancellation_reason: string | null;
  is_renewable: boolean | null;
  due: number;
  due_date: string;
  paid_amount: number;
  offer_price: number;
  sessions: string;
  member_details: {
    name: string;
    member_image?: string;
    id: number;
  };
  trainer: number | null;
  trainer_details: any | null;
}

const PublicMemberMembershipSection = () => {
  const [memberships, setMemberships] = useState<MembershipData[]>([]);

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [renewalCount, setRenewalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  //   const [addMembership, setAddMembership] = useState(false);

  useEffect(() => {
    const getBasic = async () => {
      setLoading(true);
      try {
        const getToken = localStorage.getItem("member_token");
        const resp = await AxiosPublic.get(
          `/center/membership-details/?auth=${getToken}`,
          {
            id: `Member-Memberships-${getToken}`,
          }
        );
        setMemberships(resp.data.results.memberships);
        setRenewalCount(resp.data.renewal_count);
        setTotalPages(resp.data.total_pages);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getBasic();
  }, []);

  const getMembershipStatus = (
    item: MembershipData,
    allMemberships: MembershipData[]
  ): string => {
    const currentDate = new Date();
    const endDate = new Date(item.end_date);

    if (item.cancelled === true) return "Cancelled";
    if (currentDate > endDate) return "Expired";

    const activeMembership = allMemberships
      .filter((m) => new Date(m.end_date) > currentDate && m.cancelled !== true)
      .sort(
        (a, b) =>
          new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      )[0];

    if (activeMembership && activeMembership.end_date === item.end_date) {
      return "Active";
    } else {
      return "Upcoming";
    }
  };

  const getColumns = useCallback(
    () => [
      {
        title: <HeaderCell title="S.No" className="text-sm font-semibold" />,
        dataIndex: "index",
        key: "index",
        width: 30,
        render: (text: any, record: any, index: any) => (
          <Text className="text-gray-900 font-semibold">{index + 1}</Text>
        ),
      },
      {
        title: <HeaderCell title="Package" className="text-sm font-semibold" />,
        dataIndex: "package_details",
        key: "package_details",
        width: 150,
        render: (packageDetails: { name: string }) => (
          <Text className="text-gray-900 font-semibold">
            {packageDetails.name}
          </Text>
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
        title: <HeaderCell title="Price" className="text-sm font-semibold" />,
        dataIndex: "offer_price",
        key: "offer_price",
        width: 120,
        render: (offer_price: number) => (
          <Text className=" font-medium">
            {/* {}{" "} */}
            {new Intl.NumberFormat().format(offer_price)}
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Duration" className="text-sm font-semibold" />
        ),
        dataIndex: "package_details",
        key: "duration",
        width: 120,
        render: (packageDetails: { num_of_days: number }) => (
          <Text className=" font-medium">
            {packageDetails.num_of_days} days
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Valid Until" className="text-sm font-semibold" />
        ),
        dataIndex: "end_date",
        key: "end_date",
        width: 120,
        render: (end_date: string) => (
          <Text>{formatDate(new Date(end_date))}</Text>
        ),
      },
      {
        title: <HeaderCell title="Status" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "status",
        width: 120,
        render: (_: any, record: MembershipData) => (
          <Tooltip
            animation="slideIn"
            arrowClassName="text-white "
            className={`${record.cancelled ? "" : "hidden"} text-gray-900 bg-white`}
            content={
              <div className=" flex flex-col items-start justify-center gap-2 p-2 my-2">
                <div className="flex flex-row w-full items-center flex-nowrap gap-2">
                  <Text className=" font-semibold">Membership Status :</Text>
                  <div className=" flex flex-row gap-1 items-center">
                    <Badge renderAsDot color="danger" />
                    <Text className="text-red-500 font-medium">Cancelled</Text>
                  </div>
                </div>
                <div className="flex flex-col w-full items-start flex-nowrap gap-1">
                  <Text className="text-nowrap font-semibold">Reason :</Text>
                  <Text className="pl-4 max-w-40">{`"${record.cancellation_reason}"`}</Text>
                </div>
              </div>
            }
          >
            <div>
              <Badge
                variant="flat"
                color={
                  getMembershipStatus(record, memberships) === "Active"
                    ? "success"
                    : getMembershipStatus(record, memberships) === "Expired"
                      ? "danger"
                      : getMembershipStatus(record, memberships) === "Cancelled"
                        ? "warning"
                        : "info"
                }
                className="capitalize"
              >
                {getMembershipStatus(record, memberships)}
              </Badge>
            </div>
          </Tooltip>
        ),
      },
      {
        title: <HeaderCell title="Due" className="text-sm font-semibold" />,
        dataIndex: "due",
        key: "due",
        width: 120,
        render: (due: number) => (
          <Text>
            {getDueBadge({
              dueAmount: due,
              symbol: "",
            })}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "actions",
        width: 100,
        render: (_: any, record: MembershipData) => (
          <div className="flex items-center gap-4 relative">
            <Tooltip
              size="sm"
              content={"View Invoice"}
              placement="top"
              color="invert"
            >
              <Link
                href={`/invoice/hy$39-${record.id}-091$u/?member=?member=i9$rw-${record.member_details.id}-7y$72&page=member_profile`}
              >
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  aria-label={"View Invoice"}
                  className=" hover:text-primary hover:cursor-pointer"
                >
                  <IoMdEye className="h-4 w-4 " />
                </ActionIcon>
              </Link>
            </Tooltip>
          </div>
        ),
      },
    ],
    [memberships, router]
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-4">
        <MetricCard
          title={"Membership Renewals"}
          metric={new Intl.NumberFormat().format(renewalCount)}
          className="shadow  border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 !p-4 group"
          iconClassName="text-primary duration-200 transition-all group-hover:text-white group-hover:bg-primary"
          titleClassName="text-nowrap font-medium"
          icon={<IoMdRefreshCircle size={32} />}
          metricClassName="text-primary text-center dark:text-white"
        />
      </div>

      <WidgetCard
        title="Memberships"
        titleClassName="leading-none "
        headerClassName="mb-3 lg:mb-4"
        className="max-w-full "
        action={
          <div className="flex justify-end mt-4 ">
            <Pagination
              total={totalPages}
              current={currentPage}
              onChange={(page) => setCurrentPage(page)}
              outline={false}
              rounded="md"
              variant="solid"
              color="primary"
            />
          </div>
        }
      >
        {loading ? (
          <div className="w-full flex items-center justify-center my-4">
            <Loader variant="spinner" size="xl" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={memberships}
            //@ts-ignore
            columns={columns}
            scroll={{ y: 500 }}
            className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-50 "
            // rowClassName="!dark:bg-inherit "
          />
        )}
      </WidgetCard>
    </section>
  );
};

export default PublicMemberMembershipSection;
