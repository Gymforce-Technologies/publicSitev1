import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { uniqueId } from "lodash";

dayjs.extend(isBetween);

interface BaseEvent {
  id: string;
  start: Date;
  end: Date;
  allDay: boolean;
  title: string;
  description: string;
}

// interface SingleEvent extends BaseEvent {
//   allDay: true;
// }

interface RecurringEvent extends BaseEvent {
  allDay: boolean;
  weekdays: string[];
}

export default function generateWeeklyEvents(
  event: RecurringEvent
): BaseEvent[] {
  const events: BaseEvent[] = [];
  const startDate = dayjs(event.start);
  const endDate = dayjs(event.end);
  const weekdays = event.weekdays.map((day) => day.toLowerCase());
  let value = 1;
  let currentDate = startDate;

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
    const currentWeekday = currentDate.format("dddd").toLowerCase();

    if (weekdays.includes(currentWeekday)) {
      events.push({
        id: `${event.id}-week${value}`,
        start: currentDate.toDate(),
        end: currentDate.toDate(),
        allDay: false,
        title: event.title,
        description: event.description,
      });
    } else {
      value++;
    }

    currentDate = currentDate.add(1, "day");
  }

  return events;
}

// // Example usage
// const singleEvent: SingleEvent = {
//   id: uniqueId(),
//   start: new Date(),
//   end: new Date("2025-01-30"),
//   allDay: true,
//   title: "Meeting with Paige",
//   description: "About Planning",
// };

// const recurringEvent: RecurringEvent = {
//   id: uniqueId(),
//   start: new Date(),
//   end: new Date("2025-01-30"),
//   allDay: false,
//   title: "Meeting with John",
//   description: "About Planning",
//   weekdays: ["Monday", "Friday", "Saturday"],
// };

// const generatedEvents = generateWeeklyEvents(recurringEvent);
