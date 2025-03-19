"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader, Text, Select, Button, Badge } from "rizzui";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { PlusIcon } from "lucide-react";
import toast from "react-hot-toast";
import AvatarCard from "@core/ui/avatar-card";
import { useRouter } from "next/navigation";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { isStaff } from "@/app/[locale]/auth/Staff";

// Types
type Gym = {
  id: number;
  name: string;
};

type TargetMuscle = {
  id: number;
  name: string;
  description: string;
  active: boolean;
  is_default: boolean;
  gyms: Gym[];
};

type RequiredEquipment = {
  id: number;
  gyms: Gym[];
  name: string;
  is_default: boolean;
  active: boolean;
  description: string;
  image_url: string | null;
  category: string;
  condition: string;
};

type Exercise = {
  index?: number;
  id: number;
  gyms: Gym[];
  target_muscles: TargetMuscle[];
  required_equipment: RequiredEquipment[];
  name: string;
  image_url: string;
  description: string;
  availability: string;
  default_exercise_type: string;
  default_reps: number;
  default_sets: number;
  default_rest_duration: number;
  default_level: string;
  default_sets_time: number;
  instructions: string;
  is_default: boolean;
  active: boolean;
};

const ExerciseSection: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  // const [column, setColumn] = useState<keyof Exercise>("id");
  const [filterType, setFilterType] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  // Fetch exercises
  const fetchExercises = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(`api/exercises/?gym_id=${gymId}`, {
        id: newID("exercises"),
      });
      if (filterLevel === "All" && filterType === "All") {
        setExercises(resp.data);
      } else if (filterLevel === "All" && filterType !== "All") {
        setExercises(
          resp.data.filter(
            (item: Exercise) => item.default_exercise_type === filterType
          )
        );
      } else if (filterLevel !== "All" && filterType === "All") {
        setExercises(
          resp.data.filter(
            (item: Exercise) => item.default_level === filterLevel
          )
        );
      } else {
        setExercises(
          resp.data.filter(
            (item: Exercise) =>
              item.default_level === filterLevel &&
              item.default_exercise_type === filterType
          )
        );
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDeleteExercise = async (exerciseId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`api/exercises/${exerciseId}/?gym_id=${gymId}`);
      toast.success("Exercise deleted successfully");
      invalidateAll();
      // setLoading(true);
      fetchExercises();
    } catch (error) {
      console.error("Error deleting exercise:", error);
    }
  };

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
  // Columns for the table
  const getColumns = useCallback(() => {
    return [
      {
        title: <HeaderCell title="S.No" />,
        dataIndex: "index",
        key: "index",
        width: 60,
        render: (index: number) => <Text>{index}</Text>,
      },
      {
        title: <HeaderCell title="Name" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (name: string, row: Exercise) => (
          <AvatarCard
            name={name}
            src=""
            description={row.description}
            className="text-white max-w-xs  overflow-x-clip"
          />
        ),
      },
      {
        title: <HeaderCell title="Type" />,
        dataIndex: "default_exercise_type",
        key: "default_exercise_type",
        width: 100,
        render: (default_exercise_type: string) => (
          <Text className="capitalize">{default_exercise_type}</Text>
        ),
      },
      {
        title: <HeaderCell title="Level" />,
        dataIndex: "default_level",
        key: "default_level",
        width: 120,
        render: (default_level: string) => (
          <Badge
            variant="flat"
            color={
              default_level === "beginner"
                ? "success"
                : default_level === "intermediate"
                  ? "primary"
                  : "secondary"
            }
          >
            {default_level}
          </Badge>
        ),
      },
      {
        title: <HeaderCell title="Duration" />,
        dataIndex: "duration",
        key: "duration",
        width: 100,
        render: (duration: number, row: Exercise) => (
          <Text className="capitalize font-semibold">
            {row.default_exercise_type === "time"
              ? `${duration}s`
              : `${row.default_sets} Sets`}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="Access" />,
        dataIndex: "availability",
        key: "availability",
        width: 100,
        render: (availability: string) => (
          <Badge
            variant="flat"
            color={availability === "free" ? "success" : "secondary"}
          >
            {availability}
          </Badge>
        ),
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number) => (
          <div className="flex gap-4">
            <MdEdit
              size={20}
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                router.push(`/workout/exercise/edit/${id}`);
              }}
              className="cursor-pointer hover:text-primary hover:scale-105 transition-transform"
            />
            <MdDelete
              size={20}
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                handleDeleteExercise(id);
              }}
              className="cursor-pointer hover:text-primary hover:scale-105 transition-transform"
            />
          </div>
        ),
      },
    ];
  }, [auth, access]);

  const columns = useMemo(() => getColumns(), [getColumns]);

  useEffect(() => {
    fetchExercises();
  }, [filterType, filterLevel]);

  return (
    <WidgetCard
      className="relative dark:bg-inherit "
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
      title="Exercise List"
      titleClassName="whitespace-nowrap "
      action={
        <div className="hidden md:flex gap-4 justify-end items-end">
          <Select
            label="Type"
            options={[
              { label: "All", value: "All" },
              { label: "Rep Based", value: "Rep" },
              { label: "Time Based", value: "Time" },
            ]}
            onChange={(option: any) => setFilterType(option.value)}
            value={filterType}
            className={"max-w-40 capitalize"}
          />
          <Select
            label="Level"
            options={[
              { label: "All", value: "All" },
              { label: "Beginner", value: "Beginner" },
              { label: "Intermediate", value: "Intermediate" },
              { label: "Advanced", value: "Advanced" },
            ]}
            onChange={(option: any) => setFilterLevel(option.value)}
            // value={filterLevel}
            value={filterLevel}
            className={"max-w-40 capitalize"}
          />
          <Button
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              router.push("/workout/exercise/new");
            }}
          >
            Add <PlusIcon size={20} />
          </Button>
        </div>
      }
    >
      <div className="flex md:hidden gap-2 mt-1 gap-x-3 justify-end items-end flex-wrap">
        <Select
          label="Type"
          options={[
            { label: "All", value: "All" },
            { label: "Rep Based", value: "Rep" },
            { label: "Time Based", value: "Time" },
          ]}
          onChange={(option: any) => setFilterType(option.value)}
          value={filterType}
          className={"max-w-32 capitalize"}
        />
        <Select
          label="Level"
          options={[
            { label: "All", value: "All" },
            { label: "Beginner", value: "Beginner" },
            { label: "Intermediate", value: "Intermediate" },
            { label: "Advanced", value: "Advanced" },
          ]}
          onChange={(option: any) => setFilterLevel(option.value)}
          // value={filterLevel}
          value={filterLevel}
          className={"max-w-36 capitalize"}
        />
        <Button
          onClick={() => {
            if (!auth && !access) {
              toast.error("You aren't allowed to make changes");
              return;
            }
            router.push("/workout/exercise/new");
          }}
          className="scale-90"
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
          data={exercises}
          scroll={{ y: 500 }}
          //@ts-ignore
          columns={columns}
          className="text-sm mt-4 md:mt-6 text-nowrap rounded-sm [&_.rc-table-row:hover]:bg-gray-100"
        />
      )}
    </WidgetCard>
  );
};

export default ExerciseSection;
