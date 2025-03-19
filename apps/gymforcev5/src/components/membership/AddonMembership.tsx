"use client";
import React, { useState, useEffect } from "react";
import { Button, Text, Input, Title, Loader, Drawer } from "rizzui";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import toast from "react-hot-toast";
import { PiArrowRightBold } from "react-icons/pi";
import { XIcon } from "lucide-react";
import { IoWarningOutline } from "react-icons/io5";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface FormData {
  addon_days: number | null;
  addon_fee: number | null;
}

const initialState: FormData = {
  addon_days: null,
  addon_fee: null,
};

export default function AddonMembership({
  membershipId,
  onUpdate,
  closeModal,
}: {
  membershipId: string;
  onUpdate: () => void;
  closeModal: () => void;
}) {
  const [data, setData] = useState<FormData>(initialState);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isValid, setIsValid] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [lock, setLock] = useState(false);
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);

  useEffect(() => {
    const getPre = async () => {
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
    };
    getPre();
  }, []);

  useEffect(() => {
    checkFormValidation(false);
  }, [data]);

  const checkFormValidation = (submit: boolean) => {
    const errors: { [key: string]: string } = {};

    if (!data.addon_days) {
      errors.addon_days = "Number of days is required";
    } else if (data.addon_days < 1) {
      errors.addon_days = "Days must be greater than 0";
    }

    if (data.addon_fee && data.addon_fee < 0) {
      errors.addon_fee = "Fee cannot be negative";
    }

    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0);

    if (submit && Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || null,
    }));
  };

  const submitData = async () => {
    if (!checkFormValidation(true)) return;

    try {
      setLock(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/addon-membership/${membershipId}/?gym_id=${gymId}`,
        {
          addon_days: data.addon_days,
          addon_fee: data.addon_fee,
        }
      );

      invalidateAll();
      onUpdate();
      toast.success("Membership extended successfully!");
      setData(initialState);
      setLock(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error extending membership:", error);
      toast.error(
        "Something went wrong while extending membership. Please try again."
      );
      setLock(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setData(initialState);
        setValidationErrors({});
        // onUpdate();
        closeModal();
      }}
      // size="lg"
      containerClassName="p-6 md:p-8 space-y-6 "
    >
      <div className="flex flex-row items-center justify-between">
        <Title as="h4" className="">
          Extend Membership
        </Title>
        <XIcon
          onClick={() => {
            setIsOpen(false);
            closeModal();
          }}
          className="hover:text-primary cursor-pointer hover:scale-105"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 ">
        <div className="space-y-4">
          <div className="w-full p-4 bg-primary-lighter dark:bg-gray-100 rounded-lg shadow">
            <div className="flex flex-row gap-2 items-center">
              <Text className="text-sm">Please Note</Text>
              <IoWarningOutline className="animate-pulse" size={16} />
            </div>
            <ul className="flex flex-col items-stretch gap-3 px-4 pt-2 list-disc text-xs font-medium">
              <li>
                {`You can add extra days to an active membership on member's
                demand.`}
              </li>
              <li>You may charge an additional fee for this service.</li>
              <li>This action is irreversible.</li>
            </ul>
          </div>
          <div className="grid  px-4 pt-2  gap-5">
            <div className="grid grid-cols-1 gap-0.5">
              <Input
                label="Number of Days *"
                name="addon_days"
                type="number"
                placeholder="Enter number of days"
                value={data.addon_days?.toString() || ""}
                onChange={handleInputChange}
                min={1}
                labelClassName=""
              />
              {validationErrors.addon_days && (
                <p className="text-xs text-red-500">
                  {validationErrors.addon_days}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-0.5">
              <Input
                label={`Extension Fee (${demographicInfo?.currency_symbol})`}
                name="addon_fee"
                type="number"
                placeholder="Enter extension fee"
                value={data.addon_fee?.toString() || ""}
                onChange={handleInputChange}
                min={0}
                labelClassName=""
                prefix={
                  <Text className="text-primary">
                    {demographicInfo?.currency_symbol || " "}
                  </Text>
                }
              />
              {validationErrors.addon_fee && (
                <p className="text-xs text-red-500">
                  {validationErrors.addon_fee}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          onClick={submitData}
          variant="solid"
          size="lg"
          className="hover:scale-105 transition-all duration-200 group hover:shadow-sm shadow-gray-800 font-medium"
          disabled={!isValid || lock}
        >
          {!lock ? (
            <span className="flex flex-nowrap gap-1 items-center justify-center">
              <span>Extend Membership</span>
              <PiArrowRightBold className="ml-2 transition-all group-hover:animate-pulse" />
            </span>
          ) : (
            <Loader variant="threeDot" />
          )}
        </Button>
      </div>
    </Drawer>
  );
}
