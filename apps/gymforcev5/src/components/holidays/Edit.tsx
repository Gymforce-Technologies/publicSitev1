import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { getGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Drawer, Input, Loader, Select, Title, Text } from "rizzui";
import toast from "react-hot-toast";
import { DatePicker } from "@core/ui/datepicker";
import { formatDate } from "@core/utils/format-date";

// Define interfaces for both holiday types
interface RegularHoliday {
  id: number;
  day_of_week: string;
}

interface OccasionalHoliday {
  id: number;
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

export default function EditHoliday({
  setIsEditOpen,
  fetchHolidays,
  holiday,
  setHoliday,
  holidayType,
}: {
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchHolidays: () => Promise<void>;
  holiday: RegularHoliday | OccasionalHoliday | null;
  setHoliday: React.Dispatch<
    React.SetStateAction<RegularHoliday | OccasionalHoliday | null>
  >;
  holidayType: "regular" | "occasional";
}) {
  // State for edited holiday
  const [editedHoliday, setEditedHoliday] = useState<
    RegularHoliday | OccasionalHoliday
  >({
    id: 0,
    ...(holidayType === "regular"
      ? { day_of_week: "" }
      : {
          start_date: "",
          end_date: "",
          description: "",
        }),
  });

  const [isLoading, setIsLoading] = useState(false);

  // Populate edit form when holiday changes
  useEffect(() => {
    if (holiday) {
      setEditedHoliday({ ...holiday });
    }
  }, [holiday]);

  const handleEditHoliday = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await getGymId();

      if (holidayType === "regular") {
        // Validate regular holiday
        const regularHoliday = editedHoliday as RegularHoliday;
        if (!regularHoliday.day_of_week) {
          toast.error("Please select a day of week");
          return;
        }

        // Update regular holiday
        await AxiosPrivate.patch(
          `/api/gym-regular-holidays/${regularHoliday.id}/?gym_id=${gymId}`,
          { day_of_week: regularHoliday.day_of_week }
        );
      } else {
        // Validate occasional holiday
        const occasionalHoliday = editedHoliday as OccasionalHoliday;
        if (
          !occasionalHoliday.start_date ||
          !occasionalHoliday.end_date ||
          !occasionalHoliday.description
        ) {
          toast.error("Please fill all occasional holiday fields");
          return;
        }

        // Update occasional holiday
        await AxiosPrivate.patch(
          `/api/gym-occasional-holidays/${occasionalHoliday.id}/?gym_id=${gymId}`,
          {
            start_date: occasionalHoliday.start_date,
            end_date: occasionalHoliday.end_date,
            description: occasionalHoliday.description,
          }
        );
      }

      // Reset and close modal
      setIsEditOpen(false);
      invalidateAll();
      fetchHolidays();
      setHoliday(null);
      toast.success("Holiday Updated Successfully");
    } catch (error) {
      console.error("Error editing holiday:", error);
      toast.error("Failed to update holiday");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer isOpen={true} onClose={() => setIsEditOpen(false)} size="md">
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-2 gap-4 p-6 md:p-8">
          <div className="flex items-center justify-between mb-2 col-span-full">
            <Title as="h3" className="text-gray-900">
              Edit {holidayType === "regular" ? "Regular" : "Occasional"}{" "}
              Holiday
            </Title>
            <XIcon
              onClick={() => setIsEditOpen(false)}
              className="cursor-pointer"
            />
          </div>

          {holidayType === "regular" && (
            <div className="col-span-full">
              <Select
                label="Day of Week"
                options={DAYS_OF_WEEK.map((day) => ({
                  value: day,
                  label: day,
                }))}
                value={(editedHoliday as RegularHoliday).day_of_week}
                onChange={(option: any) =>
                  setEditedHoliday((prev) => ({
                    ...prev,
                    day_of_week: option.value as string,
                  }))
                }
                placeholder="Select Day of Week"
              />
            </div>
          )}

          {/* Occasional Holiday Fields */}
          {holidayType === "occasional" && (
            <>
              <div className="flex flex-col gap-1 col-span-full">
                <Text>Start Date</Text>
                <DatePicker
                  name="start_date"
                  value={
                    (editedHoliday as OccasionalHoliday).start_date
                      ? formatDate(
                          new Date(
                            (editedHoliday as OccasionalHoliday).start_date
                          )
                        )
                      : ""
                  }
                  selected={
                    new Date((editedHoliday as OccasionalHoliday).start_date)
                  }
                  onChange={(date: any) =>
                    setEditedHoliday((prev) => ({
                      ...prev,
                      start_date: formatDate(date, "YYYY-MM-DD"),
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
                    (editedHoliday as OccasionalHoliday).end_date
                      ? formatDate(
                          new Date(
                            (editedHoliday as OccasionalHoliday).end_date
                          )
                        )
                      : ""
                  }
                  selected={
                    new Date((editedHoliday as OccasionalHoliday).end_date)
                  }
                  onChange={(date: any) =>
                    setEditedHoliday((prev) => ({
                      ...prev,
                      end_date: formatDate(date, "YYYY-MM-DD"),
                    }))
                  }
                  placeholderText="Select the End Date"
                  showMonthDropdown={true}
                  showYearDropdown={true}
                  scrollableYearDropdown={true}
                  minDate={
                    new Date((editedHoliday as OccasionalHoliday).start_date)
                  }
                  dateFormat="yyyy-MM-dd"
                  className="w-full"
                />
              </div>
              <div className="col-span-full">
                <Input
                  label="Description"
                  value={(editedHoliday as OccasionalHoliday).description}
                  onChange={(e) =>
                    setEditedHoliday((prev) => ({
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
          <Button onClick={handleEditHoliday} className="w-full">
            {isLoading ? <Loader variant="threeDot" /> : "Update Holiday"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
