import { Controller, useFormContext } from "react-hook-form";
import { Radio, RadioGroup, Input, Switch } from "rizzui";

const options = [
  {
    value: "yes",
    label: "Track inventory for this product",
  },
  {
    value: "no",
    label: "Do not track inventory for this product",
  },
  {
    value: "by-options",
    label: "Track inventory by options",
  },
];

export default function InventoryTracing() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <Controller
        name="inventoryTracking"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Switch
            // value={value === true ? "yes" : "no"}
            label="Track inventory for this product"
            {...register("is_track")}
            checked={value}
            error={(errors.is_track?.message as string) || ""}
            className="flex h-full justify-start items-center col-span-full"
            labelClassName="ml-2"
          />
        )}
      />

      <Input
        type="number"
        label="Current Stock Level"
        placeholder="150"
        {...register("current_stock_level")}
        error={errors.current_stock_level?.message as string}
      />
      <Input
        type="number"
        label="Low Stock Level"
        placeholder="20"
        {...register("low_stock_level")}
        error={errors.low_stock_level?.message as string}
      />
    </>
  );
}
