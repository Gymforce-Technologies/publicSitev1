"use client";

import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { PiEnvelopeSimple } from "react-icons/pi";
// import { Form } from "@ui/form";
import { Loader, Text, Input, Button } from "rizzui";
import FormGroup from "@/app/shared/form-group";
import FormFooter from "@core/components/form-footer";
// import {
//   defaultValues,
//   personalInfoFormSchema,
//   PersonalInfoFormTypes,
// } from "@/validators/personal-info.schema";
// import UploadZone from "@ui/file-upload/upload-zone";
// import AvatarUpload from "@ui/file-upload/avatar-upload";
// import { useTranslation } from "@/app/i18n/client";
// import { CustomerProfileSchema } from "@/validators/customer-profile.schema";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
// import axios from "axios";
import { getAccessToken } from "@/app/[locale]/auth/Acces";
import { PhoneNumber } from "@core/ui/phone-input";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface profileSchema {
  email: string;
  first_name: string;
  last_name: string;
  // is_superuser: boolean;
  // with_subscription: boolean;
  phone: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  email_verified: boolean;
  profile_image: any | null;
  // subscription_end_date: string | null;
  // valid_days_left: number;
  // associated_gyms: {
  //   gym_id: string;
  //   name: string;
  //   created_by: string;
  // }[];
  // is_on_trial: boolean;
  // is_staff_role: boolean;
}

export default function PersonalInfoView({ lang }: { lang?: string }) {
  // const t = useTranslations("form");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phoneCountry, setPhoneCountry] = useState("IN");
  const [userID, setUserID] = useState<string | null>(null);
  const router = useRouter();
  const [primaryId, setPrimaryId] = useState<string>("");
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm<profileSchema>({
    mode: "onChange",
  });

  // Fetch data and set form values
  const fetchData = async () => {
    try {
      const response = await AxiosPrivate("/api/profile", {
        id: newID("userprofile-request"),
      });
      const data: profileSchema = await response.data;
      setValue("first_name", data.first_name);
      setValue("last_name", data.last_name);
      setValue("phone", data.phone);
      setValue("street", data.street);
      setValue("city", data.city);
      setValue("state", data.state);
      setValue("email", data.email);
      setValue("country", data.country);
      setValue("first_name", data.first_name);
      setValue("zip_code", data.zip_code);
      setEmailVerified(data.email_verified);
      console.log(data);
      setUserID(response.data.user_id);
      setImagePreview(data.profile_image);
      const primaryID =
        response.data.associated_gyms.find(
          (gym: any) => gym.is_primary === true
        ) || response.data.associated_gyms[0];
      setPrimaryId(primaryID.gym_id);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while fetching data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: profileSchema) => {
    const jsonData = JSON.stringify(data, null, 2);
    console.log("Submitted Data in JSON format:", jsonData);
    try {
      const token = getAccessToken();
      console.log(data);
      const { email, ...updateData } = data;
      const newData = { ...updateData, phone: "+" + updateData.phone };
      console.log(newData);
      await AxiosPrivate.put(
        `${process.env.NEXT_PUBLIC_URL}/api/updateprofile/`,
        newData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      ).then(() => invalidateAll());
      router.refresh();
      toast.success("profile updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while updating failed");
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    console.log(file);
    if (file) {
      setValue("profile_image", file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setImagePreview(reader.result as string);
    }
  };
  const handleVerifyEmail = async () => {
    try {
      const response = await AxiosPrivate.post(
        "/api/send-verification-email/"
      ).then(() => invalidateAll());
      toast.success("Verification Link Sent SuccessFully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while sending verification email");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="@container max-sm:p-2 "
      >
        <FormGroup
          title={"Personal Information"}
          description={"Update your personal information."}
          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
        />

        <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
          <FormGroup
            title="Profile"
            description="Upload your Profile."
            className="pt-5 @2xl:pt-9  @3xl:pt-11"
          >
            <div className="flex flex-col gap-6 @container max-w-xl">
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
                className=""
              >
                {imagePreview ? "Change Profile" : "Upload Profile"}
              </Button>

              <div className="mt-2 flex flex-1 justify-center items-center w-full ">
                <div className="w-36 h-36 relative">
                  <Image
                    src={
                      imagePreview
                        ? imagePreview
                        : "https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp"
                    }
                    alt="Profile Image"
                    layout="fill"
                    fill
                    objectFit="cover"
                    className="rounded-full shadow-md"
                  />
                </div>
              </div>
            </div>
          </FormGroup>

          <FormGroup
            title={"Full Name"}
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11 "
          >
            <Input
              label={"First Name"}
              placeholder="First Name"
              {...register("first_name")}
              error={errors.first_name?.message!}
              className="flex-grow max-w-xl"
            />
            <Input
              label={"Last Name"}
              placeholder="Last Name"
              {...register("last_name")}
              error={errors.last_name?.message!}
              className="flex-grow max-w-xl"
            />
          </FormGroup>
          <FormGroup
            title={"Phone Number"}
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Controller
              name="phone"
              control={control}
              rules={{
                required: "Phone number is required",
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <PhoneNumber
                  country={phoneCountry}
                  value={value}
                  onChange={(phoneNumber) => {
                    onChange(phoneNumber);
                  }}
                  className="[&>label>span]:font-medium  max-w-xl"
                  error={errors.phone?.message}
                />
              )}
            />
          </FormGroup>
          <FormGroup
            title={"Email Address"}
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <div className="flex flex-col gap-4 max-w-xl">
              <Input
                prefix={<PiEnvelopeSimple className="h-6 w-6 text-gray-500" />}
                type="email"
                placeholder={"Email Address"}
                {...register("email")}
                error={errors.email?.message!}
                disabled
                className="max-w-xl"
              />
              <Button
                size="sm"
                onClick={handleVerifyEmail}
                disabled={emailVerified}
                className=" self-end"
              >
                {emailVerified ? "Email Verified" : "Verify Email"}
              </Button>
            </div>
          </FormGroup>

          {/* Replace Select components with Input for address fields */}
          <FormGroup
            title={"Address"}
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder={"Street"}
              {...register("street")}
              error={errors.street?.message!}
              className="col-span-full max-w-xl"
            />
          </FormGroup>

          <FormGroup
            title={"City"}
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder={"City"}
              {...register("city")}
              error={errors.city?.message!}
              className="col-span-full max-w-xl"
            />
          </FormGroup>

          <FormGroup
            title={"State"}
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder={"State"}
              {...register("state")}
              error={errors.state?.message!}
              className="col-span-full max-w-xl"
            />
          </FormGroup>

          <FormGroup
            title={"Country"}
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder={"Country"}
              {...register("country")}
              error={errors.country?.message!}
              className="col-span-full max-w-xl"
            />
          </FormGroup>

          <FormGroup
            title={"Zip Code"}
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder={"Zip Code"}
              {...register("zip_code")}
              error={errors.zip_code?.message!}
              className="col-span-full max-w-xl"
            />
          </FormGroup>
        </div>

        <FormFooter altBtnText={"Cancel"} submitBtnText={"Save Changes"} />
      </form>
    </>
  );
}
