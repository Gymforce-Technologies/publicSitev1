import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { SeatSection } from "@/components/lib-seats/LibrarySeatSection";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Drawer,
  Loader,
  Text,
  Title,
  Tooltip,
  Select,
} from "rizzui";
import { ChevronRight, XIcon } from "lucide-react";

type SelectMemberSeatProps = {
  seat: string;
  membership_id: string;
  batch: string;
  show: boolean;
  onUpdate: () => void;
  onClose: () => void;
  // handleSelect: (seatData: { seat: string; batch_timing: string }) => void;
};

export default function SelectMemberSeat({
  seat,
  membership_id,
  batch,
  show,
  onUpdate,
  onClose,
  // handleSelect,
}: SelectMemberSeatProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [seats, setSeats] = useState<SeatSection[]>([]);
  const [reserved, setReserved] = useState<any[]>([]);
  const [batches, setBatches] = useState<{ label: string; value: string }[]>(
    []
  );
  const [currentBatch, setCurrentBatch] = useState<string>(batch);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (show) {
      fetchSeats();
      fetchBatches();
    }
  }, [show]);

  useEffect(() => {
    if (currentBatch) {
      fetchReserved();
    }
  }, [currentBatch]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(`/api/lf/seats?center=${gymId}`, {
        id: newID("lf-seats"),
      });
      setSeats(resp.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReserved = async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/lf/reserved-seats/?center=${gymId}&batch_timing_id=${currentBatch}`,
        {
          id: newID(`lf-seats-reserved-${currentBatch}`),
        }
      );
      setReserved(
        resp.data.map((item: any) => ({
          seat: item.seat,
          batch: item.batch_timing,
          created: item.created_at,
          member_details: item.member_details,
          membership_id: item.id,
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(`/api/batches/?gym_id=${gymId}`, {
        id: newID("batches"),
      });
      const newBatches = response.data.results.map((group: any) => ({
        label: group.name,
        value: group.id,
      }));
      setBatches(newBatches);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmSeatSelection = async () => {
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.patch(
        `/api/update-membership/v2/${membership_id}/?`,
        {
          seat: selectedSeat,
          batch_timing: currentBatch,
        }
      ).then(() => {
        invalidateAll();
        onUpdate();
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
    // { seat: selectedSeat, batch_timing: currentBatch }
  };

  return (
    <Drawer isOpen={show} onClose={onClose} customSize={500}>
      <div className="p-6 md:px-8">
        <div className="flex items-center justify-between mb-2">
          <Title as="h4" className="text-gray-900">
            Select Seat
          </Title>
          <Button variant="text" size="sm" onClick={onClose}>
            <XIcon />
          </Button>
        </div>

        <div className="mb-4">
          <Text className="font-medium">Select Batch:</Text>
          <Select
            options={batches}
            value={batches.find((batch) => batch.value === currentBatch)?.label}
            onChange={(val: any) => setCurrentBatch(val?.value)}
          />
        </div>

        <div className="flex flex-row items-center gap-4 md:gap-8">
          <div className="mb-2 flex items-center">
            <Text className="font-medium mr-2">Old Seat:</Text>
            <Badge variant="flat" className="bg-primary-lighter text-primary">
              {seat || "None"}
            </Badge>
          </div>
          <div className="mb-2 flex items-center">
            <Text className="font-medium mr-2">Selected Seat:</Text>
            {selectedSeat ? (
              <Badge variant="flat" className="bg-primary-lighter text-primary">
                {selectedSeat || "None"}
              </Badge>
            ) : (
              ""
            )}
          </div>
        </div>
        {loading ? (
          <div className="w-full flex items-center justify-center my-10">
            <Loader variant="spinner" size="xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-4 max-h-[calc(100vh-250px)] overflow-auto p-2 custom-scrollbar">
            {seats.map((seatSection) => (
              <div
                key={seatSection.prefix}
                className="mb-6 flex flex-wrap gap-4"
              >
                {Array.from({
                  length: seatSection.upper_limit - seatSection.lower_limit + 1,
                }).map((_, i) => {
                  const seatNum = `${seatSection.prefix}-${
                    seatSection.lower_limit + i
                  }`;
                  const isReserved = reserved.some(
                    (item) =>
                      item.seat === seatNum && item.batch === currentBatch
                  );
                  const isPrev = reserved.some(
                    (item) =>
                      item?.seat === seatNum &&
                      item?.batch === currentBatch &&
                      item?.membership_id === parseInt(membership_id)
                  );
                  const details = reserved.find(
                    (item) =>
                      item?.seat === seatNum && item?.batch === currentBatch
                  );
                  return (
                    <Tooltip
                      key={seatNum}
                      content={
                        isPrev
                          ? `Reserved by Current Member`
                          : isReserved
                            ? `Reserved by ${details?.member_details?.name || "Other Member"}`
                            : ""
                      }
                      color="invert"
                      className={`${isReserved ? "" : "hidden"}`}
                      placement="bottom"
                    >
                      <div
                        onClick={() => !isReserved && setSelectedSeat(seatNum)}
                        className={`p-1.5 w-[72px] h-[64px] border rounded-md flex items-center justify-center cursor-pointer m-1
                        ${
                          isPrev
                            ? "bg-green-500 text-white cursor-not-allowed"
                            : isReserved
                              ? "bg-red-500 text-white cursor-not-allowed"
                              : selectedSeat === seatNum
                                ? "bg-primary text-white"
                                : "border-gray-200 hover:border-primary hover:scale-105"
                        }
                      `}
                      >
                        <Text>{seatNum}</Text>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={confirmSeatSelection} disabled={!selectedSeat}>
            {isLoading ? <Loader variant="threeDot" /> : "Confirm Seat"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
