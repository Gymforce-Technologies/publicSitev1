import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button, Drawer, Input, Loader, Textarea, Title } from "rizzui";

interface BodyPart {
  name: string;
  description: string;
}

export default function Edit({
  setIsEditOpen,
  fetchBodyParts,
  bodyPart,
  setBodyPart,
}: {
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBodyParts: () => Promise<void>;
  bodyPart: any;
  setBodyPart: React.Dispatch<any>;
}) {
  const [editBodyPart, setEditBodyPart] = useState<BodyPart>({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEditBodyPart = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.put(`api/bodyparts/${bodyPart.id}/?gym_id=${gymId}`, {
        ...editBodyPart,
        gyms_ids: [gymId],
      });
      toast.success("Body part updated successfully");
      setIsEditOpen(false);
      setBodyPart(null);
      fetchBodyParts();
      invalidateAll();
    } catch (error) {
      console.error("Error updating body part:", error);
      toast.error("Something went wrong while updating body part");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bodyPart) {
      setEditBodyPart({
        name: bodyPart.name,
        description: bodyPart.description,
      });
    }
  }, [bodyPart]);

  return (
    <Drawer
      isOpen={true}
      onClose={() => setIsEditOpen(false)}
      size="md"
      // containerClassName="dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex flex-col gap-4 p-6 md:p-8 ">
        <div className="flex items-center justify-between mb-4">
          <Title as="h4" className="text-gray-900 ">
            Update Body Part
          </Title>
          <XIcon
            onClick={() => setIsEditOpen(false)}
            className="cursor-pointer"
          />
        </div>
        <Input
          label="Name"
          value={editBodyPart.name}
          onChange={(e) => {
            setEditBodyPart((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter body part name"
          labelClassName=""
        />
        <Textarea
          label="Description"
          value={editBodyPart.description}
          onChange={(e) => {
            setEditBodyPart((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          }}
          className="w-full"
          placeholder="Enter body part description"
          labelClassName=""
        />
        <Button
          onClick={handleEditBodyPart}
          className="max-w-xs self-center"
          disabled={!editBodyPart.name || !editBodyPart.description}
        >
          {isLoading ? <Loader variant="threeDot" /> : "Update"}
        </Button>
      </div>
    </Drawer>
  );
}
