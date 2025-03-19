import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { DatePicker } from "@core/ui/datepicker";
import dayjs from "dayjs";
import { Announcement, Button, Select, Text } from "rizzui";

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

export default function AnalyticsFilter({
  dateRangeInfo,
  handleFilterRange,
  handleFilterChange,
  filters,
  applyFilters,
}: {
  dateRangeInfo: string;
  handleFilterRange: (value: any) => void;
  handleFilterChange: (key: keyof Filters, value: string | Date) => void;
  filters: Filters;
  applyFilters: () => Promise<void>;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-8 items-end max-lg:relative">
      <div className="relative">
        {dateRangeInfo && (
          <Announcement
            badgeText={dateRangeInfo}
            className=" hidden  md:absolute top-[-12px] right-0"
          />
        )}
        <Select
          label={`Range`}
          options={filterOptions}
          onChange={(option: any) => handleFilterRange(option.value)}
          value={
            filterOptions.find((item) => item.value === filters.dateRange)
              ?.label
          }
        />
      </div>
      {dateRangeInfo && (
        <Announcement
          badgeText={dateRangeInfo}
          className="relative md:hidden "
        />
      )}
      <div className="flex flex-col gap-2">
        <Text className="">Start Date:</Text>
        <DatePicker
          placeholderText="Start Date"
          disabled={
            filters.dateRange === "" ||
            filters.dateRange === "daily" ||
            filters.dateRange === "yesterday"
          }
          // selected={
          //   filters.startDate
          //     ? new Date(formateDateValue(new Date(filters.startDate)))
          //     : null
          // }
          onChange={(date: any) =>
            handleFilterChange(
              "startDate",
              formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
            )
          }
          value={
            filters.startDate
              ? formateDateValue(new Date(filters.startDate))
              : ""
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Text className="">End Date:</Text>
        <DatePicker
          placeholderText="End Date"
          disabled={
            !filters.startDate ||
            filters.dateRange === "" ||
            filters.dateRange === "daily" ||
            filters.dateRange === "yesterday"
          }
          // selected={
          //   filters.endDate
          //     ? new Date(formateDateValue(new Date(filters.endDate)))
          //     : null
          // }
          onChange={(date: any) =>
            handleFilterChange(
              "endDate",
              formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
            )
          }
          value={
            filters.endDate ? formateDateValue(new Date(filters.endDate)) : ""
          }
          minDate={
            filters.startDate ? dayjs(filters.startDate).toDate() : undefined
          }
        />
      </div>
      <Button
        className="w-full col-start-2 max-lg:scale-90 md:col-start-4 lg:col-start-5 "
        onClick={applyFilters}
      >
        Apply
      </Button>
    </div>
  );
}
