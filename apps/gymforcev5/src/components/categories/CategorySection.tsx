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
} from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { PlusIcon } from "lucide-react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import Add from "@/components/categories/Add";
import Edit from "@/components/categories/Edit";

export interface Category {
  index?: number;
  id: number;
  is_favorite: boolean;
  name: string;
  is_default: boolean;
  created_by?: number | null;
  gym?: number | null;
}

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [column, setColumn] = useState<keyof Category>("id");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [staffType, setStaffType] = useState<string>("");
  const [isStaff, setIsStaff] = useState<boolean>(false);

  const fetchCategories = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/member-categories/?gym_id=${gymId}`,
        {
          id: newID(`categories-${filterStatus}`),
        }
      );
      console.log(response);
      if (filterStatus === "favorites") {
        setCategories(
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
        setCategories(
          response.data.map((data: any, index: number) => {
            return {
              index: index + 1,
              ...data,
            };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(
        `/api/member-categories/${categoryId}/?gym_id=${gymId}`
      );
      invalidateAll();
      fetchCategories();
      toast.success("Deleted Successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleFavoriteCategory = async (
    categoryId: number,
    status: boolean,
    name: string
  ): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/member-categories/${categoryId}/mark_favorite/?gym_id=${gymId}&is_favorite=${!status}`
      );
      invalidateAll();
      fetchCategories();
      if (status) {
        toast.error(name + " Category was Disabled");
      } else {
        toast.success(name + " Category was Enabled");
      }
    } catch (error) {
      console.error("Error enabling category:", error);
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingCategory(null);
  };

  useEffect(() => {
    const type = sessionStorage.getItem("staffType");
    setStaffType(type?.replace(/"/g, "").toLowerCase() || "");
    const isStaffVal = sessionStorage.getItem("isStaff");
    setIsStaff(isStaffVal === "true");
  }, []);

  const getColumns = useCallback(
    (column: keyof Category) => [
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
        render: (name: string, row: Category) => (
          <div className="flex items-start gap-2">
            <Text className="">{name}</Text>
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
        title: <HeaderCell title="Enabled" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: Category) => (
          <Switch
            checked={row.is_favorite}
            onChange={() =>
              handleFavoriteCategory(id, row.is_favorite, row.name)
            }
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
        render: (id: number, row: Category) => (
          <div
            className={`flex items-center gap-4 justify-start ps-4 ${row.is_default ? "hidden" : ""}`}
          >
            <ActionIcon
              onClick={() => {
                setIsEditOpen(true);
                setEditingCategory(row);
              }}
              variant="text"
            >
              <MdEdit size={20} />
            </ActionIcon>
            {!isStaff ||
            (isStaff &&
              staffType &&
              (staffType === "admin" || staffType === "manager")) ? (
              <ActionIcon
                onClick={() => handleDeleteCategory(id)}
                variant="text"
              >
                <MdDelete size={20} />
              </ActionIcon>
            ) : null}
          </div>
        ),
      },
    ],
    [column, staffType]
  );

  const columns = useMemo(() => getColumns(column), [column, getColumns]);
  const handleFilterChange = useCallback((value: string) => {
    setFilterStatus(value);
  }, []);

  useEffect(() => {
    const getData = async () => {
      await fetchCategories();
    };
    getData();
  }, [filterStatus]);

  return (
    <>
      <WidgetCard
        className="relative dark:bg-inherit "
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="Categories"
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
              className="text-gray-700  max-w-xs"
              // dropdownClassName="dark:bg-gray-800"
              // optionClassName="dark:[&_div]:text-gray-400 dark:[&_div]:hover:text-gray-700"
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 "
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
            <Button
              onClick={() => {
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
            onChange={(option: any) => {
              handleFilterChange(option.value);
            }}
            value={filterStatus === "favorites" ? "Enabled" : "All"}
            // labelClassName="text-gray-900 "
            className="text-gray-700 "
            // dropdownClassName="dark:bg-gray-800"
            // optionClassName="dark:[&_div]:text-gray-400 dark:[&_div]:hover:text-gray-700"
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 "
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
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
          <div className="grid h-32 flex-grow place-content-center items-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={categories}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500 }}
            striped={true}
            className="text-sm mt-4 md:mt-6 text-nowrap rounded-sm [&_.rc-table-row:hover]:bg-gray-100/75 "
            // rowClassName="!dark:bg-inherit "
          />
        )}
      </WidgetCard>
      {isCreateModalOpen && (
        <Add
          setIsCreateModalOpen={setIsCreateModalOpen}
          fetchCategories={fetchCategories}
        />
      )}
      {isEditOpen && editingCategory && (
        <Edit
          setIsEditOpen={handleCloseEdit}
          fetchCategories={fetchCategories}
          category={editingCategory}
          setCategory={setEditingCategory}
        />
      )}
    </>
  );
};

export default CategoriesSection;
