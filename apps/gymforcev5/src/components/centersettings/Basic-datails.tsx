"use client";

import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { useFieldArray, useForm } from "react-hook-form";
import { PiEnvelopeSimple } from "react-icons/pi";
import FormGroup from "@/app/shared/form-group";
import FormFooter from "@core/components/form-footer";

import {
  // basicDetailsFormSchema,
  defaultValues,
  // basicdetailFormTypes,
} from "@/validators/center-basic-details";
import { useEffect, useRef, useState } from "react";
// import axios from "axios";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
// import { getAccessToken } from "@/app/[locale]/auth/Acces";
import Image from "next/image";
import { Button, Input, Loader, Text } from "rizzui";
// import { useTheme } from "next-themes";
// import { darkTheme, lightTheme } from "@/app/shared/theme-config";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { PhoneNumber } from "@core/ui/phone-input";
import {
  getDateFormat,
  Options,
  setDateFormate,
  setTimeZoneVal,
  timzoneOptions,
} from "@/app/[locale]/auth/DateFormat";
import { useRouter } from "next/navigation";
import { FaMinusCircle } from "react-icons/fa";

const Select = dynamic(() => import("rizzui").then((mod) => mod.Select), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Loader variant="spinner" />
    </div>
  ),
});

interface FormData {
  name: string;
  email: string;
  currency: string;
  username: string;
  street: string;
  city: string;
  zip_code: string;
  contact_no: any;
  country: string;
  alt_contact_no: number;
  contact_number_length: number;
  state: string;
  gym_image?: File;
  ownerSignature?: File;
  whatsapp_number?: string;
  timezone?: string;
  termsAndCondition: Array<{ value: string }>;
}
export default function BasicDetailView() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [contact, setContact] = useState("");
  // const [isWhatsAppVerified, setIsWhatsAppVerified] = useState(false);
  const [dateformat, setDateformat] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const router = useRouter();
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      termsAndCondition: [],
    },
  });

  useEffect(() => {
    const initializeGymData = async () => {
      const gymId: string | null = await retrieveGymId();
      await fetchGymData(gymId, setValue);
      console.log("Values after setting:", getValues());
    };
    initializeGymData();
  }, [setValue, getValues]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "termsAndCondition",
  });

  const fetchGymData = async (gymId: string | null, setValue: any) => {
    try {
      const response = await AxiosPrivate.get(`/api/get-gym/${gymId}/`, {
        id: newID(`get-gym-${gymId}`),
      });
      const data = response.data;
      console.log("Fetched data:", data);
      setValue("termsAndCondition", data.termsAndCondition || "");
      setValue("name", data.name || "");
      setValue("contact_no", data.contact_no ? Number(data.contact_no) : 0);
      setValue(
        "alt_contact_no",
        data.alt_contact_no ? Number(data.alt_contact_no) : 0
      );
      setValue("email", data.email || "");
      setValue("street", data.street || "");
      setValue("city", data.city || "");
      setValue("zip_code", data.zip_code || "");
      setValue("state", data.state || "");
      setValue("country", data.country || "");
      setValue("currency", data.currency || "");
      setValue("contact_number_length", data.contact_number_length || 0);
      setValue("whatsapp_number", data.whatsapp_number || "");
      // setValue("timezone", data.timezone);
      setTimeZone(data.timezone);
      console.log("Fetched timezone:", data.timezone);
      const termsArray = data.termsAndCondition
        ? data.termsAndCondition.split("\r\n").filter(Boolean)
        : [];
      console.log(termsArray);
      // Set terms a  nd conditions
      setValue(
        "termsAndCondition",
        termsArray.map((term: any) => ({ value: term }))
      );
      setImagePreview(data.gym_image);
      setSignaturePreview(data.ownerSignature);
      console.log("Fetched gym_image URL:", data.gym_image);
      console.log("Fetched ownerSignature URL:", data.ownerSignature);
      setContact(data.contact_no);
      const format = getDateFormat();
      setDateformat(format);
    } catch (error) {
      console.log(error);
    }
  };
  const onSubmit = async (data: FormData) => {
    try {
      console.log(data);
      // const token =await getAccessToken();
      const gymId = await retrieveGymId();
      const termsAndConditionString = data.termsAndCondition
        .map((term) => term.value)
        .filter((term) => term.trim() !== "") // Remove empty terms
        .join("\r\n");

      // Create payload with converted terms
      const payload = {
        ...data,
        termsAndCondition: termsAndConditionString,
      };
      await AxiosPrivate.put(
        `/api/update-gym/${gymId}/`,
        { ...payload, timezone: timeZone },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      ).then(() => {
        invalidateAll();
        setTimeZoneVal(timeZone);
        setDateFormate(dateformat);
        router.refresh();
        fetchGymData(gymId, setValue);
      });
      toast.success(<Text as="b">Successfully updated!</Text>);
    } catch (error) {
      console.error("Error updating gym data:", error);
      toast.error(<Text as="b">Something went wrong while updating!</Text>);
    }
  };
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // setValue("gym_image", file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setImagePreview(reader.result as string);
      setValue("gym_image", file);
      console.log("Image preview state:", imagePreview);
    }
  };
  const handleSignatureChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setSignaturePreview(reader.result as string);
      setValue("ownerSignature", file);
      console.log("Signature preview state:", signaturePreview);
    }
  };
  const checkWhatsApp = async (value: string) => {
    const gymId = await retrieveGymId();
    try {
      const resp = await AxiosPrivate.post(
        `api/whatsapp-test-message/?gym_id=${gymId}`,
        {
          whatsapp_number: value,
        }
      ).then((res) => {
        toast.success(res.data.message);
      });
    } catch (error: any) {
      console.log("Error:", error.response.data.error);
      toast.error(error.response.data.error);
      console.error("WhatsApp verification failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="@container">
      <>
        <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 ">
          <FormGroup
            title="Center Logo"
            description="Upload your Center logo."
            className="pt-5 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <div className="flex flex-col gap-6 @container @3xl:col-span-2 justify-center max-w-xl items-center">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                {imagePreview ? "Change" : "Upload"} Logo
              </Button>
              {imagePreview ? (
                <div className="w-36 h-36 relative">
                  <Image
                    src={imagePreview}
                    alt="Profile Preview"
                    layout="fill"
                    fill
                    objectFit="cover"
                    className="rounded-full shadow-md"
                  />
                </div>
              ) : null}
            </div>
          </FormGroup>
          <FormGroup
            title="Center Name"
            className="pt-5 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder="Center Name"
              {...register("name")}
              error={errors.name?.message}
              className="col-span-full max-w-full sm:max-w-xl"
            />
          </FormGroup>
          <FormGroup
            title="Contact"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            {/* <Input
                type="number"
                placeholder="Primary Contact"
                {...register('contact_no', { valueAsNumber: true })}
                error={errors.contact_no?.message}
                className="flex-grow"
              /> */}
            <PhoneNumber
              country="in"
              value={contact}
              onChange={(value) =>
                setValue("contact_no", value, { shouldValidate: true })
              }
              className="col-span-full max-w-full sm:max-w-xl"
            />
            {/* <Input
                type="number"
                placeholder="Alternative Contact"
                {...register('alt_contact_no', { valueAsNumber: true })}
                className="flex-grow"
              /> */}
          </FormGroup>
          <FormGroup
            title="Email Address"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              className="col-span-full max-w-full sm:max-w-xl"
              prefix={<PiEnvelopeSimple className="h-6 w-6 text-gray-500" />}
              type="email"
              placeholder="example@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
          </FormGroup>
          <FormGroup
            title="WhatsApp Number"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <div className="flex flex-col sm:flex-row gap-4  max-w-full sm:max-w-xl sm:items-end col-span-full">
              <PhoneNumber
                country="in"
                value={getValues("whatsapp_number") || ""}
                onChange={(value) =>
                  setValue("whatsapp_number", value, { shouldValidate: true })
                }
                className="flex-grow sm:min-w-96"
              />
              {getValues("whatsapp_number") && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    checkWhatsApp(getValues("whatsapp_number") || "")
                  }
                  className="whitespace-nowrap max-sm:self-end"
                >
                  Verify WhatsApp
                </Button>
              )}
            </div>
          </FormGroup>
          <FormGroup
            title="Address"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder="Enter your Address"
              {...register("street")}
              error={errors.street?.message}
              className="col-span-full max-w-full sm:max-w-xl"
            />
          </FormGroup>
          {/* <FormGroup title="City" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
              <Input
                placeholder="Enter your city"
                {...register('city')}
                error={errors.city?.message}
                className="col-span-full max-w-full sm:max-w-xl"
              />
            </FormGroup> */}
          <FormGroup
            title="Zip Code"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder="Enter your Zip Code"
              {...register("zip_code")}
              error={errors.zip_code?.message}
              className="col-span-full max-w-full sm:max-w-xl"
            />
          </FormGroup>
          {/* <FormGroup title="State" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
              <Input
                placeholder="Enter your State"
                {...register('state')}
                error={errors.state?.message}
                className="col-span-full max-w-full sm:max-w-xl"
              />
            </FormGroup> */}
          <FormGroup
            title="Country"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder="Enter your country"
              {...register("country")}
              error={errors.country?.message}
              className="col-span-full max-w-full sm:max-w-xl"
              disabled
            />
          </FormGroup>
          <FormGroup
            title="Currency"
            className="pt-5 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder="Currency"
              {...register("currency")}
              error={errors.currency?.message}
              className="col-span-full max-w-full sm:max-w-xl"
            />
          </FormGroup>
          {/* <FormGroup title="Contact Number Length" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
              <Input
                type="number"
                placeholder="Enter Length"
                {...register('contact_number_length', { valueAsNumber: true })}
                error={errors.contact_number_length?.message}
                className="col-span-full max-w-full sm:max-w-xl"
              />
            </FormGroup> */}
          <FormGroup
            title="Time Zone"
            className="pt-5 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            {/* <Input placeholder="TimeZone"  /> */}
            <Select
              placeholder="TimeZone"
              value={timzoneOptions.find((item) => item === timeZone)}
              options={timzoneOptions.map((opt: string) => {
                return { label: opt, value: opt };
              })}
              onChange={(option: any) => setTimeZone(option.value)}
              searchable
              className="col-span-full max-w-full sm:max-w-xl"
            />
          </FormGroup>
          <FormGroup
            title="Date Format"
            className="pt-5 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Select
              placeholder="Your Date Format"
              value={dateformat}
              options={Options.map((opt: string) => {
                return { label: opt, value: opt };
              })}
              onChange={(option: any) => setDateformat(option.value)}
              className="col-span-full max-w-full sm:max-w-xl"
            />
          </FormGroup>
          <FormGroup
            title="Owner Signature"
            description="Upload your signature."
            className="pt-5 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <div className="flex flex-col gap-6 @container @3xl:col-span-2 justify-center max-w-xl items-center">
              <input
                type="file"
                accept="image/*"
                ref={signatureInputRef}
                onChange={handleSignatureChange}
                style={{ display: "none" }}
              />
              <Button
                type="button"
                onClick={() => signatureInputRef.current?.click()}
                className="w-full"
              >
                {signaturePreview ? "Change" : "Upload"} Signature
              </Button>
              {signaturePreview ? (
                <div className="w-40 h-20 relative">
                  <Image
                    src={signaturePreview}
                    alt="Signature Preview"
                    layout="fill"
                    fill
                    objectFit="contain"
                    className="rounded-md shadow-md"
                  />
                </div>
              ) : null}
            </div>
          </FormGroup>
          <FormGroup
            title="Terms and Conditions"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="col-span-full grid grid-cols-[2%,80%,10%,8%] gap-2"
              >
                <Text className=" my-auto">{index + 1}.</Text>
                <Input
                  placeholder={`Enter Term ${index + 1}`}
                  {...register(`termsAndCondition.${index}.value` as const)}
                  error={errors.termsAndCondition?.[index]?.value?.message}
                  className=""
                />
                <FaMinusCircle
                  onClick={() => remove(index)}
                  className="text-red-400 my-auto cursor-pointer hover:scale-105"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ value: "" })}
              className="mt-2 max-sm:place-self-center"
            >
              Add Term
            </Button>
          </FormGroup>
        </div>

        <FormFooter altBtnText="Cancel" submitBtnText="Save" />
      </>
    </form>
  );
}
