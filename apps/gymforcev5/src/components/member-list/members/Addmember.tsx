"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Text,
  Input,
  Select,
  Title,
  Loader,
  Tooltip,
  Switch,
  // Checkbox,
  RadioGroup,
  AdvancedRadio,
  // Empty,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  // invalidateCache,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { PhoneNumber } from "@core/ui/phone-input";
import {
  PiArrowRightBold,
  PiCaretLeftBold,
  PiCaretRightBold,
} from "react-icons/pi";
import Image from "next/image";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { useRouter } from "next/navigation";
import {
  checkUserAccess,
  // isUserOnTrial,
  // isUserSubscribed,
  // retrieveUserSubscriptionInfo,
} from "@/app/[locale]/auth/Trail";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { DatePicker } from "@core/ui/datepicker";
import {
  FaPercent,
  FaInstagram,
  // FaRegCircleXmark,
  // FaArrowRightLong,
} from "react-icons/fa6";
import TaxAccordion from "./TaxAccordion";
// import MetricCard from "@components/cards/metric-card";
import { CircleCheck } from "lucide-react";
import { BsArrowRight } from "react-icons/bs";
// import { FaBookReader } from "react-icons/fa";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import DateCell from "@core/ui/date-cell";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
// import MemberSeatAllotment from "./MemberSeatAllotment";
const CameraCapture = dynamic(
  () => import("@/components/member-list/Capture"),
  {
    ssr: false,
  }
);
const MemberSeatAllotment = dynamic(() => import("./MemberSeatAllotment"), {
  ssr: false,
});

export interface FormData {
  name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  joining_date: string;
  gender: "Male" | "Female" | "Other";
  address_street: string;
  address_city: string;
  address_zip_code: string;
  address_state: string;
  address_country: string;
  title: string;
  offer_price: number | null;
  paid_amount: number | null;
  package_id: number | null;
  start_date: string;
  payment_mode_id: number | null;
  due_date: string | null;
  member_image: File | null;
  batch_id: number | null;
  category_id: number | null;
  enrollment_fee_id: number | null;
  discounted_amount: number;
  actual_amount: number;
  emergency_contact: string | null;
  emergency_contact_name: string | null;
  occupation: string | null;
  qualification: string | null;
  colledge_or_school: string | null;
  martial_status: string | null;
  reference_main: string | null;
  parents_name: string | null;
  parents_contact: string | null;
  with_parents: boolean | null;
  remarks: string | null;
  medical_history: string | null;
  blood_group: string | null;
  ig: string | null;
}

interface DiscountState {
  type: "rupee" | "percentage";
  value: number;
}

interface ValidationErrors {
  [key: string]: string;
}

interface Option {
  label: string;
  value: number;
}

interface Package extends Option {
  min_price: number;
  max_price: number;
  num_of_days: number;
}
const initialState: FormData = {
  name: "",
  phone: "",
  email: "",
  date_of_birth: null,
  joining_date: new Date().toISOString().split("T")[0],
  gender: "Male",
  address_street: "",
  address_city: "",
  address_zip_code: "",
  address_state: "",
  address_country: "India",
  title: "",
  offer_price: null,
  paid_amount: null,
  package_id: null,
  start_date: new Date().toISOString().split("T")[0],
  payment_mode_id: null,
  due_date: new Date().toISOString().split("T")[0],
  member_image: null,
  batch_id: null,
  category_id: null,
  enrollment_fee_id: null,
  discounted_amount: 0,
  actual_amount: 0,
  // trainer_id: null,
  blood_group: null,
  colledge_or_school: null,
  emergency_contact: null,
  emergency_contact_name: null,
  martial_status: null,
  medical_history: null,
  occupation: null,
  parents_contact: null,
  parents_name: null,
  qualification: null,
  reference_main: null,
  remarks: null,
  with_parents: null,
  ig: null,
};

export default function CombinedMemberForm() {
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [data, setData] = useState<FormData>(initialState);
  const [isInitial, setIsInitial] = useState(data === initialState);
  // const {
  //   newMember,
  //   getmemberDetails,
  //   removeMemberDetails,
  //   setMemberDetails,
  //   setNewMember,
  // } = useNewMemberContext();
  const [paymentModes, setPaymentModes] = useState<Option[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [showDueDate, setShowDueDate] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isFullPay, setIsFullPay] = useState<"yes" | "no">("no");
  const [isValid, setIsValid] = useState(false);
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
  const [skipEmail, setSkipEmail] = useState<"Skip" | "Req">("Req");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));
  const [endDate, setEndDate] = useState<any>(null);
  const [metricData, setMetricData] = useState([
    { label: "All", value: "All" },
  ]);
  const [lock, setLock] = useState(false);
  const [memberCategories, setMemberCategories] = useState<any[]>([]);
  const [auth, setAuth] = useState<boolean>(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any[]>([]);
  const [enrollmentList, setEnrollmentList] = useState<any[]>([]);
  const [showSubmit, setShowSubmit] = useState(true);
  const [discount, setDiscount] = useState<DiscountState>({
    type: "rupee",
    value: 0,
  });
  // const [trainers, setTrainers] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  // const [supercharge, setSupercharge] = useState<number>(0);
  // const [chargeType,setchargeType]=useState<"rupee" | "percentage">('rupee');
  const [applyTaxes, setApplyTaxes] = useState<boolean>(false);
  const [packageType, setPackageType] = useState("All");
  // const [totalMaxPrice, setTotalMaxPrice] = useState<number | null>();
  const [showCamera, setShowCamera] = useState(false);
  // const [showAdditional, setShowAdditional] = useState(false);
  const [occupation, setOccupation] = useState<any[]>([]);
  const [requiredFieldsList, setRequiredFieldsList] = useState({
    Name: false,
    Batch: false,
    Email: false,
    Address: false,
    Country: false,
    Remarks: false,
    Reference: false,
    Occupation: false,
    Gender: true,
    "Blood Group": false,
    "Joining Date": false,
    "Phone Number": false,
    "Date of Birth": false,
    "Parent's Name": false,
    Qualification: false,
    "Martial Status": false,
    "Zip / Postcode": false,
    "Medical History": false,
    "Member Category": false,
    "Instagram Handle": false,
    "Parent's Contact ": false,
    "Living with Parents": false,
    "Emergency Contact Name": false,
    "Emergency Contact Number": false,
  });
  const [memberSeat, setMemberSeat] = useState("");

  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [centerType, setCenterType] = useState(0);

  const setMemberDetails = (data: any) => {
    sessionStorage.setItem(
      "newMember",
      JSON.stringify({
        data: data,
        expireAt: new Date().getTime() + 300000, // for 5 mins
      })
    );
  };

  const getmemberDetails = () => {
    const MemberInfo = sessionStorage.getItem("newMember");
    if (MemberInfo) {
      const data = JSON.parse(MemberInfo);
      console.log(new Date().getTime(), parseInt(data.expireAt));
      if (new Date().getTime() < parseInt(data.expireAt)) {
        return JSON.parse(MemberInfo).data;
      } else {
        removeMemberDetails();
        null;
      }
    } else {
      return null;
    }
  };

  const removeMemberDetails = () => {
    sessionStorage.removeItem("newMember");
  };

  const handleCameraCapture = (file: File) => {
    setData((prev) => ({ ...prev, member_image: file }));
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setValidationErrors((prev) => ({ ...prev, member_image: "" }));
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

  useEffect(() => {
    if (isInitial) {
      const Member = getmemberDetails();
      console.log(Member);
      if (Member) {
        setData(Member);
      }
      setIsInitial(false);
    }
  }, [isInitial]);

  useEffect(() => {
    if (!isInitial) {
      setMemberDetails(data);
    }
  }, [data]);

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

  const getPreReq = async () => {
    const gymId = await retrieveGymId();
    try {
      const resp = await AxiosPrivate.get(
        `/api/member/add-member-prerequisites/?gym_id=${gymId}`
      ).then((res) => {
        console.log(res.data);
        setMemberCategories(
          res.data.favorite_categories.map((cat: any) => ({
            label: cat.name,
            value: cat.id,
          }))
        );
        setBatches(
          res.data.favorite_batches.map((group: any) => ({
            label: group.name,
            value: group.id,
            capacity: group.capacity,
            live_member_count: group.live_member_count,
            start_time: group.start_time,
            end_time: group.end_time,
          }))
        );
        setEnrollment(
          res.data.favorite_enrollment_fee.map((fee: any) => ({
            label: fee.name + " - " + fee.amount,
            value: fee.id,
          }))
        );
        setEnrollmentList(
          res.data.favorite_enrollment_fee.map((fee: any) => ({
            amount: fee.amount,
            value: fee.id,
          }))
        );
        setOccupation(
          res.data.occupation_types.map((occ: any) => ({
            label: occ,
            value: occ,
          }))
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  function renderEmptyBatch() {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between mx-2"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-nowrap">No Batches Found</Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Batches Section");
            router.push("/batches");
          }}
          className="text-primary text-sm text-nowrap"
        >
          Add Batches <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  const checkBatches = (batch_id: string | number) => {
    const numericBatchId = Number(batch_id);

    const batch = batches.find((group) => group.value === numericBatchId);

    if (batch) {
      const currentCount = parseInt(
        batch.live_member_count.split("|")[0].trim()
      );

      if (currentCount === batch.capacity) {
        toast.success(
          "On Adding this Member, the capacity will be Increased to " +
            (batch.capacity + 1)
        );
      }
    }
  };

  function renderOptionDisplayBatch(option: any) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex flex-col w-full gap-0.5 pl-4">
          <div className="flex items-center gap-4 text-[13px]">
            <div>
              <Text as="span" className="font-medium">
                Total Capacity :{" "}
              </Text>{" "}
              {option.capacity}{" "}
            </div>
            <div>
              <Text as="span" className="font-medium">
                Members :{" "}
              </Text>{" "}
              {option.live_member_count?.split("|")[0]}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <div className="flex items-center gap-1 text-[13px]">
              <Text className="font-medium">Start Time :</Text>
              {option?.start_time ? (
                <DateCell
                  date={new Date(`2025-01-01T${option.start_time}`)}
                  dateClassName="hidden"
                  timeFormat="h:mm A"
                />
              ) : (
                <Text>N/A</Text>
              )}
            </div>
            <div className="flex items-center gap-1 text-[13px]">
              <Text className="font-medium">End Time :</Text>
              {option?.end_time ? (
                <DateCell
                  date={new Date(`2025-01-01T${option.end_time}`)}
                  dateClassName="hidden"
                  timeFormat="h:mm A"
                />
              ) : (
                <Text>N/A</Text>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPaymentModes();
    const getInfo = async () => {
      const infoData = await retrieveDemographicInfo();
      setData((prev: FormData) => {
        const newCountry = infoData?.country || "India";
        if (prev.address_country === newCountry) {
          return prev; // Avoid update if same value
        }
        return { ...prev, address_country: newCountry };
      });
      setDemographicInfo(infoData);
      const resp = await isStaff();
      // console.log("Staff:", resp);
      setAuth(!resp);

      checkUserAccess().then((status) => {
        console.log(status);
        if (status !== "Restricted") {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      });
    };
    getInfo();
    getPreReq();
  }, []);

  const checkFormValidation = (submit: boolean) => {
    const errors = validateMemberForm(data);
    if (Object.keys(errors).length > 0) {
      if (submit) {
        setValidationErrors(errors);
        // console.log(errors);
        toast.error("Please fill in all required fields correctly.");
      }
      setShowSubmit(false);
      return false;
    } else {
      setValidationErrors({});
      setShowSubmit(true);
    }

    return true;
  };

  useEffect(() => {
    // fetchPackages(packageType);
    setData((prev) => {
      return {
        ...prev,
        actual_amount: 0,
        offer_price: null,
        paid_amount: null,
        package_id: null,
      };
    });
    setDiscount((prev) => {
      return { ...prev, value: 0 };
    });
  }, [packageType]);

  // useEffect(() => {
  //   checkFormValidation(false);
  // }, [data]);

  const fetchPackages = async (packageTypeVal: string) => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/list-packages/v2/?gym_id=${gymId}${packageTypeVal !== "All" ? `&package_type=${packageTypeVal.split(" ")[0]}` : ""}`,
        {
          id: newID(
            "master-packages-list-" +
              (packageTypeVal === "All" ? "all" : packageTypeVal.split(" ")[0])
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

  const fetchPaymentModes = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/payment-modes/list_favorite/?gym_id=${gymId}`,
        {
          id: newID(`payment-modes`),
        }
      );
      if (resp.status === 200) {
        setPaymentModes(
          resp.data.map((mode: any) => ({
            label: mode.name,
            value: mode.id,
          }))
        );
      }
      // console.log(resp.data.results);
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      toast.error(
        "Something went wrong while fetching payment modes. Please try again."
      );
    }
  };

  const validateMemberForm = (data: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    const totalAmount = calculateActualAmount();

    // Helper function to check if a field is empty
    const isEmpty = (value: any): boolean =>
      value === null || value === undefined || value === "" || value === false;

    // Helper function to validate phone number format
    const isValidPhone = (phone: string): boolean =>
      /^\+?[1-9]\d{1,14}$/.test(phone);

    // Helper function to validate email format
    const isValidEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

    // Required Personal Details Validation
    if (requiredFieldsList.Name && isEmpty(data.name)) {
      errors.name = "Name is required";
    }

    if (skipEmail === "Req" && requiredFieldsList.Email) {
      if (isEmpty(data.email)) {
        errors.email = "Email is required";
      } else if (!isValidEmail(data.email)) {
        errors.email = "Invalid email format";
      }
    }

    if (requiredFieldsList["Phone Number"]) {
      if (isEmpty(data.phone)) {
        errors.phone = "Phone number is required";
      } else if (!isValidPhone(data.phone)) {
        errors.phone = "Invalid phone number format";
      }
    }

    if (requiredFieldsList["Date of Birth"] && isEmpty(data.date_of_birth)) {
      errors.date_of_birth = "Date of birth is required";
    }

    if (requiredFieldsList["Joining Date"] && isEmpty(data.joining_date)) {
      errors.joining_date = "Joining date is required";
    }

    if (isEmpty(data.gender)) {
      errors.gender = "Gender is required";
    }

    // Required Address Details Validation
    if (requiredFieldsList.Address && isEmpty(data.address_street)) {
      errors.address_street = "Address is required";
    }

    if (
      requiredFieldsList["Zip / Postcode"] &&
      isEmpty(data.address_zip_code)
    ) {
      errors.address_zip_code = "ZIP / Postcode is required";
    }

    if (requiredFieldsList.Country && isEmpty(data.address_country)) {
      errors.address_country = "Country is required";
    }

    // Required Additional Information Validation
    if (requiredFieldsList.Batch && isEmpty(data.batch_id)) {
      errors.batch_id = "Batch is required";
    }

    if (requiredFieldsList["Member Category"] && isEmpty(data.category_id)) {
      errors.category_id = "Member category is required";
    }

    if (requiredFieldsList.Occupation && isEmpty(data.occupation)) {
      errors.occupation = "Occupation is required";
    }

    if (requiredFieldsList.Qualification && isEmpty(data.qualification)) {
      errors.qualification = "Qualification is required";
    }

    if (requiredFieldsList["Blood Group"] && isEmpty(data.blood_group)) {
      errors.blood_group = "Blood group is required";
    }

    // Emergency Contact Validation
    if (
      requiredFieldsList["Emergency Contact Name"] &&
      isEmpty(data.emergency_contact_name)
    ) {
      errors.emergency_contact_name = "Emergency contact name is required";
    }

    if (
      requiredFieldsList["Emergency Contact Number"] &&
      isEmpty(data.emergency_contact)
    ) {
      errors.emergency_contact = "Emergency contact number is required";
    }

    // Family Information Validation
    if (requiredFieldsList["Martial Status"] && isEmpty(data.martial_status)) {
      errors.martial_status = "Martial status is required";
    }

    if (requiredFieldsList["Parent's Name"] && isEmpty(data.parents_name)) {
      errors.parents_name = "Parent's name is required";
    }

    if (
      requiredFieldsList["Parent's Contact "] &&
      isEmpty(data.parents_contact)
    ) {
      errors.parents_contact = "Parent's contact is required";
    }

    if (
      requiredFieldsList["Living with Parents"] &&
      isEmpty(data.with_parents)
    ) {
      errors.with_parents = "Living with parents information is required";
    }

    // Additional Details Validation
    if (
      requiredFieldsList["Medical History"] &&
      isEmpty(data.medical_history)
    ) {
      errors.medical_history = "Medical history is required";
    }

    if (requiredFieldsList.Reference && isEmpty(data.reference_main)) {
      errors.reference_main = "Reference is required";
    }

    if (requiredFieldsList.Remarks && isEmpty(data.remarks)) {
      errors.remarks = "Remarks are required";
    }

    if (requiredFieldsList["Instagram Handle"] && isEmpty(data.ig)) {
      errors.ig = "Instagram handle is required";
    }

    // Mandatory Membership Details Validation
    if (isEmpty(data.package_id)) {
      errors.package_id = "Membership package is required";
    }

    if (isEmpty(data.start_date)) {
      errors.start_date = "Start date is required";
    }

    // Price and Payment Validation
    if (isEmpty(data.offer_price)) {
      errors.offer_price = "Price is required";
    }

    if (totalAmount > 0) {
      if (isEmpty(data.paid_amount)) {
        errors.paid_amount = "Paid amount is required";
      }

      if (isEmpty(data.payment_mode_id)) {
        errors.payment_mode_id = "Payment mode is required";
      }

      // Due Date Validation for Partial Payments
      const actualAmount = calculateActualAmount();
      if ((data.paid_amount || 0) < actualAmount && isEmpty(data.due_date)) {
        errors.due_date = "Due date is required";
      }
    }

    // Price Range Validation
    if (data.package_id && data.offer_price) {
      const selectedPackage = packagesList.find(
        (pkg) => pkg.id === data.package_id
      );
      const enrollmentFee = data.enrollment_fee_id
        ? enrollmentList.find((fee) => fee.value === data.enrollment_fee_id)
            ?.amount || 0
        : 0;

      if (selectedPackage) {
        const minTotal =
          selectedPackage.min_price + parseInt(enrollmentFee.toString());
        const maxTotal =
          selectedPackage.max_price + parseInt(enrollmentFee.toString());

        if (data.offer_price < minTotal || data.offer_price > maxTotal) {
          errors.offer_price = `Price must be between ${minTotal} and ${maxTotal}`;
        }
      }
    }

    return errors;
  };
  const handlePhoneChange = (value: string) => {
    setData((prev) => ({ ...prev, phone: value }));
    setValidationErrors((prev) => ({ ...prev, phone: "" }));
  };

  const calculateDiscount = (): number => {
    if (!data.offer_price) return 0;
    let prevFee = "0";
    if (data.enrollment_fee_id) {
      prevFee = enrollmentList.find(
        (fee) => fee.value === data.enrollment_fee_id
      )?.amount;
    }
    if (discount.type === "rupee") {
      return Math.min(discount.value || 0, data.offer_price);
    } else {
      return Math.min(
        (data.offer_price * discount.value || 0) / 100,
        data.offer_price
      );
    }
  };

  const getRequiredFields = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/dynamic-fields/member/?gym_id=${gymId}`,
        {
          id: newID(`member-fields`),
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

  const calculateTaxes = (): number => {
    if (!applyTaxes || !data.offer_price) return 0;
    const taxableAmount = data.offer_price - calculateDiscount();
    return taxableAmount * 0.18; // 18% GST
  };

  const calculateSubTotal = (): number => {
    if (!data.offer_price) return 0;
    return data.offer_price - calculateDiscount();
  };

  const calculateActualAmount = (): number => {
    const subTotal = calculateSubTotal();
    const taxes = calculateTaxes();
    return subTotal + taxes;
  };

  // const calculateDueAmount = (): number => {
  //   const actualAmount = calculateActualAmount();
  //   return actualAmount - (data.paid_amount || 0);
  // };

  const handleDiscountTypeChange = (value: "rupee" | "percentage") => {
    setDiscount((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleDiscountValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDiscount((prev) => ({
      ...prev,
      value: parseInt(e.target.value),
    }));
  };

  // const handleSuperchargeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSupercharge(parseInt(e.target.value));
  // };

  const handleApplyTaxesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApplyTaxes(e.target.checked);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => {
      const updatedData = { ...prev };

      if (name === "offer_price" || name === "paid_amount") {
        updatedData[name] = parseFloat(value) || null;

        // const enrollmentFee = prev.enrollment_fee_id
        //   ? enrollmentList.find((fee) => fee.value === prev.enrollment_fee_id)?.amount || 0
        //   : 0;
        if (name === "offer_price") {
          updatedData.actual_amount = calculateActualAmount();
          if (isFullPay === "yes") {
            updatedData.paid_amount = calculateActualAmount();
          }
        }
        const totalOfferPrice = updatedData.actual_amount || 0;
        const paidAmount = updatedData.paid_amount || 0;

        const isDueDateNeeded = paidAmount < totalOfferPrice;
        // console.log(paidAmount+"Paid");
        // console.log(totalOfferPrice,"price")
        setShowDueDate(isDueDateNeeded);
        updatedData.due_date = isDueDateNeeded ? prev.due_date : null;

        if (selectedPackage) {
          const minPrice = selectedPackage.min_price;

          if (name === "offer_price") {
            if (
              totalOfferPrice < minPrice ||
              totalOfferPrice > totalOfferPrice
            ) {
              setPriceError(
                `Price must be between ${minPrice} and ${totalOfferPrice}`
              );
            } else {
              setPriceError(null);
            }
          } else if (name === "paid_amount") {
            updatedData[name] = parseFloat(value) || null;
            const actualAmount = calculateActualAmount();
            const paidAmount = updatedData.paid_amount || 0;
            const isDueDateNeeded = paidAmount < actualAmount;
            setShowDueDate(isDueDateNeeded);
            updatedData.due_date = isDueDateNeeded ? prev.due_date : null;

            if (paidAmount > actualAmount) {
              setPriceError(
                `Paid amount cannot exceed ${actualAmount.toFixed(2)}`
              );
            } else {
              setPriceError(null);
            }
          }
        }
      } else {
        //@ts-ignore
        updatedData[name] = value;
      }

      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
      return updatedData;
    });
  };

  const handleSelectChange = (
    name: string,
    option: Package | Option | null
  ) => {
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "package_id" && option && "min_price" in option) {
      setSelectedPackage(option);
      setData((prev) => {
        const enrollmentFee = prev.enrollment_fee_id
          ? enrollmentList.find((fee) => fee.value === prev.enrollment_fee_id)
              ?.amount || 0
          : 0;

        return {
          ...prev,
          [name]: option.value,
          title: option.label,
          offer_price: option.max_price + parseInt(enrollmentFee),
          paid_amount: null,
          due_date: null,
          actual_amount: option.max_price + parseInt(enrollmentFee),
        };
      });
      setShowDueDate(false);
      setPriceError(null);
    } else if (name === "enrollment_fee_id") {
      let prevFee = "0";
      if (data.enrollment_fee_id) {
        prevFee = enrollmentList.find(
          (fee) => fee.value === data.enrollment_fee_id
        )?.amount;
      }
      setData((prev) => {
        const enrollmentFee = option
          ? enrollmentList.find((fee) => fee.value === option.value)?.amount ||
            0
          : 0;
        const newOfferPrice =
          (prev.offer_price || 0) + parseInt(enrollmentFee) - parseInt(prevFee);
        return {
          ...prev,
          [name]: option?.value ?? null,
          offer_price: newOfferPrice,
          paid_amount: null,
          due_date: null,
          actual_amount: newOfferPrice,
        };
      });
    } else {
      setData((prev) => ({ ...prev, [name]: option?.value ?? null }));
    }
  };

  useEffect(() => {
    const duration = selectedPackage?.num_of_days;
    console.log(duration);
    setEndDate(
      dayjs(data.start_date)
        .add(duration || 1, "days")
        .format("YYYY-MM-DD")
    );
  }, [data.start_date, data.package_id, selectedPackage, packageType]);

  const submitData = async () => {
    if (!isValid) {
      toast.error("Please Subscribe to Proceed Further");
      if (auth) {
        router.push("/subscription/plans");
      }
      return;
    }
    try {
      setLock(true);
      if (!checkFormValidation(true)) {
        setLock(false);
        return;
      }
      const gymId = await retrieveGymId();
      if (!gymId) {
        toast.error("Failed to fetch gym id. Please try again.");
        setLock(false);
        return;
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "member_image" && value !== null && value instanceof File) {
          formData.append(key, value);
        } else if (value !== null) {
          if (key === "phone") {
            if (value.length) {
              const formattedPhone = value.startsWith("+")
                ? value
                : `+${value}`;
              formData.append(key, formattedPhone);
            }
          } else if (key === "title") {
            console.log("Title");
          } else if (key === "discounted_amount" || key === "actual_amount") {
            console.log();
          } else if (key === "batch_id" && centerType === 2) {
            formData.append("batch_timing_id", value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      if (endDate !== null) {
        formData.append(
          "end_date",
          dayjs(new Date(endDate)).format("YYYY-MM-DD")
        );
        formData.append(
          "sessions_allocated",
          dayjs(new Date(endDate))
            .diff(dayjs(new Date(data.start_date)), "days")
            .toString()
        );
      } else {
        formData.append(
          "sessions_allocated",
          packagesList.find((pack) => pack.id === data.package_id)
            .sessions_allocated
        );
      }
      if (memberSeat.length && centerType === 2) {
        formData.append("seat", memberSeat);
      } else {
        console.log("No Seat");
        console.log(memberSeat);
        console.log(centerType);
      }
      const PackageVal = packagesList.filter(
        (pack) => pack.id === data.package_id
      )[0];
      formData.append("gym_id", gymId); // Issue here
      // formData.append("status", "active");
      if (dayjs(data.start_date).isAfter(dayjs())) {
        formData.append("status", "inactive");
        console.log("Upcoming");
      }
      //  else if (
      //   dayjs(data.start_date).add(PackageVal.num_of_days).isBefore(dayjs())
      // ) {
      //   console.log(dayjs(data.start_date).add(PackageVal.num_of_days));
      //   formData.append("status", "inactive");
      //   console.log("Expired");
      // }
      else {
        formData.append("status", "active");
        console.log("Active");
      }
      formData.append("discounted_amount", calculateDiscount().toString());
      formData.append("actual_amount", calculateActualAmount().toString());
      console.log(formData);
      if (calculateActualAmount() === 0) {
        formData.append("paid_amount", "0");
        // formData.append("payment_mode_id", "null");
      }

      let price = "0";
      if (data.enrollment_fee_id !== null) {
        price = enrollmentList.find(
          (fee) => fee.value === data.enrollment_fee_id
        ).amount;
      }
      console.log(formData);
      const membershipResp = await AxiosPrivate.post(
        `/api/member-membership-create/?gym_id=${gymId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then((res) => {
        console.log(res);
        invalidateAll();
        toast.success("New Member has been added successfully!");
        setData(initialState);
        removeMemberDetails();
        setImagePreview(null);
        setShowDueDate(false);
        setLock(false);
        const membershipID = res.data.membership.id;
        const memberID = res.data.member.member_id;
        router.push(
          `/invoice/hy$39-${membershipID}-091$u/?member=i9rw-${memberID}-7y72&page=new_member`
        );
      });
    } catch (error) {
      console.error("Error adding member and membership:", error);
      toast.error(
        "Something went wrong while adding member and membership. Please try again."
      );
      setLock(false);
    }
  };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setData((prev) => ({ ...prev, member_image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setValidationErrors((prev) => ({ ...prev, member_image: "" }));
    }
  };

  const handleCountryChange = (selectedValue: string) => {
    setData((prev: FormData) => {
      const newCountry = selectedValue || "India";
      if (prev.address_country === newCountry) {
        return prev; // Avoid update if same value
      }
      return { ...prev, address_country: newCountry };
    });
    setValidationErrors((prev) => ({ ...prev, address_country: "" }));
  };

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
    if (isFullPay === "yes") {
      setData((prev) => ({
        ...prev,
        paid_amount: calculateActualAmount(),
      }));
      setShowDueDate(false);
    }
  }, [calculateActualAmount(), discount, isFullPay]);

  function renderEmpty(option: Package) {
    return (
      <div
        className=" w-full flex flex-row gap-8 md:gap-16 items-center justify-between mx-4"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="text-base font-semibold text-center">
          No Package Found
        </Text>
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
  return (
    <div className="m-auto pb-8">
      <Title as="h3" className="">
        New Member
      </Title>
      <div className="grid grid-cols-1 gap-6 px-4 lg:px-7 mt-5 ">
        <div className="space-y-6">
          <Title as="h4" className="">
            Personal Details
          </Title>
          <div className="grid md:grid-cols-2 px-2 md:px-4 py-2 gap-6">
            <div className=" grid grid-cols-2 items-center gap-4 col-span-full md:max-w-[50%]">
              <div className="flex flex-col justify-start gap-2">
                <Text className="text-sm font-medium">Profile Image</Text>
                <div className="flex max-sm:flex-col sm:items-center gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="max-w-28 sm:max-w-40"
                  >
                    {imagePreview ? "Change" : "Upload"}
                  </Button>
                  <Button
                    onClick={() => setShowCamera(true)}
                    variant="outline"
                    className="max-w-28 sm:max-w-40"
                  >
                    Take Photo
                  </Button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  name="member_image"
                />
                {validationErrors.member_image && (
                  <p className="text-xs text-red-500">
                    {validationErrors.member_image}
                  </p>
                )}
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
            <>
              <Title as="h6" className="col-span-full font-semibold">
                Required Fields *
              </Title>
              {requiredFieldsList.Name ? (
                <div className="grid grid-cols-1 gap-0.5">
                  <Input
                    // label=" *"
                    label={`Name *`}
                    name="name"
                    placeholder="Enter Full Name"
                    value={data.name}
                    onChange={handleInputChange}
                    labelClassName=""
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
              ) : null}
              {requiredFieldsList["Phone Number"] ? (
                <div className="grid grid-cols-1 gap-0.5">
                  <PhoneNumber
                    // label="Phone Number *"
                    label={`Phone Number *`}
                    country={
                      data.address_country.length > 0
                        ? COUNTRY_MAPPINGS[
                            data.address_country
                          ]?.code?.toLowerCase() || "in"
                        : "in"
                    }
                    value={data.phone}
                    onChange={handlePhoneChange}
                    labelClassName=""
                  />
                  {validationErrors.phone && (
                    <p className="text-xs text-red-500">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>
              ) : null}
              {requiredFieldsList.Email ? (
                <div className="grid grid-cols-1 gap-1 relative">
                  <Input
                    label={`Email *`}
                    name="email"
                    placeholder="Enter email"
                    value={data.email}
                    onChange={handleInputChange}
                    labelClassName=""
                    disabled={skipEmail === "Skip"}
                  />
                  {skipEmail === "Req" && validationErrors.email && (
                    <p className="text-xs text-red-500">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              ) : null}
              {requiredFieldsList["Date of Birth"] ? (
                <Input
                  name="date_of_birth"
                  type="date"
                  label={`Date of Birth *`}
                  value={data.date_of_birth ?? ""}
                  onChange={(e) => {
                    setData((prev: any) => ({
                      ...prev,
                      date_of_birth: e.target.value,
                    }));
                  }}
                  placeholder="Enter Date of Birth"
                />
              ) : null}
              {requiredFieldsList["Joining Date"] ? (
                <div className="grid grid-cols-1 gap-1.5 ">
                  <Text className="font-medium ">Joining Date *</Text>
                  <DatePicker
                    name="joining_date"
                    value={
                      data.joining_date
                        ? formateDateValue(new Date(data.joining_date))
                        : ""
                    }
                    onChange={(date: any) =>
                      setData((prev) => ({
                        ...prev,
                        joining_date: formateDateValue(
                          new Date(date.getTime()),
                          "YYYY-MM-DD"
                        ),
                      }))
                    }
                    placeholderText="Select Joining Date"
                    showMonthDropdown={true}
                    showYearDropdown={true}
                    scrollableYearDropdown={true}
                    dateFormat="yyyy-MM-dd"
                    className="col-span-full sm:col-span-1"
                  />
                  {validationErrors.joining_date && (
                    <p className="text-xs text-red-500">
                      {validationErrors.joining_date}
                    </p>
                  )}
                </div>
              ) : null}
              {requiredFieldsList?.Gender ? (
                <div className="grid grid-cols-1 gap-0.5">
                  <Select
                    // label="Gender *"
                    label={`Gender*`}
                    name="gender"
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]}
                    value={data.gender}
                    // @ts-ignore
                    onChange={(option: Option | null) =>
                      handleSelectChange("gender", option)
                    }
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                    clearable
                    onClear={() => handleSelectChange("gender", null)}
                  />
                  {validationErrors.gender && (
                    <p className="text-xs text-red-500">
                      {validationErrors.gender}
                    </p>
                  )}
                </div>
              ) : null}
              {requiredFieldsList["Member Category"] ? (
                <Select
                  label={`Member Category *`}
                  name="category_id"
                  options={memberCategories}
                  value={
                    memberCategories.find(
                      (cat) => cat.value === data?.category_id
                    )?.label || ""
                  }
                  onChange={(option: Option | null) =>
                    handleSelectChange("category_id", option)
                  }
                  clearable
                  onClear={() => handleSelectChange("category_id", null)}
                />
              ) : null}
              {requiredFieldsList.Batch && centerType !== 2 ? (
                <Select
                  label={`Batch `}
                  name="batch_id"
                  options={
                    batches.length
                      ? batches
                      : [{ label: "Empty", value: "empty" }]
                  }
                  value={
                    batches.find((group) => group.value === data.batch_id)
                      ?.label || ""
                  }
                  onChange={(option: Option | null) => {
                    checkBatches(option?.value.toString() || "");
                    handleSelectChange("batch_id", option);
                  }}
                  getOptionDisplayValue={(option) =>
                    batches.length
                      ? renderOptionDisplayBatch(option)
                      : renderEmptyBatch()
                  }
                  clearable
                  onClear={() => handleSelectChange("batch_id", null)}
                />
              ) : null}
              {requiredFieldsList.Occupation ? (
                <>
                  <Select
                    label={`Occupation *`}
                    name="occupation"
                    options={occupation}
                    value={data.occupation}
                    onChange={(option: Option | null) =>
                      handleSelectChange("occupation", option)
                    }
                    clearable
                    onClear={() => handleSelectChange("occupation", null)}
                  />
                  {data.occupation === "Student" ? (
                    <Input
                      label="College/School"
                      name="colledge_or_school"
                      placeholder="Enter College/School Name"
                      value={data.colledge_or_school || ""}
                      onChange={handleInputChange}
                    />
                  ) : null}
                </>
              ) : null}
              {requiredFieldsList.Qualification ? (
                <Input
                  label={`Qualification *`}
                  name="qualification"
                  placeholder="Enter Educational Qualification"
                  value={data.qualification || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {requiredFieldsList["Blood Group"] ? (
                <Select
                  label={`Blood Group *`}
                  name="blood_group"
                  options={[
                    { label: "A+", value: "A+" },
                    { label: "A-", value: "A-" },
                    { label: "B+", value: "B+" },
                    { label: "B-", value: "B-" },
                    { label: "O+", value: "O+" },
                    { label: "O-", value: "O-" },
                    { label: "AB+", value: "AB+" },
                    { label: "AB-", value: "AB-" },
                  ]}
                  value={data.blood_group}
                  onChange={(option: Option | null) =>
                    handleSelectChange("blood_group", option)
                  }
                  clearable
                  onClear={() => handleSelectChange("blood_group", null)}
                />
              ) : null}
              {requiredFieldsList["Emergency Contact Name"] ? (
                <Input
                  label={`Emergency Contact Name *`}
                  name="emergency_contact_name"
                  placeholder="Emergency Contact Person"
                  value={data.emergency_contact_name || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {requiredFieldsList["Emergency Contact Number"] ? (
                <PhoneNumber
                  label={`Emergency Contact Number *`}
                  country={
                    data.address_country.length > 0
                      ? COUNTRY_MAPPINGS[
                          data.address_country
                        ]?.code?.toLowerCase() || "in"
                      : "in"
                  }
                  value={data.emergency_contact || ""}
                  onChange={(value) =>
                    setData((prev) => ({ ...prev, emergency_contact: value }))
                  }
                />
              ) : null}
              {requiredFieldsList["Martial Status"] ? (
                <Select
                  label={`Marital Status *`}
                  name="martial_status"
                  options={[
                    { label: "Single", value: "Single" },
                    { label: "Married", value: "Married" },
                    { label: "Divorced", value: "Divorced" },
                    { label: "Widowed", value: "Widowed" },
                  ]}
                  value={data.martial_status}
                  onChange={(option: Option | null) =>
                    handleSelectChange("martial_status", option)
                  }
                  clearable
                  onClear={() => handleSelectChange("martial_status", null)}
                />
              ) : null}
              {requiredFieldsList["Living with Parents"] ? (
                <div className="flex items-center gap-4 px-4">
                  <Text>Living with Parents *</Text>
                  <Switch
                    name="with_parents"
                    checked={data.with_parents || false}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        with_parents: e.target.checked,
                      }))
                    }
                  />
                </div>
              ) : null}
              {requiredFieldsList["Parent's Name"] ? (
                <Input
                  label={`Parent's Name *`}
                  name="parents_name"
                  placeholder="Enter Parent's Name"
                  value={data.parents_name || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {requiredFieldsList["Parent's Contact "] ? (
                <PhoneNumber
                  label={`Parent's Contact *`}
                  country={
                    data.address_country.length > 0
                      ? COUNTRY_MAPPINGS[
                          data.address_country
                        ]?.code?.toLowerCase() || "in"
                      : "in"
                  }
                  value={data.parents_contact || ""}
                  onChange={(value) =>
                    setData((prev) => ({ ...prev, parents_contact: value }))
                  }
                />
              ) : null}
              {requiredFieldsList["Medical History"] ? (
                <Input
                  label={`Medical History *`}
                  name="medical_history"
                  placeholder="Enter Medical History/Conditions"
                  value={data.medical_history || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {requiredFieldsList.Reference ? (
                <Input
                  label={`Reference *`}
                  name="reference_main"
                  placeholder="How did you hear about us?"
                  value={data.reference_main || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {requiredFieldsList.Remarks ? (
                <Input
                  label={`Remarks *`}
                  name="remarks"
                  placeholder="Any additional remarks"
                  value={data.remarks || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {requiredFieldsList["Instagram Handle"] ? (
                <Input
                  label={`Instagram Handle *`}
                  name="ig"
                  placeholder="@username"
                  value={data.ig || ""}
                  onChange={handleInputChange}
                  prefix={<FaInstagram size={20} />}
                />
              ) : null}
              {requiredFieldsList.Address ? (
                <Input
                  label={`Address *`}
                  name="address_street"
                  placeholder=" Address"
                  value={data.address_street}
                  onChange={handleInputChange}
                  labelClassName=""
                />
              ) : null}
              {requiredFieldsList["Zip / Postcode"] ? (
                <Input
                  label={`ZIP / Postcode *`}
                  name="address_zip_code"
                  placeholder="ZIP / postcode"
                  value={data.address_zip_code}
                  onChange={handleInputChange}
                  labelClassName=""
                />
              ) : null}
              {requiredFieldsList.Country ? (
                <div className="grid grid-cols-1 gap-0.5">
                  <Select
                    label={`Country *`}
                    value={data.address_country}
                    options={countryOptions}
                    onChange={handleCountryChange}
                    getOptionValue={(option) => option.value}
                    className="w-full"
                  />
                  {validationErrors.address_country && (
                    <p className="text-xs text-red-500">
                      {validationErrors.address_country}
                    </p>
                  )}
                </div>
              ) : null}
            </>
            <>
              <Title as="h6" className="col-span-full font-semibold">
                Additional Fields
              </Title>
              {!requiredFieldsList.Name ? (
                <div className="grid grid-cols-1 gap-0.5">
                  <Input
                    // label=" *"
                    label={`Name `}
                    name="name"
                    placeholder="Enter Full Name"
                    value={data.name}
                    onChange={handleInputChange}
                    labelClassName=""
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
              ) : null}
              {!requiredFieldsList["Phone Number"] ? (
                <div className="grid grid-cols-1 gap-0.5">
                  <PhoneNumber
                    // label="Phone Number *"
                    label={`Phone Number `}
                    country={
                      data.address_country.length > 0
                        ? COUNTRY_MAPPINGS[
                            data.address_country
                          ]?.code?.toLowerCase() || "in"
                        : "in"
                    }
                    value={data.phone}
                    onChange={handlePhoneChange}
                    labelClassName=""
                  />
                  {validationErrors.phone && (
                    <p className="text-xs text-red-500">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>
              ) : null}
              {!requiredFieldsList.Email ? (
                <div className="grid grid-cols-1 gap-1 relative">
                  <Input
                    label={`Email `}
                    name="email"
                    placeholder="Enter email"
                    value={data.email}
                    onChange={handleInputChange}
                    labelClassName=""
                    disabled={skipEmail === "Skip"}
                  />
                  {skipEmail === "Req" && validationErrors.email && (
                    <p className="text-xs text-red-500">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              ) : null}
              {!requiredFieldsList["Date of Birth"] ? (
                <Input
                  name="date_of_birth"
                  type="date"
                  label={`Date of Birth `}
                  value={data.date_of_birth ?? ""}
                  onChange={(e) => {
                    setData((prev: any) => ({
                      ...prev,
                      date_of_birth: e.target.value,
                    }));
                  }}
                  placeholder="Enter Date of Birth"
                />
              ) : null}
              {!requiredFieldsList["Joining Date"] ? (
                <div className="grid grid-cols-1 gap-1.5 ">
                  <Text className="font-medium ">Joining Date *</Text>
                  <DatePicker
                    name="joining_date"
                    value={
                      data.joining_date
                        ? formateDateValue(new Date(data.joining_date))
                        : ""
                    }
                    onChange={(date: any) =>
                      setData((prev) => ({
                        ...prev,
                        joining_date: formateDateValue(
                          new Date(date.getTime()),
                          "YYYY-MM-DD"
                        ),
                      }))
                    }
                    placeholderText="Select Joining Date"
                    showMonthDropdown={true}
                    showYearDropdown={true}
                    scrollableYearDropdown={true}
                    dateFormat="yyyy-MM-dd"
                    className="col-span-full sm:col-span-1"
                  />
                  {validationErrors.joining_date && (
                    <p className="text-xs text-red-500">
                      {validationErrors.joining_date}
                    </p>
                  )}
                </div>
              ) : null}
              {!requiredFieldsList?.Gender ? (
                <div className="grid grid-cols-1 gap-0.5">
                  <Select
                    // label="Gender *"
                    label={`Gender`}
                    name="gender"
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]}
                    value={data.gender}
                    // @ts-ignore
                    onChange={(option: Option | null) =>
                      handleSelectChange("gender", option)
                    }
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                    clearable
                    onClear={() => handleSelectChange("gender", null)}
                  />
                  {validationErrors.gender && (
                    <p className="text-xs text-red-500">
                      {validationErrors.gender}
                    </p>
                  )}
                </div>
              ) : null}
              {!requiredFieldsList["Member Category"] ? (
                <Select
                  label={`Member Category `}
                  name="category_id"
                  options={memberCategories}
                  value={
                    memberCategories.find(
                      (cat) => cat.value === data?.category_id
                    )?.label || ""
                  }
                  onChange={(option: Option | null) =>
                    handleSelectChange("category_id", option)
                  }
                  clearable
                  onClear={() => handleSelectChange("category_id", null)}
                />
              ) : null}
              {!requiredFieldsList.Batch && centerType !== 2 ? (
                <Select
                  label={`Batch `}
                  name="batch_id"
                  options={
                    batches.length
                      ? batches
                      : [{ label: "Empty", value: "empty" }]
                  }
                  value={
                    batches.find((group) => group.value === data.batch_id)
                      ?.label || ""
                  }
                  onChange={(option: Option | null) => {
                    checkBatches(option?.value.toString() || "");
                    handleSelectChange("batch_id", option);
                  }}
                  getOptionDisplayValue={(option) =>
                    batches.length
                      ? renderOptionDisplayBatch(option)
                      : renderEmptyBatch()
                  }
                  clearable
                  onClear={() => handleSelectChange("batch_id", null)}
                />
              ) : null}
              {!requiredFieldsList.Occupation ? (
                <>
                  <Select
                    label={`Occupation `}
                    name="occupation"
                    options={occupation}
                    value={data.occupation}
                    onChange={(option: Option | null) =>
                      handleSelectChange("occupation", option)
                    }
                    clearable
                    onClear={() => handleSelectChange("occupation", null)}
                  />
                  {data.occupation === "Student" ? (
                    <Input
                      label="College/School"
                      name="colledge_or_school"
                      placeholder="Enter College/School Name"
                      value={data.colledge_or_school || ""}
                      onChange={handleInputChange}
                    />
                  ) : null}
                </>
              ) : null}
              {!requiredFieldsList.Qualification ? (
                <Input
                  label={`Qualification `}
                  name="qualification"
                  placeholder="Enter Educational Qualification"
                  value={data.qualification || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {!requiredFieldsList["Blood Group"] ? (
                <Select
                  label={`Blood Group `}
                  name="blood_group"
                  options={[
                    { label: "A+", value: "A+" },
                    { label: "A-", value: "A-" },
                    { label: "B+", value: "B+" },
                    { label: "B-", value: "B-" },
                    { label: "O+", value: "O+" },
                    { label: "O-", value: "O-" },
                    { label: "AB+", value: "AB+" },
                    { label: "AB-", value: "AB-" },
                  ]}
                  value={data.blood_group}
                  onChange={(option: Option | null) =>
                    handleSelectChange("blood_group", option)
                  }
                  clearable
                  onClear={() => handleSelectChange("blood_group", null)}
                />
              ) : null}
              {!requiredFieldsList["Emergency Contact Name"] ? (
                <Input
                  label={`Emergency Contact Name `}
                  name="emergency_contact_name"
                  placeholder="Emergency Contact Person"
                  value={data.emergency_contact_name || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {!requiredFieldsList["Emergency Contact Number"] ? (
                <PhoneNumber
                  label={`Emergency Contact Number `}
                  country={
                    data.address_country.length > 0
                      ? COUNTRY_MAPPINGS[
                          data.address_country
                        ]?.code?.toLowerCase() || "in"
                      : "in"
                  }
                  value={data.emergency_contact || ""}
                  onChange={(value) =>
                    setData((prev) => ({ ...prev, emergency_contact: value }))
                  }
                />
              ) : null}
              {!requiredFieldsList["Martial Status"] ? (
                <Select
                  label={`Marital Status `}
                  name="martial_status"
                  options={[
                    { label: "Single", value: "Single" },
                    { label: "Married", value: "Married" },
                    { label: "Divorced", value: "Divorced" },
                    { label: "Widowed", value: "Widowed" },
                  ]}
                  value={data.martial_status}
                  onChange={(option: Option | null) =>
                    handleSelectChange("martial_status", option)
                  }
                  clearable
                  onClear={() => handleSelectChange("martial_status", null)}
                />
              ) : null}
              {!requiredFieldsList["Living with Parents"] ? (
                <div className="flex items-center gap-4 px-4">
                  <Text>Living with Parents </Text>
                  <Switch
                    name="with_parents"
                    checked={data.with_parents || false}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        with_parents: e.target.checked,
                      }))
                    }
                  />
                </div>
              ) : null}
              {!requiredFieldsList["Parent's Name"] ? (
                <Input
                  label={`Parent's Name `}
                  name="parents_name"
                  placeholder="Enter Parent's Name"
                  value={data.parents_name || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {!requiredFieldsList["Parent's Contact "] ? (
                <PhoneNumber
                  label={`Parent's Contact `}
                  country={
                    data.address_country.length > 0
                      ? COUNTRY_MAPPINGS[
                          data.address_country
                        ]?.code?.toLowerCase() || "in"
                      : "in"
                  }
                  value={data.parents_contact || ""}
                  onChange={(value) =>
                    setData((prev) => ({ ...prev, parents_contact: value }))
                  }
                />
              ) : null}
              {!requiredFieldsList["Medical History"] ? (
                <Input
                  label={`Medical History `}
                  name="medical_history"
                  placeholder="Enter Medical History/Conditions"
                  value={data.medical_history || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {!requiredFieldsList.Reference ? (
                <Input
                  label={`Reference `}
                  name="reference_main"
                  placeholder="How did you hear about us?"
                  value={data.reference_main || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {!requiredFieldsList.Remarks ? (
                <Input
                  label={`Remarks `}
                  name="remarks"
                  placeholder="Any additional remarks"
                  value={data.remarks || ""}
                  onChange={handleInputChange}
                />
              ) : null}
              {!requiredFieldsList["Instagram Handle"] ? (
                <Input
                  label={`Instagram Handle `}
                  name="ig"
                  placeholder="@username"
                  value={data.ig || ""}
                  onChange={handleInputChange}
                  prefix={<FaInstagram size={20} />}
                />
              ) : null}
              {!requiredFieldsList.Address ? (
                <Input
                  label={`Address `}
                  name="address_street"
                  placeholder=" Address"
                  value={data.address_street}
                  onChange={handleInputChange}
                  labelClassName=""
                />
              ) : null}
              {!requiredFieldsList["Zip / Postcode"] ? (
                <Input
                  label={`ZIP / Postcode `}
                  name="address_zip_code"
                  placeholder="ZIP / postcode"
                  value={data.address_zip_code}
                  onChange={handleInputChange}
                  labelClassName=""
                />
              ) : null}
              {!requiredFieldsList.Country ? (
                <div className="grid grid-cols-1 gap-0.5">
                  <Select
                    label={`Country `}
                    value={data.address_country}
                    options={countryOptions}
                    onChange={handleCountryChange}
                    getOptionValue={(option) => option.value}
                    className="w-full"
                  />
                  {validationErrors.address_country && (
                    <p className="text-xs text-red-500">
                      {validationErrors.address_country}
                    </p>
                  )}
                </div>
              ) : null}
            </>
          </div>
        </div>
        {centerType === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2  px-4 py-4 gap-6 items-end">
              <Select
                label={`Batch `}
                name="batch_id"
                options={
                  batches.length
                    ? batches
                    : [{ label: "Empty", value: "empty" }]
                }
                value={
                  batches.find((group) => group.value === data.batch_id)
                    ?.label || ""
                }
                onChange={(option: Option | null) => {
                  checkBatches(option?.value.toString() || "");
                  handleSelectChange("batch_id", option);
                }}
                getOptionDisplayValue={(option) =>
                  batches.length
                    ? renderOptionDisplayBatch(option)
                    : renderEmptyBatch()
                }
                clearable
                onClear={() => handleSelectChange("batch_id", null)}
              />
              <MemberSeatAllotment
                seat={memberSeat}
                disable={data.batch_id === null}
                onClose={() => {}}
                batch={{
                  id: data?.batch_id!,
                  name:
                    batches.find((group) => group.value === data.batch_id)
                      ?.label || "",
                }}
                handleSelect={(val) => setMemberSeat(val)}
                member={data.name}
              />
            </div>
          </div>
        )}

        <div className="space-y-6">
          <Title as="h5" className="">
            Membership Details
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2  px-4 py-4 gap-6">
            <div className="grid grid-cols-1 gap-1.5 col-span-full">
              <Text className="font-medium ">Package Type *</Text>
              <div className="relative flex w-full items-center overflow-hidden">
                <Button
                  title="Prev"
                  variant="text"
                  ref={sliderPrevBtn}
                  onClick={scrollToTheLeft}
                  className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 "
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
                  className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 "
                >
                  <PiCaretRightBold className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-0.5">
              <Select
                label="Package *"
                name="package_id"
                options={packages.length ? packages : emptyPackage}
                value={packages.find((pkg) => pkg.value === data.package_id)}
                onChange={(option: Package | null) =>
                  handleSelectChange("package_id", option)
                }
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
              {validationErrors.package_id && (
                <p className="text-xs text-red-500">
                  {validationErrors.package_id}
                </p>
              )}
            </div>
            <Select
              label="Enrollment Fee"
              name="enrollment_fee_id"
              options={enrollment}
              value={
                enrollment.find(
                  (group) => group.value === data.enrollment_fee_id
                )?.label || ""
              }
              // @ts-ignore
              onChange={(option: Option | null) =>
                handleSelectChange("enrollment_fee_id", option)
              }
              prefix={
                <Text className="text-primary">
                  {demographiInfo?.currency_symbol || " "}
                </Text>
              }
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              clearable
              onClear={() => {
                handleSelectChange("enrollment_fee_id", null);
              }}
            />
            <div className="grid grid-cols-1 gap-0.5">
              <Input
                label="Sub Total * "
                name="offer_price"
                type="number"
                placeholder="Enter Price"
                // readOnly
                prefix={
                  <Text className="text-primary">
                    {demographiInfo?.currency_symbol || " "}
                  </Text>
                }
                value={data.offer_price?.toString() || ""}
                onChange={handleInputChange}
                labelClassName=""
              />
              {validationErrors.offer_price && (
                <p className="text-xs text-red-500">
                  {validationErrors.offer_price}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-1 relative">
              <Switch
                value={discount.type}
                size="md"
                onIcon={<FaPercent className="text-primary" />}
                offIcon={
                  <Text className="text-primary">
                    {demographiInfo?.currency_symbol || " "}
                  </Text>
                }
                onChange={() => {
                  if (discount.type === "rupee") {
                    handleDiscountTypeChange("percentage");
                  } else {
                    handleDiscountTypeChange("rupee");
                  }
                }}
                className={`absolute -top-[14px] ${discount.type === "rupee" ? "left-36" : "left-40"} p-0.5 duration-200 transition-all`}
              />
              <Input
                name="discount"
                type="number"
                label={`Discount (${discount.type === "rupee" ? "Amount" : "Percentage"})`}
                placeholder={`Enter Discount ${discount.type === "rupee" ? "Amount" : "Percentage"}`}
                value={discount.value}
                onChange={handleDiscountValueChange}
                prefix={
                  discount.type === "rupee" ? (
                    <Text className="text-primary">
                      {demographiInfo?.currency_symbol || " "}
                    </Text>
                  ) : (
                    <FaPercent />
                  )
                }
              />
            </div>
            <div className="flex flex-col col-span-full">
              <TaxAccordion
                amount={
                  data.offer_price ? data.offer_price - calculateDiscount() : 0
                }
                show={applyTaxes}
                handleApplyTaxes={handleApplyTaxesChange}
                symbol={demographiInfo?.currency_symbol || ""}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 items-end">
              <div className="grid grid-cols-1 gap-1.5 ">
                <div className="flex flex-row gap-2 items-center">
                  <Text className="font-medium space-x-4">Start Date *</Text>
                </div>
                <DatePicker
                  name="start_date"
                  value={
                    data.start_date
                      ? formateDateValue(new Date(data.start_date))
                      : ""
                  }
                  onChange={(date: any) =>
                    setData((prev) => ({
                      ...prev,
                      start_date: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }))
                  }
                  isClearable
                  placeholderText="Select Start Date"
                  showMonthDropdown={true}
                  showYearDropdown={true}
                  scrollableYearDropdown={true}
                  dateFormat="yyyy-MM-dd"
                  className="col-span-full sm:col-span-1"
                />
                {validationErrors.start_date && (
                  <p className="text-xs text-red-500">
                    {validationErrors.start_date}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-1.5 ">
                <Text className="font-medium ">End Date </Text>
                <DatePicker
                  name="end_date"
                  value={endDate ? formateDateValue(new Date(endDate)) : ""}
                  onChange={(date: any) =>
                    setEndDate(
                      formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                    )
                  }
                  selected={endDate}
                  placeholderText="Select End Date"
                  showMonthDropdown={true}
                  showYearDropdown={true}
                  scrollableYearDropdown={true}
                  dateFormat="yyyy-MM-dd"
                  className="col-span-full sm:col-span-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 mt-auto">
              <Input
                label="Total Amount"
                name="subTotal"
                type="number"
                value={calculateActualAmount().toFixed(2)}
                prefix={
                  <Text className="text-primary">
                    {demographiInfo?.currency_symbol || " "}
                  </Text>
                }
                readOnly
              />
            </div>

            {data.package_id && calculateActualAmount() > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-1 relative">
                  <Switch
                    value={isFullPay}
                    size="sm"
                    label="Full Payment"
                    onChange={() => {
                      if (isFullPay === "yes") {
                        setIsFullPay("no");
                        setData((prev) => ({
                          ...prev,
                          paid_amount: null,
                        }));
                        setShowDueDate(true);
                      } else {
                        setIsFullPay("yes");
                        setData((prev) => ({
                          ...prev,
                          paid_amount: calculateActualAmount(),
                        }));
                        setShowDueDate(false);
                      }
                    }}
                    labelClassName="text-[13px]"
                    className="absolute -top-[10px] left-28 p-0.5 duration-200 transition-all"
                  />
                  <Input
                    label="Amount Paid*"
                    name="paid_amount"
                    type="number"
                    prefix={
                      <Text className="text-primary">
                        {demographiInfo?.currency_symbol || " "}
                      </Text>
                    }
                    placeholder="Enter Paid Amount"
                    value={data.paid_amount?.toString() || ""}
                    onChange={handleInputChange}
                    labelClassName=""
                  />
                  {validationErrors.paid_amount && (
                    <p className="text-xs text-red-500">
                      {validationErrors.paid_amount}
                    </p>
                  )}
                  {priceError && (
                    <p className="text-xs text-red-500">{priceError}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-0.5">
                  <Select
                    label="Payment Mode *"
                    name="payment_mode_id"
                    options={paymentModes}
                    value={paymentModes.find(
                      (mode) => mode?.value === data.payment_mode_id
                    )}
                    // @ts-ignore
                    onChange={(option: Option | null) =>
                      handleSelectChange("payment_mode_id", option)
                    }
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                  {validationErrors.payment_mode_id && (
                    <p className="text-xs text-red-500">
                      {validationErrors.payment_mode_id}
                    </p>
                  )}
                </div>
              </>
            ) : null}

            {showDueDate && (
              <div className="grid grid-cols-1 gap-1.5 ">
                <Text className="font-medium ">Due Date * </Text>
                <DatePicker
                  name="due_date"
                  // value={data.due_date || ""}
                  // onChange={(date: any) =>
                  //   setData((prev) => ({
                  //     ...prev,
                  //     due_date: new Date(date.getTime() + 86400000)
                  //       .toISOString()
                  //       .split("T")[0],
                  //   }))
                  // }
                  value={
                    data.due_date
                      ? formateDateValue(new Date(data.due_date))
                      : ""
                  }
                  onChange={(date: any) =>
                    setData((prev) => ({
                      ...prev,
                      due_date: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }))
                  }
                  placeholderText="Select Due Date"
                  showMonthDropdown={true}
                  showYearDropdown={true}
                  scrollableYearDropdown={true}
                  dateFormat="yyyy-MM-dd"
                  className="col-span-full sm:col-span-1"
                  minDate={new Date()}
                />
                <div>
                  {validationErrors.due_date && (
                    <p className="text-xs text-red-500">
                      {validationErrors.due_date}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Tooltip
          content={
            priceError ? priceError : "Please Fill All the Required Fields"
          }
          className={showSubmit ? "hidden" : ""}
        >
          <Button
            onClick={submitData}
            variant="solid"
            size="lg"
            className="hover:scale-105 transition-all duration-200 group hover:shadow-sm shadow-gray-800 font-medium"
            // disabled={!showSubmit || priceError !== null || lock}
          >
            {!lock ? (
              <span className="flex flex-nowrap gap-1 items-center justify-center">
                <span>Create Member</span>{" "}
                <PiArrowRightBold className="ml-2 transition-all group-hover:animate-pulse" />
              </span>
            ) : (
              <Loader variant="threeDot" />
            )}
          </Button>
        </Tooltip>
      </div>

      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        showCamera={showCamera}
      />
    </div>
  );
}
