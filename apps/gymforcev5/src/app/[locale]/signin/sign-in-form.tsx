"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { PiArrowRightBold } from "react-icons/pi";
import { Checkbox, Password, Button, Input, Text } from "rizzui";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { loginSchema, LoginSchema } from "@/validators/login.schema";
import toast from "react-hot-toast";
import { setAccessToken } from "../auth/Acces";
import { setRefreshToken } from "../auth/Refresh";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AxiosPrivate, invalidateAll } from "../auth/AxiosPrivate";

const initialValues: LoginSchema = {
  email: "",
  password: "",
  rememberMe: true,
};

export default function SignInForm() {
  const [reset, setReset] = useState({});
  const router = useRouter();

  const handleSuccessfulLogin = useCallback(
    async (accessToken: string, refreshToken: string) => {
      setAccessToken(accessToken);
      await setRefreshToken(refreshToken);

      toast.success(
        <Text>
          <Text as="b" className="font-semibold">
            Login successful
          </Text>
        </Text>
      );

      router.push("/dashboard");
    },
    [router]
  );
  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    const credentials = {
      email: data.email,
      password: data.password,
    };

    try {
      console.log(credentials);
      const resp = await AxiosPrivate.post(`/api/login/`, credentials);

      if (resp.data?.token?.access && resp.data?.token?.refresh) {
        invalidateAll();
        await handleSuccessfulLogin(
          resp.data.token.access,
          resp.data.token.refresh
        );
      } else {
        throw new Error("Invalid token data received");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        <Text>
          <Text as="b" className="font-semibold">
            Something went wrong while Login. Please try again.
          </Text>
        </Text>
      );
    }

    setReset(initialValues);
  };

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
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
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("email")}
              error={errors.email?.message}
            />
            <Password
              label="Password"
              placeholder="Enter your password"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("password")}
              error={errors.password?.message}
            />
            <div className="flex items-center justify-between pb-2">
              <Checkbox
                {...register("rememberMe")}
                label="Remember Me"
                className="[&>label>span]:font-medium"
              />
              <Link
                href={routes.auth.forgotPassword}
                className="h-auto p-0 text-sm font-semibold text-blue underline transition-colors hover:text-gray-900 hover:no-underline"
              >
                Forget Password?
              </Link>
            </div>
            <Button className="w-full" type="submit" size="lg">
              <span>Sign in</span>{" "}
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        Don’t have an account?{" "}
        <Link
          href={routes.auth.signUp}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Sign Up
        </Link>
      </Text>
    </>
  );
}
