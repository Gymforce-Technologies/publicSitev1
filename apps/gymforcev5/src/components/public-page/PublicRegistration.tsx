import { useEffect, useState } from "react";
import {
  Drawer,
  Input,
  RadioGroup,
  Radio,
  Select,
  Text,
  Textarea,
} from "rizzui";
import { DatePicker } from "@core/ui/datepicker";
import { PhoneNumber } from "@core/ui/phone-input";

interface RegistrationData {
  name: string;
  phone: string;
  email: string;
  gender: "male" | "female" | "other" | "";
  martial_status: "single" | "married" | "";
  date_of_birth: string;
  tentative_joining_date: string;
  package_id: number | null;
  offer_id: number | null;
  address_street: string;
  address_city: string;
  address_zip_code: string;
  address_state: string;
  address_country: string;
  enquiry_message: string;
  remarks: string;
  source_id: number;
}

export default function PublicRegistration({
  open,
  onClose,
  gymData,
}: {
  open: boolean;
  onClose: () => void;
  gymData: any;
}) {
  const [data, setData] = useState<RegistrationData>({
    name: "",
    phone: "",
    email: "",
    gender: "",
    martial_status: "",
    date_of_birth: "",
    tentative_joining_date: "",
    package_id: null,
    offer_id: null,
    address_street: "",
    address_city: "",
    address_zip_code: "",
    address_state: "",
    address_country: "India",
    enquiry_message: "",
    remarks: "",
    source_id: 6,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegistrationData, string>>
  >({});
  const [phoneCountry, setPhoneCountry] = useState("IN");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  useEffect(() => {
    if (gymData?.country_code) {
      setPhoneCountry(gymData?.country_code);
    }
  }, []);
  const packages = gymData?.listPackages.map((pkg: any) => ({
    label: `${pkg.name} (${gymData?.currency_symbol}${pkg.max_price}) - ${pkg.num_of_days} days`,
    value: pkg.id,
    ...pkg,
  }));

  // const offers =
  //   gymData?.listOffers?.map((offer: any) => ({
  //     label: `${offer.title} (${gymData?.currency_symbol}${offer.offer_price})`,
  //     value: offer.id,
  //     ...offer,
  //   })) || [];

  return (
    <Drawer
      isOpen={open}
      onClose={onClose}
      size="lg"
      containerClassName="overflow-y-auto custom-scrollbar"
    >
      <div className="p-6 md:p-8 ">
        <h2 className="text-2xl font-bold mb-6">Register at {gymData?.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Input
            name="name"
            label="Name *"
            placeholder="Enter Full Name"
            value={data.name}
            onChange={handleInputChange}
            error={errors.name}
          />

          <PhoneNumber
            label="Phone Number *"
            country={phoneCountry}
            value={data.phone}
            onChange={(value) => setData((prev) => ({ ...prev, phone: value }))}
            error={errors.phone}
          />

          <Input
            name="email"
            label="Email"
            placeholder="Enter Email"
            value={data.email}
            onChange={handleInputChange}
          />

          <div className="space-y-2">
            <Text className="font-medium">Gender *</Text>
            <RadioGroup
              value={data.gender}
              setValue={(value) =>
                //@ts-ignore
                setData((prev) => ({ ...prev, gender: value }))
              }
              className="flex gap-4"
            >
              <Radio label="Male" value="male" />
              <Radio label="Female" value="female" />
              <Radio label="Other" value="other" />
            </RadioGroup>
          </div>
          <div>
            <label className="block mb-2 font-medium">
              Expected Joining Date *
            </label>
            <DatePicker
              name="tentative_joining_date"
              value={data.tentative_joining_date}
              onChange={(date: any) =>
                setData((prev) => ({
                  ...prev,
                  tentative_joining_date: date.toISOString().split("T")[0],
                }))
              }
              minDate={new Date()}
              placeholderText="Select joining date"
            />
          </div>

          {/* <div>
            <label className="block mb-2 font-medium">Date of Birth</label>
            <DatePicker
              name="date_of_birth"
              value={data.date_of_birth}
              onChange={(date: any) =>
                setData((prev) => ({
                  ...prev,
                  date_of_birth: date?.toISOString().split("T")[0],
                }))
              }
              maxDate={new Date()}
              showYearDropdown
              showMonthDropdown
              placeholderText="Select date of birth"
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
          <div className="space-y-2">
            <Text className="font-medium">Marital Status</Text>
            <RadioGroup
              value={data.martial_status}
              setValue={(value) =>
                //@ts-ignore
                setData((prev) => ({ ...prev, martial_status: value }))
              }
              className="flex gap-4"
            >
              <Radio label="Single" value="single" />
              <Radio label="Married" value="married" />
            </RadioGroup>
          </div>

          {/* Address Information */}
          <Input
            name="address_street"
            label="Address"
            placeholder="Enter street address"
            value={data.address_street}
            onChange={handleInputChange}
            // className="col-span-full"
          />

          {/* <Input
            name="address_city"
            label="City"
            placeholder="Enter city"
            value={data.address_city}
            onChange={handleInputChange}
          />

          <Input
            name="address_state"
            label="State"
            placeholder="Enter state"
            value={data.address_state}
            onChange={handleInputChange}
          /> */}

          <Input
            name="address_zip_code"
            label="ZIP Code"
            placeholder="Enter ZIP code"
            value={data.address_zip_code}
            onChange={handleInputChange}
          />

          <Input
            name="address_country"
            label="Country"
            value={data.address_country}
            onChange={handleInputChange}
          />

          <Select
            label="Interested Package "
            options={packages}
            value={
              packages
                .find((pkg: any) => pkg.value === data.package_id)
                ?.label?.split("(")[0]
            }
            onChange={(option: any) => {
              setData((prev) => ({
                ...prev,
                package_id: option?.value || null,
              }));
            }}
            className={"col-span-full"}
          />
          {/* <Select
            label="Interested Offer"
            options={offers}
            value={
              offers
                .find((offer: any) => offer.value === data.offer_id)
                ?.split("(")[0]
            }
            onChange={(option: any) => {
              setData((prev) => ({
                ...prev,
                offer_id: option?.value || null,
              }));
            }}
            clearable
            onClear={() => {
              setData((prev) => ({ ...prev, offer_id: null }));
            }}
          /> */}

          <Textarea
            name="enquiry_message"
            label="Enquiry Message"
            placeholder="Enter your enquiry or questions"
            value={data.enquiry_message}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            onClick={() => {
              // Add validation and submission logic here
              console.log("Form data:", data);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Register
          </button>
        </div>
      </div>
    </Drawer>
  );
}
