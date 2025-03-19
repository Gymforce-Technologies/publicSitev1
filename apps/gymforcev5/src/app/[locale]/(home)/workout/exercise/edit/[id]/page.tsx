import EditExerciseSection from "@/components/workout/exercise/EditExerciseSection";

export default function EditExerciseSectionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <EditExerciseSection params={params} />
    </>
  );
}
