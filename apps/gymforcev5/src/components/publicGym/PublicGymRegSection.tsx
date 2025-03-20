"use client";

import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Input,
  RadioGroup,
  Radio,
  Select,
  Text,
  Textarea,
  Button,
  Tooltip,
  Title,
  Avatar,
  Modal,
} from "rizzui";
import { DatePicker } from "@core/ui/datepicker";
import { PhoneNumber } from "@core/ui/phone-input";
import Loading from "@/app/[locale]/loading";
import { MdFeedback } from "react-icons/md";
import { FaFacebook, FaInstagram } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
// import CameraCapture from "@/components/member-list/Capture";
// import Turnstile from "react-turnstile";
// import FeedbackModal from "@/components/public-page/FeedBack";
import dynamic from "next/dynamic";
const CameraCapture = dynamic(
  () => import("@/components/Capture"),
  {
    ssr: false,
  }
);
const Turnstile = dynamic(() => import("react-turnstile"));
const FeedbackModal = dynamic(
  () => import("@/components/public-page/FeedBack"),
  {
    ssr: false,
  }
);
import { ArrowLeft, ArrowRight, CheckCircle, Phone } from "lucide-react";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import SuccessModal from "./SuccessModal";
import PublicHeader from "./PublicHeader";

interface RegistrationData {
  name: string;
  phone: string;
  email: string;
  visitor_image?: File | null;
  gender: "male" | "female" | "other" | "";
  martial_status: "single" | "married" | "";
  date_of_birth: string;
  tentative_joining_date: string;
  package_id: number | null;
  // offer_id: number | null;
  address_street: string;
  address_city: string;
  address_zip_code: string;
  address_state: string;
  address_country: string;
  enquiry_message: string;
  remarks: string;
  source_id: number;
  visiting_center: string;
  user: string;
}

export default function PublicGymRegSection() {
  const { code } = useParams(); // dynamic URL part
  const params = useSearchParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gymId, setGymId] = useState<any>(null);
  const [data, setData] = useState<RegistrationData>({
    name: "",
    phone: "",
    email: "",
    gender: "",
    martial_status: "",
    date_of_birth: "",
    tentative_joining_date: "",
    package_id: null,
    address_street: "",
    address_city: "",
    address_zip_code: "",
    address_state: "",
    address_country: "India",
    enquiry_message: "",
    remarks: "",
    source_id: 6,
    visitor_image: null,
    user: "",
    visiting_center: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegistrationData, string>>
  >({});
  const [phoneCountry, setPhoneCountry] = useState("us");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [requiredFieldsList, setRequiredFieldsList] = useState({
    Name: false,
    Email: false,
    Gender: false,
    Source: false,
    Status: false,
    Address: false,
    Country: false,
    Remarks: false,
    Category: false,
    "Contacted By": false,
    "Package Type": false,
    "Phone Number": false,
    "Date of Birth": false,
    "Zip / Postcode": false,
    "Interested Package": false,
    "Expected Joining Date": false,
    "Enquiry's Interested Offer": false,
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    requestAnimationFrame(() => {
      inputRefs.current[name]?.focus();
    });
  };
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));
  useEffect(() => {
    if (initialData?.country_code) {
      setPhoneCountry(initialData?.country_code?.toLowerCase());
      console.log(initialData?.country_code?.toLowerCase());
    }
    if (initialData?.country) {
      setData((prev) => ({ ...prev, address_country: initialData.country }));
    }
    if (initialData?.user) {
      setData((prev) => ({ ...prev, user: initialData.user }));
    }
    if (initialData?.id) {
      setData((prev) => ({ ...prev, visiting_center: initialData.id }));
    }
  }, [initialData]);
  const packages = initialData?.listPackages.map((pkg: any) => ({
    label: `${pkg.name} (${initialData?.currency_symbol}${pkg.max_price}) - ${pkg.num_of_days} days`,
    value: pkg.id,
    ...pkg,
  }));

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const resp = await AxiosPublic.get(
          `https://apiv2.gymforce.in/center/initial/${code}/`,
          {
            id: `Gym-${code}`,
          }
        );
        setInitialData(resp.data);
        setGymId(resp.data.id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching gym data:", error);
        setLoading(false);
        toast.error("Failed to load gym data");
      }
    };

    getInitialData();
  }, []);

  useEffect(() => {
    const getRequiredFields = async () => {
      try {
        const resp = await AxiosPublic.get(
          `/api/dynamic-fields/enquiry/?gym_id=${gymId}`,
          {
            id: `enquiry-fields`,
          }
        );
        setRequiredFieldsList(resp.data.oFields);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch enquiry fields");
      }
    };
    if (gymId) {
      getRequiredFields();
    }
  }, [gymId]);

  const submitForm = async () => {
    try {
      const uuid = params.get("uuid");
      let newData;
      if (uuid) {
        newData = {
          ...data,
          uuid: uuid,
        };
      } else {
        newData = data;
      }
      const response = await axios.post(
        `https://apiv2.gymforce.in/api/register-public-enquiry-w-details/`,
        newData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Registration completed successfully!");
      setShowSuccessModal(true);
      setIsSubmitted(true);
      setData({
        name: "",
        phone: "",
        email: "",
        gender: "",
        martial_status: "",
        date_of_birth: "",
        tentative_joining_date: "",
        package_id: null,
        address_street: "",
        address_city: "",
        address_zip_code: "",
        address_state: "",
        address_country: "India",
        enquiry_message: "",
        remarks: "",
        source_id: 6,
        visitor_image: null,
        user: "",
        visiting_center: "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to Register Retry!!!.");
    }
  };

  const handleCameraCapture = (file: File) => {
    setData((prev) => ({ ...prev, visitor_image: file }));
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setData((prev) => ({ ...prev, visitor_image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      // setValidationErrors((prev) => ({ ...prev, visitor_image: "" }));
    }
  };

  const FieldsView = useCallback(
    ({ title }: { title: "Required" | "Additional" }) => {
      return (
        <div className=" grid md:grid-cols-2 items-center gap-4 mt-4 col-span-full">
          {(title === "Required" && requiredFieldsList.Email) ||
          (title === "Additional" && !requiredFieldsList.Email) ? (
            <Input
              name="email"
              // label="Email"
              type="email"
              label={`Email ${title === "Required" ? "*" : ""}`}
              placeholder="Enter Email"
              value={data.email}
              onChange={handleInputChange}
              ref={(el: any) => (inputRefs.current["email"] = el)}
            />
          ) : null}
          {(title === "Required" && requiredFieldsList.Gender) ||
          (title === "Additional" && !requiredFieldsList.Gender) ? (
            <div className="space-y-2">
              <Text className="font-medium">
                Gender {title === "Required" ? "*" : ""}
              </Text>
              <RadioGroup
                value={data.gender}
                setValue={(value) =>
                  //@ts-ignore
                  setData((prev) => ({ ...prev, gender: value }))
                }
                className="flex gap-4"
              >
                <Radio label="Male" value="male" />
                <Radio label="Female" value="female" />
                <Radio label="Other" value="other" />
              </RadioGroup>
            </div>
          ) : null}
          {(title === "Required" &&
            requiredFieldsList["Expected Joining Date"]) ||
          (title === "Additional" &&
            !requiredFieldsList["Expected Joining Date"]) ? (
            <div>
              <label className="block mb-2 font-medium">
                Expected Joining Date {title === "Required" ? "*" : ""}
              </label>
              <DatePicker
                name="tentative_joining_date"
                value={data.tentative_joining_date}
                onChange={(date: any) =>
                  setData((prev) => ({
                    ...prev,
                    tentative_joining_date: date.toISOString().split("T")[0],
                  }))
                }
                minDate={new Date()}
                placeholderText="Select joining date"
              />
            </div>
          ) : null}
          {/* <div>
                <label className="block mb-2 font-medium">Date of Birth</label>
                <DatePicker
                  name="date_of_birth"
                  value={data.date_of_birth}
                  onChange={(date: any) =>
                    setData((prev) => ({
                      ...prev,
                      date_of_birth: date?.toISOString().split("T")[0],
                    }))
                  }
                  maxDate={new Date()}
                  showYearDropdown
                  showMonthDropdown
                  yearDropdownItemNumber={50}
                  placeholderText="Select date of birth"
                />
              </div> */}
          {(title === "Required" && requiredFieldsList["Date of Birth"]) ||
          (title === "Additional" && !requiredFieldsList["Date of Birth"]) ? (
            <Input
              name="date_of_birth"
              type="date"
              // label="Date of Birth"
              label={`Date of Birth ${title === "Required" ? "*" : ""}`}
              value={data.date_of_birth ?? ""}
              onChange={(e) => {
                setData((prev: any) => ({
                  ...prev,
                  date_of_birth: e.target.value,
                }));
              }}
              placeholder="Enter Date of Birth"
            />
          ) : null}
          {title === "Additional" ? (
            <div className="space-y-2">
              <Text className="font-medium">Marital Status</Text>
              <RadioGroup
                value={data.martial_status}
                setValue={(value) =>
                  //@ts-ignore
                  setData((prev) => ({ ...prev, martial_status: value }))
                }
                className="flex gap-4"
              >
                <Radio label="Single" value="single" />
                <Radio label="Married" value="married" />
              </RadioGroup>
            </div>
          ) : null}
          {/* Address Information */}
          {(title === "Required" && requiredFieldsList.Address) ||
          (title === "Additional" && !requiredFieldsList.Address) ? (
            <Input
              name="address_street"
              // label="Address"
              label={`Address ${title === "Required" ? "*" : ""}`}
              placeholder="Enter street address"
              value={data.address_street}
              onChange={handleInputChange}
              ref={(el: any) => (inputRefs.current["address_street"] = el)}
              // className="col-span-full"
            />
          ) : null}
          {(title === "Required" && requiredFieldsList["Zip / Postcode"]) ||
          (title === "Additional" && !requiredFieldsList["Zip / Postcode"]) ? (
            <Input
              name="address_zip_code"
              // label="ZIP Code"
              label={`ZIP Code ${title === "Required" ? "*" : ""}`}
              placeholder="Enter ZIP code"
              value={data.address_zip_code}
              onChange={handleInputChange}
              ref={(el: any) => (inputRefs.current["address_zip_code"] = el)}
            />
          ) : null}
          {/* <Input
                name="address_country"
                label="Country"
                value={data.address_country}
                onChange={handleInputChange}
              /> */}
          {(title === "Required" && requiredFieldsList.Country) ||
          (title === "Additional" && !requiredFieldsList.Country) ? (
            <Select
              // label="Country "
              label={`Country ${title === "Required" ? "*" : ""}`}
              value={data.address_country}
              options={countryOptions}
              onChange={(selectedValue: string) =>
                setData((prev) => ({
                  ...prev,
                  address_country: selectedValue,
                }))
              }
            />
          ) : null}
          {(title === "Required" && requiredFieldsList["Interested Package"]) ||
          (title === "Additional" &&
            !requiredFieldsList["Interested Package"]) ? (
            <Select
              // label="Interested Package "
              label={`Interested Package ${title === "Required" ? "*" : ""}`}
              options={packages}
              value={
                packages
                  .find((pkg: any) => pkg.value === data.package_id)
                  ?.label?.split("(")[0]
              }
              onChange={(option: any) => {
                setData((prev) => ({
                  ...prev,
                  package_id: option?.value || null,
                }));
              }}
              className={"place-self-start"}
            />
          ) : null}
          {(title === "Required" && requiredFieldsList.Remarks) ||
          (title === "Additional" && !requiredFieldsList.Remarks) ? (
            <Textarea
              name="enquiry_message"
              // label="Message"
              label={`Message ${title === "Required" ? "*" : ""}`}
              placeholder="Enter your enquiry or questions"
              value={data.enquiry_message}
              onChange={handleInputChange}
              ref={(el: any) => (inputRefs.current["enquiry_message"] = el)}
            />
          ) : null}
        </div>
      );
    },
    [requiredFieldsList, data, packages]
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {loading || !initialData ? (
        <Loading />
      ) : (
        <>
          <div className="bg-primary text-gray-100 py-3 md:py-6 sticky top-0 z-[99999]">
            <PublicHeader
              initialData={initialData}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
          <div className="p-4 md:p-6 mx-4 md:mx-8 flex items-center gap-4 md:gap-8">
            <Link href={`/gym/${code}`}>
              <ArrowLeft size={18} />
            </Link>
            <Title className="text-xl md:text-2xl font-bold">
              Register at {initialData?.name}
            </Title>
          </div>
          <div className="p-6 md:p-8 lg:p-12 max-w-screen-lg mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className=" grid grid-cols-2 items-center gap-4 col-span-full md:max-w-[50%]">
                <div className="flex flex-col justify-start gap-2">
                  <Text className="text-sm font-medium ">Profile Image </Text>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    name="member_image"
                  />
                  <div className="flex max-sm:flex-col sm:items-center gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="max-w-28 sm:max-w-40"
                    >
                      Upload
                    </Button>
                    <Button
                      onClick={() => setShowCamera(true)}
                      variant="outline"
                      className="max-w-28 sm:max-w-40"
                    >
                      Take Photo
                    </Button>
                  </div>
                </div>
                {imagePreview && (
                  <div className="size-32 md:size-40 relative">
                    <Image
                      src={imagePreview}
                      alt="Profile Preview"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full shadow-md"
                    />
                  </div>
                )}
              </div>{" "}
              {requiredFieldsList.Name ? (
                <Input
                  name="name"
                  label="Name *"
                  placeholder="Enter Full Name"
                  value={data.name}
                  onChange={handleInputChange}
                  error={errors.name}
                />
              ) : null}
              {requiredFieldsList["Phone Number"] ? (
                <PhoneNumber
                  label="Phone Number *"
                  country={phoneCountry}
                  value={data.phone}
                  onChange={(value) =>
                    setData((prev) => ({ ...prev, phone: value }))
                  }
                  error={errors.phone}
                />
              ) : null}
            </div>
            {/* Add Turnstile Widget */}
            <FieldsView title="Required" />
            {!requiredFieldsList.Name ? (
              <Input
                name="name"
                label="Name "
                placeholder="Enter Full Name"
                value={data.name}
                onChange={handleInputChange}
                error={errors.name}
              />
            ) : null}
            {!requiredFieldsList["Phone Number"] ? (
              <PhoneNumber
                label="Phone Number "
                country={phoneCountry}
                value={data.phone}
                onChange={(value) =>
                  setData((prev) => ({ ...prev, phone: value }))
                }
                error={errors.phone}
              />
            ) : null}
            <FieldsView title="Additional" />
            <div className="flex min-w-full items-center justify-center my-4">
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || ""}
                onVerify={(token) => {
                  console.log("Turnstile verified:", token);
                  setTurnstileToken(token);
                }}
                onError={(error) => {
                  console.error("Turnstile error:", error);
                  // Optional: Handle error state
                }}
                theme="light"
                refreshExpired="auto"
              />
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={async () => {
                  if (!turnstileToken) {
                    toast.error("Please complete the security verification");
                    return;
                  }
                  await submitForm();
                }}
                //   className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Register
              </Button>
            </div>
            <FeedbackModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              gymId={gymId}
            />
            <CameraCapture
              onCapture={handleCameraCapture}
              onClose={() => setShowCamera(false)}
              showCamera={showCamera}
            />
          </div>
          {isSubmitted && (
            <SuccessModal
              code={code as string}
              initialData={initialData}
              setShowSuccessModal={setShowSuccessModal}
              showSuccessModal={showSuccessModal}
            />
          )}
        </>
      )}
    </div>
  );
}
