"use client";
import { PiPlusBold } from "react-icons/pi";
import { routes } from "@/config/routes";
import { Avatar, Button, Loader, Modal, Text, Title } from "rizzui";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import AvatarCard from "@core/ui/avatar-card";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { isStaff } from "@/app/[locale]/auth/Staff";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface Product {
  id: number;
  image: string;
  title: string;
  description: string;
  product_type: string;
  sku: string;
  price: string;
  cost_price: string;
  sell_price: string;
  is_track: boolean;
  current_stock_level: number;
  low_stock_level: number;
  brand_name: string;
  product_ean: string;
  created_at: string;
  manufacturer: string;
  categories: number;
  center: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteProd, setDeleteProd] = useState<number | null>(null);
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);
  const router = useRouter();
  const getProducts = async () => {
    setLoading(true);
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/products/?center=${gymId}`,
        {
          id: `product-list`,
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDemographicInfo = useCallback(async () => {
    try {
      const geoinfo = await getDemographicInfo();
      setDemographicInfo(geoinfo);
    } catch (error) {
      console.error("Error fetching demographic info:", error);
    }
  }, []);

  useEffect(() => {
    getProducts();
    fetchDemographicInfo();
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

  const getColumns = useCallback(
    () => [
      {
        // title: "Product",
        title: (
          <HeaderCell
            title="Product"
            className="text-sm font-semibold mx-auto"
          />
        ),
        dataIndex: "image",
        key: "image",
        render: (image: string, record: any) => (
          // <img
          //   src={image}
          //   alt="Product Image"
          //   className="h-16 w-16 object-cover"
          // />
          <AvatarCard
            name={record.title}
            description={record.product_type}
            src={image}
            className="rounded-lg"
            avatarProps={{ rounded: "md", name: record.title, size: "xl" }}
          />
        ),
      },
      // {
      //   title: "Title",
      //   dataIndex: "title",
      //   key: "title",
      //   render: (title: string) => <Text>{title}</Text>,
      // },
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
          <HeaderCell title="SKU" className="text-sm font-semibold mx-auto" />
        ),
        dataIndex: "sku",
        key: "sku",
        render: (sku: string) => <Text>{sku}</Text>,
      },
      {
        title: (
          <HeaderCell
            title="Cost Price"
            className="text-sm font-semibold mx-auto"
          />
        ),
        dataIndex: "cost_price",
        key: "cost_price",
        render: (cost_price: string) => (
          <Text>
            {demographicInfo?.currency_symbol + " "}
            {cost_price}
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell
            title="Sell Price"
            className="text-sm font-semibold mx-auto"
          />
        ),
        dataIndex: "sell_price",
        key: "sell_price",
        render: (sell_price: string) => (
          <Text>
            {demographicInfo?.currency_symbol + " "}
            {sell_price}
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell
            title="Stock Level"
            className="text-sm font-semibold mx-auto"
          />
        ),
        dataIndex: "current_stock_level",
        key: "current_stock_level",
        render: (stock: number) => <Text>{stock}</Text>,
      },
      {
        dataIndex: "id",
        key: "id",
        render: (id: any, record: any) => (
          <div className="flex items-center gap-2">
            <Button
              variant="text"
              size="sm"
              // href={}
              onClick={(e) => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                router.push(routes.eCommerce.ediProduct(record?.id));
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
                console.log("Delete Product", record.id);
                setDeleteProd(record.id);
              }}
            >
              <MdDelete className="size-5" />
            </Button>
          </div>
        ),
      },
    ],
    [products, demographicInfo, auth, access]
  );

  const columns = useMemo(() => getColumns(), [getColumns, products]);

  const handleDelete = async (id: number) => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.delete(
        `/api/products/${id}/delete?gym_id=${gymId}`
      );
      invalidateAll();
      console.log(resp.data);
      setProducts(products.filter((prod) => prod.id !== id));
      setDeleteProd(null);
      await getProducts();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <WidgetCard
        title="Product List"
        action={
          <div className="mt-4 flex items-center gap-3">
            <Button
              as="span"
              className="w-full md:w-auto cursor-pointer"
              onClick={(e) => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                router.push(routes.eCommerce.createProduct);
              }}
            >
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Add Product
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="grid h-32 place-content-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={products}
            columns={columns}
            scroll={{ y: 500, x: "max-content" }}
            className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100/80 text-nowrap"
          />
        )}
      </WidgetCard>
      <Modal
        isOpen={deleteProd !== null}
        onClose={() => {
          setDeleteProd(null);
        }}
        containerClassName="p-4 md:p-6 lg:p-8"
      >
        <div className="flex items-center gap-4">
          <Avatar
            src={products.find((prod) => prod.id === deleteProd)?.image}
            name="Product Image"
            size="xl"
            className="rounded-lg"
          />
          <div>
            <Title as="h3" className="font-semibold">
              {products.find((prod) => prod.id === deleteProd)?.title}
            </Title>
            <Text as="p" className="text-gray-500">
              {products.find((prod) => prod.id === deleteProd)?.description}
            </Text>
          </div>
        </div>
        <Text as="p" className="mt-4 text-gray-500">
          Are you sure you want to delete this product?
        </Text>
        <div className="flex items-center justify-end gap-4 md:gap-8 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteProd(null);
            }}
            className="scale-95"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(deleteProd!);
            }}
            color="danger"
            className="scale-95"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
