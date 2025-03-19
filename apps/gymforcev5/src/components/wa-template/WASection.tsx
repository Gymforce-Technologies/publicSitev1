"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Loader,
  Text,
  Tooltip,
  ActionIcon,
  Select,
  Button,
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
import Pagination from "@core/ui/pagination";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import { set } from "lodash";
import { isStaff } from "@/app/[locale]/auth/Staff";
// import Add from "@/components/wa-template/Add";
// import Edit from "@/components/wa-template/Edit";
const Add = dynamic(() => import("@/components/wa-template/Add"));
const Edit = dynamic(() => import("@/components/wa-template/Edit"));

interface Template {
  index: number;
  id: number;
  name: string;
  content: string;
  is_default: boolean;
  is_favorite: boolean;
}

const WASection: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [column, setColumn] = useState<keyof Template>("id");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [templateCount, setemplateCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchTemplates = async (pageNumber: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      let pageSize = pageSizeVal ?? parseInt(getPageSize());
      setPageSizeVal(pageSize);

      const response = await AxiosPrivate.get(
        `/api/wa-templates${filterStatus === "favorites" ? "/list_favorite" : ""}/?gym_id=${gymId}&page=${pageNumber}&page_size=${pageSize}`,
        {
          id: newID(`wa-templates-${filterStatus}-${pageNumber}-${pageSize}`),
        }
      );
      setCurrentPage(pageNumber);
      if (filterStatus === "favorites") {
        const transformedData = response.data.map(
          (item: any, index: number) => ({
            index: index + 1,
            id: item.id,
            name: item.name,
            content: item.content,
            is_default: item.is_default,
            is_favorite: item.is_favorite,
          })
        );
        setTemplates(transformedData);
      } else {
        const transformedData = response.data.results.map(
          (item: any, index: number) => ({
            index: index + 1,
            id: item.id,
            name: item.name,
            content: item.content,
            is_default: item.is_default,
            is_favorite: item.is_favorite,
          })
        );
        setTemplates(transformedData);
      }
      setemplateCount(response.data.count);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(currentPage);
  }, [pageSizeVal, currentPage]);

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
  const handleDeleteTemplate = async (templateId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(
        `/api/wa-templates/delete/${templateId}/?gym_id=${gymId}`
      );
      invalidateAll();
      fetchTemplates();
      toast.success("WhatsApp Template deleted successfully");
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleFavoriteTemplate = async (
    templateId: number,
    status: boolean,
    name: string
  ): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/wa-templates/${templateId}/mark_favorite/?gym_id=${gymId}&is_favorite=${!status}`,
        {
          gym_id: gymId?.toString(),
        }
      );
      invalidateAll();
      fetchTemplates();
      if (status) {
        toast.error(name + " was Disabled from WhatsApp Templates");
      } else {
        toast.success(name + " was Enabled for WhatsApp Templates");
      }
    } catch (error) {
      console.error("Error marking template as favorite:", error);
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingTemplate(null);
  };

  const getColumns = useCallback(
    (column: keyof Template) => [
      {
        title: (
          <HeaderCell title="S.No" className="text-sm font-semibold mx-auto" />
        ),
        dataIndex: "index",
        key: "index",
        width: 100,
        render: (index: number) => <Text className="pl-2">{index}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (name: string) => <Text className="">{name}</Text>,
      },
      {
        title: <HeaderCell title="Message" className="text-sm font-semibold" />,
        dataIndex: "content",
        key: "content",
        width: 300,
        render: (content: string) => (
          <Tooltip content={content} animation="zoomIn">
            <span>
              <Text className="text-gray-900 max-w-xl truncate">{content}</Text>
            </span>
          </Tooltip>
        ),
      },
      {
        title: <HeaderCell title="Enabled" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 50,
        render: (id: number, row: Template) => (
          <Tooltip content="Status" placement="right-start">
            <div className={row.is_default ? "hidden" : ""}>
              <Switch
                checked={row?.is_favorite}
                onChange={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleFavoriteTemplate(id, row?.is_favorite, row.name);
                }}
                size="sm"
                className="ps-2"
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
        render: (id: number, row: Template) => (
          <div className="flex items-center gap-4 justify-start ps-4">
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsEditOpen(true);
                setEditingTemplate(row);
              }}
              variant="text"
              className={row.is_default ? "hidden" : ""}
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
              className={row.is_default ? "hidden" : ""}
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
    const getData = async () => {
      await fetchTemplates();
    };
    getData();
  }, [filterStatus]);

  return (
    <>
      <WidgetCard
        className="relative dark:bg-inherit "
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="WhatsApp Templates"
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
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 "
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
            labelClassName="text-gray-900 "
            className="text-gray-700 "
            // // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 "
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
          <>
            <Table
              variant="minimal"
              data={templates}
              // @ts-ignore
              columns={columns}
              scroll={{ y: 500 }}
              striped
              className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100"
              // rowClassName="!dark:bg-inherit "
            />
            <div className="flex justify-between mt-4">
              <Select
                value={pageSizeVal}
                // size="sm"
                options={pageSizeOptions}
                placeholder="Items per page"
                className={"w-auto "}
                onChange={(option: any) => {
                  setPageSizeVal(option.value);
                  setPageSize(option.value);
                }}
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 "
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              ></Select>
              <Pagination
                total={templateCount}
                current={currentPage}
                pageSize={pageSizeVal ?? 0}
                onChange={(page) => {
                  setCurrentPage(page);
                  fetchTemplates(page);
                }}
              />
            </div>
          </>
        )}
      </WidgetCard>
      {isCreateModalOpen && (
        <Add
          setIsCreateModalOpen={setIsCreateModalOpen}
          fetchTemplates={fetchTemplates}
        />
      )}
      {isEditOpen && editingTemplate && (
        <Edit
          setIsEditOpen={handleCloseEdit}
          fetchTemplates={fetchTemplates}
          template={editingTemplate}
          setTemplate={setEditingTemplate}
        />
      )}
    </>
  );
};

export default WASection;
