"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Input,
  Select,
  Title,
  Text,
  Loader,
  Drawer,
  RadioGroup,
  AdvancedRadio,
  Switch,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { Data } from "./Leads";
import { useRouter } from "next/navigation";
import { DatePicker } from "@core/ui/datepicker";
import Image from "next/image";
import { CircleCheck, XIcon } from "lucide-react";
// import TaxAccordion from "../../app/[locale]/(home)/members/_components/TaxAccordion";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { FaInstagram, FaPercent } from "react-icons/fa6";
import { BsArrowRight } from "react-icons/bs";
// import { FaBookReader } from "react-icons/fa";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import { TbInfoTriangleFilled } from "react-icons/tb";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import CameraCapture from "@/components/member-list/Capture";
import { PhoneNumber } from "@core/ui/phone-input";
import DateCell from "@core/ui/date-cell";
import dayjs from "dayjs";
import TaxAccordion from "../member-list/members/TaxAccordion";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

interface MembershipDetails {
  package_id: number | null;
  offer_price: number | null;
  paid_amount: number | null;
  start_date: string;
  payment_mode_id: number | null | string;
  due_date: string | null;
  actual_amount: number | null;
  enrollment_fee_id: number | null;
  // sessions_allocated:number| null
  // trainer_id: number | null;
  end_date?: string;
}

interface ValidationErrors {
  package_id?: string;
  offer_price?: string;
  paid_amount?: string;
  start_date?: string;
  payment_mode_id?: string;
  due_date?: string;
  category_id?: string;
  batch_id?: string;
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

interface ConvertLeadProps {
  lead: Data;
  packages?: Package[];
  paymentModes: { label: string; value: number }[];
  onConvert: () => void;
  isValid: boolean;
  auth: boolean;
}

interface NewMember extends Data {
  blood_group: null | string;
  emergency_contact: string | null;
  emergency_contact_name: string | null;
  occupation: string | null;
  qualification: string | null;
  colledge_or_school: string | null;
  martial_status: string | null;
  reference: string | null;
  parents_name: string | null;
  parents_contact: string | null;
  with_parents: boolean | null;
  remarks: string;
  medical_history: string | null;
  ig: string | null;
}

interface DiscountState {
  type: "rupee" | "percentage";
  value: number;
}

type leadRecommended = {
  email?: string;
  address?: string;
  country?: string;
  dob?: string;
};
const LeadConvert: React.FC<ConvertLeadProps> = ({
  lead,
  packages,
  paymentModes,
  onConvert,
  isValid,
  auth,
}) => {
  const [leadVal, setLeadVal] = useState<NewMember>({
    ...lead,
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
    reference: null,
    remarks: "",
    with_parents: null,
    ig: null,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [lock, setLock] = useState(false);
  const [membershipDetails, setMembershipDetails] = useState<MembershipDetails>(
    {
      package_id: null,
      offer_price: null,
      paid_amount: null,
      start_date: new Date().toISOString().split("T")[0],
      payment_mode_id: null,
      due_date: null,
      actual_amount: null,
      enrollment_fee_id: null,
      // sessions_allocated:null
      // trainer_id: null,
    }
  );
  const [isFullPay, setIsFullPay] = useState<"yes" | "no">("no");
  const [occupation, setOccupation] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));
  const [trainers, setTrainers] = useState<any[]>([]);
  const [applyTaxes, setApplyTaxes] = useState<boolean>(false);
  const [enrollment, setEnrollment] = useState<any[]>([]);
  const [enrollmentList, setEnrollmentList] = useState<any[]>([]);
  const router = useRouter();
  const [showDueDate, setShowDueDate] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [priceError, setPriceError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [memberCategory, setMemberCategory] = useState<any>(null);
  const [memberBatch, setMemberBatch] = useState<any>(null);
  // const [memberEnroll, setMemberEnroll] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [enrollmentFee, setEnrollmentFee] = useState<number>(0);
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [packList, setPackList] = useState<any[]>([]);
  const emptyPackage: Package[] = [
    {
      label: "No Packages Found",
      value: 0,
      min_price: 0,
      max_price: 0,
      num_of_days: 0,
    },
  ];
  const [metricData, setMetricData] = useState([
    { label: "All", value: "All" },
  ]);
  const [endDate, setEndDate] = useState<any>(null);
  const [discount, setDiscount] = useState<DiscountState>({
    type: "rupee",
    value: 0,
  });
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [centerType, setCenterType] = useState(0);
  const [packageType, setPackageType] = useState("All");
  // const [totalMaxPrice, setTotalMaxPrice] = useState<number | null>();
  const [packageList, setPackagesList] = useState<Package[]>([]);
  const [recommendedFields, setRecommendedFeilds] = useState<leadRecommended>({
    address: "",
    country: "",
    dob: "",
  });
  const [filliedFields, setFilledFields] = useState<leadRecommended>({
    address: "",
    country: "",
    dob: "",
  });
  const [showCamera, setShowCamera] = useState(false);

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs">
              <Text className="font-medium">Start :</Text>
              <Text>
                {option?.start_time ? (
                  <DateCell
                    date={new Date(`2025-01-01T${option.start_time}`)}
                    dateClassName="hidden"
                    timeFormat="h:mm A"
                  />
                ) : (
                  "N/A"
                )}
              </Text>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Text className="font-medium">End :</Text>
              <Text>
                {option?.end_time ? (
                  <DateCell
                    date={new Date(`2025-01-01T${option.end_time}`)}
                    dateClassName="hidden"
                    timeFormat="h:mm A"
                  />
                ) : (
                  "N/A"
                )}
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const handleCameraCapture = (file: File) => {
    // setData((prev) => ({ ...prev, visitor_image: file }));
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const calculateDiscount = (): number => {
    if (!membershipDetails.offer_price) return 0;
    let prevFee = "0";
    if (membershipDetails.enrollment_fee_id) {
      prevFee = enrollmentList.find(
        (fee) => fee.value === membershipDetails.enrollment_fee_id
      )?.amount;
    }
    if (discount.type === "rupee") {
      return Math.min(discount.value || 0, membershipDetails.offer_price);
    } else {
      return Math.min(
        (membershipDetails.offer_price * discount.value || 0) / 100,
        membershipDetails.offer_price
      );
    }
  };

  useEffect(() => {
    if (isFullPay === "yes") {
      setMembershipDetails((prev) => ({
        ...prev,
        paid_amount: calculateActualAmount(),
      }));
    }
  }, [
    membershipDetails.offer_price,
    discount.value,
    discount.type,
    applyTaxes,
    isFullPay,
  ]);
  const calculateTaxes = (): number => {
    if (!applyTaxes || !membershipDetails.offer_price) return 0;
    const taxableAmount = membershipDetails.offer_price - calculateDiscount();
    return taxableAmount * 0.18; // 18% GST
  };

  const calculateSubTotal = (): number => {
    if (!membershipDetails.offer_price) return 0;
    return membershipDetails.offer_price - calculateDiscount();
  };

  const calculateActualAmount = (): number => {
    const subTotal = calculateSubTotal();
    const taxes = calculateTaxes();
    return subTotal + taxes;
  };

  const handleDiscountTypeChange = (value: "rupee" | "percentage") => {
    setDiscount((prev) => ({
      ...prev,
      type: value,
    }));
  };

  useEffect(() => {
    // console.log(leadVal);
    setRecommendedFeilds({
      email: leadVal?.email || "",
      address: leadVal?.address_street || "",
      country: leadVal?.address_country || "",
      dob: leadVal?.dob || "",
    });
    setFilledFields({
      email: leadVal?.email || "",
      address: leadVal?.address_street || "",
      country: leadVal?.address_country || "",
      dob: leadVal?.dob || "",
    });
    if (leadVal?.package_id !== null && packageList.length > 0 && isOpen) {
      const packageVal = packageList.find(
        (pack) => pack.value === leadVal?.package_id
      );
      setMembershipDetails((prev) => ({
        ...prev,
        package_id: leadVal?.package_id || null,
        offer_price: packageVal?.max_price || null,
      }));
      setSelectedPackage(
        packages?.find((pack) => pack.value === leadVal?.package_id) || null
      );
      toast.success(`Prefilled ${leadVal?.name}'s Interested Package`);
    }
  }, [leadVal.LeadId, packageList, isOpen]);

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
      setPackagesList(packageData);
      setPackList(resp.data.results.packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error(
        "Something went wrong while fetching packages. Please try again."
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMembershipDetails((prev) => {
      const updatedData = { ...prev };

      if (name === "offer_price" || name === "paid_amount") {
        updatedData[name] = parseFloat(value) || null;

        // const enrollmentFee = prev.enrollment_fee_id
        //   ? enrollmentList.find((fee) => fee.value === prev.enrollment_fee_id)?.amount || 0
        //   : 0;
        if (name === "offer_price") {
          updatedData.actual_amount = calculateActualAmount();
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
                `Paid amount cannot exceed ${actualAmount.toFixed(0)}`
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
      // setValidationErrors((prev) => ({ ...prev, [name]: "" }));
      return updatedData;
    });
  };

  const handleSelectChange = (
    name: string,
    option: Package | Option | null
  ) => {
    // setValidationErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "package_id" && option && "min_price" in option) {
      setSelectedPackage(option);
      setMembershipDetails((prev) => {
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
      if (membershipDetails.enrollment_fee_id) {
        prevFee = enrollmentList.find(
          (fee) => fee.value === membershipDetails.enrollment_fee_id
        )?.amount;
      }
      setMembershipDetails((prev) => {
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
      setMembershipDetails((prev) => ({
        ...prev,
        [name]: option?.value ?? null,
      }));
    }
  };

  const validateField = (name: string, value: any) => {
    let error = "";
    const total = calculateActualAmount();
    switch (name) {
      case "package_id":
        error = !value ? "Package is required" : "";
        break;
      case "offer_price":
        error =
          value === null || value === ""
            ? "Price is required"
            : parseFloat(value) <= 0
              ? "Price must be greater than 0"
              : "";
        break;
      case "paid_amount":
        error =
          (value === null || value === "") && total > 0
            ? "Paid amount is required"
            : parseFloat(value) < 0
              ? "Paid amount cannot be negative"
              : "";
        break;
      case "start_date":
        error = !value ? "Start date is required" : "";
        break;
      case "payment_mode_id":
        error = !value && total > 0 ? "Payment mode is required" : "";
        break;
      case "due_date":
        if (showDueDate && !value) {
          error = "Due date is required when paid amount is less than price";
        }
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: ValidationErrors = {};

    Object.entries(membershipDetails).forEach(([key, value]) => {
      validateField(key, value);
      if (errors[key as keyof ValidationErrors]) {
        newErrors[key as keyof ValidationErrors] =
          errors[key as keyof ValidationErrors];
        isValid = false;
      }
    });
    // if (!recommendedFields.email && !filliedFields.email) {
    //   toast.error("Please Fill Email Field");
    //   isValid = false;
    // }
    if (!recommendedFields.address && !filliedFields.address) {
      toast.error("Please Fill Address Field");
      isValid = false;
    }
    if (!recommendedFields.country && !filliedFields.country) {
      toast.error("Please Fill Country Field");
      isValid = false;
    }
    if (!recommendedFields.dob && !filliedFields.dob) {
      toast.error("Please Fill Date Of Birth Field");
      isValid = false;
    }

    // Validate category_id and batch_id
    // if (!memberCategory) {
    //   newErrors.category_id = "Category is required";
    //   isValid = false;
    // }
    // if (!memberBatch) {
    //   newErrors.batch_id = "Batch is required";
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  const convertLead = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    if (priceError) {
      toast.error(priceError);
      return;
    }
    try {
      // if(membershipDetails.sessions_allocated===null){
      //
      // }
      setLock(true);
      const gymId = await retrieveGymId();
      let newMembershipDetails = membershipDetails;
      if (calculateActualAmount() === 0) {
        newMembershipDetails = {
          ...newMembershipDetails,
          paid_amount: 0,
        };
      }
      if (endDate !== null) {
        newMembershipDetails = {
          ...newMembershipDetails,
          end_date: dayjs(new Date(endDate)).format("YYYY-MM-DD"),
        };
      }
      const memberData = {
        name: leadVal?.name,
        phone: leadVal?.phone,
        email: leadVal?.email || "",
        member_image: imageFile ?? null,
        date_of_birth: leadVal?.dob || filliedFields.dob,
        joining_date: new Date().toISOString().split("T")[0],
        gender: leadVal?.gender || "Other",
        category_id: memberCategory?.toString() || null,
        batch_id: memberBatch?.toString() || null,
        address_country: leadVal?.address_country || filliedFields.country,
        address_street: leadVal?.address_street || filliedFields.address,
        gym_id: parseInt(gymId as string),
        source_id: leadVal?.source_id || null,
        // category_id: leadVal?.category_id,
        status: "active",
        // status_id: leadVal?.status_id,
        ...newMembershipDetails,
        discounted_amount: calculateDiscount().toString(),
        actual_amount: calculateActualAmount().toString(),
        enquiry_id: leadVal?.LeadId,
        sessions_allocated:
          endDate !== null
            ? dayjs(new Date(endDate))
                .diff(dayjs(new Date(newMembershipDetails.start_date)), "days")
                .toString()
            : packList.find((pack) => pack.id === membershipDetails.package_id)
                .sessions_allocated,
      };

      // console.log(memberData);

      const membershipResp = await AxiosPrivate.post(
        `/api/member-membership-create/?gym_id=${gymId}`,
        memberData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then((res) => {
        invalidateAll();
        toast.success("Lead successfully converted to member!");
        setIsOpen(false);
        setLock(false);
        onConvert();
        // setLeadVal(null);
        const membershipID = res.data.membership.id;
        const memberID = res.data.member.member_id;
        router.push(
          `/invoice/hy$39-${membershipID}-091$u/?member=i9rw-${memberID}-7y72&page=leads`
        );
      });
    } catch (error) {
      console.error("Error converting lead:", error);
      toast.error(
        "Something went wrong while Converting leadVal?. Please try again."
      );
      setLock(false);
    }
  };

  function renderOptionDisplayValue(option: Package) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex flex-col w-full gap-0.5 pl-4">
          <div className="flex items-center gap-1 text-[13px]">
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
          <div className="flex items-center gap-1 text-[13px]">
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
        className=" w-full flex flex-row items-center justify-between mx-2"
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
  useEffect(() => {
    const duration = selectedPackage?.num_of_days;
    console.log(duration);
    setEndDate(
      dayjs(membershipDetails.start_date)
        .add(duration || 1, "days")
        .format("YYYY-MM-DD")
    );
  }, [
    membershipDetails.start_date,
    membershipDetails.package_id,
    selectedPackage,
  ]);

  // function renderOptionDisplayBatch(option: any) {
  //   return (
  //     <div className="grid gap-0.5">
  //       <Text fontWeight="semibold">{option.label}</Text>
  //       <div className="flex flex-col w-full gap-0.5 pl-4">
  //         <div className="flex items-center gap-4 text-[13px]">
  //           <div>
  //             <Text as="span" className="font-medium">
  //               Total Capacity :{" "}
  //             </Text>{" "}
  //             {option.capacity}{" "}
  //           </div>
  //           <div>
  //             <Text as="span" className="font-medium">
  //               Members :{" "}
  //             </Text>{" "}
  //             {option.live_member_count?.split("|")[0]}
  //           </div>
  //         </div>
  //         <div className="flex items-center gap-4 text-[13px]">
  //           <div className="flex items-center gap-1 text-[13px]">
  //             <Text className="font-medium">Start Time :</Text>
  //             <Text>{option?.start_time || "N/A"}</Text>
  //           </div>
  //           <div className="flex items-center gap-1 text-[13px]">
  //             <Text className="font-medium">End Time :</Text>
  //             <Text>{option?.end_time || "N/A"}</Text>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const convertClose = () => {
    setMembershipDetails({
      package_id: null,
      offer_price: null,
      paid_amount: null,
      start_date: new Date().toISOString().split("T")[0],
      payment_mode_id: null,
      due_date: new Date().toISOString().split("T")[0],
      actual_amount: null,
      enrollment_fee_id: null,
      // trainer_id: null,
      // sessions_allocated:null,
    });
    setIsOpen(false);
    setErrors({});
    // setLeadVal(null);
    setPriceError(null);
    setSelectedPackage(null);
  };

  useEffect(() => {
    const getPreReq = async () => {
      const gymId = await retrieveGymId();
      const infoData = await retrieveDemographicInfo();

      try {
        const resp = await AxiosPrivate.get(
          `/api/member/add-member-prerequisites/?gym_id=${gymId}`
        ).then((res) => {
          // console.log(res.data);
          // setMemberCategories(
          //   res.data.favorite_categories.map((cat: any) => ({
          //     label: cat.name,
          //     value: cat.id,
          //   }))
          // );
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
          setOccupation(
            res.data.occupation_types.map((occ: any) => ({
              label: occ,
              value: occ,
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
          setTrainers(
            res.data.trainers.map((trainer: any) => ({
              label: trainer.name,
              value: trainer.id,
            }))
          );
        });
        setDemographicInfo(infoData);
      } catch (error) {
        console.log(error);
      }
    };
    // console.log(leadVal);
    getPreReq();
  }, []);
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
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    if (leadVal?.visitor_image && leadVal?.visitor_image !== "") {
      setImagePreview(leadVal?.visitor_image);
    }
  }, []);

  function renderEmptyBatch() {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between mx-2"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-[13px] text-nowrap">
          No Batches Found
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Batches Section");
            router.push("/batches");
          }}
          className="text-primary text-xs text-nowrap"
        >
          Add Batches <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }
  useEffect(() => {
    fetchPackages(packageType);
    setMembershipDetails((prev) => {
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
  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          if (!isValid) {
            toast.error("Please Subscribe to Proceed Further");
            if (auth) {
              router.push("/subscription/plans");
            }
            return;
          }
          setIsOpen(true);
        }}
      >
        Convert
      </Button>
      <Drawer
        size="lg"
        isOpen={isOpen}
        onClose={convertClose}
        // containerClassName="dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="p-5 lg:p-8   custom-scrollbar max-h-[99%] overflow-y-auto">
          <div className="flex items-center justify-between min-w-full">
            <Title as="h4" className="text-gray-900 ">
              Add Details for {leadVal?.name}
            </Title>
            <XIcon onClick={convertClose} />
          </div>
          {recommendedFields.address?.length &&
          recommendedFields.country &&
          recommendedFields.dob ? null : (
            <div className="grid sm:grid-cols-2 gap-4 border border-muted p-4 rounded-lg mt-4 md:mt-6 mb-4">
              <Text className="text-gray-900 animate-pulse col-span-full flex items-center gap-2">
                <TbInfoTriangleFilled /> Fields Required for Member Conversion
              </Text>
              {!recommendedFields.email && (
                <Input
                  type="email"
                  value={filliedFields.email}
                  placeholder="Email "
                  label="Email (Optional)"
                  onChange={(e) => {
                    setFilledFields((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));
                  }}
                />
              )}
              {!recommendedFields.address && (
                <Input
                  type="text"
                  value={filliedFields.address}
                  placeholder="Address *"
                  label="Address * "
                  onChange={(e) => {
                    setFilledFields((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }));
                  }}
                />
              )}
              {!recommendedFields.country && (
                <Select
                  label="Country "
                  value={filliedFields.country}
                  options={countryOptions}
                  onChange={(selectedValue: string) =>
                    setFilledFields((prev) => ({
                      ...prev,
                      country: selectedValue,
                    }))
                  }
                  getOptionValue={(option) => option.value}
                  className="col-span-full sm:col-span-1"
                  clearable
                  onClear={() =>
                    setFilledFields((prev) => ({
                      ...prev,
                      country: "",
                    }))
                  }
                />
              )}
              {!recommendedFields.dob && (
                // <div className="">
                //   <label
                //     htmlFor="date_of_birth"
                //     className="block mb-2 font-medium "
                //   >
                //     Date of Birth
                //   </label>
                //   <DatePicker
                //     name="date_of_birth"
                //     // value={filliedFields.dob}
                //     // onChange={(date: any) =>
                //     //   setFilledFields((prev) => ({
                //     //     ...prev,
                //     //     dob: new Date(date.getTime() + 86400000)
                //     //       .toISOString()
                //     //       .split("T")[0],
                //     //   }))
                //     // }
                //     value={
                //       filliedFields.dob
                //         ? formateDateValue(new Date(filliedFields.dob))
                //         : ""
                //     }
                //     onChange={(date: any) =>
                //       setFilledFields((prev) => ({
                //         ...prev,
                //         dob: formateDateValue(
                //           new Date(date.getTime()),
                //           "YYYY-MM-DD"
                //         ),
                //       }))
                //     }
                //     placeholderText="Select Date of Birth"
                //     showMonthDropdown={true}
                //     showYearDropdown={true}
                //     scrollableYearDropdown={true}
                //     // isClearable={true}
                //     yearDropdownItemNumber={50}
                //     maxDate={
                //       new Date(
                //         new Date().setFullYear(new Date().getFullYear() - 5)
                //       )
                //     }
                //     dateFormat="yyyy-MM-dd"
                //     className="col-span-full sm:col-span-1 dark:bg-inherit"
                //   />
                // </div>
                <Input
                  name="date_of_birth"
                  type="date"
                  label="Date of Birth"
                  value={filliedFields.dob}
                  onChange={(e) => {
                    setFilledFields((prev) => ({
                      ...prev,
                      dob: e.target.value,
                    }));
                  }}
                  placeholder="Enter Date of Birth"
                />
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 ">
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
                <div className="w-[100px] h-[100px] relative">
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

            <Select
              label="Member Batch"
              name="batch_id"
              options={
                batches.length ? batches : [{ label: "Empty", value: "empty" }]
              }
              value={
                batches.find((group) => group.value === memberBatch)?.label ||
                ""
              }
              onChange={({ value }: { label: string; value: string }) => {
                checkBatches(value);
                setMemberBatch(parseInt(value));
              }}
              getOptionDisplayValue={(option) =>
                batches.length
                  ? renderOptionDisplayBatch(option)
                  : renderEmptyBatch()
              }
              error={errors.batch_id}
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
            <div className="grid grid-cols-1 gap-1.5 col-span-full">
              <Text className="font-medium ">Package Type *</Text>
              <div className="relative flex w-full items-center overflow-hidden">
                <Button
                  title="Prev"
                  variant="text"
                  ref={sliderPrevBtn}
                  onClick={scrollToTheLeft}
                  className="!absolute -left-1 top-0 z-10 !h-full w-10 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70"
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
                // options={packageList}
                options={packageList.length ? packageList : emptyPackage}
                value={packageList.find(
                  (pkg) => pkg.value === membershipDetails.package_id
                )}
                onChange={(option: Package | null) =>
                  handleSelectChange("package_id", option)
                }
                labelClassName=""
                getOptionDisplayValue={(option) =>
                  packageList.length
                    ? renderOptionDisplayValue(option)
                    : renderEmpty(option)
                }
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
            </div>
            <Select
              label="Enrollment Fee"
              name="enrollment_fee_id"
              options={enrollment}
              value={
                enrollment.find(
                  (group) => group.value === membershipDetails.enrollment_fee_id
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
            <div className="grid gap-0.5">
              <Input
                label="Sub Total * "
                name="offer_price"
                type="number"
                placeholder="Enter Price"
                readOnly
                prefix={
                  <Text className="text-primary">
                    {demographiInfo?.currency_symbol || " "}
                  </Text>
                }
                value={membershipDetails.offer_price?.toString() || ""}
                onChange={handleInputChange}
                labelClassName=""
              />
              {/* {validationErrors.offer_price && (
                <p className="text-xs text-red-500">
                  {validationErrors.offer_price}
                </p>
              )} */}
            </div>
            <div className="grid gap-1 relative">
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
                  membershipDetails.offer_price
                    ? membershipDetails.offer_price - calculateDiscount()
                    : 0
                }
                show={applyTaxes}
                handleApplyTaxes={handleApplyTaxesChange}
                symbol={demographiInfo?.currency_symbol || ""}
              />
            </div>
            {/* <div className="grid gap-1.5 ">
              <Text className="font-medium ">Start Date * </Text>
              <DatePicker
                name="start_date"
                // value={membershipDetails.start_date || ""}
                // onChange={(date: any) =>
                //   setMembershipDetails((prev) => ({
                //     ...prev,
                //     start_date: new Date(date.getTime() + 86400000)
                //       .toISOString()
                //       .split("T")[0],
                //   }))
                // }
                value={
                  membershipDetails.start_date
                    ? formateDateValue(new Date(membershipDetails.start_date))
                    : ""
                }
                onChange={(date: any) =>
                  setMembershipDetails((prev) => ({
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
              {/* {validationErrors.start_date && (
                <p className="text-xs text-red-500">
                  {validationErrors.start_date}
                </p>
              )} 
            </div> */}
            {/* {isCustomEnd ? (
              <div className="grid col-span-full md:grid-cols-2 gap-2 md:gap-4 items-end">
                <div className="grid grid-cols-1 gap-1.5 ">
                  <div className="flex flex-row gap-2 items-center">
                    <Text className="font-medium space-x-4">Start Date *</Text>

                    <Switch
                      label="Custom End Date"
                      value={isCustomEnd ? "custom" : "default"}
                      checked={isCustomEnd}
                      onChange={() => setIsCustomEnd(false)}
                    />
                  </div>
                  <DatePicker
                    name="start_date"
                    // value={data.start_date || ""}
                    // onChange={(date: any) =>
                    //   setData((prev) => ({
                    //     ...prev,
                    //     start_date: new Date(date.getTime() + 86400000)
                    //       .toISOString()
                    //       .split("T")[0],
                    //   }))
                    // }
                    value={
                      membershipDetails.start_date
                        ? formateDateValue(
                            new Date(membershipDetails.start_date)
                          )
                        : ""
                    }
                    onChange={(date: any) =>
                      setMembershipDetails((prev) => ({
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
                    isClearable
                    placeholderText="Select End Date"
                    showMonthDropdown={true}
                    showYearDropdown={true}
                    scrollableYearDropdown={true}
                    dateFormat="yyyy-MM-dd"
                    className="col-span-full sm:col-span-1"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 ">
                <div className="flex flex-row gap-2 items-center">
                  <Text className="font-medium space-x-4">Start Date *</Text>

                  <Switch
                    label="Custom End Date"
                    value={isCustomEnd ? "custom" : "default"}
                    checked={isCustomEnd}
                    onChange={() => setIsCustomEnd(true)}
                  />
                </div>
                <DatePicker
                  name="start_date"
                  // value={data.start_date || ""}
                  // onChange={(date: any) =>
                  //   setData((prev) => ({
                  //     ...prev,
                  //     start_date: new Date(date.getTime() + 86400000)
                  //       .toISOString()
                  //       .split("T")[0],
                  //   }))
                  // }
                  value={
                    membershipDetails.start_date
                      ? formateDateValue(new Date(membershipDetails.start_date))
                      : ""
                  }
                  onChange={(date: any) =>
                    setMembershipDetails((prev) => ({
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
              </div>
            )} */}
            <div className="grid col-span-full md:grid-cols-2 gap-2 md:gap-4 items-end">
              <div className="grid grid-cols-1 gap-1.5 ">
                <div className="flex flex-row gap-2 items-center">
                  <Text className="font-medium space-x-4">Start Date *</Text>
                </div>
                <DatePicker
                  name="start_date"
                  // value={data.start_date || ""}
                  // onChange={(date: any) =>
                  //   setData((prev) => ({
                  //     ...prev,
                  //     start_date: new Date(date.getTime() + 86400000)
                  //       .toISOString()
                  //       .split("T")[0],
                  //   }))
                  // }
                  value={
                    membershipDetails.start_date
                      ? formateDateValue(new Date(membershipDetails.start_date))
                      : ""
                  }
                  onChange={(date: any) =>
                    setMembershipDetails((prev) => ({
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
                  isClearable
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
                value={calculateActualAmount().toFixed(0)}
                prefix={
                  <Text className="text-primary">
                    {demographiInfo?.currency_symbol || " "}
                  </Text>
                }
                readOnly
              />
            </div>
            {membershipDetails.package_id && calculateActualAmount() > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-1 relative">
                  <Switch
                    value={isFullPay}
                    size="sm"
                    label="Full Payment"
                    onChange={() => {
                      if (isFullPay === "yes") {
                        setIsFullPay("no");
                        setMembershipDetails((prev) => ({
                          ...prev,
                          paid_amount: null,
                        }));
                        setShowDueDate(true);
                      } else {
                        setIsFullPay("yes");
                        setMembershipDetails((prev) => ({
                          ...prev,
                          paid_amount: parseInt(
                            calculateActualAmount().toFixed(0)
                          ),
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
                    value={membershipDetails.paid_amount?.toString() || ""}
                    onChange={handleInputChange}
                    labelClassName=""
                  />
                  {/* {validationErrors.paid_amount && (
                <p className="text-xs text-red-500">
                  {validationErrors.paid_amount}
                </p>
              )} */}
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
                      (mode) =>
                        mode?.value === membershipDetails.payment_mode_id
                    )}
                    // @ts-ignore
                    onChange={(option: Option | null) =>
                      handleSelectChange("payment_mode_id", option)
                    }
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                </div>
              </>
            ) : null}
            {showDueDate && (
              // <div className="grid grid-cols-1 gap-0.5">
              //   <Input
              //     label="Due Date *"
              //     name="due_date"
              //     type="date"
              //     value={leadVal.due_date || new Date().toString()}
              //     onChange={handleInputChange}
              //   />
              <div className="grid grid-cols-1 gap-1.5 ">
                <Text className="font-medium ">Due Date * </Text>
                <DatePicker
                  name="due_date"
                  // value={membershipDetails.due_date || ""}
                  // onChange={(date: any) =>
                  //   setMembershipDetails((prev) => ({
                  //     ...prev,
                  //     due_date: new Date(date.getTime() + 86400000)
                  //       .toISOString()
                  //       .split("T")[0],
                  //   }))
                  // }
                  value={
                    membershipDetails.due_date
                      ? formateDateValue(new Date(membershipDetails.due_date))
                      : ""
                  }
                  onChange={(date: any) =>
                    setMembershipDetails((prev) => ({
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
                  {/* {validationErrors.due_date && (
                    <p className="text-xs text-red-500">
                      {validationErrors.due_date}
                    </p>
                  )} */}
                </div>
              </div>
            )}
            <div className="col-span-full">
              <Title as="h5"> Additional Fields</Title>
            </div>
            <Select
              label="Occupation"
              name="occupation"
              options={occupation}
              value={leadVal.occupation}
              onChange={(option: Option | null) => {
                setLeadVal((prev) => ({
                  ...prev,
                  occupation: option?.label || null,
                }));
              }}
              clearable
              onClear={() =>
                setLeadVal((prev) => ({
                  ...prev,
                  occupation: null,
                }))
              }
            />
            {leadVal.occupation === "Student" ? (
              <Input
                label="College/School"
                name="colledge_or_school"
                placeholder="Enter College/School Name"
                value={leadVal.colledge_or_school || ""}
                onChange={(e) => {
                  setLeadVal((prev) => ({
                    ...prev,
                    colledge_or_school: e.target.value,
                  }));
                }}
              />
            ) : null}
            <Input
              label="Qualification"
              name="qualification"
              placeholder="Enter Educational Qualification"
              value={leadVal.qualification || ""}
              onChange={(e) => {
                setLeadVal((prev) => ({
                  ...prev,
                  qualification: e.target.value,
                }));
              }}
            />
            <Select
              label="Blood Group"
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
              value={leadVal.blood_group}
              onChange={(option: Option | null) => {
                setLeadVal((prev) => ({
                  ...prev,
                  blood_group: option?.label || null,
                }));
              }}
              clearable
              onClear={() =>
                setLeadVal((prev) => ({
                  ...prev,
                  blood_group: null,
                }))
              }
            />
            <Input
              label="Emergency Contact Name"
              name="emergency_contact_name"
              placeholder="Emergency Contact Person"
              value={leadVal.emergency_contact_name || ""}
              onChange={(e) => {
                setLeadVal((prev) => ({
                  ...prev,
                  emergency_contact_name: e.target.value,
                }));
              }}
            />
            <PhoneNumber
              label="Emergency Contact Number"
              country={
                leadVal?.address_country?.length > 0
                  ? COUNTRY_MAPPINGS[
                      leadVal?.address_country
                    ]?.code?.toLowerCase() || "in"
                  : "in"
              }
              value={leadVal.emergency_contact || ""}
              onChange={(value) =>
                setLeadVal((prev) => ({ ...prev, emergency_contact: value }))
              }
            />
            <Select
              label="Marital Status"
              name="martial_status"
              options={[
                { label: "Single", value: "Single" },
                { label: "Married", value: "Married" },
                { label: "Divorced", value: "Divorced" },
                { label: "Widowed", value: "Widowed" },
              ]}
              value={leadVal.martial_status}
              onChange={(option: Option | null) => {
                setLeadVal((prev) => ({
                  ...prev,
                  martial_status: option?.label || null,
                }));
              }}
              clearable
              onClear={() =>
                setLeadVal((prev) => ({
                  ...prev,
                  martial_status: null,
                }))
              }
            />
            <div className="flex items-center gap-4 px-4">
              <Text>Living with Parents</Text>
              <Switch
                // label="Living with Parents"
                name="with_parents"
                checked={leadVal.with_parents || false}
                onChange={(e) =>
                  setLeadVal((prev) => ({
                    ...prev,
                    with_parents: e.target.checked,
                  }))
                }
              />
            </div>
            <Input
              label="Parent's Name"
              name="parents_name"
              placeholder="Enter Parent's Name"
              value={leadVal.parents_name || ""}
              onChange={(e) =>
                setLeadVal((prev) => ({
                  ...prev,
                  parents_name: e.target.value,
                }))
              }
            />
            <PhoneNumber
              label="Parent's Contact"
              country={
                leadVal?.address_country?.length > 0
                  ? COUNTRY_MAPPINGS[
                      leadVal?.address_country
                    ]?.code?.toLowerCase() || "in"
                  : "in"
              }
              value={leadVal.parents_contact || ""}
              onChange={(value) =>
                setLeadVal((prev) => ({ ...prev, parents_contact: value }))
              }
            />
            <Input
              label="Medical History"
              name="medical_history"
              placeholder="Enter Medical History/Conditions"
              value={leadVal.medical_history || ""}
              onChange={(e) =>
                setLeadVal((prev) => ({
                  ...prev,
                  medical_history: e.target.value,
                }))
              }
            />
            <Input
              label="Reference"
              name="reference"
              placeholder="How did you hear about us?"
              value={leadVal.reference || ""}
              onChange={(e) =>
                setLeadVal((prev) => ({ ...prev, reference: e.target.value }))
              }
            />
            <Input
              label="Remarks"
              name="remarks"
              placeholder="Any additional remarks"
              value={leadVal.remarks || ""}
              onChange={(e) =>
                setLeadVal((prev) => ({ ...prev, remarks: e.target.value }))
              }
            />
            <Input
              label="Instagram Handle"
              name="ig"
              placeholder="@username"
              value={leadVal.ig || ""}
              onChange={(e) =>
                setLeadVal((prev) => ({ ...prev, ig: e.target.value }))
              }
              prefix={<FaInstagram size={20} />}
            />
          </div>
          <div className="mt-6 flex justify-between  mb-5">
            <Button
              variant="outline"
              onClick={convertClose}
              className="mr-2  w-40"
            >
              Cancel
            </Button>
            <Button
              onClick={convertLead}
              disabled={lock || priceError !== null}
              className="w-40"
            >
              {lock ? <Loader variant="threeDot" /> : "Convert"}
            </Button>
          </div>
        </div>
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          showCamera={showCamera}
        />
      </Drawer>
    </>
  );
};

export default LeadConvert;
