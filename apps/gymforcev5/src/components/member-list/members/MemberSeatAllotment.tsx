import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { SeatSection } from "@/components/lib-seats/LibrarySeatSection";
import { useEffect, useState } from "react";
import { Badge, Button, Drawer, Loader, Text, Title, Tooltip } from "rizzui";
import { ChevronRight, XIcon } from "lucide-react";

export default function MemberSeatAllotment({
  seat,
  disable,
  onClose,
  member,
  batch,
  handleSelect,
}: {
  seat: string;
  disable: boolean;
  onClose: () => void;
  member: any;
  batch: { name: any; id: number };
  handleSelect: (seat: string) => void;
}) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [seats, setSeats] = useState<SeatSection[]>([]);
  const [reserved, setReserved] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<{
    prefix: string;
    number: number;
  } | null>(null);

  useEffect(() => {
    if (show) {
      fetchSeats();
    }
  }, [show]);

  useEffect(() => {
    if (batch.id && show) {
      fetchReserved();
    }
  }, [batch.id, show]);

  // Parse the current seat if it exists
  useEffect(() => {
    if (seat) {
      const parts = seat.split("-");
      if (parts.length === 2) {
        setSelectedSeat({
          prefix: parts[0],
          number: parseInt(parts[1]),
        });
      }
    } else {
      setSelectedSeat(null);
    }
  }, [seat]);

  const fetchSeats = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(`/api/lf/seats?center=${gymId}`, {
        id: newID(`lf-seats`),
      });
      setSeats(resp.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReserved = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/lf/reserved-seats/?center=${gymId}&batch_timing_id=${batch.id}`,
        {
          id: newID(`lf-seats-reserved-${batch.id}`),
        }
      );
      setReserved(
        resp.data.map((item: any) => ({
          seat: item.seat,
          batch: item.batch_timing,
          created: item.created_at,
          member_details: item.member_details,
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isSeatReserved = (prefix: string, seatNumber: number) => {
    // if (!currentBatch) return false;

    const seatName = `${prefix}-${seatNumber}`;
    return reserved.some(
      (item) => item.seat === seatName && item.batch === batch.id
    );
  };

  // Function to get seat details if reserved
  const getSeatDetails = (seatNumber: number, prefix: string) => {
    // if (!batch) return null;

    const seatName = `${prefix}-${seatNumber}`;
    return reserved.find(
      (item) => item.seat === seatName && item.batch === batch.id
    );
  };

  const selectSeat = (prefix: string, seatNumber: number) => {
    if (!isSeatReserved(prefix, seatNumber)) {
      setSelectedSeat({ prefix, number: seatNumber });
    }
  };

  const confirmSeatSelection = () => {
    if (selectedSeat) {
      const exactSeatName = `${selectedSeat.prefix}-${selectedSeat.number}`;
      handleSelect(exactSeatName);
      setShow(false);
    }
  };

  const renderSeatGrid = (seatSection: SeatSection, preview = false) => {
    const seatNumbers = Array.from(
      { length: seatSection.upper_limit - seatSection.lower_limit + 1 },
      (_, i) => seatSection.lower_limit + i
    );

    const seatsPerRow = 4;
    const rows: number[][] = [];

    for (let i = 0; i < seatNumbers.length; i += seatsPerRow) {
      rows.push(seatNumbers.slice(i, i + seatsPerRow));
    }

    const rowsToDisplay = preview ? rows.slice(0, 1) : rows;

    return (
      <div key={seatSection.prefix} className="mb-6">
        <Text className="font-semibold text-lg mb-3">
          {seatSection.prefix} - Seats
        </Text>

        {rowsToDisplay.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-wrap gap-4 mb-3 justify-evenly"
          >
            {row.map((seatNumber) => {
              const isReserved = isSeatReserved(seatSection.prefix, seatNumber);
              const isSelected =
                selectedSeat?.prefix === seatSection.prefix &&
                selectedSeat?.number === seatNumber;
              const details = getSeatDetails(seatNumber, seatSection.prefix);

              return (
                <Tooltip
                  key={seatNumber}
                  content={
                    isReserved
                      ? `Reserved by ${details?.member_details?.name || "another member"}`
                      : ""
                  }
                  color="invert"
                  className={`${isReserved ? "" : "hidden"}`}
                  placement="bottom"
                >
                  <div
                    onClick={() => selectSeat(seatSection.prefix, seatNumber)}
                    className={`p-1.5 w-[72px] h-[64px] border rounded-md flex items-center justify-center cursor-pointer m-1 group
                      ${
                        isReserved
                          ? "bg-red-500 text-white cursor-not-allowed border-red-400"
                          : isSelected
                            ? "bg-primary text-white border-primary"
                            : "border-gray-200 hover:border-primary hover:scale-105 duration-150"
                      }`}
                  >
                    <Text
                      className={`font-medium truncate ${isReserved ? "text-gray-50" : isSelected ? "text-white" : "group-hover:text-primary"}`}
                    >
                      {`${seatSection.prefix}-${seatNumber}`}
                    </Text>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        ))}

        {preview && rows.length > 1 && (
          <div className="flex justify-center mt-2">
            <Button
              variant="text"
              size="sm"
              onClick={() => setShow(true)}
              className="text-primary flex items-center gap-1"
            >
              <span>View All {seatNumbers.length} Seats</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {seat && seat.length > 0 ? (
          <>
            <div className="flex gap-1 items-center">
              <Title as="h6" className="font-normal">
                Selected Seat:{" "}
              </Title>
              <Badge variant="flat" className="text-primary bg-primary-lighter">
                {seat}
              </Badge>
            </div>
            <Button
              onClick={() => {
                setShow(true);
              }}
              className="max-w-60"
              variant="outline"
            >
              Change Seat
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              setShow(true);
            }}
            disabled={disable}
            variant="solid"
            className="max-w-60"
          >
            Allot Seat
          </Button>
        )}
      </div>

      <Drawer
        isOpen={show}
        onClose={() => {
          setShow(false);
          onClose();
        }}
        // size="lg"
        customSize={500}
        containerClassName="custom-scrollbar overflow-y-auto"
      >
        <div className="p-6 md:px-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Title as="h4" className="text-gray-900">
                Seat Allotment for {member}
                <Text as="p" className="mt-1 text-sm text-gray-500">
                  Batch: {batch.name}
                </Text>
              </Title>
            </div>
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                setShow(false);
                onClose();
              }}
              className="hover:scale-110"
            >
              <XIcon />
            </Button>
          </div>

          <div className="mb-2 flex items-center">
            <Text className="font-medium mr-2">Selected Seat:</Text>
            <Badge
              variant="flat"
              className={
                selectedSeat ? "bg-primary-lighter text-primary" : "bg-gray-100"
              }
            >
              {selectedSeat
                ? `${selectedSeat.prefix}-${selectedSeat.number}`
                : "None"}
            </Badge>
          </div>

          {loading ? (
            <div className="w-full flex items-center justify-center my-10">
              <Loader variant="spinner" size="xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-4 max-h-[calc(100vh-200px)] overflow-auto p-2 custom-scrollbar">
              {seats.map((seatSection) => renderSeatGrid(seatSection))}
            </div>
          )}

          <div className="mt-3 flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShow(false);
                onClose();
              }}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSeatSelection}
              disabled={!selectedSeat}
              variant="solid"
            >
              Confirm Seat Selection
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
