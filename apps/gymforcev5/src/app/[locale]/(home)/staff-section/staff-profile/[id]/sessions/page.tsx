import SessionSection from "../../../../../../../components/staff/staff_profile/profile/SessionSection";

export default function StaffSessionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <SessionSection params={params} />
    </>
  );
}
