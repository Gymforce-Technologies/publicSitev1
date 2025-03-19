"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
// import { PiDesktop } from "react-icons/pi";
// import { Form } from "@ui/form";
import { Button, Password, Title, Text } from "rizzui";
// import cn from "@utils/class-names";
// import { ProfileHeader } from "@/app/shared/account-settings/profile-settings";
import HorizontalFormBlockWrapper from "@/app/shared/account-settings/horiozontal-block";
// import { useTranslation } from "@/app/i18n/client";
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface PasswordFormTypes {
  current_password: string;
  password: string;
  password2: string;
}

export default function PasswordSettingsView({ lang }: { lang?: string }) {
  const [isLoading, setLoading] = useState(false);
  // const t = useTranslations("form");
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isPasswordMatching, setIsPasswordMatching] = useState(false);
  const {
    register,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm<PasswordFormTypes>({
    mode: "onChange",
    defaultValues: {
      password: "",
      password2: "",
      current_password: "",
    },
  });

  const onSubmit = async (data: PasswordFormTypes) => {
    try {
      const response = await AxiosPrivate.post("/api/changepassword/", data);
      toast.success("Password Changed Successfully");
      reset();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while Changing Failed");
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto w-full max-w-screen-2xl">
          <HorizontalFormBlockWrapper
            title={`Current Password`}
            titleClassName="text-base font-medium"
          >
            <Controller
              control={control}
              name="current_password"
              rules={{
                required: "Old Password is required",
                validate: (value) =>
                  value === getValues("current_password") ||
                  "Passwords do not match",
              }}
              render={({ field: { onChange, value } }) => (
                <Password
                  placeholder={"Enter your current password"}
                  onChange={onChange}
                  error={errors.current_password?.message!}
                  className="max-w-xl"
                />
              )}
            />
          </HorizontalFormBlockWrapper>
          <HorizontalFormBlockWrapper
            title={"New Password"}
            titleClassName="text-base font-medium"
          >
            <Controller
              control={control}
              name="password"
              rules={{ required: "New Password is required" }}
              render={({ field: { onChange, value } }) => (
                <Password
                  placeholder={"Enter your new password"}
                  helperText={
                    value?.length < 8 &&
                    "Password must be at least 8 characters"
                  }
                  onChange={(e) => {
                    onChange(e);
                    setIsValidPassword(e.target.value.length >= 8);
                  }}
                  className="max-w-xl"
                  error={errors.password?.message!}
                />
              )}
            />
          </HorizontalFormBlockWrapper>

          <HorizontalFormBlockWrapper
            title={"Confirm New Password"}
            titleClassName="text-base font-medium"
          >
            <Controller
              control={control}
              name="password2"
              rules={{
                required: "Confirm Password is required",
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              }}
              render={({ field: { onChange, value } }) => (
                <Password
                  placeholder={"Re-enter your new password"}
                  onChange={(e) => {
                    onChange(e);
                    setIsPasswordMatching(
                      e.target.value === getValues("password")
                    );
                  }}
                  error={errors.password2?.message!}
                  className="max-w-xl"
                />
              )}
            />
          </HorizontalFormBlockWrapper>

          <div className="mt-6 flex w-auto items-center justify-end gap-3">
            <Button
              type="submit"
              variant="solid"
              isLoading={isLoading}
              disabled={!isValidPassword || !isPasswordMatching}
            >
              {"Update Password"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
