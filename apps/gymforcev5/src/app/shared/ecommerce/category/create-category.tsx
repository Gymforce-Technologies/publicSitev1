"use client";

import { useState } from "react";
// import dynamic from "next/dynamic";
import { SubmitHandler, Controller } from "react-hook-form";
// import SelectLoader from "@core/components/loader/select-loader";
// import QuillLoader from "@core/components/loader/quill-loader";
import { Button, Input, Text, Textarea, Title } from "rizzui";
import cn from "@core/utils/class-names";
import { Form } from "@core/ui/form";
import {
  CategoryFormInput,
  categoryFormSchema,
} from "@/validators/create-category.schema";
// import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { useModal } from "../../modal-views/use-modal";

// const Select = dynamic(() => import("rizzui").then((mod) => mod.Select), {
//   ssr: false,
//   loading: () => <SelectLoader />,
// });

// const QuillEditor = dynamic(() => import("@core/ui/quill-editor"), {
//   ssr: false,
//   loading: () => <QuillLoader className="col-span-full h-[168px]" />,
// });

function HorizontalFormBlockWrapper({
  title,
  description,
  children,
  className,
  isModalView = true,
}: React.PropsWithChildren<{
  title: string;
  description?: string;
  className?: string;
  isModalView?: boolean;
}>) {
  return (
    <div
      className={cn(className, isModalView ? "@5xl:grid @5xl:grid-cols-6" : "")}
    >
      {isModalView && (
        <div className="col-span-2 mb-6 pe-4 @5xl:mb-0">
          <Title as="h6" className="font-semibold">
            {title}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">{description}</Text>
        </div>
      )}
      <div
        className={cn(
          "grid grid-cols-2 gap-3 @lg:gap-4 @2xl:gap-5",
          isModalView ? "col-span-4" : ""
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function CreateCategory({
  id,
  category,
  isModalView = true,
  onUpdate,
}: {
  id?: string;
  isModalView?: boolean;
  category?: CategoryFormInput;
  onUpdate?: () => Promise<void>;
}) {
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { closeModal } = useModal();
  

  const onSubmit: SubmitHandler<CategoryFormInput> = async (data) => {
    setLoading(true);
    try {
      const gymId = 1;
      const endpoint = id
        ? `/api/categories/${id}/update/?gym_id=${gymId}`
        : `/api/categories/create/?gym_id=${gymId}`;

      await AxiosPrivate[id ? "put" : "post"](endpoint, {
        ...data,
        center: gymId,
      }).then(async () => {
        invalidateAll();
        if (onUpdate) {
          await onUpdate();
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  return (
    <Form<CategoryFormInput>
      validationSchema={categoryFormSchema}
      resetValues={reset}
      onSubmit={onSubmit}
      useFormProps={{
        mode: "onChange",
        defaultValues: category,
      }}
      className="isomorphic-form flex flex-grow flex-col @container"
    >
      {({ register, control, setValue, watch, formState: { errors } }) => {
        const imageValue = watch("image") || category?.image;
        return (
          <>
            <div className="flex-grow pb-10">
              <div
                className={cn(
                  "grid grid-cols-1",
                  isModalView
                    ? "grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12 [&>div]:pt-7 first:[&>div]:pt-0 @2xl:[&>div]:pt-9 @3xl:[&>div]:pt-11"
                    : "gap-5"
                )}
              >
                <HorizontalFormBlockWrapper
                  title={id ? "Edit Category" : "Add new category"}
                  description="Edit your category information from here"
                  isModalView={isModalView}
                >
                  <Input
                    label="Category Name"
                    placeholder="category name"
                    {...register("name")}
                    error={errors.name?.message}
                    className="col-span-full"
                  />

                  <div className="col-span-2">
                    <Controller
                      control={control}
                      name="description"
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          value={value}
                          onChange={onChange}
                          label="Description"
                          className="[&>.ql-container_.ql-editor]:min-h-[100px]"
                          labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                        />
                      )}
                    />
                  </div>
                </HorizontalFormBlockWrapper>

                <HorizontalFormBlockWrapper
                  title="Upload new thumbnail image"
                  description="Upload your product image gallery here"
                  isModalView={isModalView}
                >
                  <Input
                    label="Image Link"
                    placeholder="image.url"
                    {...register("image")}
                    error={errors.image?.message as string}
                    className="col-span-full max-w-xl"
                    clearable
                    onClear={() => setValue("image", "")}
                  />

                  {imageValue && (
                    <img
                      src={imageValue}
                      alt="Product Image"
                      className="rounded-xl h-40 w-40 mt-4 mx-4 md:mx-8 lg:mx-10"
                    />
                  )}
                </HorizontalFormBlockWrapper>
              </div>
            </div>

            <div
              className={cn(
                "sticky bottom-0 z-40 flex items-center justify-end gap-3 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col",
                isModalView ? "-mx-10 -mb-7 px-10 py-5" : "py-1"
              )}
            >
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full @xl:w-auto"
              >
                {id ? "Update" : "Create"} Category
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
