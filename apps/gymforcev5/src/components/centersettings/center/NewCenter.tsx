"use client";
import React, { useState, useEffect } from "react";
import { Title, Input, Button, Select, Tooltip, Modal } from "rizzui";
import { PhoneNumber } from "@core/ui/phone-input";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { XIcon } from "lucide-react";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";

interface FormData {
  name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  email: string;
  contact_no: string;
  website: string;
}

export default function NewCenter({ onUpdate }: { onUpdate: () => void }) {
  const search = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    email: "",
    contact_no: "",
    website: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const countryOptions = Object.keys(COUNTRY_MAPPINGS).map((country) => ({
    label: country,
    value: country,
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (selectedValue: string) => {
    setFormData((prev) => ({ ...prev, country: selectedValue }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contact_no: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await AxiosPrivate.post(`/api/create-gym/`, {
        ...formData,
        business_name: formData.name,
        country_code: COUNTRY_MAPPINGS[formData.country].code,
        std_code: COUNTRY_MAPPINGS[formData.country].std_code,
        currency: COUNTRY_MAPPINGS[formData.country].currency,
        currency_symbol: COUNTRY_MAPPINGS[formData.country].symbol,
      });
      setIsModalOpen(false);
      invalidateAll();
      setFormData({
        name: "",
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
        email: "",
        contact_no: "",
        website: "",
      });
      router.refresh();
      onUpdate();
      toast.success("Gym added successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong while creating gym: " + error);
    }
  };

  useEffect(() => {
    const requiredFields = ["name", "country", "contact_no"];
    const isValid = requiredFields.every(
      (field) => formData[field as keyof FormData] !== ""
    );
    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    const encodedGymName = search.get("gym_name");
    const gymName = encodedGymName ? decodeURIComponent(encodedGymName) : "";
    if (gymName) {
      setFormData((prev) => ({ ...prev, name: gymName }));
    }
  }, []);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>Add New Gym</Button>
      <Modal
        size="lg"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        containerClassName="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
      >
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Title as="h3" className="text-gray-900 dark:text-gray-200 ">
              Add New Gym Details
            </Title>
            <XIcon
              className="text-gray-500 hover:text-primary cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 items-center gap-4 lg:gap-6">
              <Input
                label="Gym Name *"
                name="name"
                placeholder="Enter Gym Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                labelClassName="dark:text-gray-200"
              />
              <Select
                label="Country *"
                value={formData.country}
                options={countryOptions}
                onChange={handleCountryChange}
                getOptionValue={(option) => option.value}
                className="w-full"
                labelClassName="dark:text-gray-200"
                dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
              <PhoneNumber
                label={`Gym Phone Number * ${!(formData.country.length > 0) ? "(Select the Country)" : ""}`}
                country={
                  formData.country.length > 0
                    ? COUNTRY_MAPPINGS[
                        formData.country
                      ].code.toLocaleLowerCase()
                    : ""
                }
                value={formData.contact_no}
                onChange={handlePhoneChange}
                disabled={!(formData.country.length > 0)}
                labelClassName="dark:text-gray-200"
              />
              <Input
                label="Gym Email"
                name="email"
                type="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleInputChange}
                labelClassName="dark:text-gray-200"
              />
              <Input
                label="Gym Website"
                name="website"
                placeholder="Enter Website"
                value={formData.website}
                onChange={handleInputChange}
                className="col-span-full"
                labelClassName="dark:text-gray-200"
              />
              <Input
                label="Address"
                name="street"
                placeholder="Enter the Address"
                value={formData.street}
                onChange={handleInputChange}
                labelClassName="dark:text-gray-200"
              />
              <Input
                label="ZIP / Postcode"
                name="zip_code"
                placeholder="Enter ZIP / Postcode"
                value={formData.zip_code}
                onChange={handleInputChange}
                labelClassName="dark:text-gray-200"
              />
            </div>
            <div className="mt-8 flex justify-end">
              <Tooltip
                content={isFormValid ? "" : "Please fill all required fields"}
                placement="top"
                className={isFormValid ? "hidden" : ""}
              >
                <Button
                  type="submit"
                  variant="solid"
                  className="min-w-40 dark:text-gray-200"
                  disabled={!isFormValid}
                >
                  Add New Gym
                </Button>
              </Tooltip>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
