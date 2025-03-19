import EditRecipe from "@/components/diet-management/recipe/EditRecepieSection";

export default function EditRecepiePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <EditRecipe params={{ id: params.id }} />
    </>
  );
}
