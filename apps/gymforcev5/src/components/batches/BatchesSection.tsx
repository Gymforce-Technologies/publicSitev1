"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader, Text, Tooltip, ActionIcon, Select, Button } from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { PlusIcon } from "lucide-react";
// import Add from "@/components/batches/Add";
// import Edit from "@/components/batches/Edit";
const Edit = dynamic(() => import("@/components/batches/Edit"));
const Add = dynamic(() => import("@/components/batches/Add"));

import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { isStaff } from "@/app/[locale]/auth/Staff";
// import { formatDate } from "@core/utils/format-date";

export interface Batch {
  index?: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
  id: number;
  capacity: number;
  batch_type:
    | "Morning"
    | "Afternoon"
    | "Evening"
    | "Full Day"
    | "Full Night"
    | "Other";
  // is_default?: boolean;
  // is_favorite?: boolean;
}

const BatchesSection: React.FC = () => {
  const [templates, setTemplates] = useState<Batch[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [column, setColumn] = useState<keyof Batch>("id");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingBatches, setEditingBatches] = useState<Batch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const convertTo12HourFormat = (time: string) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
  };

  const fetchBatches = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(`/api/batches/?gym_id=${gymId}`, {
        id: newID(`batches-${filterStatus}`),
      });
      console.log("Current filter status:", filterStatus);
      console.log(response.data);
      if (filterStatus === "favorites") {
        setTemplates(
          response.data.results.filter((data: any, index: number) => {
            if (data.is_favorite) {
              return {
                index: index + 1,
                ...data,
              };
            }
          })
        );
      } else {
        setTemplates(
          response.data.results.map((data: any, index: number) => {
            return {
              index: index + 1,
              ...data,
            };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (batchId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`/api/batches/${batchId}/?gym_id=${gymId}`);
      invalidateAll();
      fetchBatches();
      toast.success("Deleted Successfully");
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingBatches(null);
  };

  const getColumns = useCallback(
    (column: keyof Batch) => [
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
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (name: string, row: Batch) => (
          <div className="flex items-start gap-2">
            <Text className="text-sm font-medium text-clip ">{name}</Text>
            {/* <Badge
              size="sm"
              variant="outline"
              className={"scale-90 " + (row.is_default ? "" : "hidden")}
            >
              Default
            </Badge> */}
          </div>
        ),
      },
      {
        title: (
          <HeaderCell title="Capacity" className="text-sm font-semibold" />
        ),
        dataIndex: "capacity",
        key: "capacity",
        width: 100,
        render: (capacity: string) => <Text>{capacity}</Text>,
      },
      {
        title: <HeaderCell title="Start" className="text-sm font-semibold" />,
        dataIndex: "start_time",
        key: "start_time",
        width: 150,
        render: (start_time: string) => (
          <Text className="text-gray-900  max-w-xl truncate">
            {start_time ? convertTo12HourFormat(start_time) : "N/A"}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="End" className="text-sm font-semibold" />,
        dataIndex: "end_time",
        key: "end_time",
        width: 150,
        render: (end_time: string) => (
          <Text className="text-gray-900 max-w-xl truncate">
            {end_time ? convertTo12HourFormat(end_time) : "N/A"}
          </Text>
        ),
      },
      // {
      //   title: <HeaderCell title="Enabled" className="text-sm font-semibold" />,
      //   dataIndex: "id",
      //   key: "id",
      //   width: 50,
      //   render: (id: number, row: Batch) => (
      //     <Tooltip content="Status" placement="right-start">
      //       <div>
      //         <Switch
      //           checked={row?.is_favorite}
      //           onChange={() =>
      //             handleFavoriteTemplate(
      //               id,
      //               row?.is_favorite || false,
      //               row.name
      //             )
      //           }
      //           size="sm"
      //           className={`ps-2 ${row?.is_default ? "hidden" : ""}`}
      //         />
      //       </div>
      //     </Tooltip>
      //   ),
      // },
      {
        title: (
          <HeaderCell title="Batch Type" className="text-sm font-semibold" />
        ),
        dataIndex: "batch_type",
        key: "batch_type",
        width: 120,
        render: (batch_type: string) => <Text>{batch_type}</Text>,
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 150,
        render: (id: number, row: Batch) => (
          <div className="flex items-center gap-4 justify-start ps-4">
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsEditOpen(true);
                setEditingBatches(row);
              }}
              variant="text"
              // className={row.is_default ? "hidden" : ""}
            >
              <MdEdit size={20} />
            </ActionIcon>
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                handleDeleteTemplate(id);
              }}
              variant="text"
              // className={row.is_default ? "hidden" : ""}
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
  useEffect(() => {
    const getData = async () => {
      await fetchBatches();
    };
    getData();
  }, [filterStatus]);

  return (
    <>
      <WidgetCard
        className="relative"
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="Batches"
        titleClassName="whitespace-nowrap "
        action={
          <div className="hidden md:flex flex-row w-full justify-end items-end gap-4 ">
            {/* <Select
              label="Filter"
              options={[
                { label: "All", value: "all" },
                { label: "Enabled", value: "favorites" },
              ]}
              onChange={(option: any) => {
                handleFilterChange(option.value);
              }}
              value={filterStatus === "favorites" ? "Enabled" : "All"}
              // labelClassName="text-gray-900 dark:text-gray-200"
              className="text-gray-700 max-w-xs"
              // dropdownClassName="dark:bg-gray-800"
              // optionClassName="dark:[&_div]:text-gray-400 dark:[&_div]:hover:text-gray-700"
              // labelClassName="dark:text-gray-200"
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            /> */}
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
        <div className="flex flex-col w-full gap-2 md:hidden my-2">
          {/* <Select
            label="Filter"
            options={[
              { label: "All", value: "all" },
              { label: "Enabled", value: "favorites" },
            ]}
            onChange={(option: any) => {
              handleFilterChange(option.value);
            }}
            value={filterStatus === "favorites" ? "Enabled" : "All"}
            // labelClassName="text-gray-900 dark:text-gray-200"
            className="text-gray-700 "
            // dropdownClassName="dark:bg-gray-800"
            // optionClassName="dark:[&_div]:text-gray-400 dark:[&_div]:hover:text-gray-700"
            // labelClassName="dark:text-gray-200"
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          /> */}
          <Button
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 self-end"
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
            data={templates}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500, x: "max-content" }}
            striped={true}
            className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap"
          />
        )}
      </WidgetCard>
      {isCreateModalOpen && (
        <Add
          setIsCreateModalOpen={setIsCreateModalOpen}
          fetchBatches={fetchBatches}
        />
      )}
      {isEditOpen && editingBatches && (
        <Edit
          setIsEditOpen={handleCloseEdit}
          fetchBatches={fetchBatches}
          batch={editingBatches}
          setBatch={setEditingBatches}
        />
      )}
    </>
  );
};

export default BatchesSection;
