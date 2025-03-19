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
import { FaEllipsisV } from "react-icons/fa";
import {
  ExtendModal,
  PaymentModal,
  RenewModal,
} from "@/components/member-list/Modals";
import {
  MdCancel,
  MdOutlineChangeCircle,
  MdOutlineDateRange,
  MdPayments,
} from "react-icons/md";
import { RiLoopLeftLine } from "react-icons/ri";
import toast from "react-hot-toast";
// import { formatDate } from "@utils/format-date";
import { useRouter } from "next/navigation";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import Pagination from "@core/ui/pagination";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
// import useMembershipAPI from "@/hooks/useMembershipAPI";
import DateCell from "@core/ui/date-cell";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import getDueBadge from "@/components/dueBadge";
import MetricCard from "@core/components/cards/metric-card";
import {
  IoMdArrowDropupCircle,
  IoMdEye,
  IoMdRefreshCircle,
} from "react-icons/io";

import { BiLayerPlus } from "react-icons/bi";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import AddMembership from "./AddMembership";
import AddTrainer from "@/components/membership/AddTrainer";
import { PiUserCirclePlusFill } from "react-icons/pi";
import dayjs from "dayjs";

const TransferMembership = dynamic(
  () => import("@/components/membership/Transfermembership")
);
const UpgradeMembership = dynamic(
  () => import("@/components/membership/UpgradeMembership")
);
const FreezeMembership = dynamic(
  () => import("@/components/membership/FreezeMembership")
);
const AddonMembership = dynamic(
  () => import("@/components/membership/AddonMembership")
);
const CancelMembership = dynamic(
  () => import("@/components/membership/CancelMembership")
);
const UnfreezeMembership = dynamic(
  () => import("@/components/membership/UnfreezeMembership")
);

interface MembershipProps {
  id: string;
  isValid: boolean;
}

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

const Membership: React.FC<MembershipProps> = ({ id, isValid }) => {
  const [memberships, setMemberships] = useState<MembershipData[]>([]);
  // const { getSpecificMember } = useMembershipAPI();
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
    | null
  >(null);
  const [activeMembershipId, setActiveMembershipId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [auth, setAuth] = useState<boolean>(true);
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);
  const [renewalCount, setRenewalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addMembership, setAddMembership] = useState(false);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const data = await AxiosPrivate.get(
        `/api/member/${id}/memberships/?gym_id=${gymId}&${currentPage ? `page=${currentPage}` : ""}`,
        {
          id: newID(`memberships-${id}-${currentPage ? currentPage : 1}`),
        }
      );
      // if(data.data.results.memberships.length === 0){
      //   toast.error("No Memberships Found");
      //   router.push('/dashboard');
      // }
      console.log(data.data.total_pages);
      setTotalPages(data.data.total_pages);
      setMemberships(data.data.results.memberships);
      setRenewalCount(data.data.results.renewal_count);
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, [id, currentPage]);

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
        | "addTrainer",
      membershipId: string
    ) => {
      setModalAction(action);
      setActiveMembershipId(membershipId);
    },
    []
  );

  const closeModal = () => {
    setModalAction(null);
    setActiveMembershipId(null);
  };

  const onUpdate = () => {
    closeModal();
    fetchMemberships();
    setCurrentPage(1);
  };

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
  const getDemo = async () => {
    const demoInfo = await getDemographicInfo();
    if (demoInfo) {
      setDemographicInfo(demoInfo);
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      const resp = await isStaff();
      setAuth(!resp);
    };
    getDemo();
    getStatus();
  }, []);

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
            {demographicInfo?.currency_symbol}{" "}
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
        render: (
          packageDetails: { num_of_days: number },
          record: MembershipData
        ) => (
          <Text className=" font-medium">
            {dayjs(new Date(record.end_date))
              .diff(dayjs(new Date(record.start_date)), "days")
              .toString()}{" "}
            days
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
          <DateCell
            date={new Date(end_date)}
            dateFormat={getDateFormat()}
            timeClassName="hidden"
            // dateClassName=""
          />
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
              symbol: demographicInfo?.currency_symbol || "₹",
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
              // className="dark:bg-gray-800 "
              // arrowClassName="dark:text-gray-800"
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
            <Popover placement="bottom">
              <Popover.Trigger>
                <Button
                  variant="text"
                  className="h-auto p-0"
                  onClick={() => {
                    if (!isValid) {
                      toast.error("Please Subscribe to Proceed Further");
                      if (auth) {
                        router.push("/subscription/plans");
                      }
                      return;
                    }
                  }}
                >
                  <FaEllipsisV />
                </Button>
              </Popover.Trigger>
              <Popover.Content className=" ">
                {record?.trainer === null && (
                  <Button
                    variant="text"
                    onClick={() => {
                      handleAction("addTrainer", record.id);
                    }}
                    className={`flex flex-row gap-2 dark:hover:text-primary items-center justify-start font-medium hover:scale-105 duration-300`}
                  >
                    <PiUserCirclePlusFill size={20} />
                    <Text>Assign Trainer</Text>
                  </Button>
                )}
                {record.due > 0 && (
                  <Button
                    onClick={() => handleAction("Pay", record.id)}
                    variant="text"
                    className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                  >
                    <MdPayments size={20} />
                    <Text className="">Pay</Text>
                  </Button>
                )}
                {record.due > 0 && (
                  <Button
                    onClick={() => handleAction("Extend", record.id)}
                    variant="text"
                    className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                  >
                    <MdOutlineDateRange size={20} />
                    <Text>Extend Due Date</Text>
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (record.due) {
                      toast.error(
                        "Renewal can't proceed until the due payment is made"
                      );
                      return;
                    }
                    if (memberships.indexOf(record) === 0) {
                      handleAction("Renew", record.id);
                    } else {
                      toast.error("You can only renew the latest membership");
                    }
                  }}
                  variant="text"
                  className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                >
                  <RiLoopLeftLine size={20} />
                  <Text>Renew</Text>
                </Button>
                <Button
                  onClick={() => {
                    if (record.due) {
                      toast.error(
                        "Upgrade can't proceed until the due payment is made"
                      );
                      return;
                    }
                    handleAction("Upgrade", record.id);
                  }}
                  variant="text"
                  className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                >
                  <IoMdArrowDropupCircle size={20} />
                  <Text>Upgrade</Text>
                </Button>
                <Button
                  onClick={() => {
                    if (record.due) {
                      toast.error(
                        "Extend can't proceed until the due payment is made"
                      );
                      return;
                    }
                    // else if(row.freezed){
                    //   toast.error(
                    //     "Extend can't proceed while It's Freezed."
                    //   );
                    //   return;
                    // }
                    handleAction("Addon", record.id);
                  }}
                  variant="text"
                  className={` flex flex-row gap-2 items-center hover:text-primary justify-start font-medium hover:scale-105 duration-300`}
                >
                  <BiLayerPlus size={20} />
                  <Text>Addon Days</Text>
                </Button>
                <Button
                  onClick={() => {
                    handleAction("Transfer", record.id);
                  }}
                  variant="text"
                  className={` flex flex-row gap-2 items-center hover:text-red-500 justify-start font-medium hover:scale-105 duration-300`}
                >
                  <MdOutlineChangeCircle size={20} />
                  <Text>Transfer</Text>
                </Button>
                {!record.cancelled && (
                  <Button
                    onClick={() => {
                      handleAction("Cancel", record.id);
                    }}
                    variant="text"
                    className={` flex flex-row gap-2 items-center hover:text-red-500 justify-start font-medium hover:scale-105 duration-300`}
                  >
                    <MdCancel size={20} />
                    <Text>Cancel</Text>
                  </Button>
                )}
              </Popover.Content>
            </Popover>
          </div>
        ),
      },
    ],
    [memberships, isValid, auth, router]
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
            {memberships.length < 1 && (
              <Button
                onClick={() => setAddMembership(true)}
                // variant="solid"
                className="max-sm:scale-90 hover:scale-105 transition-all duration-200 group hover:shadow-sm shadow-gray-800 font-medium"
              >
                Add Membership
              </Button>
            )}
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

        {modalAction === "Pay" && activeMembershipId && (
          <PaymentModal
            membershipid={activeMembershipId}
            func="Pay"
            onUpdate={onUpdate}
          />
        )}

        {modalAction === "Renew" && activeMembershipId && (
          <RenewModal
            membershipId={activeMembershipId}
            func="Renew"
            onUpdate={onUpdate}
            package_name={
              memberships[memberships.length - 1].package_details.name
            }
            end_date={memberships[memberships.length - 1].end_date}
            member_id={id}
          />
        )}
        {modalAction === "Extend" && activeMembershipId && (
          <ExtendModal
            membershipId={activeMembershipId}
            onUpdate={onUpdate}
            due_date={memberships[memberships.length - 1].due_date}
          />
        )}
        {/* {modalAction === "Upgrade" && activeMembershipId && (
          <UpgradeMembership
            membershipId={activeMembershipId}
            onUpdate={onUpdate}
            closeModal={closeModal}
            package_type={
              memberships.find((item) => item.id === activeMembershipId)
                ?.package_details.package_type
            }
            paid_amount={
              memberships.find((item) => item.id === activeMembershipId)
                ?.paid_amount || 0
            }
            //@ts-ignore
            end_date={
              memberships.find((item) => item.id === activeMembershipId)
                ?.end_date
            }
            member_name={
              memberships.find((item) => item.id === activeMembershipId)
                ?.member_details.name
            }
            member_image={
              memberships.find((item) => item.id === activeMembershipId)
                ?.member_details.member_image
            }
            member_id={id}
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
        {modalAction === "Transfer" && activeMembershipId && (
          <TransferMembership
            membershipId={activeMembershipId}
            onUpdate={onUpdate}
            closeModal={closeModal}
            // paid_amount={memberships.find((item) => item.id === activeMembershipId)?.paid_amount || 0}
            //@ts-ignore
            end_date={
              memberships.find((item) => item.id === activeMembershipId)
                ?.end_date
            }
            member_name={
              memberships.find((item) => item.id === activeMembershipId)
                ?.member_details.name
            }
            member_image={
              memberships.find((item) => item.id === activeMembershipId)
                ?.member_details.member_image
            }
          />
        )}
        <AddMembership
          m_id={id}
          open={addMembership}
          setOpen={setAddMembership}
          onSuccess={() => {
            setAddMembership(false);
            fetchMemberships();
            setCurrentPage(1);
          }}
        />
        {modalAction === "addTrainer" && activeMembershipId && (
          <AddTrainer
            membershipId={activeMembershipId}
            onUpdate={onUpdate}
            closeModal={closeModal}
          />
        )}
      </WidgetCard>
    </section>
  );
};

export default Membership;
