import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useForm, Controller } from "react-hook-form";
// import { getAccessToken } from '@/app/[locale]/auth/Acces';
// import axios from 'axios';
// import { useTheme } from 'next-themes';
// import { darkTheme, lightTheme } from '@/app/shared/theme-config';
import toast from "react-hot-toast";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { Button, Drawer, Input, Loader, Modal, Title } from "rizzui";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { MdPayments } from "react-icons/md";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onSave: () => void;
  onCancel: () => void;
}
const AddModal: React.FC<ModalProps> = ({
  title,
  onSave,
  onCancel,
  isOpen,
}) => {
  const { handleSubmit, control, reset } = useForm();
  const [AddLoading, setAddLoading] = useState(false);
  // const {theme}=useTheme()
  const handleSave = async (data: any) => {
    try {
      // const token =getAccessToken()
      // console.log(token)
      setAddLoading(true);
      const gym_id = await retrieveGymId();
      const URL = `/api/payment-modes/?gym_id=${gym_id}`;
      await AxiosPrivate.post(URL, {
        name: data.paymentMode,
        mark_as_default: false,
      }).then(() => invalidateAll());
      toast.success("Payment Mode Added Successfully");
    } catch (error) {
      toast.error("Something went wrong while adding PaymentMode");
      console.error("Error deleting the transaction:", error);
    } finally {
      setAddLoading(false);
      onSave(); // You can implement save logic here
      reset(); // Reset form after save
    }
  };

  const handleCancel = () => {
    onCancel();
    reset(); // Reset form on cancel
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      // containerClassName='dark:text-gray-400 dark:bg-gray-800'
    >
      <div className={`  p-6 w-full  h-full`}>
        <div className={`flex items-center mb-4 gap-2  `}>
          <MdPayments className="h-6 w-6 " />
          <Title as="h3" className="">
            {title}
          </Title>
        </div>
        <form
          onSubmit={handleSubmit((data: any) => handleSave(data))}
          className="flex flex-col gap-6 h-full justify-between"
        >
          <div className="mb-4">
            <Controller
              name="paymentMode"
              control={control}
              render={({ field }) => (
                <Input
                  label="Name"
                  {...field}
                  type="text"
                  placeholder="Enter Payment Mode"
                  required
                />
              )}
            />
          </div>
          {/* Buttons */}
          <div className="flex justify-between gap-3 mb-4">
            <Button
              type="button"
              onClick={handleCancel}
              className="w-full"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full">
              {AddLoading ? <Loader variant="threeDot" /> : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddModal;
