"use client";

import React from "react";
import PageHeader from "@/app/shared/page-header";
import { Button, Title, ActionIcon } from "rizzui";
import CreateCategory from "@/app/shared/ecommerce/category/create-category";
import { PiPlusBold, PiXBold } from "react-icons/pi";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { CategoryFormInput } from "@/validators/create-category.schema";

export function CreateCategoryModalView({
  id,
  category,
  onUpdate,
}: {
  id?: string;
  category?: CategoryFormInput;
  onUpdate?: () => Promise<void>;
}) {
  const { closeModal } = useModal();
  return (
    <div className="m-auto p-4 md:p-6 lg:p-8">
      <div className="mb-7 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          {id ? "Update" : "Add"} Category
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <CreateCategory
        isModalView={false}
        id={id ?? ""}
        category={category ?? { name: "", description: "", image: "" }}
        onUpdate={onUpdate}
      />
    </div>
  );
}

type PageHeaderTypes = {
  title: string;
  breadcrumb: { name: string; href?: string }[];
  className?: string;
};

export default function CategoryPageHeader({
  title,
  breadcrumb,
  className,
}: PageHeaderTypes) {
  const { openModal } = useModal();
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb} className={className}>
        <Button
          as="span"
          className="mt-4 w-full cursor-pointer @lg:mt-0 @lg:w-auto "
          onClick={() =>
            openModal({
              view: <CreateCategoryModalView />,
              // customSize: "576px",
              size: "sm",
            })
          }
        >
          <PiPlusBold className="me-1 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>
    </>
  );
}
