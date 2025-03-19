import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button, Drawer, Input, Loader, Title } from "rizzui";
import { SeatFormData, SeatSection } from "./LibrarySeatSection";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface EditSeatsProps {
  isOpen: boolean;
  onClose: () => void;
  seat: SeatSection;
  fetchSeats: () => Promise<void>;
}

export default function EditSeats({
  isOpen,
  onClose,
  seat,
  fetchSeats,
}: EditSeatsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [seatData, setSeatData] = useState<SeatFormData>({
    prefix: seat.prefix,
    lower_limit: seat.lower_limit.toString(),
    upper_limit: seat.upper_limit.toString(),
    center: seat.center,
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
      await AxiosPrivate.patch(`/api/lf/seats/${seat.id}/?center=${gymId}`, {
        ...seatData,
        lower_limit: parseInt(seatData.lower_limit),
        upper_limit: parseInt(seatData.upper_limit),
      });
      invalidateAll();
      fetchSeats();
      onClose();
    } catch (error) {
      console.error("Error updating seats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <Title as="h4" className="text-gray-900">
            Edit Seat: {seat.prefix} {seat.lower_limit}-{seat.upper_limit}
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
            className="mt-4 self-center w-full mx-autosdz"
            disabled={isLoading}
          >
            {isLoading ? <Loader variant="threeDot" /> : "Update Seats"}
          </Button>
        </form>
      </div>
    </Drawer>
  );
}
