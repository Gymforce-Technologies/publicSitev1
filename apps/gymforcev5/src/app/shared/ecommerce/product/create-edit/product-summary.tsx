"use client";
import { Controller, useFormContext } from "react-hook-form";
import { Button, Input, Text, Textarea } from "rizzui";
import cn from "@core/utils/class-names";
import FormGroup from "@/app/shared/form-group";
import {
  categoryOption,
  typeOption,
} from "@/app/shared/ecommerce/product/create-edit/form-utils";
import dynamic from "next/dynamic";
import SelectLoader from "@core/components/loader/select-loader";
// import QuillLoader from "@core/components/loader/quill-loader";
import { useEffect, useState } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";
const Select = dynamic(() => import("rizzui").then((mod) => mod.Select), {
  ssr: false,
  loading: () => <SelectLoader />,
});
// const QuillEditor = dynamic(() => import("@core/ui/quill-editor"), {
//   ssr: false,
//   loading: () => <QuillLoader className="col-span-full h-[143px]" />,
// });

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  is_default: boolean;
  center: number;
  created_at: string;
}

export default function ProductSummary({ className }: { className?: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const getCategories = async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/categories/?center=${gymId}`,
        {
          id: `category-list`,
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  function renderEmpty() {
    return (
      <div
        className=" w-full flex gap-4 flex-row items-center justify-between mx-4"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-[13px] text-nowrap">
          {`No Category's Found`}
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Category Creation");
            router.push("/inventory/categories");
          }}
          className="text-primary text-xs text-nowrap"
        >
          Add Category <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <FormGroup
      title="Summary"
      description="Edit your product description and necessary information from here"
      className={cn(className)}
    >
      <Input
        label="Title"
        placeholder="Product title"
        {...register("title")}
        error={errors.title?.message as string}
      />
      <Input
        label="SKU"
        placeholder="Product sku"
        {...register("sku")}
        error={errors.sku?.message as string}
      />

      <Controller
        name="product_type"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownClassName="h-auto"
            options={typeOption}
            value={typeOption.find((item) => item.value === value)?.label}
            onChange={onChange}
            label="Product Type"
            error={errors?.product_type?.message as string}
            getOptionValue={(option) => option.value}
          />
        )}
      />

      <Controller
        name="categories"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            options={
              categories.length
                ? categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))
                : [{ label: "No Data...", value: 0 }]
            }
            // value={value}
            value={categories.find((item) => item.id === value)?.name}
            onChange={onChange}
            label="Categories"
            getOptionDisplayValue={(option) =>
              categories.length ? <Text>{option.label}</Text> : renderEmpty()
            }
            error={errors?.categories?.message as string}
            getOptionValue={(option) => option.value}
            dropdownClassName="h-auto"
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          // <QuillEditor
          //   value={value}
          //   onChange={onChange}
          //   label="Description"
          //   className="col-span-full [&_.ql-editor]:min-h-[100px]"
          //   labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
          // />
          <Textarea
            value={value}
            onChange={onChange}
            label="Description"
            className="col-span-full [&_.ql-editor]:min-h-[100px]"
            labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
          />
        )}
      />
    </FormGroup>
  );
}
