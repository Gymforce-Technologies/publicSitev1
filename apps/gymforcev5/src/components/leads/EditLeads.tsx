import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Text,
  ActionIcon,
  Input,
  Select,
  Title,
  Loader,
  Drawer,
  RadioGroup,
  Radio,
  Badge,
  AdvancedRadio,
} from "rizzui";
// import { getAccessToken } from "@/app/[locale]/auth/Acces";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { Source, Status } from "./LeadTypes";
import { Data } from "./Leads";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { CircleCheck, X, XIcon } from "lucide-react";
import { PhoneNumber } from "@core/ui/phone-input";
import toast from "react-hot-toast";
import { DatePicker } from "@core/ui/datepicker";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import Image from "next/image";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import CameraCapture from "@/components/member-list/Capture";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { FaUser, FaUsers } from "react-icons/fa6";
import { RiUserVoiceFill } from "react-icons/ri";
import { BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
// import { BsArrowRight } from "react-icons/bs";

export type Category = {
  id: number;
  name: string;
};

interface EditProps {
  modalState: boolean;
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
  leadVal: Data;
  category: Category[];
  status: Status[];
  source: Source[];
  getData: () => void;
  contactType: any;
}
export interface Lead {
  name: string;
  phone: string;
  email: string;
  converted: boolean;
  tentative_joining_date: string;
  date_of_birth: string;
  visiting_date: string;
  visiting_center: number;
  source_id: number | null;
  status_id: number | null;
  category_id?: number | null;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  address_country: string;
  gender: string;
  enquiry_mode: string;
  visitor_image: string | null;
  offer?: number | null;
  offer_details?: any | null;
  offer_id?: number | null;
  offer_price?: number | null;
  package?: any | null;
  package_details?: any | null;
  package_id?: number | null;
}

const InitialLead = {
  name: "",
  phone: "",
  email: "",
  converted: false,
  tentative_joining_date: "",
  date_of_birth: "2024-07-04",
  visiting_date: new Date()
    .toLocaleDateString()
    .replaceAll("/", "-")
    .split("-")
    .reverse()
    .join("-"),
  visiting_center: 0,
  source_id: 0,
  status_id: 0,
  category_id: 0,
  address_street: "",
  address_city: "",
  address_state: "",
  address_zip_code: "",
  address_country: "",
  gender: "",
  enquiry_mode: "",
  visitor_image: null,
  offer: null,
  offer_details: null,
  offer_id: null,
  offer_price: null,
  package: null,
  package_details: null,
  package_id: null,
};

interface Option {
  label: string;
  value: number;
}

interface Package extends Option {
  min_price: number;
  max_price: number;
  num_of_days: number;
}

interface MetricItem {
  title: string;
  icon?: React.ReactNode;
  value: string;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
  offer_startDate: string;
  offer_endDate: string;
  is_active: boolean;
  discounts: string;
  gym: number;
  package: any;
  offer_price: any;
}
export default function Edit({
  leadVal,
  source,
  category,
  status,
  modalState,
  setModalState,
  getData,
  contactType,
}: EditProps) {
  // console.log(leadVal);
  const [data, setData] = useState<Lead>(InitialLead);
  const [phoneCountry, setPhoneCountry] = useState<string>("in");
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));
  const router = useRouter();
  const [lock, setLock] = useState(false);
  const [errors, setErrors] = useState<{ [key in keyof Lead]?: string }>({});
  const handleCountryChange = (selectedValue: string) => {
    setData((prev) => ({ ...prev, address_country: selectedValue }));
    const countryData =
      COUNTRY_MAPPINGS[selectedValue as keyof typeof COUNTRY_MAPPINGS];
    if (countryData) {
      setPhoneCountry(countryData.code.toLowerCase());
    }
  };
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    leadVal.visitor_image === undefined ? null : leadVal.visitor_image
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [centerType, setCenterType] = useState(0);
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [showCamera, setShowCamera] = useState(false);
  const emptyPackage: Package[] = [
    {
      label: "No Packages Found",
      value: 0,
      min_price: 0,
      max_price: 0,
      num_of_days: 0,
    },
  ];

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  // const [packagesList, setPackagesList] = useState<any[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [metricData, setMetricData] = useState([
    { label: "All", value: "All" },
  ]);
  const [masterData, setMasterData] = useState<any[]>([]);
  const [packageType, setPackageType] = useState("All");
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [offerList, setOfferList] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  // API functions
  const fetchMasterPack = async (packageType: string) => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/list-packages/v2/?gym_id=${gymId}${packageType !== "All" ? `&package_type=${packageType.split(" ")[0]}` : ""}`,
        {
          id: newID(
            "master-packages-list-" +
              (packageType === "All" ? "all" : packageType.split(" ")[0])
          ),
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
    } catch (error) {
      console.error("Error fetching master packages:", error);
      toast.error("Something went wrong while fetching master packages");
    } finally {
      setLoading(false);
    }
  };

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
      setMetricData((prev) => [
        ...prev,
        ...(resp.data.options.map((item: any) => ({
          label: item,
          value: item,
        })) as any[]),
      ]);
    } catch (error) {
      console.error("Error fetching package types:", error);
    }
  };

  // Event handlers
  // const handlePackageType = (value: string) => {
  //   setPackageType((prevPackageType) => {
  //     const newPackageType =
  //       prevPackageType.toLowerCase() === value.toLowerCase() ? "" : value;
  //     fetchMasterPack(newPackageType);
  //     return newPackageType;
  //   });
  // };

  const validateField = (name: keyof Lead, value: string): string => {
    switch (name) {
      case "name":
        return !value ? "Name is required" : "";
      case "phone":
        return !value
          ? "Phone number is required"
          : !/^\+?[1-9]\d{1,14}$/.test(value)
            ? "Invalid phone number format"
            : "";
      // case "email":
      //   return !value
      //     ? "Email is required"
      //     : !/\S+@\S+\.\S+/.test(value)
      //       ? "Invalid email format"
      //       : "";
      // case 'date_of_birth':
      //   return !value ? 'Date of birth is required' : '';
      case "gender":
        return value === "" ? "Gender is required" : "";
      case "category_id":
        return value == null || !value ? "Category is required" : "";
      case "source_id":
        return value === "" ? "Source is required" : "";
      // case 'status_id':
      //   return value === null ? 'Status is required' : '';
      // case 'address_country':
      //   return !value ? 'Country is required' : '';

      default:
        return "";
    }
  };

  const handleCameraCapture = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };
  const handleRadioChange =
    (name: "gender" | "enquiry_mode") => (value: string) => {
      setData((prev) => ({ ...prev, [name]: value }));
      if (name === "gender") {
        const error = validateField("gender", value);
        setErrors((prev) => ({ ...prev, gender: error }));
      }
    };

  async function updateLead(data: any) {
    try {
      // const newErrors: { [key in keyof Lead]?: string } = {};
      // (Object.keys(data) as Array<keyof Lead>).forEach((key) => {
      //   const error = validateField(key, data[key]?.toString() || "");
      //   if (error) newErrors[key] = error;
      // });

      // if (Object.keys(newErrors).length > 0) {
      //   setErrors(newErrors);
      //   console.log(newErrors);
      //   toast.error("Please fill in all required fields correctly");
      //   return;
      // }
      setLock(true);
      setLoading(true);
      const payload = {
        ...data,
      };

      if (payload.status_id === null) {
        delete payload.status_id;
      }
      if (payload.visitor_image || imageFile) {
        payload.visitor_image = imageFile;
      }
      if (payload.date_of_birth === "") {
        delete payload.date_of_birth;
      }
      if (payload.category_id === null) {
        delete payload.category_id;
      }
      if (!payload.phone.startsWith("+")) {
        payload.phone = "+" + payload.phone;
      }
      // console.log(data);
      const gymId = await retrieveGymId();
      const { visiting_center, ...leadData } = payload;
      await AxiosPrivate.put(
        `/api/visitors/${leadVal.LeadId}/?gym_id=${gymId}`,
        leadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then(() => {
        invalidateAll();
        toast.success("Enquiry Updated Successfully");
      });
      setModalState(false);
      setData(InitialLead);
      getData();
    } catch (error) {
      console.error("Error updating Enquiry:", error);
      toast.error("Something went wrong while Updating the Enquiry");
    } finally {
      setLock(false);
    }
  }
  const handleSubmit = async () => {
    await updateLead(data);
  };

  function renderOfferDisplayValue(offer: Offer) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold" className="capitalize">
          {offer.title}
        </Text>
        <div className="flex flex-row w-full gap-8">
          <div className="flex items-center gap-1">
            <Text>
              <Text as="span" className="font-medium">
                Price:
              </Text>{" "}
              {demographiInfo?.currency_symbol} {offer.offer_price}
            </Text>
          </div>
          <div className="flex items-center gap-1">
            <Text as="span" className="font-medium">
              Package:
            </Text>{" "}
            <Text>{offer.package?.name || "N/A"}</Text>
          </div>
        </div>
        <div className="flex flex-row gap-4 mt-1 items-center">
          <Badge variant="flat">
            {formateDateValue(new Date(offer.offer_startDate))}
          </Badge>
          <Text>to</Text>
          <Badge variant="flat">
            {formateDateValue(new Date(offer.offer_endDate))}
          </Badge>
        </div>
      </div>
    );
  }

  function renderOptionDisplayValue(option: Package) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex flex-col w-full gap-2">
          <div className="flex items-center gap-1">
            <Text>
              <Text as="span" className="font-medium">
                Price Range :
              </Text>{" "}
              {demographiInfo?.currency_symbol}{" "}
            </Text>
            <Text>
              {option.min_price} - {option.max_price}
            </Text>
          </div>
          <div className="flex items-center gap-1">
            <Text className="font-medium">Duration :</Text>
            <Text>{option.num_of_days + " days"}</Text>
          </div>
        </div>
      </div>
    );
  }

  function renderEmpty(option: Package) {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-[13px] text-nowrap">
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

  function renderEmptyOffer(option: Offer) {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between px-2"
        onClick={(e) => e.preventDefault()}
      >
        <Text className=" font-semibold text-[13px] text-center">
          No Offers Found
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Offers Section");
            router.push("/webanalysis?section=offerList");
          }}
          className="text-primary text-xs text-nowrap"
        >
          Add Offer <BsArrowRight size={20} className="ml-2 animate-pulse" />
        </Button>
      </div>
    );
  }

  useEffect(() => {
    const getInfo = async () => {
      const infoData = await retrieveDemographicInfo();
      setData((prev) => {
        return { ...prev, address_country: infoData?.country || "India" };
      });
      setDemographicInfo(infoData);
    };
    getInfo();
  }, []);

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
    fetchMasterPack(packageType);
    const fetchOffers = async () => {
      try {
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `/api/list-create-offers/?gym_id=${gymId}`
        );
        setOfferList(resp.data);
      } catch (error) {
        console.error("Error fetching offers:", error);
        toast.error("Error loading offers");
      }
    };
    fetchOffers();
  }, [packageType]);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      const gymId = await retrieveGymId();
      setData({
        name: leadVal.name || "",
        phone: leadVal.phone || "",
        email: leadVal.email || "",
        converted: leadVal.converted || false,
        tentative_joining_date: leadVal.reminder || "",
        date_of_birth: leadVal.dob || "",
        visiting_date:
          leadVal.date ||
          new Date()
            .toLocaleDateString()
            .replaceAll("/", "-")
            .split("-")
            .reverse()
            .join("-"),
        visiting_center: parseInt(gymId as string) || 0,
        source_id:
          source.find((src) => src.leadSourceName === leadVal.source)?.id ||
          null,
        status_id:
          status.find((src) => src.leadStatusName === leadVal.status)?.id ||
          null,
        category_id:
          category.find((src) => src.name === leadVal.category)?.id || null,
        address_street: leadVal.address_street || "",
        address_city: leadVal.address_city || "",
        address_state: leadVal.address_state || "",
        address_zip_code: leadVal.address_zip_code || "",
        address_country: leadVal.address_country || "",
        gender: leadVal.gender,
        enquiry_mode: leadVal.enquiry_mode || "",
        visitor_image: leadVal.visitor_image || null,
        offer: leadVal.offer || null,
        offer_details: leadVal.offer_details || null,
        offer_id: leadVal.offer_id || null,
        offer_price: leadVal.offer_price || null,
        package: leadVal.package || null,
        package_details: leadVal.package_details || null,
        package_id: leadVal.package_id || null,
      });
      setImagePreview(leadVal.visitor_image ?? null);

      if (leadVal.address_country) {
        const countryData =
          COUNTRY_MAPPINGS[
            leadVal.address_country as keyof typeof COUNTRY_MAPPINGS
          ];
        if (countryData) {
          setPhoneCountry(countryData.code.toLowerCase());
        }
      }
      setErrors({});
    };

    fetchDataAndSetState();
  }, [leadVal, source, status, category]);

  const PackageTypeGrid = useCallback(
    () => (
      <div className="relative px-1 col-span-full flex w-full items-center overflow-hidden custom-scrollbar">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={scrollToTheLeft}
          className="!absolute -left-1 top-0 z-10 !h-full w-10 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70"
        >
          <PiCaretLeftBold className="h-4 w-4" />
        </Button>

        <div
          className="w-full px-1.5 py-3 pb-2 custom-scrollbar-x overflow-x-auto scroll-smooth pr-2 lg:pr-6"
          ref={sliderEl}
        >
          <RadioGroup
            value={packageType}
            setValue={(value: any) => {
              // If clicking the same option, deselect it (set to empty)
              if (value === packageType) {
                setPackageType("");
                fetchMasterPack("");
              } else {
                setPackageType(value);
                fetchMasterPack(value);
              }
            }}
            className="flex items-center gap-2.5"
          >
            {metricData.map((metric, index) => (
              <AdvancedRadio
                key={index}
                value={metric.value}
                className={`relative flex items-center gap-2 rounded-lg pt-2  transition-all duration-200 ${
                  packageType === metric.value
                    ? "border-primary shadow-sm"
                    : "border-gray-200 hover:scale-105"
                }`}
              >
                {/* {packageType === metric.value && (
                  <XIcon
                    size={18}
                    className="absolute -top-4 right-2 z-[99999] text-primary cursor-pointer hover:scale-110 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePackageType(metric.value);
                    }}
                  />
                )} */}
                <div className="flex flex-row items-center gap-2 p-1 transition-all duration-200 ">
                  <Text className="text-sm font-medium text-gray-900 truncate ">
                    {metric.label}
                  </Text>
                  <div
                    className={`flex items-center text-primary ${packageType === metric.value ? "" : "hidden"}`}
                  >
                    <CircleCheck size={18} className="" />
                  </div>
                </div>
              </AdvancedRadio>
            ))}
          </RadioGroup>
        </div>

        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={scrollToTheRight}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>
    ),
    [metricData, packageType, masterData]
  );

  return (
    <Drawer
      isOpen={modalState}
      onClose={() => setModalState(false)}
      size="lg"
      // containerClassName="dark:bg-gray-800"
    >
      <div className="p-6 md:p-8 xl:p-10 w-full h-full mx-auto rounded-md  overflow-y-auto custom-scrollbar">
        <div className="mb-4 flex items-center justify-between">
          <Title as="h3" className="text-lg font-semibold ">
            {`Update ${data.name}'s Lead`}
          </Title>
          <ActionIcon
            size="sm"
            variant="text"
            onClick={() => setModalState(false)}
          >
            <X className="h-5 w-5 " />
          </ActionIcon>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 justify-center">
          <div className="col-span-full">
            <div className="mt-1 flex items-center gap-4 md:gap-8">
              <div className="flex flex-col justify-start gap-2">
                <Text className="text-sm font-medium ">Profile Image</Text>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <div className="flex max-sm:flex-col sm:items-center gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="max-w-28 sm:max-w-40"
                    size="sm"
                  >
                    Upload
                  </Button>
                  <Button
                    onClick={() => setShowCamera(true)}
                    variant="outline"
                    className="max-w-28 sm:max-w-40"
                    size="sm"
                  >
                    Take Photo
                  </Button>
                </div>
              </div>
              {imagePreview && (
                <div className="w-24 h-24 relative">
                  <Image
                    src={imagePreview}
                    alt="Profile Preview *"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
          <Input
            name="name"
            label="Name *"
            placeholder="Enter First Name"
            value={data.name}
            labelClassName=""
            error={errors.name}
            onChange={(e) =>
              setData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <PhoneNumber
            label="Phone Number *"
            country={phoneCountry}
            labelClassName=" font-medium"
            value={data.phone}
            error={errors.phone}
            onChange={(value) => setData((prev) => ({ ...prev, phone: value }))}
          />
          <div className="max-sm:col-span-full flex flex-col gap-2 md:mt-1">
            <Text className="font-medium ">Gender *</Text>
            <RadioGroup
              value={data.gender}
              //@ts-ignore
              setValue={handleRadioChange("gender")}
              className="flex flex-wrap gap-4"
            >
              <Radio label="Male" value="male" />
              <Radio label="Female" value="female" />
              <Radio label="Other" value="other" />
            </RadioGroup>
            {errors.gender && (
              <span className=" text-red-500 text-xs">Gender is required</span>
            )}
          </div>
          {/* <Input 
          name="date_of_birth" 
          type="date" 
          label="Date of Birth" 
          value={data.date_of_birth}
          onChange={(e) => setData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
        /> */}

          <Select
            name="Category "
            label="Category *"
            options={category.map((src) => ({
              label: src.name,
              value: src.id,
            }))}
            value={category.find((cat) => cat.id === data.category_id)?.name}
            onChange={({ value }) => {
              setData((prev) => ({ ...prev, category_id: value }));
            }}
            clearable={data.category_id !== -1}
            onClear={(event) => {
              event.preventDefault();
              setData((prev) => ({ ...prev, category_id: null }));
            }}
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          />
          <Select
            name="source"
            label="Source *"
            options={source.map((src) => ({
              label: src.leadSourceName,
              value: src.id.toString(),
            }))}
            value={
              source.find((src) => src.id === data.source_id)?.leadSourceName
            }
            onChange={({ value }) => {
              setData((prev) => ({ ...prev, source_id: parseInt(value) }));
            }}
            error={errors.source_id}
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          />
          <Input
            name="date_of_birth"
            type="date"
            label="Date of Birth"
            value={data.date_of_birth}
            onChange={(e) => {
              setData((prev) => ({ ...prev, date_of_birth: e.target.value }));
            }}
            placeholder="Enter Date of Birth"
          />
          <Input
            name="email"
            label="Email"
            placeholder="Enter your email"
            value={data.email}
            labelClassName=""
            // error={errors.email}
            onChange={(e) =>
              setData((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <div className="flex flex-col gap-2 ">
            <Text className="font-medium">Expected Joining Date *</Text>
            <DatePicker
              name="tentative_joining_date"
              value={
                data.tentative_joining_date
                  ? formateDateValue(new Date(data.tentative_joining_date))
                  : ""
              }
              // value={data.tentative_joining_date}
              onChange={(date: any) =>
                setData((prev) => ({
                  ...prev,
                  tentative_joining_date: formateDateValue(
                    new Date(date.getTime()),
                    "YYYY-MM-DD"
                  ),
                }))
              }
              placeholderText="Select the Joining Date"
              showMonthDropdown={true}
              showYearDropdown={true}
              scrollableYearDropdown={true}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              className="col-span-full sm:col-span-1"
            />
          </div>
          <Select
            name="enquiry_mode"
            label="Contact By"
            options={contactType}
            value={data.enquiry_mode}
            onChange={({ value }: { value: any }) =>
              setData((prev) => ({ ...prev, enquiry_mode: value }))
            }
            clearable={data.enquiry_mode !== null}
            onClear={() => setData((prev) => ({ ...prev, enquiry_mode: "" }))}
            className="col-span-full sm:col-span-1"
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          />
          <PackageTypeGrid />
          <div className="grid grid-cols-1 gap-0.5">
            <Select
              label="Interested Package"
              name="package_id"
              options={packages.length ? packages : emptyPackage}
              value={packages.find((pkg) => pkg.value === data.package_id)}
              onChange={(option: Package | null) => {
                setSelectedPackage(option || null);
                setData((prev) => ({
                  ...prev,
                  package_id: option?.value || null,
                  offer_price: option?.max_price || null,
                }));
              }}
              // labelClassName=""
              getOptionDisplayValue={(option) =>
                packages.length
                  ? renderOptionDisplayValue(option)
                  : renderEmpty(emptyPackage[0])
              }
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
          </div>
          <Select
            label="Enquiry's Interested Offer"
            name="offer"
            options={
              offerList.length
                ? offerList.map((offer) => ({
                    label: offer.title,
                    value: offer.id,
                    ...offer,
                  }))
                : [{ label: "Empty", value: "empty" }]
            }
            value={
              data.offer
                ? offerList.find((o) => o.id === data.offer)?.title
                : ""
            }
            onChange={(option: Offer) => {
              setSelectedOffer(option);
              setData((prev) => ({
                ...prev,
                offer: option.id,
                offer_price: option.offer_price || prev.offer_price,
              }));
            }}
            //@ts-ignore
            getOptionDisplayValue={(option: any) =>
              offerList.length
                ? renderOfferDisplayValue(option)
                : renderEmptyOffer(option)
            }
            clearable
            onClear={() => {
              setSelectedOffer(null);
              setData((prev) => ({ ...prev, offer: null }));
            }}
            className="col-span-full sm:col-span-1 capitalize"
          />
          <Input
            name="address_street"
            label="Address"
            placeholder="Enter the address"
            value={data.address_street}
            onChange={(e) =>
              setData((prev) => ({ ...prev, address_street: e.target.value }))
            }
          />
          {/* <Input
            name="address_city"
            label="City"
            placeholder="Enter city"
            value={data.address_city}
            onChange={(e) => setData((prev) => ({ ...prev, address_city: e.target.value }))}
          />
          <Input
            name="address_state"
            label="State"
            placeholder="Enter state"
            value={data.address_state}
            onChange={(e) => setData((prev) => ({ ...prev, address_state: e.target.value }))}
          /> */}
          <Input
            name="address_zip_code"
            label="ZIP / Postcode"
            placeholder="Enter ZIP or postcode"
            value={data.address_zip_code}
            onChange={(e) =>
              setData((prev) => ({ ...prev, address_zip_code: e.target.value }))
            }
          />
          <Select
            label="Country *"
            value={data.address_country}
            options={countryOptions}
            onChange={(selectedValue: string) =>
              handleCountryChange(selectedValue)
            }
            getOptionValue={(option) => option.value}
            className="col-span-full sm:col-span-1"
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          />
          <div className="flex flex-row col-span-full justify-between  gap-3 md:gap-6 mt-4 md:mt-8">
            <Button
              onClick={() => setModalState(false)}
              variant="outline"
              className="w-full sm:max-w-40"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              type="submit"
              variant="solid"
              className="w-full sm:max-w-40"
              disabled={lock}
            >
              {lock ? <Loader variant="threeDot" /> : "Update"}
            </Button>
          </div>
        </div>
      </div>
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        showCamera={showCamera}
      />
    </Drawer>
  );
}
