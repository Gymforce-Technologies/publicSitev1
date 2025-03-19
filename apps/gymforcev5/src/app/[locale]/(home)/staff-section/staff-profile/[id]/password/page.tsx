import PasswordSection from "../../../../../../../components/staff/staff_profile/profile/PasswordSection";

export default function StaffPasswordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <PasswordSection params={params} />
    </>
  );
}
