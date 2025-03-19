import PointsSection from "../../../../../../components/member_profile/PointsSection";

export default function MemberPointsPage({
  params,
}: {
  params: { id: string };
}) {
  return <PointsSection params={params} />;
}
