import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button, Drawer, Input, Loader, Title } from "rizzui";
import { SeatFormData } from "./LibrarySeatSection";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface AddSeatsProps {
  isOpen: boolean;
  onClose: () => void;
  fetchSeats: () => Promise<void>;
}

export default function AddSeats({
  isOpen,
  onClose,
  fetchSeats,
}: AddSeatsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [seatData, setSeatData] = useState<SeatFormData>({
    prefix: "",
    lower_limit: "1",
    upper_limit: "",
    center: 2,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setSeatData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`/api/lf/seats/?center=${gymId}`, {
        ...seatData,
        lower_limit: parseInt(seatData.lower_limit),
        upper_limit: parseInt(seatData.upper_limit),
        center: gymId,
      });
      invalidateAll();
      fetchSeats();
      onClose();
    } catch (error) {
      console.error("Error creating seats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <Title as="h3" className="text-gray-900">
            Add Seats
          </Title>
          <XIcon onClick={onClose} className="cursor-pointer" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Prefix"
            name="prefix"
            value={seatData.prefix}
            onChange={handleInputChange}
            className="w-full"
            placeholder="Enter prefix (e.g. AB)"
            labelClassName="font-medium"
            required
            maxLength={4}
          />

          <Input
            label="Lower Limit"
            type="number"
            name="lower_limit"
            value={seatData.lower_limit}
            onChange={handleInputChange}
            className="w-full"
            placeholder="Enter lower limit"
            labelClassName="font-medium"
            required
          />

          <Input
            label="Upper Limit"
            type="number"
            name="upper_limit"
            value={seatData.upper_limit}
            onChange={handleInputChange}
            className="w-full"
            placeholder="Enter upper limit"
            labelClassName="font-medium"
            required
          />

          <Button
            type="submit"
            className="mt-4 self-center w-full mx-auto"
            disabled={isLoading}
          >
            {isLoading ? <Loader variant="threeDot" /> : "Create Seats"}
          </Button>
        </form>
      </div>
    </Drawer>
  );
}
