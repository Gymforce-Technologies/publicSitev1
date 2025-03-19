"use client";

import Link from "next/link";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { PiArrowRightBold } from "react-icons/pi";
import { Checkbox, Password, Button, Input, Text } from "rizzui";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { loginSchema, LoginSchema } from "@/validators/login.schema";
import toast from "react-hot-toast";
import { setAccessToken } from "../Acces";
import { setRefreshToken } from "../Refresh";
import { useRouter } from "next/navigation";
import axios from "axios";
import { setGymId } from "../InfoCookies";
import { setDemographicInfo, DemographicInfo } from "../DemographicInfo";
import { setIsStaff } from "../Staff";
import { AxiosPrivate, invalidateAll } from "../AxiosPrivate";
import Turnstile from "react-turnstile";
// import { useTranslations } from "next-intl";
import Loading from "../../loading";
const initialValues: LoginSchema = {
  email: "",
  password: "",
  rememberMe: true,
};

export default function SignInForm() {
  const [reset, setReset] = useState({});
  const router = useRouter();
  const [lock, setLock] = useState(false);
  // const t = useTranslations("auth");
  // const turnstile = useTurnstile();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
  //   const credentials = {
  //     email: data.email,
  //     password: data.password,
  //   };

  //   try {
  //     console.log(credentials);
  //     const baseURL = process.env.NEXT_PUBLIC_URL;
  //     const resp = await axios.post(`${baseURL}/api/login/`, credentials);
  //     if(resp.status===200){
  //       const accessToken = resp.data?.token?.access;
  //       const refreshToken = resp.data?.token?.refresh;
  //       if (accessToken) {
  //         toast.success(
  //           <Text>
  //             <Text as="b" className="font-semibold">
  //               Login successful
  //             </Text>
  //           </Text>
  //         );
  //         setAccessToken(accessToken);
  //         await setRefreshToken(refreshToken);
  //         try {
  //           const data = await axios.get("/api/profile", {
  //             headers: {
  //               Authorization: `Bearer ${accessToken}`,
  //             }
  //           });
  //           console.log(data.data);
  //           if(resp.data.associated_gyms[0].gym_id===null || resp.data.associated_gyms[0].gym_id===undefined){
  //             router.push('/gym-registration');
  //             return;
  //             }
  //           else{
  //             setGymId(data.data.associated_gyms[0].gym_id);
  //           }
  //         } catch (error) {
  //           console.error("Error fetching profile:", error);
  //         }
  //       } else {
  //         throw new Error('Invalid token data received');
  //       }
  //       router.push("/dashboard");
  //         }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     toast.error(
  //       <Text>
  //         <Text as="b" className="font-semibold">
  //           Login failed. Please try again.
  //         </Text>
  //       </Text>
  //     );
  //   }
  //   setReset(initialValues);
  // };

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    // if (!turnstileToken) {
    //   toast.error("Please complete the security verification");
    //   return;
    // }
    const credentials = {
      email: data.email,
      password: data.password,
    };

    try {
      setLock(true);
      console.log(credentials);
      const baseURL = process.env.NEXT_PUBLIC_URL;
      const resp = await axios.post(`${baseURL}/api/login/`, credentials);

      if (resp.status === 200) {
        sessionStorage.clear();
        invalidateAll();
        const accessToken = resp.data?.token?.access;
        const refreshToken = resp.data?.token?.refresh;

        if (accessToken) {
          toast.success(
            <Text>
              <Text as="b" className="font-semibold">
                Login successful
              </Text>
            </Text>
          );
          setReset(initialValues);
          setAccessToken(accessToken);
          await setRefreshToken(refreshToken);

          try {
            const profileResp = await axios.get(`${baseURL}/api/profile`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            setIsStaff(profileResp.data.is_staff_role);
            console.log("Profile data:", profileResp.data);

            // Set demographic info
            const demographicInfo: DemographicInfo = {
              country: profileResp.data.country,
              country_code: profileResp.data.country_code,
              currency: profileResp.data.currency,
              currency_symbol:
                profileResp.data.currency_symbol !== null
                  ? profileResp.data.currency_symbol
                  : "",
            };
            setDemographicInfo(demographicInfo);

            if (
              profileResp.data &&
              profileResp.data.associated_gyms &&
              profileResp.data.associated_gyms.length > 0
            ) {
              const firstGym =
                profileResp.data.associated_gyms.find(
                  (gym: any) => gym.is_primary === true
                ) || profileResp.data.associated_gyms[0];
              if (firstGym.gym_id === null || firstGym.gym_id === undefined) {
                router.push("/gym-registration");
                return;
              } else {
                setGymId(firstGym.gym_id.toString());
              }
            } else {
              console.warn("No associated gyms found in the profile data");
              router.push("/gym-registration");
              return;
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error(
              "Something went wrong while fetching user profile. Please try again."
            );
            return;
          }
        } else {
          throw new Error("Invalid token data received");
        }
        // const userId = resp.data?.gym?.user_id;
        const gymId = resp.data?.gym?.id;
        if (gymId) {
          setGymId(gymId);
          // if (userId) {
          //   const response = await AxiosPrivate.get(
          //     `api/staff-permission/${userId}/?gym_id=${gymId}`,
          //     {
          //       id: `staff-permission-${userId}`,
          //     }
          //   );
          // }
        }
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        <Text>
          <Text as="b" className="font-semibold">
            {error?.response?.data?.error ||
              "Something went wrong while Login. Please try again."}
          </Text>
        </Text>
      );
      setLock(false);
    }
  };
  if (lock) {
    return (
      <div className="fixed w-full h-full top-0 left-0 bg-white z-[999999999]">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          mode: "onChange",
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              type="email"
              size="lg"
              label="Email"
              placeholder="Enter your email"
              className="[&>label>span]:font-medium "
              inputClassName="text-sm"
              {...register("email")}
              error={errors.email?.message}
            />
            <Password
              label="Password"
              placeholder="Enter your password"
              size="lg"
              className="[&>label>span]:font-medium "
              inputClassName="text-sm"
              {...register("password")}
              error={errors.password?.message}
            />
            {/* Add Turnstile Widget */}
            <div className="flex min-w-full items-center">
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
            <div className="flex items-center justify-between pb-2">
              <Checkbox
                {...register("rememberMe")}
                label="Remember Me"
                variant="flat"
                className="[&>label>span]:font-medium "
              />
              {/* <Button variant="text"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  redirect('/auth/forgot-password');
                }}
                className="h-auto p-0 text-sm font-semibold text-blue underline transition-colors hover:text-gray-900 hover:no-underline"
              >
                Forget Password?
              </Button> */}
              <Link
                href={routes.auth.forgotPassword}
                className="font-semibold text-gray-700  transition-colors hover:text-primary "
              >
                Forget Password?
              </Link>
            </div>
            <Button className="w-full" type="submit" size="lg" disabled={lock}>
              <span>Sign in</span>{" "}
              <PiArrowRightBold className="ms-2 mt-0.5 h-6 w-6" />
            </Button>
          </div>
        )}
      </Form>
      {/* <Text className="mt-6 text-center leading-loose t lg:mt-8 lg:text-start text-gray-700 dark:text-gray-400">
        Don’t have an account?{" "}
        <Link
          href={routes.auth.signUp}
          className="font-semibold text-gray-900 dark:text-gray-200 transition-colors hover:text-primary"
        >
          Sign Up
        </Link>
      </Text> */}
    </>
  );
}
