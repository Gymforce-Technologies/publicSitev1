import WorkoutSection from "../../../../../../components/member_profile/WorkoutSection";

export default function MemberWorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  return <WorkoutSection params={params} />;
}
