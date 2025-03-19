import WidgetCard from "@/components/cards/widget-card";
import MeasurementConfig from "@/components/measurement/MeasurementSection";
// import MeasurementConfig from "./MeasurementSection";
export default function MeasurementConfigPage() {
  return (
    <WidgetCard title="Measurement Configuration" className="relative">
      <MeasurementConfig />
    </WidgetCard>
  );
}
