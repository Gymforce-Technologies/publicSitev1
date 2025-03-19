"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CalendarEvent } from "@/types";
import dayjs from "dayjs";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
// import EventForm from "./event-form";
// import DetailsEvents from "./details-event";
import { useModal } from "@/app/shared/modal-views/use-modal";
// import useEventCalendar from "@core/hooks/use-event-calendar";
import cn from "@core/utils/class-names";
import { useColorPresetName } from "@/layouts/settings/use-theme-color";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { uniqueId } from "lodash";
import generateWeeklyEvents from "./generateWeekDays";
import dynamic from "next/dynamic";
// import DetailsEvents from "./details-event";
const DetailsEvents = dynamic(() => import("./details-event"));

const EventForm = dynamic(() => import("./event-form"));

const localizer = dayjsLocalizer(dayjs);

const calendarToolbarClassName =
  "[&_.rbc-toolbar_.rbc-toolbar-label]:whitespace-nowrap [&_.rbc-toolbar_.rbc-toolbar-label]:my-2 [&_.rbc-toolbar]:flex [&_.rbc-toolbar]:flex-col [&_.rbc-toolbar]:items-center @[56rem]:[&_.rbc-toolbar]:flex-row [&_.rbc-btn-group_button:hover]:bg-gray-300 [&_.rbc-btn-group_button]:duration-200 [&_.rbc-btn-group_button.rbc-active:hover]:bg-gray-600 dark:[&_.rbc-btn-group_button.rbc-active:hover]:bg-gray-300 [&_.rbc-btn-group_button.rbc-active:hover]:text-gray-50 dark:[&_.rbc-btn-group_button.rbc-active:hover]:text-gray-900 [@media(max-width:375px)]:[&_.rbc-btn-group:last-child_button]:!px-2.5 [&_.rbc-toolbar_>_*:last-child_>_button:focus]:!bg-primary [&_.rbc-toolbar_>_*:last-child_>_button:focus]:!text-gray-0 dark:[&_.rbc-toolbar_>_*:last-child_>_button:focus]:!text-gray-900 [&_.rbc-toolbar_>_*:last-child_>_button:hover]:!text-gray-900 dark:[&_.rbc-toolbar_>_*:last-child_>_button:hover]:!bg-gray-300 [&_.rbc-toolbar_>_*:last-child_>_button:hover]:!bg-gray-300 [&_.rbc-toolbar_>_*:last-child_>_button.rbc-active:hover]:!bg-primary-dark [&_.rbc-toolbar_>_*:last-child_>_button.rbc-active:hover]:!text-gray-0 dark:[&_.rbc-toolbar_>_*:last-child_>_button.rbc-active:hover]:!text-gray-900";

const rtcEventClassName =
  "[&_.rbc-event]:!text-gray-0 dark:[&_.rbc-event]:!text-gray-0 dark:[&_.rbc-toolbar_>_*:last-child_>_button.rbc-active:hover]:!text-gray-0 dark:[&_.rbc-toolbar_>_*:last-child_>_button.rbc-active:focus]:!text-gray-0";

export default function EventBookingView() {
  // const events =
  const { openModal } = useModal();
  const { colorPresetName } = useColorPresetName();
  const [date, setDate] = useState(new Date()); // Add date state
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [fullData, setFullData] = useState<any[]>([]);
  const fetchEvents = async (date: Date) => {
    try {
      const gymId = await retrieveGymId();
      const monthEnd = dayjs(date).endOf("month").format("YYYY-MM-DD");
      const resp = await AxiosPrivate.get(
        `api/classes/available/v2/?gym_id=${gymId}&end_date=${monthEnd}`,
        {
          id: newID(`classes-${monthEnd}`),
        }
      );

      setEvents([]);
      setFullData(resp.data);
      resp.data.forEach((event: any) => {
        if (event.recurrence_type === "daily") {
          setEvents((prevEvents) => [
            ...prevEvents,
            {
              id: event.id,
              start: new Date(event.event_start_date),
              end: new Date(event.event_end_date),
              allDay: true,
              title: event.title,
              description: event.description,
            },
          ]);
        }
      });

      // Process weekly events
      resp.data.forEach((event: any) => {
        if (event.recurrence_type === "weekly") {
          const weeklyEvent = {
            id: event.id,
            start: new Date(event.event_start_date),
            end: new Date(event.event_end_date),
            allDay: false,
            title: event.title,
            description: event.description,
            weekdays: event.weekdays,
          };
          setEvents((prevEvents) => [
            ...prevEvents,
            ...generateWeeklyEvents(weeklyEvent),
          ]);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      openModal({
        view: (
          <EventForm
            startDate={start}
            endDate={end}
            onSuccess={async () => {
              await fetchEvents(date);
            }}
          />
        ),
        customSize: "650px",
      });
    },
    [openModal]
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent, e: React.SyntheticEvent) => {
      // Get the clicked date from the event target
      const clickedDate = (e.target as HTMLElement)
        .closest(".rbc-event")
        ?.getAttribute("data-date")
        ? new Date(
            (e.target as HTMLElement)
              .closest(".rbc-event")
              ?.getAttribute("data-date") as string
          )
        : event.start;

      openModal({
        view: (
          <DetailsEvents
            event={
              event.allDay
                ? fullData.find(
                    (data) => parseInt(data.id) === parseInt(event.id || "")
                  )
                : fullData.find(
                    (data) =>
                      parseInt(data.id) ===
                      parseInt(event?.id?.split("-")[0] || "")
                  )
            }
            onSuccess={async () => {
              fetchEvents(date);
            }}
            key={uniqueId()}
            date={clickedDate}
          />
        ),
        customSize: "500px",
      });
    },
    [openModal]
  );

  const { views, scrollToTime, formats } = useMemo(
    () => ({
      views: {
        month: true,
        // week: true,
        // day: true,
        // agenda: true,
      },
      scrollToTime: new Date(2023, 10, 27, 6),
      formats: {
        dateFormat: "D",
        weekdayFormat: (date: Date, culture: any, localizer: any) =>
          localizer.format(date, "ddd", culture),
        dayFormat: (date: Date, culture: any, localizer: any) =>
          localizer.format(date, "ddd M/D", culture),
        timeGutterFormat: (date: Date, culture: any, localizer: any) =>
          localizer.format(date, "hh A", culture),
      },
    }),
    []
  );

  useEffect(() => {
    fetchEvents(date);
  }, [date]);

  return (
    <div className="@container">
      <Calendar
        localizer={localizer}
        events={events}
        views={views}
        formats={formats}
        date={date} // Add current date
        onNavigate={(newDate) => {
          setDate(newDate);
          // fetchEvents(newDate);
        }}
        startAccessor="start"
        endAccessor="end"
        dayLayoutAlgorithm="no-overlap"
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        scrollToTime={scrollToTime}
        className={cn(
          "h-[650px] md:h-[1000px]",
          calendarToolbarClassName,
          colorPresetName === "black" && rtcEventClassName
        )}
      />
    </div>
  );
}
