const PAGE_SIZE_KEY = "pageSizeInfo";
export type PageSize = 5 | 10 | 15 | 20 | 25;
const isBrowser = (): boolean => typeof window !== "undefined";

export function setPageSize(size: number) {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Page size not set.");
    return;
  }

  try {
    localStorage.setItem(PAGE_SIZE_KEY, size.toString());
  } catch (error) {
    console.error("Error setting page size:", error);
    throw new Error("Failed to set page size");
  }
}

export function getPageSize() {
  if (!isBrowser()) {
    console.error("Error: Not in browser environment. Cannot get page size.");
    return "error";
  }

  try {
    const storedSize = localStorage.getItem(PAGE_SIZE_KEY);
    if (!storedSize) {
      setPageSize(10); // Default page size
      return "10";
    }
    return storedSize;
  } catch (error) {
    console.log("Error getting page size:", error);
    return "error";
  }
}

export const pageSizeOptions = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "15", value: 15 },
  { label: "20", value: 20 },
  { label: "25", value: 25 },
];
