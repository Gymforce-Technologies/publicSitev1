import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { Button, Drawer, Input, Loader, Modal, Title } from "rizzui";
import toast from "react-hot-toast";
import { MdPayments } from "react-icons/md";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface EditModalProps {
  isOpen: boolean;
  title: string;
  initialValue: any;
  onSave: () => void;
  onCancel: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  title,
  initialValue,
  onSave,
  onCancel,
  isOpen,
}) => {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      paymentMode: initialValue.name,
    },
  });
  const [saving, setSaving] = useState(false);
  const handleSave = async (data: any) => {
    try {
      setSaving(true);
      const gymId = await retrieveGymId();
      const URL = `/api/payment-modes/${initialValue.id}/?gym_id=${gymId}`;
      await AxiosPrivate.patch(URL, {
        name: data.paymentMode,
        mark_as_default: false,
      }).then(() => invalidateAll());
      toast.success("PaymentMode Updated");
    } catch (error) {
      console.error("Error updating the payment mode:", error);
      toast.error("Something went wrong while Updating");
    } finally {
      setSaving(false);
      onSave(); // Implement save logic here
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
      <div className={` shadow-lg p-6 w-full h-full`}>
        <div className={`flex items-center mb-4 gap-2 `}>
          <MdPayments className="h-6 w-6 " />
          <Title as="h3" className="text-gray-900 ">
            {title}
          </Title>
        </div>
        <form
          onSubmit={handleSubmit((data: any) => handleSave(data))}
          className="flex flex-col gap-6 justify-between h-full"
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
              {saving ? <Loader variant="threeDot" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default EditModal;
