import ModalButton from "@/app/shared/modal-button";
// import { eventData } from '@/data/event-data';
// import EventForm from "@/components/booking/event-form";
import EventBookingView from "@/components/booking";
import WidgetCard from "@core/components/cards/widget-card";
import dynamic from "next/dynamic";
const EventForm = dynamic(() => import("@/components/booking/event-form"));
export default function EventCalendarPage() {
  return (
    <WidgetCard
      className="relative"
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
      title="Session's"
      titleClassName="whitespace-nowrap "
    >
      <div className=" flex items-centern justify-end gap-3 @lg:mt-0 my-2">
        <ModalButton
          label="Create Class"
          view={<EventForm />}
          customSize="650px"
          className="mt-0 max-w-40 @lg:w-auto"
        />
      </div>
      <EventBookingView />
    </WidgetCard>
  );
}
