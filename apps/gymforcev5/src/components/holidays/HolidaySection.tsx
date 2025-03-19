"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader, Text, ActionIcon, Select, Button } from "rizzui";
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
import AddHoliday from "@/components/holidays/Add";
import EditHoliday from "@/components/holidays/Edit";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { isStaff } from "@/app/[locale]/auth/Staff";

// Define interfaces for both holiday types
interface RegularHoliday {
  index?: number;
  id: number;
  day_of_week: string;
}

interface OccasionalHoliday {
  index?: number;
  id: number;
  start_date: string;
  end_date: string;
  description: string;
}

type Holiday = RegularHoliday | OccasionalHoliday;

const HolidaysSection: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [holidayType, setHolidayType] = useState<"regular" | "occasional">(
    "regular"
  );
  const [filterStatus, setFilterStatus] = useState("regular");
  // const [staffType, setStaffType] = useState<string>("");
  // const [isStaff, setIsStaff] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchHolidays = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();

      // Fetch based on holiday type
      const endpoint =
        filterStatus === "regular"
          ? `/api/gym-regular-holidays/?gym_id=${gymId}`
          : `/api/gym-occasional-holidays/?gym_id=${gymId}`;

      const response = await AxiosPrivate.get(endpoint, {
        id: newID(`holidays-${filterStatus}`),
      });

      setHolidays(
        response.data.map((data: any, index: number) => ({
          index: index + 1,
          ...data,
        }))
      );
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (holidayId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      const endpoint =
        filterStatus === "regular"
          ? `/api/gym-regular-holidays/${holidayId}/?gym_id=${gymId}`
          : `/api/gym-occasional-holidays/${holidayId}/?gym_id=${gymId}`;

      await AxiosPrivate.delete(endpoint);
      invalidateAll();
      await fetchHolidays();
      toast.success("Deleted Successfully");
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const getColumns = useCallback(
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
      ...(filterStatus === "regular"
        ? [
            {
              title: (
                <HeaderCell
                  title="Day of Week"
                  className="text-sm font-semibold"
                />
              ),
              dataIndex: "day_of_week",
              key: "day_of_week",
              width: 200,
              render: (day: string) => <Text>{day}</Text>,
            },
          ]
        : [
            {
              title: (
                <HeaderCell
                  title="Start Date"
                  className="text-sm font-semibold"
                />
              ),
              dataIndex: "start_date",
              key: "start_date",
              width: 200,
              render: (date: string) => (
                <DateCell
                  date={new Date(date)}
                  timeClassName="hidden"
                  dateFormat={getDateFormat()}
                />
              ),
            },
            {
              title: (
                <HeaderCell
                  title="End Date"
                  className="text-sm font-semibold"
                />
              ),
              dataIndex: "end_date",
              key: "end_date",
              width: 200,
              render: (date: string) => (
                <DateCell
                  date={new Date(date)}
                  timeClassName="hidden"
                  dateFormat={getDateFormat()}
                />
              ),
            },
            {
              title: (
                <HeaderCell
                  title="Description"
                  className="text-sm font-semibold"
                />
              ),
              dataIndex: "description",
              key: "description",
              width: 300,
              render: (description: string) => <Text>{description}</Text>,
            },
          ]),
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 150,
        render: (id: number, row: Holiday) => (
          <div className="flex items-center gap-4 justify-start ps-4">
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsEditOpen(true);
                setEditingHoliday(row);
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
                handleDeleteHoliday(id);
              }}
              variant="text"
            >
              <MdDelete size={20} />
            </ActionIcon>
          </div>
        ),
      },
    ],
    [filterStatus, access, auth]
  );

  const columns = useMemo(() => getColumns(), [filterStatus, access, auth]);

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
    fetchHolidays();
  }, [filterStatus]);

  return (
    <>
      <WidgetCard
        className="relative"
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="Holidays"
        titleClassName="whitespace-nowrap"
        action={
          <div className="hidden md:flex flex-row w-full justify-end items-end gap-4">
            <Select
              label="Holiday Type"
              options={[
                { label: "Regular Holidays", value: "regular" },
                { label: "Occasional Holidays", value: "occasional" },
              ]}
              onChange={(option: any) => {
                setFilterStatus(option.value);
              }}
              value={
                filterStatus === "regular"
                  ? "Regular Holidays"
                  : "Occasional Holidays"
              }
              className="text-gray-700 max-w-xs"
            />
            <Button
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsCreateModalOpen(true);
                setHolidayType(filterStatus as "regular" | "occasional");
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
            label="Holiday Type"
            options={[
              { label: "Regular Holidays", value: "regular" },
              { label: "Occasional Holidays", value: "occasional" },
            ]}
            onChange={(option: any) => {
              setFilterStatus(option.value);
            }}
            value={
              filterStatus === "regular"
                ? "Regular Holidays"
                : "Occasional Holidays"
            }
            className="text-gray-700"
          />
          <Button
            onClick={() => {
              setIsCreateModalOpen(true);
              setHolidayType(filterStatus as "regular" | "occasional");
            }}
            className="flex items-center gap-2 max-sm:scale-90"
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
            data={holidays}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500 }}
            striped={true}
            className="text-sm mt-4 md:mt-6 rounded-sm text-nowrap"
          />
        )}
      </WidgetCard>
      {isCreateModalOpen && (
        <AddHoliday
          setIsCreateModalOpen={setIsCreateModalOpen}
          fetchHolidays={fetchHolidays}
          // holidayType={holidayType}
        />
      )}
      {isEditOpen && editingHoliday && (
        <EditHoliday
          setIsEditOpen={() => {
            setIsEditOpen(false);
            setEditingHoliday(null);
          }}
          fetchHolidays={fetchHolidays}
          holiday={editingHoliday}
          setHoliday={setEditingHoliday}
          holidayType={filterStatus as "regular" | "occasional"}
        />
      )}
    </>
  );
};

export default HolidaysSection;
