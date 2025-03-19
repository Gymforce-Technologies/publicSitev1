"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Text,
  ActionIcon,
  Select,
  Button,
  Switch,
  Badge,
  Tooltip,
  Loader,
} from "rizzui";
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
import Add from "@/components/enrollment/Add";
import Edit from "@/components/enrollment/Edit";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { isStaff } from "@/app/[locale]/auth/Staff";
export interface EnrollmentFee {
  index?: number;
  name: string;
  amount: number;
  id: number;
  is_default?: boolean;
  is_favorite?: boolean;
}

const EnrollmentFees: React.FC = () => {
  const [enrollmentFees, setEnrollmentFees] = useState<EnrollmentFee[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [column, setColumn] = useState<keyof EnrollmentFee>("id");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingEnrollmentFee, setEditingEnrollmentFee] =
    useState<EnrollmentFee | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchEnrollmentFees = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/enrollment-fees/?gym_id=${gymId}`,
        {
          id: newID(`enrollment-fees-${filterStatus}`),
        }
      );
      console.log(response);
      if (filterStatus === "favorites") {
        setEnrollmentFees(
          response.data.filter((data: any, index: number) => {
            if (data.is_favorite) {
              return {
                index: index + 1,
                ...data,
              };
            }
          })
        );
      } else {
        setEnrollmentFees(
          response.data.map((data: any, index: number) => {
            return {
              index: index + 1,
              ...data,
            };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching enrollment fees:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchDemograpicInfo = async () => {
      try {
        const geoinfo = await getDemographicInfo();
        setDemographicInfo(geoinfo);
        console.log("info", geoinfo);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDemograpicInfo();
  }, []);
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
  const handleDeleteEnrollmentFee = async (feeId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(
        `/api/enrollment-fees/${feeId}/?gym_id=${gymId}`
      );
      invalidateAll();
      fetchEnrollmentFees();
      toast.success("Deleted Successfully");
    } catch (error) {
      console.error("Error deleting enrollment fee:", error);
    }
  };

  const handleFavoriteEnrollmentFee = async (
    feeId: number,
    status: boolean,
    name: string
  ): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/enrollment-fees/${feeId}/mark_favorite/?gym_id=${gymId}&is_favorite=${!status}`
      );
      invalidateAll();
      fetchEnrollmentFees();
      if (status) {
        toast.error(name + " Enrollment Fee was Disabled");
      } else {
        toast.success(name + " Enrollment Fee was Enabled");
      }
    } catch (error) {
      console.error("Error marking enrollment fee as favorite:", error);
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingEnrollmentFee(null);
  };

  const getColumns = useCallback(
    (column: keyof EnrollmentFee) => [
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
        render: (name: string, row: EnrollmentFee) => (
          <div className="flex items-start gap-2">
            <Text className="text-sm font-medium text-clip  ">{name}</Text>
            <Badge
              size="sm"
              variant="outline"
              className={"scale-90 " + (row.is_default ? "" : "hidden")}
            >
              Default
            </Badge>
          </div>
        ),
      },
      {
        title: <HeaderCell title="Amount" className="text-sm font-semibold" />,
        dataIndex: "amount",
        key: "amount",
        width: 200,
        render: (amount: number) => (
          <Text className="">
            {demographiInfo?.currency_symbol}
            {new Intl.NumberFormat().format(amount)}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="Enabled" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: EnrollmentFee) => (
          <Tooltip content="Status" placement="right-start">
            <div>
              <Switch
                checked={row?.is_favorite}
                onChange={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleFavoriteEnrollmentFee(
                    id,
                    row?.is_favorite || false,
                    row.name
                  );
                }}
                size="sm"
                className={`ps-2 ${row?.is_default ? "hidden" : ""}`}
              />
            </div>
          </Tooltip>
        ),
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 150,
        render: (id: number, row: EnrollmentFee) => (
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
                setEditingEnrollmentFee(row);
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
                handleDeleteEnrollmentFee(id);
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

  const columns = useMemo(
    () => getColumns(column),
    [column, getColumns, demographiInfo]
  );
  const handleFilterChange = useCallback((value: string) => {
    setFilterStatus(value);
  }, []);

  useEffect(() => {
    const getData = async () => {
      await fetchEnrollmentFees();
    };
    getData();
  }, [filterStatus]);

  return (
    <>
      <WidgetCard
        className="relative dark:bg-inherit "
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="Enrollment Fees"
        titleClassName="whitespace-nowrap "
        action={
          <div className="hidden md:flex flex-row w-full justify-end items-end gap-4 ">
            <Select
              label="Filter"
              options={[
                { label: "All", value: "all" },
                { label: "Enabled", value: "favorites" },
              ]}
              onChange={(option: any) => {
                handleFilterChange(option.value);
              }}
              value={filterStatus === "favorites" ? "Enabled" : "All"}
              // labelClassName="text-gray-900 "
              className="text-gray-700 max-w-xs"
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
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
        <div className="flex flex-row items-end w-full gap-2 md:hidden my-4">
          <Select
            label="Filter"
            options={[
              { label: "All", value: "all" },
              { label: "Enabled", value: "favorites" },
            ]}
            onChange={(option: any) => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              handleFilterChange(option.value);
            }}
            value={filterStatus === "favorites" ? "Enabled" : "All"}
            // labelClassName="text-gray-900 "
            className="text-gray-700 "
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          />
          <Button
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 max-sm:scale-90"
          >
            Add <PlusIcon size={20} />
          </Button>
        </div>
        {loading ? (
          <div className="grid h-32 flex-grow place-content-center items-center">
            <Loader size="xl" variant="spinner" />:
          </div>
        ) : (
          <Table
            variant="minimal"
            data={enrollmentFees}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500 }}
            striped
            className="text-sm mt-4 text-nowrap md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 "
            // rowClassName="!dark:bg-inherit "
          />
        )}
      </WidgetCard>
      {isCreateModalOpen && (
        <Add
          setIsCreateModalOpen={setIsCreateModalOpen}
          fetchEnrollmentFees={fetchEnrollmentFees}
        />
      )}
      {isEditOpen && editingEnrollmentFee && (
        <Edit
          setIsEditOpen={handleCloseEdit}
          fetchEnrollmentFees={fetchEnrollmentFees}
          enrollmentFee={editingEnrollmentFee}
          setEnrollmentFee={setEditingEnrollmentFee}
        />
      )}
    </>
  );
};

export default EnrollmentFees;
