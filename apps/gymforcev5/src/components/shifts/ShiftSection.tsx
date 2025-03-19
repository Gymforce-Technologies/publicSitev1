"use client";
import React, { useState, useEffect, useCallback, useMemo, act } from "react";
import {
  Loader,
  Text,
  Tooltip,
  ActionIcon,
  Select,
  Button,
  //   TimePicker,
  Input,
  Switch,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "../../app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { PlusIcon } from "lucide-react";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import DateCell from "@core/ui/date-cell";
import { isStaff } from "@/app/[locale]/auth/Staff";

const AddShiftModal = dynamic(() => import("@/components/shifts/Add"));
const EditShiftModal = dynamic(() => import("@/components/shifts/Edit"));

interface Shift {
  index: number;
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  description: string;
  active: boolean;
}

const ShiftSection = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [column, setColumn] = useState<keyof Shift>("id");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchShifts = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(`/api/shifts/?gym_id=${gymId}`, {
        id: newID(`shifts-list`),
      });
      console.log(response.data);
      const transformedData = response.data.map((item: any, index: number) => ({
        index: index + 1,
        id: item.id,
        name: item.name,
        start_time: item.start_time,
        end_time: item.end_time,
        description: item.description,
        active: item.active,
      }));
      setShifts(transformedData);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Something went wrong while fetching shifts");
    } finally {
      setLoading(false);
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
        response.data.permissions["mainConfigManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };
  const handleDeleteShift = async (shiftId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`/api/shifts/${shiftId}/?gyms_id=${gymId}`);
      invalidateAll();
      fetchShifts();
      toast.success("Shift deleted successfully");
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("Something went wrong while deleting shift");
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingShift(null);
    // fetchShifts();
  };

  const handleFavoriteShifts = async (id: number, active: boolean) => {
    const gymId = await retrieveGymId();
    try {
      await AxiosPrivate.patch(`/api/shifts/${id}/?gyms_id=${gymId}`, {
        active: !active,
      });
      invalidateAll();
      fetchShifts();
      toast.success("Shift updated successfully");
    } catch (error) {
      console.error("Error updating shift:", error);
      toast.error("Something went wrong while updating shift");
    }
  };

  const getColumns = useCallback(
    (column: keyof Shift) => [
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
        render: (name: string) => <Text>{name}</Text>,
      },
      {
        title: (
          <HeaderCell title="Start Time" className="text-sm font-semibold" />
        ),
        dataIndex: "start_time",
        key: "start_time",
        width: 150,
        render: (start_time: string) => (
          <DateCell
            date={new Date(`2024-01-01T${start_time}`)}
            dateClassName="hidden"
            timeFormat="hh:mm A"
            timeClassName="font-semibold"
          />
        ),
      },
      {
        title: (
          <HeaderCell title="End Time" className="text-sm font-semibold" />
        ),
        dataIndex: "end_time",
        key: "end_time",
        width: 150,
        // render: (time: string) => <Text>{time}</Text>,
        render: (end_time: string) => (
          <DateCell
            date={new Date(`2024-01-01T${end_time}`)}
            dateClassName="hidden"
            timeFormat="hh:mm A"
            timeClassName="font-semibold"
          />
        ),
      },
      {
        title: (
          <HeaderCell title="Description" className="text-sm font-semibold" />
        ),
        dataIndex: "description",
        key: "description",
        width: 250,
        render: (description: string) => (
          <Tooltip content={description} animation="zoomIn">
            <Text className="max-w-xs truncate">{description}</Text>
          </Tooltip>
        ),
      },
      {
        title: <HeaderCell title="Enabled" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: Shift) => (
          <Tooltip content="Status" placement="right-start">
            <div>
              <Switch
                checked={row.active === true}
                onChange={async () => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  await handleFavoriteShifts(row.id, row.active);
                }}
                size="sm"
                className={`ps-2`}
              />
            </div>
          </Tooltip>
        ),
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: Shift) => (
          <div className="flex items-center gap-4 justify-start">
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsEditOpen(true);
                setEditingShift(row);
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
                handleDeleteShift(id);
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

  useEffect(() => {
    fetchShifts();
  }, []);

  return (
    <>
      <WidgetCard
        className="relative dark:bg-inherit "
        headerClassName="items-center"
        title="Shifts"
        titleClassName="whitespace-nowrap "
        action={
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
            Add Shift <PlusIcon size={20} />
          </Button>
        }
      >
        {loading ? (
          <div className="grid h-32 flex-grow place-content-center items-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={shifts}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500 }}
            striped
            className="text-sm mt-4 text-nowrap rounded-sm [&_.rc-table-row:hover]:bg-gray-50"
            // rowClassName="!dark:bg-inherit dark:text-gray-400"
          />
        )}
      </WidgetCard>

      {isCreateModalOpen && (
        <AddShiftModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchShifts}
        />
      )}

      {isEditOpen && editingShift && (
        <EditShiftModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          shift={editingShift}
          onSuccess={fetchShifts}
        />
      )}
    </>
  );
};

export default ShiftSection;
