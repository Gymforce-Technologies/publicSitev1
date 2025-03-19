"use client";
import React, { useState, useEffect } from "react";
import { Button, Text, Input, Title, Loader, Drawer, Textarea } from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  // newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { PiArrowRightBold } from "react-icons/pi";
import { DatePicker } from "@core/ui/datepicker";
import { XIcon } from "lucide-react";
import { IoWarningOutline } from "react-icons/io5";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
// import { DemographicInfo, retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";

interface FormData {
  freeze_start_date: string | null;
  freeze_days: number | null;
  freeze_reason: string | null;
  freeze_fees: number | null;
}

const initialState: FormData = {
  freeze_start_date: null,
  freeze_days: null,
  freeze_reason: null,
  freeze_fees: null,
};

export default function FreezeMembership({
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
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [lock, setLock] = useState(false);

  const getPre = async () => {
    const infoData = await retrieveDemographicInfo();
    setDemographicInfo(infoData);
  };

  useEffect(() => {
    getPre();
  }, []);

  useEffect(() => {
    checkFormValidation(false);
  }, [data]);

  const checkFormValidation = (submit: boolean) => {
    const errors: { [key: string]: string } = {};

    if (!data.freeze_start_date)
      errors.freeze_start_date = "Start date is required";
    if (!data.freeze_days) errors.freeze_days = "Freeze days are required";
    if (!data.freeze_reason) errors.freeze_reason = "Reason is required";
    if (data.freeze_days && (data.freeze_days < 1 || data.freeze_days > 180)) {
      errors.freeze_days = "Freeze days must be between 1 and 180";
    }
    if (data.freeze_fees && data.freeze_fees < 0) {
      errors.freeze_fees = "Freeze fees cannot be negative";
    }

    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0);

    if (submit && Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return false;
    }

    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]:
        name === "freeze_days" || name === "freeze_fees"
          ? parseFloat(value) || null
          : value,
    }));
  };

  const submitData = async () => {
    if (!checkFormValidation(true)) return;

    try {
      setLock(true);
      const formData = {
        freeze_start_date: data.freeze_start_date,
        freeze_days: data.freeze_days,
        freeze_reason: data.freeze_reason,
        freeze_fees: data.freeze_fees,
      };
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/freeze-membership/${membershipId}/?gyms_id=${gymId}`,
        formData
      );

      invalidateAll();
      onUpdate();
      toast.success("Membership frozen successfully!");
      setData(initialState);
      setLock(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error freezing membership:", error);
      toast.error(
        "Something went wrong while freezing membership. Please try again."
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
      size="lg"
      containerClassName="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar"
    >
      {/* </div> */}
      <div className="flex flex-row items-center justify-between">
        <Title as="h3" className="">
          Freeze Membership
        </Title>
        <XIcon
          className="hover:text-primary cursor-pointer hover:scale-105"
          onClick={() => {
            setIsOpen(false);
            closeModal();
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 ">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 items-start px-4 py-4 gap-5">
            <div className="w-full p-4 bg-primary-lighter dark:bg-gray-100 rounded-lg shadow col-span-full">
              <div className="flex flex-row gap-2 items-center">
                <Text className="text-sm">Please Note</Text>
                <IoWarningOutline className="animate-pulse" size={16} />
              </div>
              <ul className="flex flex-col items-stretch gap-3 px-4 pt-2 list-disc text-xs font-medium">
                <li>
                  Freezing a membership will pause the current plan for a set
                  number of days.
                </li>
                <li>The plan will resume when the freeze period ends.</li>
                <li>
                  You can charge a fee for this service, and you can unfreeze
                  the membership at any time.
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <Text className="font-medium ">Start Date *</Text>
              <DatePicker
                name="freeze_start_date"
                // value={data.freeze_start_date || ""}
                // onChange={(date: any) => {
                //   setData((prev) => ({
                //     ...prev,
                //     freeze_start_date: new Date(date.getTime() + 86400000)
                //       .toISOString()
                //       .split("T")[0],
                //   }));
                //   setValidationErrors((prev) => ({
                //     ...prev,
                //     freeze_start_date: "",
                //   }));
                // }}
                value={
                  data.freeze_start_date
                    ? formateDateValue(new Date(data.freeze_start_date))
                    : ""
                }
                onChange={(date: any) => {
                  setData((prev) => ({
                    ...prev,
                    freeze_start_date: formateDateValue(
                      new Date(date.getTime()),
                      "YYYY-MM-DD"
                    ),
                  }));
                  setValidationErrors((prev) => ({
                    ...prev,
                    freeze_start_date: "",
                  }));
                }}
                placeholderText="Select Start Date"
                dateFormat="yyyy-MM-dd"
                className="col-span-full sm:col-span-1"
                minDate={new Date()}
              />
              {validationErrors.freeze_start_date && (
                <p className="text-xs text-red-500">
                  {validationErrors.freeze_start_date}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-0.5">
              <Input
                label="Freeze Days *"
                name="freeze_days"
                type="number"
                placeholder="Enter number of days (1-90)"
                value={data.freeze_days?.toString() || ""}
                onChange={handleInputChange}
                min={1}
                max={90}
                // labelClassName="dark:text-gray-200"
              />
              {validationErrors.freeze_days && (
                <p className="text-xs text-red-500">
                  {validationErrors.freeze_days}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-0.5">
              <Input
                label="Freeze Fees"
                name="freeze_fees"
                type="number"
                prefix={
                  <Text className="text-primary">
                    {demographicInfo?.currency_symbol || " "}
                  </Text>
                }
                placeholder="Enter freeze fees"
                value={data.freeze_fees?.toString() || ""}
                onChange={handleInputChange}
                // labelClassName="dark:text-gray-200"
              />
              {validationErrors.freeze_fees && (
                <p className="text-xs text-red-500">
                  {validationErrors.freeze_fees}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-0.5 col-span-full">
              <Textarea
                label="Freeze Reason *"
                name="freeze_reason"
                placeholder="Enter reason for freezing membership"
                value={data.freeze_reason || ""}
                onChange={handleInputChange}
                // labelClassName="dark:text-gray-200"
              />
              {validationErrors.freeze_reason && (
                <p className="text-xs text-red-500">
                  {validationErrors.freeze_reason}
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
              <span>Freeze Membership</span>
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
