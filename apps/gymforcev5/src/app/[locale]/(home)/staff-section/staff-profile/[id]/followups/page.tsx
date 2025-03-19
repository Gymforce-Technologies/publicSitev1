import FollowUpSection from "../../../../../../../components/staff/staff_profile/profile/FollowUpSection";

export default function StaffFollowUpPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <FollowUpSection params={params} />
    </>
  );
}
