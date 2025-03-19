import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, Button, Input, Text, Select, Loader } from "rizzui";
// import axios from 'axios';
import toast from "react-hot-toast";
// import { getAccessToken } from '@/app/[locale]/auth/Acces';
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface UpdateModelProps {
  setUpdateData: React.Dispatch<React.SetStateAction<any | null>>;
  updateData: any;
  handleUpdate: () => void;
  AllPaymentModes: any[];
}
interface expence {
  amount: string;
  payment_date: any;
  payment_mode: string;
  reference: string;
}
const UpdateModel: React.FC<UpdateModelProps> = ({
  setUpdateData,
  updateData,
  handleUpdate,
  AllPaymentModes,
}) => {
  const [paymentModeValue, setPaymentModeValue] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<expence>({
    defaultValues: {
      amount: updateData?.amount || "",
      payment_date: updateData?.payment_date || "",
      payment_mode: updateData?.payment_mode?.id?.toString() || "",
      reference: updateData?.reference || "",
    },
  });
  useEffect(() => {
    setPaymentModeValue(updateData?.payment_mode?.id.toString());
  }, []);

  const paymentModeOptions =
    AllPaymentModes?.map((paymentMode) => ({
      value: paymentMode.id.toString(),
      label: paymentMode.name,
    })) || [];
  const [savingData, setSavingData] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setSavingData(true);
      const gymId = await retrieveGymId();
      const URL = `/api/update-transaction/${updateData.id}/?gym_id=${gymId}`;
      await AxiosPrivate.put(URL, {
        ...data,
        payment_date: new Date(data.payment_date).toISOString().split("T")[0],
      }).then(() => invalidateAll());
      setUpdateData(null);
      toast.success("Update Successfully");
      handleUpdate();
      reset();
    } catch (error) {
      toast.error("Something went wrong while Updating");
      console.error("Error updating the transaction:", error);
    } finally {
      setSavingData(false);
    }
  };

  return (
    <Modal
      isOpen={!!updateData}
      onClose={() => setUpdateData(null)}
      containerClassName="dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="p-6 md:p-8 m-auto dark:text-gray-400">
        <div className="mb-4">
          <Text className="text-xl font-semibold text-gray-900 dark:text-gray-200">
            Update Invoice
          </Text>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  label="Amount"
                  placeholder="Enter amount"
                  labelClassName="text-gray-900 dark:text-gray-200"
                />
              )}
            />
          </div>
          <div className="mb-4">
            <Controller
              name="payment_date"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Payment Date"
                  placeholder="Select payment date"
                  labelClassName="text-gray-900 dark:text-gray-200"
                />
              )}
            />
          </div>
          <div className="mb-4">
            <Controller
              name="payment_mode"
              control={control}
              render={({ field }) => (
                <Select
                  label="Payment Mode"
                  options={paymentModeOptions}
                  value={
                    paymentModeOptions.find(
                      (payment) => payment.value === paymentModeValue
                    )?.label
                  }
                  onChange={(value: any) => {
                    setPaymentModeValue(value ? value.value : null);
                    field.onChange(value ? value.value : "");
                  }}
                  // labelClassName="dark:text-gray-200"
                  labelClassName="dark:text-gray-200"
                  dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  id="payment_mode_id"
                  placeholder="Select Payment Mode"
                />
              )}
            />
          </div>
          <div className="mb-4">
            <Controller
              name="reference"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  label="Reference"
                  placeholder="Enter reference"
                  labelClassName="text-gray-900 dark:text-gray-200"
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              size="md"
              onClick={() => setUpdateData(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">
              {savingData ? <Loader variant="threeDot" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateModel;
