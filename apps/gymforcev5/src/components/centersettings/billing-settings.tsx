"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Button,
  Title,
  Text,
  RadioGroup,
  AdvancedRadio,
  Badge,
  Bold,
  // Modal,
  Loader,
  Tooltip,
  Empty,
  EmptyBoxIcon,
  // Tooltip,
} from "rizzui";
import cn from "@core/utils/class-names";
// import { useModal } from "@/app/shared/modal-views/use-modal";
import HorizontalFormBlockWrapper from "@/app/shared/account-settings/horiozontal-block";
import { PiCheckCircleFill, PiStackSimple } from "react-icons/pi";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

import useRazorpay, { RazorpayOptions } from "react-razorpay";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { getDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";

import dynamic from "next/dynamic";
import { getPageSize } from "@/components/pageSize";
import { RiCopperCoinFill } from "react-icons/ri";
import { IoIosTime } from "react-icons/io";
// import BillingHistoryTable from "@/app/shared/account-settings/billing-history/table";
const BillingHistoryTable = dynamic(
  () => import("@/app/shared/account-settings/billing-history/table")
);
// import ManualPaymentModal from "./advanced-manual-payment";
const ManualPaymentModal = dynamic(() => import("./advanced-manual-payment"));

const paymentIcons = [
  {
    icon: (
      <svg
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 122.88 26.53"
        xmlSpace="preserve"
      >
        <style type="text/css">
          {`
        .st0{fill:#3395FF;}
        .st1{fill:#072654;}
      `}
        </style>
        <g>
          <polygon
            className="st1"
            points="11.19,9.03 7.94,21.47 0,21.47 1.61,15.35 11.19,9.03"
          />
          <path
            className="st1"
            d="M28.09,5.08C29.95,5.09,31.26,5.5,32,6.33s0.92,2.01,0.51,3.56c-0.27,1.06-0.82,2.03-1.59,2.8 c-0.8,0.8-1.78,1.38-2.87,1.68c0.83,0.19,1.34,0.78,1.5,1.79l0.03,0.22l0.6,5.09h-3.7l-0.62-5.48c-0.01-0.18-0.06-0.36-0.15-0.52 c-0.09-0.16-0.22-0.29-0.37-0.39c-0.31-0.16-0.65-0.24-1-0.25h-0.21h-2.28l-1.74,6.63h-3.46l4.3-16.38H28.09L28.09,5.08z M122.88,9.37l-4.4,6.34l-5.19,7.52l-0.04,0.04l-1.16,1.68l-0.04,0.06L112,25.09l-1,1.44h-3.44l4.02-5.67l-1.82-11.09h3.57 l0.9,7.23l4.36-6.19l0.06-0.09l0.07-0.1l0.07-0.09l0.54-1.15H122.88L122.88,9.37z M92.4,10.25c0.66,0.56,1.09,1.33,1.24,2.19 c0.18,1.07,0.1,2.18-0.21,3.22c-0.29,1.15-0.78,2.23-1.46,3.19c-0.62,0.88-1.42,1.61-2.35,2.13c-0.88,0.48-1.85,0.73-2.85,0.73 c-0.71,0.03-1.41-0.15-2.02-0.51c-0.47-0.28-0.83-0.71-1.03-1.22l-0.06-0.2l-1.77,6.75h-3.43l3.51-13.4l0.02-0.06l0.01-0.06 l0.86-3.25h3.35l-0.57,1.88l-0.01,0.08c0.49-0.7,1.15-1.27,1.91-1.64c0.76-0.4,1.6-0.6,2.45-0.6C90.84,9.43,91.7,9.71,92.4,10.25 L92.4,10.25z M88.26,12.11c-0.4-0.01-0.8,0.07-1.18,0.22c-0.37,0.15-0.71,0.38-1,0.66c-0.68,0.7-1.15,1.59-1.36,2.54 c-0.3,1.11-0.28,1.95,0.02,2.53c0.3,0.58,0.87,0.88,1.72,0.88c0.81,0.02,1.59-0.29,2.18-0.86c0.66-0.69,1.12-1.55,1.33-2.49 c0.29-1.09,0.27-1.96-0.03-2.57S89.08,12.11,88.26,12.11L88.26,12.11z M103.66,9.99c0.46,0.29,0.82,0.72,1.02,1.23l0.07,0.19 l0.44-1.66h3.36l-3.08,11.7h-3.37l0.45-1.73c-0.51,0.61-1.15,1.09-1.87,1.42c-0.7,0.32-1.45,0.49-2.21,0.49 c-0.88,0.04-1.76-0.21-2.48-0.74c-0.66-0.52-1.1-1.28-1.24-2.11c-0.18-1.06-0.12-2.14,0.19-3.17c0.3-1.15,0.8-2.24,1.49-3.21 c0.63-0.89,1.44-1.64,2.38-2.18c0.86-0.5,1.84-0.77,2.83-0.77C102.36,9.43,103.06,9.61,103.66,9.99L103.66,9.99z M101.92,12.14 c-0.41,0-0.82,0.08-1.19,0.24c-0.38,0.16-0.72,0.39-1.01,0.68c-0.67,0.71-1.15,1.59-1.36,2.55c-0.28,1.08-0.28,1.9,0.04,2.49 c0.31,0.59,0.89,0.87,1.75,0.87c0.4,0.01,0.8-0.07,1.18-0.22s0.71-0.38,1-0.66c0.59-0.63,1.02-1.38,1.26-2.22l0.08-0.31 c0.3-1.11,0.29-1.96-0.03-2.53C103.33,12.44,102.76,12.14,101.92,12.14L101.92,12.14z M81.13,9.63l0.22,0.09l-0.86,3.19 c-0.49-0.26-1.03-0.39-1.57-0.39c-0.82-0.03-1.62,0.24-2.27,0.75c-0.56,0.48-0.97,1.12-1.18,1.82l-0.07,0.27l-1.6,6.11h-3.42 l3.1-11.7h3.37l-0.44,1.72c0.42-0.58,0.96-1.05,1.57-1.4c0.68-0.39,1.44-0.59,2.22-0.59C80.51,9.48,80.83,9.52,81.13,9.63 L81.13,9.63z M68.5,10.19c0.76,0.48,1.31,1.24,1.52,2.12c0.25,1.06,0.21,2.18-0.11,3.22c-0.3,1.18-0.83,2.28-1.58,3.22 c-0.71,0.91-1.61,1.63-2.64,2.12c-1.05,0.49-2.19,0.74-3.35,0.73c-1.22,0-2.22-0.24-3-0.73c-0.77-0.48-1.32-1.24-1.54-2.12 c-0.24-1.06-0.2-2.18,0.11-3.22c0.3-1.17,0.83-2.27,1.58-3.22c0.71-0.9,1.62-1.63,2.66-2.12c1.06-0.49,2.22-0.75,3.39-0.73 C66.57,9.41,67.6,9.67,68.5,10.19L68.5,10.19z M64.84,12.1c-0.81-0.01-1.59,0.3-2.18,0.86c-0.61,0.58-1.07,1.43-1.36,2.57 c-0.6,2.29-0.02,3.43,1.74,3.43c0.8,0.02,1.57-0.29,2.15-0.85c0.6-0.57,1.04-1.43,1.34-2.58c0.3-1.13,0.31-1.98,0.01-2.57 C66.25,12.37,65.68,12.1,64.84,12.1L64.84,12.1z M57.89,9.76l-0.6,2.32l-7.55,6.67h6.06l-0.72,2.73H45.05l0.63-2.41l7.43-6.57 h-5.65l0.72-2.73H57.89L57.89,9.76z M40.96,9.99c0.46,0.29,0.82,0.72,1.02,1.23l0.07,0.19l0.44-1.66h3.37l-3.07,11.7h-3.37 l0.45-1.73c-0.51,0.6-1.14,1.08-1.85,1.41s-1.48,0.5-2.27,0.5c-0.88,0.04-1.74-0.22-2.45-0.74c-0.66-0.52-1.1-1.28-1.24-2.11 c-0.18-1.06-0.12-2.14,0.19-3.17c0.29-1.15,0.8-2.24,1.49-3.21c0.63-0.89,1.44-1.64,2.37-2.18c0.86-0.5,1.84-0.76,2.83-0.76 C39.66,9.44,40.36,9.62,40.96,9.99L40.96,9.99z M39.23,12.14c-0.41,0-0.81,0.08-1.19,0.24c-0.38,0.16-0.72,0.39-1.01,0.68 c-0.68,0.71-1.15,1.59-1.36,2.55c-0.28,1.08-0.27,1.9,0.04,2.49c0.31,0.59,0.89,0.87,1.75,0.87c0.4,0.01,0.8-0.07,1.18-0.22 c0.37-0.15,0.72-0.38,1-0.66c0.59-0.62,1.03-1.38,1.26-2.22l0.08-0.31c0.29-1.11,0.26-1.94-0.03-2.53 C40.64,12.44,40.06,12.14,39.23,12.14L39.23,12.14z M26.85,7.81h-3.21l-1.13,4.28h3.21c1.01,0,1.81-0.17,2.35-0.52 c0.57-0.37,0.98-0.95,1.13-1.63c0.2-0.72,0.11-1.27-0.27-1.62C28.55,7.99,27.86,7.81,26.85,7.81L26.85,7.81z"
          />
          <polygon
            className="st0"
            points="18.4,0 12.76,21.47 8.89,21.47 12.7,6.93 6.86,10.78 7.9,6.95 18.4,0"
          />
        </g>
      </svg>
    ),
  },
  {
    icon: (
      <svg
        enableBackground="new 0 0 32 32"
        id="Stock_cut"
        version="1.1"
        viewBox="0 0 32 32"
        className="size-[30px]"
        xmlSpace="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <desc />
        <g>
          <path
            d="M17,5H5 C3.895,5,3,5.895,3,7v22c0,1.105,0.895,2,2,2h18c1.105,0,2-0.895,2-2V18"
            fill="none"
            stroke="#000000"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="2"
          />
          <path
            d="M9,14H3v8h6 c2.209,0,4-1.791,4-4v0C13,15.791,11.209,14,9,14z"
            fill="none"
            stroke="#000000"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="2"
          />
          <circle cx="9" cy="18" r="1" />
          <line
            fill="none"
            stroke="#000000"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="2"
            x1="25"
            x2="25"
            y1="16"
            y2="1"
          />
          <polyline
            fill="none"
            points="31,7 25,1 19,7"
            stroke="#000000"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="2"
          />
        </g>
      </svg>
    ),
  },
];

type SubPlans = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  // plan_details?:any;
  plan_type?: string;
  credits?: number;
};

type BillProps = {
  isRegister: boolean;
  skipProcess?: () => void;
  nextStep?: () => void;
  type?: string;
};

export default function BillingSettingsView({
  isRegister,
  skipProcess,
  nextStep,
  type,
}: BillProps) {
  const [user, setUser] = useState();
  const router = useRouter();
  const [demographics, setDemographics] = useState<any>({});
  const [plans, setPlans] = useState<SubPlans[]>([]);
  const [activePlans, setActivePlans] = useState<SubPlans[]>([]);
  const [isSubScribed, setisSubScribed] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [Razorpay] = useRazorpay();
  const [subHistory, setSubHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [isManualPayment, setIsManualPayment] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualPaymentModes, setManualPaymentModes] = useState<any[]>([]);
  const [manualPaymentType, setManualPaymentType] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const payOptions = [
    // {
    //   icon: paymentIcons[0].icon,
    //   title: "Razor Pay",
    //   expiry: "06/25",
    //   default: false,
    //   value: "razor",
    //   InitializePayment: RazorPayment,
    // },
    {
      icon: paymentIcons[1].icon,
      title: "Manual Payment",
      expiry: "06/25",
      default: false,
      value: "manual",
      Acc_No: "1234567890",
      IFSC_Code: "SBIN0000001",
      Bank_Name: "State Bank of India",
      Branch: "Chennai",
      InitializePayment: InitializeManualPayment,
    },
  ];

  async function RazorPayment() {
    const gymId = await retrieveGymId();
    const resp = await AxiosPrivate.post(
      `/api/payment/create-order/?gym_id=${gymId}`,
      {
        gym_id: parseInt(gymId as string),
        id: parseInt(currentPlan),
      }
    )
      .then((resp) => {
        const data = resp.data;
        console.log(data);
        const options: RazorpayOptions = {
          key: data?.context.razorpay_merchant_key,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: "GymForce",
          handler: async function (response) {
            try {
              const gymId = await retrieveGymId();
              const callback = await AxiosPrivate.post(
                `/api/payment/payment-callback/?gym_id=${gymId}`,
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }
              );
              if (callback.status === 201) {
                toast.success("Payment Successfull");
                invalidateAll();
                if (nextStep) {
                  nextStep();
                } else {
                  router.refresh();
                }
              }
              // console.log("Callback response:", callback.data);
            } catch (error) {
              console.log(error);
              toast.error("Something went wrong while making Payment");
            }
          },
        };
        const payment = new Razorpay(options);
        payment.open();
      })
      .catch((error) => {
        console.log(error);
        toast.error("Something went wrong while making Payment");
      });
  }

  async function InitializeManualPayment() {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/payment/payment-methods/details/?gym_id=${gymId}`,
        {
          id: newID("manual-payment-methods"),
        }
      );

      console.log(resp.data);
      setManualPaymentModes(resp.data);
      setIsManualPayment(true);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching payment methods");
    }
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  async function ManualPayment() {
    if (!paymentScreenshot) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    const gymId = await retrieveGymId();
    const formData = new FormData();
    formData.append("plan_id", currentPlan);
    if (gymId && gymId !== null) {
      formData.append("gym_id", gymId); // Issue
    }
    formData.append(
      "amount",
      plans
        .find((plan) => plan.id.toString() === currentPlan)
        ?.price.toString() || ""
    );
    formData.append("payment_method", `Manual_${selectedPayment}`);
    formData.append("details", "Manual payment submission");
    if (user) {
      formData.append("user", user);
    }
    const fileExtension = paymentScreenshot.name.split(".").pop();
    const newFileName = `Payment_Verification_Image.${fileExtension}`;
    const renamedFile = new File([paymentScreenshot], newFileName, {
      type: paymentScreenshot.type,
    });

    formData.append("payment_screenshot", renamedFile);
    console.log(formData);
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/payment/manualpay/?gym_id=${gymId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(resp);
      toast.success(
        "Payment Details are sent, after verification it will be updated in your account."
      );
      invalidateAll();
      setIsManualPayment(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while making Payment");
    } finally {
      router.refresh();
    }
  }
  const getPlans = async () => {
    const gymId = await retrieveGymId();
    const resp = await AxiosPrivate.get(
      `/api/list-subscription-plan/?gym_id=${gymId}${type && type === "addon" ? "&stype=addon" : ""}`,
      {
        id: newID("list-subscription" + type),
      }
    );
    return resp.data.results;
  };
  const planInfo = async (pageNumber: number = 1) => {
    const gymId = await retrieveGymId();
    let pageSize;
    if (pageSizeVal) {
      pageSize = pageSizeVal;
    } else {
      pageSize = getPageSize();
    }
    setIsLoading(true);
    const resp = await AxiosPrivate.get(
      `/api/users/subscriptions/?gym_id=${gymId}${type && type === "addon" ? "&type=addon" : "&type=product"}${pageSize && pageSize !== 10 ? `&page_size=${pageSize}` : ""}${pageNumber ? `&page=${pageNumber}` : ""}`,
      {
        id: newID("user-subscriptions" + type + currentPage + pageSize),
      }
    );
    setCurrentPage(pageNumber);
    setTotalItems(resp.data?.count);
    setIsLoading(false);
    return resp.data.results;
  };
  const handlePaymentSelection = (index: number) => {
    setSelectedPayment(index);
  };

  useEffect(() => {
    const getData = async () => {
      const profile = await AxiosPrivate.get("/api/profile", {
        id: newID(`user-profile`),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      setUser(profile.data.user_id);
      const getDemo = await getDemographicInfo();
      setDemographics(getDemo);
      console.log("Demographics", getDemo);
      let plan = await planInfo();
      setSubHistory(plan);
      if (plan.length > 0 && plan[0].status === "Active") {
        // setPlans([plan[0]]);

        setActivePlans([plan[0]]);
        setisSubScribed(true);
      }
      plan = await getPlans();
      const newPlans =
        type && type === "addon"
          ? plan.filter((plan: any) => plan?.plan_type === "addon")
          : plan.filter((plan: any) => plan?.plan_type === "product");
      setPlans(newPlans);
      setCurrentPlan(newPlans[0].id.toString());
    };
    getData();
  }, [pageSizeVal]);

  const handlePageChange = async (pageNumber: number) => {
    let plan = await planInfo(pageNumber);
    setSubHistory(plan);
  };

  return (
    <div className="flex flex-col space-y-8 @container ">
      {isRegister ? (
        <div className="w-full flex max-sm:flex-col-reverse max-sm:gap-4 justify-between items-center">
          <HorizontalFormBlockWrapper
            childrenWrapperClassName="gap-0 @lg:gap-0"
            title="Choose Your Plan"
            titleClassName="text-xl font-semibold "
            descriptionClassName=""
            description="Select a plan to unlock the full potential of our platform and start your fitness journey."
          />
        </div>
      ) : null}
      <div
        className={cn(
          "flex w-full max-w-[1536px] flex-grow flex-col @container",
          "[&_label.block>span]:font-medium"
        )}
      >
        <div className="items-start lg:grid lg:grid-cols-12 ">
          <div className="gap-4 border-muted @container lg:col-span-8 lg:border-e lg:pb-12 lg:pe-7">
            <div className="flex flex-col gap-4 @xs:gap-4 lg:gap-6">
              {/* {activePlans.length > 0 && isSubScribed ? (
                <HorizontalFormBlockWrapper
                  title="Active Subscription"
                  // description="Select/Update your plans according to your needs for better management. We'll credit your account if you need to downgrade during the billing cycle."
                  titleClassName=""
                  descriptionClassName="max-w-md "
                  childrenWrapperClassName="@3xl:grid-cols-1 max-w-5xl w-full "
                >
                  <ActiveSubscription plan={activePlans[0]} />
                </HorizontalFormBlockWrapper>
              ) : (
                <div className="flex flex-1 justify-center items-center">
                  <Loader variant="spinner" />
                </div>
              )} */}
              <HorizontalFormBlockWrapper
                title="Available Plans"
                description="Select/Update your plans according to your needs for better management. We'll credit your account if you need to downgrade during the billing cycle."
                titleClassName=" hidden"
                descriptionClassName="max-w-md "
                childrenWrapperClassName="@3xl:grid-cols-1 max-w-5xl w-full "
              >
                {plans.length > 0 ? (
                  <CurrentPlans
                    plans={plans}
                    currentPlan={currentPlan}
                    setCurrentPlan={setCurrentPlan}
                    demographics={demographics}
                  />
                ) : (
                  <div className="flex flex-1 justify-center items-center">
                    <Loader variant="spinner" />
                  </div>
                )}
              </HorizontalFormBlockWrapper>
              <HorizontalFormBlockWrapper
                title="Payment Options"
                description="Choose your payment from the available options below."
                descriptionClassName="max-w-md "
                childrenWrapperClassName="@3xl:grid-cols-1 max-w-5xl w-full mx-auto"
                titleClassName=""
              >
                <PaymentOptions
                  options={payOptions}
                  onSelect={handlePaymentSelection}
                />
              </HorizontalFormBlockWrapper>
            </div>
          </div>
          <div className="sticky top-24 mt-8  lg:col-span-4  max-w-xl lg:mt-10 2xl:top-36">
            {currentPlan && (
              <div className=" flex flex-col gap-3 p-3 sm:gap-5 sm:p-5 md:py-10">
                <Title as="h4" className="mb-3 font-semibold ">
                  Payment Info
                </Title>
                <div className="flex items-center gap-3 justify-between px-2">
                  <Bold className="text-gray-900 ">Subscription</Bold>
                  <Text className="text-gray-700 ">
                    {
                      plans.find((plan) => plan.id.toString() === currentPlan)
                        ?.name
                    }
                  </Text>
                </div>
                <div className="flex items-center gap-3 justify-between px-2">
                  <Bold className="text-gray-900 ">
                    {type && type === "addon" ? `Credits ` : "WhatsApp Credits"}
                  </Bold>
                  <Badge
                    className="flex items-center gap-1 shadow shadow-primary-lighter "
                    variant="flat"
                  >
                    <RiCopperCoinFill size={18} />
                    <Text className="font-semibold">
                      {
                        plans.find((plan) => plan.id.toString() === currentPlan)
                          ?.credits
                      }
                    </Text>
                  </Badge>
                </div>
                {type && type !== "addon" && (
                  <div className="flex items-center gap-3 justify-between px-2">
                    <Bold className="text-gray-900 ">{`Duration (in months)`}</Bold>
                    <Text className="text-gray-700 ">
                      {
                        plans.find((plan) => plan.id.toString() === currentPlan)
                          ?.duration_months
                      }
                    </Text>
                  </div>
                )}
                <div className="flex items-center gap-3 justify-between px-2">
                  <Bold className="text-gray-900 ">Payment Mode</Bold>
                  <Text className="text-gray-700 ">
                    {payOptions[selectedPayment].title}
                  </Text>
                </div>
                <div className="flex items-center gap-3 justify-between px-2">
                  <Bold className="text-gray-900  ">Amount</Bold>
                  <Text className="text-gray-700 ">
                    {demographics ? demographics.currency_symbol : ""}
                    {
                      plans.find((plan) => plan.id.toString() === currentPlan)
                        ?.price
                    }
                  </Text>
                </div>
                <Button
                  onClick={() => {
                    payOptions[selectedPayment].InitializePayment();
                  }}
                >
                  Continue Payment
                </Button>
              </div>
            )}
          </div>
        </div>

        {!isRegister && (
          <div className="mt-8 xl:mt-10">
            <div className="mb-5 flex items-center justify-between">
              <Title as="h5" className="text-[17px] font-semibold ">
                Subscription History
              </Title>
            </div>
            {subHistory.length > 0 ? (
              <BillingHistoryTable
                data={subHistory}
                pageSizeVal={pageSizeVal}
                setPageSizeVal={setPageSizeVal}
                handlePageChange={handlePageChange}
                totalItems={totalItems}
                currentPage={currentPage}
                isLoading={isLoading}
              />
            ) : (
              <Empty image={<EmptyBoxIcon />} text="No Subscription's" />
            )}
          </div>
        )}
      </div>
      {isManualPayment && (
        <ManualPaymentModal
          manualPaymentModes={manualPaymentModes}
          manualPaymentType={manualPaymentType}
          setManualPaymentType={setManualPaymentType}
          handleFileChange={handleFileChange}
          imagePreview={imagePreview}
          paymentScreenshot={paymentScreenshot}
          handleManualPayment={ManualPayment}
          onClose={() => {
            setIsManualPayment(false);
            if (nextStep) {
              nextStep();
            }
          }}
        />
      )}
    </div>
  );
}
export function PaymentOptions({
  options,
  onSelect,
}: {
  options: any[];
  onSelect: (paymentMethod: number) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState("manual");
  const handlePaymentMethodChange = (value: number, name: string) => {
    setPaymentMethod(name);
    onSelect(value);
  };
  // useEffect(() => {
  //   setPaymentMethod(options[0].name);
  //   onSelect(options[0].value);
  // }, []);
  return (
    <div>
      <div className="flex flex-col gap-4 ">
        {options.map((cards: any, index: number) => (
          <AdvancedRadio
            key={`cards-${index}`}
            name="card_details"
            onChange={() => handlePaymentMethodChange(index, cards.value)}
            defaultChecked={cards.value === paymentMethod}
            value={cards.value}
            className="flex gap-3 rounded-xl border border-muted text-sm hover:cursor-pointer hover:border-primary [&_.rizzui-advanced-checkbox]:flex [&_.rizzui-advanced-checkbox]:gap-3 [&_.rizzui-advanced-checkbox]:border-0 [&_.rizzui-advanced-checkbox]:px-5 [&_.rizzui-advanced-checkbox]:py-5 [&_.rizzui-advanced-checkbox]:ring-0"
            inputClassName="[&:checked~span_div>.icon]:block [&~span]:pt-4 [&~span]:w-full [&~span]:rounded-xl [&:checked~span]:ring-offset-0 [&~span:hover]:border-primary [&:checked~.rizzui-advanced-checkbox]:border-primary [&:checked~.rizzui-advanced-checkbox]:ring-primary [&:checked~.rizzui-advanced-checkbox]:ring-2 [&~.rizzui-advanced-checkbox]:w-full"
          >
            <div className="mb-2 flex h-10 w-[70px] shrink-0 items-center justify-center rounded-md border border-gray-100 p-1 ">
              {cards.icon}
            </div>
            <div className="block">
              <Title as="h6" className="mb-1 text-sm font-medium ">
                {cards.title}
              </Title>
              <Text as="p">
                Expiry in <span className="font-medium">{cards.expiry}</span>
              </Text>
              {/* <div className="mt-2 flex gap-3">
                <Button
                  variant="text"
                  className={cn(
                    "h-auto p-0",
                    cards.default && "bg-transparent text-gray-500"
                  )}
                  disabled={cards.default}
                >
                  Set as Default
                </Button>
                <Button
                  variant="text"
                  className={cn("h-auto p-0 text-gray-900")}
                >
                  Edit
                </Button>
              </div> */}
            </div>
            {cards.value === paymentMethod ? (
              <PiCheckCircleFill className="icon ms-auto h-6 w-6 flex-shrink-0 text-primary" />
            ) : (
              <div className="relative ms-auto flex h-6 w-6 items-center justify-center rounded-full border border-muted"></div>
            )}
          </AdvancedRadio>
        ))}
      </div>
    </div>
  );
}

export function CurrentPlans({
  plans,
  currentPlan,
  setCurrentPlan,
  demographics,
}: {
  plans: SubPlans[];

  currentPlan: string;
  setCurrentPlan: Dispatch<SetStateAction<string>>;
  demographics: any;
}) {
  useEffect(() => {
    setCurrentPlan(plans[0].id.toString());
  }, []);
  return (
    <RadioGroup
      value={currentPlan}
      setValue={setCurrentPlan}
      className="flex flex-col gap-5"
    >
      {plans.map((plan, index) => (
        <AdvancedRadio
          key={`plan-${index}`}
          name="current_plans"
          value={plan.id.toString()}
          onChange={() => setCurrentPlan(plan.id.toString())}
          checked={plan.id.toString() === currentPlan.toString()}
          className="flex flex-col rounded-xl text-sm hover:cursor-pointer hover:border-primary"
          inputClassName="[&:checked~span_div>.icon]:block [&~span]:rounded-xl [&:checked~span]:ring-offset-0 [&~span:hover]:border-primary [&:checked~.rizzui-advanced-checkbox]:border-primary [&:checked~.rizzui-advanced-checkbox]:ring-primary [&:checked~.rizzui-advanced-checkbox]:ring-1"
        >
          <div className="flex sm:items-center justify-between gap-3 px-1.5 py-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
              {/* {plan?.icon} */}
              <PiStackSimple className="h-4 w-4 text-gray-900" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <Title
                  as="h6"
                  className="mb-1 text-sm font-medium text-gray-900 "
                >
                  {plan.name +
                    (plan?.plan_type === "addon"
                      ? ""
                      : ` at ` +
                        (demographics ? demographics.currency_symbol : "") +
                        (plan.price / plan.duration_months).toFixed(2) +
                        `/month`)}
                </Title>
                <PiCheckCircleFill className="icon hidden h-6 w-6 flex-shrink-0 text-primary" />
              </div>
              <div className="flex max-sm:flex-col sm:items-center sm:justify-between">
                <Text className="text-gray-700 ">{plan.description}</Text>
                <div className="flex items-center gap-4 max-sm:justify-between">
                  {plan?.plan_type !== "addon" && (
                    <div className="flex items-center gap-1 sm:mr-8">
                      <IoIosTime size={16} />
                      <Text className="text-[13px]">
                        {plan?.duration_months} {`month(s)`}
                      </Text>
                    </div>
                  )}
                  <div className="relative">
                    <Text className="py-1 px-2 text-xs absolute top-[-80%]">
                      Credits
                    </Text>

                    <Badge
                      className="flex items-center gap-1 shadow shadow-primary-lighter sm:mr-8 max-sm:scale-90"
                      variant="flat"
                    >
                      <RiCopperCoinFill size={18} />
                      <Text className="font-semibold">{plan.credits}</Text>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdvancedRadio>
      ))}
    </RadioGroup>
  );
}
// export function ActiveSubscription({ plan }: { plan: any }) {
//   const formatDate = (dateString: any) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };
//   useEffect(() => {
//     console.log(plan);
//   }, []);
//   return (
//     <AdvancedRadio
//       //   key={`plan-${index}`}
//       //   name="current_plans"
//       //   value={plan.id.toString()}
//       //   // onChange={() => setCurrentPlan(plan.id.toString())}
//       checked
//       //   className="flex flex-col rounded-xl text-sm hover:cursor-pointer hover:border-primary"
//       //   inputClassName="[&:checked~span_div>.icon]:block [&~span]:rounded-xl [&:checked~span]:ring-offset-0 [&~span:hover]:border-primary [&:checked~.rizzui-advanced-checkbox]:border-primary [&:checked~.rizzui-advanced-checkbox]:ring-primary [&:checked~.rizzui-advanced-checkbox]:ring-1"
//     >
//       <div className="flex items-center justify-between gap-3 shadow-sm">
//         <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
//           <PiStackSimple className="h-4 w-4 text-gray-900 " />
//         </div>
//         <div className="flex-grow relative">
//           <div className="flex justify-between items-center mb-2">
//             <Title
//               as="h6"
//               className="text-sm font-medium text-gray-900 "
//             >
//               {plan.plan_details?.name}
//             </Title>
//             {plan.status === "Active" && (
//               <PiCheckCircleFill className="h-5 w-5 flex-shrink-0 text-green-500" />
//             )}
//           </div>
//           {plan?.plan_details?.plan_type === "addon" ? (
//             <Text className="text-gray-700 mb-2 ">
//               Duration: Valit Till Subscription Expires
//             </Text>
//           ) : (
//             <Text className="text-gray-700 mb-2 ">
//               Duration: {plan?.plan_details?.duration_months} {`month(s)`}
//             </Text>
//           )}
//           <div className="flex justify-between items-center">
//             {plan?.plan_details?.plan_type !== "addon" ? (
//               <Text className="text-xs text-gray-700  mb-1">
//                 {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
//               </Text>
//             ) : (
//               <div className="flex items-center gap-2 mb-1">
//                 <Text>Credits : </Text>
//                 <Badge className="flex items-center gap-1" variant="flat">
//                   <RiCopperCoinFill size={18} />
//                   {plan?.plan_details?.credits}{" "}
//                 </Badge>
//               </div>
//             )}
//             <Badge variant="flat" className="capitalize">
//               {plan.status}
//             </Badge>
//           </div>
//         </div>
//       </div>
//     </AdvancedRadio>
//   );
// }
