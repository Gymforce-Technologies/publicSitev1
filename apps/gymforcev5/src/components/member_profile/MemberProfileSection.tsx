"use client";

import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import {
  formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
// import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
// import { isStaff } from "@/app/[locale]/auth/Staff";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import Loading from "@/app/[locale]/loading";
import DateCell from "@core/ui/date-cell";
// import Loading from "@/loading";
import { DatePicker } from "@core/ui/datepicker";
import { PhoneNumber } from "@core/ui/phone-input";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BsArrowRight, BsClockHistory } from "react-icons/bs";
import { FaBookReader, FaInstagram } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { RiCopperCoinFill } from "react-icons/ri";
import {
  Avatar,
  Badge,
  Button,
  Input,
  Loader,
  Popover,
  Select,
  Switch,
  Text,
  Title,
  Tooltip,
} from "rizzui";
import Image from "next/image";

interface Option {
  label: string;
  value: number;
}
interface ValidationErrors {
  [key: string]: string;
}

export default function MemberProfile({ params }: { params: { id: string } }) {
  const newId = params.id.toString().split("-")[1];
  const [data, setData] = useState<any | null>(null);
  const [lock, setLock] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));
  const [isValid, setIsValid] = useState(false);
  const [memberCategories, setMemberCategories] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [currentMembership, setCurrentMembership] = useState<any>(null);
  const [occupation, setOccupation] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [trainer, setTrainer] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const router = useRouter();
  useEffect(() => {
    fetchMemberData();
    getPreReq();
    getPointDetails();
  }, [newId]);

  const fetchMemberData = async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/member/${newId}/basic/?gym_id=${gymId}`,
        {
          id: newID(`member-profile-${newId}`),
        }
      );
      console.log(response);
      const newData = response.data.data;
      setData({
        ...newData,
        batch_id: newData.batch?.id || null,
        category_id: newData.category?.id || null,
        end_date: newData.membership_details[0]?.end_date,
      });
      const currentMembership = newData.membership_details.filter(
        (membership: any) => membership.status === "active"
      );
      setCurrentMembership(currentMembership[0]);
      if (currentMembership) {
        setTrainer(currentMembership[0]?.trainer_details || null);
      }
      setImagePreview(newData.member_image);
    } catch (error) {
      console.error("Error fetching member data:", error);
      toast.error("Something went wrong while fetching member data");
    }
  };

  const getPointDetails = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/member/${newId}/points/?gym_id=${gymId}`,
        {
          id: newID(`member-points-${newId}`),
        }
      );
      console.log(resp.data);
      setPoints(resp.data.loyalty_points);
    } catch (error) {
      console.log(error);
    }
  };

  const getPreReq = async () => {
    const gymId = await retrieveGymId();
    try {
      const resp = await AxiosPrivate.get(
        `/api/member/add-member-prerequisites/?gym_id=${gymId}`
      );
      setMemberCategories(
        resp.data.favorite_categories.map((cat: any) => ({
          label: cat.name,
          value: cat.id,
        }))
      );
      setBatches(
        resp.data.favorite_batches.map((group: any) => ({
          label: group.name,
          value: group.id,
          capacity: group.capacity,
          live_member_count: group.live_member_count,
          start_time: group.start_time,
          end_time: group.end_time,
        }))
      );
      setOccupation(
        resp.data.occupation_types.map((occ: any) => ({
          label: occ,
          value: occ,
        }))
      );
    } catch (error) {
      console.error("Error fetching prerequisites:", error);
    }
  };

  const checkBatches = (batch_id: string | number) => {
    const numericBatchId = Number(batch_id);

    const batch = batches.find((group) => group.value === numericBatchId);

    if (batch) {
      const currentCount = parseInt(
        batch.live_member_count.split("|")[0].trim()
      );

      if (currentCount === batch.capacity) {
        toast.success(
          "On Adding this Member, the capacity will be Increased to " +
            (batch.capacity + 1)
        );
      }
    }
  };
  useEffect(() => {
    const getStatus = async () => {
      checkUserAccess().then((status) => {
        console.log(status);
        if (status !== "Restricted") {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      });
    };
    getStatus();
  }, []);
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (value: string) => {
    setData((prev: any) => (prev ? { ...prev, phone: value } : null));
  };

  const validateMemberForm = (data: any): ValidationErrors => {
    const errors: ValidationErrors = {};
    // Implement validation logic here
    return errors;
  };

  // const trainerAdd = async () => {
  //   const gymId = await retrieveGymId();
  //   const resp = await AxiosPrivate.patch(
  //     `/api/add-trainer/${currentMembership?.id}/?gym_id=${gymId}`,
  //     {
  //       trainer_id: trainer,
  //     }
  //   );
  // };

  const handleEdit = async () => {
    const newData = {
      address_city: data.address_city,
      address_country: data.address_country,
      address_state: data.address_state,
      address_street: data.address_street,
      address_zip_code: data.address_zip_code,
      date_of_birth: data.date_of_birth,
      email: data.email,
      gender: data.gender,
      joining_date: data.joining_date,
      name: data.name,
      phone: data.phone,
      category_id: data?.category_id ? data.category_id.toString() : null,
      batch_id: data?.batch_id ? data.batch_id.toString() : null,
      emergency_contact: data.emergency_contact || null,
      emergency_contact_name: data.emergency_contact_name || null,
      occupation: data.occupation || null,
      qualification: data.qualification || null,
      colledge_or_school: data.colledge_or_school || null,
      martial_status: data.martial_status || null,
      reference: data.reference || null,
      parents_name: data.parents_name || null,
      parents_contact: data.parents_contact || null,
      with_parents: data.with_parents || null,
      remark: data.remarks || null,
      medical_history: data.medical_history || null,
      blood_group: data.blood_group || null,
      ig: data.ig || null,
    };
    const formData = new FormData();

    Object.entries(newData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "phone") {
          //@ts-ignore
          if (value.length) {
            const formattedPhone = value.startsWith("+") ? value : `+${value}`;
            formData.append(key, formattedPhone);
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });
    // Handle member_image separately

    if (imageFile !== null) {
      formData.append("member_image", imageFile);
    }

    console.log(formData);
    try {
      setLock(true);
      const errors = validateMemberForm(newData);
      console.log(errors);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error("Please fill in all required fields correctly.");
        setLock(false);
        return;
      }
      setValidationErrors({});
      const gymid = await retrieveGymId();
      if (gymid) {
        formData.append("gym_id", gymid);
      }
      const response = await AxiosPrivate.put(
        `/api/member/${newId}/?gym_id=${gymid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then(async () => {
        // console.log(trainer);
        // console.log(currentMembership);
        // if (
        //   (trainer !== null && currentMembership.trainer_details === null) ||
        //   (trainer !== null &&
        //     currentMembership.trainer_details !== null &&
        //     trainer !== currentMembership.trainer_details.id)
        // ) {
        //   await trainerAdd();
        // }
        invalidateAll();
        toast.success("Member updated successfully");
        router.refresh();
      });
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Something went wrong while updating member");
    }
    setLock(false);
  };

  if (!data) {
    return <Loading />;
  }

  function renderOptionDisplayValue(option: any) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex flex-col w-full gap-0.5 pl-4">
          <div className="flex items-center gap-4 text-[13px]">
            <div>
              <Text as="span" className="font-medium">
                Total Capacity :{" "}
              </Text>{" "}
              {option.capacity}{" "}
            </div>
            <div>
              <Text as="span" className="font-medium">
                Members :{" "}
              </Text>{" "}
              {option.live_member_count?.split("|")[0]}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <div className="flex items-center gap-1 text-[13px]">
              <Text className="font-medium">Start Time :</Text>
              <Text>
                {option?.start_time ? (
                  <DateCell
                    date={new Date(`2025-01-01T${option.start_time}`)}
                    dateClassName="hidden"
                    timeFormat="h:mm A"
                  />
                ) : (
                  "N/A"
                )}
              </Text>
            </div>
            <div className="flex items-center gap-1 text-[13px]">
              <Text className="font-medium">End Time :</Text>
              <Text>
                {option?.end_time ? (
                  <DateCell
                    date={new Date(`2025-01-01T${option.end_time}`)}
                    dateClassName="hidden"
                    timeFormat="h:mm A"
                  />
                ) : (
                  "N/A"
                )}
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderEmptyBatch() {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between mx-2"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-nowrap">No Batches Found</Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Batches Section");
            router.push("/batches");
          }}
          className="text-primary text-sm text-nowrap"
        >
          Add Batches <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-2 md:pt-4 overflow-y-auto space-y-4 flex flex-col h-full">
      <div className="w-full flex flex-col md:flex-row items-center gap-8 bg-primary-lighter/50 dark:bg-gray-200 p-6 rounded-xl shadow-md shadow-primary-lighter dark:shadow-gray-300 relative">
        <div className="flex flex-col">
          <span className="scale-75 place-self-end">
            {/* {data?.membership_details[0].status !== "active" ? ( */}
            {data?.membership_details[0]?.status === "active" ? (
              <Badge color="success" variant="flat">
                Active
              </Badge>
            ) : data?.membership_details[0]?.status === "expired" ? (
              <Badge color="danger" variant="flat">
                Expired
              </Badge>
            ) : data?.membership_details[0]?.status === "cancelled" ? (
              <Badge color="danger" variant="flat">
                Cancelled
              </Badge>
            ) : data?.membership_details[0]?.status === "upcoming" ? (
              <Badge color="warning" variant="flat">
                Expiring soon
              </Badge>
            ) : null}
          </span>
          <div className="relative">
            <Image
              alt={data.name || "Name"}
              src={
                imagePreview ||
                data.member_image ||
                (data?.gender && data.gender[0]?.toLowerCase() === "f"
                  ? WomanIcon
                  : ManIcon)
              }
              width={150}
              height={150}
              className="w-[150px] h-[150px] object-cover bg-primary-lighter/50 rounded-full shadow-lg ring-[6px] ring-primary/40"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-1 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors duration-200 "
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
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>
        <div className="flex flex-col space-y-4 text-center md:text-left">
          <Title as="h6" className="text-xl font-bold text-primary">
            {data.name}
          </Title>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600 ">Contact:</span>
              <div>
                {data.phone ? (
                  <Link
                    href={`tel:${data.phone}`}
                    className="text-primary  hover:underline transition-colors duration-200"
                  >
                    {data.phone}
                  </Link>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600 ">Age:</span>
              <span>{data.age || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600 ">Started:</span>
              <span>
                {data.joining_date ? (
                  <DateCell
                    date={data.joining_date}
                    dateFormat={getDateFormat()}
                    timeClassName="hidden"
                  />
                ) : (
                  "N/A"
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col self-start  md:self-end p-4 md:p-8 gap-2">
          <div className="flex flex-row gap-2 items-center">
            <Text className="font-semibold">Trainer : </Text>
            <Text className="text-primary">{trainer?.name || "N/A"}</Text>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <Text className="font-semibold">Batch : </Text>
            <Text className="text-primary">
              {batches.find((group: any) => group.value === data.batch_id)
                ?.label || "N/A"}
            </Text>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 flex items-center">
          <MdLocationOn className="text-primary" size={20} />
          <Text className="pl-1 font-medium text-gray-600  text-base">
            {(() => {
              const address = data;
              if (!address) return "N/A";
              const components = [
                address.address_street,
                address.address_city,
                address.address_state,
                address.address_country,
              ].filter(Boolean);
              return components.length > 0
                ? components.join(", ") + "."
                : "N/A";
            })()}
          </Text>
        </div>
        <div className="absolute top-8 right-8 z-10">
          <Tooltip content="Points" placement="bottom">
            <div>
              <Badge
                variant="flat"
                className="flex flex-row items-center gap-1.5 cursor-pointer scale-95"
                onClick={() =>
                  router.push(`/member_profile/${params.id}/points`)
                }
              >
                <RiCopperCoinFill className="text-primary" size={20} />
                <Text className="text-primary font-semibold text-[15px]">
                  {points || 0}
                </Text>
              </Badge>
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-y-6 gap-x-5 [&_label>span]:font-medium ">
        <Input
          name="name"
          label="Name *"
          placeholder="Enter Full Name"
          value={data.name}
          onChange={handleInputChange}
          // labelClassName="dark:text-gray-200"
        />
        <Input
          name="email"
          label="Email *"
          placeholder="Enter email"
          value={data.email}
          onChange={handleInputChange}
          // labelClassName="dark:text-gray-200"
        />
        <PhoneNumber
          label="Phone Number *"
          country="in"
          value={data.phone}
          onChange={handlePhoneChange}
          className="font-medium"
          // labelClassName="dark:text-gray-200"
        />
        {/* <div className="grid grid-cols-1 gap-2 ">
          <Text className="font-medium">Date of Birth * </Text>
          <DatePicker
            name="date_of_birth"
            value={
              data.date_of_birth
                ? formateDateValue(new Date(data.date_of_birth))
                : ""
            }
            onChange={(date: any) =>
              setData((prev: any) =>
                prev
                  ? {
                      ...prev,
                      date_of_birth: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }
                  : null
              )
            }
            placeholderText="Select Date of Birth"
            showMonthDropdown={true}
            showYearDropdown={true}
            scrollableYearDropdown={true}
            maxDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 5))
            }
            yearDropdownItemNumber={50}
            dateFormat="yyyy-MM-dd"
            className="col-span-full sm:col-span-1"
          />
        </div> */}
        <Input
          name="date_of_birth"
          type="date"
          label="Date of Birth"
          value={data.date_of_birth}
          onChange={(e) => {
            setData((prev: any) => ({
              ...prev,
              date_of_birth: e.target.value,
            }));
          }}
          placeholder="Enter Date of Birth"
        />
        <div className="grid grid-cols-1 gap-2 ">
          <Text className="font-medium ">Joining Date </Text>
          <DatePicker
            name="joining_date"
            // value={data.joining_date || ""}
            // onChange={(date: any) =>
            //   setData((prev: any) =>
            //     prev
            //       ? {
            //           ...prev,
            //           joining_date: new Date(date.getTime() + 86400000)
            //             .toISOString()
            //             .split("T")[0],
            //         }
            //       : null
            //   )
            // }
            value={
              data.joining_date
                ? formateDateValue(new Date(data.joining_date))
                : ""
            }
            onChange={(date: any) =>
              setData((prev: any) =>
                prev
                  ? {
                      ...prev,
                      joining_date: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }
                  : null
              )
            }
            placeholderText="Select Joining Date"
            showMonthDropdown={true}
            showYearDropdown={true}
            scrollableYearDropdown={true}
            // dateFormat="yyyy-MM-dd"
            className="col-span-full sm:col-span-1"
          />
        </div>
        <Select
          name="gender"
          label="Gender"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
          ]}
          value={
            data.gender
              ? data.gender[0]?.toUpperCase() + data.gender?.slice(1)
              : ""
          }
          onChange={({ value }: { label: string; value: string }) =>
            setData((prev: any) => (prev ? { ...prev, gender: value } : null))
          }
          // labelClassName="dark:text-gray-200"
          // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          clearable
          onClear={() =>
            setData((prev: any) => (prev ? { ...prev, gender: "" } : null))
          }
        />
        <Select
          label="Member Category"
          name="category_id"
          options={memberCategories}
          value={
            memberCategories.find((cat) => cat.value === data?.category_id)
              ?.label || ""
          }
          onChange={({ value }: { label: string; value: string }) =>
            setData((prev: any) =>
              prev ? { ...prev, category_id: parseInt(value) } : null
            )
          }
          // labelClassName="dark:text-gray-200"
          // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          clearable
          onClear={() =>
            setData((prev: any) =>
              prev ? { ...prev, category_id: null } : null
            )
          }
        />
        <Select
          label="Batches "
          name="batch_id"
          options={
            batches.length > 0 ? batches : [{ label: "Empty", value: "empty" }]
          }
          value={
            batches.find((group: any) => group.value === data.batch_id)
              ?.label || ""
          }
          onChange={({ value }: { label: string; value: string }) => {
            checkBatches(value);
            setData((prev: any) =>
              prev ? { ...prev, batch_id: parseInt(value) } : null
            );
          }}
          // getOptionDisplayValue={(option) => (option)}
          getOptionDisplayValue={(option) =>
            batches.length
              ? renderOptionDisplayValue(option)
              : renderEmptyBatch()
          }
          // labelClassName="dark:text-gray-200"
          // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          clearable
          onClear={() =>
            setData((prev: any) => (prev ? { ...prev, batch_id: null } : null))
          }
        />
        <Select
          label="Occupation"
          name="occupation"
          options={occupation}
          value={data?.occupation}
          onChange={(option: Option) =>
            setData((prev: any) => ({
              ...prev,
              occupation: option?.value,
            }))
          }
          clearable
          onClear={() =>
            setData((prev: any) => ({ ...prev, occupation: null }))
          }
        />
        {data.occupation === "Student" ? (
          <Input
            label="College/School"
            name="colledge_or_school"
            placeholder="Enter College/School Name"
            value={data.colledge_or_school || ""}
            onChange={handleInputChange}
          />
        ) : null}
        <Input
          label="Qualification"
          name="qualification"
          placeholder="Enter Educational Qualification"
          value={data.qualification || ""}
          onChange={handleInputChange}
        />
        <Select
          label="Blood Group"
          name="blood_group"
          options={[
            { label: "A+", value: "A+" },
            { label: "A-", value: "A-" },
            { label: "B+", value: "B+" },
            { label: "B-", value: "B-" },
            { label: "O+", value: "O+" },
            { label: "O-", value: "O-" },
            { label: "AB+", value: "AB+" },
            { label: "AB-", value: "AB-" },
          ]}
          value={data?.blood_group}
          onChange={(option: Option) =>
            setData((prev: any) => ({
              ...prev,
              blood_group: option?.value,
            }))
          }
          clearable
          onClear={() =>
            setData((prev: any) => ({ ...prev, blood_group: null }))
          }
        />
        <Input
          label="Emergency Contact Name"
          name="emergency_contact_name"
          placeholder="Emergency Contact Person"
          value={data.emergency_contact_name || ""}
          onChange={handleInputChange}
        />
        <PhoneNumber
          label="Emergency Contact Number"
          country={
            data?.address_country?.length > 0
              ? COUNTRY_MAPPINGS[data.address_country]?.code?.toLowerCase() ||
                "in"
              : "in"
          }
          value={data.emergency_contact || ""}
          onChange={(value) =>
            setData((prev: any) => ({
              ...prev,
              emergency_contact: value,
            }))
          }
        />
        <Select
          label="Marital Status"
          name="martial_status"
          options={[
            { label: "Single", value: "Single" },
            { label: "Married", value: "Married" },
            { label: "Divorced", value: "Divorced" },
            { label: "Widowed", value: "Widowed" },
          ]}
          value={data.martial_status}
          onChange={(option: Option) =>
            setData((prev: any) => ({
              ...prev,
              martial_status: option?.value,
            }))
          }
          clearable
          onClear={() =>
            setData((prev: any) => ({ ...prev, martial_status: null }))
          }
        />
        <div className="flex items-center gap-4 px-4">
          <Text>Living with Parents</Text>
          <Switch
            // label="Living with Parents"
            name="with_parents"
            checked={data.with_parents || false}
            onChange={(e) =>
              setData((prev: any) => ({
                ...prev,
                with_parents: e.target.checked,
              }))
            }
          />
        </div>
        <Input
          label="Parent's Name"
          name="parents_name"
          placeholder="Enter Parent's Name"
          value={data.parents_name || ""}
          onChange={handleInputChange}
        />
        <PhoneNumber
          label="Parent's Contact"
          country={
            data?.address_country?.length > 0
              ? COUNTRY_MAPPINGS[data.address_country]?.code?.toLowerCase() ||
                "in"
              : "in"
          }
          value={data.parents_contact || ""}
          onChange={(value) =>
            setData((prev: any) => ({ ...prev, parents_contact: value }))
          }
        />
        <Input
          label="Medical History"
          name="medical_history"
          placeholder="Enter Medical History/Conditions"
          value={data.medical_history || ""}
          onChange={handleInputChange}
        />
        <Input
          label="Reference"
          name="reference"
          placeholder="How did you hear about us?"
          value={data.reference || ""}
          onChange={handleInputChange}
        />
        <Input
          label="Remarks"
          name="remarks"
          placeholder="Any additional remarks"
          value={data.remarks || ""}
          onChange={handleInputChange}
        />
        <Input
          label="Instagram Handle"
          name="ig"
          placeholder="@username"
          value={data.ig || ""}
          onChange={handleInputChange}
          prefix={<FaInstagram size={20} />}
        />
        <Input
          name="address_street"
          label="Address"
          placeholder="Address"
          className="col-span-full"
          value={data.address_street}
          onChange={handleInputChange}
          // labelClassName="dark:text-gray-200"
        />
        <Select
          label="Country"
          value={data.address_country}
          options={countryOptions}
          onChange={(selectedValue: string) =>
            setData((prev: any) =>
              prev ? { ...prev, address_country: selectedValue } : null
            )
          }
          getOptionValue={(option) => option.value}
          className="col-span-full sm:col-span-1"
          clearable
          // labelClassName="dark:text-gray-200"
          // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
        />
        <Input
          name="address_zip_code"
          label="ZIP / Postcode"
          placeholder="ZIP / postcode"
          value={data.address_zip_code}
          onChange={handleInputChange}
          // labelClassName="dark:text-gray-200"
        />
      </div>
      <div className="mt-6 flex justify-center">
        <Button
          variant="solid"
          color="primary"
          onClick={handleEdit}
          disabled={lock}
          className="w-40"
        >
          {lock ? <Loader variant="threeDot" /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
