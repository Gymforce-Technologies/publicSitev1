import ClientsSection from "../../../../../../../components/staff/staff_profile/profile/ClientsSection";

export default function StaffClientPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <ClientsSection params={params} />
    </>
  );
}
