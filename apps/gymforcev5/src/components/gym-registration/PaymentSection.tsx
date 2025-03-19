import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Select,
  Text,
  Stepper,
  Announcement,
  // Title,
  Tooltip,
  RadioGroup,
  Radio,
  Textarea,
} from "rizzui";
import {
  // PiCurrencyInrBold,
  PiArrowRightBold,
  PiArrowLeftBold,
} from "react-icons/pi";
// import BillingSettingsView from "../(home)/centersettings/components/billing-settings";
import { AxiosPrivate, invalidateAll } from "../../app/[locale]/auth/AxiosPrivate";
import { z } from "zod";
import { FaArrowRight } from "react-icons/fa6";
import toast from "react-hot-toast";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import { DemographicInfo, getDemographicInfo } from "../../app/[locale]/auth/DemographicInfo";

const packageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  max_price: z.number().positive("Max price must be positive"),
  min_price: z.number().positive("Min price must be positive"),
  duration_value: z.number().int().positive("Duration value must be positive"),
  duration_type: z.enum(["days", "months"]),
  package_type: z.enum(["General", "PT", "Group"]),
  sessions_allocated: z
    .number()
    .int()
    .positive("Sessions must be positive")
    .nullable(),
  reference: z.string().optional(),
  gym_id: z.string(),
});
type PackageData = {
  gym_id: string;
  name: string;
  min_price: number | null;
  max_price: number | null;
  package_type: string;
  duration_type: "days" | "months";
  duration_value: number | null;
  sessions_allocated: number | null;
  reference?: string;
};

interface PaymentSectionProps {
  nextStep: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ nextStep }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const initialState: PackageData = {
    gym_id: "",
    name: "",
    min_price: null,
    max_price: null,
    package_type: "",
    duration_type: "days",
    duration_value: null,
    sessions_allocated: null,
    reference: "",
  };
  const packageList = [
    { label: "General Training", value: "General" },
    { label: "Personal Training", value: "PT" },
    { label: "Group X", value: "Group" },
  ];

  const [packageData, setPackageData] = useState<PackageData>(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const [demographics, setDemographics] = useState<DemographicInfo | null>(
    null
  );

  const setInfo = async () => {
    const resp = await getDemographicInfo();
    setDemographics(resp);
  };
  useEffect(() => {
    const retGymId = async () => {
      const id = await retrieveGymId();
      setPackageData((prev) => ({ ...prev, gym_id: id || "" }));
    };
    retGymId();
    setInfo();
  }, []);

  const handleSelectChange = useCallback(
    (name: keyof PackageData) => (value: { value: string }) => {
      setPackageData((prev) => {
        const newData = { ...prev, [name]: value.value };

        // If changing package type
        if (name === "package_type") {
          if (value.value.toLowerCase() === "pt") {
            newData.sessions_allocated = null;
          } else if (newData.duration_value) {
            // For non-PT packages, calculate sessions based on current duration
            newData.sessions_allocated =
              newData.duration_type === "months"
                ? newData.duration_value * 30
                : newData.duration_value;
          }
        }

        return newData;
      });
    },
    []
  );

  useEffect(() => {
    if (
      packageData.package_type.toLowerCase() !== "pt" &&
      packageData.duration_value
    ) {
      setPackageData((prev) => ({
        ...prev,
        sessions_allocated:
          prev.duration_type === "months"
            ? (prev.duration_value ?? 1 * 30)
            : prev.duration_value,
      }));
    }
  }, [
    packageData.duration_type,
    packageData.duration_value,
    packageData.package_type,
  ]);

  useEffect(() => {
    const isValid = packageSchema.safeParse(packageData).success;
    setIsFormValid(isValid);
  }, [packageData]);

  const handleInputChange = useCallback(
    (field: keyof PackageData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "number"
          ? e.target.value === ""
            ? null
            : Number(e.target.value)
          : e.target.value;

      setPackageData((prev) => {
        const newData = { ...prev, [field]: value };

        // If changing duration value and package type is not PT
        if (
          field === "duration_value" &&
          prev.package_type.toLowerCase() !== "pt" &&
          value !== null
        ) {
          newData.sessions_allocated =
            prev.duration_type === "months"
              ? (parseInt(value.toString()) ?? 0 * 30)
              : (parseInt(value.toString()) ?? 0);
        }

        return newData;
      });
    },
    []
  );
  const addPackage = useCallback(async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = AxiosPrivate.post(`/api/master-packages/?gym_id=${gymId}`, {
        ...packageData,
        package_type: packageData.package_type.toLowerCase(),
      }).then((res) => {
        console.log(res.data);
        toast.success("Package Added Successfully");
        setCurrentStep(1);
        invalidateAll();
      });
    } catch (error) {
      toast.error("Something went wrong");
    }
  }, [packageData]);

  const handleNextStep = () => {
    if (currentStep === 0 && isFormValid) {
      addPackage();
    }
  };
  const handlePrevStep = () => {
    setCurrentStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      // Here you would typically handle the billing submission
      console.log("Billing submitted");
      nextStep();
    }
  };

  return (
    <div className="relative px-8 pt-8 sm:px-16 lg:px-24">
      <div className="grid grid-ro md:grid-cols-2 gap-4 lg:gap-6 mx-auto items-end">
        <Stepper
          className="mt-8 order-2 md:order-1"
          currentIndex={currentStep}
          dotClassName="bg-primary text-gray-50"
          contentClassName="text-primary"
          descriptionClassName="max-sm:hidden"
        >
          <Stepper.Step title="Create Package" description="Package Details" />
          <Stepper.Step title="Billing" description="Payment Information" />
        </Stepper>
        <div className="order-1 md:order-2 flex md:justify-end">
          <Tooltip
            content="Free Trail is Still there for You "
            animation="fadeIn"
            gap={10}
          >
            <Button
              onClick={nextStep}
              className="flex flex-row gap-4 flex-wrap w-full max-w-sm justify-center items-center"
            >
              Skip For Now <FaArrowRight />
            </Button>
          </Tooltip>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-8">
        {currentStep === 0 ? (
          <div className="flex flex-col md:grid grid-cols-2 gap-4 lg:gap-8 mx-auto max-w-4xl">
            <Input
              label="Package Name *"
              name="name"
              placeholder="Enter Package Name"
              value={packageData.name}
              onChange={handleInputChange("name")}
              required
            />

            <Select
              label="Package Type"
              name="package_type"
              options={packageList}
              value={packageData.package_type}
              onChange={handleSelectChange("package_type")}
            />

            <Input
              label="Max Price *"
              name="max_price"
              type="number"
              prefix={
                <Text className="text-primary">
                  {demographics?.currency_symbol || " "}
                </Text>
              }
              value={packageData.max_price || ""}
              onChange={handleInputChange("max_price")}
            />

            <Input
              label="Min Price *"
              name="min_price"
              type="number"
              prefix={
                <Text className="text-primary">
                  {demographics?.currency_symbol || " "}
                </Text>
              }
              value={packageData.min_price || ""}
              onChange={handleInputChange("min_price")}
            />

            <RadioGroup
              value={packageData.duration_type}
              setValue={(value: any) =>
                setPackageData((prev) => ({ ...prev, duration_type: value }))
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
              placeholder="Duration Value..."
              value={packageData.duration_value || ""}
              onChange={handleInputChange("duration_value")}
            />

            <Input
              label="Sessions Allocated *"
              name="sessions_allocated"
              type="number"
              placeholder="Sessions Allocated..."
              value={packageData.sessions_allocated || ""}
              onChange={handleInputChange("sessions_allocated")}
            />

            <Textarea
              label="Description"
              name="reference"
              placeholder="Package Description..."
              className="col-span-2"
              value={packageData.reference}
              onChange={(e) =>
                setPackageData((prev) => ({
                  ...prev,
                  reference: e.target.value,
                }))
              }
            />
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <Announcement
              badgeText="Subscribe"
              highlightedText="to our Services to get the best Experience."
              size="xl"
              className="mx-auto mb-6"
              highlightedTextClassName="hidden sm:block"
            />
            <Text className="font-medium mb-6 sm:hidden mx-auto">
              To our Services to get the best Experience.
            </Text>
            {/* <BillingSettingsView isRegister={true} nextStep={nextStep} /> */}
          </div>
        )}

        <div className="mt-8 flex gap-2 flex-1 justify-evenly w-full relative">
          {currentStep > 0 && (
            <Button
              onClick={handlePrevStep}
              variant="outline"
              className="justify-self-end min-w-40"
            >
              <PiArrowLeftBold className="mr-2" /> Previous
            </Button>
          )}
          {currentStep === 0 ? (
            <Tooltip
              content={isFormValid ? "" : "Please fill all required fields"}
              placement="top"
              className={isFormValid ? "hidden" : ""}
            >
              <Button
                onClick={handleNextStep}
                variant="solid"
                className="justify-self-end min-w-40"
                disabled={!isFormValid}
              >
                Next <PiArrowRightBold className="ml-2" />
              </Button>
            </Tooltip>
          ) : (
            <Button type="submit" variant="solid" className="min-w-40">
              Submit <PiArrowRightBold className="ml-2" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PaymentSection;
