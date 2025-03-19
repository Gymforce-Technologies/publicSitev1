"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Loader,
  Text,
  ActionIcon,
  Select,
  Button,
  Badge,
  Avatar,
  Tooltip,
  Drawer,
  Title,
  Input,
  Empty,
} from "rizzui";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { PlusIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import AvatarCard from "@core/ui/avatar-card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PiMagnifyingGlassBold } from "react-icons/pi";

import DateCell from "@core/ui/date-cell";
import getDueBadge from "@/components/dueBadge";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  category: string;
  level: string;
  duration: number | null;
  plan_type: string;
  image_url: string;
  member_count: number;
  members: any[];
}

const WorkoutSection: React.FC = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const router = useRouter();
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<any[] | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchText, setSearchText] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [demographics, setDemographics] = useState<DemographicInfo | null>(
    null
  );
  const [newTrainer, setNewTrainer] = useState<any>("");
  const [availableTrainers, setAvailableTrainers] = useState<any[]>([]);
  const [loading2, setLoading2] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;
  const observerRef = useRef(null);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleSearch(searchText, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, memberList, showAssign]);

  useEffect(() => {
    const getStatus = async () => {
      try {
        const resp = await isStaff();
        if (resp) {
          setAuth(!resp);
          await fetchPermissions();
        }
      } catch (error) {
        console.error("Error getting staff status:", error);
      }
    };
    getStatus();
  }, []);

  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["mainWorkoutManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };
  const fetchWorkoutPlans = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `api/list-workoutplans/?gym_id=${gymId}`,
        {
          id: newID("workout-plans-list"),
        }
      );
      const data = response.data;

      const transformedPlans: WorkoutPlan[] = data.map(
        (item: any, index: number) => ({
          ...item,
          index: index + 1,
        })
      );
      let filteredPlans = [...transformedPlans];
      // Apply category filter
      if (filterCategory !== "all") {
        filteredPlans = filteredPlans.filter(
          (plan) => plan.category.toLowerCase() === filterCategory.toLowerCase()
        );
      }

      // Apply level filter
      if (filterLevel !== "all") {
        filteredPlans = filteredPlans.filter(
          (plan) => plan.level.toLowerCase() === filterLevel.toLowerCase()
        );
      }

      setWorkoutPlans(filteredPlans);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    inputRef.current?.focus();
    // Trigger initial empty search
    // handleSearch("", false, true);
    return () => {
      inputRef.current = null;
    };
  }, []);

  const AssignWorkout = async () => {
    const gymId = await retrieveGymId();
    const member_id = parseInt(currentMember.id);
    const assignments = [
      {
        member_id: member_id,
        trainer_id: newTrainer,
      },
    ];
    if (
      assignments[0].trainer_id === "" ||
      assignments[0].trainer_id === null
    ) {
      delete assignments[0].trainer_id;
    }
    const resp = await AxiosPrivate.post(
      `api/workoutplans/${selectedPlan}/assign_members_and_trainer/?gym_id=${gymId}`,
      { assignments }
    );
    invalidateAll();
    toast.success("Workout Assigned successfully");
    // setSelectedPlan(null);
    setMemberList([]);
    setCurrentMember(null);
    setSearchText("");
    setTimeout(() => handleSearch("", false, true), 300);
    fetchWorkoutPlans();
  };

  useEffect(() => {
    const getTrainers = async () => {
      const gymId = await retrieveGymId();
      const URL = `/api/staff/?deleted=false&gym_id=${gymId}`;
      const res = await AxiosPrivate(URL, {
        id: newID(`trainers-prereq-diet-plans`),
      });
      console.log(res.data);
      setAvailableTrainers(res.data);
    };
    getTrainers();
  }, []);

  const handleDeleteWorkoutPlan = async (planId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`api/workout-plans/${planId}/?gym_id=${gymId}`);
      invalidateAll();
      toast.success("Workout plan deleted successfully");
    } catch (error) {
      console.error("Error deleting workout plan:", error);
    }
  };

  const getColumns = useCallback(
    () => [
      {
        title: (
          <HeaderCell title="S.No" className="text-sm font-semibold mx-auto" />
        ),
        dataIndex: "index",
        key: "index",
        width: 60,
        render: (index: number) => <Text className="pl-2">{index}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 250,
        render: (name: string, row: WorkoutPlan) => (
          <AvatarCard
            name={name}
            src={row.image_url}
            description={row.description}
            className="max-w-60 max-h-40 truncate"
          />
        ),
      },

      {
        title: (
          <HeaderCell title="Category" className="pl-2 text-sm font-semibold" />
        ),
        dataIndex: "category",
        key: "category",
        width: 150,
        render: (category: string) => (
          <Badge variant="outline" className="capitalize truncate scale-90">
            {category}
          </Badge>
        ),
      },
      {
        title: (
          <HeaderCell title="Level" className="pl-1 text-sm font-semibold" />
        ),
        dataIndex: "level",
        key: "level",
        width: 100,
        render: (level: string) => (
          <Badge
            variant="flat"
            className="capitalize"
            color={
              level.toLowerCase() === "beginner"
                ? "success"
                : level.toLowerCase() === "intermediate"
                  ? "primary"
                  : "secondary"
            }
          >
            {level}
          </Badge>
        ),
      },
      {
        title: (
          <HeaderCell title="Members" className="pl-1 text-sm font-semibold" />
        ),
        dataIndex: "member_count",
        key: "member_count",
        width: 80,
        render: (member_count: number, row: WorkoutPlan) => (
          <Tooltip
            content="View Members"
            placement="bottom"
            animation="slideIn"
          >
            <Button
              className="flex gap-1.5 items-center scale-90"
              size="sm"
              onClick={() => {
                if (row.member_count === 0) {
                  toast.error("Members are not Assigned to this Workout Plan");
                  return;
                }
                setMembers(row.members);
                setShowMembers(true);
              }}
            >
              Members -
              <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
                {member_count}
              </Text>
            </Button>
          </Tooltip>
        ),
      },
      // {
      //   title: (
      //     <HeaderCell title="Duration" className="text-sm font-semibold" />
      //   ),
      //   dataIndex: "duration",
      //   key: "duration",
      //   width: 100,
      //   render: (duration: number) => (
      //     <Text className="font-semibold">
      //       {duration ? duration + "min" : "N/A"}
      //     </Text>
      //   ),
      // },
      {
        title: <HeaderCell title="Type" className="text-sm font-semibold" />,
        dataIndex: "plan_type",
        key: "plan_type",
        width: 100,
        render: (plan_type: string) => (
          <Text className="capitalize">{plan_type || "N/A"}</Text>
        ),
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 120,
        render: (id: number) => (
          <div className="flex items-center gap-4 justify-start ps-4">
            <Button
              className=""
              size="sm"
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setShowAssign(true);
                setSelectedPlan(id);
                handleSearch("", false, true);
              }}
            >
              Assign
            </Button>
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                router.push(`/workout/edit/${id}`);
              }}
              variant="text"
            >
              <MdEdit size={20} />
            </ActionIcon>

            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                handleDeleteWorkoutPlan(id);
              }}
              variant="text"
            >
              <MdDelete size={20} />
            </ActionIcon>
          </div>
        ),
      },
    ],
    [auth, access, workoutPlans]
  );

  const handleSelect = (data: any) => {
    setCurrentMember(data);
    // setData((prev) => ({
    //   ...prev,
    //   member_id: data.id,
    // }));
    setSearchText("");
    setMemberList([]);
    setTimeout(() => handleSearch("", false, true), 500);
  };

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

  const columns = useMemo(() => getColumns(), [getColumns]);

  const handleFilterLevelChange = useCallback((value: string) => {
    setFilterLevel(value);
  }, []);

  useEffect(() => {
    fetchWorkoutPlans();
    const getInfo = async () => {
      const resp = await getDemographicInfo();
      setDemographics(resp);
    };
    getInfo();
  }, [filterCategory, filterLevel]);

  return (
    <WidgetCard
      className="relative dark:bg-inherit "
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
      title="Workout Plans"
      titleClassName="whitespace-nowrap "
      action={
        <div className="hidden md:flex flex-row w-full justify-end items-end gap-4">
          <Select
            label="Level"
            options={[
              { label: "All", value: "all" },
              { label: "Beginner", value: "beginner" },
              { label: "Intermediate", value: "intermediate" },
              { label: "Advanced", value: "advanced" },
            ]}
            onChange={(option: any) => {
              handleFilterLevelChange(option.value);
            }}
            value={filterLevel[0].toUpperCase() + filterLevel.slice(1)}
            className="text-gray-700 max-w-60"
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 "
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          />
          <Button
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              router.push("/workout/new");
            }}
            className="hidden md:flex items-center gap-2"
          >
            Add <PlusIcon size={20} />
          </Button>
        </div>
      }
    >
      <div className="flex items-end w-full gap-3 md:hidden my-4">
        <Select
          label="Level"
          options={[
            { label: "All", value: "all" },
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Advanced", value: "advanced" },
          ]}
          onChange={(option: any) => {
            handleFilterLevelChange(option.value);
          }}
          value={filterLevel[0].toUpperCase() + filterLevel.slice(1)}
          className="text-gray-700 max-w-60"
          // labelClassName=""
          // dropdownClassName="dark:bg-gray-800 "
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
        />
        <Button
          onClick={() => {
            if (!auth && !access) {
              toast.error("You aren't allowed to make changes");
              return;
            }
            router.push("/workout/new");
          }}
          className="flex items-center gap-2"
        >
          Add <PlusIcon size={20} />
        </Button>
      </div>
      {loading ? (
        <div className="grid h-32 flex-grow place-content-center items-center">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <Table
          variant="minimal"
          data={workoutPlans}
          scroll={{ y: 500 }}
          //@ts-ignore
          columns={columns}
          className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 text-nowrap"
        />
      )}

      <Drawer
        isOpen={showMembers}
        onClose={() => {
          setShowMembers(false);
        }}
        size="md"
        // className="p-6"
        containerClassName="p-4 space-y-6"
      >
        <Title as="h3">Assigned Members</Title>
        <div className="flex flex-col ">
          {members !== null && members.length > 0
            ? members?.map((item: any) => (
                <div
                  className="flex p-4 justify-between items-center border cursor-pointer border-gray-300  mb-4 rounded-lg shadow-md transition-transform duration-500 ease-out hover:shadow-lg hover:scale-[1.02]"
                  key={item.id}
                >
                  <Link href={`/member_profile/yk62-${item.id}-71he`}>
                    {/* yk$6372h$e */}
                    <figure className="flex items-center gap-3">
                      <Avatar
                        name={item.name}
                        src={item.member_image || "/placeholder-avatar.jpg"}
                      />
                      <figcaption className="grid gap-0.5">
                        <Text className="font-lexend text-sm text-nowrap text-clip font-medium text-gray-900  hover:text-primary">
                          {item.name}
                        </Text>
                        <Text className="text-[13px] text-gray-500 ">
                          {item.phone}
                        </Text>
                      </figcaption>
                    </figure>
                  </Link>
                  <div className="flex justify-between gap-5">
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
                    <Link href={`/member_profile/yk62-${item.id}-71he`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))
            : null}
        </div>
      </Drawer>
      <Drawer
        isOpen={showAssign}
        onClose={() => {
          setShowAssign(false);
          setCurrentMember(null);
          setSearchText("");
          setMemberList([]);
          setSelectedPlan(null);
          setNewTrainer("");
          // setTimeout(() => handleSearch("", false, true), 300);
          handleSearch("", false, true);
        }}
        size="lg"
        containerClassName="p-6 space-y-6"
      >
        {/* <div> */}
        <Title as="h3">Assign Workout</Title>
        {/* </div> */}
        <div className="relative">
          <Input
            value={searchText}
            ref={inputRef}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder={
              currentMember === null
                ? "Search Members to Assign Membership"
                : "Clear Selected Member to Search"
            }
            onFocus={() => {
              searchText.length === 0 && handleSearch("", false, true);
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
                    setTimeout(() => handleSearch("", false, true), 300);
                  }}
                >
                  <XIcon />
                </Button>
              )
            }
          />
          {currentMember === null && (
            <div className="absolute top-full left-0 z-[9999999999]  overflow-y-auto custom-scrollbar max-h-[80vh] flex w-full border-2 shadow rounded-lg p-4 py-8 mt-4 gap-2 flex-col items-stretch bg-gray-50 ">
              {loading || loading2 ? (
                <div className="flex justify-center items-center w-full my-4">
                  <Loader variant="spinner" size="xl" />
                </div>
              ) : memberList.length ? (
                memberList.map((item, index) => {
                  const isSecondToLast = index === memberList.length - 2;
                  return (
                    <div
                      ref={isSecondToLast && hasMore ? observerRef : null}
                      className="flex items-center gap-4 p-4 rounded  cursor-pointer hover:bg-gray-100 hover:scale-y-105 group"
                      key={index}
                      onClick={() => {
                        if (
                          item.membership_details?.latest_membership_end_date &&
                          new Date(
                            item.membership_details.latest_membership_end_date
                          ) < new Date()
                        ) {
                          toast.error(
                            "Can't Assign Workout for a Expired Member."
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
                        <Text className="font-medium text-gray-900  group-hover:text-gray-900">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 ">{item.phone}</Text>
                      </div>
                      <Badge variant="outline">
                        {item.membership_details?.name || "N/A"}
                      </Badge>
                      <Badge
                        size="sm"
                        variant="outline"
                        color={
                          item.membership_details?.latest_membership_end_date &&
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
                      >
                        {item.membership_details?.latest_membership_end_date &&
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
                  );
                })
              ) : (
                <div className="my-4">
                  <Empty text="No Members Found" />
                </div>
              )}
            </div>
          )}
          {currentMember && (
            <div className=" p-4 ">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <Title as="h6" className="font-semibold ">
                    Assigning Workout -{" "}
                    {
                      workoutPlans.find(
                        (plan: WorkoutPlan) => plan.id === selectedPlan
                      )?.name
                    }{" "}
                    To
                  </Title>
                  <XIcon
                    onClick={() => {
                      setSearchText("");
                      setMemberList([]);
                      setCurrentMember(null);
                      setTimeout(() => handleSearch("", false, true), 300);
                    }}
                    size={24}
                    className="hover:text-primary cursor-pointer hover:scale-105"
                  />
                </div>

                <div className="flex items-start m-2 gap-4 max-w-sm">
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

                <div className="space-y-2 max-w-sm mx-4">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center justify-start">
                      <span className="me-2 h-2 w-2 rounded-full bg-blue-500" />
                      <Title as="h6" className="text-sm font-normal ">
                        Membership End Date
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
                        Days Left
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
                        Selected Workout Plan
                      </Title>
                    </div>
                    <Text className={`font-medium text-gray-700 `}>
                      {currentMember?.status === "active" ? (
                        <Badge color="success" variant="flat">
                          Active
                        </Badge>
                      ) : currentMember?.status === "expired" ? (
                        <Badge color="danger" variant="flat">
                          Expired
                        </Badge>
                      ) : currentMember?.status === "upcoming" ? (
                        <Badge color="secondary" variant="flat">
                          Upcoming
                        </Badge>
                      ) : null}
                    </Text>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center justify-start">
                      <span className="me-2 h-2 w-2 rounded-full bg-purple-500" />
                      <Title as="h6" className="text-sm font-normal ">
                        Due
                      </Title>
                    </div>
                    <Text as="span">
                      {getDueBadge({
                        dueAmount: currentMember?.total_due || 0,
                        symbol: demographics?.currency_symbol,
                      })}
                    </Text>
                  </div>
                </div>
                <Select
                  label="Assign New Trainer"
                  value={
                    availableTrainers?.find(
                      (train: any) => train.id === newTrainer
                    )?.name || ""
                  }
                  onChange={(option: any) => setNewTrainer(option.value)}
                  options={
                    availableTrainers
                      ? availableTrainers.map((trainer: any) => ({
                          value: trainer?.id || "", // Should be the ID
                          label: trainer?.name || "", // Should be the name
                        }))
                      : []
                  }
                  className="w-full"
                  labelClassName=""
                />
                <div className="flex items-center justify-center">
                  <Button onClick={AssignWorkout}>Assign</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </WidgetCard>
  );
};

export default WorkoutSection;
