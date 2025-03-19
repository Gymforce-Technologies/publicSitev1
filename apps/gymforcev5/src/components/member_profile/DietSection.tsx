"use client";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@/components/cards/widget-card";
import ControlledTable from "@/components/controlled-table";
import { HeaderCell } from "@/components/table";
import { useColumn } from "@core/hooks/use-column";
import AvatarCard from "@core/ui/avatar-card";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BsArrowRight } from "react-icons/bs";
import {
  Badge,
  Button,
  Text,
  Title,
  Select,
  Empty,
  Drawer,
  Loader,
  Tooltip,
  Avatar,
} from "rizzui";
// import Loader from "../../../loading";

// interface TrainerDetails {
//   id: number;
//   name: string;
//   stafftype_name: string;
// }

interface DietPlan {
  id: number;
  name: string;
  description: string;
  members: any[];
  member_count: number;
  categories: string;
  total_calories: string;
  total_protein: string;
  total_carbs: string;
  total_fats: string;
  plan_type: string;
  image_url: string;
  active: boolean;
}

export default function DietSection({ params }: { params: { id: string } }) {
  const newId = params.id.toString().split("-")[1];
  const [data, setData] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<number>(0);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  // const router = useRouter();
  const [dataLoad, setDatLoad] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [availableTrainers, setAvailableTrainers] = useState<any[]>([]);
  const [newTrainer, setNewTrainer] = useState<any>("");
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<any[] | null>(null);
  const router = useRouter();
  const fetchAllDietPlans = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `api/list-dietplans/?gym_id=${gymId}`,
        {
          id: newID("diet-plans-list"),
        }
      );
      const data = response.data;

      const transformedPlans: DietPlan[] = data.map(
        (item: any, index: number) => ({
          ...item,
          index: index + 1,
        })
      );
      console.log(response.data);
      setDietPlans(transformedPlans);
    } catch (error) {
      console.error("Error fetching diet plans:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchData = async () => {
    const gymId = await retrieveGymId();
    const response = await AxiosPrivate.get(
      `/api/member/${newId}/diet-plans/?gym_id=${gymId}`,
      {
        id: newID(`member-diet-plans-${newId}`),
      }
    );
    const data = response.data;

    const transformedPlans = data.map((item: any, index: number) => ({
      ...item,
      index: index + 1,
    }));
    setCurrentPlan(transformedPlans);
    setData(transformedPlans);
    // if (!transformedPlans.length) {
    await fetchAllDietPlans();
    // }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const AssignDiet = async () => {
    const gymId = await retrieveGymId();
    const member_id = parseInt(newId);
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
      `api/diet-plans/${selectedPlan}/assign_members_and_trainer/?gym_id=${gymId}`,
      {
        assignments,
      }
    );
    invalidateAll();
    toast.success("Diet Plan Assigned successfully");
    setSelectedPlan(0);
    setSelectedDetails(null);
    fetchAllDietPlans();
    setOpenAdd(false);
    fetchData();
  };

  const getDietDetails = async (id: number) => {
    setDatLoad(true);
    const gymId = await retrieveGymId();
    const dietResponse = await AxiosPrivate.get(
      `api/diet-plans/${id}/?gym_id=${gymId}`,
      {
        id: newID(`diet-plan-${id}`),
      }
    );
    setSelectedDetails(dietResponse.data);
    setDatLoad(false);
  };

  useEffect(() => {
    if (selectedPlan) {
      getDietDetails(selectedPlan);
    }
    const getTrainers = async () => {
      const gymId = await retrieveGymId();
      const URL = `/api/staff/?deleted=false&&gym_id=${gymId}`;
      const res = await AxiosPrivate(URL, {
        id: newID(`trainers-prereq-diet-plans`),
      });
      console.log(res.data);
      setAvailableTrainers(res.data);
    };
    getTrainers();
  }, [selectedPlan]);

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
        width: 220,
        render: (name: string, row: DietPlan) => (
          <AvatarCard
            name={name}
            src={row.image_url}
            description={row.description}
            nameClassName="max-w-60 truncate"
          />
        ),
      },
      // {
      //   title: <HeaderCell title="Trainer" className="text-sm font-semibold" />,
      //   dataIndex: "trainer_details",
      //   key: "trainer_details",
      //   width: 100,
      //   render: (trainer_details: TrainerDetails) => (
      //     <Text>{trainer_details.name}</Text>
      //   ),
      // },
      {
        title: (
          <HeaderCell title="Category" className="text-sm font-semibold" />
        ),
        dataIndex: "categories",
        key: "categories",
        width: 120,
        render: (categories: string) => (
          <Badge variant="outline" className="capitalize truncate scale-90">
            {categories}
          </Badge>
        ),
      },
      {
        title: (
          <HeaderCell title="Calories" className="text-sm font-semibold" />
        ),
        dataIndex: "total_calories",
        key: "total_calories",
        width: 80,
        render: (total_calories: string) => <Text>{total_calories} cal</Text>,
      },
      {
        title: <HeaderCell title="Macros" className="text-sm font-semibold" />,
        dataIndex: "total_calories",
        key: "total_calories",
        width: 150,
        render: (total_calories: string, row: DietPlan) => (
          <Text className="text-xs mt-1 text-nowrap">
            P: {row.total_protein}g, C:{" \n"}
            {row.total_carbs}g, F: {row.total_fats}g
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Plan Type" className="text-sm font-semibold" />
        ),
        dataIndex: "plan_type",
        key: "plan_type",
        width: 100,
        render: (plan_type: string) => (
          <Text className="capitalize">{plan_type || "N/A"}</Text>
        ),
      },
      {
        title: <HeaderCell title="Members" className="text-sm font-semibold" />,
        dataIndex: "member_count",
        key: "member_count",
        width: 100,
        render: (member_count: number, row: DietPlan) => (
          <Tooltip
            content={
              member_count > 1
                ? `View ${member_count - 1} other Members`
                : `No other Members`
            }
            placement="bottom"
            animation="slideIn"
          >
            <Button
              className="flex gap-1.5 items-center scale-90"
              size="sm"
              onClick={() => {
                if (row.member_count === 1) {
                  toast.error("Other Members are not Available");
                  return;
                }
                setMembers(
                  row.members.filter((item: any) => item.id !== parseInt(newId))
                );
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
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (id: number) => (
          <Link href={`/member_profile/yk62-${newId}-71he/diet/${id}/`}>
            <EyeIcon
              className="cursor-pointer border p-0.5 rounded hover:border-primary"
              size={20}
            />
          </Link>
        ),
      },
    ],
    []
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  const { visibleColumns } = useColumn(columns);

  const renderOptionDisplayValue = (option: any) => {
    return (
      <div className="flex flex-col gap-2 my-0.5">
        <Text className="font-semibold">{option.label}</Text>
        <div className="flex items-center gap-4">
          <Text className="whitespace-nowrap">
            Calories:{" "}
            <Badge variant="flat" size="sm">
              {option.calories}
            </Badge>
          </Text>
          <Text className="truncate text-sm min-w-60 w-60 max-w-60">
            Category: {option.category}
          </Text>
          {/* <Text className="whitespace-nowrap">Trainer: {option.trainer}</Text> */}
        </div>
      </div>
    );
  };

  function renderEmptyDiet() {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between mx-2"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-nowrap">No Diet Plan Found</Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Diet Plan Section");
            router.push("/diet-management/meals/new");
          }}
          className="text-primary text-sm text-nowrap max-sm:scale-90"
        >
          Add Diet Plan
          <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  return (
    <WidgetCard
      className="relative dark:bg-inherit"
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 flex items-center justify-end w-full @[42rem]:w-full @[57rem]:w-auto"
      title="Diet Plans"
      titleClassName="whitespace-nowrap"
      action={
        <Button onClick={() => setOpenAdd(true)} className="mx-2">
          Add Plan
        </Button>
      }
    >
      <ControlledTable
        variant={"minimal"}
        isLoading={loading}
        showLoadingText={true}
        data={data}
        emptyText={
          <div className="min-w-full flex flex-col items-center justify-center gap-2">
            <Empty text="No Diet Plan" />
            <Button onClick={() => setOpenAdd(true)} size="sm">
              Assign a Plan
            </Button>
          </div>
        }
        //@ts-ignore
        columns={visibleColumns}
        scroll={{ y: 500 }}
        className="rounded-md text-nowrap my-2 text-sm shadow-sm [&_.rc-table-row:hover]:bg-gray-100 [&_.rc-table-thead]:bg-gray-100"
      />

      <Drawer
        isOpen={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setSelectedPlan(0);
          setSelectedDetails(null);
        }}
        containerClassName="flex flex-col gap-6 p-6"
        size="lg"
      >
        {" "}
        <Title as="h6">Please Choose the Diet plan from below</Title>
        <Select
          name="plans"
          label="Available Diet Plans"
          options={
            dietPlans.length
              ? dietPlans.map((item) => ({
                  label: item.name,
                  value: item.id,
                  calories: item.total_calories,
                  category: item.categories,
                  // trainer: item.trainer_details.name,
                }))
              : [
                  {
                    label: "No Diet Plans Available",
                    value: 0,
                    calories: "0",
                    category: "N/A",
                    // trainer: "N/A",
                  },
                ]
          }
          value={dietPlans.find((item) => item.id === selectedPlan)?.name}
          className="max-w-2xl"
          onChange={(option: any) => {
            setSelectedPlan(option.value);
          }}
          getOptionDisplayValue={(option) =>
            dietPlans.length
              ? renderOptionDisplayValue(option)
              : renderEmptyDiet()
          }
        />
        {dataLoad ? (
          <div className="min-w-full flex justify-center items-center">
            <Loader variant="threeDot" size="xl" />
          </div>
        ) : selectedPlan && selectedDetails ? (
          <div className="flex flex-col items-center min-w-full gap-10">
            <div className="flex flex-col gap-2 min-w-full">
              <Title as="h6" className="my-1">
                Selected Diet Plan
              </Title>
              <div className="p-4 bg-gray-50 space-y-2 shadow rounded-lg">
                <Text>Name: {selectedDetails.name}</Text>
                <Text>Category: {selectedDetails.categories}</Text>
                <Text className="max-w-2xl">
                  Description: {selectedDetails.description}
                </Text>
                <Text>Calories: {selectedDetails.total_calories}</Text>
                {/* <Text>Protein: {selectedDetails.total_protein}g</Text>
                  <Text>Carbs: {selectedDetails.total_carbs}g</Text>
                  <Text>Fats: {selectedDetails.total_fats}g</Text>*/}
                <Text>Trainer: {selectedDetails.trainer_details.name}</Text>
                <Text>Plan Type: {selectedDetails.plan_type}</Text>
                <Text>
                  Current Members Count:{" "}
                  {selectedDetails.members?.length
                    ? selectedDetails.members.length
                    : "Nil"}
                </Text>
              </div>
            </div>
            <Select
              label="Assign New Trainer"
              value={
                availableTrainers?.find((train: any) => train.id === newTrainer)
                  ?.name || ""
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
            <Button onClick={AssignDiet}>Assign</Button>
          </div>
        ) : null}
      </Drawer>
      <Drawer
        isOpen={showMembers}
        onClose={() => {
          setShowMembers(false);
        }}
        size="md"
        // className="p-6"
        containerClassName="p-4 space-y-6"
      >
        <Title as="h3">Other Assigned Members</Title>
        <div className="flex flex-col ">
          {members !== null && members.length > 0 ? (
            members?.map((item: any) => (
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
          ) : (
            <Empty text="No Other Members" textClassName="mt-1" />
          )}
        </div>
      </Drawer>
    </WidgetCard>
  );
}
