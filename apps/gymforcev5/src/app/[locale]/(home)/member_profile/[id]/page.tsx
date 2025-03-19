import MemberProfileSection from "../../../../../components/member_profile/MemberProfileSection";

export default function MemberMemberProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return <MemberProfileSection params={params} />;
}
