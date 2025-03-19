"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
// import { filterOptions } from "../../Filter";
import dayjs from "dayjs";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import {
  Announcement,
  Avatar,
  Badge,
  Button,
  Loader,
  Select,
  Text,
} from "rizzui";
// import toast from "react-hot-toast";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import AgeGroup from "@/components/analytics/member/AgeGroup";
import GrowthTrend from "@/components/analytics/member/GrowthTrend";
import GenderDistribution from "@/components/analytics/member/GenderStats";
import StatusDistribution from "@/components/analytics/member/StatusDis";
import ActiveVsExpired from "@/components/analytics/member/ActiveExpired";
import Link from "next/link";
import cn from "@core/utils/class-names";
import Table from "@/components/rizzui/table/table";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import WidgetCard from "@core/components/cards/widget-card";
import Pagination from "@core/ui/pagination";
import AnalyticsFilter from "../AnalyticsFilter";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import Image from "next/image";

interface Filters {
  // status: string;
  dateRange: string;
  // memberName: string;
  startDate: string;
  endDate: string;
}
const filterOptions = [
  { label: "Today", value: "daily" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Week", value: "weekly" },
  { label: "Month", value: "monthly" },
  { label: "Year", value: "yearly" },
];
interface Member {
  email: string;
  id: number;
  joining_date: string;
  localid: number;
  member_image: string | null;
  membership_purchase_count: number;
  name: string;
  phone: string;
  status: string;
  total_business: number;
}

export default function MemberSection() {
  const [loading, setLoading] = useState(true);
  const [loadList, setLoadList] = useState(true);
  const [data, setData] = useState<Member[] | null>(null);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[4].value,
    startDate: `${dayjs().year()}-01-01`,
    endDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
  });
  const [column, setColumn] = useState<keyof Member>("id");
  const [metrics, setMetrics] = useState<any>(null);
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    const formattedValue =
      value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
    setFilters((prev) => ({ ...prev, [key]: formattedValue }));
  };
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getData = async () => {
    const gymId = await retrieveGymId();
    try {
      setLoading(true);
      const metrics = await AxiosPrivate.get(
        `/api/member-analysis/metrics/?gym_id=${gymId}${filters.startDate ? `&start_date=${filters.startDate}` : ""}${filters.endDate ? `&end_date=${filters.endDate}` : ""}`,
        {
          id: newID(
            `member-analysis-metrics-${filters.startDate}-${filters.endDate}`
          ),
        }
      );
      console.log(metrics);
      setMetrics(metrics.data);
    } catch {
      console.log("Error");
    } finally {
      setLoading(false);
    }
  };

  const getDataList = async (page: number) => {
    const gymId = await retrieveGymId();
    try {
      setLoadList(true);
      const lists = await AxiosPrivate.get(
        `/api/member-analysis/lists/?gym_id=${gymId}${filters.startDate ? `&start_date=${filters.startDate}` : ""}${filters.endDate ? `&end_date=${filters.endDate}` : ""}&page=${page}`,
        {
          id: newID(
            `member-analysis-list-${filters.startDate}-${filters.endDate}-${page}`
          ),
        }
      );
      console.log(lists);
      setData(lists.data.results);
      setTotalPages(lists.data.total_pages);
    } catch {
      console.log("Error");
    } finally {
      setLoadList(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getDataList(page);
  };
  useEffect(() => {
    const getPreq = async () => {
      const demoInfo = await getDemographicInfo();
      setDemographic(demoInfo);
    };
    getData();
    getDataList(currentPage);
    getPreq();
  }, []);

  const applyFilters = async () => {
    // if (filters.dateRange && filters.startDate && filters.endDate) {
    //   if (
    //     !validateDateRange(
    //       filters.dateRange,
    //       filters.startDate,
    //       filters.endDate
    //     )
    //   ) {
    //     toast.error(
    //       `Invalid date range for ${filters.dateRange} filter. Please adjust your dates.`
    //     );
    //     return;
    //   } else {
    //     // setFilterInfo(filters.dateRange);
    //   }
    // }
    setCurrentPage(1);
    await getData();
    await getDataList(1);
  };
  const getColumns = useCallback(
    (column: keyof Member) => [
      {
        title: "ID",
        dataIndex: "localid",
        key: "localid",
        width: 80,
        render: (localid: number) => <Text>#{localid}</Text>,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 250,
        render: (value: string, row: any) => (
          <figure className={cn("flex items-center gap-3")}>
            {/* <Avatar
              name={value}
              src={
                row.member_image !== null
                  ? row.member_image
                  : row?.gender && row?.gender[0]?.toLowerCase() === "f"
                    ? "https://images.gymforce.in/woman-user-circle-icon.png"
                    : "https://images.gymforce.in/man-user-circle-icon.png"
              }
              // className="dark:text-gray-200"
            /> */}
            <Image
              alt={value}
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
              <Link href={`/member_profile/yk62-${row.id}-71he`}>
                {/* yk$6372h$e */}
                <Text className="font-lexend text-sm font-medium text-nowrap text-clip text-gray-900 hover:text-primary">
                  {value}
                </Text>
              </Link>
              <Text className="text-[13px] ">{row.phone}</Text>
            </figcaption>
          </figure>
        ),
      },
      {
        title: "Joining Date",
        dataIndex: "joining_date",
        key: "joining_date",
        width: 100,
        render: (joining_date: string) => (
          <Text>{formateDateValue(new Date(joining_date))}</Text>
        ),
      },

      {
        title: "Purchase",
        dataIndex: "membership_purchase_count",
        key: "membership_purchase_count",
        render: (count: number) => <Text className="mx-auto">{count}</Text>,
        width: 100,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (value: string, row: any) => (
          <Text className={`font-medium text-gray-700 `}>
            {value === "active" ? (
              <Badge color="success" variant="flat">
                Active
              </Badge>
            ) : value === "expired" ? (
              <Badge color="danger" variant="flat">
                Expired
              </Badge>
            ) : value === "upcoming" ? (
              <Badge color="secondary" variant="flat">
                Upcoming
              </Badge>
            ) : null}
          </Text>
        ),
      },
      {
        title: "Total Business",
        dataIndex: "total_business",
        key: "total_business",
        width: 100,
        render: (total_business: number) => (
          <Text className="font-semibold">
            {(demographic ? demographic.currency_symbol : "") +
              " " +
              total_business}
          </Text>
        ),
      },
    ],
    [column, data]
  );
  const columns = useMemo(() => getColumns(column), [column, getColumns]);

  useEffect(() => {
    if (filters.dateRange) {
      const { startDate, endDate, infoText } = getCurrentDateRange(
        filters.dateRange
      );
      setFilters((prev) => ({ ...prev, startDate, endDate }));
      setDateRangeInfo(infoText);
    } else {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      setDateRangeInfo("");
    }
  }, [filters.dateRange]);

  const handleFilterRange = (value: any) => {
    setFilters((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
    handleFilterChange("dateRange", value);
  };

  return (
    <>
      <AnalyticsFilter
        applyFilters={applyFilters}
        dateRangeInfo={dateRangeInfo}
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleFilterRange={handleFilterRange}
        // key={filter}
      />
      <div className="grid lg:grid-cols-2 gap-10 lg:mx-8">
        <div className="col-span-full grid lg:grid-cols-[40%,60%] gap-8">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <ActiveVsExpired
              data={metrics.active_vs_expired}
              total={metrics.total_members}
            />
          )}

          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <GrowthTrend
              data={metrics.growth_trend}
              total={metrics.total_members}
            />
          )}
        </div>
        <div className="col-span-full grid lg:grid-cols-[35%,35%,30%] gap-4">
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <StatusDistribution
              data={metrics.status_distribution}
              total={metrics.total_members}
            />
          )}

          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <AgeGroup data={metrics.age_groups} total={metrics.total_members} />
          )}
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <GenderDistribution
              data={metrics.gender_distribution}
              total={metrics.total_members}
            />
          )}
        </div>
      </div>
      <WidgetCard title="Member's List" className="lg:ml-8">
        {loadList || data === null ? (
          <div className="min-w-full flex items-center justify-center my-8">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={data}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500 }}
            className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap"
          />
        )}
        <div className="flex min-w-full items-center justify-end">
          <Pagination
            total={totalPages}
            current={currentPage}
            onChange={handlePageChange}
            outline={false}
            rounded="md"
            variant="solid"
            color="primary"
            pageSize={1}
            showTitle={true}
          />
        </div>
      </WidgetCard>
    </>
  );
}
