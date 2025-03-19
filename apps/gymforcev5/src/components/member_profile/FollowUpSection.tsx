"use client";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import { Stepper, Button, Empty, Text, Badge } from "rizzui";
import { useEffect, useState } from "react";
import { AddMemberFollowup } from "@/components/member-list/MemberFollowUp";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import AddFollowupHistory from "@/components/followups/AddHistory";

export default function FollowUpSection({ params }: { params: { id: string } }) {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMemberId, setOpenMemberId] = useState<number | null>(null);
  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const newId = params.id.toString().split("-")[1];
  const getData = async () => {
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `api/member/${newId}/followups/?gym_id=${gymId}`,
        {
          id: newID(`${newId}-followup-${new Date().getTime()}`),
        }
      );
      setFollowUps(resp.data.results);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getData();
    setOpenMemberId(parseInt(newId || "0"));
  }, [newId]);

  return (
    <WidgetCard
      title="Follow-Ups"
      className="relative pt-4 dark:bg-inherit"
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
      titleClassName="whitespace-nowrap mb-4 text-gray-900 "
      action={
        <div className="w-full flex justify-end mb-4">
          <Button
            onClick={() => {
              setOpenMemberId(parseInt(newId || "0"));
              setShowAddFollowup(true);
            }}
            variant="solid"
            className={followUps.length > 0 ? " max-sm:scale-90" : "hidden"}
          >
            Add Follow-Up History
          </Button>
        </div>
      }
    >
      {/* Stepper for Follow-Up History */}
      {followUps.length > 0 ? (
        <Stepper>
          {followUps.map((followUp, index) => (
            <Stepper.Step
              key={followUp.id}
              title={`Follow-Up ${index + 1}`}
              description={
                <div className="px-4 py-2 shadow rounded-xl bg-gray-50 grid md:grid-cols-2 sm:gap-x-10 md:gap-x-16 gap-y-2">
                  <Text className="col-span-full py-1 sm:text-base">
                    Reason : {followUp.purpose}
                  </Text>
                  <Text>
                    Date: {formateDateValue(new Date(followUp.datetime))}
                  </Text>
                  <Text>Contact Type: {followUp.contact_type}</Text>
                  <Text>
                    Status:{" "}
                    <Badge variant="outline" className="ml-1">
                      {followUp.status}
                    </Badge>
                  </Text>
                  <Text>
                    Priority:{" "}
                    <Badge variant="flat" className="ml-1">
                      {followUp.priority}
                    </Badge>
                  </Text>
                  {followUp.next_action && (
                    <p>Next Action: {followUp.next_action}</p>
                  )}
                  {followUp.next_followup_reminder && (
                    <p>
                      Next Followup:{" "}
                      {formateDateValue(
                        new Date(followUp.next_followup_reminder)
                      )}
                    </p>
                  )}
                  <Text>Managed By : {followUp.managed_by?.name}</Text>
                </div>
              }
            />
          ))}
        </Stepper>
      ) : (
        <div className=" min-w-full flex flex-col items-center justify-center my-4 gap-4">
          <Empty text="No Follow-Up History" />
          <AddMemberFollowup memberId={newId} refresh={getData} />
        </div>
      )}

      {openMemberId && showAddFollowup && (
        <AddFollowupHistory
          id={openMemberId}
          setOpenMemberId={setOpenMemberId}
          refreshData={() => {
            invalidateAll();
            getData();
          }}
          prevContactType={followUps[followUps.length - 1]?.contact_type}
          prevStatus={followUps[followUps.length - 1]?.status}
        />
      )}
    </WidgetCard>
  );
}
