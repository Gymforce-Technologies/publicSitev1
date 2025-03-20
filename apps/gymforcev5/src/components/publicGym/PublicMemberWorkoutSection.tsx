"use client";
import {
  AxiosPublic,
} from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@/components/cards/widget-card";
import ControlledTable from "@/components/controlled-table";
import { HeaderCell } from "@/components/table";
import { useColumn } from "@core/hooks/use-column";
import AvatarCard from "@core/ui/avatar-card";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Empty,
  Text,
  Badge,
} from "rizzui";
// interface TrainerDetails {
//   id: number;
//   name: string;
//   stafftype_name: string;
// }
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
export default function PublicMemberWorkoutSection({
  params,
}: {
  params: { id: string };
}) {
  //   const newId = params.id.toString().split("-")[1];
  const [data, setData] = useState<any[]>([]);
  // const [currentPlan, setCurrentPlan] = useState();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getBasic = async () => {
      setLoading(true);
      try {
        const getToken = localStorage.getItem("member_token");
        const resp = await AxiosPublic.get(
          `https://backend.gymforce.in/center/workout-details/?auth=${getToken}`,
          {
            id: `Member-Workout-${getToken}`,
          }
        );
        setData(
          resp.data.map((item: any, index: number) => ({
            ...item,
            index: index + 1,
          }))
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getBasic();
  }, []);

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
            nameClassName="max-w-60 truncate"
          />
        ),
      },
      {
        title: (
          <HeaderCell title="Category" className="text-sm font-semibold" />
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
        title: <HeaderCell title="Level" className="text-sm font-semibold" />,
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
        title: <HeaderCell title="Type" className="text-sm font-semibold" />,
        dataIndex: "plan_type",
        key: "plan_type",
        width: 80,
        render: (plan_type: string) => (
          <Text className="capitalize">{plan_type || "N/A"}</Text>
        ),
      },
      //   {
      //     title: <HeaderCell title="Members" className="text-sm font-semibold" />,
      //     dataIndex: "member_count",
      //     key: "member_count",
      //     width: 100,
      //     render: (member_count: number, row: WorkoutPlan) => (
      //       <Tooltip
      //         content={
      //           member_count > 1
      //             ? `View ${member_count - 1} other Members`
      //             : `No other Members`
      //         }
      //         placement="bottom"
      //         animation="slideIn"
      //       >
      //         <Button
      //           className="flex gap-1.5 items-center scale-90"
      //           size="sm"
      //           onClick={() => {
      //             if (row.member_count === 1) {
      //               toast.error("Other Members are not Available");
      //               return;
      //             }
      //             setMembers(
      //               row.members.filter((item: any) => item.id !== parseInt(newId))
      //             );
      //             setShowMembers(true);
      //           }}
      //         >
      //           Members -
      //           <Text className="bg-primary-lighter text-xs text-primary size-4 rounded-full flex items-center justify-center">
      //             {member_count}
      //           </Text>
      //         </Button>
      //       </Tooltip>
      //     ),
      //   },
      //   {
      //     title: <></>,
      //     dataIndex: "id",
      //     key: "id",
      //     width: 80,
      //     render: (id: number) => (
      //       <Link href={`/member_profile/yk62-${newId}-71he/workout/${id}/`}>
      //         <EyeIcon
      //           className="cursor-pointer border p-0.5 rounded hover:border-primary"
      //           size={20}
      //         />
      //       </Link>
      //     ),
      //   },
    ],
    []
  );
  const columns = useMemo(() => getColumns(), [getColumns]);

  const { visibleColumns } = useColumn(columns);

  return (
    <WidgetCard
      className="relative dark:bg-inherit"
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 flex items-center justify-end w-full @[42rem]:w-full @[57rem]:w-auto"
      title="Workout Plans"
      titleClassName="whitespace-nowrap"
    >
      <ControlledTable
        variant={"minimal"}
        isLoading={loading}
        showLoadingText={true}
        data={data}
        // @ts-ignore
        columns={visibleColumns}
        scroll={{ y: 500 }}
        emptyText={
          <div className="min-w-full flex flex-col items-center justify-center gap-2">
            <Empty text="No Workout" />
          </div>
        }
        className="rounded-md my-2 text-sm shadow-sm [&_.rc-table-row:hover]:bg-gray-100 [&_.rc-table-thead]:bg-gray-100"
      />
    </WidgetCard>
  );
}
