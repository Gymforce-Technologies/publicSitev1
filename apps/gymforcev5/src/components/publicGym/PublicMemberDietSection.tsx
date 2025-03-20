"use client";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@/components/cards/widget-card";
import ControlledTable from "@/components/controlled-table";
import { HeaderCell } from "@/components/table";
import { useColumn } from "@core/hooks/use-column";
import AvatarCard from "@core/ui/avatar-card";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Text, Badge, Empty } from "rizzui";

interface DietPlan {
  index: number;
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
export default function PublicMemberDietSection({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const getBasic = async () => {
      setLoading(true);
      try {
        const getToken = localStorage.getItem("member_token");
        const resp = await AxiosPublic.get(
          `https://backend.gymforce.in/center/diet-details/?auth=${getToken}`,
          {
            id: `Member-Diet-${getToken}`,
          }
        );
        setData(
          resp.data?.map((item: any, index: number) => ({
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
      title="Diet Plans"
      titleClassName="whitespace-nowrap"
    >
      <ControlledTable
        variant={"minimal"}
        isLoading={loading}
        showLoadingText={true}
        data={data}
        emptyText={
          <div className="min-w-full flex flex-col items-center justify-center gap-2">
            <Empty text="No Diet Plan" />

          </div>
        }
        //@ts-ignore
        columns={visibleColumns}
        scroll={{ y: 500 }}
        className="rounded-md my-2 text-sm shadow-sm [&_.rc-table-row:hover]:bg-gray-100 [&_.rc-table-thead]:bg-gray-100"
      />
    </WidgetCard>
  );
}
