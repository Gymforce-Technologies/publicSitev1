"use client";

import { Avatar, Badge, Button, Input, Select, Tab, Text, Title } from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { useEffect, useRef, useState } from "react";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import { useRouter, useSearchParams } from "next/navigation";

import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

// import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddStaffFormSchema, defaultValues } from "@/validators/add-staff";
// import FormGroup from "@/app/shared/form-group";
import FormFooter from "@core/components/form-footer";
import { PhoneNumber } from "@core/ui/phone-input";
import { FaClock } from "react-icons/fa6";
import Loading from "@/app/[locale]/loading";
import DateCell from "@core/ui/date-cell";
import Link from "next/link";
import { MdLocationOn } from "react-icons/md";
import {
  formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
import Image from "next/image";
import { DatePicker } from "@core/ui/datepicker";
// import { StaffPermissionsCard } from "../../StaffAccess";
import CameraCapture from "@/components/member-list/Capture";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { BsArrowRight } from "react-icons/bs";
// import { StaffPermissionsCard } from "../../StaffAccess";

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
  address_country: string;
  address_street: string;
  address_zip_code?: string;
  shift_id: number;
  marital_status?: string;
  employment_type: string;
  qualifications?: string;
  certifications?: string;
  specializations?: string;
  emergency_contact_number?: string;
  emergency_contact_relation?: string;
  base_salary: string;
  trainerCommissionPercentage: string;
  annual_paid_leaves_alloted: string;
  monthly_leaves_limit: string;
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

const StaffProfileSection = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const newId = (params.id as string).split("-")[1];
  const [shifts, setShifts] = useState<any[]>([]);
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(AddStaffFormSchema),
    defaultValues,
  });
  const [loading, setLoading] = useState(true);
  const [staffTypes, setStaffTypes] = useState<StaffTypeOption[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lock, setLock] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  // const [showAdditional, setShowAdditional] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const onSubmit = async (data: FormData) => {
    setLock(true);
    try {
      const gymId = await retrieveGymId();

      // Create FormData for file upload
      const formData = new FormData();

      // Append all form data
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof FormData];
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
        if (key === "date_of_birth") {
          formData.append(key, formateDateValue(new Date(value), "YYYY-MM-DD"));
        }
      });

      // Handle image upload specifically
      if (imageFile && formData.get("staff_image") === null) {
        formData.append("staff_image", imageFile);
      }
      formData.append("gym", gymId as string);
      const response = await AxiosPrivate.patch(
        `/api/staff/${newId}/?gym_id=${gymId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then(() => {
        invalidateAll();
        router.refresh();
      });

      toast.success("Staff updated successfully");
    } catch (error: any) {
      console.error("Error updating staff:", error?.response?.data?.username);
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
  const handleCameraCapture = (file: File) => {
    setValue("staff_image", file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

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

  useEffect(() => {
    const fetchStaffById = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    if (newId) fetchStaffById();
  }, [newId, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Set the file for form submission
      setValue("staff_image", file);

      // Create file reader to generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set image preview
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Also set the image file state if needed
      setImageFile(file);
    }
  };

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
  if (loading) {
    return <Loading />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="@container">
      <>
        <div className="w-full flex flex-col md:flex-row items-center gap-6 sm:gap-8 bg-primary-lighter/50 dark:bg-gray-200 p-4 md:p-6 rounded-xl shadow-md shadow-primary-lighter dark:shadow-gray-300 relative">
          <div className="flex flex-col gap-2">
            <div className="relative">
              {/* <Avatar
                name={getValues("name") || "Name"}
                src={
                  imagePreview || // Prioritize new uploaded image
                  getValues("staff_image") || // Fallback to existing image from form
                  (getValues("gender")[0]?.toLowerCase() === "m"
                    ? "https://images.gymforce.in/man-user-circle-icon.png"
                    : "https://images.gymforce.in/woman-user-circle-icon.png") ||
                  ""
                }
                color="info"
                rounded="lg"
                customSize="300px"
                className="w-[150px] h-[150px] object-cover bg-primary-lighter/50 rounded-full shadow-lg ring-[6px] ring-primary/40"
              /> */}
              <Image
                alt={getValues("name") || "Name"}
                src={
                  imagePreview || // Prioritize new uploaded image
                  getValues("staff_image") || // Fallback to existing image from form
                  (getValues("gender")[0]?.toLowerCase() === "f"
                    ? WomanIcon
                    : ManIcon)
                }
                height={150}
                width={150}
                className="w-[150px] h-[150px] object-cover bg-primary-lighter/50 rounded-full shadow-lg ring-[6px] ring-primary/40"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-1 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
            <span className="place-self-start">
              <Badge variant="outline">
                {
                  staffTypes.find(
                    (staff) =>
                      parseInt(staff.value) ===
                      parseInt(getValues("staffTypeId"))
                  )?.label
                }
              </Badge>
            </span>
          </div>
          <div className="flex flex-col space-y-4 text-center md:text-left">
            <Title as="h6" className="text-xl font-bold text-primary">
              {getValues("name")}
            </Title>
            <div className="space-y-2">
              <div className="flex flex-row md:items-center gap-2">
                <span className="font-semibold text-gray-600">Contact:</span>
                <div>
                  {getValues("contact") ? (
                    <Link
                      href={`tel:${getValues("contact")}`}
                      className="text-primary hover:underline transition-colors duration-200"
                    >
                      +{getValues("contact")}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
              <div className="flex flex-row md:items-center gap-2">
                <span className="font-semibold text-gray-600">
                  Date of Birth:
                </span>
                <span>
                  {getValues("date_of_birth") ? (
                    <DateCell
                      date={getValues("date_of_birth")}
                      dateFormat={getDateFormat()}
                      timeClassName="hidden"
                    />
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
              <div className="flex flex-row md:items-center gap-2">
                <span className="font-semibold text-gray-600">
                  Employment Type:
                </span>
                <span>{getValues("employment_type") || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="flex self-start sm:self-end p-2 md:p-8 gap-2">
            <Text className="font-semibold">Shift: </Text>
            <Text className="text-primary">
              {shifts.find(
                (shift: any) => shift.value === getValues("shift_id")
              )?.label || "N/A"}
            </Text>
          </div>
          <div className="absolute bottom-8 right-8 flex items-center">
            <MdLocationOn className="text-primary" size={20} />
            <Text className="pl-1 font-medium text-gray-600 text-base">
              {(() => {
                const address = {
                  address_street: getValues("address_street"),
                  address_country: getValues("address_country"),
                  address_zip_code: getValues("address_zip_code"),
                };
                const components = [
                  address.address_street,
                  address.address_country,
                  address.address_zip_code,
                ].filter(Boolean);
                return components.length > 0
                  ? components.join(", ") + "."
                  : "N/A";
              })()}
            </Text>
          </div>
        </div>
        <div className="grid md:grid-cols-2 px-2 md:px-4 py-2 gap-6">
          <div className=" grid grid-cols-2 items-center gap-4 col-span-full md:max-w-[50%]">
            {/* <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="max-w-40"
              >
                {"Upload"}
              </Button>
              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
                className="max-w-40"
              >
                Take Photo
              </Button>
            </div>
            {imagePreview && (
              <div className="w-36 h-36 relative">
                <Image
                  src={
                    imagePreview ||
                    "https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp"
                  }
                  alt="Profile Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full shadow-md"
                />
              </div>
            )} */}
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
                  disabled={isStaff}
                  inPortal={false}
                  placeholder="Select Staff Type"
                  options={staffTypes}
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
                    error={lock ? errors?.employment_type?.message : ""}
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
                error={lock ? errors.name?.message : ""}
                // className="col-span-full max-w-xl"
                label="Base Salary "
                prefix={demographiInfo?.currency_symbol || ""}
              />
              <Input
                placeholder="Enter the Comission Percentage"
                {...register("trainerCommissionPercentage")}
                error={lock ? errors.name?.message : ""}
                // className="col-span-full max-w-xl"
                label="Trainer Commission %"
                prefix={`%`}
              />
              <Input
                placeholder="Enter the Allowed Paid Leave Days per year"
                {...register("annual_paid_leaves_alloted")}
                error={lock ? errors.name?.message : ""}
                // className="col-span-full max-w-xl"
                label="Annual Paid Leave Days "
              />
              <Input
                placeholder="Enter the Leaves Days Allowed"
                {...register("monthly_leaves_limit")}
                error={lock ? errors.name?.message : ""}
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
                error={lock ? errors.address_street?.message : ""}
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
                  error={lock ? errors.emergency_contact_number?.message : ""}
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
          {/* </>
          ) : (
            <div className=" col-span-full flex flex-1 items-end justify-end pt-4">
              <Button
                variant="flat"
                size="sm"
                onClick={() => setShowAdditional(true)}
              >
                + more...
              </Button>
            </div>
          )} */}
        </div>
        <FormFooter
          altBtnText="Cancel"
          submitBtnText="Update"
          isLoading={lock}
          className="border-none"
        />
      </>
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        showCamera={showCamera}
      />
    </form>
  );
};

export default StaffProfileSection;
