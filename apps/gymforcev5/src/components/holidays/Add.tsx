import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { DatePicker } from "@core/ui/datepicker";
import { XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Drawer, Input, Loader, Title, Select, Text } from "rizzui";

// Define interfaces for both holiday types
interface RegularHoliday {
  day_of_week: string;
}

interface OccasionalHoliday {
  start_date: string;
  end_date: string;
  description: string;
}

// Days of week for regular holidays
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AddHoliday({
  setIsCreateModalOpen,
  fetchHolidays,
}: {
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchHolidays: () => Promise<void>;
}) {
  // State to toggle between holiday types
  const [holidayType, setHolidayType] = useState<"regular" | "occasional">(
    "regular"
  );
  const holidays = [
    { value: "regular", label: "Regular Holiday" },
    { value: "occasional", label: "Occasional Holiday" },
  ];
  // State for regular holiday
  const [regularHoliday, setRegularHoliday] = useState<RegularHoliday>({
    day_of_week: "",
  });

  // State for occasional holiday
  const [occasionalHoliday, setOccasionalHoliday] = useState<OccasionalHoliday>(
    {
      start_date: "",
      end_date: "",
      description: "",
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateHoliday = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();

      if (holidayType === "regular") {
        // Validate regular holiday
        if (!regularHoliday.day_of_week) {
          toast.error("Please select a day of week");
          return;
        }

        // Post regular holiday
        await AxiosPrivate.post(
          `/api/gym-regular-holidays/?gym_id=${gymId}`,
          regularHoliday
        );
      } else {
        // Validate occasional holiday
        if (
          !occasionalHoliday.start_date ||
          !occasionalHoliday.end_date ||
          !occasionalHoliday.description
        ) {
          toast.error("Please fill all occasional holiday fields");
          return;
        }

        // Post occasional holiday
        await AxiosPrivate.post(
          `/api/gym-occasional-holidays/?gym_id=${gymId}`,
          occasionalHoliday
        );
      }

      // Reset and close modal
      setIsCreateModalOpen(false);
      invalidateAll();
      await fetchHolidays();
      toast.success("Holiday Added Successfully");
    } catch (error) {
      console.error("Error creating holiday:", error);
      toast.error("Failed to add holiday");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer isOpen={true} onClose={() => setIsCreateModalOpen(false)} size="md">
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-2 gap-4 p-6 md:p-8">
          <div className="flex items-center justify-between mb-2 col-span-full">
            <Title as="h3" className="text-gray-900">
              Add Holiday
            </Title>
            <XIcon
              onClick={() => setIsCreateModalOpen(false)}
              className="cursor-pointer"
            />
          </div>

          {/* Holiday Type Selector */}
          <div className="col-span-full mb-4">
            <Select
              label="Holiday Type"
              options={holidays}
              value={holidays.find((item) => item.value === holidayType)?.label}
              onChange={(option: any) =>
                setHolidayType(option.value as "regular" | "occasional")
              }
            />
          </div>

          {/* Regular Holiday Fields */}
          {holidayType === "regular" && (
            <div className="col-span-full">
              <Select
                label="Day of Week"
                options={DAYS_OF_WEEK.map((day) => ({
                  value: day,
                  label: day,
                }))}
                value={regularHoliday.day_of_week}
                onChange={(option: any) =>
                  setRegularHoliday((prev) => ({
                    ...prev,
                    day_of_week: option.value,
                  }))
                }
                placeholder="Select Day of Week"
              />
            </div>
          )}

          {/* Occasional Holiday Fields */}
          {holidayType === "occasional" && (
            <>
              {/* <Input
                type="date"
                label="Start Date"
                value={occasionalHoliday.start_date}
                onChange={(e) =>
                  setOccasionalHoliday((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                className="w-full"
                placeholder="Start Date"
              /> */}
              <div className="flex flex-col gap-1 col-span-full">
                <Text>Start Date</Text>
                <DatePicker
                  name="start_date"
                  value={
                    occasionalHoliday.start_date
                      ? formateDateValue(new Date(occasionalHoliday.start_date))
                      : ""
                  }
                  // value={occasionalHoliday.end_date}
                  onChange={(date: any) =>
                    setOccasionalHoliday((prev) => ({
                      ...prev,
                      start_date: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }))
                  }
                  placeholderText="Select the Start Date"
                  showMonthDropdown={true}
                  showYearDropdown={true}
                  scrollableYearDropdown={true}
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 col-span-full">
                <Text>End Date</Text>
                <DatePicker
                  name="end_date"
                  value={
                    occasionalHoliday.end_date
                      ? formateDateValue(new Date(occasionalHoliday.end_date))
                      : ""
                  }
                  // value={occasionalHoliday.end_date}
                  onChange={(date: any) =>
                    setOccasionalHoliday((prev) => ({
                      ...prev,
                      end_date: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }))
                  }
                  placeholderText="Select the End Date"
                  showMonthDropdown={true}
                  showYearDropdown={true}
                  scrollableYearDropdown={true}
                  minDate={new Date(occasionalHoliday.start_date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full"
                />
              </div>
              <div className="col-span-full">
                <Input
                  label="Description"
                  value={occasionalHoliday.description}
                  onChange={(e) =>
                    setOccasionalHoliday((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full"
                  placeholder="Enter holiday description"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-center items-center col-span-full p-6">
          <Button onClick={handleCreateHoliday} className="w-full">
            {isLoading ? <Loader variant="threeDot" /> : "Create Holiday"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
