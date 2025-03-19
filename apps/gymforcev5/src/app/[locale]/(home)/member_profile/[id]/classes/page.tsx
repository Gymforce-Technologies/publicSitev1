import MemberClassSection from "../../../../../../components/member_profile/MemberClassSection";

export default function MemberClassPage({
  params,
}: {
  params: { id: string };
}) {
  return <MemberClassSection params={params} />;
}
