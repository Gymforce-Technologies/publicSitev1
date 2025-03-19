"use client";

// import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {  useForm } from "react-hook-form";
// import { Form } from '@/components/ui/form';
import { Loader, Text, Input, Textarea, Button } from "rizzui";
import FormGroup from "@/app/shared/form-group";
import FormFooter from "@core/components/form-footer";
// import UploadZone from '@/components/ui/file-upload/upload-zone';
// import { countries, roles, timezones } from '@/data/forms/my-details';
// import AvatarUpload from '@/components/ui/file-upload/avatar-upload';
// import { TaxAndLegalsFormSchema, TaxAndLegalsFormTypes,defaultValues } from '@/validators/center-tax-legals';
// import { getAccessToken } from '@/app/[locale]/auth/Acces';
// import axios from 'axios';
import { useState, useEffect } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";

interface FormData {
  gst_company: string;
  gst_number: string;
  business_name: string;
}

export default function TaxAndLegalsView() {
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
        // const token=getAccessToken()
        const response = await AxiosPrivate.get(`/api/get-gym/${gymId}/`, {
          id: newID(`get-gym-${gymId}`),
        });
        const data = response.data;
        setValue("gst_company", data.gst_company || "");
        setValue("gst_number", data.gst_number || "");
        setValue("business_name", data.business_name || "");
      } catch (error) {
        console.error("Error fetching gym data:", error);
      }
    };

    fetchData();
  }, [gymId, setValue]);

  useEffect(() => {
    getDateFormat();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      // const token=getAccessToken()
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="@container">
      <>
        <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
          <FormGroup
            title="GST Company"
            className="pt-5 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder="Enter GST Company Name"
              {...register("gst_company")}
              error={errors.gst_company?.message}
              className="col-span-full max-w-xl"
            />
          </FormGroup>
          <FormGroup
            title="GST Number"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              type="text"
              placeholder="Enter GST Number"
              {...register("gst_number")}
              error={errors.gst_number?.message}
              className="col-span-full max-w-xl"
            />
          </FormGroup>
          <FormGroup
            title="Business Name"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Input
              placeholder="Business Name"
              {...register("business_name")}
              error={errors.business_name?.message}
              className="col-span-full max-w-xl"
            />
          </FormGroup>
          {/* <FormGroup
            title="Terms and Conditions"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <Textarea
              placeholder="Terms and Conditions"
              {...register("termsAndCondition")}
              error={errors.termsAndCondition?.message}
              className="col-span-full max-w-xl"
            />
          </FormGroup> */}
        </div>
        <FormFooter altBtnText="Cancel" submitBtnText="Save" />
      </>
    </form>
  );
}
