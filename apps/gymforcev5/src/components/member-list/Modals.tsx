import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Badge,
  Text,
  Tooltip,
  ActionIcon,
  Modal,
  Button,
  Input,
  Select,
  Title,
  Loader,
  Drawer,
  RadioGroup,
  Switch,
  AdvancedRadio,
  Checkbox,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { CircleCheck, X, XIcon } from "lucide-react";
import { PhoneNumber } from "@core/ui/phone-input";
import {
  MdDelete,
  MdOutlineDateRange,
  MdOutlineSettingsBackupRestore,
} from "react-icons/md";
import Image from "next/image";
import { TbInfoTriangle } from "react-icons/tb";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import { useRouter } from "next/navigation";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import dayjs from "dayjs";
import { DatePicker } from "@core/ui/datepicker";
import { FaInstagram, FaPercent } from "react-icons/fa6";
import { RiCopperCoinFill } from "react-icons/ri";
// import TaxAccordion from "@/app/[locale]/(home)/members/_components/TaxAccordion";
import DateCell from "@core/ui/date-cell";
import { IoWarningOutline } from "react-icons/io5";
import { BsArrowRight } from "react-icons/bs";
import {
  formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
import CameraCapture from "./Capture";
import Link from "next/link";
import TaxAccordion from "./members/TaxAccordion";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

interface RenewModalProps {
  membershipId: string;
  func: "Edit" | "Pay" | "Renew" | "Restore" | null;
  onUpdate: () => void;
  package_name: string;
  end_date: string;
  package_type_val?: string;
  member_id: string;
}
interface PaymentMode {
  label: string;
  value: number;
}
interface Package {
  label: string;
  value: number;
  min_price: number;
  max_price: number;
}

interface RenewalDetails {
  package_id: number | null;
  offer_price: number | null;
  paid_amount: number | null;
  // payment_mode: number | null;
  due_date: string | null;
  start_date: string | null;
  payment_mode_id: number | null;
  actual_amount: number | null;
  end_date?: string;
  session_allocated?: string;
}

interface ValidationErrors {
  package_id?: string;
  offer_price?: string;
  paid_amount?: string;
  payment_mode?: string;
  due_date?: string;
  start_date?: string;
  member_image?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface DiscountState {
  type: "rupee" | "percentage";
  value: number;
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

interface MetricItem {
  title: string;
  icon?: React.ReactNode;
  value: string;
}

//  Renewal Option Issues from API still under developement
export const RenewModal: React.FC<RenewModalProps> = ({
  membershipId,
  func,
  onUpdate,
  package_name,
  package_type_val = "all",
  end_date,
  member_id,
}) => {
  const [renewalDetails, setRenewalDetails] = useState<RenewalDetails>({
    package_id: null,
    offer_price: null,
    paid_amount: null,
    // payment_mode: null,
    due_date: null,
    start_date: null,
    payment_mode_id: null,
    actual_amount: null,
  });
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [isFullPay, setIsFullPay] = useState<"yes" | "no">("no");
  const [lock, setLock] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [priceError, setPriceError] = useState<string | null>(null);
  const [discount, setDiscount] = useState<DiscountState>({
    type: "rupee",
    value: 0,
  });
  const [pointErr, setPointErr] = useState("");
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [paymentModes, setPaymentModes] = useState<Option[]>([]);
  const [metricData, setMetricData] = useState([
    { label: "All", value: "All" },
  ]);
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [pointsInfo, setPointsInfo] = useState<any>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [usedPoints, setUsedPoints] = useState(0);
  const [pointError, setPointError] = useState("");
  const [applyTaxes, setApplyTaxes] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [packageType, setPackageType] = useState(
    package_type_val !== "all" ? package_type_val : "All"
  );
  const [centerType, setCenterType] = useState(0);
  const emptyPackage: Package[] = [
    {
      label: "No Packages Found",
      value: 0,
      min_price: 0,
      max_price: 0,
      num_of_days: 0,
    },
  ];

  const getPreReq = async () => {
    const gymId = await retrieveGymId();
    try {
      const resp = await AxiosPrivate.get(
        `/api/member/add-member-prerequisites/?gym_id=${gymId}`
      ).then((res) => {
        console.log(res.data);
        res.data.favorite_batches.map((group: any) => ({
          label: group.name,
          value: group.id,
          capacity: group.capacity,
          live_member_count: group.live_member_count,
          start_time: group.start_time,
          end_time: group.end_time,
        }));
      });
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePackageType = (value: string) => {
    setPackageType((prevPackageType) => {
      const newPackageType =
        prevPackageType.toLowerCase() === value.toLowerCase() ? "" : value;
      fetchPackages(newPackageType);
      return newPackageType;
    });
  };

  const getPoints = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/spending-points/?gym_id=${gymId}&member_id=${member_id}`,
        {
          id: newID(`points-${member_id}`),
        }
      );
      setPointsInfo(resp.data.success);
    } catch (error: any) {
      console.log(error.response.data.error);
      setPointErr(error.response.data.error);
    }
  };
  useEffect(() => {
    getPoints();
  }, [member_id]);

  useEffect(() => {
    if (usedPoints > pointsInfo?.member_points) {
      setPointError("Points Exceeds Available Points");
    } else if (usedPoints > pointsInfo?.max_redeem_in_points) {
      setPointError("Points Exceeds Redeem Limit");
    } else if (usedPoints < 0) {
      setPointError("Enter valid Points...");
    } else {
      setPointError("");
    }
  }, [usedPoints]);

  useEffect(() => {
    if (usePoints === true) {
      if (usedPoints && !pointError.length) {
        setDiscount((prev) => ({
          ...prev,
          value: usedPoints * (pointsInfo?.conversion_ratio || 0),
        }));
      } else {
        setDiscount((prev) => ({
          ...prev,
          value: 0,
          type: "rupee",
        }));
      }
    } else {
      setPointError("");
      setUsedPoints(0);
      setDiscount((prev) => ({
        ...prev,
        value: 0,
      }));
    }
  }, [usedPoints, usePoints]);

  const calculateDiscount = (): number => {
    if (!renewalDetails.offer_price) return 0;
    let prevFee = "0";
    // if (renewalDetails.enrollment_fee_id) {
    //   prevFee = enrollmentList.find(
    //     (fee) => fee.value === renewalDetails.enrollment_fee_id
    //   )?.amount;
    // }
    if (discount.type === "rupee") {
      return Math.min(discount.value || 0, renewalDetails.offer_price);
    } else {
      return Math.min(
        (renewalDetails.offer_price * discount.value || 0) / 100,
        renewalDetails.offer_price
      );
    }
  };

  const calculateTaxes = (): number => {
    if (!applyTaxes || !renewalDetails.offer_price) return 0;
    const taxableAmount = renewalDetails.offer_price - calculateDiscount();
    return taxableAmount * 0.18; // 18% GST
  };

  const calculateSubTotal = (): number => {
    if (!renewalDetails.offer_price) return 0;
    return renewalDetails.offer_price - calculateDiscount();
  };

  const calculateActualAmount = (): number => {
    const subTotal = calculateSubTotal();
    const taxes = calculateTaxes();
    return subTotal + taxes;
  };

  function renderEmpty(option: Package) {
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
      console.log(packageData);
      setPackages(packageData);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error(
        "Something went wrong while fetching packages. Please try again."
      );
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
    if (new Date(end_date).getTime() < new Date().getTime()) {
      setRenewalDetails((prev) => ({
        ...prev,
        start_date: new Date().toISOString().split("T")[0],
      }));
    } else {
      setRenewalDetails((prev) => ({
        ...prev,
        start_date: new Date(new Date(end_date).getTime() + 86400000)
          .toISOString()
          .split("T")[0],
      }));
    }
    fetchPackages(packageType);
    fetchPaymentModes();
    getPreReq();
  }, []);

  useEffect(() => {
    fetchPackages(packageType);
    setRenewalDetails((prev) => {
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
          resp.data.map((mode: any) => ({ label: mode.name, value: mode.id }))
        );
      }
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      toast.error(
        "Something went wrong while fetching payment modes. Please try again."
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRenewalDetails((prev) => {
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

      // setValidationErrors((prev) => ({ ...prev, [name]: "" }));
      return updatedData;
    });
  };

  useEffect(() => {
    if (isFullPay === "yes") {
      setRenewalDetails((prev) => ({
        ...prev,
        paid_amount: calculateActualAmount(),
      }));
      setShowDueDate(false);
    }
  }, [
    renewalDetails.offer_price,
    discount.value,
    discount.type,
    applyTaxes,
    isFullPay,
  ]);

  const handleSelectChange = (
    name: string,
    option: Package | Option | null
  ) => {
    // setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "package_id" && option && "min_price" in option) {
      setSelectedPackage(option);
      setRenewalDetails((prev) => {
        const maxPrice = option.max_price + 0;
        const updatedDetails = {
          ...prev,
          [name]: option.value,
          title: option.label,
          offer_price: maxPrice,
          due_date: null,
          actual_amount: calculateActualAmount(), // Recalculate with potential discount
        };
        return updatedDetails;
      });
      setPriceError(null);
    } else {
      setRenewalDetails((prev) => ({ ...prev, [name]: option?.value ?? null }));
    }
  };

  const actualAmount = useMemo(() => {
    const subTotal = calculateSubTotal();
    const taxes = calculateTaxes();
    return subTotal + taxes;
  }, [renewalDetails.offer_price, discount.value, discount.type, applyTaxes]);

  const validateField = (name: string, value: any) => {
    let error = "";
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
          value === null || value === ""
            ? "Paid amount is required"
            : parseFloat(value) < 0
              ? "Paid amount cannot be negative"
              : "";
        break;
      case "payment_mode_id":
        error = !value ? "Payment mode is required" : "";
        break;
      case "due_date":
        if (showDueDate && !value) {
          error = "Due date is required when paid amount is less than price";
        }
        break;
      case "start_date":
        error = !value ? "Start date is required" : "";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: ValidationErrors = {};

    Object.entries(renewalDetails).forEach(([key, value]) => {
      validateField(key, value);
      if (errors[key as keyof ValidationErrors]) {
        newErrors[key as keyof ValidationErrors] =
          errors[key as keyof ValidationErrors];
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const UpdatePoints = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/spending-points/?gym_id=${gymId}`,
        {
          used: usedPoints,
          member_id: member_id,
          rule: "Renew Membership",
          note: ` Redeemed ${usedPoints} points in Renewal`,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const renewMembership = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    if (priceError) {
      toast.error(priceError);
      return;
    }
    try {
      setLock(true);
      let renewalData = {
        ...renewalDetails,
        discounted_amount: calculateDiscount().toString(),
        actual_amount: calculateActualAmount().toString(),
      };
      console.log(renewalData);
      if (endDate !== null) {
        renewalData = {
          ...renewalData,
          end_date: dayjs(new Date(endDate)).format("YYYY-MM-DD"),
          session_allocated: dayjs(new Date(endDate))
            .diff(dayjs(new Date(renewalData.start_date!)), "days")
            .toString(),
        };
      }
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.post(
        `/api/renew-membership/${membershipId}/?gym_id=${gymId}`,
        renewalData
      ).then(async (resp) => {
        // console.log(resp);
        if (
          usePoints &&
          usedPoints &&
          !pointError &&
          usedPoints * (pointsInfo?.conversion_ratio || 0) === discount.value
        ) {
          await UpdatePoints();
        }
        invalidateAll();
        toast.success("Membership successfully renewed!");
        onUpdate();
        setLock(false);
      });
    } catch (error) {
      console.error("Error renewing membership:", error);
      toast.error(
        "Something went wrong while renewing membership. Please try again."
      );
    }
  };

  useEffect(() => {
    const duration = selectedPackage?.num_of_days || "";
    console.log(duration);
    setEndDate(
      dayjs(renewalDetails.start_date ?? new Date())
        .add(duration || 1, "days")
        .format("YYYY-MM-DD")
    );
  }, [renewalDetails.start_date, renewalDetails.package_id, selectedPackage]);

  function renderOptionDisplayValue(option: Package) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex items-center gap-1">
          <Text>{`Price Range ( ${demographiInfo?.currency_symbol} ) : `}</Text>
          <Text>
            {option.min_price} - {option.max_price}
          </Text>
        </div>
      </div>
    );
  }

  const closeModal = () => {
    setRenewalDetails({
      package_id: null,
      offer_price: null,
      paid_amount: null,
      // payment_mode: null,
      due_date: null,
      start_date: null,
      actual_amount: null,
      payment_mode_id: null,
    });
    setErrors({});
    setPriceError(null);
    setSelectedPackage(null);
    onUpdate();
  };

  return (
    <>
      <Drawer isOpen={func === "Renew"} onClose={closeModal} size="lg">
        <div className="m-auto p-6 md:p-8 h-full  max-h-[99%] overflow-y-auto custom-scrollbar ">
          <div className="flex items-center justify-between mb-4">
            <Title as="h4" className="">
              Renew Membership
            </Title>
            <Button variant="text" onClick={closeModal}>
              <XIcon className="h-8 w-8 " />
            </Button>
          </div>
          <div className="h-full flex flex-col justify-between">
            <div className="w-full p-4 bg-primary-lighter dark:bg-gray-200 rounded-lg shadow">
              <div className="flex flex-row gap-2 items-center">
                <Text className="text-sm">Please Note</Text>
                <IoWarningOutline className="animate-pulse" size={16} />
              </div>
              <ul className="flex flex-col items-stretch gap-3 px-4 pt-2 list-disc text-xs font-medium">
                <li>
                  Renewing a membership allows the member to continue the same
                  plan after the current one ends. You can also change
                  Membership Plan type according to member demands.
                </li>
                <li>
                  {`If member has live membership plan going on, On Renewing it
                  would create a "Upcoming Membership" plan that will start once
                  current plan ends automatically.`}
                </li>
                {/* <li>This action is irreversible.</li> */}
              </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2  px-4 py-4 gap-5">
              <div className="grid grid-cols-1 gap-1.5 col-span-full">
                <Text className="font-medium ">Package Type *</Text>
                {/* <RadioGroup
                  value={packageType}
                  setValue={(value) => {
                    if (
                      package_type_val === "all" ||
                      package_type_val === value
                    ) {
                      setPackageType(value);
                    } else {
                      toast.error(
                        "Package Type can't be Changed When Filtered by Package Type"
                      );
                    }
                  }}
                  className={` grid md:grid-cols-3 gap-4 `}
                >
                  {metricData.map((metric, index) => (
                    <AdvancedRadio
                      key={index}
                      value={metric.value}
                      className="max-w-[60] group"
                    >
                      <div
                        className={`flex items-center min-h-full min-w-full justify-between ${package_type_val !== "all" ? "group-hover:text-primary" : ""} ${packageType === metric.value ? "text-primary" : ""}`}
                      >
                        {metric.icon}
                        <CircleCheck
                          size={18}
                          className={`${packageType === metric.value ? "text-primary" : "hidden"}`}
                        />
                      </div>
                      <Text className=" mt-1 text-[13px] text-nowrap text-clip ">
                        {metric.title}
                      </Text>
                    </AdvancedRadio>
                  ))}
                </RadioGroup> */}
                <div className="relative flex w-full items-center overflow-hidden">
                  <Button
                    title="Prev"
                    variant="text"
                    ref={sliderPrevBtn}
                    onClick={scrollToTheLeft}
                    className="!absolute -left-1 top-0 z-10 !h-full w-10 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 "
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
                        // If clicking the same option, deselect it (set to empty)
                        if (value === packageType) {
                          setPackageType("");
                          // fetchMemberships(1, filters, "");
                          fetchPackages("");
                        } else {
                          setPackageType(value);
                          // handlePackageType(value);
                          fetchPackages(value);
                        }
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
                          {/* {packageType === metric.value && (
                            <XIcon
                              size={18}
                              className="absolute -top-4 right-2 z-[99999] text-primary cursor-pointer hover:scale-110 hover:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePackageType("");
                              }}
                            />
                          )} */}
                          <div className="flex flex-row items-center gap-2 transition-all duration-200 ">
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
                  value={
                    packages.find(
                      (pkg) => pkg.value === renewalDetails.package_id
                    )?.label
                  }
                  onChange={(option: Package | null) =>
                    handleSelectChange("package_id", option)
                  }
                  labelClassName=""
                  getOptionDisplayValue={(option) =>
                    packages.length
                      ? renderOptionDisplayValue(option)
                      : renderEmpty(option)
                  }
                  // labelClassName=""
                  // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                />
                {/* {validationErrors.package_id && (
                  <p className="text-xs text-red-500">
                    {validationErrors.package_id}
                  </p>
                )} */}
              </div>

              <div className="grid grid-cols-1 gap-0.5">
                <Input
                  label="Amount * "
                  name="offer_price"
                  type="number"
                  placeholder="Enter Price"
                  readOnly
                  prefix={
                    <Text className="text-primary">
                      {demographiInfo?.currency_symbol || " "}
                    </Text>
                  }
                  value={renewalDetails.offer_price?.toString() || ""}
                  onChange={handleInputChange}
                  labelClassName=""
                />
              </div>
              <Text className="text-sm col-span-full">
                ( The Member Points Will be added to Discount as per the
                Convertion Rate )
              </Text>
              <Checkbox
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                label="Use Member Points"
                labelClassName="pl-2"
              />

              <div className="col-span-full">
                <div className="w-full grid grid-cols-2 gap-4 items-center">
                  {usePoints ? (
                    pointErr.includes("Settings not found") ? (
                      <>
                        <Text>{`Points Settings Wasn't Configured`}</Text>
                        <Link href={`/loyalty-settings`}>
                          <Button className="scale-95">
                            Configure to Use Points
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="col-span-full grid grid-cols-3 p-2">
                          <div className="flex flex-row items-center gap-2">
                            <Text>Available Points :</Text>
                            <Text className="text-primary font-bold">
                              {pointsInfo?.member_points || 0}
                            </Text>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <Text>Max Redeem Limit :</Text>
                            <Text className="text-primary font-bold">
                              {pointsInfo?.max_redeem_in_points || 0}
                            </Text>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <Text>Convertion Rate :</Text>
                            <Text className="text-primary font-bold">
                              {pointsInfo?.conversion_ratio || 0}
                            </Text>
                          </div>
                        </div>
                        <div className="relative">
                          <Input
                            label="Points Used"
                            name="points_used"
                            type="number"
                            placeholder="Enter Points"
                            prefix={
                              <RiCopperCoinFill
                                className="text-primary"
                                size={20}
                              />
                            }
                            max={pointsInfo?.max_redeem_in_points || 0}
                            value={usedPoints}
                            onChange={(e) =>
                              setUsedPoints(parseInt(e.target.value))
                            }
                            labelClassName=""
                            error={pointError}
                          />
                          {/* <p className="absolute top-full">
                        {
                          pointError
                        }
                      </p> */}
                        </div>
                        <Text className="self-end place-items-center mb-2 text-[15px] font-semibold">
                          {pointsInfo?.conversion_ratio || 0} x{" "}
                          {usedPoints || "_"} ={" "}
                          <Badge
                            variant="flat"
                            className="text-[15px] py-1 px-1.5"
                          >
                            {demographiInfo?.currency_symbol || " "}{" "}
                            {usedPoints * pointsInfo?.conversion_ratio || 0}
                          </Badge>
                        </Text>
                      </>
                    )
                  ) : null}
                </div>
              </div>
              {/* <div className="grid grid-cols-1 gap-1.5 ">
                <Text className="font-medium ">Start Date * </Text>
                <DatePicker
                  name="start_date"
                  // value={renewalDetails.start_date || ""}
                  // onChange={(date: any) =>
                  //   setRenewalDetails((prev) => ({
                  //     ...prev,
                  //     start_date: new Date(date.getTime() + 86400000)
                  //       .toISOString()
                  //       .split("T")[0],
                  //   }))
                  // }
                  value={
                    renewalDetails.start_date
                      ? formateDateValue(new Date(renewalDetails.start_date))
                      : ""
                  }
                  onChange={(date: any) =>
                    setRenewalDetails((prev) => ({
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
                  scrollableYearDropdown={true}
                  dateFormat="yyyy-MM-dd"
                  className="col-span-full sm:col-span-1"
                />
              </div> */}
              {/* {isCustomEnd ? (
                <div className="grid md:grid-cols-2 gap-2 md:gap-4 items-end col-span-full">
                  <div className="grid grid-cols-1 gap-1.5 ">
                    <div className="flex flex-row gap-2 items-center">
                      <Text className="font-medium space-x-4">
                        Start Date *
                      </Text>

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
                        renewalDetails.start_date
                          ? formateDateValue(
                              new Date(renewalDetails.start_date)
                            )
                          : ""
                      }
                      onChange={(date: any) =>
                        setRenewalDetails((prev) => ({
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
                          formateDateValue(
                            new Date(date.getTime()),
                            "YYYY-MM-DD"
                          )
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
                      renewalDetails.start_date
                        ? formateDateValue(new Date(renewalDetails.start_date))
                        : ""
                    }
                    onChange={(date: any) =>
                      setRenewalDetails((prev) => ({
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
              <div className="grid md:grid-cols-2 gap-2 md:gap-4 items-end col-span-full">
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
                      renewalDetails.start_date
                        ? formateDateValue(new Date(renewalDetails.start_date))
                        : ""
                    }
                    onChange={(date: any) =>
                      setRenewalDetails((prev) => ({
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
              <div className="grid grid-cols-1 gap-1 relative mt-auto">
                <Switch
                  value={discount.type}
                  size="md"
                  checked={discount.type === "percentage"} // Use checked prop instead of value
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
                  labelClassName=""
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
                    renewalDetails.offer_price
                      ? renewalDetails.offer_price - calculateDiscount()
                      : 0
                  }
                  show={applyTaxes}
                  handleApplyTaxes={handleApplyTaxesChange}
                  symbol={demographiInfo?.currency_symbol || ""}
                />
              </div>
              <div className="grid grid-cols-1 gap-1">
                <Input
                  label="Total Amount"
                  name="subTotal"
                  type="number"
                  labelClassName=""
                  value={calculateActualAmount().toFixed(2)}
                  prefix={
                    <Text className="text-primary">
                      {demographiInfo?.currency_symbol || " "}
                    </Text>
                  }
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 gap-1 relative">
                <Switch
                  value={isFullPay}
                  size="sm"
                  label="Full Payment"
                  onChange={() => {
                    if (isFullPay === "yes") {
                      setIsFullPay("no");
                      setRenewalDetails((prev) => ({
                        ...prev,
                        paid_amount: null,
                      }));
                      setShowDueDate(true);
                    } else {
                      setIsFullPay("yes");
                      setRenewalDetails((prev) => ({
                        ...prev,
                        paid_amount: calculateActualAmount(),
                        due_date: null,
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
                  value={renewalDetails.paid_amount?.toString() || ""}
                  onChange={handleInputChange}
                  labelClassName=""
                />

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
                    (mode) => mode?.value === renewalDetails.payment_mode_id
                  )}
                  // @ts-ignore
                  onChange={(option: Option | null) =>
                    handleSelectChange("payment_mode_id", option)
                  }
                  labelClassName=""
                  // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                  // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                />
                {/* {validationErrors.payment_mode_id && (
                  <p className="text-xs text-red-500">
                    {validationErrors.payment_mode_id}
                  </p>
                )} */}
              </div>
              {showDueDate && (
                <div className="grid grid-cols-1 gap-1.5 ">
                  <Text className="font-medium ">Due Date * </Text>
                  <DatePicker
                    name="due_date"
                    // value={renewalDetails.due_date || ""}
                    // onChange={(date: any) =>
                    //   setRenewalDetails((prev) => ({
                    //     ...prev,
                    //     due_date: new Date(date.getTime() + 86400000)
                    //       .toISOString()
                    //       .split("T")[0],
                    //   }))
                    // }
                    value={
                      renewalDetails.due_date
                        ? formateDateValue(new Date(renewalDetails.due_date))
                        : ""
                    }
                    onChange={(date: any) =>
                      setRenewalDetails((prev) => ({
                        ...prev,
                        due_date: formateDateValue(
                          new Date(date.getTime()),
                          "YYYY-MM-DD"
                        ),
                      }))
                    }
                    placeholderText="Select Due Date"
                    showMonthDropdown={true}
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
            </div>
            <div className="mb-10 flex justify-evenly items-center">
              <Button
                variant="outline"
                onClick={closeModal}
                className="mr-2  hover:text-primary w-60"
              >
                Cancel
              </Button>
              <Button
                onClick={renewMembership}
                disabled={lock || priceError !== null}
                className="w-60"
              >
                {lock ? <Loader variant="threeDot" /> : "Renew"}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export const EditModal: React.FC<{
  member: number;
  func: "Edit" | "Pay" | "Renew" | "Restore" | null;
  onUpdate: () => void;
}> = ({ member, onUpdate, func }) => {
  const [data, setData] = useState<any>({});
  const [lock, setLock] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    data.member_image === undefined ? null : data.member_image
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));
  const [memberCategories, setMemberCategories] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [occupation, setOccupation] = useState<any[]>([]);
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
  const handleCameraCapture = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setValidationErrors((prev) => ({ ...prev, member_image: "" }));
  };
  const [batches, setBatches] = useState<any[]>([]);
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);
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
    getPreReq();
  }, []);

  // const checkBatches = (batch_id: string | number) => {
  //   const numericBatchId = Number(batch_id);

  //   const batch = batches.find((group) => group.value === numericBatchId);

  //   if (batch) {
  //     const currentCount = parseInt(
  //       batch.live_member_count.split("|")[0].trim()
  //     );

  //     if (currentCount === batch.capacity) {
  //       toast.success(
  //         "On Adding this Member, the capacity will be Increased to " +
  //           (batch.capacity + 1)
  //       );
  //     }
  //   }
  // };

  // function renderOptionDisplayValue(option: any) {
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
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/member/${member}/basic/?gym_id=${gymId}`,
          {
            id: newID(`member-profile-${member}`),
          }
        );

        const newData = response.data.data;
        setData({
          ...newData,
          batch_id: newData.batch?.id || null,
          category_id: newData.category?.id || null,
          end_date: newData.membership_details?.[0]?.end_date || null,
        });
        setImagePreview(newData.member_image);
      } catch (error) {
        console.error("Error fetching member data:", error);
        toast.error("Something went wrong while fetching member data");
      } finally {
        setLoading(false);
      }
    };

    if (func === "Edit") {
      fetchMemberData();
    }
  }, [member, func]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  const handlePhoneChange = (value: string) => {
    setData((prev: any) => ({ ...prev, phone: value }));
  };
  const validateMemberForm = (data: any): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Helper function to check if a field is empty
    const isEmpty = (value: any): boolean =>
      value === null || value === undefined || value === "";

    // Validate personal details
    // if (!data.member_image) errors.member_image = "Profile image is required";
    if (isEmpty(data.name)) errors.name = "Name is required";
    // if (isEmpty(data.email)) errors.email = "Email is required";
    if (data.email && !/\S+@\S+\.\S+/.test(data.email))
      errors.email = "Email is invalid";
    if (isEmpty(data.phone)) errors.phone = "Phone number is required";
    // if (isEmpty(data.date_of_birth))
    //   errors.date_of_birth = "Date of birth is required";
    // if (isEmpty(data.joining_date))
    //   errors.joining_date = "Joining date is required";
    // if (isEmpty(data.address_country))
    //   errors.address_country = "Country is required";

    return errors;
  };

  const handleEdit = async () => {
    const newData = {
      address_city: data.address_city,
      address_country: data.address_country,
      address_state: data.address_state,
      address_street: data.address_street,
      address_zip_code: data.address_zip_code,
      date_of_birth: data.date_of_birth,
      email: data.email,
      gender: data.gender,
      joining_date: data.joining_date,
      name: data.name,
      phone: data.phone,
      category_id: data?.category_id ? data.category_id.toString() : null,
      batch_id: data?.batch_id ? data.batch_id.toString() : null,
      // member_image: data.member_image, // Keep the existing image if no new image is uploaded
      emergency_contact: data.emergency_contact || null,
      emergency_contact_name: data.emergency_contact_name || null,
      occupation: data.occupation || null,
      qualification: data.qualification || null,
      colledge_or_school: data.colledge_or_school || null,
      martial_status: data.martial_status || null,
      reference_main: data.reference_main || null,
      parents_name: data.parents_name || null,
      parents_contact: data.parents_contact || null,
      with_parents: data.with_parents || null,
      remark: data.remarks || null,
      medical_history: data.medical_history || null,
      blood_group: data.blood_group || null,
      ig: data.ig || null,
    };
    const formData = new FormData();

    Object.entries(newData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "phone") {
          //@ts-ignore
          if (value.length) {
            const formattedPhone = value.startsWith("+") ? value : `+${value}`;
            formData.append(key, formattedPhone);
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });
    // Handle member_image separately

    if (imageFile !== null) {
      formData.append("member_image", imageFile);
    }
    if (data.membership_id) {
      formData.append("membership_id", data.membership_id.toString());
    }
    console.log(formData);
    try {
      setLock(true);
      const errors = validateMemberForm(newData);
      console.log(errors);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error("Please fill in all required fields correctly.");
        setLock(false);
        return;
      }
      setValidationErrors({});
      const gymid = await retrieveGymId();
      if (gymid) {
        formData.append("gym_id", gymid);
      }
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.put(
        `/api/member/${member}/?gym_id=${gymId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      invalidateAll();
      toast.success("Member updated successfully");
      onUpdate();
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Something went wrong while updating member");
    }
    setLock(false);
  };
  return (
    <>
      <Drawer isOpen={func === "Edit"} onClose={() => onUpdate()} size="lg">
        <div className="p-8 m-auto overflow-y-auto flex flex-col h-full ">
          <div className="mb-7 flex items-center justify-between">
            <Title as="h4" className="">
              Edit Member
            </Title>
            <ActionIcon size="sm" variant="text" onClick={() => onUpdate()}>
              <X className="h-auto w-6 " strokeWidth={1.8} />
            </ActionIcon>
          </div>
          {loading ? (
            <div className="min-w-96 h-full flex  items-center justify-center">
              <Loader size="xl" variant="threeDot" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-y-6 gap-x-5 [&_label>span]:font-medium ">
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
                        className="max-w-40"
                      >
                        {"Upload"}
                      </Button>
                      <Button
                        onClick={() => setShowCamera(true)}
                        variant="outline"
                        className="max-w-40"
                      >
                        Take Photo
                      </Button>
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="size-32 md:size-40 relative">
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
              <div className="grid grid-cols-1 gap-0.5">
                <Input
                  name="name"
                  label="Name *"
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
              <div className="grid grid-cols-1 gap-0.5">
                <Input
                  name="email"
                  label="Email *"
                  placeholder="Enter email"
                  value={data.email}
                  onChange={handleInputChange}
                  labelClassName=""
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-500">
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-0.5">
                <PhoneNumber
                  label="Phone Number *"
                  country="in"
                  value={data.phone}
                  onChange={handlePhoneChange}
                  className="font-medium"
                  labelClassName=""
                />
                {validationErrors.phone && (
                  <p className="text-xs text-red-500">
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              {/* <Input
                    name="date_of_birth"
                    type="date"
                    label="Date of Birth"
                    value={data.date_of_birth}
                    onChange={handleInputChange}
                  /> */}
              {/* <div className="grid grid-cols-1 gap-2 ">
                <Text className="font-medium ">Date of Birth * </Text>
                <DatePicker
                  name="date_of_birth"
                  value={
                    data.date_of_birth
                      ? formateDateValue(new Date(data.date_of_birth))
                      : ""
                  }
                  onChange={(date: any) =>
                    setData((prev: any) => ({
                      ...prev,
                      date_of_birth: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }))
                  }
                  placeholderText="Select Date of Birth"
                  showMonthDropdown={true}
                  scrollableYearDropdown={true}
                  maxDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 5)
                    )
                  }
                  yearDropdownItemNumber={50}
                  dateFormat="yyyy-MM-dd"
                  className="col-span-full sm:col-span-1"
                />
              </div> */}
              <Input
                name="date_of_birth"
                type="date"
                label="Date of Birth"
                value={data.date_of_birth ?? ""}
                onChange={(e) => {
                  setData((prev: any) => ({
                    ...prev,
                    date_of_birth: e.target.value,
                  }));
                }}
                placeholder="Enter Date of Birth"
              />
              <div className="grid grid-cols-1 gap-2 ">
                <Text className="font-medium ">Joining Date * </Text>
                <DatePicker
                  name="joining_date"
                  // value={data.joining_date || ""}
                  // onChange={(date: any) =>
                  //   setData((prev: any) => ({
                  //     ...prev,
                  //     joining_date: new Date(date.getTime() + 86400000)
                  //       .toISOString()
                  //       .split("T")[0],
                  //   }))
                  // }
                  value={
                    data.joining_date
                      ? formateDateValue(new Date(data.joining_date))
                      : ""
                  }
                  onChange={(date: any) =>
                    setData((prev: any) => ({
                      ...prev,
                      joining_date: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }))
                  }
                  placeholderText="Select Joining Date"
                  showMonthDropdown={true}
                  scrollableYearDropdown={true}
                  dateFormat="yyyy-MM-dd"
                  className="col-span-full sm:col-span-1"
                />
              </div>
              <Select
                name="gender"
                label="Gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ]}
                value={
                  data.gender
                    ? data.gender[0]?.toUpperCase() + data.gender?.slice(1)
                    : ""
                }
                onChange={({ value }: { label: string; value: string }) =>
                  setData((prev: any) => ({ ...prev, gender: value }))
                }
                labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                clearable
                onClear={() =>
                  setData((prev: any) => ({ ...prev, gender: "" }))
                }
              />
              <Select
                label="Member Category "
                name="category_id"
                options={memberCategories}
                value={
                  memberCategories.find(
                    (cat) => cat.value === data?.category_id
                  )?.label || ""
                }
                onChange={({ value }: { label: string; value: string }) =>
                  setData((prev: any): any => ({
                    ...prev,
                    category_id: parseInt(value),
                  }))
                }
                // onChange={({value}:{label:string,value:string}) => handleSelectChange("category_id", option)}
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                clearable
                onClear={() =>
                  setData((prev: any) => ({ ...prev, category_id: null }))
                }
              />
              <Select
                label="Batches "
                name="batch_id"
                options={
                  batches.length
                    ? batches
                    : [{ label: "Empty", value: "empty" }]
                }
                value={
                  batches.find((group: any) => group.value === data.batch_id)
                    ?.label || ""
                }
                onChange={({ value }: { label: string; value: string }) => {
                  checkBatches(value);
                  setData((prev: any) =>
                    prev ? { ...prev, batch_id: parseInt(value) } : null
                  );
                }}
                getOptionDisplayValue={(option) =>
                  batches.length
                    ? renderOptionDisplayBatch(option)
                    : renderEmptyBatch()
                }
                // onChange={(option: Option | null) => handleSelectChange("batch_id", option)}
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                clearable
                onClear={() =>
                  setData((prev: any) => ({ ...prev, batch_id: null }))
                }
              />
              <Select
                label="Occupation"
                name="occupation"
                options={occupation}
                value={data?.occupation}
                onChange={(option: Option | null) =>
                  setData((prev: any) => ({
                    ...prev,
                    occupation: option?.value,
                  }))
                }
                clearable
                onClear={() =>
                  setData((prev: any) => ({ ...prev, occupation: null }))
                }
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
              <Input
                label="Qualification"
                name="qualification"
                placeholder="Enter Educational Qualification"
                value={data.qualification || ""}
                onChange={handleInputChange}
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
                value={data?.blood_group}
                onChange={(option: Option | null) =>
                  setData((prev: any) => ({
                    ...prev,
                    blood_group: option?.value,
                  }))
                }
                clearable
                onClear={() =>
                  setData((prev: any) => ({ ...prev, blood_group: null }))
                }
              />
              <Input
                label="Emergency Contact Name"
                name="emergency_contact_name"
                placeholder="Emergency Contact Person"
                value={data.emergency_contact_name || ""}
                onChange={handleInputChange}
              />
              <PhoneNumber
                label="Emergency Contact Number"
                country={
                  data?.address_country?.length > 0
                    ? COUNTRY_MAPPINGS[
                        data.address_country
                      ]?.code?.toLowerCase() || "in"
                    : "in"
                }
                value={data.emergency_contact || ""}
                onChange={(value) =>
                  setData((prev: any) => ({
                    ...prev,
                    emergency_contact: value,
                  }))
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
                value={data.martial_status}
                onChange={(option: Option | null) =>
                  setData((prev: any) => ({
                    ...prev,
                    martial_status: option?.value,
                  }))
                }
                clearable
                onClear={() =>
                  setData((prev: any) => ({ ...prev, martial_status: null }))
                }
              />
              <div className="flex items-center gap-4 px-4">
                <Text>Living with Parents</Text>
                <Switch
                  // label="Living with Parents"
                  name="with_parents"
                  checked={data.with_parents || false}
                  onChange={(e) =>
                    setData((prev: any) => ({
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
                value={data.parents_name || ""}
                onChange={handleInputChange}
              />
              <PhoneNumber
                label="Parent's Contact"
                country={
                  data?.address_country?.length > 0
                    ? COUNTRY_MAPPINGS[
                        data.address_country
                      ]?.code?.toLowerCase() || "in"
                    : "in"
                }
                value={data.parents_contact || ""}
                onChange={(value) =>
                  setData((prev: any) => ({ ...prev, parents_contact: value }))
                }
              />
              <Input
                label="Medical History"
                name="medical_history"
                placeholder="Enter Medical History/Conditions"
                value={data.medical_history || ""}
                onChange={handleInputChange}
              />
              <Input
                label="Reference"
                name="reference_main"
                placeholder="How did you hear about us?"
                value={data.reference_main || ""}
                onChange={handleInputChange}
              />
              <Input
                label="Remarks"
                name="remarks"
                placeholder="Any additional remarks"
                value={data.remarks || ""}
                onChange={handleInputChange}
              />
              <Input
                label="Instagram Handle"
                name="ig"
                placeholder="@username"
                value={data.ig || ""}
                onChange={handleInputChange}
                prefix={<FaInstagram size={20} />}
              />
              <Input
                name="address_street"
                label="Address"
                placeholder="Address"
                // className="col-span-full"
                value={data.address_street}
                onChange={handleInputChange}
                labelClassName=""
              />
              {/* <Input
                    name="address_state"
                    label="State"
                    placeholder="State"
                    value={data.address_state}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="address_city"
                    label="City"
                    placeholder="City"
                    value={data.address_city}
                    onChange={handleInputChange}
                  /> */}
              <Select
                label="Country"
                value={data.address_country}
                options={countryOptions}
                onChange={(selectedValue: string) =>
                  setData((prev: any) => {
                    return { ...prev, address_country: selectedValue };
                  })
                }
                getOptionValue={(option) => option.value}
                className="col-span-full sm:col-span-1"
                clearable
                onClear={() =>
                  setData((prev: any) => {
                    return { ...prev, address_country: "" };
                  })
                }
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
              <Input
                name="address_zip_code"
                label="ZIP / Postcode"
                placeholder="ZIP / postcode"
                value={data.address_zip_code}
                onChange={handleInputChange}
                labelClassName=""
              />
            </div>
          )}
          <div className="my-6 flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => onUpdate()}
              className=" w-40"
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={handleEdit}
              disabled={lock}
              className="w-40"
            >
              {lock ? <Loader variant="threeDot" /> : "Update"}
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

export const PaymentModal: React.FC<{
  membershipid: string;
  func: "Edit" | "Pay" | "Renew" | "Restore" | null;
  onUpdate: () => void;
}> = ({ membershipid, func, onUpdate }) => {
  const [lock, setLock] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [paymentInput, setPaymentInput] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentModeId: null as number | null,
    newDueDate: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [demographiInfo, setDemographicInfo] = useState<any>(null);
  useEffect(() => {
    async function getInfo() {
      const infoData = await retrieveDemographicInfo();
      console.log(infoData);
      setDemographicInfo(infoData);
    }
    getInfo();
  }, []);
  const getData = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/get-membership/${membershipid}/?gym_id=${gymId}`,
        {
          id: newID(`membership-${membershipid}`),
        }
      );
      console.log("membership");
      console.log(resp);
      const transformedData = {
        created_at: resp.data.created_at,
        due: resp.data.due,
        due_date: resp.data.due_date,
        end_date: resp.data.end_date,
        gym_id: resp.data.gym_details.id,
        gym_name: resp.data.gym_details.name,
        id: resp.data.id,
        member_id: resp.data.member_details.id,
        member_name: resp.data.member_details.name,
        member_phone: resp.data.member_details.phone,
        membership_id: resp.data.id,
        offer_price: resp.data.offer_price,
        package_id: resp.data.package_details.id,
        package_name: resp.data.package_details.name,
        paid_amount: resp.data.paid_amount,
        start_date: resp.data.start_date,
      };
      const today = dayjs();
      const currentDueDate = transformedData?.due_date
        ? dayjs(transformedData.due_date)
        : today;
      const nextDueDate = today.isAfter(currentDueDate)
        ? today.add(1, "day")
        : currentDueDate.add(1, "day");

      setPaymentInput((prev) => ({
        ...prev,
        amount: transformedData?.due.toString() || "",
        newDueDate: nextDueDate.format("YYYY-MM-DD"),
      }));
      setPaymentDetails(transformedData);
      console.log(transformedData);
    } catch (error) {
      console.error("Error fetching membership details:", error);
    }
  };

  const fetchPaymentModes = useCallback(async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/payment-modes/list_favorite/?gym_id=${gymId}`
      );
      console.log("PaymentModes");

      console.log(response);
      setPaymentModes(
        response.data.map((mode: any) => ({
          label: mode.name,
          value: mode.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching payment modes:", error);
    }
  }, []);

  useEffect(() => {
    getData();
    fetchPaymentModes();
  }, [fetchPaymentModes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInput((prev) => ({ ...prev, [name]: value }));

    if (name === "amount") {
      validateAmount(value);
    }
  };

  const validateAmount = (value: string) => {
    if (value === "" || isNaN(parseFloat(value))) {
      setErrorMessage("");
    } else if (parseFloat(value) > paymentDetails.due) {
      setErrorMessage("Amount cannot exceed the due amount");
    } else if (parseFloat(value) < 0) {
      setErrorMessage("Amount cannot be negative");
    } else {
      setErrorMessage("");
    }
  };

  const handleSelectChange = (option: PaymentMode | null) => {
    setPaymentInput((prev) => ({
      ...prev,
      paymentModeId: option?.value || null,
    }));
  };

  const initiatePayment = async () => {
    try {
      setLock(true);
      const newData = {
        amount: parseInt(paymentInput.amount),
        paid_amount: paymentDetails.paid_amount + parseInt(paymentInput.amount),
        payment_date: paymentInput.date,
        payment_mode: paymentInput.paymentModeId,
        due_date:
          parseFloat(paymentInput.amount) < paymentDetails.due
            ? paymentInput.newDueDate
            : paymentDetails.due_date,
      };
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.patch(
        `/api/memberships/${paymentDetails.membership_id}/pay/?gym_id=${gymId}`,
        newData
      );
      if (response.status === 200) {
        invalidateAll();
        getData();
        toast.success("Payment successful");
      }
      onUpdate();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Something went wrong while making payment");
    }
    setLock(false);
  };

  const isPaymentValid = () => {
    const { amount, date, paymentModeId, newDueDate } = paymentInput;
    const amountFloat = parseFloat(amount);
    return (
      amount &&
      amountFloat > 0 &&
      amountFloat <= paymentDetails.due &&
      date &&
      paymentModeId !== null &&
      (amountFloat >= paymentDetails.due || newDueDate)
    );
  };

  return (
    <div>
      <Drawer
        isOpen={func === "Pay"}
        onClose={() => onUpdate()}
        // containerClassName="dark:bg-gray-800 dark:border-gray-700 "
      >
        <div className="m-auto p-6 md:p-8 h-full">
          {paymentDetails !== null ? (
            <>
              <div className="flex items-center justify-between mb-4 ">
                <Title as="h4" className="">
                  Payment
                </Title>
                <Button variant="text" onClick={() => onUpdate()}>
                  <XIcon className="size-6 " />
                </Button>
              </div>
              <div className="flex flex-col justify-between h-full">
                <div className="grid gap-4 items-center ">
                  <Text className="font-bold ">
                    Due Amount:{" "}
                    <span className="text-primary font-bold text-lg ml-2 mt-1">
                      {" "}
                      {demographiInfo?.currency_symbol} {paymentDetails?.due}
                    </span>
                  </Text>
                  <Text className="font-bold ">
                    Current Due Date:{" "}
                    <span
                      className={`ml-2 ${new Date().getTime() > new Date(paymentDetails?.due_date || "").getTime() ? "text-red-400" : "text-green-400"}`}
                    >
                      <DateCell
                        date={paymentDetails?.due_date}
                        timeClassName="hidden"
                        dateFormat={getDateFormat()}
                        className="inline-block "
                        // dateClassName="dark:text-gray-300"
                      />
                    </span>
                  </Text>
                  <Input
                    label="Amount"
                    name="amount"
                    placeholder="Enter amount"
                    value={paymentInput.amount}
                    onChange={handleInputChange}
                    labelClassName=""
                    prefix={
                      <Text className="text-primary">
                        {demographiInfo?.currency_symbol}
                      </Text>
                    }
                  />
                  {errorMessage && (
                    <Text className="text-red-500">{errorMessage}</Text>
                  )}
                  {/* <DatePicker
                    // type="date"
                    label="Payment Date"
                    name="date"
                    value={paymentInput.date}
                    onChange={handleInputChange}
                    labelClassName=""
                  /> */}
                  <div>
                    <label htmlFor="date" className="block mb-1.5 font-medium ">
                      Payment Date *
                    </label>
                    <DatePicker
                      // type="date"
                      // label=""
                      name="date"
                      // value={paymentInput.date}
                      // onChange={(date: any) =>
                      //   setPaymentInput((prev) => ({
                      //     ...prev,
                      //     date: new Date(date.getTime() + 86400000)
                      //       .toISOString()
                      //       .split("T")[0],
                      //   }))
                      // }
                      value={
                        paymentInput.date
                          ? formateDateValue(new Date(paymentInput.date))
                          : ""
                      }
                      onChange={(date: any) =>
                        setPaymentInput((prev) => ({
                          ...prev,
                          date: formateDateValue(
                            new Date(date.getTime()),
                            "YYYY-MM-DD"
                          ),
                        }))
                      }
                      showMonthDropdown={true}
                      scrollableYearDropdown={true}
                      yearDropdownItemNumber={50}
                      minDate={new Date()}
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  <Select
                    label="Payment Mode *"
                    options={paymentModes}
                    //@ts-ignore
                    value={paymentModes.find(
                      (mode) => mode.value === paymentInput.paymentModeId
                    )}
                    onChange={handleSelectChange}
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                  {parseFloat(paymentInput.amount) < paymentDetails?.due && (
                    <div>
                      <label
                        htmlFor="newDueDate"
                        className="block mb-1.5 font-medium "
                      >
                        Next Due Date *
                      </label>
                      <DatePicker
                        // type="date"
                        // label=""
                        name="newDueDate"
                        // value={paymentInput.newDueDate}
                        // onChange={(date: any) =>
                        //   setPaymentInput((prev) => ({
                        //     ...prev,
                        //     newDueDate: new Date(date.getTime() + 86400000)
                        //       .toISOString()
                        //       .split("T")[0],
                        //   }))
                        // }
                        value={
                          paymentInput.newDueDate
                            ? formateDateValue(
                                new Date(paymentInput.newDueDate)
                              )
                            : ""
                        }
                        onChange={(date: any) =>
                          setPaymentInput((prev) => ({
                            ...prev,
                            newDueDate: formateDateValue(
                              new Date(date.getTime()),
                              "YYYY-MM-DD"
                            ),
                          }))
                        }
                        showMonthDropdown={true}
                        scrollableYearDropdown={true}
                        yearDropdownItemNumber={50}
                        minDate={new Date()}
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                  )}
                </div>
                <div className="w-full mb-10">
                  <Button
                    onClick={initiatePayment}
                    className="mt- w-full"
                    disabled={!isPaymentValid() || lock}
                  >
                    {lock ? <Loader variant="threeDot" /> : "Confirm Payment"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Loader className="mx-auto" variant="spinner" size="xl" />
          )}
        </div>
      </Drawer>
    </div>
  );
};

export const RestoreModal: React.FC<{
  id: string;
  onUpdate: () => void;
  type: string;
}> = ({ id, onUpdate, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [lock, setLock] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const getStatus = async () => {
      const resp = await isStaff();
      console.log("Staff:", resp);
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

    getStatus();
  }, [auth]);
  const handleRestore = async () => {
    try {
      setLock(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/${type.toLowerCase()}/${id}/restore/?gym_id=${gymId}`
      ).then(() => invalidateAll());
      toast.success("Restored Successfully ...");
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while Restoring " + type);
    }
    setLock(false);
  };

  return (
    <>
      <Button
        variant="text"
        onClick={() => {
          if (!auth) {
            toast.error("You are not Authorized");
            return;
          }
          if (!isValid) {
            toast.error("Please Subscribe to Proceed Further");
            router.push("/subscription/plans");
            return;
          }
          setIsOpen(true);
        }}
        className="flex flex-row gap-2 items-center justify-start font-medium hover:scale-105 duration-300"
      >
        <MdOutlineSettingsBackupRestore size={20} />
        <Text className={`${type === "Staff" ? "hidden" : ""}`}>Restore</Text>
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="m-auto px-7 pt-6 pb-8">
          <div className="flex flex-row justify-between items-center">
            <Title as="h4" className="mt my-3">{`Restore ${type}`}</Title>
            <XIcon
              className="h-6 w-6 cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
          </div>
          <p className="mb-4 font-medium">
            {`Are you sure you want to Restore this ${type} ?`}?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={handleRestore}>
              {lock ? <Loader variant="threeDot" /> : "Restore"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// export const DeleteModal: React.FC<{ id: string,onUpdate:()=>void;restore:boolean;type:string}> = ({ id,onUpdate,restore,type }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [lockDelete, setLockDelete] = useState(false);
//   const [lockFreeze,setLockFreeze]=useState(false);
//   const [auth, setAuth] = useState<boolean>(true);
//   const [showFreezeInfo, setShowFreezeInfo] = useState(false);
//   const [isValid, setIsValid] = useState(false);
//   const router=useRouter();

//   useEffect(() => {
//     const getStatus= async()=>{
//       const resp= await isStaff();
//       console.log("Staff:",resp);
//       setAuth(!resp);
//       checkUserAccess().then((status) => {
//         console.log(status);
//         if (status !== "Restricted") {
//           setIsValid(true);
//         } else {
//           setIsValid(false);
//         }
//       });
//     }
//     getStatus();
//   },[auth])
//   const handleDelete = async () => {
//     try {
//       setLockDelete(true);
//       await AxiosPrivate.delete(`/api/${type.toLowerCase()}/${id}/hard-delete/`).then(()=>invalidateAll() );
//       toast.success("Deleted Successfully ...");
//       setIsOpen(false);
//       onUpdate();
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to Delete "+type);
//     }
//     setLockDelete(false);
//   };
//   const handleSoftDelete = async () => {
//     try {
//       setLockFreeze(true);
//       const gymId = await retrieveGymId();
//       await AxiosPrivate.post(`/api/${type.toLowerCase()}/${id}/soft-delete/?gym_id=${gymId}`).then(()=>invalidateAll() );
//       toast.success("Deleted Successfully ...");
//       setIsOpen(false);
//       onUpdate();
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to Freeze "+type);
//     }
//     setLockFreeze(false);
//   };

//   return (
//     <>
//       <Button
//         variant="text"
//         onClick={() => {
//           if(!auth){
//             toast.error("You are not Authorized");
//             return;
//           }
//           if(!isValid){
//             toast.error("Please Subscribe to Proceed Further");
//             router.push('/centersettings/billing');
//             return;
//             }
//           setIsOpen(true)
//         }}
//         className="flex flex-row gap-2 items-center justify-start font-medium hover:scale-105 duration-300"
//       >
//         <MdDelete size={20} />
//         <Text className={`${type==="Staff"?'hidden':''}`}>Delete</Text>
//       </Button>
//       <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} containerClassName='dark:bg-gray-800 dark:border-gray-700'>
//         <div className="m-auto p-6 md:p-8">
//           <div className='flex flex-row justify-between items-center'>
//             <Title as="h3" className='my-3 '>Delete Member</Title>
//             <XIcon className="h-6 w-6 cursor-pointer " onClick={() => setIsOpen(false)} />
//           </div>
//           <p className="font-medium mb-2 ">{`Are you sure you want to delete this ${type}?`}</p>
//             <div className={`${showFreezeInfo?'':' opacity-0'} flex flex-row gap-2 flex-nowrap items-center transition-all duration-200 dark:text-gray-300`}>
//               <TbInfoTriangle size={32} className='peer' />
//               <Text className='text-xs'>This Deleted account will be seperated. You can still view and restore when needed.{type==="Member" && " Only Non Active Members can be Deleted"}</Text>
//             </div>
//           <div className="flex justify-end gap-3 mt-2">
//             {
//               !restore &&
//               (
//                 <Button variant="flat" onClick={handleSoftDelete}
//               disabled={lockFreeze || lockDelete}
//               onMouseEnter={() => setShowFreezeInfo(true)}
//               onMouseLeave={() => setShowFreezeInfo(false)}
//               >
//               {
//                 lockFreeze ?<Loader variant="threeDot" />:'Freeze'
//               }
//             </Button>)
//             }
//             <Button variant="solid" color="danger" onClick={handleDelete}
//             disabled={lockFreeze || lockDelete}
//             >
//               {
//                 lockDelete ?<Loader variant="threeDot" />:'Delete'
//               }
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// };

export const DeleteModal: React.FC<{
  id: string;
  onUpdate: () => void;
  type: string;
}> = ({ id, onUpdate, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lockDelete, setLockDelete] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getStatus = async () => {
      const resp = await isStaff();
      console.log("Staff:", resp);
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
    getStatus();
  }, [auth]);

  const handleDelete = async () => {
    try {
      setLockDelete(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/${type.toLowerCase()}/${id}/soft-delete/?gym_id=${gymId}`
      ).then(() => invalidateAll());
      toast.success(`${type} deleted successfully...`);
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete ${type}`);
    }
    setLockDelete(false);
  };

  return (
    <>
      <Button
        variant="text"
        onClick={() => {
          if (!auth) {
            toast.error("You are not Authorized");
            return;
          }
          if (!isValid) {
            toast.error("Please Subscribe to Proceed Further");
            router.push("/subscription/plans");
            return;
          }
          setIsOpen(true);
        }}
        className="flex hover:text-red-500 flex-row gap-2 items-center justify-start font-medium hover:scale-105 duration-300"
      >
        <MdDelete size={20} />
        <Text className={`${type === "Staff" ? "hidden" : ""}`}>Delete</Text>
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="m-auto p-6 md:p-8">
          <div className="flex flex-row justify-between items-center">
            <Title as="h4" className="my-3 ">
              Delete {type}
            </Title>
            <XIcon
              className="h-6 w-6 cursor-pointer "
              onClick={() => setIsOpen(false)}
            />
          </div>
          <p className="font-medium mb-4 ">{`Are you sure you want to delete this ${type}?`}</p>
          <div className="flex flex-row gap-2 flex-nowrap items-censtart  transition-all duration-200 ">
            <TbInfoTriangle size={20} className="peer" />
            <Text className="text-xs">You can restore it when needed</Text>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleDelete}
              disabled={lockDelete}
            >
              {lockDelete ? <Loader variant="threeDot" /> : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export function ExtendModal({
  membershipId,
  due_date,
  onUpdate,
  isDue = true,
}: {
  membershipId: string;
  due_date: string;
  onUpdate: () => void;
  isDue?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(isDue);
  const [lock, setLock] = useState(false);
  const [date, setDate] = useState("");

  useEffect(() => {
    // Calculate the next due date when the component mounts
    calculateNextDueDate();
  }, []);

  const calculateNextDueDate = () => {
    const currentDate = new Date();
    const dueDate = new Date(due_date);
    const nextDay = new Date(currentDate.getTime() + 86400000); // Add one day

    if (nextDay <= dueDate) {
      // If next day is not after the current due date, set the due date to the day after the current due date
      const newDueDate = new Date(dueDate.getTime() + 86400000);
      setDate(newDueDate.toISOString().split("T")[0]);
    } else {
      // Otherwise, set the due date to the next day
      setDate(nextDay.toISOString().split("T")[0]);
    }
  };

  const ExtendDueDate = async () => {
    try {
      setLock(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.patch(
        `/api/extend-due-date/${membershipId}/?gym_id=${gymId}`,
        {
          due_date: date,
        }
      ).then(() => {
        invalidateAll();
        onUpdate();
      });
      toast.success("Due date extended successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error extending due date:", error);
      toast.error("Something went wrong while extending due date");
    }
    setLock(false);
  };

  return (
    <>
      {!isDue ? (
        <Tooltip content="Extend Due Date" placement="bottom">
          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="flex flex-row gap-2 items-center justify-start font-medium "
          >
            <MdOutlineDateRange size={20} />
            <Text>Extend</Text>
          </Button>
        </Tooltip>
      ) : null}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          // onUpdate();
        }}
        size="sm"
      >
        <div className="m-auto p-6 md:p-8 space-y-6 ">
          <div className="flex flex-row justify-between items-center">
            <Title as="h4" className="">
              Extend Due Date
            </Title>
            <XIcon
              className="h-6 w-6 cursor-pointer "
              onClick={() => {
                setIsOpen(false);
                // onUpdate();
              }}
            />
          </div>
          <div className="space-y-4">
            <Text className="text-base font-semibold ">
              Current Due Date:{" "}
              <Text as="span" className="text-primary font-semibold ml-2 mt-1">
                {/* {due_date} */}
                <DateCell
                  date={new Date(due_date)}
                  timeClassName="hidden"
                  dateFormat={getDateFormat()}
                  className="inline-block text-sm font-semibold"
                  // dateClassName="dark:text-gray-300"
                />
              </Text>
            </Text>
            <Input
              type="date"
              label="New Due Date :"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              labelClassName=""
              className="max-w-sm text-base"
            />
            {/* <div className="space-y-1.5">
              <Text className="font-medium">Select New Date</Text>
              <DatePicker
              value={date}
              isClearable
              placeholderText="Select New Due Date"
              showMonthDropdown={true}
              // scrollableYearDropdown={true}
              dateFormat="yyyy-MM-dd"
              className=""
              onChange={(date:Date) => setDate(date.toISOString().split("T")[0])}
              minDate={new Date(due_date)}
              
            />
            </div> */}

            <div className="mt-2 w-full flex items-start justify-evenly">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={ExtendDueDate} disabled={lock}>
                {lock ? <Loader variant="threeDot" /> : "Extend"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
