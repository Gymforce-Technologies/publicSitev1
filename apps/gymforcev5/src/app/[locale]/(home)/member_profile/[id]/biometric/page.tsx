import BioMetricSection from "../../../../../../components/biometric/BioMetricSection";

interface BioMetricPageProps {
  params: {
    id: string;
  };
}
export default function BioMetricPage({ params }: BioMetricPageProps) {
  return (
    <>
      <BioMetricSection params={params} />
    </>
  );
}
