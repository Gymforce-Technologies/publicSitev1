import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
// import { DatePicker } from "@ui/datepicker";
import { XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Alert,
  Button,
  Drawer,
  Input,
  Loader,
  Modal,
  Select,
  Text,
  Title,
} from "rizzui";

interface NewBatch {
  name: string;
  start_time: string | null;
  end_time: string | null;
  capacity: number;
  batch_type:
    | "Morning"
    | "Afternoon"
    | "Evening"
    | "Full Day"
    | "Full Night"
    | "Other";
}

export default function Add({
  setIsCreateModalOpen,
  fetchBatches,
}: {
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBatches: () => Promise<void>;
}) {
  const [newBatch, setNewBatch] = useState<NewBatch>({
    name: "",
    start_time: null,
    end_time: null,
    capacity: 0,
    batch_type: "Morning",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateBatch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`/api/batches/?gym_id=${gymId}`, {
        ...newBatch,
        // start_time: newBatch.start_time?.toISOString(),
        // end_time: newBatch.end_time?.toISOString(),
      });
      setIsCreateModalOpen(false);
      setNewBatch({
        name: "",
        start_time: null,
        end_time: null,
        capacity: 0,
        batch_type: "Morning",
      });
      invalidateAll();
      fetchBatches();
      toast.success("New Batch Added Successfully");
    } catch (error) {
      console.error("Error creating batch:", error);
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
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-2 gap-4 p-6 md:p-8 ">
          <div className="flex items-center justify-between col-span-full">
            <Title as="h4" className="text-gray-900 ">
              Add Batch
            </Title>
            <XIcon
              onClick={() => setIsCreateModalOpen(false)}
              className="cursor-pointer"
            />
          </div>
          <Input
            label="Name"
            value={newBatch.name}
            onChange={(e) =>
              setNewBatch((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full"
            placeholder="Enter batch name"
            labelClassName=""
          />
          <Input
            label="Capacity"
            type="number"
            value={newBatch.capacity ? newBatch.capacity : ""}
            onChange={(e) =>
              setNewBatch((prev) => ({
                ...prev,
                capacity: parseInt(e.target.value),
              }))
            }
            className="w-full"
            placeholder="Enter batch capacity"
            labelClassName=""
          />
          {/* <div className="flex flex-col gap-1.5">
          <div className="font-medium ">Start Time</div>
          <DatePicker
            selected={
              newBatch.start_time
                ? new Date(`1970-01-01T${newBatch.start_time}`)
                : null
            }
            onChange={(date: any) =>
              setNewBatch((prev) => ({
                ...prev,
                start_time: date.toTimeString().slice(0, 5),
              }))
            }
            dateFormat="h:mm aa"
            placeholderText="Select Start Time"
            showTimeSelect
            showTimeSelectOnly
          />
        </div> */}
          {/* <div className="flex flex-col gap-1.5"> */}
          {/* <div className="font-medium ">
          End Time
          </div> */}
          {/* <DatePicker
            selected={newBatch.end_time ? new Date(`1970-01-01T${newBatch.end_time}`) : null}
            onChange={(date: any) => setNewBatch((prev) => ({ 
              ...prev, 
              end_time: date.toTimeString().slice(0, 5) 
            }))}
            dateFormat="h:mm aa"
            placeholderText="Select End Time"
            showTimeSelect
            showTimeSelectOnly
          /> */}
          <div className="col-span-full grid gap-1.5">
            <Text className="font-medium">Batch Type</Text>
            <Select
              value={newBatch.batch_type}
              onChange={(option: any) =>
                setNewBatch((prev) => ({
                  ...prev,
                  batch_type: option.value as
                    | "Morning"
                    | "Afternoon"
                    | "Evening"
                    | "Full Day"
                    | "Full Night"
                    | "Other",
                }))
              }
              options={[
                { label: "Morning", value: "Morning" },
                { label: "Afternoon", value: "Afternoon" },
                { label: "Evening", value: "Evening" },
                { label: "Other", value: "Other" },
                { label: "Full Day", value: "Full Day" },
                { label: "Full Night", value: "Full Night" },
              ]}
            />
          </div>
          <Input
            type="time"
            label="Start Time"
            value={newBatch?.start_time?.toString()}
            onChange={(e) =>
              setNewBatch((prev) => ({
                ...prev,
                start_time: e.target.value,
              }))
            }
            className="w-full"
            placeholder="Enter batch capacity"
            labelClassName=""
          />
          <Input
            type="time"
            label="End Time"
            value={newBatch?.end_time?.toString()}
            onChange={(e) =>
              setNewBatch((prev) => ({
                ...prev,
                end_time: e.target.value,
              }))
            }
            className="w-full"
            placeholder="Enter batch capacity"
            labelClassName=""
          />
          <div className="col-span-full my-4">
            <Alert color="info">No Duplicate Batch Types Allowed</Alert>
          </div>
        </div>

        <div className="flex justify-center items-center col-span-full p-6 ">
          <Button onClick={handleCreateBatch} className="w-full">
            {isLoading ? <Loader variant="threeDot" /> : "Create"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
