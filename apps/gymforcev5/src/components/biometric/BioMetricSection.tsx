"use client";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import MetricCard from "@core/components/cards/metric-card";
import WidgetCard from "@core/components/cards/widget-card";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import DateCell from "@core/ui/date-cell";
import axios from "axios";
import { LucideScanFace } from "lucide-react";
// import { headers } from "next/headers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiScan } from "react-icons/bi";
import { CiBarcode } from "react-icons/ci";
import { FaAddressCard, FaCircleDot, FaRegIdBadge } from "react-icons/fa6";
import { IoMdFingerPrint } from "react-icons/io";
import { MdOutlinePassword, MdQrCodeScanner } from "react-icons/md";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { Badge, Button, Loader, Text } from "rizzui";

// Define types for operations, biometric details, and loading states
interface Operation {
  name: string;
  key: string;
}

interface BiometricDetails {
  biometric_serial_id: string;
  start_date: string;
  end_date: string;
  member_details: {
    id: number;
    localid: number;
    bioid: string;
    name: string;
    status: string;
  };
  operations: {
    [key: string]: {
      url: string;
      body: string;
    };
  };
}

interface LoadingStates {
  [operationKey: string]: boolean;
}

const operations: Operation[] = [
  { name: "Register Finger", key: "register_finger" },
  { name: "Register Card", key: "register_card" },
  { name: "Register Face", key: "register_face" },
  { name: "Register Password", key: "register_password" },
  { name: "Register QR Code", key: "register_qrcode" },
];

interface BioMetricPageProps {
  params: {
    id: string;
  };
}
const BioImage = [
  {
    name: "register_finger",
    icon: <IoMdFingerPrint size={24} className="group-hover: text-primary" />,
  },
  {
    name: "register_card",
    icon: (
      <FaAddressCard size={24} className="mr-0.5 group-hover: text-primary" />
    ),
  },
  {
    name: "register_face",
    icon: <LucideScanFace size={24} className="group-hover: text-primary" />,
  },
  {
    name: "register_password",
    icon: <MdOutlinePassword size={24} className="group-hover: text-primary" />,
  },
  {
    name: "register_qrcode",
    icon: <MdQrCodeScanner size={24} className="group-hover: text-primary" />,
  },
];
export default function BioMetricSection({
  params,
}: BioMetricPageProps): JSX.Element {
  const newId = params.id.toString().split("-")[1];
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [biometricData, setBiometricData] = useState<BiometricDetails>({
    biometric_serial_id: "",
    start_date: "",
    end_date: "",
    member_details: {
      id: 0,
      localid: 0,
      bioid: "",
      name: "",
      status: "",
    },
    operations: {},
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isAvail, setIsAvail] = useState<boolean>(false);
  const [infoLoad, setInfoLoad] = useState<boolean>(false);
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  const getBioInfo = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();

      const res = await AxiosPrivate.get(
        `/api/member/${newId}/biometric/?gym_id=${gymId}`,
        {
          id: newID(`biometric-${newId}`),
        }
      );

      const data: BiometricDetails = res.data;
      setBiometricData(data);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching biometric data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOperation = async (operationKey: string): Promise<void> => {
    if (!isAvail) {
      toast.error("Biometric data not loaded. Please refresh and try again.");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [operationKey]: true }));
      const operationDetails = biometricData.operations[operationKey];
      if (!operationDetails) {
        throw new Error("Invalid Operation");
      }
      const newBody = operationDetails.body
        .replace("Ser1234", biometricData.biometric_serial_id)
        .replace("00001", biometricData.member_details.bioid.toString())
        .replace("MemberName", biometricData.member_details.name)
        .replace("from", biometricData.start_date)
        .replace("to", biometricData.end_date);
      const response = await axios.post(operationDetails.url, newBody, {
        headers: {
          "Content-Type": "text/plain",
        },
      });

      toast.success(
        `${operationKey.replace("_", " ")} completed successfully!`
      );
      console.log(response.data);
    } catch (error: unknown) {
      console.error(error);
      toast.success("Operation Initiated...");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [operationKey]: false }));
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      try {
        const gymId = await retrieveGymId();
        setInfoLoad(true);
        const response = await AxiosPrivate.get("/api/profile/", {
          id: newID("user-profile"),
          cache: {
            ttl: 60 * 60 * 1000,
          },
        });
        const currentGym = response.data?.associated_gyms?.find(
          (gym: any) => gym.gym_id === parseInt(gymId ?? "-1")
        );

        console.log("Integration:", currentGym);
        setIsAvail(currentGym?.biometric_integration === "Available");
      } catch {
        console.error("Error fetching Bio Info:");
      } finally {
        setInfoLoad(false);
      }
    };
    getInfo();
    getBioInfo();
  }, []);

  return (
    <>
      {biometricData ? (
        <div className="relative flex w-full items-center overflow-hidden">
          <Button
            title="Prev"
            variant="text"
            ref={sliderPrevBtn}
            onClick={() => scrollToTheLeft()}
            className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
          >
            <PiCaretLeftBold className="h-5 w-5" />
          </Button>
          <div
            className="max-xl:flex items-center p-2 gap-4 xl:grid grid-cols-5 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
            ref={sliderEl}
          >
            <MetricCard
              title={"Member BioMetric ID"}
              metric={`#${biometricData.member_details.bioid}`}
              className={`relative shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 hover:bg-primary-lighter peer-hover:bg-primary-lighter hover:scale-105 peer-hover:scale-105 cursor-pointer !p-2 md:!p-4`}
              iconClassName={`text-primary bg-primary-lighter duration-200 transition-all text-white bg-primary group-hover:text-white group-hover:bg-primary peer-hover:text-white peer-hover:bg-primary`}
              titleClassName={`text-nowrap  font-medium max-lg:max-w-[110px] truncate`}
              icon={<FaRegIdBadge size={20} />}
              metricClassName="text-primary text-sm text-start pl-2 "
            />
            <MetricCard
              title={"BioMetric Serial ID"}
              metric={`#${biometricData.biometric_serial_id ?? "N/A"}`}
              className={`relative shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 hover:bg-primary-lighter peer-hover:bg-primary-lighter hover:scale-105 peer-hover:scale-105 cursor-pointer !p-2 md:!p-4`}
              iconClassName={`text-primary bg-primary-lighter duration-200 transition-all text-white bg-primary group-hover:text-white group-hover:bg-primary peer-hover:text-white peer-hover:bg-primary`}
              titleClassName={`text-nowrap  font-medium max-lg:max-w-[110px] truncate`}
              icon={<CiBarcode size={24} />}
              metricClassName="text-primary text-sm text-start pl-2 "
            />
            <MetricCard
              title={"Member Status"}
              metric={
                <Text className="text-base text-center font-bold">
                  {biometricData.member_details.status === "active" ? (
                    <Badge color="success" variant="flat">
                      Active
                    </Badge>
                  ) : biometricData.member_details.status === "expired" ? (
                    <Badge color="danger" variant="flat">
                      Expired
                    </Badge>
                  ) : biometricData.member_details.status === "upcoming" ? (
                    <Badge color="secondary" variant="flat">
                      Upcoming
                    </Badge>
                  ) : null}
                </Text>
              }
              className={`relative shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 hover:bg-primary-lighter peer-hover:bg-primary-lighter hover:scale-105 peer-hover:scale-105 cursor-pointer !p-2 md:!p-4`}
              iconClassName={`text-primary bg-primary-lighter duration-200 transition-all text-white bg-primary group-hover:text-white group-hover:bg-primary peer-hover:text-white peer-hover:bg-primary`}
              titleClassName={`text-nowrap  font-medium max-lg:max-w-[110px] truncate`}
              icon={<FaCircleDot size={20} />}
              metricClassName="text-primary text-sm text-start pl-2 "
            />
          </div>
          <Button
            title="Next"
            variant="text"
            ref={sliderNextBtn}
            onClick={() => scrollToTheRight()}
            className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
          >
            <PiCaretRightBold className="h-5 w-5" />
          </Button>
          {/* <div className="flex flex-col gap-2 bg-gray-50 shadow dark:border  p-5 rounded-md">
            <Text className="font-semibold text-gray-900">
              Member BioMetric ID{" "}
            </Text>
            <Text className="text-base text-center font-bold text-primary">
              #{biometricData.member_details.bioid}
            </Text>
          </div> */}

          {/* <div className="flex flex-col gap-2 bg-gray-50 shadow p-5 dark:border rounded-md">
            <Text className="font-semibold text-gray-900">
              BioMetric Serial ID :
            </Text>
            <Text className="text-base text-center font-bold text-primary">
              #{biometricData.biometric_serial_id}
            </Text>
          </div> */}
          {/* <div className="flex flex-col gap-2 bg-gray-50 shadow p-5 dark:border rounded-md">
            <Text className="font-semibold text-gray-900">Member Status</Text>
            <Text className="text-base text-center font-bold">
              {biometricData.member_details.status === "active" ? (
                <Badge color="success" variant="flat">
                  Active
                </Badge>
              ) : biometricData.member_details.status === "expired" ? (
                <Badge color="danger" variant="flat">
                  Expired
                </Badge>
              ) : biometricData.member_details.status === "upcoming" ? (
                <Badge color="secondary" variant="flat">
                  Upcoming
                </Badge>
              ) : null}
            </Text>
          </div> */}
          {/* // </div> */}
        </div>
      ) : null}
      <WidgetCard
        title={`BioMetric`}
        titleClassName="leading-none"
        headerClassName="mb-3 lg:mb-4"
        className="flex flex-col justify-start items-start gap-4"
        description={
          <div className="mt-2">
            {infoLoad ? (
              ""
            ) : isAvail ? (
              <Badge variant="flat" color="success">
                Available
              </Badge>
            ) : (
              <Badge variant="flat" color="warning">
                Not Available
              </Badge>
            )}
          </div>
        }
      >
        {infoLoad || loading ? (
          <div className="w-full my-4 flex justify-center items-center">
            <Loader size="md" />
          </div>
        ) : biometricData ? (
          <>
            <div className="flex items-center">
              <BiScan size={50} className="max-sm:size-10" />
              <div className="flex flex-col gap-4 p-2.5  sm:p-5 rounded-md">
                <Text className="font-semibold text-gray-900">Validity</Text>
                <div className="flex items-center">
                  <DateCell
                    date={new Date(biometricData.start_date)}
                    dateFormat={getDateFormat()}
                    timeClassName="hidden"
                    className="mx-1"
                  />{" "}
                  -{" "}
                  <DateCell
                    date={new Date(biometricData.end_date)}
                    dateFormat={getDateFormat()}
                    timeClassName="hidden"
                    className="mx-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-5 lg:gap-10 min-w-full">
              {operations.map((operation) => (
                <div
                  key={operation.key}
                  className="grid grid-cols-1 group shadow p-4 h-28 sm:h-32 border rounded-lg gap-2 hover:border-primary hover:scale-105 transition-all duration-150"
                >
                  <div className=" flex items-center gap-2">
                    {
                      BioImage.filter((item) => item.name === operation.key)[0]
                        .icon
                    }
                    <Text className="font-semibold text-gray-700">
                      {operation.name.replace("Register ", "")}
                    </Text>
                  </div>
                  <Button
                    size="sm"
                    disabled={loadingStates[operation.key]}
                    isLoading={loadingStates[operation.key]}
                    onClick={() => {
                      if (!isAvail) {
                        toast.error("Biometric Integration Not Available");
                        return;
                      }
                      handleOperation(operation.key);
                    }}
                    className="place-self-center"
                  >
                    {loadingStates[operation.key]
                      ? "Processing..."
                      : operation.name}
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No biometric data available.</p>
        )}
      </WidgetCard>
    </>
  );
}
