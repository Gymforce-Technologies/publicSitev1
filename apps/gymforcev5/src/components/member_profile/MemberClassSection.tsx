"use client";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Calendar, Clock } from "lucide-react";
import { Loader, Text, Select, Button } from "rizzui";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import Pagination from "@core/ui/pagination";
import DateCell from "@core/ui/date-cell";
import {
  formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
import MetricCard from "@core/components/cards/metric-card";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

interface Class {
  id: number;
  occurrence_date: string;
  created_at: string;
  member: number;
  group_class: number;
  gym: number;
}

interface ClassesResponse {
  upcoming_classes_count: number;
  attended_classes_count: number;
  classes: {
    count: number;
    results: Class[];
    current_page: number;
    total_pages: number;
  };
}

interface MetricType {
  title: string;
  metric: number;
  icon: React.ReactNode;
  req: string;
}

export default function MemberClassSection({
  params,
}: {
  params: { id: string };
}) {
  const newId = params.id.toString().split("-")[1];
  const [classFilter, setClassFilter] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassesResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const metrics: MetricType[] = [
    {
      title: "Upcoming Classes",
      metric: classData?.upcoming_classes_count || 0,
      icon: <Calendar className="h-6 w-6" />,
      req: "upcoming",
    },
    {
      title: "Attended Classes",
      metric: classData?.attended_classes_count || 0,
      icon: <Clock className="h-6 w-6" />,
      req: "attended",
    },
  ];
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  const getDetails = async (page: number = 1) => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/member/${newId}/classes?gym_id=${gymId}&${classFilter === "attended" ? "filter=attended" : ""}&page=${page}`,
        {
          id: newID(`classes-${newId}-${classFilter}`),
        }
      );
      setClassData(resp.data);
      setCurrentPage(page);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, [classFilter]);

  const getColumns = useCallback(
    () => [
      {
        title: (
          <HeaderCell title="Class ID" className="text-sm font-semibold" />
        ),
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number) => <Text className="pl-2">#{id}</Text>,
      },
      {
        title: <HeaderCell title="Date" className="text-sm font-semibold" />,
        dataIndex: "occurrence_date",
        key: "occurrence_date",
        width: 200,
        render: (date: string) => (
          <Text>{formateDateValue(new Date(date))}</Text>
        ),
      },
      {
        title: <HeaderCell title="Booked" className="text-sm font-semibold" />,
        dataIndex: "created_at",
        key: "created_at",
        width: 250,
        render: (datetime: string) => (
          <DateCell
            date={new Date(datetime)}
            dateFormat={getDateFormat()}
            timeFormat="hh:mm A "
          />
        ),
      },
      {
        title: (
          <HeaderCell title="Group ID" className="text-sm font-semibold" />
        ),
        dataIndex: "group_class",
        key: "group_class",
        width: 150,
        render: (classId: number) => <Text>{classId}</Text>,
      },
    ],
    []
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  return (
    <div className="p-4">
      <div className="relative flex w-full items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>
        <div
          className="max-xl:flex items-center p-2 gap-4 xl:grid grid-cols-5 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
          ref={sliderEl}
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              onClick={() => setClassFilter(metric.req)}
              className="cursor-pointer"
            >
              <MetricCard
                title={metric.title}
                metric={metric.metric}
                icon={metric.icon}
                className={`shadow hover:scale-105 border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 !p-2.5 ${
                  classFilter === metric.req
                    ? "bg-primary-lighter "
                    : "hover:bg-primary-lighter "
                }`}
                iconClassName={`text-primary bg-primary-lighter max-sm:size-[36px]  duration-200 transition-all ${
                  classFilter === metric.req
                    ? "text-white bg-primary"
                    : "group-hover:text-white group-hover:bg-primary"
                }`}
                titleClassName={`text-nowrap max-lg:text-xs text-[15px] font-medium max-lg:max-w-[110px] truncate ${
                  classFilter === metric.req
                    ? "text-primary"
                    : "group-hover:text-primary"
                }`}
                metricClassName="text-primary max-lg:text-base text-center"
              />
            </div>
          ))}
        </div>
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>

      <WidgetCard
        className="relative dark:bg-inherit"
        title="Member Classes"
        titleClassName="whitespace-nowrap"
      >
        {loading ? (
          <div className="grid h-32 flex-grow place-content-center items-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <>
            <Table
              variant="minimal"
              data={classData?.classes.results || []}
              columns={columns}
              scroll={{ y: 500 }}
              className="text-sm mt-4 text-nowrap md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-50"
            />
            <div className="flex justify-end mt-4">
              <Pagination
                total={classData?.classes.count || 0}
                current={currentPage}
                pageSize={10}
                onChange={(page) => getDetails(page)}
              />
            </div>
          </>
        )}
      </WidgetCard>
    </div>
  );
}
