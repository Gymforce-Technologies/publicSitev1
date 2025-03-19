import WidgetCard from "@/components/cards/widget-card";
import AdvanceSettingsView from "../../../../../components/centersettings/advance-settings";

export default function SMTPPage() {
  return (
    <WidgetCard
      className="relative dark:bg-inherit "
      headerClassName="items-center"
      title="Email SMTP Settings"
      titleClassName="whitespace-nowrap "
    >
      <div className="mt-6">
        <AdvanceSettingsView />
      </div>
    </WidgetCard>
  );
}
