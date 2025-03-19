import DietSection from "../../../../../../components/member_profile/DietSection";

export default function MemberDietPage({ params }: { params: { id: string } }) {
  return <DietSection params={params} />;
}
