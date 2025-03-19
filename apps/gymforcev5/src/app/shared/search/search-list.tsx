"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ActionIcon,
  Empty,
  SearchNotFoundIcon,
  Button,
  Input,
  Text,
  Avatar,
  Loader,
  Badge,
} from "rizzui";
import { PiMagnifyingGlassBold, PiXBold } from "react-icons/pi";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { Calendar } from "lucide-react";
import getDueBadge from "@/components/dueBadge";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";

export default function SearchList({
  onclose,
  setFunc,
  setSelectedData,
}: {
  onclose?: any;
  setFunc: any;
  setSelectedData: any;
}) {
  const inputRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  // const [initialLoad, setInitialLoad] = useState(true);
  const LIMIT = 10;

  const observerRef = useRef(null);

  useEffect(() => {
    if (inputRef?.current) {
      // @ts-ignore
      inputRef.current.focus();
    }
    return () => {
      inputRef.current = null;
    };
  }, []);

  // Initial data load
  useEffect(() => {
    handleSearch("", false, true);
    // setInitialLoad(false);
  }, []);

  // useEffect(() => {
  //   console.log(`-`);
  //   console.log(memberList);
  //   console.log(offset);
  //   console.log(hasMore);
  //   console.log(`-`);
  // }, [hasMore, offset, memberList]);

  // Improving the intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          handleSearch(searchText, true);
        }
      },
      { threshold: 0.1 } // Lower threshold for better detection
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.disconnect();
      }
    };
  }, [hasMore, loading, searchText, memberList.length, onclose]); // Add memberList.length as dependency

  const handleSearchInputChange = (input: string) => {
    setSearchText(input);
    setOffset(0);
    setMemberList([]);
    setHasMore(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      handleSearch(input, false,true);
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
        setLoading(true);
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
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchText("");
    setMemberList([]);
    setOffset(0);
    setHasMore(true);
    handleSearch("", false, true);
  };

  return (
    <>
      <div className="flex items-center px-5 py-4 ">
        <Input
          variant="flat"
          value={searchText}
          ref={inputRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSearchInputChange(e.target.value)
          }
          placeholder="Search Members"
          className="flex-1"
          prefix={
            <PiMagnifyingGlassBold className="h-[18px] w-[18px] text-gray-600" />
          }
          suffix={
            searchText && (
              <Button
                size="sm"
                variant="text"
                className="h-auto w-auto px-0"
                onClick={handleClear}
              >
                Clear
              </Button>
            )
          }
        />
        <ActionIcon
          variant="text"
          size="sm"
          className="ms-3 text-gray-500 hover:text-gray-700"
          onClick={onclose}
        >
          <PiXBold className="h-5 w-5" />
        </ActionIcon>
      </div>

      <div className="custom-scrollbar min-h-[60vh] max-h-[60vh] overflow-y-auto border-t border-gray-300 px-2 py-4">
        {memberList.length === 0 && !loading && (
          <Empty
            className="scale-75"
            image={<SearchNotFoundIcon />}
            text="No Result Found"
            textClassName="text-xl"
          />
        )}
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader variant="spinner" size="xl" />
          </div>
        ) : (
          memberList?.map((item: any, index) => {
            const isSecondToLast = index === memberList.length - 2;
            return (
              <div
                ref={isSecondToLast ? observerRef : null}
                className="group relative p-4 flex flex-col border cursor-pointer border-gray-300 mb-4 rounded-lg shadow-md transition-transform duration-500 ease-out hover:shadow-lg hover:scale-[1.02]"
                key={index}
              >
                <div className="flex justify-between items-center">
                  <Link href={`/member_profile/yk62-${item.id}-71he`}>
                    <figure className="flex items-center gap-3">
                      <Avatar
                        name={item.name}
                        src={item.image || "/placeholder-avatar.jpg"}
                      />
                      <figcaption className="grid gap-0.5">
                        <Text className="font-lexend text-sm text-nowrap text-clip font-medium text-gray-900 hover:text-primary">
                          {item.name}
                        </Text>
                        <Text className="text-[13px] text-gray-500">
                          {item.phone}
                        </Text>
                      </figcaption>
                    </figure>
                  </Link>
                  <div className="flex justify-between gap-5">
                    <Badge variant="outline">
                      {item.membership_details?.name}
                    </Badge>
                    {item.status === "active" ? (
                      <Badge color="success" variant="flat">
                        Active
                      </Badge>
                    ) : item.status === "expired" ? (
                      <Badge color="danger" variant="flat">
                        Expired
                      </Badge>
                    ) : item.status === "upcoming" ? (
                      <Badge color="secondary" variant="flat">
                        Upcoming
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="group-hover:flex hidden flex-col gap-3 mt-3">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                    <Text className="text-sm text-gray-500">
                      Membership End Date:
                    </Text>
                    <div className="flex gap-10">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <DateCell
                          date={
                            item.membership_details?.latest_membership_end_date
                          }
                          dateFormat={getDateFormat()}
                          timeClassName="hidden"
                        />
                      </div>
                      {item.total_due == 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onclose();
                            setFunc("Renew");
                            setSelectedData(item);
                          }}
                          className="justify-end"
                        >
                          Renew
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                    <Text className="text-sm text-gray-500">Due Status:</Text>
                    <div className="flex gap-4 items-center">
                      <Text>
                        {getDueBadge({
                          dueAmount: item.total_due,
                          symbol: "₹",
                        })}
                      </Text>
                      {item.total_due > 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            onclose();
                            setFunc("Pay");
                            setSelectedData(item);
                          }}
                        >
                          Pay Dues
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                    <Text className="text-sm text-gray-500">Invoice Date:</Text>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <DateCell
                          date={item?.latest_transaction_date}
                          dateFormat={getDateFormat()}
                          timeClassName="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
