import { AxiosPrivate, newID } from "./AxiosPrivate";
import { retrieveGymId } from "./InfoCookies";

export const Options = [
  "DD-MM-YYYY", // e.g., "20 03 2024"
  "DD-MMM-YYYY", // e.g., "20 Mar 2024"
  "MMM-DD-YYYY", // e.g., "Mar 20 2024"
  "MM-DD-YYYY", // e.g., "03 20 2024"
  "YYYY-MM-DD", // e.g., "2024 03 20"
];

export const TimeOptions = [
  "hh:mm A", // 12-hour format with AM/PM (e.g., "03:30 PM")
  "HH:mm", // 24-hour format (e.g., "15:30")
  "hh:mm:ss A", // 12-hour format with seconds (e.g., "03:30:45 PM")
  "HH:mm:ss", // 24-hour format with seconds (e.g., "15:30:45")
];

export const timzoneOptions = Intl.supportedValuesOf("timeZone");

export const formateDateValue = (date: Date, option?: string) => {
  const timeZone = localStorage.getItem("timeZone") || "UTC";
  // console.log(date);
  const formatParts = option ? option.split("-") : getDateFormat().split("-");
  let dateFormatOptions: Intl.DateTimeFormatOptions = {
    timeZone: timeZone,
  };

  formatParts.forEach((part) => {
    switch (part) {
      case "DD":
        dateFormatOptions.day = "2-digit";
        break;
      case "MM":
        dateFormatOptions.month = "2-digit";
        break;
      case "MMM":
        dateFormatOptions.month = "short";
        break;
      case "YYYY":
        dateFormatOptions.year = "numeric";
        break;
    }
  });

  const format = new Intl.DateTimeFormat("en", dateFormatOptions);

  const dateParts = format.formatToParts(date);

  let formattedDate = option || getDateFormat();
  for (const part of dateParts) {
    switch (part.type) {
      case "day":
        formattedDate = formattedDate.replace("DD", part.value);
        break;
      case "month":
        formattedDate = formattedDate.replace(
          formattedDate.includes("MMM") ? "MMM" : "MM",
          part.value
        );
        break;
      case "year":
        formattedDate = formattedDate.replace("YYYY", part.value);
        break;
    }
  }

  return formattedDate;
};

// Function to format time
export const formatTimeValue = (
  date: Date | string,
  option: string = TimeOptions[0]
) => {
  const timeZone = localStorage.getItem("timeZone") || "";
  const dateObj = typeof date === "string" ? new Date(date) : date;

  let timeFormatOptions: Intl.DateTimeFormatOptions = {
    timeZone: timeZone,
    hour12: option.includes("A"),
  };

  // Set format options based on the selected format
  if (option.includes("hh") || option.includes("HH")) {
    timeFormatOptions.hour = "2-digit";
  }
  if (option.includes("mm")) {
    timeFormatOptions.minute = "2-digit";
  }
  if (option.includes("ss")) {
    timeFormatOptions.second = "2-digit";
  }

  const formatter = new Intl.DateTimeFormat("en", timeFormatOptions);
  const timeParts = formatter.formatToParts(dateObj);

  let formattedTime = "";
  const hours = timeParts.find((part) => part.type === "hour")?.value || "00";
  const minutes =
    timeParts.find((part) => part.type === "minute")?.value || "00";
  const seconds =
    timeParts.find((part) => part.type === "second")?.value || "00";
  const dayPeriod =
    timeParts.find((part) => part.type === "dayPeriod")?.value || "";

  switch (option) {
    case "hh:mm A":
      formattedTime = `${hours}:${minutes} ${dayPeriod}`;
      break;
    case "HH:mm":
      formattedTime = `${hours}:${minutes}`;
      break;
    case "hh:mm:ss A":
      formattedTime = `${hours}:${minutes}:${seconds} ${dayPeriod}`;
      break;
    case "HH:mm:ss":
      formattedTime = `${hours}:${minutes}:${seconds}`;
      break;
    default:
      formattedTime = `${hours}:${minutes}`;
  }

  return formattedTime;
};

export const getTimeZoneVal = async () => {
  const response = await AxiosPrivate.get("/api/profile", {
    id: newID("user-profile"),
    cache: {
      ttl: 60 * 60 * 1000,
    },
  });
  const gymId = await retrieveGymId();
  const timeZone = response.data.associated_gyms.find(
    (gym: any) => gym.gym_id.toString() === gymId
  ).timezone;
  if (timeZone) {
    localStorage.setItem("timeZone", timeZone);
  }
  if (!timeZone) {
    localStorage.setItem(
      "timeZone",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  return timeZone;
};

export const getDateFormat = () => {
  const format = localStorage.getItem("dateFormat");
  if (format) {
    return format;
  }
  // console.log("Setting default date format");
  localStorage.setItem("dateFormat", Options[0]);
  return Options[0];
};

export const setDateFormate = (format: string) => {
  localStorage.setItem("dateFormat", format);
};

export const setTimeZoneVal = (timeZone: string) => {
  localStorage.setItem("timeZone", timeZone);
};
