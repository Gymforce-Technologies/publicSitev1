import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input, Loader, Title, Drawer } from "rizzui";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  is_default: boolean;
  is_favorite: boolean;
}

export default function Edit({
  setIsEditOpen,
  fetchCategories,
  category,
  setCategory,
}: {
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchCategories: () => Promise<void>;
  category: Category | null;
  setCategory: React.Dispatch<React.SetStateAction<Category | null>>;
}) {
  const [editedCategory, setEditedCategory] = useState<Category>({
    id: 0,
    name: "",
    is_default: false,
    is_favorite: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setEditedCategory(category);
    }
  }, [category]);

  const handleEditCategory = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.put(
        `/api/member-categories/${editedCategory.id}/?gym_id=${gymId}`,
        {
          name: editedCategory.name,
          is_default: editedCategory.is_default,
        }
      );
      setIsEditOpen(false);
      invalidateAll();
      fetchCategories();
      setCategory(null);
      toast.success("Updated Successfully");
    } catch (error) {
      console.error("Error editing category:", error);
      toast.error("Something went wrong while updating category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={true}
      onClose={() => setIsEditOpen(false)}
      size="sm"
      // containerClassName="dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex flex-col gap-3 p-4 md:p-6  h-full">
        <div className="flex items-center justify-between mb-2">
          <Title as="h3" className="text-gray-900">
            Edit Category
          </Title>
          <XIcon
            onClick={() => setIsEditOpen(false)}
            className="cursor-pointer"
          />
        </div>
        <div className="flex flex-col justify-between h-full">
          <Input
            label="Name"
            value={editedCategory.name}
            onChange={(e) =>
              setEditedCategory((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full"
            placeholder="Enter category name"
            // labelClassName="dark:text-gray-200"
          />
          {/* <div className="flex items-center">
          <Switch
            label="Default Category"
            checked={editedCategory.is_default}
            onChange={(checked) => setEditedCategory((prev) => ({ ...prev, is_default: checked }))}
            labelClassName="dark:text-gray-200"
          />
        </div> */}
          <div className="flex justify-center items-center mt-4">
            <Button
              onClick={handleEditCategory}
              className="max-w-xs self-center w-full"
            >
              {isLoading ? <Loader variant="threeDot" /> : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
