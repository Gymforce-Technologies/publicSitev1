import React, { useEffect, useState } from "react";
import WidgetCard from "@core/components/cards/widget-card";
import { Avatar, Button, Empty, Loader, Text } from "rizzui";
import cn from "@core/utils/class-names";
import { PiCalendarBlank, PiWhatsappLogoBold } from "react-icons/pi";
import DateCell from "@core/ui/date-cell";
import SimpleBar from "simplebar-react";
import Link from "next/link";
import { CakeIcon } from "lucide-react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import Pagination from "@core/ui/pagination";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  const nextBirthday = age + 1;
  const suffix = getOrdinalSuffix(nextBirthday);

  return {
    currentAge: age,
    nextBirthday: `${nextBirthday}${suffix}`,
  };
};

interface Member {
  id: string;
  name: string;
  date_of_birth: string;
  phone: string;
  member_image: string;
}
export default function UpcomingBirthdays({
  className,
}: {
  className?: string;
}) {
  const [data, setData] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextWeek, setNextWeek] = useState(0);
  const [lastWeek, setLastWeek] = useState(0);
  const [filter, setFilter] = useState<"last" | "today" | "next">("today");
  const [todayCount, setTodayCount] = useState(0);

  const fetchBirthdays = async (
    page: number = 1,
    filter: "last" | "today" | "next" = "today"
  ) => {
    try {
      const gymId = await retrieveGymId();
      let value =
        filter === "last"
          ? "&range_by=last_week"
          : filter === "next"
            ? "&range_by=next_week"
            : "";
      const res = await AxiosPrivate.get(
        `api/members-birthday/?gym_id=${gymId}&page=${page}${value && value}`,
        {
          id: newID(`members-birthday-${gymId}-${page}${filter}`),
        }
      );
      setData(res.data.members.results);
      console.log(res.data.members.results);
      setLastWeek(res.data.last_week_count);
      setNextWeek(res.data.next_week_count);
      setTodayCount(res.data.today_count);
      setTotalMembers(res.data.count);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchBirthdays(1, filter);
  }, [filter]);

  const handlePageChange = async (pageNumber: number) => {
    fetchBirthdays(pageNumber);
    setCurrentPage(pageNumber);
  };
  return (
    <WidgetCard
      title="Member's Birthday's"
      titleClassName="text-gray-900 "
      headerClassName="items-center"
      className={cn(
        "overflow-y-scroll max-w-[700px] overflow-x-hidden custom-scrollbar flex flex-col gap-1 py-2  dark:bg-inherit @container",
        className
      )}
      action={
        <div className="hidden sm:flex items-center gap-2">
          <Button
            size="sm"
            className="flex gap-1.5 items-center"
            variant={filter === "last" ? "solid" : "flat"}
            onClick={() => setFilter("last")}
          >
            <IoMdArrowDropleft size={18} />
            Last Week
            <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
              {lastWeek}
            </Text>
          </Button>
          <Button
            size="sm"
            variant={filter === "today" ? "solid" : "flat"}
            onClick={() => setFilter("today")}
            className="flex gap-1.5 items-center"
          >
            Today
            <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
              {todayCount}
            </Text>
          </Button>
          <Button
            size="sm"
            className="flex gap-1.5 items-center"
            variant={filter === "next" ? "solid" : "flat"}
            onClick={() => setFilter("next")}
          >
            <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
              {nextWeek}
            </Text>
            Upcoming Week
            <IoMdArrowDropright size={18} />
          </Button>
        </div>
      }
    >
      <div className="flex sm:hidden items-center gap-1 mx-[-1] mt-2">
        <Button
          size="sm"
          className="flex gap-0.5 items-center scale-90"
          variant={filter === "last" ? "solid" : "flat"}
          onClick={() => setFilter("last")}
        >
          <IoMdArrowDropleft size={18} />
          <Text className="max-w-[20vw] truncate">Last Week</Text>

          <Text className="bg-primary-lighter text-xs text-primary size-3 rounded-full flex items-center justify-center">
            {lastWeek}
          </Text>
        </Button>
        <Button
          size="sm"
          variant={filter === "today" ? "solid" : "flat"}
          onClick={() => setFilter("today")}
          className="flex gap-1.5 items-center scale-90"
        >
          <Text className="max-w-[20vw] truncate">Today</Text>
          <Text className="bg-primary-lighter text-xs text-primary size-3 rounded-full flex items-center justify-center">
            {todayCount}
          </Text>
        </Button>
        <Button
          size="sm"
          className="flex gap-1.5 items-center scale-90"
          variant={filter === "next" ? "solid" : "flat"}
          onClick={() => setFilter("next")}
        >
          <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
            {nextWeek}
          </Text>

          <Text className="max-w-[20vw] truncate">Next Week</Text>
          <IoMdArrowDropright size={18} />
        </Button>
      </div>
      {data !== null ? (
        <div className=" mt-4">
          <SimpleBar className="relative -mx-3 h-full w-[calc(100%+24px)]">
            <div className="space-y-3 p-2">
              {data.length ? (
                data.map((item, index) => {
                  const { currentAge, nextBirthday } = calculateAge(
                    item.date_of_birth
                  );
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-2 bg-inherit p-4 rounded-lg shadow-sm items-center justify-center hover:bg-gray-100 "
                    >
                      <div className="grid max-sm:col-span-full grid-cols-[20%,auto,20%] md:space-x-2 items-center">
                        <Avatar
                          src={item.member_image}
                          name={item.name}
                          size="lg"
                          className="max-xs:scale-90"
                        />
                        <div className="md:flex-grow ">
                          <h3 className="text-lg  font-semibold text-gray-900 ">
                            {item.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-700 gap-1">
                            <PiCalendarBlank size={18} />
                            <DateCell
                              date={new Date(item.date_of_birth)}
                              dateClassName="font-normal text-gray-700 "
                              dateFormat="MMMM D"
                              timeClassName="hidden"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-start justify-center px-2 gap-2">
                          <span className="font-medium text-gray-700 ">
                            <p className="text-xs text-gray-900 ">
                              Celebrating
                            </p>
                            <div className="flex flex-row gap-1 flex-nowrap items-end justify-start">
                              <span>{nextBirthday}</span>
                              <CakeIcon />
                            </div>
                          </span>
                        </div>
                      </div>
                      <div className="justify-items-end max-sm:col-span-full grid grid-cols-[80%,20%] md:grid-cols-[70%,30%] items-center gap-2 max-w-sm">
                        <Text className="justify-self-end md:justify-self-center font-medium text-gray-700 ">
                          Wish {item.name}
                        </Text>
                        <Link
                          className="justify-self-center  md:justify-self-start"
                          href={`https://wa.me/${item.phone}?text=Hi ${item.name} Wishing you for your ${nextBirthday} Birthday`}
                          target="_blank"
                        >
                          <PiWhatsappLogoBold
                            size={24}
                            className=" hover:scale-110 duration-150 text-gray-700  hover:text-primary"
                          />
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <Empty
                  text="All birthdays are celebrated"
                  textClassName="mt-2 "
                  className=""
                />
              )}
            </div>
          </SimpleBar>
        </div>
      ) : (
        <div className="w-full flex flex-1 justify-center items-center">
          <Loader size="xl" variant="spinner" />
        </div>
      )}
      <div className="flex justify-end self-end min-w-full mt-4">
        <Pagination
          total={totalMembers}
          current={currentPage}
          onChange={handlePageChange}
          outline={false}
          rounded="md"
          variant="solid"
          color="primary"
          pageSize={5}
        />
      </div>
    </WidgetCard>
  );
}
