"use client";

import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { PiCheckCircleFill, PiQuestionFill } from "react-icons/pi";
// import { shippingMethodData, shippingSpeedData } from '@/data/checkout-data';
import { AdvancedRadio, FieldError, Title, Text } from "rizzui";
import cn from "@core/utils/class-names";

export default function ShippingMethod({ className }: { className?: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const shippingMethod = useWatch({
    control,
    name: "shippingMethod",
  });

  return (
    <>
      <div className={cn(className)}>
        <Title as="h4" className="mb-3.5 font-semibold @2xl:mb-5">
          Shipping Method
        </Title>
        <div className="rounded-lg border border-muted">
          <div className="p-4 @xs:p-6 @2xl:flex @2xl:items-start @2xl:justify-between @2xl:gap-6">
            <div className="block @5xl:pe-8">
              <Title as="h4" className="mb-2.5 text-base font-medium">
                Standard Shipping
              </Title>
              <Text as="p">
                Estimated delivery in 3-5 business days after order is shipped.
              </Text>
            </div>
          </div>

          {shippingMethod && (
            <div className="w-full flex-grow border-t border-muted p-4 @xs:p-6">
              <Text className="flex items-center gap-1">
                Select your shipping speed
                <PiQuestionFill className="w-4" />
              </Text>
            </div>
          )}
        </div>
      </div>

      {errors?.shippingMethod && (
        <FieldError error={errors?.shippingMethod.message as string} />
      )}
    </>
  );
}
