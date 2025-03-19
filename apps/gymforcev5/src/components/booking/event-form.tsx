"use client";

import { PiXBold } from "react-icons/pi";
import { Controller, SubmitHandler } from "react-hook-form";
import {
  ActionIcon,
  Button,
  Input,
  Text,
  Textarea,
  Title,
  Select,
  Switch,
  MultiSelect,
} from "rizzui";
import cn from "@core/utils/class-names";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { Form } from "@core/ui/form";
import toast from "react-hot-toast";
import { DatePicker } from "@core/ui/datepicker";
import { useEffect, useState } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";

interface ClassFormInput {
  id?: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  recurrenceType: "daily" | "weekly";
  weekdays?: string[];
  startDate: Date;
  endDate: Date;
  bookingStartTime: Date;
  bookingEndTime: Date;
  capacity: number | string;
  isOnline: boolean;
  meetLink?: string;
  classPackageId: number | string;
  trainerId: number | string;
}

const recurrenceOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

interface Option {
  label: string;
  value: number;
}

interface Package extends Option {
  min_price: number;
  max_price: number;
  num_of_days: number;
}

const weekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function ClassForm({
  classData,
  startDate,
  endDate,
  onSuccess,
}: {
  classData?: ClassFormInput;
  startDate?: Date;
  endDate?: Date;
  onSuccess?: () => Promise<void>;
}) {
  const { closeModal } = useModal();
  const [availableTrainers, setAvailableTrainers] = useState<any[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isPackageRelated, setIsPackageRelated] = useState(
    classData?.classPackageId ? true : false
  );

  const router = useRouter();
  const emptyPackage: Package[] = [
    {
      label: "No Packages Found",
      value: 0,
      min_price: 0,
      max_price: 0,
      num_of_days: 0,
    },
  ];
  const convertToDateFnsFormat = (format: string) => {
    return format
      .replace("DD", "dd")
      .replace("MMM", "MMM")
      .replace("MM", "MM")
      .replace("YYYY", "yyyy");
  };

  const onSubmit: SubmitHandler<ClassFormInput> = async (data) => {
    const formattedData = {
      title: data.name,
      description: data.description,
      start_time: `${data.startTime}${classData ? "" : ":00"}`,
      end_time: `${data.endTime}${classData ? "" : ":00"}`,
      recurrence_type: data.recurrenceType,
      ...(data.recurrenceType === "weekly" && { weekdays: data.weekdays }),
      event_start_date: data.startDate.toISOString().split("T")[0],
      event_end_date: data.endDate.toISOString().split("T")[0],
      booking_start_time: data.bookingStartTime.toISOString(),
      booking_end_time: data.bookingEndTime.toISOString(),
      capacity: data.capacity,
      is_online: data.isOnline,
      meet_link: data.meetLink,
      ...(isPackageRelated && { class_package_id: data.classPackageId }),
      trainer_id: data.trainerId,
    };

    console.log("class_data", formattedData);
    const gymId = await retrieveGymId();

    if (classData) {
      const id =
        formattedData.recurrence_type === "weekly"
          ? classData.id?.split("-")[0]
          : classData.id;
      await AxiosPrivate.put(
        `api/classes/${id}/?gym_id=${gymId}`,
        formattedData
      ).then(async () => {
        toast.success(`The Session Has Been Updated...`);
        invalidateAll();
        if (onSuccess) await onSuccess();
      });
    } else {
      await AxiosPrivate.post(
        `api/classes/v2/?gym_id=${gymId}`,
        formattedData
      ).then(async () => {
        toast.success(`New Session Has Been Created...`);
        invalidateAll();
        if (onSuccess) await onSuccess();
      });
    }
    closeModal();
  };
  const renderTrainers = (option: any) => {
    return (
      <div className="grid gap-0.5 shadow">
        <Text fontWeight="semibold">{option.label}</Text>
      </div>
    );
  };

  function renderEmpty() {
    return (
      <div
        className=" w-full flex gap-4 flex-row items-center justify-between"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-[13px] text-nowrap">
         {` No Staff's Found`}
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Staff Creation");
            router.push("/staff-section/addstaff");
          }}
          className="text-primary text-xs text-nowrap"
        >
          Add Staff <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  function renderOptionDisplayValue(option: any) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
      </div>
    );
  }
  function renderEmptyPack(option: any) {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between mx-1"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-xs text-nowrap">
          No Package Found
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Master Packages");
            router.push("/membership/master-packages");
          }}
          className="text-primary text-xs text-nowrap"
        >
          Add Package <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  useEffect(() => {
    const getTrainers = async () => {
      const gymId = await retrieveGymId();
      const URL = `/api/staff/?deleted=false&gym_id=${gymId}`;
      const res = await AxiosPrivate(URL, {
        id: newID(`trainers-prereq-diet-plans`),
      });
      console.log(res.data);
      setAvailableTrainers(res.data);
    };

    const fetchPackages = async () => {
      try {
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `/api/list-packages/v2/?gym_id=${gymId}&package_type=group`,
          {
            id: newID("master-packages-list-group"),
          }
        );
        const packageData = resp.data.results.packages.map((item: any) => ({
          label: item.name,
          value: item.id,
          min_price: item.min_price,
          max_price: item.max_price,
          num_of_days: item.num_of_days,
        }));
        setPackages(packageData);

        if (packageData.length === 0) {
          toast.error("No packages found for this package type", {
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error(
          "Something went wrong while fetching packages. Please try again."
        );
      }
    };

    getTrainers();
    fetchPackages();
  }, []);

  return (
    <div className="m-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Title as="h3" className="text-lg">
          {classData ? "Update Class" : "Create New Class"}
        </Title>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="p-0 text-gray-500 hover:!text-gray-900"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
      </div>

      <Form<ClassFormInput>
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: {
            name: classData?.name ?? "",
            description: classData?.description ?? "",
            startTime: classData?.startTime ?? "",
            endTime: classData?.endTime ?? "",
            recurrenceType: classData?.recurrenceType ?? "daily",
            weekdays: classData?.weekdays ?? [],
            startDate: classData?.startDate ?? new Date(),
            endDate: classData?.endDate ?? new Date(),
            bookingStartTime: classData?.bookingStartTime ?? new Date(),
            bookingEndTime: classData?.bookingEndTime ?? new Date(),
            capacity: classData?.capacity ?? "",
            isOnline: classData?.isOnline ?? false,
            meetLink: classData?.meetLink ?? "",
            classPackageId: classData?.classPackageId ?? "",
            trainerId: classData?.trainerId ?? "",
          },
        }}
        className="grid grid-cols-1 gap-5 @container md:grid-cols-2 [&_label]:font-medium"
      >
        {({ register, control, watch, getValues, formState: { errors } }) => {
          const isOnline = watch("isOnline");
          const recurrenceType = watch("recurrenceType");

          return (
            <>
              <Input
                label="Class Name"
                placeholder="Enter class name"
                {...register("name")}
                className="col-span-full"
                error={errors.name?.message}
              />

              <Textarea
                label="Class Description"
                placeholder="Enter class description"
                {...register("description")}
                error={errors.description?.message}
                textareaClassName="h-20"
                className="col-span-full"
              />

              <Controller
                name="bookingStartTime"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div className="grid gap-1.5">
                    <Text className="font-medium">Booking Start Date</Text>
                    <DatePicker
                      selected={value}
                      onChange={onChange}
                      showTimeSelect
                      timeFormat="hh:mm aa"
                      dateFormat={`${convertToDateFnsFormat(getDateFormat())} - hh:mm aa`}
                    />
                  </div>
                )}
              />

              <Controller
                name="bookingEndTime"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div className="grid gap-1.5">
                    <Text className="font-medium">Booking End Date</Text>
                    <DatePicker
                      selected={value}
                      onChange={onChange}
                      showTimeSelect
                      timeFormat="hh:mm aa"
                      minDate={getValues("bookingStartTime") || ""}
                      dateFormat={`${convertToDateFnsFormat(getDateFormat())} - hh:mm aa`}
                    />
                  </div>
                )}
              />

              <div className="col-span-full">
                <Title as="h5">Session Details</Title>
              </div>

              <Input
                type="time"
                label="Start Time"
                {...register("startTime")}
                className=""
              />

              <Input
                type="time"
                label="End Time"
                {...register("endTime")}
                className=""
              />

              <Controller
                name="recurrenceType"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Type"
                    options={recurrenceOptions}
                    value={
                      field?.value[0].toUpperCase() + field?.value.slice(1)
                    }
                    onChange={(option: any) => field.onChange(option.value)}
                  />
                )}
              />

              <Input
                type="number"
                label="Capacity"
                {...register("capacity")}
                className=""
              />

              {recurrenceType === "weekly" && (
                <Controller
                  name="weekdays"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      label="Weekdays"
                      options={weekDays.map((day) => ({
                        label: day.charAt(0).toUpperCase() + day.slice(1),
                        value: day,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      multiple
                      className="col-span-full"
                    />
                  )}
                />
              )}

              <Controller
                name="startDate"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div className="grid gap-1.5">
                    <Text className="font-medium">Start Date</Text>
                    <DatePicker
                      selected={value}
                      onChange={onChange}
                      dateFormat={`${convertToDateFnsFormat(getDateFormat())}`}
                    />
                  </div>
                )}
              />

              <Controller
                name="endDate"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div className="grid gap-1.5">
                    <Text className="font-medium">End Date</Text>
                    <DatePicker
                      selected={value}
                      onChange={onChange}
                      dateFormat={`${convertToDateFnsFormat(getDateFormat())}`}
                    />
                  </div>
                )}
              />

              <div className="col-span-full">
                <Switch label="Online Class" {...register("isOnline")} />
              </div>

              {isOnline && (
                <Input
                  label="Meeting Link"
                  placeholder="Enter meeting link"
                  {...register("meetLink")}
                  className="col-span-full"
                />
              )}

              <div className="col-span-full">
                <Switch
                  label="Package Related Class"
                  checked={isPackageRelated}
                  onChange={(checked) => setIsPackageRelated((prev) => !prev)}
                />
                {isPackageRelated && (
                  <Text className="mt-1.5 text-sm text-gray-500">
                    Members booking this session will have sessions deducted
                    from their allocated package sessions when they book and
                    join the class.
                  </Text>
                )}
              </div>

              <Controller
                name="classPackageId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Package"
                    options={
                      packages.length
                        ? packages.map((pkg) => ({
                            label: `${pkg.label} - ${pkg.num_of_days} days`,
                            value: pkg.value,
                          }))
                        : emptyPackage
                    }
                    // options={ ? packages : }

                    value={
                      packages?.find((item) => field.value === item.value)
                        ?.label || ""
                    }
                    onChange={(option: any) => field.onChange(option.value)}
                    disabled={!isPackageRelated}
                    getOptionDisplayValue={(option) =>
                      packages.length
                        ? renderOptionDisplayValue(option)
                        : renderEmptyPack(option)
                    }
                  />
                )}
              />
              <Controller
                name="trainerId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Trainer"
                    options={
                      availableTrainers.length
                        ? availableTrainers.map((trainer) => ({
                            label: trainer.name,
                            value: trainer.id,
                          }))
                        : [{ label: "Empty", value: "empty" }]
                    }
                    value={
                      availableTrainers.find((item) => field.value === item.id)
                        ?.name || ""
                    }
                    onChange={(option: any) => field.onChange(option.value)}
                    getOptionDisplayValue={(option) =>
                      availableTrainers?.length
                        ? renderTrainers(option)
                        : renderEmpty()
                    }
                  />
                )}
              />

              <div className={cn("col-span-full grid grid-cols-2 gap-4 pt-5")}>
                <Button
                  variant="outline"
                  className="w-full @xl:w-auto dark:hover:border-gray-400"
                  onClick={() => closeModal()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="hover:gray-700 w-full @xl:w-auto"
                >
                  Save
                </Button>
              </div>
            </>
          );
        }}
      </Form>
    </div>
  );
}
