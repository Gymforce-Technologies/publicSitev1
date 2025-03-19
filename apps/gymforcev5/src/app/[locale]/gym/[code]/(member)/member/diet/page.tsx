import PublicMemberDietSection from "../../../../../../../components/publicGym/PublicMemberDietSection";

export default function MemberDietPage({ params }: { params: { id: string } }) {
  return <PublicMemberDietSection params={params} />;
}
