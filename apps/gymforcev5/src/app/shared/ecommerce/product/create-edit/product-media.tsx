import { useFormContext } from "react-hook-form";
import FormGroup from "@/app/shared/form-group";
import cn from "@core/utils/class-names";
import { Input } from "rizzui";
import { useState, useEffect } from "react";

interface ProductMediaProps {
  className?: string;
}

export default function ProductMedia({ className }: ProductMediaProps) {
  const {
    register,
    formState: { errors },
    getValues,
    watch,
  } = useFormContext();

  const imageValue = watch("image");

  return (
    <FormGroup
      title="Upload new product images"
      description="Upload your product image gallery here"
      className={cn(className)}
    >
      <Input
        label="Image Link"
        placeholder="image.url"
        {...register("image")}
        error={errors.image?.message as string}
      />

      {imageValue && (
        <img
          src={imageValue}
          alt="Product Image"
          className="rounded-xl h-40 w-40 mt-4"
        />
      )}
    </FormGroup>
  );
}
