"use client";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "rizzui";

export default function ProductPricing() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);

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

  return (
    <>
      <Input
        label="Cost Price"
        placeholder="10"
        {...register("cost_price")}
        error={errors.cost_price?.message as string}
        prefix={demographicInfo?.currency_symbol}
        type="number"
      />
      <Input
        label="Sell Price"
        placeholder="15"
        {...register("sell_price")}
        error={errors.sell_price?.message as string}
        prefix={demographicInfo?.currency_symbol}
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
