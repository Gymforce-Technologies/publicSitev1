"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Text,
  Title,
  Loader,
  Drawer,
  Input,
  Badge,
  Avatar,
  Empty,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import {
  PiArrowRightBold,
  PiMagnifyingGlassBold,
  // PiXBold,
} from "react-icons/pi";
import { XIcon } from "lucide-react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
// import getDueBadge from "../dueBadge";
import DateCell from "@core/ui/date-cell";
import { IoWarningOutline } from "react-icons/io5";
// import Image from "next/image";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
// import { set } from "lodash";

interface FormData {
  member_id: string | null;
  transfer_fee: number | null;
}

const initialState: FormData = {
  member_id: null,
  transfer_fee: null,
};

export default function TransferMembership({
  membershipId,
  onUpdate,
  closeModal,
  // paid_amount,
  member_name,
  member_image,
  end_date,
}: {
  membershipId: string;
  onUpdate: () => void;
  closeModal: () => void;
  // paid_amount: number;
  member_name?: string;
  end_date: string;
  member_image?: string;
}) {
  const [data, setData] = useState<FormData>(initialState);
  const [validationErrors, setValidationErrors] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [lock, setLock] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchText, setSearchText] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [demographics, setDemographics] = useState<DemographicInfo | null>(
    null
  );
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;
  const observerRef = useRef(null);
  // const inputRef=useRef(null);
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

  const handleSearchInputChange = (input: string) => {
    setSearchText(input);
    setOffset(0);
    setMemberList([]);
    setHasMore(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

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

  useEffect(() => {
    setInfo();
  }, []);

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
  }, [hasMore, loading, searchText, memberList.length]);

  const handleSelect = (data: any) => {
    setCurrentMember(data);
    setData((prev) => ({
      ...prev,
      member_id: data.id,
    }));
    setSearchText("");
    setMemberList([]);
  };

  useEffect(() => {
    checkFormValidation(false);
    if (isOpen) {
      setMemberList([]);
      handleSearch("", false, true);
    }
  }, [data, isOpen]);

  const checkFormValidation = (submit: boolean) => {
    let errors: string | null = null;
    if (!data.member_id) {
      errors = "Select the Member To Transfer the Membership";
    }

    setValidationErrors(errors);
    setIsValid(!errors);

    if (submit && errors) {
      toast.error(errors);
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitData = async () => {
    if (!checkFormValidation(true)) return;

    try {
      setLock(true);

      interface TransferPayload {
        member_id: string | null;
        transfer_fee?: number | null; // Make transfer_fee optional
      }
      const payload: TransferPayload = {
        member_id: data.member_id,
      };

      // Add transfer_fee to payload only if it's not null
      if (data.transfer_fee !== null) {
        payload.transfer_fee = data.transfer_fee;
      }
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/transfer-membership/${membershipId}/?gym_id=${gymId}`,
        payload
      );

      invalidateAll();
      onUpdate();
      toast.success("Membership Transferred successfully!");
      setData(initialState);
      setIsOpen(false);
    } catch (error) {
      toast.error(
        "Something went wrong while Transfering membership. Please try again."
      );
      console.error("Transfer error:", error);
    } finally {
      setLock(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setData(initialState);
        setValidationErrors(null);
        closeModal();
        setMemberList([]);
      }}
      size="lg"
      containerClassName="p-6 md:px-8 space-y-5 max-h-full overflow-y-auto custom-scrollbar"
    >
      <div className="flex items-center justify-between">
        <Title as="h4" className="">
          Transfer Membership
        </Title>
        <XIcon
          className="hover:text-primary cursor-pointer hover:scale-105"
          onClick={() => {
            setIsOpen(false);
            closeModal();
            setMemberList([]);
          }}
        />
      </div>
      <div className="grid gap-5 ">
        <div className="space-y-4">
          <div className="flex flex-col gap-5">
            <div className="w-full p-4 bg-primary-lighter dark:bg-gray-100 rounded-lg shadow col-span-full">
              <div className="flex flex-row gap-2 items-center">
                <Text className="text-sm">Please Note</Text>
                <IoWarningOutline className="animate-pulse" size={16} />
              </div>
              <ul className="flex flex-col items-stretch gap-3 px-4 pt-2 list-disc text-xs font-medium">
                <li>
                  You can transfer a membership to a family member or friend, as
                  long as both have the same membership plan type.
                </li>
                <li>
                  The remaining days will be transferred, and the original
                  member’s plan will expire immediately.
                </li>
                <li>This action is irreversible.</li>
              </ul>
            </div>
            <div className="relative">
              <Input
                value={searchText}
                ref={inputRef}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder={
                  currentMember === null
                    ? "Search Members to Transfer Membership"
                    : "Clear Selected Member to Search"
                }
                onFocus={() => {
                  searchText.length === 0
                    ? setTimeout(() => handleSearch("", false, true), 300)
                    : "";
                }}
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
                      }}
                    >
                      <XIcon />
                    </Button>
                  )
                }
              />

              {currentMember === null && (
                <div className="absolute top-full left-0 z-[9999999999] flex w-full border-2 transition-all duration-200 custom-scrollbar shadow rounded-lg p-4 py-8 mt-4 gap-2 flex-col items-stretch bg-gray-50 max-h-[55vh] overflow-y-auto custom-scrollbar">
                  {loading && memberList.length === 0 ? (
                    <div className="flex justify-center items-center w-full my-4">
                      <Loader variant="spinner" size="xl" />
                    </div>
                  ) : memberList.length ? (
                    memberList.map((item, index) => {
                      const isSecondToLast = index === memberList.length - 2;
                      return (
                        <div
                          ref={isSecondToLast ? observerRef : null}
                          className="flex relative items-center gap-4 p-2 md:p-4 rounded  cursor-pointer hover:bg-gray-100 hover:scale-y-105 group border border-gray-200"
                          key={index}
                          onClick={() => {
                            if (
                              item.membership_details
                                ?.latest_membership_end_date &&
                              new Date(
                                item.membership_details.latest_membership_end_date
                              ) < new Date()
                            ) {
                              toast.error(
                                "Can't Transfer Membership for a Expired Member."
                              );
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
                          <div className="flex flex-col">
                            <Text className="font-medium text-gray-900 group-hover:text-gray-900">
                              {item.name}
                            </Text>
                            <Text className="text-gray-500">{item.phone}</Text>
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
                                item.membership_details
                                  ?.latest_membership_end_date &&
                                new Date(
                                  item.membership_details?.latest_membership_end_date
                                ) < new Date()
                                  ? "danger"
                                  : new Date(
                                        item.membership_details?.latest_membership_end_date
                                      ).getTime() -
                                        new Date().getTime() <=
                                      604800000
                                    ? "warning"
                                    : "success"
                              }
                              className="max-sm:absolute -top-4 pb-2"
                            >
                              {item.membership_details
                                ?.latest_membership_end_date &&
                              new Date(
                                item.membership_details?.latest_membership_end_date
                              ) < new Date()
                                ? "Expired"
                                : new Date(
                                      item.membership_details?.latest_membership_end_date
                                    ).getTime() -
                                      new Date().getTime() <=
                                    604800000
                                  ? "Expiring Soon"
                                  : "Active"}
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
                  {loading && memberList.length > 0 && (
                    <div className="flex justify-center items-center py-4">
                      <Loader variant="spinner" size="xl" />
                    </div>
                  )}
                </div>
              )}
            </div>
            {validationErrors && (
              <p className="text-xs text-red-500 relative ">
                {validationErrors}
              </p>
            )}
          </div>
          <div className=" grid md:flex items-stretch gap-4 w-full border-2 rounded-lg shadow-sm relative">
            <div
              className={
                !currentMember
                  ? "hidden"
                  : "absolute left-[41%] top-[41%] max-md:rotate-90 md:top-1/4 z-[99999]"
              }
            >
              <MdKeyboardDoubleArrowRight className=" text-primary size-6 animate-pulse" />
            </div>
            {/* Current Member Card */}
            <div className={` p-4 ${!currentMember ? "w-full max-w-sm" : ""}`}>
              <div className="flex flex-col">
                <Title as="h6" className="font-semibold mb-2 ">
                  Member
                </Title>

                <div
                  className={`flex ${currentMember ? "flex-col items-start ml-2 justify-center gap-1 " : " items-center gap-8"}   mb-2`}
                >
                  {/* <Image
                    alt={member_name || "Name"}
                    src={
                      member_image ||
                      "https://images.gymforce.in/man-user-circle-icon.png"
                    }
                    width={96}
                    height={96}
                    className="rounded-full object-cover size-24"
                  /> */}
                  <Avatar
                    name={member_name || "Name"}
                    size="xl"
                    src={member_image}
                  />

                  <p
                    className={`${currentMember && " mt-4 "} text-center font-semibold text-gray-800 `}
                  >
                    {member_name}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center justify-start">
                      <span className="me-2 h-2 w-2 rounded-full bg-blue-500" />
                      <Title as="h6" className="text-sm font-normal ">
                        Current End Date
                      </Title>
                    </div>
                    <DateCell
                      date={new Date(end_date)}
                      timeClassName="hidden"
                      dateFormat={getDateFormat()}
                      // dateClassName="dark:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center justify-start">
                      <span className="me-2 h-2 w-2 rounded-full bg-green-500" />
                      <Title as="h6" className="text-sm font-normal ">
                        Valid Days
                      </Title>
                    </div>
                    <Text as="span">
                      {Math.ceil(
                        (new Date(end_date).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Member Card - Only shown when there's a selected member */}
            {currentMember && (
              <div className=" p-4 max-w-sm ">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <Title as="h6" className="font-semibold ">
                      Transferring To
                    </Title>
                    <XIcon
                      onClick={() => {
                        setCurrentMember(null);
                        setSearchText("");
                        setTimeout(() => handleSearch("", false, true), 300);
                      }}
                      size={24}
                      className="hover:text-primary cursor-pointer hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col items-start ml-2 justify-center gap-1 mb-2">
                    {/* <Image
                      alt={currentMember.name}
                      src={
                        currentMember.image ||
                        "https://images.gymforce.in/man-user-circle-icon.png"
                      }
                      width={96}
                      height={96}
                      className="rounded-full object-cover size-24"
                    /> */}
                    <Avatar
                      name={currentMember.name || "Name"}
                      size="xl"
                      src={currentMember.image}
                    />
                    <p className="mt-4 text-center font-semibold text-gray-800 ">
                      {currentMember.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center justify-start">
                        <span className="me-2 h-2 w-2 rounded-full bg-blue-500" />
                        <Title as="h6" className="text-sm font-normal ">
                          Current End Date
                        </Title>
                      </div>
                      <DateCell
                        date={
                          new Date(
                            currentMember.membership_details?.latest_membership_end_date
                          )
                        }
                        timeClassName="hidden"
                        dateFormat={getDateFormat()}
                        // dateClassName="dark:text-gray-400"
                      />
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center justify-start">
                        <span className="me-2 h-2 w-2 rounded-full bg-yellow-500" />
                        <Title as="h6" className="text-sm font-normal ">
                          Current Valid Days
                        </Title>
                      </div>
                      <Text as="span">
                        {currentMember.membership_details
                          ?.latest_membership_end_date
                          ? Math.ceil(
                              (new Date(
                                currentMember.membership_details.latest_membership_end_date
                              ).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : 0}{" "}
                        days
                      </Text>
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center justify-start">
                        <span className="me-2 h-2 w-2 rounded-full bg-green-500" />
                        <Title as="h6" className="text-sm font-normal ">
                          New End Date
                        </Title>
                      </div>
                      <DateCell
                        date={
                          new Date(
                            new Date(end_date).getTime() +
                              (currentMember.membership_details
                                ?.latest_membership_end_date
                                ? new Date(
                                    currentMember.membership_details.latest_membership_end_date
                                  ).getTime() - new Date().getTime()
                                : 0)
                          )
                        }
                        timeClassName="hidden"
                        dateFormat={getDateFormat()}
                        // dateClassName="dark:text-gray-400"
                      />
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center justify-start">
                        <span className="me-2 h-2 w-2 rounded-full bg-purple-500" />
                        <Title as="h6" className="text-sm font-normal ">
                          New Valid Days
                        </Title>
                      </div>
                      <Text as="span">
                        {Math.ceil(
                          (new Date(end_date).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) +
                          (currentMember.membership_details
                            ?.latest_membership_end_date
                            ? Math.ceil(
                                (new Date(
                                  currentMember.membership_details.latest_membership_end_date
                                ).getTime() -
                                  new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : 0)}{" "}
                        days
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Input
            label="Transfer Fee"
            name="transfer_fee"
            type="number"
            placeholder="Enter Transfer Price"
            value={data.transfer_fee?.toString() || ""}
            onChange={handleInputChange}
            labelClassName=""
            prefix={
              <Text className="text-primary">
                {demographics?.currency_symbol || " "}
              </Text>
            }
          />
          <div className="mt-8 flex justify-center">
            <Button
              onClick={submitData}
              variant="solid"
              size="lg"
              disabled={!isValid || lock}
            >
              {!lock ? (
                <span className="flex items-center gap-1">
                  <span>Transfer Membership</span>
                  <PiArrowRightBold className="ml-2" />
                </span>
              ) : (
                <Loader variant="threeDot" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
