import EarningsSection from "../../../../../../../components/staff/staff_profile/profile/EarningsSection";

export default function StaffEarningPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <EarningsSection params={params} />
    </>
  );
}
