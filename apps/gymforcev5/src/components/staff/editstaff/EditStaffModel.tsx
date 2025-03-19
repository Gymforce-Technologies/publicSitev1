"use client";

import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";

import { Loader, Input, Button, Title, Text } from "rizzui";
import FormFooter from "@core/components/form-footer";
import { useEffect, useRef, useState } from "react";
import ManIcon from "@public/webp/man-user-icon.webp";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

import {
  AddStaffFormSchema,
  // AddStaffFormTypes,
  defaultValues,
} from "@/validators/add-staff";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { DatePicker } from "@core/ui/datepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import {
  DemographicInfo,
  // DemographicInfo,
  retrieveDemographicInfo,
  // setDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
// import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import { PhoneNumber } from "@core/ui/phone-input";
import { FaClock } from "react-icons/fa6";
import {
  // formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
import CameraCapture from "@/components/member-list/Capture";
// import { StaffPermissionsCard } from "../StaffAccess";
import { BsArrowRight } from "react-icons/bs";

const Select = dynamic(() => import("rizzui").then((mod) => mod.Select), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Loader variant="spinner" />
    </div>
  ),
});

// const statusOptions = [
//   { label: "Active", value: "ACTIVE" },
//   { label: "InActive", value: "INACTIVE" },
// ];

const genderOptions = [
  { label: "Male", value: "M" },
  { label: "Female", value: "F" },
];
interface FormData {
  name: string;
  gender: string;
  contact: string;
  staffTypeId: string;
  staff_image?: any;
  date_of_birth: any;
  address_country?: string;
  address_street?: string;
  address_zip_code?: string;
  shift_id?: number;
  marital_status?: string;
  employment_type: string;
  qualifications?: string;
  certifications?: string;
  specializations?: string;
  emergency_contact_number: string;
  emergency_contact_relation?: string;
  base_salary?: string;
  trainerCommissionPercentage?: string;
  annual_paid_leaves_alloted?: string;
  monthly_leaves_limit?: string;
}

const Emp_Types = [
  { label: "Full Time", value: "Full Time" },
  { label: "Part Time", value: "Part Time" },
  { label: "Contract", value: "Contract" },
  { label: "Intern", value: "Intern" },
];

const Matrial_Status = [
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
];

interface StaffTypeOption {
  label: string;
  value: string;
}
const convertToDateFnsFormat = (format: string) => {
  return format
    .replace("DD", "dd")
    .replace("MMM", "MMM")
    .replace("MM", "MM")
    .replace("YYYY", "yyyy");
};

export default function EditStaffView() {
  const { id } = useParams();
  const router = useRouter();
  const [isFormValid, setIsFormValid] = useState(false);
  const newId = (id as string).split("-")[1];
  const [shifts, setShifts] = useState<any[]>([]);
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors, isValid },
    handleSubmit,
    watch,
    trigger,
  } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(AddStaffFormSchema),
    defaultValues,
  });
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [staffTypes, setStaffTypes] = useState<StaffTypeOption[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lock, setLock] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const handleCameraCapture = (file: File) => {
    setValue("staff_image", file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted", data);
    setLock(true);
    try {
      console.log(data);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.patch(
        `/api/staff/${newId}/?gym_id=${gymId}`,
        {
          ...data,
          date_of_birth: new Date(data.date_of_birth)
            .toISOString()
            .split("T")[0],
          gym: gymId,
        },
        {
          headers: {
            // Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      ).then(() => invalidateAll());
      toast.success("Staff updated successfully");
      router.push("/staff-section/allstaff");
    } catch (error: any) {
      console.error("Error updating staff:", error?.response?.data?.username);
      setTimeout(() => {
        console.log("error", error);
        toast.error("Failed to update staff. Please try again later");
      }, 5000);
      if (error?.response?.data?.username) {
        toast.error("Username already exists");
      } else {
        toast.error(
          "Something went wrong while updating staff. Please try again later"
        );
      }
    } finally {
      setLock(false);
    }
  };

  useEffect(() => {
    const isStaffVal = sessionStorage.getItem("isStaff");
    console.log(isStaffVal);
    setIsStaff(isStaffVal === "true");
  }, []);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/shifts/?gym_id=${gymId as string}`,
          {
            id: newID("shift" + gymId),
          }
        );
        setShifts(
          response.data.map((type: any) => {
            const formatTime = (time: string) => {
              const [hours, minutes] = time.split(":");
              const hour = parseInt(hours);
              const ampm = hour >= 12 ? "PM" : "AM";
              const hour12 = hour % 12 || 12;
              return `${hour12}:${minutes} ${ampm}`;
            };

            const startTime = formatTime(type.start_time);
            const endTime = formatTime(type.end_time);

            return {
              label: type.name,
              value: type.id,
              time: `${startTime} - ${endTime}`,
              description: type.description,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };
    fetchShifts();
  }, []);

  const checkFormValidity = async () => {
    const result = await trigger();
    setIsFormValid(result && isValid);
  };

  useEffect(() => {
    const staff = watch(() => {
      checkFormValidity();
    });
    return () => staff.unsubscribe();
  }, [watch, trigger, isValid]);

  useEffect(() => {
    const fetchStaffById = async () => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/staff/${newId}/?gym_id=${gymId}`,
          {
            id: newID(`staff-${newId}`),
          }
        );
        const fetchedStaff = response.data;
        console.log(fetchedStaff);

        setValue("name", fetchedStaff.name);
        setValue("gender", fetchedStaff.gender);
        setValue("contact", fetchedStaff.contact);
        setValue("staffTypeId", fetchedStaff.staffType.id.toString());
        setSelectedStaff(fetchedStaff.staffType.staffTypeName.toLowerCase());
        setValue("address_country", fetchedStaff.address_country);
        setValue("address_street", fetchedStaff.address_street);
        setValue("address_zip_code", fetchedStaff.address_zip_code);
        setValue("date_of_birth", new Date(fetchedStaff.date_of_birth));
        setValue("shift_id", fetchedStaff?.shift_id);
        setValue("marital_status", fetchedStaff.marital_status);
        setValue("employment_type", fetchedStaff?.employment_type);
        setValue("qualifications", fetchedStaff.qualifications);
        setValue("certifications", fetchedStaff.certifications);
        setValue("specializations", fetchedStaff.specializations);
        setValue(
          "emergency_contact_number",
          fetchedStaff?.emergency_contact_number
        );
        setValue(
          "emergency_contact_relation",
          fetchedStaff.emergency_contact_relation
        );
        setValue("base_salary", fetchedStaff.base_salary?.toString());
        setValue(
          "trainerCommissionPercentage",
          fetchedStaff.trainerCommissionPercentage?.toString()
        );
        setValue(
          "annual_paid_leaves_alloted",
          fetchedStaff.annual_paid_leaves_alloted?.toString()
        );
        setValue(
          "monthly_leaves_limit",
          fetchedStaff.monthly_leaves_limit?.toString()
        );
        setImagePreview(fetchedStaff.staff_image || null);
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };
    if (newId) fetchStaffById();
  }, [newId, setValue]);

  useEffect(() => {
    const fetchStaffTypes = async () => {
      try {
        const infoData = await retrieveDemographicInfo();
        setDemographicInfo(infoData);
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/staff/add-staff-prerequisites/?gym_id=${gymId as string}`,
          {
            id: newID("staff-prerequest"),
          }
        );
        setStaffTypes(
          response.data.data.staffTypesList.map((type: any) => ({
            label: type.staffTypeName,
            value: type.id.toString(),
          }))
        );
      } catch (error) {
        console.error("Error fetching staff types:", error);
      }
    };
    fetchStaffTypes();
  }, []);
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("staff_image", file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setImagePreview(reader.result as string);
    }
  };
  // const handleDateChange = (date: Date | null) => {
  //   setValue(
  //     "date_of_birth",
  //     date
  //     // formateDateValue(new Date(date || ""), "YYYY-MM-DD")
  //   );
  // };
  useEffect(() => {
    const fetchDemInfo = async () => {
      try {
        const info = await retrieveDemographicInfo();
        console.log(info);
        console.log("ifo", info?.country_code.toLowerCase());
        setDemographicInfo(info);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDemInfo();
  }, []);

  useEffect(() => {
    console.log("Form Errors:", errors);
    console.log("Is Form Valid:", isFormValid);
    console.log("Is Valid Flag:", isValid);
  }, [errors, isFormValid, isValid]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="@container">
      <>
        <div className="grid md:grid-cols-2 px-2 md:px-4 py-2 gap-6">
          <div className=" grid grid-cols-2 items-center gap-4 col-span-full md:max-w-[50%]">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <div className="flex max-sm:flex-col sm:items-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="max-w-28 sm:max-w-40"
              >
                {"Upload"}
              </Button>
              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
                className="max-w-28 sm:max-w-40"
              >
                Take Photo
              </Button>
            </div>
            {imagePreview && (
              <div className="size-32 md:size-40 relative">
                <Image
                  src={imagePreview || ManIcon}
                  alt="Profile Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full shadow-md"
                />
              </div>
            )}
          </div>
          <Title as="h6" className="col-span-full font-semibold pt-4">
            Required Fields *
          </Title>
          <Input
            label="Full Name *"
            placeholder="Enter Full Name"
            {...register("name")}
            error={lock ? errors.name?.message : ""}
            // className="col-span-full max-w-xl"
          />
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Gender *"
                inPortal={false}
                placeholder="Select Gender"
                options={genderOptions}
                onChange={(selectedOption: string) => {
                  onChange(selectedOption);
                }}
                value={value}
                className=""
                getOptionValue={(option) => option.value}
                displayValue={(selected) =>
                  genderOptions?.find((con) => con.value === selected)?.label ??
                  ""
                }
                // labelClassName=""
                dropdownClassName="!z-10  !h-auto"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
            )}
          />
          {/* <FormGroup
            title=""
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          > */}
          <Controller
            control={control}
            name="date_of_birth"
            render={({ field: { onChange, value } }) => (
              <div className="grid grid-cols-1 gap-1.5 ">
                <Text className="font-medium ">Date of Birth* </Text>
                <DatePicker
                  onChange={(date) => {
                    onChange(date); // Simply call onChange with the date
                  }}
                  placeholderText="Select Date"
                  showMonthDropdown={true}
                  showYearDropdown={true}
                  scrollableYearDropdown={true}
                  yearDropdownItemNumber={50}
                  isClearable
                  maxDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 5)
                    )
                  }
                  dateFormat={convertToDateFnsFormat(getDateFormat())}
                  selected={value ? new Date(value) : null}
                  // className="col-span-full max-w-xl"
                  clearButtonClassName="text-gray-400 mr-2"
                />
              </div>
            )}
          />
          {/* </FormGroup> */}
          {/* <FormGroup
            title="Contact *"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11 "
          > */}
          <div className="grid grid-cols-1 gap-1.5 ">
            <Text className="font-medium ">Contact *</Text>
            <PhoneNumber
              // country={contactCode}
              value={getValues("contact")?.toString() || ""}
              onChange={(value) =>
                setValue("contact", value, { shouldValidate: true })
              }
              error={lock ? errors.contact?.message : ""}
              // className="col-span-full max-w-xl"
            />
          </div>
          {/* </FormGroup> */}
          {/* <FormGroup
            title="Email"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder="Enter Email"
              {...register("email")}
              error={errors.email?.message}
              className="col-span-full max-w-xl"
              />
          </FormGroup> */}
          <Controller
            control={control}
            name="staffTypeId"
            render={({ field: { onChange, value } }) => (
              <div className="grid grid-cols-[1fr,auto] items-end relative gap-4">
                <Select
                  label="Staff Type *"
                  inPortal={false}
                  placeholder="Select Staff Type"
                  options={staffTypes}
                  disabled={isStaff}
                  onChange={(selectedOption: string) => {
                    onChange(selectedOption);
                    const selectedStaffVal =
                      staffTypes
                        .find((con) => con.value === selectedOption)
                        ?.label.toLowerCase() ?? null;
                    console.log(selectedStaffVal);
                    setSelectedStaff(selectedStaffVal);
                  }}
                  value={value}
                  // className="col-span-full max-w-xl"
                  getOptionValue={(option) => option.value}
                  displayValue={(selected: string | number) =>
                    staffTypes.find((con) => con.value === selected)?.label ??
                    ""
                  }
                  error={lock ? errors?.staffTypeId?.message : ""}
                  labelClassName=""
                  dropdownClassName="!z-10 !h-auto"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700 "
                />
              </div>
            )}
          />
          {isStaff ? null : (
            <>
              <Title as="h6" className="col-span-full font-semibold pt-4">
                Salary Details
              </Title>
              <Controller
                control={control}
                name="shift_id"
                render={({ field: { onChange, value } }) => (
                  <Select
                    inPortal={false}
                    label="Shift "
                    placeholder="Select Shift"
                    options={
                      shifts.length
                        ? shifts
                        : [{ label: "No Shifts", value: "0" }]
                    }
                    onChange={(selectedOption: number) => {
                      onChange(selectedOption);
                    }}
                    getOptionValue={(option) => option.value}
                    value={value}
                    // className="col-span-full max-w-xl"
                    displayValue={(selected) => {
                      const selectedShift = shifts.find(
                        (shift) => shift.value === selected
                      );
                      if (!selectedShift) return "";
                      return (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {selectedShift.label}
                          </span>
                          <span className="text-sm text-gray-500 ">
                            ({selectedShift.time})
                          </span>
                        </div>
                      );
                    }}
                    getOptionDisplayValue={(option) =>
                      shifts.length ? (
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="flex items-center justify-between gap-10">
                            <div className="text-sm text-gray-500 ">
                              <FaClock className="inline" /> {option.time}
                            </div>
                            {option.description && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className=" w-full flex flex-row items-center justify-between mx-4"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Text className="font-semibold  text-nowrap">
                            No Shifts Found
                          </Text>
                          <Button
                            variant="text"
                            onClick={(e) => {
                              e.preventDefault();
                              toast.success("Switching to Shifts Section");
                              router.push("/shifts");
                            }}
                            className="text-primary text-nowrap"
                          >
                            Add Shift
                            <BsArrowRight
                              size={16}
                              className="ml-1 animate-pulse"
                            />
                          </Button>
                        </div>
                      )
                    }
                    labelClassName=""
                    dropdownClassName="!z-10 !h-auto"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                )}
              />
              <Controller
                control={control}
                name="employment_type"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Employment Type "
                    inPortal={false}
                    placeholder="Select Employment Type"
                    options={Emp_Types}
                    onChange={(selectedOption: string) => {
                      onChange(selectedOption);
                    }}
                    value={value}
                    // className="col-span-full max-w-xl"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected: string | number) =>
                      Emp_Types.find((con) => con.value === selected)?.label ??
                      ""
                    }
                    // error={lock ? errors?.employment_type?.message : ""}
                    labelClassName=""
                    // dropdownClassName="!z-10 dark:bg-gray-800 dark:border-gray-700"
                    dropdownClassName="!z-10 !h-auto"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                )}
              />
              <Input
                placeholder="Enter the Salary"
                {...register("base_salary")}
                // error={lock ? errors.name?.message : ""}
                // className="col-span-full max-w-xl"
                label="Base Salary "
                prefix={demographiInfo?.currency_symbol || ""}
              />
              <Input
                placeholder="Enter the Comission Percentage"
                {...register("trainerCommissionPercentage")}
                // error={lock ? errors.name?.message : ""}
                // className="col-span-full max-w-xl"
                label="Trainer Commission %"
                prefix={`%`}
              />
              <Input
                placeholder="Enter the Allowed Paid Leave Days per year"
                {...register("annual_paid_leaves_alloted")}
                // error={lock ? errors.name?.message : ""}
                // className="col-span-full max-w-xl"
                label="Annual Paid Leave Days "
              />
              <Input
                placeholder="Enter the Leaves Days Allowed"
                {...register("monthly_leaves_limit")}
                // error={lock ? errors.name?.message : ""}
                // className="col-span-full max-w-xl"
                label="Monthly Leave Limit "
              />
              {/* <FormGroup
            title="City"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
                className="col-span-full max-w-xl"
                placeholder="Enter city"
              {...register("address_city")}
              error={errors.address_city?.message}
            />
          </FormGroup>
          <FormGroup
            title="State"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
                className="col-span-full max-w-xl"
                placeholder="Enter State"
              {...register("address_state")}
              error={errors.address_state?.message}
            />
          </FormGroup> */}
              {/* {showAdditional ? (
            <> */}
              <div className="col-span-full flex items-center min-w-full justify-between flex-row pt-6">
                <Title as="h6" className=" font-semibold ">
                  Additional Fields
                </Title>
                {/* <Button
                  variant="flat"
                  size="sm"
                  onClick={() => setShowAdditional(false)}
                >
                  - less...
                </Button> */}
              </div>
              <Input
                placeholder="Enter Specializations"
                {...register("specializations")}
                // className="col-span-full max-w-xl"
                label="Specializations "
              />
              <Input
                placeholder="Enter Qualifications"
                {...register("qualifications")}
                // className="col-span-full max-w-xl"
                label="Qualifications "
              />
              <Input
                // className="col-span-full max-w-xl"
                placeholder="Enter the Address"
                {...register("address_street")}
                label="Address"
                // error={lock ? errors.address_street?.message : ""}
              />
              <Input
                // className="col-span-full max-w-xl"
                placeholder="Enter country"
                {...register("address_country")}
                label="Country"
              />
              <Input
                // className="col-span-full max-w-xl"
                placeholder="Enter Pincode"
                {...register("address_zip_code")}
                label="Pincode"
              />
              <Controller
                control={control}
                name="marital_status"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Marital Status"
                    inPortal={false}
                    placeholder="Select Marital Status"
                    options={Matrial_Status}
                    onChange={(selectedOption: string) => {
                      onChange(selectedOption);
                    }}
                    value={value}
                    // className="col-span-full max-w-xl"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected: string | number) =>
                      Matrial_Status.find((con) => con.value === selected)
                        ?.label ?? ""
                    }
                    labelClassName=""
                    dropdownClassName="!z-10  !h-auto"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                )}
              />
              <Input
                placeholder="Enter Certifications"
                {...register("certifications")}
                // className="col-span-full max-w-xl"
                label="Certifications"
              />
              <div className="grid grid-cols-1 gap-1.5 ">
                <Text className="font-medium ">Emergency Contact Number</Text>
                <PhoneNumber
                  // country={contactCode}
                  value={
                    getValues("emergency_contact_number")?.toString() || ""
                  }
                  onChange={(value) =>
                    setValue("emergency_contact_number", value, {
                      shouldValidate: true,
                    })
                  }
                  // error={lock ? errors.emergency_contact_number?.message : ""}
                  // className="col-span-full max-w-xl"
                />
              </div>
              <Input
                placeholder="Enter Emergency Contact Relation"
                {...register("emergency_contact_relation")}
                // className="col-span-full max-w-xl"
                label="Emergency Contact Relation"
              />
            </>
          )}
        </div>
      </>

      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        showCamera={showCamera}
      />
      <FormFooter
        altBtnText="Cancel"
        submitBtnText="Save"
        isLoading={lock}
        className={isStaff ? "mt-12" : ""}
      />
    </form>
  );
}
