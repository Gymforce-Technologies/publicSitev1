"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface AttendanceSummary {
  total: number;
  absent: number;
  present: number;
}

interface AttendanceContextType {
  attendanceSummary: AttendanceSummary;
  setAttendanceSummary: React.Dispatch<React.SetStateAction<AttendanceSummary>>;
  update: boolean;
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  // Add new utility functions
  refreshData: () => void;
  resetSummary: () => void;
  updateAttendance: (data: Partial<AttendanceSummary>) => void;
}

const defaultSummary: AttendanceSummary = {
  total: 0,
  absent: 0,
  present: 0,
};

export const AttendanceContext = createContext<
  AttendanceContextType | undefined
>(undefined);

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary>(defaultSummary);
  const [update, setUpdate] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("members");
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDate(new Date())
  );

  // Utility functions
  const refreshData = useCallback(() => {
    setUpdate((prev) => !prev);
  }, []);

  const resetSummary = useCallback(() => {
    setAttendanceSummary(defaultSummary);
  }, []);

  const updateAttendance = useCallback((data: Partial<AttendanceSummary>) => {
    setAttendanceSummary((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  const contextValue = {
    attendanceSummary,
    setAttendanceSummary,
    update,
    setUpdate,
    selected,
    setSelected,
    selectedDate,
    setSelectedDate,
    refreshData,
    resetSummary,
    updateAttendance,
  };

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};

// Optional: Add custom hooks for specific functionality
export const useAttendanceActions = () => {
  const { refreshData, resetSummary, updateAttendance } = useAttendance();
  return { refreshData, resetSummary, updateAttendance };
};

export const useAttendanceDate = () => {
  const { selectedDate, setSelectedDate } = useAttendance();

  const updateDate = useCallback(
    (date: Date) => {
      setSelectedDate(formatDate(date));
    },
    [setSelectedDate]
  );

  return { selectedDate, setSelectedDate, updateDate };
};

export const useAttendanceSelection = () => {
  const { selected, setSelected } = useAttendance();

  const toggleSelection = useCallback(() => {
    setSelected((prev) => (prev === "members" ? "staff" : "members"));
  }, [setSelected]);

  return { selected, setSelected, toggleSelection };
};
