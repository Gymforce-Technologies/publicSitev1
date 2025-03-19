"use client";

import { routes } from "@/config/routes";
import { Button, Loader, Modal, Text, Title, Avatar } from "rizzui";
import { useEffect, useState, useMemo, useCallback } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@core/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { PiPlusBold } from "react-icons/pi";
import { MdDelete, MdEdit } from "react-icons/md";
import { useModal } from "@/app/shared/modal-views/use-modal";
// import { CreateCategoryModalView } from "./category-page-header";
import AvatarCard from "@core/ui/avatar-card";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
// import { CreateCategoryModalView } from "@/components/inventory/category-page-header";
import toast from "react-hot-toast";
import { isStaff } from "@/app/[locale]/auth/Staff";
// import DeleteCategory from "./DeleteCategory";
import dynamic from "next/dynamic";
const DeleteCategory = dynamic(() => import("./DeleteCategory"));
const CreateCategoryModalView = dynamic(
  () =>
    import("@/components/inventory/category-page-header").then(
      (mod) => mod.CreateCategoryModalView
    ),
  { ssr: false }
);

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  is_default: boolean;
  center: number;
  created_at: string;
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const { openModal } = useModal();
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const getCategories = async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/categories/?center=${gymId}`,
        {
          id: `category-list`,
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const getColumns = useCallback(
    () => [
      {
        title: (
          <HeaderCell
            title="Category"
            className="text-sm font-semibold mx-auto"
          />
        ),
        dataIndex: "image",
        key: "image",
        render: (image: string, record: any) => (
          <AvatarCard
            name={record.name}
            description={record.description}
            src={image}
            className="rounded-lg"
            avatarProps={{ rounded: "md", name: record.name, size: "xl" }}
          />
        ),
      },
      {
        title: (
          <HeaderCell
            title="Description"
            className="text-sm font-semibold mx-auto"
          />
        ),
        dataIndex: "description",
        key: "description",
        render: (description: string) => <Text>{description}</Text>,
      },
      {
        title: (
          <HeaderCell
            title="Created At"
            className="text-sm font-semibold mx-auto"
          />
        ),
        dataIndex: "created_at",
        key: "created_at",
        render: (date: string) => (
          <Text>{formateDateValue(new Date(date))}</Text>
        ),
      },
      {
        dataIndex: "id",
        key: "id",
        render: (id: number, record: any) => (
          <div className="flex items-center gap-2">
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                openModal({
                  view: (
                    <CreateCategoryModalView
                      id={record?.id.toString()}
                      category={{
                        name: record.name,
                        description: record.description,
                        image: record.image,
                      }}
                      onUpdate={getCategories}
                    />
                  ),
                  size: "md",
                });
              }}
            >
              <MdEdit className="size-5" />
            </Button>
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setDeleteCategory(record);
              }}
            >
              <MdDelete className="size-5" />
            </Button>
          </div>
        ),
      },
    ],
    [categories, auth, access]
  );
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
  const columns = useMemo(() => getColumns(), [getColumns, categories]);

  const handleDelete = async (id: number) => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.delete(
        `/api/categories/${id}/delete?gym_id=${gymId}`
      );
      invalidateAll();
      setCategories(categories.filter((cat) => cat.id !== id));
      setDeleteCategory(null);
      await getCategories();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <WidgetCard
        title="Categories"
        action={
          <Button
            as="span"
            className="mt-4 w-full cursor-pointer @lg:mt-0 @lg:w-auto"
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              openModal({
                view: <CreateCategoryModalView />,
                size: "md",
              });
            }}
          >
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            Add Category
          </Button>
        }
      >
        {loading ? (
          <div className="grid h-32 place-content-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={categories}
            columns={columns}
            scroll={{ y: 500, x: "max-content" }}
            className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100/80 text-nowrap"
          />
        )}
      </WidgetCard>
      {deleteCategory !== null && (
        <DeleteCategory
          deleteCategory={deleteCategory}
          setDeleteCategory={setDeleteCategory}
          handleDelete={handleDelete}
        />
      )}
    </>
  );
}
