"use client";

import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";

import { Loader, Input, Button, Title, Text, Tooltip, Badge } from "rizzui";
import ManIcon from "@public/webp/man-user-icon.webp";
import FormFooter from "@core/components/form-footer";
import { useEffect, useRef, useState } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

import { getAccessToken } from "@/app/[locale]/auth/Acces";
import {
  AddStaffFormSchema,
  // AddStaffFormTypes,
  defaultValues,
} from "@/validators/add-staff";
import Image from "next/image";
import { DatePicker } from "@core/ui/datepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { PhoneNumber } from "@core/ui/phone-input";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
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
interface selectoptions {
  label: string;
  value: string;
}
const Emp_Types = [
  {
    label: "Full Time",
    value: "Full Time",
  },
  {
    label: "Part Time",
    value: "Part Time",
  },
  {
    label: "Contract",
    value: "Contract",
  },
  {
    label: "Intern",
    value: "Intern",
  },
];
const genderOptions = [
  {
    label: "Male",
    value: "M",
  },
  {
    label: "Female",
    value: "F",
  },
];
const Matrial_Status = [
  {
    label: "Single",
    value: "Single",
  },
  {
    label: "Married",
    value: "Married",
  },
];

interface formData {
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

const convertToDateFnsFormat = (format: string) => {
  return format
    .replace("DD", "dd")
    .replace("MMM", "MMM")
    .replace("MM", "MM")
    .replace("YYYY", "yyyy");
};

export default function AddStaffView() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lock, setLock] = useState<boolean>(false);
  const [contactCode, setContactCode] = useState<any>("in");
  const [isAuthValid, setIsAuthValid] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [staffTypes, setStaffTypes] = useState<selectoptions[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const handleCameraCapture = (file: File) => {
    setValue("staff_image", file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors, isValid },
    handleSubmit,
    watch,
    trigger,
  } = useForm<formData>({
    mode: "onChange",
    resolver: zodResolver(AddStaffFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: formData) => {
    if (!isAuthValid) {
      toast.error("Please Subscribe to Proceed Further");
      router.push("/subscription/plans");
      return;
    }
    setLock(true);
    try {
      const token = await getAccessToken();
      const gymId = await retrieveGymId();
      console.log(data);
      const response = await AxiosPrivate.post(
        `/api/staff/?gym_id=${gymId}`,
        {
          ...data,
          gym: parseInt(gymId as string),
          date_of_birth: new Date(
            new Date(data.date_of_birth).getTime() + 86400000
          )
            .toISOString()
            .split("T")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      ).then(() => {
        invalidateAll();
      });
      router.push(routes.staff.allstaffs);
      toast.success("Staff added successfully");
    } catch (error: any) {
      console.error("Error adding staff:", error?.response?.data?.username);
      if (error?.response?.data?.username) {
        toast.error("username already exist");
      } else {
        toast.error(
          "Something went wrong while adding staff. Please try again later"
        );
      }
    } finally {
      setLock(false);
    }
  };

  useEffect(() => {
    const fetchStaffTypes = async () => {
      try {
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
        setShifts(
          response.data.data.staff_shift.map((type: any) => {
            // Convert 24hr time to 12hr format with AM/PM
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
        checkUserAccess().then((status) => {
          console.log(status);
          if (status !== "Restricted") {
            setIsAuthValid(true);
          } else {
            setIsAuthValid(false);
          }
        });
      } catch (error) {
        console.error("Error fetching staff types:", error);
      }
    };
    const getInfo = async () => {
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
    };
    getInfo();
    fetchStaffTypes();
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
  //   setValue("date_of_birth", date);
  //   // console.log(formateDateValue(new Date(date || ""), "YYYY-MM-DD"));
  // };

  useEffect(() => {
    const fetchDemInfo = async () => {
      try {
        const info = await retrieveDemographicInfo();
        console.log(info);
        // setDemoGraphicInfo(info)
        setContactCode(info?.country_code.toString().toLowerCase());
        setValue("address_country", info?.country || "");
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
              country={contactCode}
              value={getValues("contact")?.toString() || ""}
              onChange={(value) =>
                setValue("contact", value, { shouldValidate: true })
              }
              error={lock ? errors.contact?.message : ""}
              // className="col-span-full max-w-xl"
            />
          </div>
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
                {/* <Button
                  onClick={() => setShowAdditional(!showAdditional)}
                  className="mt-2"
                  size="sm"
                >
                  Permissions
                </Button>
                {showAdditional ? (
                  <div className="absolute top-full right-1 z-[999999] min-w-[250px] bg-gray-50">
                    {selectedStaff ? (
                      <StaffPermissionsCard
                        //@ts-ignore
                        staffType={selectedStaff}
                      />
                    ) : (
                      <Text>Select the Staff Type to view permissions</Text>
                    )}
                  </div>
                ) : null} */}
              </div>
            )}
          />

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
                  shifts.length ? shifts : [{ label: "No Shifts", value: "0" }]
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
                      <span className="font-medium">{selectedShift.label}</span>
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
                  Emp_Types.find((con) => con.value === selected)?.label ?? ""
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
                  Matrial_Status.find((con) => con.value === selected)?.label ??
                  ""
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
              country={contactCode}
              value={getValues("emergency_contact_number")?.toString() || ""}
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
          submitBtnText="Save"
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
}
