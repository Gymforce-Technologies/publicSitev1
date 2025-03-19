"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Text,
  Title,
  Loader,
  Drawer,
  Textarea,
  Modal,
  Stepper,
} from "rizzui";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { PiArrowRightBold } from "react-icons/pi";
import { XIcon } from "lucide-react";
import { IoWarningOutline } from "react-icons/io5";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface FormData {
  cancellation_reason: string | null;
}

const initialState: FormData = {
  cancellation_reason: null,
};

export default function CancelMembership({
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

  useEffect(() => {
    checkFormValidation(false);
  }, [data]);

  const checkFormValidation = (submit: boolean) => {
    const errors: { [key: string]: string } = {};

    if (!data.cancellation_reason) {
      errors.cancellation_reason = "Cancellation reason is required";
    }

    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0);

    if (submit && Object.keys(errors).length > 0) {
      toast.error("Please provide a cancellation reason.");
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitData = async () => {
    if (!checkFormValidation(true)) return;

    try {
      setLock(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/cancel-membership/${membershipId}/?gym_id=${gymId}`,
        {
          cancellation_reason: data.cancellation_reason,
        }
      );

      invalidateAll();
      onUpdate();
      toast.success("Membership cancelled successfully!");
      setData(initialState);
      setLock(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error cancelling membership:", error);
      toast.error(
        "Something went wrong while canceling membership. Please try again."
      );
      setLock(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setData(initialState);
        setValidationErrors({});
        closeModal();
      }}
      // size="lg"
      containerClassName="p-6 md:p-8 space-y-6 "
    >
      <div className="flex flex-row items-center justify-between">
        <Title as="h4" className="">
          Cancel Membership
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
        <div className="space-y-4">
          <div className="w-full p-4 bg-primary-lighter dark:bg-gray-100 rounded-lg shadow">
            <div className="flex flex-row gap-2 items-center">
              <Text className="text-sm">Please Note</Text>
              <IoWarningOutline className="animate-pulse" size={16} />
            </div>
            <ul className="flex flex-col items-stretch gap-2 px-4 pt-2 list-disc text-xs font-medium">
              <li>
                Cancelling a membership will delete the current plan. If the
                member has only one active membership, we will also delete their
                profile.
              </li>
              <li>
                If the member has multiple memberships, only the selected one
                will be canceled. Deleted members can be restored at any time.
              </li>
            </ul>
          </div>
          <div className="grid px-4 gap-5">
            <div className="grid grid-cols-1 gap-0.5">
              <Textarea
                label="Cancellation Reason *"
                name="cancellation_reason"
                placeholder="Enter reason for cancelling membership"
                value={data.cancellation_reason || ""}
                onChange={handleInputChange}
                labelClassName=""
              />
              {lock && validationErrors.cancellation_reason && (
                <p className="text-xs text-red-500">
                  {validationErrors.cancellation_reason}
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
              <span>Cancel Membership</span>
              <PiArrowRightBold className="ml-2 transition-all group-hover:animate-pulse" />
            </span>
          ) : (
            <Loader variant="threeDot" />
          )}
        </Button>
      </div>
    </Modal>
  );
}
