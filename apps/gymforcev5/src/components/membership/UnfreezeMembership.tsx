"use client";
import React, { useState } from "react";
import { Button, Title, Loader, Drawer, Modal, Text } from "rizzui";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { PiArrowRightBold } from "react-icons/pi";
import { XIcon } from "lucide-react";
import { IoWarningOutline } from "react-icons/io5";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

export default function UnfreezeMembership({
  membershipId,
  onUpdate,
  closeModal,
}: {
  membershipId: string;
  onUpdate: () => void;
  closeModal: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [lock, setLock] = useState(false);

  const submitData = async () => {
    try {
      setLock(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/unfreeze-membership/${membershipId}/?gym_id=${gymId}`
      );
      invalidateAll();
      onUpdate();
      toast.success("Membership unfrozen successfully!");
      setLock(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error unfreezing membership:", error);
      toast.error(
        "Something went wrong while unfreezing membership. Please try again."
      );
      setLock(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        onUpdate();
      }}
      // size="sm"
      containerClassName="p-6 md:p-8 space-y-6 "
    >
      <div className="w-full flex justify-between items-center">
        <Title as="h4" className="">
          Unfreeze Membership
        </Title>
        <XIcon
          onClick={() => {
            setIsOpen(false);
            closeModal();
          }}
          className="hover:text-primary cursor-pointer hover:scale-105"
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="w-full p-4 bg-primary-lighter dark:bg-gray-100 rounded-lg shadow col-span-full">
          <div className="flex flex-row gap-2 items-center">
            <Text className="text-sm">Please Note</Text>
            <IoWarningOutline className="animate-pulse" size={16} />
          </div>
          <ul className="flex flex-col items-stretch gap-3 px-4 pt-2 list-disc text-xs font-medium">
            <li>
              By UnFreezing the membership, It will resume the membership and
              return to normal immediately.
            </li>
          </ul>
        </div>
        <div className="text-gray-500 ">
          Are you sure you want to unfreeze this membership? This action will
          reactivate the membership immediately.
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={submitData}
          variant="solid"
          // size="lg"
          className="hover:scale-105 transition-all duration-200 group hover:shadow-sm shadow-gray-800 font-medium"
          disabled={lock}
        >
          {!lock ? (
            <span className="flex flex-nowrap gap-1 items-center justify-center">
              <span>Unfreeze Membership</span>
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
