import { Drawer, Button, Title, Text, Loader } from "rizzui";
import { useState, useEffect } from "react";
// import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { formatDate } from "@core/utils/format-date";
import { TbClockHour4Filled } from "react-icons/tb";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdArrowForwardIos, MdOutlineDateRange } from "react-icons/md";
import ClassBook from "./ClassBook";
import dayjs from "dayjs";
import { DatePicker } from "@core/ui/datepicker";
import { FaClipboardList, FaX } from "react-icons/fa6";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
// import { XIcon } from "lucide-react";

export default function PublicBooking({
  gymId,
  paramDate,
  paramId,
}: {
  gymId: string;
  paramId: string | null;
  paramDate: string | null;
}) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSeven, setIsSeven] = useState(false);
  const [selectedDate2, setSelectedDate2] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<any>(null);

  useEffect(() => {
    const getSessions = async () => {
      setLoading(true);
      const resp = await AxiosPublic.get(
        `/api/classes/available/v2/?gym_id=${gymId}&end_date=${formatDate(selectedDate, "YYYY-MM-DD")}`,
        {
          id: `Center-${gymId}-${formatDate(selectedDate, "YYYY-MM-DD")}`,
        }
      );
      console.log(resp.data);
      setSessions(resp.data);
      setLoading(false);
    };

    if (gymId) getSessions();
  }, [gymId, selectedDate]);

  useEffect(() => {
    if (paramDate && paramId) {
      setSelectedId(paramId);
      setSelectedDate2(new Date(paramDate));
      setIsOpen(true);
    }
  }, []);

  const onClose = () => {
    setSelectedId(null);
    setSelectedDate2(null);

    setIsDrawerOpen(false);
  };

  const dateOptions = [
    {
      label: "Today",
      value: dayjs().toDate(),
    },
    {
      label: "Tomorrow",
      value: dayjs().add(1, "day").toDate(),
    },
    {
      label: "Upcoming 7 Days",
      value: dayjs().add(7, "days").toDate(),
    },
  ];
  useEffect(() => {
    if (selectedDate.getDate() === dateOptions[2].value.getDate()) {
      setIsSeven(true);
    }
  }, [selectedDate]);

  return (
    <>
      <Button
        className="flex gap-2 items-center self-end"
        onClick={() => setIsDrawerOpen(true)}
      >
        Continue
        <FaClipboardList />
      </Button>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        className="z-[999999]"
        containerClassName="p-4 md:p-6 custom-scrollbar overflow-y-auto "
        customSize={650}
      >
        <div className="flex items-center justify-between">
          <Title as="h4" className="mb-4">
            Book a Session
          </Title>
          <FaX
            className="cursor-pointer text-primary"
            onClick={() => setIsDrawerOpen(false)}
          />
        </div>
        <div className="p-1 space-y-4">
          <div className="flex gap-2 mb-6">
            {dateOptions.map((option) => (
              <Button
                key={option.label}
                variant={
                  selectedDate.getDate() === option.value.getDate()
                    ? "solid"
                    : "outline"
                }
                onClick={() => {
                  setSelectedDate(option.value);
                }}
                size="sm"
                // className="flex-1 py-3"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="flex">
            {isSeven && selectedDate2 === null ? (
              <DatePicker
                value={selectedDate2}
                placeholderText="Select Date for Session"
                onChange={(value) => {
                  setSelectedDate2(value);
                }}
                maxDate={dateOptions[2].value}
                minDate={dateOptions[0].value}
                className="scale-95 z-[999999999]"
              />
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDate2(null);
                }}
                className={isSeven ? "" : "hidden"}
                variant="flat"
              >
                Select New Date
              </Button>
            )}
          </div>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <Title as="h6">Available Sessions</Title>
            {loading ? (
              <div className="min-w-full flex items-center justify-center my-4">
                <Loader variant="threeDot" />
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="cursor-pointer hover:bg-blue-50 rounded-lg shadow p-4 hover:shadow-lg duration-150"
                  onClick={() => {
                    // Handle booking logic
                  }}
                >
                  <div className="space-y-1.5">
                    <Title as="h6" className="capitalize">
                      {session.title}
                    </Title>
                    <div className="flex items-center flex-nowrap gap-2">
                      <TbClockHour4Filled className="text-blue-500 size-5" />
                      <Text className="text-sm text-gray-600">
                        {formatDate(
                          new Date(`2025-01-01T${session.start_time}`),
                          "hh:mm A"
                        )}{" "}
                        -{" "}
                        {formatDate(
                          new Date(`2025-01-01T${session.end_time}`),
                          "hh:mm A"
                        )}
                      </Text>
                    </div>
                    <Text className="text-sm flex items-center">
                      <FaChalkboardTeacher className="text-blue-500 size-5 mr-2" />{" "}
                      {session.trainer.name}
                    </Text>
                    <div className="flex items-center gap-2">
                      <MdOutlineDateRange className="text-blue-500 size-5" />
                      <Text>
                        {formatDate(
                          new Date(session.event_start_date),
                          "MMM DD"
                        )}{" "}
                        -{" "}
                        {formatDate(new Date(session.event_end_date), "MMM DD")}
                      </Text>
                    </div>
                    {session.recurrence_type === "weekly" && (
                      <div className="flex items-center gap-1">
                        {`[`}
                        {session.weekdays.map((day: string, index: number) => (
                          <>
                            <Text className="capitalize">
                              {day.substring(0, 3)}
                            </Text>
                            {index !== session.weekdays.length - 1 && ", "}
                          </>
                        ))}
                        {`]`}
                      </div>
                    )}

                    <div className="min-w-full flex items-center gap-8 justify-end mr-2 mt-2">
                      <Button
                        size="sm"
                        className="scale-105"
                        onClick={() => {
                          setIsOpen(true);
                          setSelectedId(session.id);
                        }}
                        disabled={selectedDate2 === null && isSeven}
                      >
                        Book Session for{" "}
                        {formatDate(
                          isSeven ? (selectedDate2 ?? "") : selectedDate,
                          "MMM, DD"
                        )}
                        <MdArrowForwardIos className="ml-2 animate-pulse" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Drawer>
      <ClassBook
        gymId={gymId}
        date={formatDate(selectedDate, "YYYY-MM-DD")}
        classVal={sessions.find(
          (session) => session.id.toString() === selectedId?.toString()
        )}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onClose={onClose}
      />
    </>
  );
}
