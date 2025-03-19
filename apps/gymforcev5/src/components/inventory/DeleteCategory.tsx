import React, { Dispatch, SetStateAction } from "react";
import { Avatar, Button, Modal, Text, Title } from "rizzui";
import { Category } from "./CategorySection";

const DeleteCategory = ({
  deleteCategory,
  setDeleteCategory,
  handleDelete,
}: {
  deleteCategory: Category | null;
  setDeleteCategory: Dispatch<SetStateAction<Category | null>>;
  handleDelete: (id: number) => Promise<void>;
}) => {
  return (
    <Modal
      isOpen={deleteCategory !== null}
      onClose={() => {
        setDeleteCategory(null);
      }}
      containerClassName="p-4 md:p-6 lg:p-8"
    >
      <div className="flex items-center gap-4">
        <Avatar
          src={deleteCategory?.image}
          name="Category Image"
          size="xl"
          className="rounded-lg"
        />
        <div>
          <Title as="h3" className="font-semibold">
            {deleteCategory?.name}
          </Title>
          <Text as="p" className="text-gray-500">
            {deleteCategory?.description}
          </Text>
        </div>
      </div>
      <Text as="p" className="mt-4 text-gray-500">
        Are you sure you want to delete this category?
      </Text>
      <div className="flex items-center justify-end gap-4 md:gap-8 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setDeleteCategory(null);
          }}
          className="scale-95"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            handleDelete(deleteCategory?.id!);
          }}
          color="danger"
          className="scale-95"
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteCategory;
