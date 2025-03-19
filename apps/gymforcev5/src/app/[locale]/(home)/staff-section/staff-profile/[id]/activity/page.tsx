'use client'
import RecentActivities from "../../../../../../../components/staff/staff_profile/profile/Activity";

export default function StaffActivity({ params }: { params: { id: string } }) {
  const newId = (params.id as string).split("-")[1];
  return (
    <div>
      <RecentActivities id={newId} />
    </div>
  );
}
