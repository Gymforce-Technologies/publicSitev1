"use client";
import React, {
  useCallback,
  useEffect,
  // useMemo,
  useRef,
  useState,
} from "react";
import {
  // Modal,
  Button,
  Text,
  // ActionIcon,
  Input,
  Select,
  RadioGroup,
  Radio,
  Title,
  // Loader,
  // Modal,
  Badge,
  // Drawer,
  AdvancedRadio,
  // Empty,
} from "rizzui";
// import { Plus, X } from "lucide-react";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { PhoneNumber } from "@core/ui/phone-input";
// import { PiArrowRightBold } from "react-icons/pi";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import {
  DemographicInfo,
  getDemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { DatePicker } from "@core/ui/datepicker";
import Image from "next/image";
import { CircleCheck, XIcon } from "lucide-react";
// import DateCell from "@core/ui/date-cell";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { FaUser, FaUsers } from "react-icons/fa6";
import { RiUserVoiceFill } from "react-icons/ri";
import { BsArrowRight } from "react-icons/bs";
// import Link from "next/link";

// import AddOffer from "../webanalysis/NewOffer";
const AddOffer = dynamic(() => import("../webanalysis/NewOffer"), {
  ssr: false,
});
const CameraCapture = dynamic(
  () => import("@/components/member-list/Capture"),
  { ssr: false }
);
const LeadPreview = dynamic(() => import("./LeadPreview"));

// import CameraCapture from "@/components/member-list/Capture";
// import LeadPreview from "./LeadPreview";
import dynamic from "next/dynamic";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";

type Lead = {
  name: string;
  phone: string;
  email: string;
  date_of_birth?: string;
  visiting_date: string;
  tentative_joining_date: string;
  gender: string;
  remarks: string;
  enquiry_mode: string;
  visiting_center: string | null;
  address_street: string;
  address_city: string;
  address_zip_code: string;
  address_state: string;
  address_country: string;
  source_id: number | null;
  status_id?: number | null;
  category_id?: number | null;
  visitor_image?: File | null;
  offer_price: number | null;
  package_id: number | null;
  offer: number | null;
};

type Category = {
  id: number;
  name: string;
};

type Status = {
  id: number;
  leadStatusName: string;
};

type Source = {
  id: number;
  leadSourceName: string;
};

const InitialLead: Lead = {
  name: "",
  phone: "",
  email: "",
  date_of_birth: "",
  visiting_date: new Date().toISOString().split("T")[0],
  tentative_joining_date: new Date().toISOString().split("T")[0],
  gender: "",
  remarks: "",
  enquiry_mode: "",
  visitor_image: null,
  visiting_center: null,
  address_street: "",
  address_city: "",
  address_zip_code: "",
  address_state: "",
  address_country: "",
  source_id: null,
  status_id: null,
  category_id: null,
  offer_price: null,
  package_id: null,
  offer: null,
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

export default function NewLeadsSection() {
  const [data, setData] = useState<Lead>(InitialLead);
  const [errors, setErrors] = useState<{ [key in keyof Lead]?: string }>({});
  const [category, setCategory] = useState<Category[]>([]);
  const [source, setSource] = useState<Source[]>([]);
  const [status, setStatus] = useState<Status[]>([]);
  const [lock, setLock] = useState<boolean>(false);
  const [phoneCountry, setPhoneCountry] = useState<string>("in");
  const router = useRouter();
  const [auth, setAuth] = useState<boolean>(true);
  const [isValid, setIsValid] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  // const [showAdditional, setShowAdditional] = useState(false);
  const [contactType, setContactType] = useState([]);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [metricData, setMetricData] = useState([
    { label: "All", value: "All" },
  ]);
  const [centerType, setCenterType] = useState(0);
  const [requiredFieldsList, setRequiredFieldsList] = useState({
    Name: false,
    Email: false,
    Gender: false,
    Source: false,
    Status: false,
    Address: false,
    Country: false,
    Remarks: false,
    Category: false,
    "Contacted By": false,
    "Package Type": false,
    "Phone Number": false,
    "Date of Birth": false,
    "Zip / Postcode": false,
    "Interested Package": false,
    "Expected Joining Date": false,
    "Enquiry's Interested Offer": false,
  });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [packageType, setPackageType] = useState(metricData[0].value);
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [offerList, setOfferList] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [newOffer, setNewOffer] = useState(false);

  const emptyPackage: Package[] = [
    {
      label: "No Packages Found",
      value: 0,
      min_price: 0,
      max_price: 0,
      num_of_days: 0,
    },
  ];
  const emptyOffer: Offer[] = [
    {
      id: 0,
      title: "No Offers Found",
      description: "",
      image: "",
      offer_startDate: "",
      offer_endDate: "",
      is_active: false,
      discounts: "",
      gym: 0,
      package: null,
      offer_price: null,
    },
  ];

  const handleCameraCapture = (file: File) => {
    setData((prev) => ({ ...prev, visitor_image: file }));
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };
  const openPreview = () => {
    setIsPreviewVisible(true);
  };

  useEffect(() => {
    console.log(phoneCountry);
  }, [phoneCountry]);

  function renderOptionDisplayValue(option: Package) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex flex-col md:flex-row w-full gap-2 mt-2 md:gap-16 max-md:pl-4">
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

  const getRequiredFields = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/dynamic-fields/enquiry/?gym_id=${gymId}`,
        {
          id: newID(`enquiry-fields`),
        }
      );
      setRequiredFieldsList(resp.data.iFields);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch enquiry fields");
    }
  };

  useEffect(() => {
    getRequiredFields();
  }, []);

  function renderEmpty(option: Package) {
    return (
      <div
        className=" w-full flex flex-row gap-8 md:gap-16 items-center justify-between mx-4"
        onClick={(e) => e.preventDefault()}
      >
        <Text className=" font-semibold text-center">No Package Found</Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Master Packages");
            router.push("/membership/master-packages");
          }}
          className="text-primary"
        >
          Add Package <BsArrowRight size={20} className="ml-2 animate-pulse" />
        </Button>
      </div>
    );
  }

  const closePreview = () => {
    setIsPreviewVisible(false);
  };

  const fetchPackages = async (packageType: string) => {
    try {
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
      setPackagesList(resp.data.results.packages);
      if (packageData.length === 0) {
        toast.error("No packages found for this package type", {
          duration: 2000,
        });
      }
      //   router.push("/membership/master-packages/");
      // }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error(
        "Something went wrong while fetching packages. Please try again."
      );
    }
  };

  const categorizedFields = () => {
    const requiredFields = {
      Name: data.name || "",
      Phone: data.phone || "",
      Gender: data.gender || "",
      Source:
        source.find((src) => src.id === data.source_id)?.leadSourceName || "",
      Category: category.find((cat) => cat.id === data.category_id)?.name || "",
      "Expected Joining": data.tentative_joining_date || "",
    };

    const recommendedFields = {
      Email: data.email || "",
      "Date of Birth": data.date_of_birth || "",
      Address: data.address_street || "",
      Country: data.address_country || "",
    };
    const otherDetails = {
      "ZIP Code": data.address_zip_code || "",
      Remarks: data.remarks || "",
      "Enquiry Mode": data.enquiry_mode || "",
    };

    return { requiredFields, recommendedFields, otherDetails };
  };

  const { requiredFields, recommendedFields, otherDetails } =
    categorizedFields();
  async function getPrevData() {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/add-visitor-prerequisites/?gym_id=${gymId}`,
        {
          id: newID(`visitor-prerequities`),
        }
      );
      setCategory(resp.data.data.categoryList);
      setSource(resp.data.data.sourceList);
      setStatus(resp.data.data.statusList);
      const concatcontactType = resp.data.data.contact_type.map((item: any) => {
        return { label: item.key, value: item.key };
      });
      console.log(concatcontactType);
      setContactType(concatcontactType);
    } catch (error) {
      console.error("Error fetching prerequisites:", error);
      toast.error("Something went wrong while fetching prerequisites");
    }
  }

  const fetchOffers = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/list-create-offers/?gym_id=${gymId}`,
        {
          id: newID(`list-offers`),
        }
      );
      setOfferList(resp.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Error loading offers");
    }
  };

  useEffect(() => {
    getPrevData();
    fetchOffers();
  }, []);

  const getStatus = async () => {
    const resp = await isStaff();
    setAuth(!resp);
  };

  useEffect(() => {
    async function preFunctions() {
      const gymId = await retrieveGymId();
      setData((prev) => ({ ...prev, visiting_center: gymId }));
      getStatus();
      checkUserAccess().then((status) => {
        console.log(status);
        if (status !== "Restricted") {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      });
      const demographic = await getDemographicInfo();
      setData((prev) => ({
        ...prev,
        address_country: demographic?.country || "",
      }));
      setPhoneCountry(demographic?.country_code.toLowerCase() || "us");
    }
    preFunctions();
  }, []);

  const validateField = useCallback(
    (name: keyof Lead, value: string): string => {
      // Only validate if the field is marked as required in requiredFieldsList
      switch (name) {
        case "name":
          return requiredFieldsList.Name && !value ? "Name is required" : "";

        case "phone":
          if (!requiredFieldsList["Phone Number"]) return "";
          return !value
            ? "Phone number is required"
            : !/^\+?[1-9]\d{1,14}$/.test(value)
              ? "Invalid phone number format"
              : "";

        case "email":
          if (!requiredFieldsList.Email) return "";
          return !value
            ? "Email is required"
            : !/\S+@\S+\.\S+/.test(value)
              ? "Invalid email format"
              : "";

        case "tentative_joining_date":
          return requiredFieldsList["Expected Joining Date"] && !value
            ? "Expected Joining Date is required"
            : "";

        case "date_of_birth":
          return requiredFieldsList["Date of Birth"] && !value
            ? "Date of Birth is required"
            : "";

        case "gender":
          return requiredFieldsList.Gender && !value
            ? "Gender is required"
            : "";

        case "source_id":
          return requiredFieldsList.Source && !value
            ? "Source is required"
            : "";

        case "category_id":
          return requiredFieldsList.Category && value === null
            ? "Category is required"
            : "";

        case "status_id":
          return requiredFieldsList.Status && value === null
            ? "Status is required"
            : "";

        case "enquiry_mode":
          return requiredFieldsList["Contacted By"] && !value
            ? "Contact mode is required"
            : "";

        case "package_id":
          return requiredFieldsList["Interested Package"] && !value
            ? "Package is required"
            : "";

        case "offer":
          return requiredFieldsList["Enquiry's Interested Offer"] &&
            value === null
            ? "Offer is required"
            : "";

        case "address_street":
          return requiredFieldsList.Address && !value
            ? "Address is required"
            : "";

        case "address_zip_code":
          return requiredFieldsList["Zip / Postcode"] && !value
            ? "ZIP code is required"
            : "";

        case "address_country":
          return requiredFieldsList.Country && !value
            ? "Country is required"
            : "";

        case "remarks":
          return requiredFieldsList.Remarks && !value
            ? "Remarks are required"
            : "";

        default:
          return "";
      }
    },
    [requiredFieldsList]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name as keyof Lead, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    requestAnimationFrame(() => {
      inputRefs.current[name]?.focus();
    });
  };

  const handleSelectChange = (name: keyof Lead, value: number | null) => {
    setData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value?.toString() || "");
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handlePhoneChange = (value: string) => {
    setData((prev) => ({ ...prev, phone: value }));
    const error = validateField("phone", value);
    setErrors((prev) => ({ ...prev, phone: error }));
  };

  const handleCountryChange = (selectedValue: string) => {
    setData((prev) => ({ ...prev, address_country: selectedValue }));
    const error = validateField("address_country", selectedValue);
    setErrors((prev) => ({ ...prev, address_country: error }));

    const countryData =
      COUNTRY_MAPPINGS[selectedValue as keyof typeof COUNTRY_MAPPINGS];
    if (countryData) {
      setPhoneCountry(countryData.code.toLowerCase());
    }
  };

  const handleRadioChange =
    (name: "gender" | "enquiry_mode") => (value: string) => {
      setData((prev) => ({ ...prev, [name]: value }));
      if (name === "gender") {
        const error = validateField("gender", value);
        setErrors((prev) => ({ ...prev, gender: error }));
      }
    };

  const checkFormValidation = (submit: boolean) => {
    const newErrors: { [key in keyof Lead]?: string } = {};
    (Object.keys(data) as Array<keyof Lead>).forEach((key) => {
      const error = validateField(key, data[key]?.toString() || "");
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      if (submit) {
        setErrors(newErrors);
        toast.error("Please fill in all required fields correctly");
      }
      return false;
    } else {
      setShowSubmit(true);
    }
    return true;
  };

  function renderEmptyOffer(option: Offer) {
    return (
      <div
        className=" w-full flex flex-row gap-8 md:gap-16 items-center justify-between mx-4"
        onClick={(e) => e.preventDefault()}
      >
        <Text className=" font-semibold text-center">No Offers Found</Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Offers Section");
            router.push("/webanalysis?section=offerList");
          }}
          className="text-primary"
        >
          Add Offer <BsArrowRight size={20} className="ml-2 animate-pulse" />
        </Button>
      </div>
    );
  }

  function renderOfferDisplayValue(offer: Offer) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold" className="capitalize">
          {offer.title}
        </Text>
        <div className="flex flex-row w-full gap-8 md:gap-16">
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
        <div className="flex flex-row gap-4 items-center mt-1">
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

  const handlePackageType = (value: string) => {
    setPackageType((prevPackageType) => {
      const newPackageType =
        prevPackageType.toLowerCase() === value.toLowerCase() ? "All" : value;
      // fetchPackages(newPackageType);
      return newPackageType;
    });
  };

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
    fetchPackages(packageType);
  }, [packageType]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setData((prev) => ({ ...prev, visitor_image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      // setValidationErrors((prev) => ({ ...prev, visitor_image: "" }));
    }
  };
  useEffect(() => {
    checkFormValidation(false);
  }, [data]);

  async function addData() {
    if (!checkFormValidation(true)) {
      return;
    }
    if (!isValid) {
      toast.error("Please Subscribe to Proceed Further");
      if (auth) {
        router.push("/subscription/plans");
      }
      return;
    }
    try {
      setLock(true);
      closePreview();
      const payload = { ...data };
      console.log(payload);
      // Remove the dateofbirth field if it contains spaces
      if (payload.date_of_birth === "") {
        delete payload.date_of_birth;
      }
      if (payload.visitor_image === null) {
        delete payload.visitor_image;
      }
      if (payload.status_id === null) {
        delete payload.status_id;
      }
      if (payload.category_id === null) {
        delete payload.category_id;
      }
      const phoneNumber = data.phone.startsWith("+")
        ? data.phone
        : "+" + data.phone;
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/create-visitor/?gym_id=${gymId}`,
        {
          ...payload,
          phone: phoneNumber,
          visiting_center:
            typeof data.visiting_center === "string"
              ? parseInt(data.visiting_center)
              : data.visiting_center,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then((response) => {
        invalidateAll();
        toast.success(
          <Text as="b" className="font-semibold">
            {response.data.message}
          </Text>
        );
        router.push(routes.leads.leadsList);
        setData(InitialLead);
      });
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Something went wrong while adding lead");
    } finally {
      setLock(false);
    }
  }

  const FieldsView = useCallback(
    ({ title }: { title: "Required" | "Additional" }) => {
      return (
        <>
          {(title === "Required" && requiredFieldsList.Gender) ||
          (title === "Additional" && !requiredFieldsList.Gender) ? (
            <div className="max-sm:col-span-full flex flex-col gap-2 md:mt-1">
              <Text className="font-medium ">
                Gender {title === "Required" ? "*" : ""}
              </Text>
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
                <span className=" text-red-500 text-xs">
                  Gender is required
                </span>
              )}
            </div>
          ) : null}
          {(title === "Required" && requiredFieldsList.Source) ||
          (title === "Additional" && !requiredFieldsList.Source) ? (
            <div className="grid grid-cols-1 gap-0.5">
              <Select
                name="source_id"
                // label="Source *"
                label={`Source ${title === "Required" ? "*" : ""}`}
                options={source.map((src) => ({
                  label: src.leadSourceName,
                  value: src.id,
                }))}
                value={
                  data.source_id
                    ? source.find((src) => src.id === data.source_id)
                        ?.leadSourceName
                    : ""
                }
                onChange={({ value }) =>
                  handleSelectChange("source_id", value as number)
                }
                clearable={data.source_id !== null}
                onClear={() => handleSelectChange("source_id", null)}
                className="col-span-full sm:col-span-1"
                error={errors.source_id}
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
            </div>
          ) : null}
          {(title === "Required" && requiredFieldsList.Category) ||
          (title === "Additional" && !requiredFieldsList.Category) ? (
            <Select
              name="category_id"
              // label="Category *"
              label={`Category ${title === "Required" ? "*" : ""}`}
              options={category.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
              value={
                data.category_id
                  ? category.find((cat) => cat.id === data.category_id)?.name
                  : ""
              }
              onChange={({ value }) =>
                handleSelectChange("category_id", value as number)
              }
              clearable={data.category_id !== null}
              onClear={() => handleSelectChange("category_id", null)}
              className="col-span-full sm:col-span-1"
              error={errors.category_id}
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
          ) : null}
          {(title === "Required" &&
            requiredFieldsList["Expected Joining Date"]) ||
          (title === "Additional" &&
            !requiredFieldsList["Expected Joining Date"]) ? (
            <div className="mb-2">
              <label
                htmlFor="tentative_joining_date"
                className="block mb-2 font-medium "
              >
                Expected Joining Date {title === "Required" ? "*" : ""}
              </label>
              <DatePicker
                name="tentative_joining_date"
                value={
                  data.tentative_joining_date
                    ? formateDateValue(new Date(data.tentative_joining_date))
                    : ""
                }
                onChange={(date: any) =>
                  setData((prev) => ({
                    ...prev,
                    tentative_joining_date: formateDateValue(
                      new Date(date.getTime()),
                      "YYYY-MM-DD"
                    ),
                  }))
                }
                placeholderText="Select Reminder"
                showMonthDropdown={true}
                showYearDropdown={true}
                scrollableYearDropdown={true}
                dateFormat="yyyy-MM-dd"
                className="col-span-full sm:col-span-1"
                minDate={new Date()}
              />
            </div>
          ) : null}
          {/* <div className="">
              <label
                htmlFor="date_of_birth"
                className="block mb-2 font-medium "
              >
                Date of Birth
              </label>
              <DatePicker
                name="date_of_birth"
                value={
                  data.date_of_birth
                    ? formateDateValue(new Date(data.date_of_birth))
                    : ""
                }
                onChange={(date: any) =>
                  setData((prev) => ({
                    ...prev,
                    date_of_birth: formateDateValue(
                      new Date(date.getTime()),
                      "YYYY-MM-DD"
                    ),
                  }))
                }
                placeholderText="Select Date of Birth"
                showMonthDropdown={true}
                showYearDropdown={true}
                scrollableYearDropdown={true}
                // isClearable={true}
                yearDropdownItemNumber={50}
                maxDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() - 5))
                }
                dateFormat="yyyy-MM-dd"
                className="col-span-full sm:col-span-1 dark:bg-inherit"
              />
            </div> */}
          {(title === "Required" && requiredFieldsList["Date of Birth"]) ||
          (title === "Additional" && !requiredFieldsList["Date of Birth"]) ? (
            <Input
              name="date_of_birth"
              type="date"
              // label="Date of Birth"
              label={`Date of Birth ${title === "Required" ? "*" : ""}`}
              value={data.date_of_birth}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  date_of_birth: e.target.value,
                }));
              }}
              placeholder="Enter Date of Birth"
            />
          ) : null}
          {(title === "Required" && requiredFieldsList.Email) ||
          (title === "Additional" && !requiredFieldsList.Email) ? (
            <Input
              name="email"
              // label="Email "
              label={`Email ${title === "Required" ? "*" : ""}`}
              placeholder="Enter Email"
              value={data.email}
              onChange={handleInputChange}
              ref={(el: any) => (inputRefs.current["email"] = el)}
              className="col-span-full sm:col-span-1"
              error={errors.email}
              labelClassName=""
            />
          ) : null}
          {(title === "Required" && requiredFieldsList.Status) ||
          (title === "Additional" && !requiredFieldsList.Status) ? (
            <Select
              name="status_id"
              // label="Status "
              label={`Status ${title === "Required" ? "*" : ""}`}
              options={status.map((stat) => ({
                label: stat.leadStatusName,
                value: stat.id,
              }))}
              value={
                data.status_id
                  ? status.find((stat) => stat.id === data.status_id)
                      ?.leadStatusName
                  : ""
              }
              onChange={({ value }) =>
                handleSelectChange("status_id", value as number)
              }
              clearable={data.status_id !== null}
              onClear={() => handleSelectChange("status_id", null)}
              className="col-span-full sm:col-span-1"
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
          ) : null}
          {(title === "Required" && requiredFieldsList["Contacted By"]) ||
          (title === "Additional" && !requiredFieldsList["Contacted By"]) ? (
            <Select
              name="enquiry_mode"
              // label="Contact By"
              label={`Contact By ${title === "Required" ? "*" : ""}`}
              options={contactType}
              value={data.enquiry_mode}
              onChange={({ value }) =>
                handleSelectChange("enquiry_mode", value)
              }
              clearable={data.enquiry_mode !== null}
              onClear={() => handleSelectChange("enquiry_mode", null)}
              className="col-span-full sm:col-span-1"
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
          ) : null}
          {(title === "Required" && requiredFieldsList["Interested Package"]) ||
          (title === "Additional" &&
            !requiredFieldsList["Interested Package"]) ? (
            <>
              <div className="grid grid-cols-1 gap-1.5 col-span-full">
                <Text className="font-medium ">Package Type</Text>
                <div className="relative flex w-full items-center overflow-hidden">
                  <Button
                    title="Prev"
                    variant="text"
                    ref={sliderPrevBtn}
                    onClick={scrollToTheLeft}
                    className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
                  >
                    <PiCaretLeftBold className="h-5 w-5" />
                  </Button>

                  <div
                    className="w-full px-2 py-3 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
                    ref={sliderEl}
                  >
                    <RadioGroup
                      value={packageType}
                      setValue={(value: any) => {
                        handlePackageType(value);
                      }}
                      className="flex items-center gap-3 md:gap-4"
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
                          <div className="flex flex-row items-center justify-center gap-2 p-1.5 transition-all duration-200 ">
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
                    className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
                  >
                    <PiCaretRightBold className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-0.5">
                <Select
                  // label="Interested Package"
                  label={`Interested Package ${title === "Required" ? "*" : ""}`}
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
                      : renderEmpty(option)
                  }
                  // labelClassName=""
                  // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                />
              </div>
            </>
          ) : null}
          {(title === "Required" &&
            requiredFieldsList["Enquiry's Interested Offer"]) ||
          (title === "Additional" &&
            !requiredFieldsList["Enquiry's Interested Offer"]) ? (
            <Select
              // label="Enquiry's Interested Offer"
              label={`Enquiry's Interested Offer ${title === "Required" ? "*" : ""}`}
              name="offer"
              options={
                offerList.length
                  ? offerList.map((offer) => ({
                      label: offer.title,
                      value: offer.id,
                      ...offer,
                    }))
                  : emptyOffer.map((offer) => ({
                      label: offer.title,
                      value: offer.id,
                      ...offer,
                    }))
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
              getOptionDisplayValue={(option: Offer) =>
                offerList.length === 0
                  ? renderEmptyOffer(option)
                  : renderOfferDisplayValue(option)
              }
              clearable
              onClear={() => {
                setSelectedOffer(null);
                setData((prev) => ({ ...prev, offer: null }));
              }}
              className="col-span-full sm:col-span-1 capitalize"
            />
          ) : null}
          {(title === "Required" && requiredFieldsList.Address) ||
          (title === "Additional" && !requiredFieldsList.Address) ? (
            <Input
              // label="Address"
              label={`Address ${title === "Required" ? "*" : ""}`}
              name="address_street"
              placeholder=" Address"
              value={data.address_street}
              onChange={handleInputChange}
              ref={(el: any) => (inputRefs.current["address_street"] = el)}
              className="col-span-full sm:col-span-1"
              labelClassName=""
            />
          ) : null}
          {/* <Input
          label="City"
          name="address_city"
          placeholder="City"
          value={data.address_city}
          onChange={handleInputChange}
          className="col-span-full sm:col-span-1"
        />
        <Input
          label="State"
          name="address_state"
          placeholder="State"
          value={data.address_state}
          onChange={handleInputChange}
          className="col-span-full sm:col-span-1"
        /> */}
          {(title === "Required" && requiredFieldsList["Zip / Postcode"]) ||
          (title === "Additional" && !requiredFieldsList["Zip / Postcode"]) ? (
            <Input
              // label="ZIP / Postcode"
              label={`ZIP / Postcode ${title === "Required" ? "*" : ""}`}
              name="address_zip_code"
              placeholder="ZIP / postcode"
              value={data.address_zip_code}
              onChange={handleInputChange}
              ref={(el: any) => (inputRefs.current["address_zip_code"] = el)}
              className="col-span-full sm:col-span-1"
              labelClassName=""
            />
          ) : null}
          {(title === "Required" && requiredFieldsList.Country) ||
          (title === "Additional" && !requiredFieldsList.Country) ? (
            <Select
              // label="Country "
              label={`Country ${title === "Required" ? "*" : ""}`}
              value={data.address_country}
              options={countryOptions}
              onChange={(selectedValue: string) =>
                handleCountryChange(selectedValue)
              }
              getOptionValue={(option) => option.value}
              className="col-span-full sm:col-span-1"
              clearable
              onClear={() => handleCountryChange("")}
              error={errors.address_country}
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
          ) : null}
          {(title === "Required" && requiredFieldsList.Remarks) ||
          (title === "Additional" && !requiredFieldsList.Remarks) ? (
            <Input
              // label="Remarks"
              label={`Remarks ${title === "Required" ? "*" : ""}`}
              name="remarks"
              placeholder="Any additional comments"
              value={data.remarks}
              onChange={handleInputChange}
              ref={(el: any) => (inputRefs.current["remarks"] = el)}
              className="col-span-full sm:col-span-1"
              labelClassName=""
            />
          ) : null}
        </>
      );
    },
    [
      data,
      errors,
      source,
      category,
      contactType,
      packages,
      offerList,
      metricData,
      packageType,
      requiredFieldsList,
    ]
  );

  return (
    <div className="w-full max-w-5xl p-4 sm:p-6 lg:p-8">
      <Title as="h3" className="text-2xl font-bold mb-6 text-gray-900 ">
        New Enquiry
      </Title>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-2 [&_label>span]:font-medium">
        <div className=" grid grid-cols-2 items-center gap-4 col-span-full md:max-w-[50%]">
          <div className="flex flex-col justify-start gap-2">
            <Text className="text-sm font-medium ">Profile Image </Text>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
              name="member_image"
            />
            <div className="flex max-sm:flex-col sm:items-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="max-w-28 sm:max-w-40"
              >
                Upload
              </Button>
              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
                className="max-w-28 sm:max-w-40"
              >
                Take Photo
              </Button>
            </div>
          </div>
          {imagePreview && (
            <div className="size-32 md:size-40 relative">
              <Image
                src={imagePreview}
                alt="Profile Preview"
                layout="fill"
                objectFit="cover"
                className="rounded-full shadow-md"
              />
            </div>
          )}
        </div>
        <Title as="h6" className="col-span-full font-semibold">
          Required Fields *
        </Title>
        {requiredFieldsList.Name ? (
          <Input
            name="name"
            label={`Name *`}
            placeholder="Enter Full Name"
            value={data.name}
            onChange={handleInputChange}
            className="col-span-full sm:col-span-1"
            error={errors.name}
            labelClassName=""
            ref={(el: any) => (inputRefs.current["name"] = el)}
          />
        ) : null}
        {requiredFieldsList["Phone Number"] ? (
          <PhoneNumber
            label={`Phone Number *`}
            country={phoneCountry}
            value={data.phone}
            onChange={handlePhoneChange}
            className="col-span-full sm:col-span-1"
            error={errors.phone}
            labelClassName=""
          />
        ) : null}
        <FieldsView title="Required" />
        <Title as="h6" className="col-span-full font-semibold">
          Additional Fields
        </Title>
        {!requiredFieldsList.Name ? (
          <Input
            name="name"
            label={`Name `}
            placeholder="Enter Full Name"
            value={data.name}
            onChange={handleInputChange}
            className="col-span-full sm:col-span-1"
            error={errors.name}
            labelClassName=""
            ref={(el: any) => (inputRefs.current["name"] = el)}
          />
        ) : null}
        {!requiredFieldsList["Phone Number"] ? (
          <PhoneNumber
            label={`Phone Number `}
            country={phoneCountry}
            value={data.phone}
            onChange={handlePhoneChange}
            className="col-span-full sm:col-span-1"
            error={errors.phone}
            labelClassName=""
          />
        ) : null}
        <FieldsView title="Additional" />

        <div className="col-span-full flex justify-center gap-8 mt-6">
          <Button
            onClick={openPreview}
            // variant="outline"
            size="lg"
            className="mr-4 w-full sm:w-auto"
            disabled={!showSubmit}
          >
            Continue
          </Button>
          {/* <Button
            onClick={addData}
            variant="solid"
            size="lg"
            className="w-full sm:w-auto hover:scale-105 transition-all duration-200 group hover:shadow-sm shadow-gray-800 font-medium"
            disabled={!showSubmit}
          >
            {!lock ? (
              <span className="flex flex-nowrap gap-1 items-center justify-center">
                <span>Add Enquiry</span>{" "}
                <PiArrowRightBold className="ml-2 transition-all group-hover:animate-pulse" />
              </span>
            ) : (
              <Loader variant="threeDot" />
            )}
          </Button> */}
        </div>
      </div>
      {isPreviewVisible ? (
        <LeadPreview
          addData={addData}
          closePreview={closePreview}
          imagePreview={imagePreview}
          isPreviewVisible={isPreviewVisible}
          lock={lock}
          otherDetails={otherDetails}
          recommendedFields={recommendedFields}
          requiredFields={requiredFields}
          showSubmit={showSubmit}
        />
      ) : null}
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        showCamera={showCamera}
      />
      <AddOffer
        isOpen={newOffer}
        onSuccess={() => {
          fetchOffers();
          setNewOffer(false);
        }}
        setIsOpen={setNewOffer}
      />
    </div>
  );
}
