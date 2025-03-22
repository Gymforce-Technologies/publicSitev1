"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SubmitHandler } from "react-hook-form";
import { Form } from "@core/ui/form";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
// import { recentlyProducts, recommendationProducts } from "@/data/shop-products";
import CartProduct from "@/app/shared/ecommerce/cart/cart-product";
// import { useCart } from "@/store/quick-cart/cart.context";
import usePrice from "@core/hooks/use-price";
import { Empty, EmptyProductBoxIcon, Title, Text, Input, Button } from "rizzui";
import ProductCarousel from "@/app/shared/product-carousel";

type FormValues = {
  couponCode: string;
};

function CheckCoupon() {
  const [reset, setReset] = useState({});

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
    setReset({ couponCode: "" });
  };

  return (
    <Form<FormValues>
      resetValues={reset}
      onSubmit={onSubmit}
      useFormProps={{
        defaultValues: { couponCode: "" },
      }}
      className="w-full"
    >
      {({ register, formState: { errors }, watch }) => (
        <>
          <div className="relative flex items-end">
            <Input
              type="text"
              placeholder="Enter coupon code"
              inputClassName="text-sm"
              className="w-full"
              label={<Text>Do you have a promo code?</Text>}
              {...register("couponCode")}
              error={errors.couponCode?.message}
            />
            <Button
              type="submit"
              className="ms-3"
              disabled={watch("couponCode") ? false : true}
            >
              Apply
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}

// remove item

// cart product card

// total cart balance calculation

export default function CartPageWrapper() {
  return <div>Cart</div>;
}
