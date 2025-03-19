"use client";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Text, Password } from "rizzui";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { useRouter, useSearchParams } from "next/navigation";
// import { AxiosPrivate } from '../AxiosPrivate';
import toast from "react-hot-toast";
import { getAccessToken } from "../Acces";
import axios from "axios";

const initialValues = {
  password: "",
  password2: "",
};

export default function ResetPassword() {
  const [reset, setReset] = useState(initialValues);
  const params = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const getPre = async () => {
      const tk = params.get("token");
      const id = params.get("uid");
      setId(id);
      if (tk) {
        setToken(tk);
      } else {
        const fallbackToken = await getAccessToken();
        if (!fallbackToken) {
          router.push("/auth/forgot-password");
        } else {
          setToken(fallbackToken);
        }
      }
    };
    getPre();
  }, [params, router]);

  const onSubmit: SubmitHandler<typeof initialValues> = async (data) => {
    console.log("Form submitted with data:", data);
    if (data.password !== data.password2) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const URL = process.env.NEXT_PUBLIC_URL;
      const response = await axios
        .post(`${URL}/auth/reset-password/?uid=${id}&token=${token}`, {
          ...data,
        })
        .then(() => {
          toast.success("Password successfully changed.");
          router.push("/auth/sign-in");
        });
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong. Please try again later.");
      // toast.error('An error occurred. Please try again later.');
    }
    setReset(initialValues);
  };

  return (
    <AuthWrapperFour title={<>Reset your password.</>}>
      <section className="grid grid-cols-1 justify-center items-center mt-10 max-w-xl">
        <Form
          resetValues={reset}
          onSubmit={onSubmit}
          useFormProps={{
            mode: "onChange",
            defaultValues: initialValues,
          }}
          className="pt-1.5"
        >
          {({ register, formState: { errors }, getValues }) => (
            <div className="space-y-6">
              <Password
                label="Password"
                placeholder="Enter your password"
                size="lg"
                className="[&>label>span]:font-medium "
                inputClassName="text-sm"
                {...register("password")}
                error={errors.password?.message}
                labelClassName="text-gray-900 "
              />
              <Password
                label="Confirm Password"
                placeholder="Enter confirm password"
                size="lg"
                className="[&>label>span]:font-medium "
                inputClassName="text-sm"
                {...register("password2", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === getValues("password2") || "Passwords must match",
                })}
                error={errors.password2?.message}
                labelClassName="text-gray-900 "
              />
              <Button className="mt-2 w-full" type="submit" size="lg">
                Reset Password
              </Button>
            </div>
          )}
        </Form>
        <Text className="mt-6 text-center text-[15px] leading-loose text-gray-700  lg:mt-8 lg:text-start xl:text-base">
          Don&apos;t want to reset your password?{" "}
          <Link
            href={routes.auth.signIn}
            className="font-bold text-gray-700 transition-colors   hover:text-primary"
          >
            Sign In
          </Link>
        </Text>
      </section>
    </AuthWrapperFour>
  );
}
