"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, Controller } from "react-hook-form";
import { PiArrowRightBold, PiXBold } from "react-icons/pi";
import {
  Password,
  ActionIcon,
  Modal,
  Checkbox,
  Button,
  Input,
  Text,
  Select,
  Title,
  AdvancedRadio,
} from "rizzui";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { SignUpSchema, signUpSchema } from "@/validators/signup.schema";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "../Acces";
import { setRefreshToken } from "../Refresh";
import toast from "react-hot-toast";
import { PhoneNumber } from "@core/ui/phone-input";
import { COUNTRY_MAPPINGS } from "../Countries";
import Loading from "../../loading";
import { useTranslations } from "next-intl";
import { IoIosCheckmarkCircle } from "react-icons/io";
// import Loading from "";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  address_country: "",
  gym_name: "",
  phone: "",
  confirmPassword: "",
  isAgreed: false,
  center: "Gym",
  referral_code: "VISHWAJEET",
};

// interface CountryMapping {
//   code: string;
//   currency: string;
//   symbol: string;
//   std_code: string;
//   digits: number;
// }

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // const [errValue, setErrValue] = useState("");
  // const [error, setError] = useState(false);
  const [formData, setFormData] = useState(initialValues);
  const [gymName, setGymName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("");
  const [lock, setLock] = useState(false);
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));
  const t = useTranslations("auth");
  const SignUpSchemaTrans = signUpSchema(t);
  const [isReffered, setIsReffered] = useState<"y" | "n">("n");

  const handleCountryChange = (selectedCountry: string) => {
    const countryData = COUNTRY_MAPPINGS[selectedCountry];
    console.log(formData);
    if (countryData) {
      setFormData((prev) => {
        const currentCountryCode =
          Object.values(COUNTRY_MAPPINGS).find(
            (country) => country.code === phoneCountry
          )?.std_code || "";
        console.log("currentCountryCode", currentCountryCode);
        return {
          ...prev,
          phone: countryData.std_code,
          address_country: selectedCountry,
        };
      });
      setPhoneCountry(countryData.code);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const removeCountryCode = (phoneNumber: string, countryCode: string) => {
    if (countryCode) {
      const cleanCountryCode = countryCode.replace("+", "");
      if (phoneNumber.startsWith(cleanCountryCode)) {
        // console.log('phoneNumber', phoneNumber);
        // console.log('cleanCountryCode', cleanCountryCode);
        // console.log('phoneNumber.slice(cleanCountryCode.length)', phoneNumber.slice(cleanCountryCode.length));
        return phoneNumber.slice(cleanCountryCode.length);
      }
      return phoneNumber;
    }
    return phoneNumber;
  };
  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    if (data.confirmPassword !== data.password) {
      toast.error("Passwords don't match. Please ensure they are the same.");
      // setErrValue("Passwords don't match. Please ensure they are the same.");
      // setError(true);
      return;
    }
    try {
      setLock(true);
      const URL = process.env.NEXT_PUBLIC_URL;
      const countryData = COUNTRY_MAPPINGS[data.address_country];
      if (!countryData) {
        throw new Error("Invalid country selected");
      }
      const phoneWithoutCode = data.phone.replace(countryData.std_code, "");
      const value = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        address_country: data.address_country,
        phone: removeCountryCode(phoneWithoutCode, countryData.std_code),
        password: data.password,
        country_code: COUNTRY_MAPPINGS[data.address_country].code,
        std_code: COUNTRY_MAPPINGS[data.address_country].std_code,
        currency: COUNTRY_MAPPINGS[data.address_country].currency,
        currency_symbol: COUNTRY_MAPPINGS[data.address_country].symbol,
        center: data.center,
        referral_code: isReffered === "y" ? data.referral_code : "",
      };
      console.log(value);
      const resp = await axios
        .post(`${URL}/api/register/ardnekorlakhsup/`, value)
        .then(async (res) => {
          const { access, refresh } = res.data?.token;
          if (access && refresh) {
            sessionStorage.clear();
            localStorage.clear();
            toast.success("Account Created Successfully");
            setAccessToken(access);
            await setRefreshToken(refresh);
            router.push(
              `/gym-registration/${gymName ? `gym_name=${encodeURIComponent(gymName)}` : ""}`
            );
          } else {
            console.error(
              "Access or refresh token is missing in the response."
            );
          }
        });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Already Registered. Please Sign in.");
      } else {
        toast.error(`Error: ${error}`);
      }
      setLock(false);
    }
  };

  useEffect(() => {
    const firstName = searchParams.get("firstName") || "";
    const lastName = searchParams.get("lastName") || "";
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";
    const country = searchParams.get("country") || "";
    const gymNameParam = searchParams.get("gymName") || "";

    setGymName(gymNameParam);

    if (country && COUNTRY_MAPPINGS[country]) {
      handleCountryChange(country);
    } else {
      handleCountryChange("");
    }
    const countryCode = COUNTRY_MAPPINGS[country]?.std_code || "";
    setFormData((prevData) => ({
      ...prevData,
      firstName,
      lastName,
      email,
      phone: countryCode + phone,
    }));
  }, []);

  if (lock) {
    return (
      <div className="fixed w-full h-full top-0 left-0 bg-white z-[999999999]">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Form<SignUpSchema>
        validationSchema={SignUpSchemaTrans}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: formData,
          values: formData,
        }}
      >
        {({ register, formState: { errors }, control }) => (
          <div className="flex flex-col gap-x-4 gap-y-5 md:grid md:grid-cols-2 lg:gap-5">
            <Input
              type="text"
              size="lg"
              label="First Name *"
              placeholder="Enter your first name"
              className="[&>label>span]:font-medium "
              inputClassName="text-sm"
              {...register("firstName")}
              onChange={handleInputChange}
              error={errors.firstName?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Last Name "
              placeholder="Enter your last name"
              className="[&>label>span]:font-medium "
              inputClassName="text-sm"
              {...register("lastName")}
              onChange={handleInputChange}
              error={errors.lastName?.message}
            />
            <Input
              type="email"
              size="lg"
              label="Email *"
              className="col-span-2 [&>label>span]:font-medium "
              inputClassName="text-sm"
              placeholder="Enter your email"
              {...register("email")}
              onChange={handleInputChange}
              error={errors.email?.message}
            />
            <Controller
              name="center"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <div className="flex flex-col gap-1.5">
                  <Text className="font-medium">Center Type *</Text>
                  <div className="flex flex-row items-center gap-4">
                    <AdvancedRadio
                      name="center"
                      value="Gym"
                      alignment="center"
                      onClick={() => {
                        onChange("Gym");
                        setFormData((prev) => ({ ...prev, center: "Gym" }));
                      }}
                      checked={value === "Gym"}
                      contentClassName="flex flex-row gap-2 items-center"
                    >
                      <IoIosCheckmarkCircle
                        className={
                          value === "Gym" ? "text-primary size-4" : "hidden"
                        }
                      />
                      <Text>Gym</Text>
                    </AdvancedRadio>
                    <AdvancedRadio
                      name="center"
                      value="Library"
                      onClick={() => {
                        onChange("Library");
                        setFormData((prev) => ({ ...prev, center: "Library" }));
                      }}
                      checked={value === "Library"}
                      alignment="center"
                      contentClassName="flex flex-row gap-2 items-center"
                    >
                      <IoIosCheckmarkCircle
                        className={
                          value === "Library" ? "text-primary size-4" : "hidden"
                        }
                      />
                      <Text>Library</Text>
                    </AdvancedRadio>
                    <AdvancedRadio
                      name="center"
                      value="Dance"
                      onClick={() => {
                        onChange("Dance");
                        setFormData((prev) => ({ ...prev, center: "Dance" }));
                      }}
                      checked={value === "Dance"}
                      alignment="center"
                      contentClassName="flex flex-row gap-2 items-center"
                    >
                      <IoIosCheckmarkCircle
                        className={
                          value === "Dance" ? "text-primary size-4" : "hidden"
                        }
                      />
                      <Text>Dance</Text>
                    </AdvancedRadio>
                  </div>
                </div>
              )}
            />

            <Controller
              name="address_country"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <Select
                  label="Country "
                  value={value}
                  options={countryOptions}
                  onChange={(selectedValue: string) => {
                    onChange(selectedValue);
                    handleCountryChange(selectedValue);
                    console.log(selectedValue);
                    console.log(COUNTRY_MAPPINGS[selectedValue]);
                  }}
                  getOptionValue={(option) => option.value}
                  error={error?.message}
                  className="w-full col-span-2 [&>label>span]:font-medium "
                  clearable
                  // labelClassName=""
                  // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                />
              )}
            />
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
                  label="Phone Number *"
                  disabled={!phoneCountry || formData.address_country === ""}
                  country={phoneCountry || "IN"}
                  value={value}
                  onChange={(phoneNumber) => {
                    onChange(phoneNumber);
                    setFormData((prev) => ({ ...prev, phone: phoneNumber }));
                  }}
                  className="col-span-2 [&>label>span]:font-medium"
                  error={errors.phone?.message}
                  // labelClassName=""
                />
              )}
            />
            <div className="col-span-2 place-self-end ">
              <Checkbox
                value={isReffered}
                onClick={() => {
                  if (isReffered === "n") {
                    toast.success(`Referral Code VISHWAJEET was Applied`);
                  }
                  setIsReffered((prev) => (prev === "y" ? "n" : "y"));
                }}
                checked={isReffered === "y"}
                label={"Apply Referral Code"}
              />
            </div>
            <Password
              label="Password"
              placeholder="Enter your password"
              size="lg"
              className="[&>label>span]:font-medium "
              inputClassName="text-sm"
              {...register("password")}
              onChange={handleInputChange}
              error={errors.password?.message}
            />
            <Password
              label="Confirm Password"
              placeholder="Enter confirm password"
              size="lg"
              className="[&>label>span]:font-medium "
              inputClassName="text-sm"
              {...register("confirmPassword")}
              onChange={handleInputChange}
              error={errors.confirmPassword?.message}
            />
            <div className="col-span-2 flex items-start ">
              <Checkbox
                {...register("isAgreed")}
                className="[&>label>span]:font-medium [&>label]:items-start"
                label={
                  <>
                    By signing up you have agreed to our{" "}
                    <Link
                      href="/"
                      className="font-medium text-primary transition-colors hover:underline"
                    >
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link
                      href="/"
                      className="font-medium text-primary transition-colors hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </>
                }
                // labelClassName=""
              />
            </div>
            <Button size="lg" type="submit" className="col-span-2 mt-2">
              <span>Get Started</span>{" "}
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center leading-loose text-gray-700  lg:mt-8 lg:text-start">
        Already have an account?{" "}
        <Link
          href={routes.auth.signIn}
          className="font-semibold text-gray-900  transition-colors hover:text-primary"
        >
          Sign In
        </Link>
      </Text>
      {/* <Modal isOpen={error} onClose={() => setError(false)}>
        <div className="m-auto p-2 md:p-3 flex flex-col gap-2">
          <ActionIcon size="sm" variant="text" onClick={() => setError(false)} className="self-end">
            <PiXBold className="h-auto size-5" />
          </ActionIcon>
            <Title as="h6">{errValue.split(":")[0]}</Title>
          <Text className="text-sm">{errValue.split(":")[1]}</Text>
          <Button
            type="submit"
            // size="lg"
            className={`mt-1 ${errValue.includes("Password") ? "hidden" : ""} mx-auto`}
            onClick={() => {
              setError(false);
              router.push("/auth/sign-in");
            }}
          >
            Sign in
          </Button>
        </div>
      </Modal> */}
    </>
  );
}
