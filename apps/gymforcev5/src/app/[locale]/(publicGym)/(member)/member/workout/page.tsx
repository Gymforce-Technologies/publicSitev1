import PublicMemberWorkoutSection from "../../../../../../components/publicGym/PublicMemberWorkoutSection";

export default function MemberWorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  return <PublicMemberWorkoutSection params={params} />;
}
