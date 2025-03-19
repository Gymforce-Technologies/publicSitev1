import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Text,
  ActionIcon,
  Select,
  Title,
  Textarea,
  Drawer,
  RadioGroup,
  Radio,
} from "rizzui";
import { PackageData } from "./AddPack";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import PencilIcon from "@core/components/icons/pencil";
import { PiX } from "react-icons/pi";
const EditModal: React.FC<{ pack: any; onUpdate: () => Promise<void> }> = ({
  pack,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  console.log(pack);
  const [data, setData] = useState<PackageData>({
    gym_id: "",
    name: "",
    min_price: 0,
    max_price: 0,
    package_type: "",
    training_type: "",
    reference: "",
    duration_type: "days",
    duration_value: 0,
    sessions_allocated: 0,
    activities: "",
  });
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);
  const [isGroup, setIsGroup] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [packageList, setPackageList] = useState<any[]>([]);
  const [centerType, setCenterType] = useState(0);

  const fetchCenters = async () => {
    try {
      const response = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      setCenterType(parseInt(response.data?.center) + 1);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  const fetchPackageType = async () => {
    try {
      const center =
        centerType === 1 ? "gym" : centerType === 2 ? "library" : "dance";
      const resp = await AxiosPrivate.get(
        `/api/add-package-prerequisites/?center_type=${center}`,
        { id: newID(`add-package-prerequisites-${center}`) }
      );
      setPackageList(
        resp.data.options.map((item: any) => ({ label: item, value: item }))
      );
    } catch (error) {
      console.error("Error fetching package types:", error);
    }
  };

  // Effects
  useEffect(() => {
    if (centerType === 0) {
      fetchCenters();
    }
  }, []);

  useEffect(() => {
    if (centerType) {
      fetchPackageType();
    }
  }, [centerType]);

  useEffect(() => {
    const getPre = async () => {
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
    };
    getPre();
  }, []);

  useEffect(() => {
    setData({
      gym_id: pack.gym_id,
      name: pack.name,
      min_price: pack.min_price,
      max_price: pack.max_price,
      package_type: pack.package_type,
      training_type: pack.training_type,
      reference: pack.reference || "",
      duration_type: "days",
      duration_value: pack.num_of_days,
      sessions_allocated: pack.sessions_allocated || 0,
      activities: pack.activities,
    });
    if (pack.package_type.toLowerCase() === "group") {
      setIsGroup(true);
    }
  }, [pack]);

  // useEffect(() => {
  //   const getPreReq = async () => {
  //     try {
  //       const gymId = await retrieveGymId();
  //       const resp = await AxiosPrivate.get(
  //         `api/add-package-prerequisites/?gym_id=${gymId}`
  //       );
  //       console.log(resp.data);
  //       const activtyList = resp.data.map((activity: any) => {
  //         return { label: activity.name, value: activity.id };
  //       });
  //       console.log(activtyList);
  //       setActivities(activtyList);
  //     } catch (error) {
  //       console.error("Error fetching pre-requisites:", error);
  //     }
  //   };
  //   getPreReq();
  // }, [data]);

  const handleInputChange = useCallback(
    (field: keyof PackageData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "number"
          ? e.target.value === ""
            ? null
            : Number(e.target.value)
          : e.target.value;
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (name: keyof PackageData) => (value: { value: string }) => {
      setData((prev) => ({ ...prev, [name]: value.value }));
      if (value.value.toLowerCase() === "pt") {
        setData((prev) => ({ ...prev, sessions_allocated: null }));
      } else {
        if (value.value.toLowerCase() === "group") {
          setIsGroup(true);
        }
        setData((prev) => ({
          ...prev,
          sessions_allocated:
            prev.duration_type === "months"
              ? (prev.duration_value as number) * 30
              : prev.duration_value,
        }));
      }
    },
    [data.duration_type, data.duration_value]
  );

  useEffect(() => {
    if (data.package_type.toLowerCase() !== "pt") {
      setData((prev) => ({
        ...prev,
        sessions_allocated:
          prev.duration_type === "months" && prev.duration_value !== null
            ? prev.duration_value * 30
            : prev.duration_value,
      }));
    }
  }, [data.duration_type, data.duration_value, data.package_type]);

  const durationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setData((prev) => ({
        ...prev,
        duration_value: null,
        sessions_allocated: null,
      }));
    } else {
      const value = parseInt(e.target.value);
      setData((prev) => ({
        ...prev,
        duration_value: value,
        sessions_allocated:
          prev.package_type.toLowerCase() !== "pt"
            ? prev.duration_type === "months"
              ? value * 30
              : value
            : null,
      }));
    }
  };

  useEffect(() => {
    const getPreReq = async () => {
      try {
        const center =
          centerType === 1 ? "gym" : centerType === 2 ? "library" : "dance";
        const resp = await AxiosPrivate.get(
          `/api/add-package-prerequisites/?center_type=${center}`,
          { id: newID(`add-package-prerequisites-${center}`) }
        );
        console.log(resp.data);
        const activtyList = resp.data.map((activity: any) => {
          return { label: activity.name, value: activity.id };
        });
        console.log(activtyList);
        setActivities(activtyList);
      } catch (error) {
        console.error("Error fetching pre-requisites:", error);
      }
    };
    if (centerType) {
      getPreReq();
    }
  }, [data, centerType]);

  const handleEdit = async () => {
    try {
      const gymID = await retrieveGymId();
      const payload = {
        ...data,
        gym_id: gymID,
        package_type: data.package_type,
        price: data.max_price,
        sessions_completed: pack.sessions_completed || 0,
      };
      const gymId = await retrieveGymId();
      await AxiosPrivate.put(
        `/api/master-packages/${pack.id}/?gym_id=${gymId}`,
        payload
      ).then(() => {
        invalidateAll();
        toast.success("Package updated successfully");
        setIsOpen(false);
      });
      await onUpdate();
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Something went wrong while updating package");
    }
  };

  return (
    <div>
      <ActionIcon size="sm" variant="text" onClick={() => setIsOpen(true)}>
        <PencilIcon className="h-4 w-4 hover:text-primary" />
      </ActionIcon>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        // containerClassName="dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="m-auto p-6 md:p-8 h-full">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Title as="h3" className="">
                Edit Master Package
              </Title>
            </div>
            <ActionIcon
              size="sm"
              variant="text"
              onClick={() => setIsOpen(false)}
            >
              <PiX className="h-auto w-6 " strokeWidth={1.8} />
            </ActionIcon>
          </div>
          <div className="grid grid-cols-2 gap-4 [&_label>span]:font-medium ">
            <Input
              label="Title *"
              name="name"
              placeholder="Membership Name..."
              className="col-span-2"
              labelClassName=""
              value={data.name}
              onChange={handleInputChange("name")}
            />
            <Select
              name="package_type"
              label="Package Type"
              options={packageList}
              className="col-span-full"
              value={
                packageList.find(
                  (pack) =>
                    pack.value.toLowerCase() === data.package_type.toLowerCase()
                )?.label
              }
              onChange={handleSelectChange("package_type")}
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
            <Select
              options={activities}
              name="activities"
              label="Activity"
              className={isGroup ? "col-span-full" : "hidden"}
              value={
                activities.find(
                  (activity) => activity.value === parseInt(data.activities)
                )?.label
              }
              onChange={(option: any) => {
                setData((prev) => ({ ...prev, activities: option.value }));
              }}
            />
            <Input
              // prefix={<PiCurrencyInrBold />}
              label="Max Cost *"
              name="max_price"
              type="number"
              placeholder="Max Cost"
              value={data.max_price ?? ""}
              onChange={handleInputChange("max_price")}
              labelClassName=""
              prefix={
                <Text className="text-primary">
                  {demographicInfo?.currency_symbol || " "}
                </Text>
              }
            />
            <Input
              // prefix={<PiCurrencyInrBold />}
              label="Min Cost *"
              name="min_price"
              type="number"
              placeholder="Min Cost"
              value={data.min_price ?? ""}
              onChange={handleInputChange("min_price")}
              labelClassName=""
              prefix={
                <Text className="text-primary">
                  {demographicInfo?.currency_symbol || " "}
                </Text>
              }
            />
            <RadioGroup
              value={data.duration_type}
              setValue={(value) =>
                setData((prev) => ({
                  ...prev,
                  duration_type: value as "days" | "months",
                }))
              }
              className="flex gap-4 col-span-full"
            >
              <Radio label="Days" value="days" />
              <Radio label="Month(s)" value="months" />
            </RadioGroup>
            <Input
              label="Duration *"
              name="duration_value"
              type="number"
              placeholder="Duration Value ..."
              value={data.duration_value ?? ""}
              onChange={(e) => durationChange(e)}
              labelClassName=""
            />
            <Input
              label="Sessions Allocated *"
              name="sessions_allocated"
              type="number"
              placeholder="Sessions Allocated ..."
              value={data.sessions_allocated ?? ""}
              onChange={handleInputChange("sessions_allocated")}
              labelClassName=""
            />
            <Textarea
              label="Description"
              name="reference"
              placeholder="Package Description..."
              className="col-span-2"
              labelClassName=""
              value={data.reference}
              //@ts-ignore
              onChange={handleInputChange("reference")}
            />
          </div>
          <div className="grid grid-cols-2 gap-5 mt-8">
            <Button
              type="reset"
              size="md"
              onClick={() => setIsOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit" size="md" onClick={handleEdit}>
              Update
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default EditModal;
