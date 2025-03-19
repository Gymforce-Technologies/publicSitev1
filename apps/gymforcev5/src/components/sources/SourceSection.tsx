"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Text,
  ActionIcon,
  Select,
  Button,
  Switch,
  Badge,
  Loader,
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
import Add from "@/components/sources/Add";
import Edit from "@/components/sources/Edit";
import { isStaff } from "@/app/[locale]/auth/Staff";

export interface Source {
  index?: number;
  id: number;
  is_favorite: boolean;
  leadSourceName: string;
  is_default: boolean;
  created_by?: number | null;
  gym?: number | null;
}

const SourceSection: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Source | null>(null);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchSources = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/visitor-sources/?gym_id=${gymId}`,
        { id: newID(`sources-${filterStatus}`) }
      );

      const mappedData =
        filterStatus === "favorites"
          ? response.data.filter((data: any) => data.is_favorite)
          : response.data;

      setSources(
        mappedData.map((data: any, index: number) => ({
          index: index + 1,
          ...data,
        }))
      );
    } catch (error) {
      console.error("Error fetching sources:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (sourceId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();

      await AxiosPrivate.delete(
        `/api/visitor-sources/${sourceId}/?gym_id=${gymId}`
      );
      invalidateAll();
      fetchSources();
      toast.success("Source deleted successfully");
    } catch (error) {
      console.error("Error deleting source:", error);
    }
  };

  const handleFavoriteSource = async (
    sourceId: number,
    status: boolean,
    name: string
  ): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/visitor-sources/${sourceId}/mark_favorite/?gym_id=${gymId}&is_favorite=${!status}`
      );
      invalidateAll();
      fetchSources();
      toast.success(`${name} source ${status ? "disabled" : "enabled"}`);
    } catch (error) {
      console.error("Error updating source:", error);
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
  const columns = useMemo(
    () => [
      {
        title: (
          <HeaderCell title="S.No" className="text-sm font-semibold mx-auto" />
        ),
        dataIndex: "index",
        key: "index",
        width: 100,
        render: (index: number) => (
          <Text className="pl-2 font-semibold">{index}</Text>
        ),
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "leadSourceName",
        key: "leadSourceName",
        width: 200,
        render: (name: string, row: Source) => (
          <div className="flex items-start gap-2">
            <Text>{name}</Text>
            {row.is_default && (
              <Badge size="sm" variant="outline">
                Default
              </Badge>
            )}
          </div>
        ),
      },
      {
        title: <HeaderCell title="Enabled" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: Source) => (
          <Switch
            checked={row.is_favorite}
            onChange={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              handleFavoriteSource(id, row.is_favorite, row.leadSourceName);
            }}
            size="sm"
            className={row.is_default ? "hidden" : ""}
          />
        ),
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 150,
        render: (id: number, row: Source) => (
          <div
            className={`flex items-center gap-4 justify-start ps-4 ${row.is_default ? "hidden" : ""}`}
          >
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsEditOpen(true);
                setEditingCategory(row);
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
                handleDeleteCategory(id);
              }}
              variant="text"
            >
              <MdDelete size={20} />
            </ActionIcon>
          </div>
        ),
      },
    ],
    [access, auth]
  );

  useEffect(() => {
    fetchSources();
  }, [filterStatus]);

  return (
    <WidgetCard
      title="Sources"
      action={
        <div className="hidden md:flex flex-row w-full justify-end items-end gap-4 ">
          <Select
            label="Filter"
            options={[
              { label: "All", value: "all" },
              { label: "Enabled", value: "favorites" },
            ]}
            onChange={(option: any) => setFilterStatus(option.value)}
            value={filterStatus[0].toUpperCase() + filterStatus.slice(1)}
            className="text-gray-700 md:min-w-40 capitalize"
          />
          <Button
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              setIsCreateModalOpen(true);
            }}
            className="hidden md:flex items-center gap-2"
          >
            Add <PlusIcon size={20} />
          </Button>
        </div>
      }
    >
      <div className="flex items-end w-full gap-2 md:hidden my-4">
        <Select
          label="Filter"
          options={[
            { label: "All", value: "all" },
            { label: "Enabled", value: "favorites" },
          ]}
          onChange={(option: any) => setFilterStatus(option.value)}
          value={filterStatus[0].toUpperCase() + filterStatus.slice(1)}
          className="text-gray-700 md:min-w-40 capitalize"
        />
        <Button
          onClick={() => {
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          Add <PlusIcon size={20} />
        </Button>
      </div>
      {loading ? (
        <div className="grid h-32 place-content-center">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <Table
          variant="minimal"
          data={sources}
          //@ts-ignore
          columns={columns}
          scroll={{ y: 500 }}
          striped
          className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap [&_.rc-table-row:hover]:bg-gray-100/75"
        />
      )}
      {isCreateModalOpen && (
        <Add
          setIsCreateModalOpen={setIsCreateModalOpen}
          fetchSources={fetchSources}
        />
      )}
      {isEditOpen && editingCategory && (
        <Edit
          setIsEditOpen={handleCloseEdit}
          fetchSources={fetchSources}
          source={editingCategory}
          setSource={setEditingCategory}
        />
      )}
    </WidgetCard>
  );
};

export default SourceSection;
