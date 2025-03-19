"use client";
import Attendance from "../../../../../../../components/staff/staff_profile/profile/Attendance";

export default function StaffAttendance({
  params,
}: {
  params: { id: string };
}) {
  const newId = (params.id as string).split("-")[1];

  return (
    <div>
      <Attendance id={newId} />
    </div>
  );
}
