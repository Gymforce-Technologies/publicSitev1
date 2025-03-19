"use client";
import React from "react";
import { Title } from "rizzui";
import { AttendanceProvider } from "./AttandanceContext";
import AttendanceHeader from "./header";
import TableHeader from "./TableHeader";
import AttendanceTable from "./AttendenceTable";

const AttendanceSection = () => {
  return (
    <AttendanceProvider>
      <div className="relative">
        <div className="w-[100%] bg-primary rounded">
          <Title as="h4" className="pt-5 pb-5 pl-3 text-white/95">
            Attendance
          </Title>
        </div>
        <div className=" w-[100%] flex flex-col gap-5">
          <div>
            <AttendanceHeader />
          </div>
          <div className="rounded shadow-sm">
            <div className="border  rounded md:p-3 flex flex-col gap-4 mt-2">
              <div>
                <TableHeader />
              </div>
              <div>
                <AttendanceTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AttendanceProvider>
  );
};

export default AttendanceSection;
