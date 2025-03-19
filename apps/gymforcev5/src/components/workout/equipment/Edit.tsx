import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { DatePicker } from "@core/ui/datepicker";
import { XIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Button,
  Drawer,
  Input,
  Loader,
  Modal,
  Select,
  Text,
  Textarea,
  Title,
} from "rizzui";

interface Equipment {
  id: number;
  name: string;
  description: string;
  category: string;
  condition: string;
}

export default function Edit({
  setIsEditOpen,
  fetchEquipment,
  equipment,
  setEquipment,
}: {
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchEquipment: () => Promise<void>;
  equipment: any;
  setEquipment: React.Dispatch<any>;
}) {
  const [editEquipment, setEditEquipment] = useState<Equipment>({
    name: "",
    description: "",
    category: "",
    condition: "",
    id: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = [
    { label: "Cardio", value: "Cardio" },
    { label: "Weightlifting", value: "Weightlifting" },
    { label: "Yoga", value: "Yoga" },
    { label: "Strength", value: "Strength" },
    { label: "Free Weights", value: "Free Weights" },
    { label: "Functional", value: "Functional" },
    { label: "Other", value: "Other" },
  ];

  const conditionOptions = [
    { label: "Excellent", value: "Excellent" },
    { label: "Good", value: "Good" },
    { label: "Fair", value: "Fair" },
    { label: "Poor", value: "Poor" },
  ];

  // In Edit.tsx:

  const handleEditEquipment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();

      await AxiosPrivate.put(
        `api/equipments/${equipment.id}/?gym_id=${gymId}`,
        {
          ...editEquipment,
          gyms_ids: [gymId],
        }
      );
      invalidateAll();
      toast.success("Equipment updated successfully");
      setIsEditOpen(false);
      setEquipment(null);
      fetchEquipment();
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast.error("Something went wrong while updating equipment");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (equipment) {
      setEditEquipment({
        name: equipment.name,
        description: equipment.description,
        category: equipment.category,
        condition: equipment.condition,
        id: equipment.id,
      });
    }
  }, [equipment]);

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
            Update Equipment
          </Title>
          <XIcon
            onClick={() => setIsEditOpen(false)}
            className="cursor-pointer"
          />
        </div>
        <Input
          label="Name"
          value={editEquipment.name}
          onChange={(e) => {
            setEditEquipment((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter equipment name"
          labelClassName=""
        />
        <Select
          label="Category"
          options={categoryOptions}
          onChange={(option: any) => {
            setEditEquipment((prev) => ({ ...prev, category: option.value }));
          }}
          value={editEquipment.category}
          className="w-full"
          placeholder="Select category"
          labelClassName=""
        />
        <Select
          label="Condition"
          options={conditionOptions}
          onChange={(option: any) => {
            setEditEquipment((prev) => ({ ...prev, condition: option.value }));
          }}
          value={editEquipment.condition}
          className="w-full"
          placeholder="Select condition"
          labelClassName=""
        />
        <Textarea
          label="Description"
          value={editEquipment.description}
          onChange={(e) => {
            setEditEquipment((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          }}
          className="w-full"
          placeholder="Enter equipment description"
          labelClassName=""
        />
        <Button
          onClick={handleEditEquipment}
          className="max-w-xs self-center"
          disabled={
            !editEquipment.name ||
            !editEquipment.category ||
            !editEquipment.condition
          }
        >
          {isLoading ? <Loader variant="threeDot" /> : "Update"}
        </Button>
      </div>
    </Drawer>
  );
}
