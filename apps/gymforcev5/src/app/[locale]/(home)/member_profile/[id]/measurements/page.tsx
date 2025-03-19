import MeasurementSection from "../../../../../../components/member_profile/MeasurementSection";

export default function MemberMeasurementPage({
  params,
}: {
  params: { id: string };
}) {
  return <MeasurementSection params={params} />;
}
