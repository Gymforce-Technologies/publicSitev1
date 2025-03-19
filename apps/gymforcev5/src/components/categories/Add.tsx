import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Input, Loader,  Title, Drawer } from "rizzui";

interface NewCategory {
  name: string;
  is_default: boolean;
}

export default function Add({
  setIsCreateModalOpen,
  fetchCategories,
}: {
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchCategories: () => Promise<void>;
}) {
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: "",
    is_default: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`/api/member-categories/?gym_id=${gymId}`, newCategory);
      setIsCreateModalOpen(false);
      setNewCategory({ name: "", is_default: false });
      invalidateAll();
      fetchCategories();
      toast.success("New Category Added Successfully")
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={true}
      onClose={() => setIsCreateModalOpen(false)}
      size="sm"
      // containerClassName="dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex flex-col gap-3 p-4 md:p-6  h-full">
        <div className="flex  justify-between mb-2">
          <Title as="h3" className="text-gray-900 ">
            Add Category
          </Title>
          <XIcon onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer" />
        </div>
        <div className="flex flex-col justify-between h-full">

        <Input
          label="Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full"
          placeholder="Enter the Category Name"
          // labelClassName="dark:text-gray-200"
        />
        {/* <div className="flex items-center">
          <Switch
            label="Default Category"
            checked={newCategory.is_default}
            onChange={(checked) => setNewCategory((prev) => ({ ...prev, is_default: checked }))}
            labelClassName="dark:text-gray-200"
          />
        </div> */}
        <div className="flex justify-center items-center mt-4">
          <Button
            onClick={handleCreateCategory}
            className="w-full"
          >
            {isLoading ? <Loader variant="threeDot"/> : 'Create'}
          </Button>
        </div>
        </div>
      </div>
    </Drawer>
  );
}