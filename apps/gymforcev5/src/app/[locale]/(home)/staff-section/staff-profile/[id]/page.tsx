// import StaffProfileSection from "./StaffProfileSection";

import StaffProfileSection from "../../../../../../components/staff/staff_profile/profile/StaffProfileSection";

export default function StaffProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return <StaffProfileSection params={params} />;
}
