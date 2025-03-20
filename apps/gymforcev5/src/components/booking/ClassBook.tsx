import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Button, Input, Text, Drawer, Alert, Title } from "rizzui";
import axios from "axios";
import { XIcon } from "lucide-react";
import { formatDate } from "@core/utils/format-date";
import { TbClockHour4Filled } from "react-icons/tb";

type Data = {
  class_id: number;
  occurrence_date: string;
  localid?: number;
  phone?: string;
};

type AlertMessage = {
  type: "success" | "danger";
  message: string;
};

export default function ClassBook({
  gymId,
  date,
  classVal,
  isOpen,
  setIsOpen,
  onClose,
}: {
  gymId: string;
  date: string;
  classVal: any;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
}) {
  const [localId, setLocalId] = useState("");
  const [bookingType, setBookingType] = useState<"localId" | "phone">("phone");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (alert) {
      timer = setTimeout(() => {
        setAlert(null);
        if (alert.type === "success") {
          setIsOpen(false);
        }
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [alert, setIsOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: Data = {
        class_id: parseInt(classVal.id),
        occurrence_date: date,
      };
      if (bookingType === "localId") {
        payload["localid"] = parseInt(localId);
      } else {
        payload["phone"] = `+91${localId}`;
      }

      await axios
        .post(
          `https://backend.gymforce.in/api/classes/book/?gym_id=${gymId}`,
          payload
        )
        .then(() => {
          setAlert({
            type: "success",
            message: "Class Booked Successfully",
          });
          setIsOpen(false);
          onClose();
        });
    } catch (error: any) {
      console.log(error);
      setAlert({
        type: "danger",
        message: error.response?.data?.error || "Error while Booking",
      });
    }
    setLoading(false);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="z-[9999999]"
      containerClassName="p-4 md:p-6"
    >
      <div className="space-y-4">
        <div className="w-full flex items-center justify-end">
          <XIcon
            className="cursor-pointer text-primary"
            onClick={() => setIsOpen(false)}
          />
        </div>
        <div className="flex flex-col gap-2 mb-2">
          <Title as="h6" className="font-bold">
            {classVal?.title || ""}
          </Title>
          <div className="flex items-center flex-nowrap gap-2">
            <TbClockHour4Filled className="text-blue-500 size-5" />
            <Text className="text-sm text-gray-600">
              {formatDate(
                new Date(`2025-01-01T${classVal?.start_time || ""}`),
                "hh:mm A"
              )}{" "}
              -{" "}
              {formatDate(
                new Date(`2025-01-01T${classVal?.end_time || ""}`),
                "hh:mm A"
              )}
            </Text>
          </div>
        </div>
        <Text>Book Session with Member ID or Phone Number</Text>
        <div className="flex gap-4">
          <Button
            size="sm"
            variant={bookingType === "phone" ? "solid" : "flat"}
            onClick={() => setBookingType("phone")}
          >
            Phone Number
          </Button>
          <Button
            size="sm"
            variant={bookingType === "localId" ? "solid" : "flat"}
            onClick={() => setBookingType("localId")}
          >
            Member ID
          </Button>
        </div>
        <Input
          type="number"
          value={localId}
          onChange={(e) => setLocalId(e.target.value)}
          placeholder={bookingType === "localId" ? "Local ID" : "Phone Number"}
        />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || localId.length === 0}
          >
            Book Class
          </Button>
        </div>
        {alert && (
          <Alert color={alert.type} variant="flat">
            {alert.message}
          </Alert>
        )}
      </div>
    </Drawer>
  );
}
