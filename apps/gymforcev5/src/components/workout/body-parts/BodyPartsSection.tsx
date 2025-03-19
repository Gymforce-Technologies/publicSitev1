"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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

const Add = dynamic(() => import("@/components/workout/body-parts/Add"));
const Edit = dynamic(() => import("@/components/workout/body-parts/Edit"));

interface BodyPart {
  index: number;
  id: number;
  name: string;
  description: string;
  active?: boolean;
  //   exercises_count: number;
}

const BodyPartsSection: React.FC = () => {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [column, setColumn] = useState<keyof BodyPart>("id");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingBodyPart, setEditingBodyPart] = useState<BodyPart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchBodyParts = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `api/bodyparts/?gym_id=${gymId}`,
        {
          id: newID("bodyparts"),
        }
      );
      // Map the response data to match your interface
      console.log("response", response.data);
      const formattedData: BodyPart[] = response.data.map(
        (item: any, index: number) => ({
          index: index + 1,
          id: item.id,
          name: item.name,
          description: item.description,
        })
      );
      console.log("formattedData", formattedData);

      if (filterStatus === "active") {
        setBodyParts(formattedData.filter((item) => item.active));
      } else if (filterStatus === "inactive") {
        setBodyParts(formattedData.filter((item) => !item.active));
      } else {
        setBodyParts(formattedData);
      }
    } catch (error) {
      console.error("Error fetching body parts:", error);
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
        response.data.permissions["mainWorkoutManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };
  const handleDeleteBodyPart = async (bodyPartId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`api/bodyparts/${bodyPartId}/?gym_id=${gymId}`);
      toast.success("Body part deleted successfully");
      invalidateAll();
      fetchBodyParts();
    } catch (error) {
      console.error("Error deleting body part:", error);
      toast.error("Something went wrong while deleting body part");
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingBodyPart(null);
  };

  const getColumns = useCallback(
    (column: keyof BodyPart) => [
      {
        title: (
          <HeaderCell title="S.No" className="text-sm font-semibold mx-auto" />
        ),
        dataIndex: "index",
        key: "index",
        width: 20,
        render: (index: number) => <Text className="pl-2">{index}</Text>,
      },
      //   {
      //     title: <HeaderCell title="Image" className="text-sm font-semibold" />,
      //     dataIndex: "image",
      //     key: "image",
      //     width: 100,
      //     render: (image: string) => (
      //       <Avatar src={image} name="Body Part" className="rounded-lg" />
      //     ),
      //   },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 150,
        render: (name: string, image: string) => (
          <AvatarCard src={image} name={name} />
        ),
      },
      {
        title: (
          <HeaderCell title="Description" className="text-sm font-semibold" />
        ),
        dataIndex: "description",
        key: "description",
        width: 300,
        render: (description: string) => (
          <Tooltip content={description} animation="zoomIn">
            <Text className="max-w-xs truncate">{description}</Text>
          </Tooltip>
        ),
      },

      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: BodyPart) => (
          <div className="flex items-center gap-4 justify-start ps-4">
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsEditOpen(true);
                setEditingBodyPart(row);
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
                handleDeleteBodyPart(id);
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
    fetchBodyParts();
  }, [filterStatus]);

  return (
    <>
      <WidgetCard
        className="relative dark:bg-inherit "
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="Body Parts"
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
            data={bodyParts}
            scroll={{ y: 500 }}
            //@ts-ignore
            columns={columns}
            className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 text-nowrap"
          />
        )}
      </WidgetCard>
      {isCreateModalOpen && (
        <Add
          setIsCreateModalOpen={setIsCreateModalOpen}
          fetchBodyParts={fetchBodyParts}
        />
      )}
      {isEditOpen && editingBodyPart && (
        <Edit
          setIsEditOpen={handleCloseEdit}
          fetchBodyParts={fetchBodyParts}
          bodyPart={editingBodyPart}
          setBodyPart={setEditingBodyPart}
        />
      )}
    </>
  );
};

export default BodyPartsSection;
