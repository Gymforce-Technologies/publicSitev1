import { ChevronRight, Edit, Trash2, XIcon } from "lucide-react";
import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Drawer,
  Loader,
  Text,
  Title,
  Tooltip,
} from "rizzui";
import { SeatSection } from "./LibrarySeatSection";

interface SeatGridProps {
  seatSection: SeatSection;
  onEdit: () => void;
  onDelete: () => void;
  reserved: any[];
  currentBatch: any;
}

export default function Seats({
  seatSection,
  onEdit,
  onDelete,
  reserved,
  currentBatch,
}: SeatGridProps) {
  const [viewAllOpen, setViewAllOpen] = useState<boolean>(false);
  // Generate an array of seats from lower_limit to upper_limit
  const seatNumbers = Array.from(
    { length: seatSection.upper_limit - seatSection.lower_limit + 1 },
    (_, i) => seatSection.lower_limit + i
  );

  // Define how many seats to show per row
  const seatsPerRow = 4;

  // Split seats into rows for display
  const rows: number[][] = [];
  for (let i = 0; i < seatNumbers.length; i += seatsPerRow) {
    rows.push(seatNumbers.slice(i, i + seatsPerRow));
  }

  const previewRows = rows.slice(0, 1);

  const isSeatReserved = (seatNumber: number) => {
    if (!currentBatch) return false;

    const seatName = `${seatSection.prefix}-${seatNumber}`;
    return reserved.some(
      (item) => item.seat === seatName && item.batch === currentBatch.value
    );
  };

  // Function to get seat details if reserved
  const getReservedSeatDetails = (seatNumber: number) => {
    if (!currentBatch) return null;

    const seatName = `${seatSection.prefix}-${seatNumber}`;
    return reserved.find(
      (item) => item.seat === seatName && item.batch === currentBatch.value
    );
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center bg-gray-50 p-4 px-6">
          <div className="flex items-center gap-3">
            <Badge
              variant="flat"
              className="bg-primary-lighter text-primary font-semibold max-w-[156px] truncate"
            >
              {seatSection.prefix}
            </Badge>
            <Text className="font-medium">{`Seats ${seatSection.lower_limit} - ${seatSection.upper_limit}`}</Text>
          </div>
          <div className="flex items-center gap-2">
            <ActionIcon variant="outline" size="sm" onClick={onEdit}>
              <Edit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="outline"
              size="sm"
              color="danger"
              onClick={onDelete}
            >
              <Trash2 size={16} />
            </ActionIcon>
          </div>
        </div>

        <div className="p-4">
          {/* Always show first two rows in the card */}
          {previewRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-3 mb-3 justify-center">
              {row.map((seatNumber) => {
                const reserved = isSeatReserved(seatNumber);
                return (
                  <div
                    key={seatNumber}
                    className={`p-1 w-[64px] group h-[56px] border  rounded-md flex items-center justify-center transition-colors  m-1 ${reserved ? " cursor-not-allowed bg-red-500 text-red-600 border-red-400" : " cursor-pointer border-gray-200 hover:scale-105 duration-150 hover:border-primary  "}`}
                  >
                    <Text
                      className={` ${reserved ? " text-gray-50" : " group-hover:text-primary"} text-xs truncate`}
                    >{`${seatSection.prefix}-${seatNumber}`}</Text>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Show view all button if there are more than 2 rows */}
          {rows.length > 1 && (
            <div className="flex justify-center mt-2">
              <Button
                variant="text"
                size="sm"
                onClick={() => setViewAllOpen(true)}
                className="text-primary flex items-center gap-1"
              >
                <span>View All {seatNumbers.length} Seats</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer for showing all seats */}
      <Drawer
        isOpen={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        containerClassName="custom-scrollbar overflow-y-auto"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <Title as="h3" className="text-gray-900">
              {seatSection.prefix} - Seat Map
              <Text as="p" className="mt-1 text-sm text-gray-500">
                Showing all seats from {seatSection.lower_limit} to{" "}
                {seatSection.upper_limit}
              </Text>
            </Title>
            <Button
              variant="text"
              size="sm"
              onClick={() => setViewAllOpen(false)}
              className="hover:scale-110"
            >
              <XIcon />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-y-6 max-h-[calc(100vh-150px)] overflow-auto p-2 custom-scrollbar overflow-y-auto">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex gap-3 justify-start items-center flex-wrap"
              >
                {row.map((seatNumber) => {
                  const reserved = isSeatReserved(seatNumber);
                  const detail = getReservedSeatDetails(seatNumber);
                  return (
                    <Tooltip
                      content={
                        reserved
                          ? `Reserved for ${detail?.member_details?.name}`
                          : ""
                      }
                      color="invert"
                      className={`${reserved ? "" : "hidden"}`}
                      placement="bottom"
                      key={seatNumber}
                    >
                      <div
                        // className={`p-1.5 w-[72px] h-[64px] group border border-gray-200 rounded-md flex items-center justify-center hover:scale-105 duration-150 hover:border-primary transition-colors cursor-pointer m-1`}
                        className={`p-1.5 w-[72px] h-[64px] group border rounded-md flex items-center justify-center transition-colors  m-1 ${reserved ? " cursor-not-allowed bg-red-500  border-red-400 hover:border-red-400" : " cursor-pointer border-gray-200 hover:scale-105 duration-150 hover:border-primary "}`}
                      >
                        <Text
                          className={`font-medium  truncate ${reserved ? " text-gray-900" : " group-hover:text-primary group-hover:pb-1 "}`}
                        >{`${seatSection.prefix}-${seatNumber}`}</Text>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </>
  );
}
