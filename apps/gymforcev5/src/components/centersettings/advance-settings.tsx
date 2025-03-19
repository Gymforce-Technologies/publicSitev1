"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
// import { Form } from "@ui/form";
import { Loader, Text, Input, Button } from "rizzui";
import FormGroup from "@/app/shared/form-group";
// import FormFooter from "@components/form-footer";
// import { AdvanceSettingsFormSchema, AdvanceSettingsFormTypes, defaultValues } from '@/validators/center-advance-settings';
// import { getAccessToken } from '@/app/[locale]/auth/Acces';
// import axios from 'axios';
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import cn from "@core/utils/class-names";
import { isStaff } from "@/app/[locale]/auth/Staff";

const smtpTlsOptions = [
  {
    label: "True",
    value: "true",
  },
  {
    label: "False",
    value: "false",
  },
];
const enableDisableOptions = [
  {
    label: "Enable",
    value: "enable",
  },
  {
    label: "Disable",
    value: "disable",
  },
];
const Select = dynamic(() => import("rizzui").then((mod) => mod.Select), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Loader variant="spinner" />
    </div>
  ),
});
interface FormData {
  // status:string,
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_tls: string;
  test_email: string;
}
export default function AdvanceSettingsView() {
  const [status, setStatus] = useState("enable");
  // const [testemail, setTestEmail] = useState("");
  const [gymId, setGymId] = useState<string | null>("");
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    mode: "onChange",
  });
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  useEffect(() => {
    const getStatus = async () => {
      try {
        const resp = await isStaff();
        if (resp) {
          setAuth(!resp);
          await fetchPermissions();
        }
      } catch (error) {
        console.error("Error getting staff status:", error);
      }
    };
    getStatus();
  }, []);
  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["mainConfigManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  useEffect(() => {
    const fetchgymId = async () => {
      try {
        const gymId: string | null = await retrieveGymId();
        setGymId(gymId);
      } catch (error) {
        console.log(error);
      }
    };
    fetchgymId();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      if (!gymId) return;
      try {
        const response = await AxiosPrivate.get(`/api/get-gym/${gymId}`, {
          id: newID(`get-gym-${gymId}`),
        });
        const data = response.data;
        if (data.smtp_username) {
          setValue("smtp_host", data.smtp_host);
          setValue("smtp_port", data.smtp_port);
          setValue("smtp_username", data.smtp_username);
          setValue("smtp_password", data.smtp_password);
          setValue("smtp_tls", data.smtp_tls.toString());
        } else {
          setStatus("disable");
        }
      } catch (error) {
        console.error("Error fetching gym data:", error);
        setStatus("disable");
      }
    };

    fetchData();
  }, [gymId, setValue]);
  useEffect(() => {
    // This effect will run whenever the `status` state changes and will
    // enable or disable all fields based on the selected value.
    console.log(status);
  }, [status]);
  const onSubmit = async (data: FormData) => {
    try {
      if (!auth && !access) {
        toast.error("You aren't allowed to make changes");
        return;
      }
      const gymId = await retrieveGymId();
      await AxiosPrivate.put(`/api/update-gym/${gymId}/`, data).then(() =>
        invalidateAll()
      );
      toast.success(<Text as="b">Successfully updated!</Text>);
    } catch (error) {
      console.error("Error updating gym data:", error);
      toast.error(<Text as="b">Something went wrong while updating!</Text>);
    }
  };
  const testSmpt = async () => {
    try {
      const email = getValues("test_email");
      const gym_id = await retrieveGymId();
      const response = await AxiosPrivate.post(
        `/api/settings/smtp/test-email/?gym_id=${gym_id}`,
        {
          recipient_email: email,
        }
      ).then(() => invalidateAll());
      toast.success("Message Send Successfully");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="@container">
        <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-5 @3xl:gap-7">
          <FormGroup title="SMTP Status" className="pt-5 @3xl:grid-cols-12 ">
            <Select
              options={enableDisableOptions}
              value={status[0].toUpperCase() + status.slice(1)}
              onChange={(value: any) => setStatus(value.value)}
              className="col-span-full max-w-xl"
              // labelClassName="dark:text-gray-200"
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
          </FormGroup>
          <FormGroup title="SMTP Username" className="pt-3 @3xl:grid-cols-12 ">
            <Input
              placeholder="Enter Username"
              {...register("smtp_username", {
                required: "SMTP Username is required",
              })}
              error={status === "enable" ? errors.smtp_username?.message : ""}
              className="col-span-full max-w-xl"
              disabled={status === "disable"}
            />
          </FormGroup>
          <FormGroup title="SMTP Password" className="pt-3  @3xl:grid-cols-12 ">
            <Input
              placeholder="Enter Password"
              {...register("smtp_password", {
                required: "SMTP Password is required",
              })}
              error={status === "enable" ? errors.smtp_password?.message : ""}
              className="col-span-full max-w-xl"
              disabled={status === "disable"}
            />
          </FormGroup>
          <FormGroup title="SMTP Server" className="pt-3  @3xl:grid-cols-12 ">
            <Input
              placeholder="email-smtp.us-east-1.amazonaws.com"
              {...register("smtp_host", {
                required: "SMTP Server is required",
              })}
              error={status === "enable" ? errors.smtp_host?.message : ""}
              className="col-span-full max-w-xl"
              disabled={status === "disable"}
            />
          </FormGroup>

          <FormGroup
            title="SMTP Connection Security"
            className="pt-3  @3xl:grid-cols-12 "
          >
            <Controller
              control={control}
              name="smtp_tls"
              rules={{ required: "SMTP Connection Security is required" }}
              render={({ field: { onChange, value } }) => (
                <Select
                  // labelClassName="dark:text-gray-200"
                  // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  inPortal={false}
                  placeholder="Select Status"
                  options={smtpTlsOptions}
                  onChange={(selectedOption: string) => {
                    onChange(selectedOption);
                  }}
                  value={value}
                  className="col-span-full z-[1000] max-w-xl"
                  getOptionValue={(option) => option.value}
                  displayValue={(selected) =>
                    smtpTlsOptions?.find((con) => con.value === selected)
                      ?.label ?? ""
                  }
                  error={
                    status === "enable"
                      ? (errors?.smtp_tls?.message as string)
                      : ""
                  }
                  disabled={status === "disable"}
                />
              )}
            />
          </FormGroup>
          <FormGroup title="SMTP Port" className="pt-3  @3xl:grid-cols-12 ">
            <Input
              type="number"
              className="col-span-full max-w-xl"
              placeholder="465/587/25"
              {...register("smtp_port", {
                required: "SMTP Port is required",
                valueAsNumber: true,
              })}
              error={status === "enable" ? errors.smtp_port?.message : ""}
              disabled={status === "disable"}
            />
          </FormGroup>
          <FormGroup title="Test SMTP" className="pt-3  @3xl:grid-cols-12">
            <Input
              placeholder="Enter Email"
              {...register("test_email", { required: "email required" })}
              error={status === "enable" ? errors.smtp_host?.message : ""}
              disabled={status === "disable"}
              className="col-span-full max-w-xl"
            />
            <Button
              className="mt-3"
              onClick={testSmpt}
              disabled={status === "disable"}
              size="sm"
            >
              Test SMTP
            </Button>
          </FormGroup>
        </div>

        <div
          className={cn(
            "sticky bottom-0 left-0 right-0 z-10 -mb-8 flex items-center justify-end gap-4 border-t bg-gray-50  px-4 py-4 md:px-5 lg:px-6 3xl:px-8 4xl:px-10 "
          )}
        >
          <Button type="submit" className="w-full @xl:w-auto">
            Save
          </Button>
        </div>
      </form>
    </>
  );
}
