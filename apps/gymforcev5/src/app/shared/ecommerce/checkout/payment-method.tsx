"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  Input,
  Title,
  Text,
  Checkbox,
  Collapse,
  AdvancedRadio,
  RadioGroup,
  NumberInput,
  NumberInputProps,
} from "rizzui";
import cn from "@core/utils/class-names";
import { usePatternFormat } from "@core/hooks/use-pattern-format";
import {
  PiCaretDownBold,
  PiCheckCircleFill,
  PiLockKeyLight,
} from "react-icons/pi";
// import { paymentMethodData } from '@/data/checkout-data';

type CardExpiredType = NumberInputProps & {
  isMask?: boolean;
};

function CardExpired({ isMask = false, ...props }: CardExpiredType) {
  const { format } = usePatternFormat({
    ...props,
    format: "##/##",
  });
  const _format = (val: string) => {
    let month = val.substring(0, 2);
    const year = val.substring(2, 4);

    if (month.length === 1 && parseInt(month[0]) > 1) {
      month = `0${month[0]}`;
    } else if (month.length === 2) {
      if (Number(month) === 0) {
        month = "01";
      } else if (Number(month) > 12) {
        month = "12";
      }
    }
    return isMask && format ? format(`${month}${year}`) : `${month}/${year}`;
  };
  return <NumberInput {...props} format={_format} />;
}

export default function PaymentMethod({ className }: { className?: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const [collapseOpen, setCollapseOpen] = useState(true);

  const paymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });

  return (
    <div>
      <Title as="h4" className="mb-3.5 font-semibold @2xl:mb-5">
        Payment Method
      </Title>
      <div className="space-y-4 [&_label]:block">
        <Collapse
          className={cn(
            "rounded-lg border border-muted hover:border-primary",
            collapseOpen && "ring-1 ring-primary hover:!border-primary"
          )}
          defaultOpen={true}
          header={({ open, toggle }) => (
            <button
              type="button"
              onClick={() => {
                setCollapseOpen(open ? open : true);
                toggle();
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between p-4 text-start @xs:p-6"
              )}
            >
              <div className="pe-6">
                <Title as="h4" className="text-base font-medium @2xl:mb-2">
                  Credit Card
                </Title>
                <Text className="hidden leading-[1.85] @2xl:block">
                  Before placing an order with a large payment amount, We
                  recommend contacting the card issuing bank/institution to
                  avoid the bank flagging your payment or withholding the funds.
                </Text>
              </div>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <PiCaretDownBold
                  className={cn(
                    "h-3.5 w-3.5 transform transition-transform duration-300",
                    open && "rotate-180"
                  )}
                />
              </div>
            </button>
          )}
        >
          <div className="border-t border-muted p-4 @xs:p-6">
            <div className="space-y-4">
              <div className="flex justify-between font-semibold">
                Card
                <span className="flex items-center text-xs font-normal text-gray-500">
                  <PiLockKeyLight className="me-1 text-gray-500" />
                  Secure and Encrypted
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Controller
                  name="cardPayment.cardNumber"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <NumberInput
                      formatType="pattern"
                      format="#### #### #### ####"
                      value={value}
                      placeholder="414111 _ ___ ____"
                      onChange={onChange}
                      mask="_"
                      customInput={Input as React.ComponentType<unknown>}
                      {...{
                        variant: "outline",
                      }}
                    />
                  )}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Controller
                    name="cardPayment.expireMonth"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <CardExpired
                        isMask
                        formatType="custom"
                        placeholder="MM/YY"
                        mask={["M", "M", "Y", "Y"]}
                        value={value}
                        onChange={onChange}
                        customInput={Input as React.ComponentType<unknown>}
                        {...{ variant: "outline" }}
                      />
                    )}
                  />
                  <Controller
                    name="cardPayment.cardCVC"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        formatType="pattern"
                        format="###"
                        placeholder="CVC"
                        mask={["C", "V", "C"]}
                        value={value}
                        onChange={onChange}
                        customInput={Input as React.ComponentType<unknown>}
                        {...{ variant: "outline" }}
                      />
                    )}
                  />
                </div>
              </div>
              <Checkbox
                {...register("cardPayment.isSaveCard")}
                label="Save for future purchases"
                className="flex [&>label>span]:inline-block"
              />
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  );
}
