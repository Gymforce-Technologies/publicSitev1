"use client";

import Link from "next/link";
import { PiPlusBold } from "react-icons/pi";
import { routes } from "@/config/routes";
import { Avatar, Button, Loader, Modal, Popover, Text, Title } from "rizzui";
import { useEffect, useState, useMemo, useCallback } from "react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete } from "react-icons/md";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import getDueBadge from "@/components/dueBadge";
import { FaListUl } from "react-icons/fa6";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { isStaff } from "@/app/[locale]/auth/Staff";

interface OrderProduct {
  id: number;
  quantity: number;
  price_per_unit: string;
  product: {
    id: number;
    title: string;
    sku: string;
    image: string;
  };
}

interface Order {
  id: number;
  member_name: string;
  total_price: string;
  discount: string;
  paid_amount: string;
  due_amount: string;
  due_date: string;
  payment_mode_name: string;
  staff_name: string;
  invoice_number: string;
  created_at: string;
  order_details: OrderProduct[];
  member: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteOrder, setDeleteOrder] = useState<number | null>(null);
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);
  const router = useRouter();

  const fetchDemographicInfo = useCallback(async () => {
    try {
      const geoinfo = await getDemographicInfo();
      setDemographicInfo(geoinfo);
    } catch (error) {
      console.error("Error fetching demographic info:", error);
    }
  }, []);

  useEffect(() => {
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

  const getOrders = async () => {
    setLoading(true);
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(`/api/orders/?center=${gymId}`, {
        id: `orders-list`,
      });
      setOrders(
        response.data.map((item: any, index: number) => ({
          ...item,
          index: index,
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const ProductPopover = ({ products }: { products: OrderProduct[] }) => (
    <Popover>
      <Popover.Trigger>
        <Button variant="text" size="sm">
          <FaListUl className="size-5" />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <div className="p-2">
          <Title as="h5" className="mb-4">
            Products
          </Title>
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                <Avatar
                  src={product.product.image}
                  name={product.product.title}
                  // size="sm"
                  rounded="sm"
                />
                <div>
                  <Text>{product.product.title}</Text>
                  <Text className="text-gray-500">
                    {product.quantity} x{" "}
                    {demographicInfo?.currency_symbol + " "}
                    {product.price_per_unit}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );

  const getColumns = useCallback(
    () => [
      {
        title: <HeaderCell title="S.No" className="text-sm font-semibold" />,
        dataIndex: "index",
        key: "index",
        render: (index: number) => <Text>{index + 1}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "member_name",
        key: "member_name",
        render: (name: string, row: any) => (
          <Link href={`/member_profile/yk62-${row.member}-71he`}>
            <Text className="hover:text-primary">{name}</Text>
          </Link>
        ),
      },
      {
        title: (
          <HeaderCell title="Purchased" className="text-sm font-semibold" />
        ),
        dataIndex: "created_at",
        key: "created_at",
        render: (created_at: string) => (
          <Text className="font-medium">
            {formateDateValue(new Date(created_at))}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="Total" className="text-sm font-semibold" />,
        dataIndex: "total_price",
        key: "total_price",
        render: (total: string) => (
          <Text>
            {demographicInfo?.currency_symbol + " "}
            {total}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="Paid" className="text-sm font-semibold" />,
        dataIndex: "paid_amount",
        key: "paid_amount",
        render: (paid: string) => (
          <Text>
            {demographicInfo?.currency_symbol + " "}
            {paid}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="Due" className="text-sm font-semibold" />,
        dataIndex: "due_amount",
        key: "due_amount",
        render: (due: string) => (
          <Text>
            {getDueBadge({
              dueAmount: parseInt(due),
              symbol: demographicInfo?.currency_symbol ?? " ",
            })}
          </Text>
        ),
      },
      // {
      //   title: <HeaderCell title="Staff" className="text-sm font-semibold" />,
      //   dataIndex: "staff_name",
      //   key: "staff_name",
      //   render: (staff: string) => <Text>{staff}</Text>,
      // },
      {
        dataIndex: "id",
        key: "id",
        render: (id: any, record: Order) => (
          <div className="flex items-center gap-2">
            <ProductPopover products={record.order_details} />

            <Button
              variant="text"
              size="sm"
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                console.log("Delete Product", record.id);
                setDeleteOrder(record.id);
              }}
            >
              <MdDelete className="size-5" />
            </Button>
          </div>
        ),
      },
    ],
    [orders, demographicInfo, access, auth]
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  const handleDelete = async (id: number) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`/api/orders/${id}/delete/?gym_id=${gymId}`);
      setOrders(orders.filter((order) => order.id !== id));
      setDeleteOrder(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <WidgetCard
        title="Order List"
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
                router.push(routes.eCommerce.createOrder);
              }}
            >
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Create Order
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
            data={orders}
            scroll={{ y: 500, x: "max-content" }}
            //@ts-ignore
            columns={columns}
            className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100/80"
          />
        )}
      </WidgetCard>
      <Modal
        isOpen={deleteOrder !== null}
        onClose={() => setDeleteOrder(null)}
        containerClassName="p-4 md:p-6 lg:p-8"
      >
        <Title as="h3" className="mb-4">
          Confirm Order Deletion
        </Title>
        <Text as="p" className="mb-6">
          Are you sure you want to delete this order?
        </Text>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setDeleteOrder(null)}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => handleDelete(deleteOrder!)}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
