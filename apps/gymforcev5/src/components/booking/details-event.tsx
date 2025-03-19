import { useModal } from "@/app/shared/modal-views/use-modal";
// import { CalendarEvent } from "@/types";
import {
  PiMagnifyingGlassBold,
  PiMapPin,
  PiPackage,
  PiUser,
  PiUsers,
  PiVideo,
  PiXBold,
} from "react-icons/pi";
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Drawer,
  Empty,
  Input,
  Loader,
  Popover,
  Tab,
  Text,
  Title,
} from "rizzui";
import cn from "@core/utils/class-names";
import {
  // MdKeyboardDoubleArrowRight,
  MdOutlineCalendarMonth,
  MdOutlineContentCopy,
} from "react-icons/md";
// import useEventCalendar from "@core/hooks/use-event-calendar";
import { formatDate } from "@core/utils/format-date";
const EventForm = dynamic(() => import("./event-form"));
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { FaClock } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import {
  formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
import { XIcon } from "lucide-react";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import toast from "react-hot-toast";
import Link from "next/link";
import { DatePicker } from "@core/ui/datepicker";
import dynamic from "next/dynamic";

type AlertMessage = {
  type: "success" | "danger";
  message: string;
};

function DetailsEvents({
  event,
  onSuccess,
  date,
}: {
  event: any;
  onSuccess?: () => Promise<void>;
  date: Date;
}) {
  const { openModal, closeModal } = useModal();
  const [dateData, setDateData] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [demographics, setDemographics] = useState<DemographicInfo | null>(
    null
  );
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const URL = process.env.NEXT_PUBLIC_URL;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [gymCode, setGymCode] = useState("");
  const [eventDate, setEventDate] = useState(
    formateDateValue(new Date(), "YYYY-MM-DD")
  );
  const [showShare, setShowShare] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleSearch(searchText, true);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, searchText, memberList.length, showMembers, currentMember]);
  const setInfo = async () => {
    const resp = await getDemographicInfo();
    setDemographics(resp);
  };
  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      inputRef.current = null;
    };
  }, []);

  const handleBooking = async () => {
    try {
      setLoadingBooking(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`/api/classes/book/?gym_id=${gymId}`, {
        localid: currentMember.localid,
        class_id: event.id,
        occurrence_date: formateDateValue(date, "YYYY-MM-DD"),
      });
      setAlert({
        type: "success",
        message: "Class Booked Successfully",
      });

      invalidateAll();
      setTimeout(() => {
        setAlert(null);
      }, 2000);
      getDate(date);
      setCurrentMember(null);
      setShowMembers(false);

      if (onSuccess) await onSuccess();
      setMemberList([]);
      setTimeout(() => handleSearch("", false, true), 300);
    } catch (error: any) {
      setAlert({
        type: "danger",
        message: error.response?.data?.error || "Error while Booking",
      });
      setTimeout(() => {
        setAlert(null);
      }, 2000);
    } finally {
      setLoadingBooking(false);
    }
  };
  useEffect(() => {
    const getProfile = async () => {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const urlVal =
        resp.data.associated_gyms.filter(
          (item: any) => item.gym_id === parseInt(gymId ?? "0")
        )[0]?.forceId ?? "";
      setGymCode(urlVal);
    };
    getProfile();
  }, []);

  const handleSearchInputChange = (input: string) => {
    setSearchText(input);
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      handleSearch(input, false, true);
    }, 1000);

    setTimeoutId(newTimeoutId);
  };

  const handleSearch = async (
    searchInput: string,
    isLoadMore: boolean,
    load = false
  ) => {
    try {
      if (load) {
        setLoading2(true);
      }
      if (!isLoadMore || load) {
        setOffset(0);
      }
      // Use the current offset state value directly
      const currentOffset = isLoadMore ? offset : 0;
      const gymid = await retrieveGymId();

      const response = await AxiosPrivate.post(
        `/api/member_search/v2/?gym_id=${gymid}`,
        {
          filterString: searchInput,
          limit: LIMIT,
          offset: currentOffset,
        }
      );

      const newMembers = response.data.data.memberList;
      const totalCount = response.data.data.totalCount;

      // Use functional updates to ensure we have the latest state
      setMemberList((prevList) =>
        isLoadMore ? [...prevList, ...newMembers] : newMembers
      );

      // Calculate if there are more items to load
      const newTotalCount = isLoadMore
        ? memberList.length + newMembers.length
        : newMembers.length;

      setHasMore(newTotalCount < totalCount);

      // Update offset only after data is loaded
      setOffset(isLoadMore ? currentOffset + LIMIT : LIMIT);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading2(false);
    }
  };

  const handleSelect = (data: any) => {
    setCurrentMember(data);
    setSearchText("");
    setMemberList([]);
    setTimeout(() => handleSearch("", false, true), 300);
  };

  // const handleSearch = async (searchInput: string) => {
  //   if (searchInput.trim() === "") {
  //     setMemberList([]);
  //     return;
  //   }
  //   try {
  //     setLoading(true);
  //     const gymid = await retrieveGymId();
  //     const response = await AxiosPrivate.post(
  //       `/api/member_search/?gym_id=${gymid}`,
  //       { filterString: searchInput },
  //       {
  //         id: newID(`search-members-${searchInput}`),
  //       }
  //     );
  //     setMemberList(response.data.data.memberList);
  //   } catch (error) {
  //     toast.error(
  //       "Something went wrong while searching members. Please try again."
  //     );
  //     console.error("Search error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    setInfo();
  }, []);

  const deleteEvent = async (id: string) => {
    try {
      const gymId = await retrieveGymId();

      const resp = await AxiosPrivate.delete(
        `api/classes/${id}/?gym_id=${gymId}`
      );
      invalidateAll();
      if (onSuccess) await onSuccess();
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  const getDate = async (date: Date) => {
    const gymId = await retrieveGymId();
    const resp = await AxiosPrivate.get(
      `api/classes/${event.id}/booked/${formateDateValue(date, "YYYY-MM-DD")}/?gym_id=${gymId}`,
      {
        id: newID("classes" + event.id + formateDateValue(date, "YYYY-MM-DD")),
      }
    );
    console.log(resp.data);
    setDateData(resp.data);
  };
  useEffect(() => {
    console.log(event);

    getDate(date);
  }, [date]);

  function handleEditModal() {
    closeModal(),
      openModal({
        view: (
          <EventForm
            classData={{
              id: event.id.toString(),
              name: event.title,
              description: event.description,
              startTime: event.start_time,
              endTime: event.end_time,
              recurrenceType: event.recurrence_type,
              weekdays: event.weekdays || [],
              startDate: new Date(event.event_start_date),
              endDate: new Date(event.event_end_date),
              bookingStartTime: new Date(event.booking_start_time),
              bookingEndTime: new Date(event.booking_end_time),
              capacity: event.capacity,
              isOnline: event.is_online,
              meetLink: event.meet_link,
              classPackageId: event.class_package.id,
              trainerId: event.trainer.id,
            }}
            onSuccess={onSuccess}
          />
        ),
        customSize: "650px",
      });
  }

  function handleDelete(eventID: string) {
    deleteEvent(eventID);
  }

  return (
    <div className="m-auto p-4 md:px-7 md:pb-10 md:pt-6">
      <div className="mb-6 flex items-center justify-between">
        <Title as="h3" className="text-xl xl:text-2xl capitalize">
          {event.title}
        </Title>
        <div className="flex items-center gap-4">
          <div className="mt-2">
            <Popover placement="bottom-end" isOpen={showShare}>
              <Popover.Trigger>
                <Button
                  onClick={() => {
                    setShowShare(!showShare);
                  }}
                  size="sm"
                  className="scale-105"
                >
                  Share
                </Button>
              </Popover.Trigger>
              <Popover.Content className="z-[99999]">
                <div className="p-2 flex flex-col gap-2">
                  <Title as="h5">Share Event</Title>
                  <Text className="font-medium">Event Date</Text>
                  <DatePicker
                    selected={eventDate ? new Date(eventDate) : new Date()}
                    onChange={(date: any) => {
                      setEventDate(formateDateValue(new Date(), "YYYY-MM-DD"));
                    }}
                    dateFormat={getDateFormat()}
                    className="max-w-[200px]"
                  />
                  {eventDate && gymCode ? (
                    <div className="flex items-center gap-4 mt-4">
                      <Input
                        value={`https://app.gymforce.in/gym/${gymCode}/?booking=${event.id}&booking_date=${eventDate}`}
                        readOnly
                        disabled
                        className="flex-grow"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowShare(false);
                          navigator.clipboard.writeText(
                            `https://app.gymforce.in/gym/${gymCode}/?booking=${event.id}&booking_date=${eventDate}`
                          );
                          toast.success("Copied Event Link", {
                            style: {
                              zIndex: "auto",
                            },
                          });
                        }}
                      >
                        <MdOutlineContentCopy />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Popover.Content>
            </Popover>
          </div>
          <ActionIcon
            size="sm"
            variant="text"
            onClick={() => closeModal()}
            className="p-0 text-gray-500 hover:!text-gray-900"
          >
            <PiXBold className="h-[18px] w-[18px]" />
          </ActionIcon>
        </div>
      </div>
      {/* <Text>{date.toString()}</Text> */}
      <Tab>
        <Tab.List>
          <Tab.ListItem>Details</Tab.ListItem>
          <Tab.ListItem>Attendees</Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div>
              {event.description && (
                <Text className="mt-3 xl:leading-6">{event.description}</Text>
              )}
              <ul className="mt-7 flex flex-col gap-[18px] text-gray-600">
                <li className="flex gap-2">
                  <MdOutlineCalendarMonth className="h-5 w-5" />
                  <span>Event Period:</span>
                  <span className="font-medium text-gray-1000">
                    {formatDate(event.event_start_date, "MMM D, YYYY")} -{" "}
                    {formatDate(event.event_end_date, "MMM D, YYYY")}
                  </span>
                </li>
                <li className="flex gap-2">
                  <FaClock className="h-5 w-5" />
                  <span>Class Time:</span>
                  <span className="font-medium text-gray-1000 space-x-2">
                    {/* {event.start_time}-{event.end_time} */}
                    {formatDate(
                      new Date(`2024-01-01T${event.start_time}`),
                      "h:mm A"
                    )}{" "}
                    -{" "}
                    {formatDate(
                      new Date(`2024-01-01T${event.end_time}`),
                      "h:mm A"
                    )}
                  </span>
                </li>
                <li className="flex gap-2">
                  <FaClock className="h-5 w-5" />
                  <span>Booking:</span>
                  <span className="font-medium text-gray-1000">
                    {formatDate(event.booking_start_time, "MMM D, YYYY h:mm A")}{" "}
                    - {formatDate(event.booking_end_time, "MMM D, YYYY h:mm A")}
                  </span>
                </li>
                {event.weekdays && event.weekdays.length > 0 && (
                  <li className="flex gap-2">
                    <MdOutlineCalendarMonth className="h-5 w-5" />
                    <span>Days:</span>
                    <span className="font-medium text-gray-1000 capitalize">
                      {event.weekdays.join(", ")}
                    </span>
                  </li>
                )}
                <li className="flex gap-2">
                  <PiUsers className="h-5 w-5" />
                  <span>Capacity:</span>
                  <span className="font-medium text-gray-1000">
                    {event.capacity} participants
                  </span>
                </li>
                <li className="flex gap-2">
                  <PiPackage className="h-5 w-5" />
                  <span>Package:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {event?.class_package?.name || "N/A"} (
                    {event?.class_package?.package_type || ""})
                  </span>
                </li>
                <li className="flex gap-2">
                  <PiUser className="h-5 w-5" />
                  <span>Trainer:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {event?.trainer?.name || "N/A"} (+
                    {event?.trainer?.contact || ""})
                  </span>
                </li>
                {event.is_online && event.meet_link && (
                  <li className="flex gap-2">
                    <PiVideo className="h-5 w-5" />
                    <span>Meeting Link:</span>
                    <span className="font-medium text-gray-950">
                      {event.meet_link}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="grid gap-4 max-h-[500px] overflow-y-scroll custom-scrollbar">
              <div className="grid grid-cols-2 items-center">
                <Text className="font-semibold">
                  Date : {formateDateValue(date)}
                </Text>
                <div className="flex items-center">
                  <Button
                    size="sm"
                    className="scale-105"
                    onClick={() => {
                      setShowMembers(true);
                      handleSearch("", false, true);
                    }}
                  >
                    Assign Member
                  </Button>
                </div>
              </div>
              {dateData.length ? (
                dateData.map((data: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <PiUser className="h-5 w-5" />
                    <div>
                      <Link
                        href={`/member_profile/yk62-${data.member_id}-71he`}
                      >
                        <Text className="font-medium text-primary">
                          {data.member_name}
                        </Text>
                      </Link>
                      <Text className="text-sm text-gray-500">
                        {data.member_phone}
                      </Text>
                    </div>
                  </div>
                ))
              ) : (
                <div className="min-w-full flex items-center justify-center my-4">
                  <Empty text={`No Attendees on ${formateDateValue(date)}`} />
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
      <div className={cn("grid grid-cols-2 gap-4 pt-5")}>
        <Button variant="outline" onClick={() => handleDelete(event.id)}>
          Delete
        </Button>
        <Button onClick={handleEditModal}>Edit</Button>
      </div>
      <Drawer
        isOpen={showMembers}
        onClose={() => {
          setSearchText("");
          setShowMembers(false);
          setMemberList([]);
          setShowMembers(false);
          setCurrentMember(null);
          // setTimeout(() => , 500);
          handleSearch("", false, true);
        }}
        size="lg"
        className="z-[99999]"
        containerClassName="p-4 space-y-4"
      >
        <div className="relative">
          <Input
            value={searchText}
            ref={inputRef}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder={
              currentMember === null
                ? "Search Members to Assign Session"
                : "Clear Selected Member to Search"
            }
            prefix={
              <PiMagnifyingGlassBold className="text-gray-600" size={20} />
            }
            disabled={currentMember !== null}
            suffix={
              searchText && (
                <Button
                  size="sm"
                  variant="text"
                  onClick={() => {
                    setSearchText("");
                    setMemberList([]);
                    setCurrentMember(null);
                    setTimeout(() => handleSearch("", false), 300);
                  }}
                >
                  <XIcon />
                </Button>
              )
            }
          />
          {currentMember === null && (
            <div className="absolute top-full left-0 z-[9999999999] flex w-full  overflow-y-auto custom-scrollbar max-h-[85vh] border-2 shadow rounded-lg p-4 py-8 mt-4 gap-2 flex-col items-stretch bg-gray-50 ">
              {loading ? (
                <div className="flex justify-center items-center w-full my-4">
                  <Loader variant="spinner" size="xl" />
                </div>
              ) : memberList.length ? (
                memberList.map((item, index) => {
                  const isSecondToLast = index === memberList.length - 2;
                  return (
                    <div
                      ref={isSecondToLast ? observerRef : null}
                      className="flex relative items-center gap-2.5 p-2 rounded  cursor-pointer hover:bg-gray-100 hover:scale-y-105 group"
                      key={index}
                      onClick={() => {
                        if (item.status === "expired") {
                          setAlert({
                            message:
                              "Can't Assign Session for a Expired Member.",
                            type: "danger",
                          });
                          setTimeout(() => {
                            setAlert(null);
                          }, 1000);
                          return;
                        }
                        handleSelect(item);
                      }}
                    >
                      <Avatar
                        name={item.name}
                        src={item.image || "/placeholder-avatar.jpg"}
                        className="text-white"
                      />
                      <div className="flex flex-col gap-2">
                        <Text className="font-medium text-gray-900  group-hover:text-gray-900">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 ">{item.phone}</Text>
                      </div>
                      <div className="flex items-center max-md:flex-col gap-8">
                        <Badge
                          variant="outline"
                          className="max-sm:scale-90 text-nowrap"
                        >
                          {item.membership_details?.name || "N/A"}
                        </Badge>
                        <Badge
                          size="sm"
                          variant="outline"
                          color={
                            item.status === "active" ? "success" : "danger"
                          }
                          className="max-sm:absolute -top-4 capitalize"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="my-4">
                  <Empty text="No Members Found" />
                </div>
              )}
              {alert && (
                <Alert
                  color={alert.type}
                  variant="flat"
                  className="fixed bottom-4 right-4 mx-auto max-w-[400px]"
                >
                  {alert.message}
                </Alert>
              )}
            </div>
          )}
        </div>
        <div className=" grid md:flex items-stretch gap-4 w-full border-2 rounded-lg shadow-sm relative">
          {currentMember && (
            <div className="p-4 grid grid-cols-2 items-center gap-4 sm:gap-x-8 min-w-full">
              <div className="col-span-full">
                <XIcon
                  onClick={() => setCurrentMember(null)}
                  className="ml-auto cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4">
                <Avatar
                  name={currentMember.name}
                  size="xl"
                  src={currentMember.image}
                />
                <div>
                  <Title as="h6">{currentMember.name}</Title>
                  <Text>{currentMember.phone}</Text>
                  <Badge variant="outline">
                    {currentMember.membership_details?.name}
                  </Badge>
                </div>
              </div>
              <Button disabled={loadingBooking} onClick={handleBooking}>
                Confirm Booking
              </Button>
              <div className="col-span-full">
                {alert && (
                  <Alert color={alert.type} variant="flat">
                    {alert.message}
                  </Alert>
                )}
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}

export default DetailsEvents;
