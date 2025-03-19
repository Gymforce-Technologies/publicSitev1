import EditWorkoutSection from "@/components/workout/EditWorkoutSection";

export default function EditWorkoutSectionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <EditWorkoutSection params={params} />
    </>
  );
}
