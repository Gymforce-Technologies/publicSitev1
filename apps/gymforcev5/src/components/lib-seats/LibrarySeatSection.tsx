"use client";

import {
  AxiosPrivate,
  newID,
  invalidateAll,
} from "@/app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@core/components/cards/widget-card";
import { useEffect, useState } from "react";
import { Button, Loader, Select, Text } from "rizzui";
import Seats from "./Seats";
import dynamic from "next/dynamic";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { BsArrowRight } from "react-icons/bs";
import DateCell from "@core/ui/date-cell";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { isStaff } from "@/app/[locale]/auth/Staff";
const AddSeats = dynamic(() => import("./AddSeats"), {
  ssr: false,
});
const EditSeats = dynamic(() => import("./EditSeats"), {
  ssr: false,
});
export interface SeatSection {
  id: number;
  prefix: string;
  lower_limit: number;
  upper_limit: number;
  center: number;
}

export interface SeatFormData {
  prefix: string;
  lower_limit: string;
  upper_limit: string;
  center: number;
}

interface Option {
  label: string;
  value: number;
}

export default function LibrarySeatSection() {
  const [loading, setLoading] = useState<boolean>(false);
  const [seats, setSeats] = useState<SeatSection[]>([]);
  const [reserved, setReserved] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatSection | null>(null);
  const [addSeat, setAddSeat] = useState<boolean>(false);
  const [editSeat, setEditSeat] = useState<boolean>(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [currentBatch, setCurrentBatch] = useState<any | null>(null);
  const router = useRouter();
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);
  const fetchSeats = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(`/api/lf/seats?center=${gymId}`, {
        id: newID(`lf-seats`),
      });
      console.log(resp.data);
      setSeats(resp.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReserved = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/lf/reserved-seats/?center=${gymId}&batch_timing_id=${currentBatch?.value}`,
        {
          id: newID(`lf-seats-reserved-${currentBatch?.value}`),
        }
      );
      console.log(resp.data);
      setReserved(
        resp.data.map((item: any) => ({
          seat: item.seat,
          batch: item.batch_timing,
          created: item.created_at,
          member_details: item.member_details,
        }))
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchBatches = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(`/api/batches/?gym_id=${gymId}`, {
        id: newID(`batches`),
      });
      console.log(response.data);
      const newBatches = response.data.results.map(
        (group: any, index: number) => {
          return {
            label: group.name,
            value: group.id,
            capacity: group.capacity,
            live_member_count: group.live_member_count,
            start_time: group.start_time,
            end_time: group.end_time,
          };
        }
      );
      setBatches(newBatches);
      setCurrentBatch(newBatches[0]);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    // fetchReserved();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (currentBatch !== null) {
      console.log(currentBatch);
      fetchReserved();
    }
  }, [currentBatch]);

  const handleDeleteSeat = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`/api/lf/seats/${id}/?center=${gymId}`);
      invalidateAll();
      await fetchSeats();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const getStatus = async () => {
      try {
        const resp = await isStaff();
        if (resp) {
          setAuth(!resp);
          await fetchPermissions();
        }
      } catch (error) {
        console.error("Error getting staff status:", error);
      }
    };
    getStatus();
  }, []);
  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["mainBookingManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };
  function renderEmptyBatch() {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between mx-2"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-nowrap">No Batches Found</Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Batches Section");
            router.push("/batches");
          }}
          className="text-primary text-sm text-nowrap"
        >
          Add Batches <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  const checkBatches = (batch_id: string | number) => {
    const numericBatchId = Number(batch_id);

    const batch = batches.find((group) => group.value === numericBatchId);

    if (batch) {
      const currentCount = parseInt(
        batch.live_member_count.split("|")[0].trim()
      );

      if (currentCount === batch.capacity) {
        toast.success(
          "On Adding this Member, the capacity will be Increased to " +
            (batch.capacity + 1)
        );
      }
    }
  };

  function renderOptionDisplayBatch(option: any) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex flex-col w-full gap-0.5 pl-4">
          <div className="flex items-center gap-4 text-[13px]">
            <div>
              <Text as="span" className="font-medium">
                Total Capacity :{" "}
              </Text>{" "}
              {option.capacity}{" "}
            </div>
            <div>
              <Text as="span" className="font-medium">
                Members :{" "}
              </Text>{" "}
              {option.live_member_count?.split("|")[0]}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <div className="flex items-center gap-1 text-[13px]">
              <Text className="font-medium">Time :</Text>
              <Text>
                {option?.start_time ? (
                  <DateCell
                    date={new Date(`2025-01-01T${option.start_time}`)}
                    dateClassName="hidden"
                    timeFormat="h:mm A"
                  />
                ) : (
                  "N/A"
                )}
              </Text>
              <ArrowRight size={16} />
              <Text>
                {option?.end_time ? (
                  <DateCell
                    date={new Date(`2025-01-01T${option.end_time}`)}
                    dateClassName="hidden"
                    timeFormat="h:mm A"
                  />
                ) : (
                  "N/A"
                )}
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WidgetCard
      title="Seat Allocations"
      className="relative"
      headerClassName="mb-6"
      action={
        <div className="w-full flex justify-end items-end gap-2">
          <Select
            label={`Batch `}
            name="batch_id"
            options={
              batches.length ? batches : [{ label: "Empty", value: "empty" }]
            }
            value={
              batches.find((group) => group.value === currentBatch?.value)
                ?.label || ""
            }
            onChange={(option: Option | null) => {
              // checkBatches(option?.value.toString() || "");
              // handleSelectChange("batch_id", option);
              setCurrentBatch(option);
            }}
            getOptionDisplayValue={(option) =>
              batches.length
                ? renderOptionDisplayBatch(option)
                : renderEmptyBatch()
            }
            clearable
            onClear={() => setCurrentBatch(null)}
            className="min-w-72"
          />
          <Button
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              setAddSeat(true);
            }}
            className="text-nowrap"
          >
            Add Seats
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="w-full flex items-center justify-center my-6">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {seats.length === 0 ? (
            <div className="text-center py-8 col-span-full">
              <Text className="text-gray-500">
                No seats found. Add some seats to get started.
              </Text>
            </div>
          ) : (
            seats.map((seatSection) => (
              <Seats
                key={seatSection.id}
                seatSection={seatSection}
                onEdit={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  setSelectedSeat(seatSection);
                  setEditSeat(true);
                }}
                reserved={reserved}
                currentBatch={currentBatch}
                onDelete={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  handleDeleteSeat(seatSection.id);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Add Seat Drawer */}
      {addSeat && (
        <AddSeats
          isOpen={addSeat}
          onClose={() => setAddSeat(false)}
          fetchSeats={fetchSeats}
        />
      )}

      {/* Edit Seat Drawer */}
      {editSeat && selectedSeat && (
        <EditSeats
          isOpen={editSeat}
          onClose={() => {
            setEditSeat(false);
            setSelectedSeat(null);
          }}
          seat={selectedSeat}
          fetchSeats={fetchSeats}
        />
      )}
    </WidgetCard>
  );
}
