'use client'
import { useEffect, useState } from "react";
import Attachments from "../../../../../../../components/staff/staff_profile/profile/Attachments";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";

export default function StaffAttachments({
  params,
}: {
  params: { id: string };
}) {
  const newId = (params.id as string).split("-")[1];
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const getStatus = async () => {
      checkUserAccess().then((status) => {
        console.log(status);
        if (status !== "Restricted") {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      });
    };
    getStatus();
  }, []);
  return (
    <div>
      <Attachments id={newId} isValid={isValid} />
    </div>
  );
}
