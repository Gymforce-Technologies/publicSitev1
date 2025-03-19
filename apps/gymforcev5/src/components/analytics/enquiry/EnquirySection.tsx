"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
// import { filterOptions } from "../../Filter";
import dayjs from "dayjs";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { DatePicker } from "@core/ui/datepicker";
import {
  Announcement,
  Avatar,
  Badge,
  Button,
  Loader,
  Select,
  Text,
} from "rizzui";
import toast from "react-hot-toast";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import CategoryStats from "@/components/analytics/enquiry/CategoryStats";
import SeasonalTrend from "@/components/analytics/enquiry/SeasonalTrend";
import SourceStat from "@/components/analytics/enquiry/SourceStat";
import StatCards from "@/components/analytics/enquiry/StatsCard";
import WidgetCard from "@core/components/cards/widget-card";
import Table from "@/components/table";
import cn from "@core/utils/class-names";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import Pagination from "@core/ui/pagination";
import AnalyticsFilter from "../AnalyticsFilter";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import Image from "next/image";
interface Filters {
  // status: string;
  dateRange: string;
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

interface EnquiryMember {
  category_details: string | null;
  converted: boolean;
  converted_at: string;
  gender: string;
  id: number;
  localid: number;
  name: string;
  phone: string;
  source_details: string;
  total_duration: number;
  total_followups: number;
  visiting_date: string;
  visitor_image: string | null;
}

export default function EnquirySection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState<Filters>({
    dateRange: filterOptions[4].value,
    startDate: `${dayjs().year()}-01-01`,
    endDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
  });
  const [column, setColumn] = useState<keyof EnquiryMember>("id");
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);
  const [loadList, setLoadList] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleFilterChange = (key: keyof Filters, value: string | Date) => {
    const formattedValue =
      value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
    setFilters((prev) => ({ ...prev, [key]: formattedValue }));
  };
  const handleFilterRange = (value: any) => {
    setFilters((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
    handleFilterChange("dateRange", value);
  };
  const getData = async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const metricsstat = await AxiosPrivate.get(
        `/api/enquiry-analysis/metrics/?gym_id=${gymId}${filters.startDate ? `&start_date=${filters.startDate}` : ""}${filters.endDate ? `&end_date=${filters.endDate}` : ""}`,
        {
          id: newID(
            `enquiry-analysis-metrics-${filters.startDate}-${filters.endDate}`
          ),
        }
      );
      setMetrics(metricsstat.data);
    } catch (error) {
      console.log("Error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getData();
    getDataList(currentPage);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getDataList(page);
  };

  const getDataList = async (page: number) => {
    setLoadList(true);
    const gymId = await retrieveGymId();
    const lists = await AxiosPrivate.get(
      `/api/enquiry-analysis/lists/?gym_id=${gymId}${filters.startDate ? `&start_date=${filters.startDate}` : ""}${filters.endDate ? `&end_date=${filters.endDate}` : ""}&page=${page}`,
      {
        id: newID(
          `enquiry-analysis-lists-${filters.startDate}-${filters.endDate}-${page}`
        ),
      }
    );
    setData(lists.data.results);
    setLoadList(false);
    setTotalPages(lists.data.total_pages);
  };

  useEffect(() => {
    const getPreq = async () => {
      const demoInfo = await getDemographicInfo();
      setDemographic(demoInfo);
    };
    // getData();
    getPreq();
  }, []);

  const getColumns = useCallback(
    (column: keyof EnquiryMember) => [
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
        width: 200,
        render: (value: string, row: EnquiryMember) => (
          <figure className={cn("flex items-center gap-3")}>
            {/* <Avatar
              name={value}
              src={
                row.visitor_image !== null
                  ? row.visitor_image
                  : row?.gender && row.gender[0].toLowerCase() === "f"
                    ? "https://images.gymforce.in/woman-user-circle-icon.png"
                    : "https://images.gymforce.in/man-user-circle-icon.png"
              }
            /> */}
            <Image
              alt={value}
              src={
                row.visitor_image ||
                (row?.gender && row?.gender[0]?.toLowerCase() === "f"
                  ? WomanIcon
                  : ManIcon)
              }
              height={40}
              width={40}
              className="size-10 rounded-full"
            />
            <figcaption className="grid gap-0.5">
              <Text className="font-lexend text-sm font-medium text-nowrap text-clip text-gray-900 hover:text-primary">
                {value}
              </Text>
              <Text className="text-[13px]">{row.phone}</Text>
            </figcaption>
          </figure>
        ),
      },
      {
        title: "Visiting Date",
        dataIndex: "visiting_date",
        key: "visiting_date",
        width: 120,
        render: (visiting_date: string) => (
          <Text>{formateDateValue(new Date(visiting_date))}</Text>
        ),
      },
      {
        title: "Source",
        dataIndex: "source_details",
        key: "source_details",
        width: 120,
        render: (source: string) => <Text>{source || "N/A"}</Text>,
      },
      {
        title: "Category",
        dataIndex: "category_details",
        key: "category_details",
        width: 120,
        render: (category: string | null) => (
          <Text className="font-semibold">{category || "Uncategorized"}</Text>
        ),
      },
      // {
      //   title: "Follow-ups",
      //   dataIndex: "total_followups",
      //   key: "total_followups",
      //   width: 100,
      //   render: (followups: number) => <Text>{followups}</Text>,
      // },
      {
        title: "Conversion",
        dataIndex: "converted_at",
        key: "converted_at",
        width: 120,
        render: (converted_at: string, row: EnquiryMember) =>
          !row.converted ? (
            <Badge color="danger" variant="flat">
              Not Converted
            </Badge>
          ) : (
            <Text>
              {converted_at ? formateDateValue(new Date(converted_at)) : "N/A"}
            </Text>
          ),
      },
    ],
    [column, data]
  );

  // Usage
  const columns = useMemo(() => getColumns(column), [column, getColumns]);

  const applyFilters = async () => {
    setCurrentPage(1);
    await getData();
    await getDataList(1);
  };

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
      <div className="grid grid-cols-2 gap-10 lg:mx-8">
        <div className="col-span-full grid lg:grid-cols-[60%,40%] gap-8">
          <div className="col-span-full grid lg:grid-cols-2 gap-8">
            {loading || metrics === null ? (
              <div className="min-w-full flex items-center justify-center my-8">
                <Loader variant="threeDot" size="lg" />
              </div>
            ) : (
              <StatCards
                data={{
                  avg_conversion_time: metrics?.avg_conversion_time,
                  conversion_rate: metrics?.conversion_rate,
                  converted_enquiries: metrics?.converted_enquiries,
                  follow_up_success_rate: metrics?.follow_up_success_rate,
                  lost_enquiries: metrics?.lost_enquiries,
                  total_enquiries: metrics?.total_enquiries,
                }}
              />
            )}
            {loading || metrics === null ? (
              <div className="min-w-full flex items-center justify-center my-8">
                <Loader variant="threeDot" size="lg" />
              </div>
            ) : (
              <CategoryStats
                data={metrics.categories}
                total={metrics.total_enquiries}
              />
            )}
          </div>
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <SeasonalTrend
              data={metrics.seasonal_trends}
              total={metrics.total_enquiries}
            />
          )}
          {loading || metrics === null ? (
            <div className="min-w-full flex items-center justify-center my-8">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <SourceStat
              data={metrics.enquiry_sources}
              total={metrics.total_enquiries}
            />
          )}
        </div>
      </div>
      <WidgetCard title="Enquiry's List" className="lg:ml-8">
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
