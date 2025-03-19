"use client";

import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { getColumns } from "./due-columns";
import BasicTableWidget from "@/components/controlled-table/basic-table-restructured";
import { Membership, SortProps } from "@/components/membership/section/DueList";
import { Button, Input, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { ArrowRight, FilterIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import toast from "react-hot-toast";
import { isStaff } from "@/app/[locale]/auth/Staff";
import Link from "next/link";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { FaList } from "react-icons/fa6";
import { MdOutlineGridView } from "react-icons/md";
import PendingCardList from "./PendingCardList";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";

interface Filters {
  dateRange: string;
  memberName: string;
  startDate: string;
  endDate: string;
}

interface PendingListProps {
  data: Membership[];
  hideInfo?: boolean;
  title?: string;
  getdueData: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isLoading: boolean;
  filters: Filters;
  setIsDrawerOpen: (value: boolean) => void;
  extendRefresh: () => void;
  onHeaderSort: (headerKey: keyof Membership | null) => void;
  sort: SortProps;
  dueFilter: string | null;
  setDueFilter: Dispatch<SetStateAction<string | null>>;
  transactionInfo: {
    title: string;
    value: number;
    icon: JSX.Element;
    req: string;
  }[];
}

export default function PendingList({
  data,
  hideInfo,
  title,
  getdueData,
  searchTerm,
  setSearchTerm,
  isLoading,
  filters,
  setIsDrawerOpen,
  extendRefresh,
  sort,
  onHeaderSort,
  dueFilter,
  setDueFilter,
  transactionInfo,
}: PendingListProps) {
  const [demographiInfo, setDemographicInfo] = useState<any>(null);
  const [isValid, setIsValid] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [view, setView] = useState<"grid" | "table">("table");
  const router = useRouter();
  const [access, setAccess] = useState<boolean>(true);

  const checkValidity = () => {
    if (!isValid) {
      toast.error("Please Subscribe to Proceed Further");
      if (auth) {
        router.push("/subscription/plans");
      }
      return;
    }
  };

  const memoizedGetColumns = useMemo(() => getColumns, []);

  const dueColumns = useCallback(
    (props: any) =>
      memoizedGetColumns({
        ...props,
        getdueData,
        demographiInfo,
        checkValidity,
        extendRefresh,
        hideInfo,
        onHeaderSort,
        sort,
        auth: auth,
        access,
      }),
    [
      memoizedGetColumns,
      getdueData,
      demographiInfo,
      checkValidity,
      hideInfo,
      extendRefresh,
      onHeaderSort,
      sort,
      auth,
      access,
    ]
  );

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
        response.data.permissions["mainPaymentManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  useEffect(() => {
    async function getInfo() {
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
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
    }
    getInfo();
  }, []);

  return (
    <WidgetCard
      className="relative dark:bg-inherit "
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
      title={title || "Pending Payments"}
      titleClassName="whitespace-nowrap "
      action={
        !hideInfo ? (
          <div className="flex items-center min-w-full">
            <div className=" hidden md:flex  items-center gap-2">
              <Button
                size="sm"
                className="flex gap-1.5 items-center"
                variant={dueFilter === "past" ? "solid" : "flat"}
                onClick={() => setDueFilter("past")}
              >
                <IoMdArrowDropleft size={18} />
                Missed
                <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                  {
                    transactionInfo.find(
                      (item) => item.req === "missed_dues_counts"
                    )?.value
                  }
                </Text>
              </Button>
              {/* <Button
                size="sm"
                variant={filter === "today" ? "solid" : "flat"}
                onClick={() => setFilter("today")}
                className="flex gap-1.5 items-center"
              >
                Today
                <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                  {todayCount}
                </Text>
              </Button> */}
              <Button
                size="sm"
                className="flex gap-1.5 items-center"
                variant={dueFilter === "upcoming" ? "solid" : "flat"}
                onClick={() => setDueFilter("upcoming")}
              >
                <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                  {
                    transactionInfo.find(
                      (item) => item.req === "upcoming_due_counts"
                    )?.value
                  }
                </Text>
                Upcoming
                <IoMdArrowDropright size={18} />
              </Button>
            </div>
            <div className="w-full hidden md:flex justify-end items-center gap-4 ">
              <Input
                type="search"
                placeholder="Search ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                clearable
                onClear={() => setSearchTerm("")}
                className=" max-w-[320px]"
              />
              <Button onClick={() => setIsDrawerOpen(true)}>
                Filters <FilterIcon className="ml-2" />
              </Button>
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
            </div>
          </div>
        ) : (
          <Link
            href={"/membership/due-list"}
            className=" w-full  justify-end gap-1 items-center  hidden md:flex hover:text-primary"
          >
            View All <ArrowRight className="animate-pulse size-4 mx-1" />
          </Link>
        )
      }
    >
      {!hideInfo ? (
        <div className="w-full flex flex-col md:hidden justify-start gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex gap-1.5 items-center"
              variant={dueFilter === "past" ? "solid" : "flat"}
              onClick={() => setDueFilter("past")}
            >
              <IoMdArrowDropleft size={18} />
              Missed
              <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                {
                  transactionInfo.find(
                    (item) => item.req === "missed_dues_counts"
                  )?.value
                }
              </Text>
            </Button>
            {/* <Button
                size="sm"
                variant={filter === "today" ? "solid" : "flat"}
                onClick={() => setFilter("today")}
                className="flex gap-1.5 items-center"
              >
                Today
                <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                  {todayCount}
                </Text>
              </Button> */}
            <Button
              size="sm"
              className="flex gap-1.5 items-center"
              variant={dueFilter === "upcoming" ? "solid" : "flat"}
              onClick={() => setDueFilter("upcoming")}
            >
              <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                {
                  transactionInfo.find(
                    (item) => item.req === "upcoming_due_counts"
                  )?.value
                }
              </Text>
              Upcoming
              <IoMdArrowDropright size={18} />
            </Button>
          </div>
          <Input
            type="search"
            placeholder="Search ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            clearable
            onClear={() => setSearchTerm("")}
            // className=" "
          />
          <Button onClick={() => setIsDrawerOpen(true)}>
            Filters <FilterIcon className="ml-2" />
          </Button>
        </div>
      ) : (
        <Link
          href={"/membership/due-list"}
          className=" w-full flex justify-end gap-1 items-center md:hidden hover:text-primary"
        >
          View All <ArrowRight className="animate-pulse size-4" />
        </Link>
      )}

      <>
        <div className="max-md:hidden">
          {view === "grid" ? (
            <PendingCardList
              checkValidity={checkValidity}
              data={data}
              getdueData={getdueData}
              demographiInfo={demographiInfo}
              extendRefresh={extendRefresh}
              auth={auth}
              access={access}
            />
          ) : (
            <BasicTableWidget
              title=""
              //@ts-ignore
              variant="nope"
              data={data}
              getColumns={dueColumns}
              scroll={{ y: 500 }}
              enableSearch={false}
              isLoading={isLoading}
              className=" mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 [&_.rc-table-thead_tr]:bg-gray-100 "
            />
          )}
        </div>
        <div className="md:hidden">
          <PendingCardList
            checkValidity={checkValidity}
            data={data}
            getdueData={getdueData}
            demographiInfo={demographiInfo}
            extendRefresh={extendRefresh}
            auth={auth}
            access={access}
          />
        </div>
      </>
    </WidgetCard>
  );
}
