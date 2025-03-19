"use client";
import React, { useEffect, useState } from "react";

import { Button, Input, Loader, Modal, Text } from "rizzui";

import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";

import { useForm } from "react-hook-form";
import { useAttendance } from "./AttandanceContext";
import { DatePicker } from "@core/ui/datepicker";
import dynamic from "next/dynamic";
import BulkAttendance from "./BulkAttendance";

import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { usePathname, useSearchParams } from "next/navigation";

const MemberAttendancetable = dynamic(() => import("./memberAttendancetable"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="spinner" />
    </div>
  ),
});

const StaffAttendenceTable = dynamic(() => import("./StaffAttendenceTable"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="spinner" />
    </div>
  ),
});
// import AbsentStaffs from "./AbsentStaffs";

const AbsentStaffs = dynamic(() => import("./AbsentStaffs"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="spinner" />
    </div>
  ),
});

// import AddAttendance from "./AddAttendence";
const AddAttendance = dynamic(() => import("./AddAttendence"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="spinner" />
    </div>
  ),
});
// import ShowFetchDetails from "./ShowFetchDetails";

const ShowFetchDetails = dynamic(() => import("./ShowFetchDetails"), {
  loading: () => (
    <div className=" my-4 col-span-full flex flex-1 items-center justify-center min-w-full">
      <Loader size="xl" variant="spinner" />
    </div>
  ),
});

interface PersonalData {
  id: string;
  name: string;
  contact?: any;
  phone?: any;
  image: string | null;
  type: string;
}

interface Data {
  type: string;
  data: PersonalData;
}

interface AttendanceData extends Data {
  staff_id: string;
  datetime_punch: string;
  attendance_state: string;
  source?: string;
  location?: string;
}

const AttendanceTable = () => {
  const {
    setSelected,
    selectedDate,
    update,
    setUpdate,
    setAttendanceSummary,
    setSelectedDate,
  } = useAttendance();
  const [activeNav, setActiveNav] = useState("bulkAttendance");
  const {
    register,
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<AttendanceData>({
    mode: "onChange",
  });
  const [searchInput, setSearchInput] = useState("");
  // const [image, setImage] = useState<string | null>(null);
  const [fetchDetailModalIsOpen, setFetchDetailModalIsOpen] = useState(false);
  const [fetchedProfiles, setFetchedProfiles] = useState<Data[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<PersonalData>({
    id: "",
    contact: null, //in staff there is an contact field and in member there is phone field that's why i take two fields called phone and contact
    phone: null,
    name: "",
    image: "",
    type: "",
  });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [addAttendanceModelOpen, setAddAttendanceModelOpen] = useState(false);
  const params = useSearchParams();
  const pathname = usePathname();

  const handleNavClick = (navItem: string) => {
    console.log("Navigating to:", navItem); // Log nav click
    setActiveNav(navItem);
  };
  const handleSearchInputChange = (input: string) => {
    setSearchInput(input);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      handleSearch(input);
    }, 1000);

    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    if (params.get("status") === "active") {
      handleNavClick("members");
      setSelected("Members");
    }
  }, [pathname, params]);

  const handleSearch = async (searchInput: string) => {
    try {
      if (searchInput === "") {
        toast.error("Enter a valid string to fetch details");
      } else {
        const gym_id = await retrieveGymId();
        const response = await AxiosPrivate.post(
          `/api/attendance_search/?gym_id=${gym_id}`,
          {
            filterString: searchInput,
          }
        );

        const results: Data[] = response.data.data.results;
        invalidateAll();
        if (results.length === 0) {
          toast.error("No Data Found");
        } else {
          setFetchedProfiles(results);
          setFetchDetailModalIsOpen(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setSelectedData = (data: Data) => {
    setSelectedProfile({
      id: data.data.id,
      contact: data.data.contact,
      phone: data.data.phone,
      name: data.data.name,
      image: data.data.image,
      type: data.type,
    });
  };
  return (
    <div className="">
      <div className="flex flex-col justify-between ">
        <div className="flex  flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex items-center overflow-x-scroll p-2 max-w-full custom-scrollbar md:grid grid-cols-4 gap-2">
            <Button
              className={`py-2 px-4 rounded border whitespace-nowrap max-lg:scale-90 `}
              variant={activeNav === "bulkAttendance" ? "solid" : "flat"}
              onClick={() => {
                handleNavClick("bulkAttendance");
                setSelected("Members");
              }}
            >
              Absent Members{" "}
            </Button>
            <Button
              className={`py-2 px-4 rounded border  whitespace-nowrap max-lg:scale-90`}
              variant={activeNav === "members" ? "solid" : "flat"}
              onClick={() => {
                handleNavClick("members");
                setSelected("Members");
              }}
            >
              Present Members
            </Button>
            <Button
              className={`py-2 px-4 rounded border  whitespace-nowrap max-lg:scale-90`}
              variant={activeNav === "abs_staff" ? "solid" : "flat"}
              onClick={() => {
                handleNavClick("abs_staff");
                setSelected("Staffs");
              }}
            >
              Absent Staffs
            </Button>
            <Button
              className={`py-2 px-4 rounded border  whitespace-nowrap max-lg:scale-90`}
              variant={activeNav === "staff" ? "solid" : "flat"}
              onClick={() => {
                handleNavClick("staff");
                setSelected("Staffs");
              }}
            >
              Present Staff
            </Button>
          </div>
          <div className="flex items-center gap-2 p-2">
            <Input
              placeholder="Search"
              value={searchInput}
              clearable
              onClear={() => setSearchInput("")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchInputChange(e.target.value)
              }
              className="max-w-44"
            />
            {activeNav !== "bulkAttendance" && activeNav !== "abs_staff" && (
              <DatePicker
                // type="date"
                // placeholder="select date"
                placeholderText="Select Date"
                // value={selectedDate}
                value={formateDateValue(new Date(selectedDate))}
                onChange={(date: any) =>
                  setSelectedDate(
                    formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                  )
                }
                maxDate={new Date()}
                className="max-w-44"
              />
            )}
          </div>
        </div>
        <div className="mt-3 w-[100%] flex flex-col gap-2 min-h-60">
          {activeNav === "bulkAttendance" && <BulkAttendance />}
          {activeNav === "members" && <MemberAttendancetable />}
          {activeNav === "staff" && <StaffAttendenceTable />}
          {activeNav === "abs_staff" && <AbsentStaffs />}
        </div>
      </div>
      <Modal
        isOpen={fetchDetailModalIsOpen}
        onClose={() => setFetchDetailModalIsOpen(false)}
        size="lg"
      >
        <ShowFetchDetails
          profiles={fetchedProfiles}
          onClose={() => setFetchDetailModalIsOpen(false)}
          onSelect={(data: Data) => {
            setSelectedData(data);
            setFetchDetailModalIsOpen(false);
            setAddAttendanceModelOpen(true);
          }}
        />
      </Modal>
      <Modal
        isOpen={addAttendanceModelOpen}
        onClose={() => setAddAttendanceModelOpen(false)}
      >
        <AddAttendance
          id={selectedProfile.id}
          name={selectedProfile.name}
          image={selectedProfile.image}
          phone={
            selectedProfile.contact
              ? selectedProfile.contact
              : selectedProfile.phone
          }
          onClose={() => setAddAttendanceModelOpen(false)}
          type={selectedProfile.type}
          setUpdate={setUpdate}
          update={update}
          dateVal={selectedDate}
        />
      </Modal>
    </div>
  );
};

export default AttendanceTable;
