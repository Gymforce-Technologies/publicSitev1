import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { getGymId } from "@/app/[locale]/auth/InfoCookies";
// import { DatePicker } from "@ui/datepicker";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Input,
  Loader,
  Modal,
  Select,
  Text,
  Title,
} from "rizzui";
import dayjs from "dayjs";
import toast from "react-hot-toast";

interface Batch {
  id: number;
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

export default function Edit({
  setIsEditOpen,
  fetchBatches,
  batch,
  setBatch,
}: {
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBatches: () => Promise<void>;
  batch: Batch | null;
  setBatch: React.Dispatch<React.SetStateAction<Batch | null>>;
}) {
  const [editedBatch, setEditedBatch] = useState<Batch>({
    id: 0,
    name: "",
    start_time: null,
    end_time: null,
    capacity: 0,
    batch_type: "Morning",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (batch) {
      setEditedBatch({
        ...batch,
        start_time: batch.start_time || null,
        end_time: batch.end_time || null,
      });
    }
  }, [batch]);

  const handleEditBatch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await getGymId();
      await AxiosPrivate.put(
        `/api/batches/${editedBatch.id}/?gym_id=${gymId}`,
        {
          name: editedBatch.name,
          capacity: editedBatch.capacity,
          start_time: editedBatch.start_time,
          edn_time: editedBatch.end_time,
          // gym_id: gymId
        }
      );
      setIsEditOpen(false);
      invalidateAll();
      fetchBatches();
      setBatch(null);
      toast.success("Updated Successfully");
    } catch (error) {
      console.error("Error editing batch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseTime = (timeString: string | null) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date;
  };

  return (
    <Drawer
      isOpen={true}
      onClose={() => setIsEditOpen(false)}
      size="md"
      containerClassName="  p-6 "
    >
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-2 gap-4 ">
          <div className="flex items-center justify-between mb-2 col-span-full">
            <Title as="h4" className="text-gray-900 ">
              Edit Batch
            </Title>
            <XIcon
              onClick={() => setIsEditOpen(false)}
              className="cursor-pointer"
            />
          </div>
          <Input
            label="Name"
            value={editedBatch.name}
            onChange={(e) =>
              setEditedBatch((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full"
            placeholder="Enter batch name"
            labelClassName=""
          />
          <Input
            label="Capacity"
            type="number"
            value={editedBatch.capacity}
            onChange={(e) =>
              setEditedBatch((prev) => ({
                ...prev,
                capacity: parseInt(e.target.value),
              }))
            }
            className="w-full"
            placeholder="Enter batch capacity"
            labelClassName=""
          />
          {/* <div className="flex flex-col gap-1.5 relative">
          <div className="font-medium ">
            Start Time
          </div>
          <DatePicker
            selected={parseTime(editedBatch.start_time)}
            onChange={(date: any) => setEditedBatch((prev) => ({ 
              ...prev, 
              start_time: dayjs(date).format('HH:mm')
            }))}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            placeholderText="Select Start Time"
          />
        </div> */}
          <div className="col-span-full grid gap-1.5">
            <Text className="font-medium">Batch Type</Text>
            <Select
              value={editedBatch.batch_type}
              onChange={(option: any) =>
                setEditedBatch((prev) => ({
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
                { label: "Full Day", value: "Full Day" },
                { label: "Full Night", value: "Full Night" },
                { label: "Other", value: "Other" },
              ]}
            />
          </div>
          <Input
            type="time"
            label="Start Time"
            value={editedBatch?.start_time?.toString()}
            onChange={(e) =>
              setEditedBatch((prev) => ({
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
            value={editedBatch?.end_time?.toString()}
            onChange={(e) =>
              setEditedBatch((prev) => ({
                ...prev,
                end_time: e.target.value,
              }))
            }
            className="w-full"
            placeholder="Enter batch capacity"
            labelClassName=""
          />
        </div>
        <div className="flex justify-center items-center col-span-full ">
          <Button onClick={handleEditBatch} className=" w-full">
            {isLoading ? <Loader variant="threeDot" /> : "Update"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
