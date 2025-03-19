import React, { useEffect, useState } from "react";
import {
  Stepper,
  Button,
  Drawer,
  Text,
  Badge,
  Empty,
  Loader,
  Title,
} from "rizzui";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  formateDateValue,
  formatTimeValue,
} from "@/app/[locale]/auth/DateFormat";
import { XIcon } from "lucide-react";

interface HistoryItem {
  id: number;
  comment: string;
  contact_type: string;
  datetime: string;
  outcome: string;
  status: string;
  next_action?: string;
  next_followup_reminder?: string;
}

export default function ViewHistory({
  id,
  refreshData,
  setOpenMemberId,
}: {
  id: number | null;
  setOpenMemberId: React.Dispatch<React.SetStateAction<number | null>>;
  refreshData: () => void;
}) {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getVersionHistory = async () => {
      setLoading(true);
      const gymId = retrieveGymId();
      try {
        const response = await AxiosPrivate.get(
          `/api/followups/${id}/details/?gymId=${gymId}`,
          {
            id: newID(`member-followup-history-${id}`),
          }
        );
        setData(response.data.history);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching history:", error);
        setLoading(false);
      }
    };

    if (id) {
      getVersionHistory();
    }
  }, [id]);

  return (
    <Drawer
      isOpen={id !== null}
      onClose={() => {
        setOpenMemberId(null);
      }}
      containerClassName="p-4 md:p-8"
    >
      <div className="flex items-center my-2 sm:my-3 justify-between min-w-full">
        <Title as="h4" className="">
          Follow Up History
        </Title>
        <XIcon onClick={() => setOpenMemberId(null)} />
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-w-full my-4">
          <Loader size="lg" variant="spinner" />
        </div>
      ) : data.length > 0 ? (
        <Stepper direction="vertical">
          {data.map((item, index) => (
            <Stepper.Step
              key={item.id}
              title={`${item.contact_type} - ${item.outcome}`}
              description={
                <div className="space-y-2 bg-gray-50 shadow m-2 p-4 rounded">
                  <Text className="font-semibold">{item.comment}</Text>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <Text>
                        Date: {formateDateValue(new Date(item.datetime))}
                      </Text>
                      <Text>
                        Time: {formatTimeValue(new Date(item.datetime))}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Text>Status :</Text>
                      <Badge variant="flat">{item.status}</Badge>
                    </div>
                    {item.next_action && <p>Next Action: {item.next_action}</p>}
                    {item.next_followup_reminder && (
                      <p>
                        Next Followup:{" "}
                        {formateDateValue(
                          new Date(item.next_followup_reminder)
                        )}
                      </p>
                    )}
                  </div>
                </div>
              }
            />
          ))}
        </Stepper>
      ) : (
        <div className="flex items-center justify-center min-w-full my-4">
          <Empty
            text="No History"
            // description="No history found for this member."
          />
        </div>
      )}
    </Drawer>
  );
}
