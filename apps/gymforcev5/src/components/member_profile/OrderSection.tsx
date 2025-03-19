"use client";

import Link from "next/link";
// import { PiPlusBold } from "react-icons/pi";
// import { routes } from "@/config/routes";
import { Avatar, Button, Loader, Popover, Text, Title } from "rizzui";
import { useEffect, useState, useMemo, useCallback } from "react";
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import { HeaderCell } from "@/components/table";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import Table from "@/components/rizzui/table/table";
import getDueBadge from "@/components/dueBadge";
import { FaListUl } from "react-icons/fa6";

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

export default function MemberOrders({ params }: { params: { id: string } }) {
  const newId = params.id.toString().split("-")[1];
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState([]);
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);
  const fetchDemographicInfo = async () => {
    try {
      const geoinfo = await getDemographicInfo();
      setDemographicInfo(geoinfo);
    } catch (error) {
      console.error("Error fetching demographic info:", error);
    }
  };

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `/api/member/${newId}/orders/?center=${gymId}&gym_id=${gymId}`,
          {
            id: `order-${newId}`,
          }
        );
        console.log(resp.data);
        setData(
          resp.data.map((item: any, index: number) => ({
            ...item,
            index: index,
          }))
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDemographicInfo();
    getOrders();
  }, [newId]);

  const ProductPopover = ({ products }: { products: OrderProduct[] }) => (
    <Popover>
      <Popover.Trigger>
        <Button variant="text" size="sm">
          <FaListUl className="size-5" />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <div className="p-4">
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
        width: 50,
        render: (index: number) => <Text>{index + 1}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "member_name",
        key: "member_name",
        width: 150,
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
        width: 100,
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
        width: 100,
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
        width: 100,
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
        width: 100,
        render: (due: string) => (
          <Text>
            {getDueBadge({
              dueAmount: parseInt(due),
              symbol: demographicInfo?.currency_symbol ?? " ",
            })}
          </Text>
        ),
      },
      //   {
      //     title: <HeaderCell title="Staff" className="text-sm font-semibold" />,
      //     dataIndex: "staff_name",
      //     key: "staff_name",
      //     render: (staff: string) => <Text>{staff}</Text>,
      //   },
      {
        title: (
          <HeaderCell title="Products" className="text-sm font-semibold" />
        ),
        dataIndex: "order_details",
        key: "order_details",
        width: 100,
        render: (products: OrderProduct[]) => (
          <ProductPopover products={products} />
        ),
      },
    ],
    [demographicInfo, data]
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  return (
    <WidgetCard
      title="Order List"
      titleClassName="whitespace-nowrap mb-4 text-gray-900 "
      //   action={
      //     <div className="mt-4 flex items-center gap-3">
      //       <Link
      //         href={routes.eCommerce.createOrder}
      //         className="w-full md:w-auto"
      //       >
      //         <Button as="span" className="w-full md:w-auto">
      //           <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
      //           Create Order
      //         </Button>
      //       </Link>
      //     </div>
      //   }
    >
      {loading ? (
        <div className="grid h-32 place-content-center">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <Table
          variant="minimal"
          data={data}
          columns={columns}
          scroll={{ y: 500, x: "max-content" }}
          className="text-sm text-nowrap mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100/80"
        />
      )}
    </WidgetCard>
  );
}
