"use client";
import { Controller } from "react-hook-form";
import { DatePicker } from "@core/ui/datepicker";
import PencilIcon from "@core/components/icons/pencil";
import { Text, Title, Select, ActionIcon, Button, Avatar, Input } from "rizzui";
import cn from "@core/utils/class-names";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";

interface CustomerInfoProps {
  className?: string;
  currentMember?: any;
  setShowMembers?: Dispatch<SetStateAction<boolean>>;
  orderDetails: any;
  setOrderDetails: (details: any) => void;
  totalPrice: number;
  onSubmit: () => void;
}
const convertToDateFnsFormat = (format: string) => {
  return format
    .replace("DD", "dd")
    .replace("MMM", "MMM")
    .replace("MM", "MM")
    .replace("YYYY", "yyyy");
};

export default function CustomerInfo({
  className,
  currentMember,
  setShowMembers,
  orderDetails,
  setOrderDetails,
  totalPrice,
  onSubmit,
}: CustomerInfoProps) {
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
    <div
      className={cn(
        "@container @5xl:col-span-4 @5xl:py-0 @6xl:col-span-3",
        className
      )}
    >
      <div className="rounded-xl border border-gray-300 p-5 @sm:p-6 @md:p-7">
        <div className="relative border-b border-gray-300 pb-7">
          <Title as="h6" className="mb-6">
            Customer Info
          </Title>
          <ActionIcon
            className="absolute -top-1.5 end-0 z-10 text-gray-600 dark:text-gray-800"
            rounded="full"
            variant="flat"
            size="sm"
            onClick={() => setShowMembers && setShowMembers(true)}
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </ActionIcon>
          {currentMember ? (
            <div className="flex">
              <Avatar
                src={currentMember.image}
                name={currentMember.name}
                size="xl"
                className="aspect-square rounded-lg bg-gray-100 object-cover h-36 w-36"
              />
              <div className="ps-4 @5xl:ps-6">
                <Title as="h6" className="mb-2.5 font-semibold">
                  {currentMember.name}
                </Title>
                <Text as="p" className="mb-2 break-all last:mb-0">
                  {currentMember.email || ""}
                </Text>
                <Text as="p" className="mb-2 last:mb-0">
                  {currentMember.phone || ""}
                </Text>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center my-4">
              <Button onClick={() => setShowMembers && setShowMembers(true)}>
                Choose Member
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-7">
          <div className="flex justify-between items-center text-[15px]">
            <Text>Total Price:</Text>
            <Text className="font-semibold">
              {demographicInfo?.currency_symbol + " "}
              {totalPrice.toFixed(2)}
            </Text>
          </div>

          <Input
            type="number"
            label="Discount"
            value={orderDetails.discount}
            onChange={(e) => {
              const discount = parseFloat(e.target.value);
              setOrderDetails({
                ...orderDetails,
                discount,
                dueAmount: totalPrice - discount - orderDetails.paidAmount,
              });
            }}
            prefix={demographicInfo?.currency_symbol}
          />

          <Input
            type="number"
            label="Paid Amount"
            value={orderDetails.paidAmount}
            onChange={(e) => {
              const paid = parseFloat(e.target.value);
              setOrderDetails({
                ...orderDetails,
                paidAmount: paid,
                dueAmount: totalPrice - orderDetails.discount - paid,
              });
            }}
            prefix={demographicInfo?.currency_symbol}
          />

          <div
            className={`flex justify-between items-center ${!orderDetails.dueAmount ? "hidden" : " "}`}
          >
            <Text>Due Amount:</Text>
            <Text className="font-semibold">
              {demographicInfo?.currency_symbol + " "}
              {orderDetails.dueAmount ? orderDetails.dueAmount : ""}
            </Text>
          </div>

          <DatePicker
            label="Due Date"
            selected={orderDetails.dueDate}
            onChange={(date) =>
              setOrderDetails({
                ...orderDetails,
                dueDate: date,
              })
            }
            minDate={new Date()}
            dateFormat={convertToDateFnsFormat(getDateFormat())}
            className={`${!orderDetails.dueAmount ? "hidden" : " "}`}
          />

          <Select
            label="Payment Mode"
            options={[
              { label: "Cash", value: 1 },
              { label: "Card", value: 2 },
              { label: "UPI", value: 3 },
            ]}
            value={orderDetails.paymentMode}
            onChange={(value) =>
              setOrderDetails({
                ...orderDetails,
                paymentMode: value,
              })
            }
          />

          <Button
            className="w-full"
            onClick={onSubmit}
            disabled={!currentMember || totalPrice <= 0}
          >
            Create Order
          </Button>
        </div>
      </div>
    </div>
  );
}
