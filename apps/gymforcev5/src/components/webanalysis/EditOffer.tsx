"use client";
import { useState, useRef, useEffect } from "react";
import { Button, Drawer, Input, Select, Text, Textarea, Title } from "rizzui";
import { AxiosPrivate, invalidateAll, newID } from "../../app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { DatePicker } from "@core/ui/datepicker";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import { formateDateValue } from "../../app/[locale]/auth/DateFormat";
import { BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "../../app/[locale]/auth/DemographicInfo";

interface Package {
  label: string;
  value: number;
  min_price: number;
  max_price: number;
  num_of_days: number;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
  offer_startDate: string;
  offer_endDate: string;
  is_active: boolean;
  gym: number;
  package: any;
  offer_price: string; // Add this
}

interface FormDataType {
  title: string;
  description: string;
  image: File | null;
  offer_startDate: string;
  offer_endDate: string;
  preview: string | null;
  package_id: number;
  offer_price: string; // Add this
}

const emptyPackage: Package[] = [
  {
    label: "No Packages Found",
    value: 0,
    min_price: 0,
    max_price: 0,
    num_of_days: 0,
  },
];

const EditOffer = ({
  isOpen,
  setIsOpen,
  onSuccess,
  data,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSuccess: () => void;
  data: Offer;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [masterData, setMasterData] = useState<Package[]>([]);
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    image: null,
    offer_startDate: "",
    offer_endDate: "",
    preview: null,
    package_id: -1,
    offer_price: "", // Add this
  });
  const fetchMasterPack = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/list-packages/v2/?gym_id=${gymId}&type="all"`,
        {
          id: newID("master-packages-list-"),
        }
      );
      const packageData = resp.data.results.packages.map((item: any) => ({
        label: item.name,
        value: item.id,
        min_price: item.min_price,
        max_price: item.max_price,
        num_of_days: item.num_of_days,
      }));
      setMasterData(packageData);
    } catch (error) {
      console.error("Error fetching master packages:", error);
      toast.error("Something went wrong while fetching master packages");
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
    };
    getInfo();
    fetchMasterPack();
  }, []);

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title,
        description: data.description,
        image: null,
        offer_startDate: data.offer_startDate,
        offer_endDate: data.offer_endDate,
        preview: data.image,
        package_id: data?.package ?? -1,
        offer_price: data.offer_price,
      });
    }
  }, [data]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image: file,
        preview: previewUrl,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gymId = await retrieveGymId();
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      formDataToSend.append("offer_startDate", formData.offer_startDate);
      formDataToSend.append("offer_endDate", formData.offer_endDate);
      formDataToSend.append("package_id", formData.package_id.toString());
      formDataToSend.append("offer_price", formData.offer_price.toString()); // Add this

      await AxiosPrivate.patch(
        `/api/update-offer/${data.id}/?gym_id=${gymId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          id: newID("update-offer"),
        }
      );

      toast.success("Offer updated successfully");
      setIsOpen(false);
      invalidateAll();
      onSuccess();
    } catch (error) {
      toast.error("Failed to update offer");
      console.error("Error updating offer:", error);
    }
  };

  function renderOptionDisplayValue(option: Package) {
    return (
      <div className="grid gap-0.5">
        <Text fontWeight="semibold">{option.label}</Text>
        <div className="flex flex-row w-full gap-6">
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

  function renderEmpty(option: Package) {
    return (
      <div
        className="w-full flex flex-row gap-8 md:gap-16 items-center justify-between mx-4"
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
    <Drawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="lg"
      containerClassName="overflow-y-auto custom-scrollbar"
    >
      <div className="p-8">
        <Title as="h4" className="mb-6">
          Edit Offer
        </Title>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <Button type="button" onClick={handleImageClick} className="w-full">
              Change Image
            </Button>
            {formData.preview && (
              <div className="mt-4 flex justify-center">
                <img
                  src={formData.preview}
                  alt="Preview"
                  className="max-w-full h-[200px] object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          <Input
            label="Title"
            placeholder="Enter offer title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />

          <div className="grid grid-cols-[65%,auto] gap-4">
            <Select
              label="Package *"
              name="package_id"
              options={masterData.length ? masterData : emptyPackage}
              value={masterData.find(
                (pkg) => pkg.value === formData.package_id
              )}
              onChange={(option: Package | null) =>
                setFormData((prev) => ({
                  ...prev,
                  package_id: option?.value || -1,
                }))
              }
              getOptionDisplayValue={(option) =>
                masterData.length
                  ? renderOptionDisplayValue(option)
                  : renderEmpty(option)
              }
            />

            {formData.package_id !== -1 && (
              <Input
                type="number"
                label={`Price (${demographiInfo?.currency_symbol}
                  ${masterData.find((pkg) => pkg.value === formData.package_id)?.min_price}
                  -
                  ${
                    masterData.find((pkg) => pkg.value === formData.package_id)
                      ?.max_price
                  })`}
                placeholder="Enter offer price"
                value={formData.offer_price || ""}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    offer_price: e.target.value,
                  }));
                }}
                required
              />
            )}
          </div>

          <Textarea
            label="Description"
            placeholder="Enter offer description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            required
          />

          <div className="flex items-center justify-between">
            <div className="grid gap-1.5">
              <Text>Start Date</Text>
              <DatePicker
                label="Start Date"
                placeholder="Select start date"
                value={
                  formData.offer_startDate
                    ? formateDateValue(new Date(formData.offer_startDate))
                    : ""
                }
                onChange={(date: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    offer_startDate: formateDateValue(
                      new Date(date),
                      "YYYY-MM-DD"
                    ),
                  }))
                }
                selected={
                  formData.offer_startDate
                    ? new Date(formData.offer_startDate)
                    : null
                }
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Text>End Date</Text>
              <DatePicker
                placeholder="Select end date"
                value={
                  formData.offer_endDate
                    ? formateDateValue(new Date(formData.offer_endDate))
                    : ""
                }
                onChange={(date: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    offer_endDate: formateDateValue(
                      new Date(date),
                      "YYYY-MM-DD"
                    ),
                  }))
                }
                selected={
                  formData.offer_endDate
                    ? new Date(formData.offer_endDate)
                    : null
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Offer</Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default EditOffer;
