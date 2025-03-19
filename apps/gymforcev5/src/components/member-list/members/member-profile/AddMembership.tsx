import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Text,
  Input,
  Select,
  Title,
  Drawer,
  Switch,
  Loader,
  RadioGroup,
  AdvancedRadio,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { DatePicker } from "@core/ui/datepicker";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import TaxAccordion from "../TaxAccordion";
import { FaPercent, FaUser, FaUsers } from "react-icons/fa6";
import { CircleCheck, XIcon } from "lucide-react";
import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { RiUserVoiceFill } from "react-icons/ri";
import { BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

interface MembershipData {
  // title: string;
  price: number | null;
  offer_price: number | null;
  paid_amount: number | null;
  gym_id: number | null;
  start_date: string;
  payment_mode_id: number | null;
  member_id: number | null;
  package_id: number | null;
  due_date: string | null;
  discounted_amount: number;
  actual_amount: number;
  enrollment_fee_id: number | null;
}

interface ValidationErrors {
  // title?: string;
  price?: string;
  offer_price?: string;
  paid_amount?: string;
  package_id?: string;
  start_date?: string;
  payment_mode_id?: string;
  due_date?: string;
}

interface DiscountState {
  type: "rupee" | "percentage";
  value: number;
}

interface Package {
  label: string;
  value: number;
  min_price: number;
  max_price: number;
  num_of_days: number;
}

interface PaymentMode {
  label: string;
  value: number;
}

interface DemographicInfo {
  currency_symbol: string;
}
interface AddMembershipProps {
  m_id: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => void;
}
interface EnrollmentFee {
  label: string;
  value: number;
}

interface EnrollmentList {
  amount: string;
  value: number;
}

const initialMemberState: MembershipData = {
  // title: "",
  price: null,
  offer_price: null,
  paid_amount: null,
  gym_id: null,
  start_date: new Date().toISOString().split("T")[0],
  payment_mode_id: null,
  member_id: null,
  package_id: null,
  due_date: null,
  discounted_amount: 0,
  actual_amount: 0,
  enrollment_fee_id: null,
};

interface MetricItem {
  title: string;
  icon?: React.ReactNode;
  value: string;
}
export default function AddMembership({
  m_id,
  open,
  setOpen,
  onSuccess,
}: AddMembershipProps) {
  const [data, setData] = useState<MembershipData>(initialMemberState);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isFullPay, setIsFullPay] = useState<"yes" | "no">("no");
  const [showDueDate, setShowDueDate] = useState(false);
  const [lock, setLock] = useState(false);
  const [discount, setDiscount] = useState<DiscountState>({
    type: "rupee",
    value: 0,
  });
  type FormFieldName = keyof MembershipData;
  const [applyTaxes, setApplyTaxes] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);

  const [metricData, setMetricData] = useState<any[]>([]);
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<EnrollmentFee[]>([]);
  const [enrollmentList, setEnrollmentList] = useState<EnrollmentList[]>([]);
  const [packageType, setPackageType] = useState("");
  const emptyPackage: Package[] = [
    {
      label: "No Packages Found",
      value: 0,
      min_price: 0,
      max_price: 0,
      num_of_days: 0,
    },
  ];
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [centerType, setCenterType] = useState(0);

  const calculateDiscount = (): number => {
    if (!data.offer_price) return 0;
    if (discount.type === "rupee") {
      return Math.min(discount.value || 0, data.offer_price);
    } else {
      return Math.min(
        (data.offer_price * discount.value || 0) / 100,
        data.offer_price
      );
    }
  };

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
  function renderOptionDisplayValue(option: Package) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex items-center gap-1">
          <Text>{`Price Range ( ${demographicInfo?.currency_symbol} ) : `}</Text>
          <Text>
            {option.min_price} - {option.max_price}
          </Text>
        </div>
      </div>
    );
  }
  const getPreReq = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/member/add-member-prerequisites/?gym_id=${gymId}`
      );

      setEnrollment(
        resp.data.favorite_enrollment_fee.map((fee: any) => ({
          label: fee.name + " - " + fee.amount,
          value: fee.id,
        }))
      );

      setEnrollmentList(
        resp.data.favorite_enrollment_fee.map((fee: any) => ({
          amount: fee.amount,
          value: fee.id,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Error fetching enrollment fees");
    }
  };

  const fetchPackages = async (packageType: string) => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        // `/api/list-packages/v2/?gym_id=${gymId}${packageType ? `&package_type=${packageType}` : ""}`,
        `/api/list-packages/v2/?gym_id=${gymId}${packageType ? `&package_type=${packageType.split(" ")[0]}` : ""}`,
        {
          id: newID("master-packages-list-" + packageType.split(" ")[0]),
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
      setMetricData(
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
    fetchPackages(packageType);
  }, [packageType]);

  const handleDiscountTypeChange = (value: "rupee" | "percentage") => {
    setDiscount((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handlePackageType = (value: string) => {
    setPackageType((prevPackageType) => {
      const newPackageType =
        prevPackageType.toLowerCase() === value.toLowerCase() ? "" : value;
      fetchPackages(newPackageType);
      return newPackageType;
    });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Verify that name is a valid field
    if (!isFormFieldName(name)) return;

    setData((prev) => {
      let updatedData = { ...prev };

      if (name === "offer_price" || name === "paid_amount") {
        updatedData[name] = parseFloat(value) || null;

        if (name === "offer_price") {
          updatedData.actual_amount = calculateActualAmount();
        }

        if (name === "paid_amount") {
          const actualAmount = calculateActualAmount();
          const paidAmount = parseFloat(value) || 0;
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

        if (selectedPackage && name === "offer_price") {
          const totalOfferPrice = updatedData.actual_amount || 0;
          if (
            totalOfferPrice < selectedPackage.min_price ||
            totalOfferPrice > selectedPackage.max_price
          ) {
            setPriceError(
              `Price must be between ${selectedPackage.min_price} and ${selectedPackage.max_price}`
            );
          } else {
            setPriceError(null);
          }
        }
      } else {
        // updatedData[name] = value as any;
        //@ts-ignore
        updatedData = { ...updatedData, name: value };
      }

      validateField(name, value);
      return updatedData;
    });
  };

  const handleSelectChange = (
    name: FormFieldName,
    option: Package | PaymentMode | null
  ) => {
    if (name === "package_id" && option && "min_price" in option) {
      setSelectedPackage(option);
      setData((prev) => {
        const maxPrice = option.max_price;
        return {
          ...prev,
          [name]: option.value,
          title: option.label,
          offer_price: maxPrice,
          actual_amount: calculateActualAmount(),
        };
      });
      setPriceError(null);
    } else if (name === "enrollment_fee_id") {
      let prevFee = "0";
      if (data.enrollment_fee_id) {
        prevFee =
          enrollmentList.find((fee) => fee.value === data.enrollment_fee_id)
            ?.amount || "0";
      }
      setData((prev) => {
        const enrollmentFee = option
          ? enrollmentList.find((fee) => fee.value === option.value)?.amount ||
            "0"
          : "0";
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
    validateField(name, option?.value);
  };

  // Type guard to check if a string is a valid form field name
  function isFormFieldName(key: string): key is FormFieldName {
    return key in initialMemberState;
  }

  const validateField = (name: string, value: any) => {
    let error = "";
    switch (name) {
      case "title":
        error = !value ? "Title is required" : "";
        break;
      case "package_id":
        error = !value ? "Package is required" : "";
        break;
      case "offer_price":
        error = !value ? "Offer price is required" : "";
        break;
      case "paid_amount":
        error = !value ? "Paid amount is required" : "";
        break;
      case "payment_mode_id":
        error = !value ? "Payment mode is required" : "";
        break;
      case "start_date":
        error = !value ? "Start date is required" : "";
        break;
      case "due_date":
        if (showDueDate && !value) {
          error =
            "Due date is required when paid amount is less than total amount";
        }
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    let isValid = true;
    const fieldsToValidate = [
      "title",
      "package_id",
      "offer_price",
      "paid_amount",
      "payment_mode_id",
      "start_date",
    ];

    if (showDueDate) {
      fieldsToValidate.push("due_date");
    }

    fieldsToValidate.forEach((field) => {
      validateField(field, data[field as keyof MembershipData]);
      if (errors[field as keyof ValidationErrors]) {
        isValid = false;
      }
    });

    return isValid;
  };

  const fetchPaymentModes = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/payment-modes/list_favorite/?gym_id=${gymId}`,
        {
          id: newID("payment-modes"),
        }
      );
      if (resp.status === 200) {
        setPaymentModes(
          resp.data.map((mode: any) => ({ label: mode.name, value: mode.id }))
        );
      }
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      toast.error("Something went wrong while fetching payment modes");
    }
  };

  const addMembership = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    if (priceError) {
      toast.error(priceError);
      return;
    }

    try {
      setLock(true);
      const PackageVal = packages.filter(
        (pack) => pack.value === data.package_id
      )[0];
      const status =
        new Date(data.start_date).getTime() > new Date().getTime()
          ? "inactive"
          : dayjs(data.start_date).add(PackageVal.num_of_days).isBefore(dayjs())
            ? "inactive"
            : "active";
      const gymId = await retrieveGymId();
      const membershipData = {
        ...data,
        gym_id: parseInt(gymId as string),
        member_id: parseInt(m_id),
        status: status,
        discounted_amount: calculateDiscount().toString(),
        actual_amount: calculateActualAmount().toString(),
      };

      console.log(membershipData);

      const resp = await AxiosPrivate.post(
        `/api/create-membership/?gym_id=${gymId}`,
        membershipData
      );

      if (resp.status === 201) {
        toast.success("New Membership Added Successfully");
        invalidateAll();
        setOpen(false);
        onSuccess();
        setData(initialMemberState);
      }
    } catch (error) {
      console.error("Error adding membership:", error);
      toast.error("Something went wrong while adding membership");
    } finally {
      setLock(false);
    }
  };

  useEffect(() => {
    fetchPaymentModes();
    retrieveDemographicInfo().then(setDemographicInfo);
    getPreReq();
  }, []);

  useEffect(() => {
    if (isFullPay === "yes") {
      setData((prev) => ({
        ...prev,
        paid_amount: calculateActualAmount(),
      }));
      setShowDueDate(false);
    }
  }, [data.offer_price, discount.value, discount.type, applyTaxes, isFullPay]);

  const actualAmount = useMemo(() => {
    return calculateActualAmount();
  }, [data.offer_price, discount.value, discount.type, applyTaxes]);

  return (
    <Drawer
      isOpen={open}
      onClose={() => {
        setOpen(false);
        setData(initialMemberState);
      }}
      size="lg"
    >
      <div className="m-auto p-6 md:p-8 h-full max-h-[99%] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <Title as="h4">Add New Membership</Title>
          <Button
            variant="text"
            onClick={() => {
              setOpen(false);
              setData(initialMemberState);
            }}
          >
            <XIcon className="h-8 w-8" />
          </Button>
        </div>

        <div className="h-full flex flex-col justify-between">
          {/* <div className="w-full p-4 bg-primary-lighter dark:bg-gray-200 rounded-lg shadow">
            <div className="flex flex-row gap-2 items-center">
              <Text className="text-sm">Please Note</Text>
              <IoWarningOutline className="animate-pulse" size={16} />
            </div>
            <ul className="flex flex-col items-stretch gap-3 px-4 pt-2 list-disc text-xs font-medium">
              <li>
                Adding a new membership will create a new membership plan for
                the member.
              </li>
              <li>
                Make sure to verify all details before adding the membership as
                this action will affect billing and access.
              </li>
              <li>
                You can set up partial payments with due dates if required.
              </li>
            </ul>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 px-4 py-4 gap-5">
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
                        {packageType === metric.value && (
                          <XIcon
                            size={18}
                            className="absolute -top-4 right-2 z-[99999] text-primary cursor-pointer hover:scale-110 hover:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePackageType("");
                            }}
                          />
                        )}
                        <div className="flex flex-row items-center gap-2 p-1.5 transition-all duration-200 ">
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
                onChange={(option: any) =>
                  handleSelectChange("package_id", option)
                }
                labelClassName=""
                getOptionDisplayValue={(option) =>
                  packages.length
                    ? renderOptionDisplayValue(option)
                    : renderEmpty(option)
                }
                error={errors.package_id}
              />
            </div>
            <div className="grid grid-cols-1 gap-0.5">
              <Select
                label="Enrollment Fee"
                name="enrollment_fee_id"
                options={enrollment}
                value={
                  enrollment.find(
                    (group) => group.value === data.enrollment_fee_id
                  )?.label || ""
                }
                onChange={(option: any) =>
                  handleSelectChange("enrollment_fee_id", option)
                }
                prefix={
                  <Text className="text-primary">
                    {demographicInfo?.currency_symbol || ""}
                  </Text>
                }
                clearable
                onClear={() => {
                  handleSelectChange("enrollment_fee_id", null);
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-0.5">
              <Input
                label="Amount *"
                name="offer_price"
                type="number"
                placeholder="Enter Price"
                prefix={
                  <Text className="text-primary">
                    {demographicInfo?.currency_symbol || ""}
                  </Text>
                }
                value={data.offer_price?.toString() || ""}
                onChange={handleInputChange}
                error={errors.offer_price}
                labelClassName=""
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <Text className="font-medium">Start Date *</Text>
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
                    start_date: formateDateValue(new Date(date), "YYYY-MM-DD"),
                  }))
                }
                placeholderText="Select Start Date"
                showMonthDropdown={true}
                scrollableYearDropdown={true}
                dateFormat="yyyy-MM-dd"
                className="col-span-full sm:col-span-1"
                error={errors.start_date}
              />
            </div>

            <div className="grid grid-cols-1 gap-1 relative">
              <Switch
                value={discount.type}
                size="md"
                onIcon={<FaPercent className="text-primary" />}
                offIcon={
                  <Text className="text-primary">
                    {demographicInfo?.currency_symbol || ""}
                  </Text>
                }
                onChange={() =>
                  handleDiscountTypeChange(
                    discount.type === "rupee" ? "percentage" : "rupee"
                  )
                }
                className={`absolute -top-[14px] ${
                  discount.type === "rupee" ? "left-36" : "left-40"
                } p-0.5 duration-200 transition-all`}
              />
              <Input
                name="discount"
                type="number"
                label={`Discount (${discount.type === "rupee" ? "Amount" : "Percentage"})`}
                placeholder={`Enter Discount ${
                  discount.type === "rupee" ? "Amount" : "Percentage"
                }`}
                value={discount.value}
                onChange={handleDiscountValueChange}
                labelClassName=""
                prefix={
                  discount.type === "rupee" ? (
                    <Text className="text-primary">
                      {demographicInfo?.currency_symbol || ""}
                    </Text>
                  ) : (
                    <FaPercent />
                  )
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-1">
              <Input
                label="Total Amount"
                name="totalAmount"
                type="number"
                value={calculateActualAmount().toFixed(2)}
                prefix={
                  <Text className="text-primary">
                    {demographicInfo?.currency_symbol || ""}
                  </Text>
                }
                readOnly
                labelClassName=""
              />
            </div>
            <div className="flex flex-col col-span-full">
              <TaxAccordion
                amount={
                  data.offer_price ? data.offer_price - calculateDiscount() : 0
                }
                show={applyTaxes}
                handleApplyTaxes={handleApplyTaxesChange}
                symbol={demographicInfo?.currency_symbol || ""}
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
                prefix={
                  <Text className="text-primary">
                    {demographicInfo?.currency_symbol || ""}
                  </Text>
                }
                value={data.paid_amount?.toString() || ""}
                onChange={handleInputChange}
                error={errors.paid_amount}
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
                  (mode) => mode.value === data.payment_mode_id
                )}
                onChange={(option: any) =>
                  handleSelectChange("payment_mode_id", option)
                }
                error={errors.payment_mode_id}
                labelClassName=""
              />
            </div>

            {showDueDate && (
              <div className="grid grid-cols-1 gap-1.5">
                <Text className="font-medium">Due Date *</Text>
                <DatePicker
                  name="due_date"
                  value={
                    data.due_date
                      ? formateDateValue(new Date(data.due_date))
                      : ""
                  }
                  onChange={(date: any) =>
                    setData((prev) => ({
                      ...prev,
                      due_date: formateDateValue(new Date(date), "YYYY-MM-DD"),
                    }))
                  }
                  placeholderText="Select Due Date"
                  showMonthDropdown={true}
                  scrollableYearDropdown={true}
                  dateFormat="yyyy-MM-dd"
                  className="col-span-full sm:col-span-1"
                  minDate={new Date()}
                  error={errors.due_date}
                />
              </div>
            )}
          </div>

          <div className="mb-10 flex justify-evenly items-center">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="mr-2 hover:text-primary w-60"
            >
              Cancel
            </Button>
            <Button
              onClick={addMembership}
              disabled={lock || priceError !== null}
              className="w-60"
            >
              {lock ? <Loader variant="threeDot" /> : "Add Membership"}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
