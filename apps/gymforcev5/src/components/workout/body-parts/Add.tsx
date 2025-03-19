import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Drawer, Input, Loader, Textarea, Title } from "rizzui";

interface NewBodyPart {
  name: string;
  description: string;
}

export default function Add({
  setIsCreateModalOpen,
  fetchBodyParts,
}: {
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBodyParts: () => Promise<void>;
}) {
  const [newBodyPart, setNewBodyPart] = useState<NewBodyPart>({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateBodyPart = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`api/bodyparts/?gym_id=${gymId}`, {
        name: newBodyPart.name,
        description: newBodyPart.description,
        gyms_ids: [gymId],
      });
      toast.success("Body part created successfully");
      setIsCreateModalOpen(false);
      setNewBodyPart({
        name: "",
        description: "",
      });
      invalidateAll();
      fetchBodyParts();
    } catch (error) {
      console.error("Error creating body part:", error);
      toast.error("Something went wrong while creating body part");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={true}
      onClose={() => setIsCreateModalOpen(false)}
      size="md"
      // containerClassName="dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <Title as="h4" className="text-gray-900 ">
            Add Body Part
          </Title>
          <XIcon
            onClick={() => setIsCreateModalOpen(false)}
            className="cursor-pointer"
          />
        </div>
        <Input
          label="Name"
          value={newBodyPart.name}
          onChange={(e) => {
            setNewBodyPart((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter body part name"
          labelClassName=""
        />
        <Textarea
          label="Description"
          value={newBodyPart.description}
          onChange={(e) => {
            setNewBodyPart((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          }}
          className="w-full"
          placeholder="Enter body part description"
          labelClassName=""
        />
        <Button
          onClick={handleCreateBodyPart}
          className="max-w-xs self-center"
          disabled={!newBodyPart.name || !newBodyPart.description}
        >
          {isLoading ? <Loader variant="threeDot" /> : "Create"}
        </Button>
      </div>
    </Drawer>
  );
}
