"use client";
import React, { useState, useEffect, useCallback, useMemo, act } from "react";
import { Loader, Text, Tooltip, ActionIcon, Select, Button } from "rizzui";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { PlusIcon } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import AvatarCard from "@core/ui/avatar-card";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { isStaff } from "@/app/[locale]/auth/Staff";

const Add = dynamic(() => import("@/components/workout/equipment/Add"));
const Edit = dynamic(() => import("@/components/workout/equipment/Edit"));

interface Equipment {
  index: number;
  id: number;
  name: string;
  description: string;
  category: string;
  condition: string;
  active?: boolean;
}

const EquipmentsSection: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [column, setColumn] = useState<keyof Equipment>("id");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchEquipment = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `api/equipments/?gym_id=${gymId}`,
        {
          id: newID("equipments"),
        }
      );
      const formattedData: Equipment[] = response.data.map(
        (item: any, index: number) => ({
          index: index + 1,
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          condition: item.condition,
          active: item.active,
        })
      );
      if (filterStatus === "active") {
        setEquipment(formattedData.filter((item) => item.active));
      } else if (filterStatus === "inactive") {
        setEquipment(formattedData.filter((item) => !item.active));
      } else {
        setEquipment(formattedData);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async (equipmentId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(
        `api/equipments/${equipmentId}/?gym_id=${gymId}`
      );
      toast.success("Equipment deleted successfully");
      fetchEquipment();
      invalidateAll();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Something went wrong while deleting equipment");
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

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingEquipment(null);
  };

  const getColumns = useCallback(
    (column: keyof Equipment) => [
      {
        title: (
          <HeaderCell title="S.No" className="text-sm font-semibold mx-auto" />
        ),
        dataIndex: "index",
        key: "index",
        width: 80,
        render: (index: number) => <Text className="pl-2">{index}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (name: string, row: Equipment) => (
          <AvatarCard
            name={name}
            src={""}
            nameClassName="max-w-60 text-clip"
            description={row.description}
            className="max-w-xs truncate"
          />
        ),
      },
      {
        title: (
          <HeaderCell title="Condition" className="text-sm font-semibold" />
        ),
        dataIndex: "condition",
        key: "condition",
        width: 150,
        render: (condition: string) => <Text>{condition}</Text>,
      },
      {
        title: (
          <HeaderCell title="Category" className="text-sm font-semibold" />
        ),
        dataIndex: "category",
        key: "category",
        width: 150,
        render: (category: string) => <Text>{category || "N/A"}</Text>,
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 150,
        render: (id: number, row: Equipment) => (
          <div className="flex items-center gap-4 justify-start ps-4">
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsEditOpen(true);
                setEditingEquipment(row);
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
                handleDeleteEquipment(id);
              }}
              variant="text"
            >
              <MdDelete size={20} />
            </ActionIcon>
          </div>
        ),
      },
    ],
    [column, auth, access]
  );

  const columns = useMemo(() => getColumns(column), [column, getColumns]);

  const handleFilterChange = useCallback((value: string) => {
    setFilterStatus(value);
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [filterStatus]);

  return (
    <>
      <WidgetCard
        className="relative dark:bg-inherit "
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="Gym Equipment"
        titleClassName="whitespace-nowrap "
        action={
          <div className="flex flex-row w-full justify-end items-end gap-4">
            <Button
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 max-sm:scale-90"
            >
              Add <PlusIcon size={20} />
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="grid h-32 flex-grow place-content-center items-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={equipment}
            scroll={{ y: 500 }}
            //@ts-ignore
            columns={columns}
            className="text-sm mt-4 text-nowrap md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 "
          />
        )}
      </WidgetCard>
      {isCreateModalOpen && (
        <Add
          setIsCreateModalOpen={setIsCreateModalOpen}
          fetchEquipment={fetchEquipment}
        />
      )}
      {isEditOpen && editingEquipment && (
        <Edit
          setIsEditOpen={handleCloseEdit}
          fetchEquipment={fetchEquipment}
          equipment={editingEquipment}
          setEquipment={setEditingEquipment}
        />
      )}
    </>
  );
};

export default EquipmentsSection;
