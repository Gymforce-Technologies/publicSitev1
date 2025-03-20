import { Title, Text, Avatar, Input, Button } from "rizzui";
import { PiMinusBold, PiPlusBold, PiTrashBold } from "react-icons/pi";
import { ActionIcon } from "rizzui";
import { useCallback, useEffect, useState } from "react";
// import {
//   DemographicInfo,
//   getDemographicInfo,
// } from "@/app/[locale]/auth/DemographicInfo";

interface Product {
  id: number;
  title: string;
  sell_price: number;
  image?: string;
  quantity?: number;
  description?: string;
}

interface CartProductProps {
  product: Product;
  onQuantityChange?: (id: number, quantity: number) => void;
  onRemove?: (id: number) => void;
}

export default function CartProduct({
  product,
  onQuantityChange,
  onRemove,
}: CartProductProps) {
  const [demographicInfo, setDemographicInfo] = useState<null>();
  // const fetchDemographicInfo = useCallback(async () => {
  //   try {
  //     const geoinfo = await getDemographicInfo();
  //     setDemographicInfo(geoinfo);
  //   } catch (error) {
  //     console.error("Error fetching demographic info:", error);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchDemographicInfo();
  // }, []);
  return (
    <div className="grid grid-cols-12 items-start gap-4 border-b border-muted py-6 first:pt-0 sm:flex sm:gap-6 2xl:py-8">
      <figure className="col-span-4 sm:max-w-[180px]">
        <Avatar
          src={product.image}
          name={product.title}
          size="xl"
          className="aspect-square rounded-lg bg-gray-100 object-cover h-36 w-36"
        />
      </figure>

      <div className="col-span-8 sm:block sm:w-full">
        <div className="flex flex-col-reverse gap-1 sm:flex-row sm:items-center sm:justify-between">
          <Title
            as="h3"
            className="truncate text-base font-medium transition-colors hover:text-primary 3xl:text-lg"
          >
            {product.title}
          </Title>
          <span className="inline-block text-sm font-semibold text-gray-1000 sm:font-medium md:text-base 3xl:text-lg">
            {" "}
            {product.sell_price}
          </span>
        </div>

        <Text className="mt-1 w-full max-w-xs truncate leading-6 2xl:max-w-lg">
          {product.description}
        </Text>
        <div className="flex items-center gap-4">
          <Text className="text-gray-500">Quantity:</Text>
          <div className="inline-flex items-center rounded-lg border border-muted px-1.5 hover:border-gray-1000 scale-95">
            <ActionIcon
              title="Decrement"
              size="sm"
              variant="flat"
              className="h-auto px-1 py-[5px]"
              onClick={() =>
                onQuantityChange?.(product.id, (product?.quantity || 0) - 1)
              }
            >
              <PiMinusBold className="h-4 w-4" />
            </ActionIcon>
            <input
              type="number"
              className="h-full w-8 border-none text-center outline-none focus:ring-0 sm:w-12 dark:bg-gray-50"
              value={product.quantity}
              readOnly
            />
            <ActionIcon
              title="Increment"
              size="sm"
              variant="flat"
              className="h-auto px-1 py-1.5"
              onClick={() =>
                onQuantityChange?.(product.id, (product?.quantity || 0) + 1)
              }
            >
              <PiPlusBold className="h-3.5 w-3.5" />
            </ActionIcon>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between sm:mt-6">
          <div className=" flex items-center justify-between gap-4 text-base">
            <Text className="text-gray-500">Total:</Text>
            <Text className="font-semibold">
              {" "}
              {product.sell_price * (product.quantity || 1)}
            </Text>
          </div>
          <ActionIcon
            variant="text"
            rounded="full"
            className="hover:border-red-light h-auto w-auto border border-muted p-2"
            onClick={() => onRemove?.(product.id)}
          >
            <PiTrashBold className="text-red-light h-4 w-4" />
          </ActionIcon>
        </div>
      </div>
    </div>
  );
}
