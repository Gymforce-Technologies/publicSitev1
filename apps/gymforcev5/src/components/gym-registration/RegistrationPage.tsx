"use client";
// import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from "react";
import {
  Title,
  Input,
  Button,
  Select,
  Stepper,
  Tooltip,
  Text,
  AdvancedRadio,
} from "rizzui";
import { PhoneNumber } from "@core/ui/phone-input";
import { PiArrowRightBold } from "react-icons/pi";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import Info from "./Info";
import Image from "next/image";
import Link from "next/link";
import logoImg from "@public/svg/icon/gymforce-icon-black.svg";
import logoImgText from "@public/svg/gymforce-text/gymforce-text-black.svg";
import { AxiosPrivate, invalidateAll } from "../../app/[locale]/auth/AxiosPrivate";
import { deleteGymId, setGymId } from "../../app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { IoIosCheckmarkCircle } from "react-icons/io";

interface FormData {
  name: string;
  // business_name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  email: string;
  contact_no: string;
  website: string;
  center: "Gym" | "Library" | "Dance";
}

export default function RegistrationPage({
  nextStep,
}: {
  nextStep: () => void;
}) {
  const search = useSearchParams();

  const [currentStep, setCurrentStep] = useState(0);
  // const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    email: "",
    contact_no: "",
    website: "",
    center: "Gym",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (selectedValue: string) => {
    setFormData((prev) => ({
      ...prev,
      country: selectedValue,
    }));
  };
  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contact_no: value }));
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    deleteGymId();
    try {
      const resp = await AxiosPrivate.post(`/api/create-gym/`, {
        ...formData,
        business_name: formData.name,
        is_primary: true, // added for manual Payment Making it as primary While Moving to MultiGym Changes my needed
        country_code: COUNTRY_MAPPINGS[formData.country].code,
        std_code: COUNTRY_MAPPINGS[formData.country].std_code,
        currency: COUNTRY_MAPPINGS[formData.country].currency,
        currency_symbol: COUNTRY_MAPPINGS[formData.country].symbol,
      }).then((res) => {
        toast.success("Gym Created Successfully");
        console.log("Response:", res);
        setGymId(res.data.gym.id.toString());
        invalidateAll();
        setFormData({
          name: "",
          // business_name: '',
          street: "",
          city: "",
          state: "",
          zip_code: "",
          country: "",
          email: "",
          contact_no: "",
          website: "",
          center: "Gym",
        });
        nextStep();
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong while creating gym" + error);
    }
  };

  useEffect(() => {
    const requiredFields = ["name", "country", "contact_no", "email"];
    const isValid = requiredFields.every(
      (field) => formData[field as keyof FormData] !== ""
    );
    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    const encodedGymName = search.get("gym_name");
    const gymName = encodedGymName ? decodeURIComponent(encodedGymName) : "";
    console.log("gymName:", gymName);
    if (gymName) {
      setFormData((prev) => ({ ...prev, name: gymName }));
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen max-lg:p-8">
      <div className="w-full p-4 md:p-8 xl:px-16 pt-8 no-scrollbar flex flex-col gap-4">
        <div className="max-w-xl">
          <Link href={"/"} className="flex mb-4 items-center flex-nowrap">
            <Image src={logoImg} alt="Gymforce" className="size-10" />
            <Image
              src={logoImgText}
              alt="Gymforce"
              className="ps-2.5 dark:invert"
              height={40}
            />
          </Link>
          <p className="text-gray-500 my-4 text-[17px]">
            {`Watch your fitness empire grow with GymForce - the ultimate gym
            management software that helps you manage your ${formData.center === "Dance" ? "Dance Studio" : formData.center}   with ease.`}
          </p>
        </div>
        <Title as="h3" className="text-gray-800 max-sm:text-xl">
          {`Register with ${formData.center === "Dance" ? "Dance Studio" : formData.center}  Details`}
        </Title>
        <Stepper
          className="mt-8"
          currentIndex={currentStep}
          dotClassName="bg-primary text-white"
          contentClassName="text-primary"
          descriptionClassName="max-sm:hidden"
        >
          <Stepper.Step title="Basic" description="Necessary Details" />
          <Stepper.Step title="Address" description="Additional Details" />
        </Stepper>
        <form onSubmit={handleSubmit} className="mt-8">
          {currentStep === 0 ? (
            <div className="grid md:grid-cols-2 gap-4 lg:gap-6 ">
              <div className="flex flex-col gap-1.5">
                <Text className="font-medium">Center Type *</Text>
                <div className="flex flex-row items-center gap-4">
                  <AdvancedRadio
                    name="center"
                    value="Gym"
                    alignment="center"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, center: "Gym" }));
                    }}
                    checked={formData.center === "Gym"}
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <IoIosCheckmarkCircle
                      className={
                        formData.center === "Gym"
                          ? "text-primary size-4"
                          : "hidden"
                      }
                    />
                    <Text>Gym</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="center"
                    value="Library"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, center: "Library" }));
                    }}
                    checked={formData.center === "Library"}
                    alignment="center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <IoIosCheckmarkCircle
                      className={
                        formData.center === "Library"
                          ? "text-primary size-4"
                          : "hidden"
                      }
                    />
                    <Text>Library</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="center"
                    value="Dance"
                    onClick={() => {
                      // onChange("Dance");
                      setFormData((prev) => ({ ...prev, center: "Dance" }));
                    }}
                    checked={formData.center === "Dance"}
                    alignment="center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <IoIosCheckmarkCircle
                      className={
                        formData.center === "Dance"
                          ? "text-primary size-4"
                          : "hidden"
                      }
                    />
                    <Text>Dance</Text>
                  </AdvancedRadio>
                </div>
              </div>
              <Input
                label="Name *"
                name="name"
                placeholder="Enter Gym Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Country *"
                value={formData.country}
                options={countryOptions}
                onChange={handleCountryChange}
                getOptionValue={(option) => option.value}
                className="w-full max-w-md"
                // labelClassName="dark:text-gray-200"
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                // clearable
                // required
              />
              <PhoneNumber
                label={`Contact Number * ${!(formData.country.length > 0) ? "( Select the Country )" : ""}`}
                country={
                  formData.country.length > 0
                    ? COUNTRY_MAPPINGS[
                        formData.country
                      ].code.toLocaleLowerCase()
                    : ""
                }
                value={formData.contact_no}
                onChange={handlePhoneChange}
                disabled={!(formData.country.length > 0)}
              />
              <Input
                label="Email *"
                name="email"
                type="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <Input
                label="Website"
                name="website"
                placeholder="Enter Website"
                value={formData.website}
                onChange={handleInputChange}
                className="col-span-full"
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 lg:gap-6 ">
              <Input
                label="Address"
                name="street"
                placeholder="Enter the Address"
                value={formData.street}
                onChange={handleInputChange}
              />
              {/* <Input
                label="City"
                name="city"
                placeholder="Enter City"
                value={formData.city}
                onChange={handleInputChange}
              /> */}
              {/* <Input
                label="State"
                name="state"
                placeholder="Enter State"
                value={formData.state}
                onChange={handleInputChange}
              /> */}
              <Input
                label="ZIP / Postcode"
                name="zip_code"
                placeholder="Enter ZIP / Postcode"
                value={formData.zip_code}
                onChange={handleInputChange}
              />
            </div>
          )}
          <div className="mt-8 flex flex-1 justify-evenly w-full relative">
            {currentStep > 0 && (
              <Button
                onClick={handlePrevStep}
                variant="outline"
                className="justify-self-end sm:min-w-40"
              >
                Previous
              </Button>
            )}
            {currentStep < 1 ? (
              <Tooltip
                content={isFormValid ? "" : "Please fill all required fields"}
                placement="top"
                className={isFormValid ? "hidden" : ""}
              >
                <Button
                  onClick={handleNextStep}
                  variant="solid"
                  className="justify-self-end sm:min-w-40"
                  disabled={!isFormValid}
                >
                  Next <PiArrowRightBold className="ml-2" />
                </Button>
              </Tooltip>
            ) : (
              <Button type="submit" variant="solid" className="sm:min-w-40">
                Submit <PiArrowRightBold className="ml-2" />
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="w-fullp-4  md:p-8  flex flex-col no-scrollbar gap-4">
        <div className="mb-4 pt-8">
          <Title
            as="h2"
            className="text-3xl font-bold text-gray-900 mb-6 max-sm:text-xl"
          >
            {`Improve Your ${formData.center === "Dance" ? "Dance Studio" : formData.center} Management with`}
          </Title>
          <ul className="list-disc pl-5 text-base sm:text-lg text-gray-500">
            <li>Smart Scheduling</li>
            <li>Integrated Billing</li>
            <li>Personalized Communications</li>
            <li>Progress Tracking</li>
          </ul>
        </div>
        <Info />
      </div>
    </div>
  );
}
