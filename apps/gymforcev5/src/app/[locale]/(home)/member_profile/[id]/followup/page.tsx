import FollowUpSection from "../../../../../../components/member_profile/FollowUpSection";

export default function MemberFollowUpPage({
  params,
}: {
  params: { id: string };
}) {
  return <FollowUpSection params={params} />;
}
