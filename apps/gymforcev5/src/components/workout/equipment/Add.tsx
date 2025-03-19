import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { DatePicker } from "@core/ui/datepicker";
import { XIcon } from "lucide-react";
import { useState, useRef } from "react";
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

interface NewEquipment {
  name: string;
  description: string;
  category: string;
  condition: string;
}

export default function Add({
  setIsCreateModalOpen,
  fetchEquipment,
}: {
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchEquipment: () => Promise<void>;
}) {
  const [newEquipment, setNewEquipment] = useState<NewEquipment>({
    name: "",
    description: "",
    category: "",
    condition: "",
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

  const handleCreateEquipment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`api/equipments/?gym_id=${gymId}`, {
        ...newEquipment,
        gyms_ids: [gymId],
      });
      invalidateAll();
      toast.success("Equipment created successfully");
      setIsCreateModalOpen(false);
      setNewEquipment({
        name: "",
        description: "",
        category: "",
        condition: "",
      });
      fetchEquipment();
    } catch (error) {
      console.error("Error creating equipment:", error);
      toast.error("Something went wrong while creating equipment");
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
      <div className="flex flex-col gap-4 p-6 md:p-8 ">
        <div className="flex items-center justify-between mb-4">
          <Title as="h4" className="text-gray-900 ">
            Add Equipment
          </Title>
          <XIcon
            onClick={() => setIsCreateModalOpen(false)}
            className="cursor-pointer"
          />
        </div>
        <Input
          label="Name"
          value={newEquipment.name}
          onChange={(e) => {
            setNewEquipment((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter equipment name"
          labelClassName=""
        />
        <Select
          label="Category"
          options={categoryOptions}
          onChange={(option: any) => {
            setNewEquipment((prev) => ({ ...prev, category: option.value }));
          }}
          value={newEquipment.category}
          className="w-full"
          placeholder="Select category"
          labelClassName=""
        />
        <Select
          label="Condition"
          options={conditionOptions}
          onChange={(option: any) => {
            setNewEquipment((prev) => ({ ...prev, condition: option.value }));
          }}
          value={newEquipment.condition}
          className="w-full"
          placeholder="Select condition"
          labelClassName=""
        />
        <Textarea
          label="Description"
          value={newEquipment.description}
          onChange={(e) => {
            setNewEquipment((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          }}
          className="w-full"
          placeholder="Enter equipment description"
          labelClassName=""
        />
        <Button
          onClick={handleCreateEquipment}
          className="max-w-xs self-center"
          disabled={
            !newEquipment.name ||
            !newEquipment.category ||
            !newEquipment.condition
          }
        >
          {isLoading ? <Loader variant="threeDot" /> : "Create"}
        </Button>
      </div>
    </Drawer>
  );
}
