"use client";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "rizzui";

export default function ProductPricing() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <Input
        label="Cost Price"
        placeholder="10"
        {...register("cost_price")}
        error={errors.cost_price?.message as string}
        prefix={1}
        type="number"
      />
      <Input
        label="Sell Price"
        placeholder="15"
        {...register("sell_price")}
        error={errors.sell_price?.message as string}
        prefix={1}
        type="number"
      />
      {/* <Input
        label="Retail Price"
        placeholder="10"
        {...register('retailPrice')}
        error={errors.retailPrice?.message as string}
        prefix={'$'}
        type="number"
      />
      <Input
        label="Sale Price"
        placeholder="20"
        {...register('salePrice')}
        error={errors.salePrice?.message as string}
        prefix={'$'}
        type="number"
      /> */}
    </>
  );
}
