import OrderSection from "../../../../../../components/member_profile/OrderSection";

export default function MemberOrderPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrderSection params={params} />;
}
