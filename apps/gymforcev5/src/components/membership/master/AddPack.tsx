import { useEffect, useState, useCallback } from "react";
import { PiPlusBold, PiX } from "react-icons/pi";
import { TbPlaylistAdd } from "react-icons/tb";
import {
  Button,
  Text,
  ActionIcon,
  Input,
  Select,
  Title,
  Drawer,
  Textarea,
  RadioGroup,
  Radio,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import toast from "react-hot-toast";
export interface PackageData {
  gym_id: string;
  name: string;
  min_price: number | null;
  max_price: number | null;
  // num_of_days: number | null;
  package_type: string;
  activities: string;
  training_type: string;
  reference: string;
  duration_type: string; // 'days' or 'months'
  duration_value: number | null;
  sessions_allocated: number | null;
}
const AddPackage: React.FC<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPackageAdded: () => void;
}> = ({ open, setOpen, onPackageAdded }) => {
  const initialState: PackageData = {
    gym_id: "",
    name: "",
    min_price: null,
    max_price: null,
    // num_of_days: null,
    package_type: "",
    activities: "",
    training_type: "",
    reference: "",
    duration_type: "days",
    duration_value: null,
    sessions_allocated: null,
  };
  const [isGroup, setIsGroup] = useState(false);
  const [data, setData] = useState<PackageData>(initialState);
  const [packageList, setPackageList] = useState<any[]>([]);
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [centerType, setCenterType] = useState(0);

  useEffect(() => {
    const getPre = async () => {
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
    };
    getPre();
  }, []);

  useEffect(() => {
    const retGymId = async () => {
      const id = await retrieveGymId();
      setData((prev) => ({ ...prev, gym_id: id || "" }));
    };
    retGymId();
  }, []);

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
        setData((prev) => ({ ...prev, sessions_allocated: null })); // Reset sessions for PT
      } else {
        if (value.value.toLowerCase().includes("group")) {
          setIsGroup(true);
        }
        setData((prev) => ({
          ...prev,
          sessions_allocated:
            prev.duration_type === "months"
              ? //@ts-ignore
                prev.duration_value * 30
              : prev.duration_value,
        }));
      }
    },
    [data.duration_type, data.duration_value]
  );

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

  const addData = useCallback(async () => {
    try {
      const gym_id = await retrieveGymId();
      const payload = {
        ...data,
        package_type: data.package_type,
        price: data.max_price,
        sessions_completed: 0,
      };
      await AxiosPrivate.post(
        `/api/master-packages/?gym_id=${gym_id}`,
        payload
      ).then(() => {
        setData(initialState);
        toast.success("Package Added Successfully");
        invalidateAll();
        onPackageAdded();
        setOpen(false);
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        // `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
        "Something went wrong while adding package"
      );
    }
  }, [data, setOpen, onPackageAdded]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <div className="flex flex-row flex-1 items-center gap-4 p-2 font-semibold">
          Add
          <PiPlusBold />
        </div>
      </Button>
      <Drawer
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setData(initialState);
        }}
        containerClassName="overflow-y-auto custom-scrollbar"
      >
        <div className="m-auto p-6 flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-row flex-nowrap items-center gap-2">
              <TbPlaylistAdd size={32} className="" />
              <Title as="h3" className="">
                Add Master Package
              </Title>
            </div>
            <ActionIcon
              size="sm"
              variant="text"
              onClick={() => {
                setOpen(false);
                setData(initialState);
              }}
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
                setData(
                  //@ts-ignore
                  { ...data, duration_type: value }
                )
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
              // className="col-span-2"
              placeholder="Duration Value ..."
              value={data.duration_value ?? ""}
              onChange={(value) => durationChange(value)}
              labelClassName=""
            />
            <Input
              label="Sessions Allocated *"
              name="sessions_allocated"
              type="number"
              // className="col-span-2"
              placeholder="Sessions Allocated ..."
              value={data.sessions_allocated ?? ""}
              // readOnly={data.package_type!=='PT'}
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
          <div className=" grid grid-cols-2 gap-5 md:gap-10 mt-8">
            <Button
              type="reset"
              size="md"
              onClick={() => {
                setOpen(false);
                setData(initialState);
              }}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              onClick={addData}
              className="w-full"
            >
              Add
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default AddPackage;
