"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Text,
  Input,
  Select,
  Title,
  Loader,
  AdvancedRadio,
  RadioGroup,
  Drawer,
  Tooltip,
  Switch,
  Badge,
  Checkbox,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import {
  PiArrowRightBold,
  PiCaretLeftBold,
  PiCaretRightBold,
} from "react-icons/pi";
import { DatePicker } from "@core/ui/datepicker";
// import { useRouter } from "next/navigation";
import { CircleCheck, InfoIcon, XIcon } from "lucide-react";
import { FaPercent, FaUser, FaUserPlus, FaUsers } from "react-icons/fa6";
import { RiCopperCoinFill, RiUserVoiceFill } from "react-icons/ri";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { IoWarningOutline } from "react-icons/io5";
// import { IoIosInformationCircleOutline } from "react-icons/io";
import MemberInfo from "./MemberInfoCard";
// import TaxAccordion from "@/app/[locale]/(home)/members/_components/TaxAccordion";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import Link from "next/link";
import TaxAccordion from "../member-list/members/TaxAccordion";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";

interface FormData {
  package_id: number | null;
  offer_price: number | null;
  paid_amount: number | null;
  payment_mode_id: number | null;
  due_date: string | null;
  start_date?: string | null;
  enrollment_fee_id: number | null;
  actual_amount: number | null;
}

const initialState: FormData = {
  package_id: null,
  offer_price: null,
  paid_amount: null,
  payment_mode_id: null,
  due_date: null,
  start_date: new Date().toISOString().split("T")[0],
  enrollment_fee_id: null,
  actual_amount: null,
};

interface Package {
  label: string;
  value: number;
  min_price: number;
  max_price: number;
  num_of_days: number;
}

interface Option {
  label: string;
  value: number;
}

export default function UpgradeMembership({
  membershipId,
  onUpdate,
  closeModal,
  package_type,
  paid_amount,
  member_name,
  member_image,
  end_date,
  member_id,
}: {
  membershipId: string;
  onUpdate: () => void;
  closeModal: () => void;
  package_type?: string;
  paid_amount: number;
  member_name?: string;
  end_date: string;
  member_image?: string;
  member_id: string;
}) {
  const [data, setData] = useState<FormData>(initialState);
  const [paymentModes, setPaymentModes] = useState<Option[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [showDueDate, setShowDueDate] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isValid, setIsValid] = useState(false);
  const [isFullPay, setIsFullPay] = useState<"yes" | "no">("no");
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [pointErr, setPointErr] = useState("");

  const [detectedAmount, setDetectedAmount] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [payableAmount, setPayableAmount] = useState(0);
  const [metricData, setMetricData] = useState([
    { label: "All", value: "All" },
  ]);
  const [centerType, setCenterType] = useState(0);
  const [discount, setDiscount] = useState<{
    type: "rupee" | "percentage";
    value: number;
  }>({
    type: "rupee",
    value: 0,
  });
  const [applyTaxes, setApplyTaxes] = useState<boolean>(false);
  const [lock, setLock] = useState(false);
  const [packageType, setPackageType] = useState<string>(
    metricData.find((item) => item.value === package_type)?.value || "All"
  );
  const [enrollment, setEnrollment] = useState<Option[]>([]);
  const [enrollmentList, setEnrollmentList] = useState<
    { amount: number; value: number }[]
  >([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [calculatedInfo, setCalculatedInfo] = useState({
    upgradableAmount: 0,
    pastRemainingDays: 0,
    upgradableValidDays: 0,
    newEndDate: new Date(),
  });
  const [pointsInfo, setPointsInfo] = useState<any>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [usedPoints, setUsedPoints] = useState(0);
  const [pointError, setPointError] = useState("");
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const memberInfo = [
    {
      name: "Previous Paid Amount:",
      value: paid_amount.toString(),
      color: "#3872FA",
    },
    {
      name: "Payable Amount:",
      value: payableAmount.toString(),
      color: "#eab308",
    },
    {
      name: "Past Remaining Days:",
      value: calculatedInfo.pastRemainingDays.toString() + " days",
      color: "#10b981",
    },
    {
      name: "New Start Date",
      value: data.start_date ?? "",
      color: "#10b981",
    },
    {
      name: "New End Date",
      value: new Date(
        Math.max(
          new Date(end_date).getTime(),
          new Date().getTime() + calculatedInfo.upgradableValidDays * 86400000
        )
      )
        .toISOString()
        .split("T")[0],
      color: "#10b981",
    },
  ];
  const getPreReq = async () => {
    const gymId = await retrieveGymId();
    try {
      const resp = await AxiosPrivate.get(
        `/api/member/add-member-prerequisites/?gym_id=${gymId}`
      ).then((res) => {
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
      });
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
    } catch (error) {
      console.error("Error fetching prerequisites:", error);
    }
  };

  useEffect(() => {
    if (isFullPay === "yes") {
      setData((prev) => ({
        ...prev,
        paid_amount: calculateActualAmount(),
        due_date: null,
      }));
      setShowDueDate(false);
    }
  }, [
    isFullPay,
    discount.value,
    discount.type,
    applyTaxes,
    data.offer_price,
    data.enrollment_fee_id,
    payableAmount,
  ]);

  useEffect(() => {
    if (isFullPay === "yes") {
      setData((prev) => ({
        ...prev,
        paid_amount: calculateActualAmount(),
      }));
    }
  }, [
    discount.value,
    discount.type,
    applyTaxes,
    data.offer_price,
    data.enrollment_fee_id,
    payableAmount,
  ]);

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

  useEffect(() => {
    fetchPaymentModes();
    // fetchPackages(packageType);
    getPreReq();
  }, []);

  const getEnrollmentFee = (): number => {
    if (!data.enrollment_fee_id) return 0;
    const fee = enrollmentList.find(
      (fee) => fee.value === data.enrollment_fee_id
    );
    return fee ? fee.amount : 0;
  };

  const calculateDiscount = (): number => {
    if (!payableAmount) return 0;
    if (discount.type === "rupee") {
      return Math.min(discount.value || 0, payableAmount);
    } else {
      return Math.min(
        (payableAmount * discount.value || 0) / 100,
        payableAmount
      );
    }
  };

  const calculateTaxes = (): number => {
    if (!applyTaxes || !payableAmount) return 0;
    const taxableAmount = payableAmount - calculateDiscount();
    return taxableAmount * 0.18; // 18% GST
  };

  const calculateActualAmount = (): number => {
    if (!payableAmount) return 0;

    const discountAmount = calculateDiscount();
    const subTotal = payableAmount - discountAmount;
    const taxes = calculateTaxes();

    return Math.round((subTotal + taxes) * 100) / 100;
  };

  const calculatePayableAmount = (
    offerPrice: number | null,
    deductedAmount: number
  ): number => {
    if (!offerPrice) return 0;

    // Calculate package amount after deduction
    const packageAmount = Math.max(
      0,
      Number(offerPrice) - Number(deductedAmount)
    );

    // Add enrollment fee separately
    const enrollmentFee = getEnrollmentFee();

    // Calculate total payable amount
    const totalAmount = packageAmount + Number(enrollmentFee);

    return Math.round(totalAmount * 100) / 100; // Round to 2 decimal places
  };

  const handlePackageType = (value: string) => {
    setPackageType((prevPackageType) => {
      const newPackageType =
        prevPackageType.toLowerCase() === value.toLowerCase() ? "" : value;
      fetchPackages(newPackageType);
      return newPackageType;
    });
  };

  useEffect(() => {
    fetchPackages(packageType);
    setData((prev) => {
      return {
        ...prev,
        offer_price: null,
        paid_amount: null,
        due_date: null,
        package_id: null,
      };
    });
  }, [packageType]);

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
    fetchPackages(packageType);
  }, [packageType]);

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
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      toast.error(
        "Something went wrong while fetching payment modes. Please try again."
      );
    }
  };

  useEffect(() => {
    checkFormValidation(false);
  }, [data, showDueDate]);

  const checkFormValidation = (submit: boolean) => {
    const errors: { [key: string]: string } = {};

    if (!data.package_id) errors.package_id = "Package is required";
    if (!data.offer_price) errors.offer_price = "Price is required";
    if (!data.paid_amount) errors.paid_amount = "Paid amount is required";
    if (!data.payment_mode_id)
      errors.payment_mode_id = "Payment mode is required";
    if (showDueDate && !data.due_date) errors.due_date = "Due date is required";

    const actualAmount = calculateActualAmount();
    if (data.paid_amount && data.paid_amount > actualAmount) {
      errors.paid_amount = `Paid amount cannot exceed ${demographiInfo?.currency_symbol} ${actualAmount}`;
    }
    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0);

    if (submit && Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return false;
    }

    return true;
  };

  // Add validation for offer price against package min/max price
  const handleOfferPriceChange = (value: number | null) => {
    if (selectedPackage && value) {
      if (
        value < selectedPackage.min_price ||
        value > selectedPackage.max_price
      ) {
        setValidationErrors((prev) => ({
          ...prev,
          offer_price: `Price must be between ${demographiInfo?.currency_symbol}${selectedPackage.min_price} and ${demographiInfo?.currency_symbol}${selectedPackage.max_price}`,
        }));
        return;
      }
    }

    const newPayableAmount = calculatePayableAmount(value, detectedAmount);
    setPayableAmount(parseInt(newPayableAmount.toString()));

    const currentPaidAmount = data.paid_amount || 0;
    setShowDueDate(currentPaidAmount < newPayableAmount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue =
      name === "offer_price" || name === "paid_amount"
        ? parseFloat(value) || null
        : value;

    setData((prev) => {
      const updatedData = {
        ...prev,
        [name]: numValue,
      };

      if (name === "offer_price") {
        handleOfferPriceChange(numValue as number | null);
      } else if (name === "paid_amount") {
        const newPaidAmount = parseFloat(value) || 0;
        const actualAmount = calculateActualAmount();
        setShowDueDate(newPaidAmount < actualAmount);

        if (newPaidAmount > actualAmount) {
          setValidationErrors((prev) => ({
            ...prev,
            paid_amount: `Paid amount cannot exceed ${demographiInfo?.currency_symbol} ${actualAmount}`,
          }));
        } else {
          setValidationErrors((prev) => ({ ...prev, paid_amount: "" }));
        }

        if (newPaidAmount >= actualAmount) {
          updatedData.due_date = null;
        }
      }

      return updatedData;
    });
  };
  useEffect(() => {
    if (data.offer_price) {
      const newPayableAmount = calculatePayableAmount(
        data.offer_price,
        detectedAmount
      );
      setPayableAmount(parseInt(newPayableAmount.toString()));
    }
  }, [data.enrollment_fee_id]);

  const handleSelectChange = (
    name: string,
    option: Package | Option | null
  ) => {
    if (name === "package_id" && option && "min_price" in option) {
      setSelectedPackage(option);

      // Calculate remaining days and daily rate
      const currentEndDate = new Date(end_date);
      const today = new Date();
      const remainingDays = Math.max(
        0,
        Math.ceil(
          (currentEndDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        )
      );
      const oldDailyRate = paid_amount / (option.num_of_days || 1);
      const deductAmount = oldDailyRate * remainingDays;

      setDetectedAmount(deductAmount);
      const newPayableAmount = calculatePayableAmount(
        option.max_price,
        deductAmount
      );
      setPayableAmount(newPayableAmount);

      setData((prev) => ({
        ...prev,
        [name]: option.value,
        offer_price: option.max_price,
        paid_amount: null,
        due_date: null,
        actual_amount: calculateActualAmount(),
      }));

      setShowDueDate(false);
    } else if (name === "enrollment_fee_id") {
      setData((prev) => {
        const updatedData = { ...prev, [name]: option?.value ?? null };
        const newPayableAmount = calculatePayableAmount(
          prev.offer_price,
          detectedAmount
        );
        setPayableAmount(newPayableAmount);
        updatedData.actual_amount = calculateActualAmount();
        return updatedData;
      });
    } else {
      setData((prev) => ({ ...prev, [name]: option?.value ?? null }));
    }
  };

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      actual_amount: calculateActualAmount(),
    }));
  }, [payableAmount, discount, applyTaxes]);

  useEffect(() => {
    const actualAmount = calculateActualAmount();
    if (data.paid_amount && data.paid_amount > actualAmount) {
      setValidationErrors((prev) => ({
        ...prev,
        paid_amount: `Paid amount cannot exceed ${demographiInfo?.currency_symbol}${actualAmount}`,
      }));
    }
  }, [data.paid_amount, payableAmount, discount, applyTaxes]);

  useEffect(() => {
    if (data.package_id && data.offer_price) {
      const selectedPackage = packages.find(
        (pkg) => pkg.value === data.package_id
      );
      if (selectedPackage) {
        // Calculate days remaining from current end_date
        const currentEndDate = new Date(end_date || "");
        const today = new Date();
        const remainingDays = Math.ceil(
          (currentEndDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );

        // Calculate new end date based on package days
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + selectedPackage.num_of_days);

        setCalculatedInfo({
          upgradableAmount: data.offer_price,
          pastRemainingDays: Math.max(0, remainingDays),
          upgradableValidDays: selectedPackage.num_of_days,
          newEndDate: new Date(newEndDate.toISOString().split("T")[0]),
        });
      }
    }
  }, [data.package_id, data.offer_price, end_date, packages]);

  const UpdatePoints = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/spending-points/?gym_id=${gymId}`,
        {
          used: usedPoints,
          member_id: member_id,
          rule: "Upgrade Membership",
          note: ` Redeemed ${usedPoints} points in Upgrade`,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const submitData = async () => {
    if (!checkFormValidation(true)) return;

    try {
      setLock(true);
      const formData = {
        package_id: data.package_id,
        offer_price: data.offer_price,
        paid_amount: data.paid_amount,
        payment_mode_id: data.payment_mode_id,
        due_date: data.due_date,
        enrollment_fee_id: data.enrollment_fee_id,
        discounted_amount: calculateDiscount().toFixed(2),
        actual_amount: calculateActualAmount().toFixed(2),
        tax_amount: applyTaxes ? calculateTaxes().toFixed(2) : "0",
      };
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/upgrade-membership/${membershipId}/?gym_id=${gymId}`,
        formData
      ).then(async () => {
        if (
          usePoints &&
          usedPoints &&
          !pointError &&
          usedPoints * (pointsInfo?.conversion_ratio || 0) === discount.value
        ) {
          await UpdatePoints();
        }
        invalidateAll();
        onUpdate();
        toast.success("Membership upgraded successfully!");
        setData(initialState);
        setLock(false);
      });

      //   router.push(`/membership/details/${membershipId}`);
    } catch (error) {
      console.error("Error upgrading membership:", error);
      toast.error(
        "Something went wrong while upgrading membership. Please try again."
      );
      setLock(false);
    }
  };

  useEffect(() => {
    console.log("Calculation Debug:", {
      offerPrice: data.offer_price,
      enrollmentFee: getEnrollmentFee(),
      deductedAmount: detectedAmount,
      payableAmount,
      discount: calculateDiscount(),
      taxes: calculateTaxes(),
      actualAmount: calculateActualAmount(),
    });
  }, [
    data.offer_price,
    data.enrollment_fee_id,
    payableAmount,
    discount,
    applyTaxes,
  ]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setData(initialState);
        setValidationErrors({});
        setPackageType(metricData[0].value);
        // setSelectedPackage(null);
        closeModal();
      }}
      size="lg"
      containerClassName="p-4 md:p-6 md:px-8 md:pb-4 space-y-3 max-h-full overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-row items-center justify-between">
        <Title as="h4" className="">
          Upgrade Membership
        </Title>
        <XIcon
          onClick={() => {
            setIsOpen(false);
            closeModal();
          }}
          className="hover:text-primary cursor-pointer hover:scale-105"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 ">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 px-4 pt-2 gap-4">
            <div className="w-full p-4 bg-primary-lighter dark:bg-gray-100 rounded-lg shadow col-span-full">
              <div className="flex flex-row gap-2 items-center">
                <Text className="text-sm">Please Note</Text>
                <IoWarningOutline className="animate-pulse" size={16} />
              </div>
              <ul className="flex flex-col items-stretch gap-3 px-4 pt-2 list-disc text-xs font-medium">
                <li>
                  {`Upgrading a membership moves the member to a higher plan
                  (e.g., from 1 month to 1 year). Any paid amount and remaining
                  days from the current plan will be credited toward the new
                  plan.`}
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-1.5 col-span-full">
              <Text className="font-medium ">Package Type *</Text>
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
            <div className="grid grid-cols-1 gap-1.5">
              <Text className="font-medium ">Start Date *</Text>
              <DatePicker
                name="start_date"
                // value={data.start_date || ""}
                // onChange={(date: any) => {
                //   setData((prev) => ({
                //     ...prev,
                //     start_date: new Date(date.getTime() + 86400000)
                //       .toISOString()
                //       .split("T")[0],
                //   }));
                //   setValidationErrors((prev) => ({
                //     ...prev,
                //     start_date: "",
                //   }));
                // }}
                value={
                  data.start_date
                    ? formateDateValue(new Date(data.start_date))
                    : ""
                }
                onChange={(date: any) => {
                  setData((prev) => ({
                    ...prev,
                    start_date: formateDateValue(
                      new Date(date.getTime()),
                      "YYYY-MM-DD"
                    ),
                  }));
                  setValidationErrors((prev) => ({
                    ...prev,
                    start_date: "",
                  }));
                }}
                placeholderText="Select Start Date"
                dateFormat="yyyy-MM-dd"
                className="col-span-full sm:col-span-1"
                minDate={new Date()}
              />
            </div>
            <div className="grid grid-cols-1 gap-0.5">
              <Select
                label="Package *"
                name="package_id"
                options={packages}
                value={packages.find((pkg) => pkg.value === data.package_id)}
                onChange={(option: Package | null) =>
                  handleSelectChange("package_id", option)
                }
                labelClassName=""
                getOptionDisplayValue={(option) =>
                  renderOptionDisplayValue(option)
                }
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
              {data.package_id !== null && validationErrors.package_id && (
                <p className="text-xs text-red-500">
                  {validationErrors.package_id}
                </p>
              )}
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
            <div className="grid grid-cols-1 gap-0.5">
              <Select
                label="Enrollment Fee"
                name="enrollment_fee_id"
                options={enrollment}
                value={enrollment.find(
                  (fee) => fee.value === data.enrollment_fee_id
                )}
                onChange={(option: Option | null) =>
                  handleSelectChange("enrollment_fee_id", option)
                }
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
            </div>
            <div className="grid grid-cols-1 gap-0.5 relative">
              <Input
                label={`Amount *`}
                name="offer_price"
                type="number"
                placeholder="Enter Offer Price"
                value={data.offer_price?.toString() || ""}
                onChange={handleInputChange}
                labelClassName=""
                prefix={
                  <Text className="text-primary">
                    {demographiInfo?.currency_symbol || " "}
                  </Text>
                }
              />
              {data.offer_price !== null && validationErrors.offer_price && (
                <p className="text-xs text-red-500">
                  {validationErrors.offer_price}
                </p>
              )}
            </div>
            <div className="relative">
              <Tooltip
                placement="top"
                className="z-[999999999] max-w-sm"
                content={`${demographiInfo?.currency_symbol || ""} ${data.package_id && detectedAmount > 0 ? `${detectedAmount.toFixed(2)} was detected from Previous Membership.` : ""}`}
              >
                <InfoIcon
                  className={
                    (data.package_id ? "absolute " : "hidden ") +
                    " z-[999999999] top-0.5 left-3/4 size-4 animate-pulse"
                  }
                />
              </Tooltip>
              <Input
                label="Payable Amount"
                name="payable_amount"
                type="number"
                value={payableAmount.toString()}
                disabled
                prefix={
                  <Text className="text-primary">
                    {demographiInfo?.currency_symbol || " "}
                  </Text>
                }
              />
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
                  setDiscount((prev) => ({
                    ...prev,
                    type: prev.type === "rupee" ? "percentage" : "rupee",
                  }));
                }}
                className="absolute -top-[14px] left-36 p-0.5 duration-200 transition-all"
              />
              <Input
                name="discount"
                type="number"
                label={`Discount (${discount.type === "rupee" ? "Amount" : "Percentage"})`}
                placeholder={`Enter Discount ${discount.type === "rupee" ? "Amount" : "Percentage"}`}
                value={discount.value}
                onChange={(e) =>
                  setDiscount((prev) => ({
                    ...prev,
                    value: parseInt(e.target.value),
                  }))
                }
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

            <div className="grid grid-cols-1 col-span-full">
              <TaxAccordion
                amount={payableAmount ? payableAmount - calculateDiscount() : 0}
                show={applyTaxes}
                handleApplyTaxes={(e) => setApplyTaxes(e.target.checked)}
                symbol={demographiInfo?.currency_symbol || ""}
              />
            </div>

            <div className="grid grid-cols-1 gap-1">
              <Input
                label="Total Amount"
                name="total"
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
                      due_date: null,
                    }));
                    setShowDueDate(false);
                  }
                }}
                labelClassName="text-[13px]"
                className="absolute -top-[10px] left-28 p-0.5 duration-200 transition-all"
              />
              <Input
                label="Amount Paid *"
                name="paid_amount"
                type="number"
                placeholder="Enter Paid Amount"
                value={data.paid_amount?.toString() || ""}
                onChange={handleInputChange}
                labelClassName=""
                prefix={
                  <Text className="text-primary">
                    {demographiInfo?.currency_symbol || " "}
                  </Text>
                }
              />
              {data.paid_amount !== null && validationErrors.paid_amount && (
                <p className="text-xs text-red-500">
                  {validationErrors.paid_amount}
                </p>
              )}
              {/* {
                data.paid_amount && data.offer_price && data.paid_amount > data.offer_price && (
                  <p className="text-xs text-red-500">Paid amount shouldn't be greater than to {data.offer_price}</p>
                )
              } */}
            </div>
            <div className="grid grid-cols-1 gap-0.5 items-start">
              <Select
                label="Payment Mode *"
                name="payment_mode_id"
                options={paymentModes}
                value={paymentModes.find(
                  (mode) => mode?.value === data.payment_mode_id
                )}
                onChange={(option: Option | null) =>
                  handleSelectChange("payment_mode_id", option)
                }
                // labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
              {data.payment_mode_id !== null &&
                validationErrors.payment_mode_id &&
                !lock && (
                  <p className="text-xs text-red-500">
                    {validationErrors.payment_mode_id}
                  </p>
                )}
            </div>
            {showDueDate && (
              <div className="grid grid-cols-1 gap-1.5 ">
                <Text className="font-medium ">Due Date *</Text>
                <DatePicker
                  name="due_date"
                  // value={data.due_date || ""}
                  // onChange={(date: any) => {
                  //   setData((prev) => ({
                  //     ...prev,
                  //     due_date: new Date(date.getTime() + 86400000)
                  //       .toISOString()
                  //       .split("T")[0],
                  //   }));
                  //   setValidationErrors((prev) => ({ ...prev, due_date: "" }));
                  // }}
                  value={
                    data.due_date
                      ? formateDateValue(new Date(data.due_date))
                      : ""
                  }
                  onChange={(date: any) => {
                    setData((prev) => ({
                      ...prev,
                      due_date: formateDateValue(
                        new Date(date.getTime()),
                        "YYYY-MM-DD"
                      ),
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      due_date: "",
                    }));
                  }}
                  placeholderText="Select Due Date"
                  showMonthDropdown={true}
                  scrollableYearDropdown={true}
                  dateFormat="yyyy-MM-dd"
                  className="col-span-full sm:col-span-1"
                  minDate={new Date()}
                />
                {data.due_date !== null && validationErrors.due_date && (
                  <p className="text-xs text-red-500">
                    {validationErrors.due_date}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <div
          className={`col-span-full w-full grid grid-cols-1 px-4  transition-all duration-300 ${data.package_id ? "" : "w-0 h-0 opacity-0 z-[-1]"}`}
        >
          <MemberInfo
            data={memberInfo}
            member_name={member_name || ""}
            member_image={member_image}
            symbol={demographiInfo?.currency_symbol}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <Button
          onClick={submitData}
          variant="solid"
          size="lg"
          className="hover:scale-105 transition-all duration-200 group hover:shadow-sm shadow-gray-800 font-medium"
          disabled={!isValid || lock}
        >
          {!lock ? (
            <span className="flex flex-nowrap gap-1 items-center justify-center">
              <span>Upgrade Membership</span>
              <PiArrowRightBold className="ml-2 transition-all group-hover:animate-pulse" />
            </span>
          ) : (
            <Loader variant="threeDot" />
          )}
        </Button>
      </div>
    </Drawer>
  );
}
