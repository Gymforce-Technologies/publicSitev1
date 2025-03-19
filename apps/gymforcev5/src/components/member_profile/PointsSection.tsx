"use client";
import React, { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Drawer,
  Input,
  Loader,
  Text,
  Textarea,
  Title,
} from "rizzui";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface Transaction {
  id: number;
  points: number;
  rule: string;
  transaction_type: string;
  note: string;
  created_at: string;
  member: number;
}

interface PointsData {
  loyalty_points: number;
  transactions: Transaction[];
}

export default function PointsSection({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const newId = params.id.toString().split("-")[1];
  const [newPoint, setNewPoint] = useState({
    member_id: newId,
    points: "",
    note: "",
  });
  const [showNew, setShowNew] = useState(false);

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      const response = await AxiosPrivate.get(
        `/api/member/${newId}/points/?gym_id=1`,
        {
          id: newID(`member-points-${newId}`),
        }
      );
      setPointsData(response.data);
    } catch (error) {
      console.error("Error fetching points data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(`/api/add-points/?gym_id=${gymId}`, {
        ...newPoint,
      });
      invalidateAll();
      fetchPointsData();
      setShowNew(false);
      setNewPoint({
        member_id: newId,
        points: "",
        note: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPointsData();
  }, [newId]);

  const columns = [
    {
      title: <HeaderCell title="Date" className="mx-2" />,
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => (
        <Text className="mx-2">{formateDateValue(new Date(date))}</Text>
      ),
    },
    {
      title: <HeaderCell title="Points" />,
      dataIndex: "points",
      key: "points",
      width: 100,
      render: (points: number, row: Transaction) => (
        <Text
          className={
            row.transaction_type.toLowerCase() === "credit"
              ? " text-green-500 font-bold"
              : " text-red-500 font-bold"
          }
        >
          {row.transaction_type.toLowerCase() === "credit" ? "+" : "-"}
          {points}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Type" />,
      dataIndex: "transaction_type",
      key: "transaction_type",
      width: 100,
    },
    {
      title: <HeaderCell title="Note" />,
      dataIndex: "note",
      key: "note",
      width: 300,
    },
  ];

  return (
    <WidgetCard
      title="Loyalty Points"
      titleClassName="leading-none"
      headerClassName="mb-3 lg:mb-4"
      className="max-w-full"
      action={
        <div className="hidden md:flex items-center gap-2 mr-10">
          <Button
            size="sm"
            className="scale-105 mr-2"
            onClick={() => setShowNew(true)}
          >
            Add Points
          </Button>
          <Text className="">Total Points:</Text>
          <Badge
            variant="flat"
            className="flex flex-row items-center gap-1.5 cursor-pointer scale-95"
          >
            <Text className="text-primary font-semibold text-[15px]">
              {pointsData?.loyalty_points || 0}
            </Text>
          </Badge>
        </div>
      }
    >
      <div className="flex md:hidden items-center justify-end gap-2.5 my-2.5">
        <Button size="sm" className=" mr-2" onClick={() => setShowNew(true)}>
          Add Points
        </Button>
        <Text className="">Total Points:</Text>
        <Badge
          variant="flat"
          className="flex flex-row items-center gap-1.5 cursor-pointer scale-95"
        >
          <Text className="text-primary font-semibold text-[15px]">
            {pointsData?.loyalty_points || 0}
          </Text>
        </Badge>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <Table
          data={pointsData?.transactions || []}
          //@ts-ignore
          columns={columns}
          scroll={{ y: 500 }}
          className="text-sm text-nowrap mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100/80"
          variant="minimal"
        />
      )}

      <Drawer
        isOpen={showNew}
        onClose={() => {
          setShowNew(false);
        }}
        containerClassName="p-4 lg:p-6"
      >
        <div className="space-y-4">
          <Title as="h5">Additional Points</Title>
          <Input
            name="Points"
            type="text"
            label="Points *"
            placeholder="Enter the Points ..."
            onChange={(e) => {
              setNewPoint((prev) => ({ ...prev, points: e.target.value }));
            }}
          />
          <Textarea
            name="Info "
            label="Info "
            placeholder="Enter the Details for the Additional Points."
            onChange={(e) => {
              setNewPoint((prev) => ({ ...prev, note: e.target.value }));
            }}
          />
          <div className="mx-auto w-full flex items-center justify-center">
            <Button
              onClick={addPoints}
              disabled={newPoint.points === "0" || newPoint.points.length === 0}
            >
              Add
            </Button>
          </div>
        </div>
      </Drawer>
    </WidgetCard>
  );
}
